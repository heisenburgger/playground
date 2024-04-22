package main

import (
	"log"
	"net/http"
	"os/exec"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

func WSHandler(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			// TODO: only allow specific origins
			return true
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("error: upgrading socket connection:", err)
		w.WriteHeader(400)
		return
	}

	// NOTE: cross-platform goes brrr
	cmd := exec.Command("/bin/bash")
	tty, err := pty.Start(cmd)
	if err != nil {
		log.Println("error: creating tty:", err)
		return
	}

	go readConn(conn, tty)
	go readPTY(conn, tty)
}
