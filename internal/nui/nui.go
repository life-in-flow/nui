package nui

import (
	"github.com/nats-nui/nui/internal/connection"
	"github.com/nats-nui/nui/internal/ws"
	"github.com/nats-nui/nui/pkg/logging"
	docstore "github.com/nats-nui/nui/pkg/storage"
)

type Nui struct {
	ConnRepo connection.ConnRepo
	ConnPool connection.Pool[*connection.NatsConn]
	Hub      ws.IHub
	l        logging.Slogger
}

func (n *Nui) createDefault(defaultHost string) {
	cm, err := n.ConnRepo.All()
	if err != nil {
		n.l.Error("Unable to load connection list", "error", err)
		return
	}
	for _, c := range cm {
		if c.Name == "default" {
			n.l.Info("Default connection already exists")
			return
		}
	}
	n.l.Info("Creating default connection", "host", defaultHost)
	_, err = n.ConnRepo.Save(&connection.Connection{
		Name:  "default",
		Hosts: []string{defaultHost},
	})
	if err != nil {
		n.l.Error("Default connection create failed", "error", err)
	}
}

func Setup(dbPath string, logger logging.Slogger, defaultHost string, tlsDir string) (*Nui, error) {
	n := &Nui{}
	store, err := docstore.NewDocStore(dbPath)
	if err != nil {
		return nil, err
	}
	n.l = logger
	n.ConnRepo = connection.NewDocStoreConnRepo(store)
	if defaultHost != "" {
		n.createDefault(defaultHost)
	}
	n.ConnPool = connection.NewNatsConnPool(n.ConnRepo, tlsDir)
	n.Hub = ws.NewNatsHub(n.ConnPool, logger)
	return n, nil
}
