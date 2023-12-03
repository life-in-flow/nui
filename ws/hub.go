package ws

import (
	"context"
	"errors"
	"github.com/mitchellh/mapstructure"
	"github.com/nats-io/nats.go"
	"github.com/pricelessrabbit/nui/connection"
	"github.com/pricelessrabbit/nui/pkg/channels"
)

type Pool[S Subscription, T Conn[S]] interface {
	Get(id string) (T, error)
}

type Subscription interface {
	Unsubscribe() error
}

type Conn[S Subscription] interface {
	ChanSubscribe(subj string, ch chan *nats.Msg) (S, error)
	ObserveConnectionEvents(ctx context.Context) <-chan connection.ConnStatusChanged
}

type IHub interface {
	Register(ctx context.Context, clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error
}

type Hub[S Subscription, T Conn[S]] struct {
	pool Pool[S, T]
	reg  map[string]*ClientConn[S]
}

func NewHub[S Subscription, T Conn[S]](pool Pool[S, T]) *Hub[S, T] {
	return &Hub[S, T]{
		pool: pool,
		reg:  make(map[string]*ClientConn[S]),
	}
}

func NewNatsHub(pool Pool[*nats.Subscription, *connection.NatsConn]) *Hub[*nats.Subscription, *connection.NatsConn] {
	return NewHub[*nats.Subscription, *connection.NatsConn](pool)
}

func (h *Hub[S, T]) Register(ctx context.Context, clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error {
	h.purgeConnection(clientId)
	err := h.registerConnection(clientId, connectionId, req, messages)
	if err != nil {
		return err
	}
	go func() { _ = h.HandleConnectionEvents(ctx, clientId, messages) }()
	go func() { _ = h.HandleRequests(ctx, clientId, req, messages) }()
	return nil
}

func (h *Hub[S, T]) HandleRequests(ctx context.Context, clientId string, req <-chan *Request, messages chan<- Payload) error {
	for {
		select {
		case <-ctx.Done():
			h.purgeConnection(clientId)
			return nil
		case r, ok := <-req:
			if !ok {
				h.purgeConnection(clientId)
				return nil
			}
			err := h.handleRequestsByType(ctx, clientId, r, messages)
			if err != nil {
				messages = sendErr(messages, err)
			}
		}
	}
}

func (h *Hub[S, T]) handleRequestsByType(ctx context.Context, clientId string, r *Request, messages chan<- Payload) error {
	switch r.Type {
	case subReqType:
		subReq := &SubsReq{}
		return decodeAndHandleRequest(ctx, clientId, subReq, r.Payload, h.HandleSubRequest, messages)
	}
	return errors.New("unknown request type")
}

type reqHandler[T any] func(ctx context.Context, clientId string, req *T, messages chan<- Payload)

func decodeAndHandleRequest[T any](ctx context.Context, clientId string, req *T, payload any, handler reqHandler[T], messages chan<- Payload) error {
	err := mapstructure.Decode(payload, req)
	if err != nil {
		return err
	}
	handler(ctx, clientId, req, messages)
	return nil
}

func sendErr(messages chan<- Payload, err error) chan<- Payload {
	select {
	case messages <- Error{Error: err.Error()}:
	default:
	}
	return messages
}

func (h *Hub[S, T]) HandleSubRequest(_ context.Context, clientId string, subReq *SubsReq, messages chan<- Payload) {
	h.purgeSubscriptions(clientId)
	err := h.registerSubscriptions(clientId, subReq)
	if err != nil {
		select {
		case messages <- Error{Error: err.Error()}:
		default:
		}
	}
}

func (h *Hub[S, T]) purgeConnection(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
	delete(h.reg, clientId)
}

func (h *Hub[S, T]) purgeSubscriptions(clientId string) {
	currentConn, ok := h.reg[clientId]
	if ok {
		h.purgeClientSubscriptions(currentConn)
	}
}

func (h *Hub[S, T]) purgeClientSubscriptions(clientConn *ClientConn[S]) {
	clientConn.UnsubscribeAll()
}

func (h *Hub[S, T]) registerConnection(clientId, connectionId string, req <-chan *Request, messages chan<- Payload) error {
	_, err := h.pool.Get(connectionId)
	if err != nil {
		return err
	}
	h.reg[clientId] = NewWClientConn[S](connectionId, req, messages)
	return nil
}

func (h *Hub[S, T]) registerSubscriptions(clientId string, req *SubsReq) error {
	clientConn, ok := h.reg[clientId]
	if !ok {
		return errors.New("no client connection found")
	}
	serverConn, err := h.pool.Get(clientConn.ConnectionId)
	if err != nil {
		return err
	}
	chans := make([]<-chan *nats.Msg, 0)
	for _, sbj := range req.Subjects {
		s := NewClientSub[S](sbj)
		sub, err := serverConn.ChanSubscribe(sbj, s.Messages)
		if err != nil {
			return err
		}
		s.Sub = sub
		chans = append(chans, s.Messages)
		clientConn.AddSubscription(s)
	}
	go parseToClientMessage(channels.FanIn(10, chans...), clientConn.Messages)
	return nil
}

func (h *Hub[S, T]) HandleConnectionEvents(ctx context.Context, clientId string, clientMgs chan<- Payload) error {
	clientConn, ok := h.reg[clientId]
	if !ok {
		return errors.New("no client connection found")
	}
	serverConn, err := h.pool.Get(clientConn.ConnectionId)
	if err != nil {
		return err
	}
	events := serverConn.ObserveConnectionEvents(ctx)
	for {
		select {
		case msg, ok := <-events:
			if !ok {
				return nil
			}
			cm := &ConnectionStatus{
				Status: msg.Status,
			}
			clientMgs <- cm
		}
	}
}

func parseToClientMessage(natsMsg <-chan *nats.Msg, clientMgs chan<- Payload) {
	for {
		select {
		case msg, ok := <-natsMsg:
			if !ok {
				return
			}
			cm := &NatsMsg{
				Subject: msg.Subject,
				Payload: msg.Data,
			}
			clientMgs <- cm
		}
	}
}
