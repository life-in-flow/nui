package connection

import (
	"errors"
	"strings"
	"sync"
)

type Conn interface {
	Close()
}

type Pool[T Conn] interface {
	Get(id string) (T, error)
	Refresh(id string) error
	Purge()
}

type ConnPool[T Conn] struct {
	m     sync.Mutex
	conns map[string]T
	repo  ConnRepo
	build func(connection *Connection) (T, error)
}

func NewConnPool[T Conn](repo ConnRepo, builder func(connection *Connection) (T, error)) *ConnPool[T] {
	return &ConnPool[T]{
		conns: make(map[string]T),
		repo:  repo,
		build: builder,
	}
}

func NewNatsConnPool(repo ConnRepo) *ConnPool[*NatsConn] {
	return NewConnPool[*NatsConn](repo, natsBuilder)
}

func (p *ConnPool[T]) Get(id string) (T, error) {
	p.m.Lock()
	defer p.m.Unlock()
	if t, ok := p.conns[id]; !ok {
		err := p.refresh(id)
		if err != nil {
			return t, err
		}
	}
	c, ok := p.conns[id]
	if ok {
		return c, nil
	}
	return c, errors.New("cannot find connection in pool")
}

func (p *ConnPool[T]) Refresh(id string) error {
	p.m.Lock()
	defer p.m.Unlock()
	return p.refresh(id)
}

func (p *ConnPool[T]) Purge() {
	for k, c := range p.conns {
		if _, err := p.repo.GetById(k); err != nil {
			c.Close()
			delete(p.conns, k)
		}
	}
}

func (p *ConnPool[T]) refresh(id string) error {
	c, err := p.repo.GetById(id)
	if err != nil {
		return err
	}
	if currentConn, ok := p.conns[id]; ok {
		currentConn.Close()
	}
	conn, err := p.build(c)
	if err != nil {
		return err
	}
	p.conns[id] = conn
	return nil
}

func natsBuilder(connection *Connection) (*NatsConn, error) {
	return NewNatsConn(strings.Join(connection.Hosts, ", "))
}
