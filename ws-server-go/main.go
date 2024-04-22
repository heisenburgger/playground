package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

const BASE_DIR = "/home/kb/repos/kicks-react-template/"

type DirEntry struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

func readPTY(conn *websocket.Conn, tty *os.File) {
	buf := make([]byte, 1024)
	for {
		n, err := tty.Read(buf)
		if err != nil {
			log.Println("error: reading from tty:", err)
			return
		}
		if n > 0 {
			msg := struct {
				Name string `json:"name"`
				Data string `json:"data"`
			}{
				Name: "TERMINAL_OUTPUT",
				Data: string(buf[:n]),
			}
			data, err := json.Marshal(msg)
			if err != nil {
				log.Println("error: marshalling TERMINAL_OUTPUT msg:", err)
				return
			}
			conn.WriteMessage(websocket.TextMessage, data)
		}
	}
}

func readConn(conn *websocket.Conn, tty *os.File) {
	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			log.Println("error: reading socket message:", err)
			return
		}

		var event map[string]string

		err = json.Unmarshal(data, &event)
		if err != nil {
			log.Println("error: parsing socket message as json:", err)
			return
		}

		eventName := event["name"]
		switch eventName {
		case "GET_DIR_LISTINGS":
			fullPath := path.Join(BASE_DIR, event["path"])
			entries, err := os.ReadDir(fullPath)
			if err != nil {
				log.Println("error: reading directory:", err)
				return
			}
			path, _ := filepath.Abs(fullPath)

			dirListingsMsg := struct {
				Name  string      `json:"name"`
				Files []*DirEntry `json:"files"`
				Path  string      `json:"path"`
			}{
				Name:  "DIR_LISTINGS",
				Path:  event["path"],
				Files: make([]*DirEntry, 0),
			}
			for _, entry := range entries {
				d := DirEntry{
					Name: strings.Replace(filepath.Join(path, entry.Name()), BASE_DIR, "", 1),
					Type: "file",
				}
				if entry.IsDir() {
					d.Type = "dir"
				}
				dirListingsMsg.Files = append(dirListingsMsg.Files, &d)
			}

			msg, err := json.Marshal(dirListingsMsg)
			if err != nil {
				log.Println("error: marshalling files:", err)
				return
			}

			conn.WriteMessage(websocket.TextMessage, msg)
		case "GET_FILE_CONTENT":
			filename := path.Join(BASE_DIR, event["filename"])
			data, err := os.ReadFile(filename)
			if err != nil {
				log.Println("error: reading file:", err)
				return
			}
			fileContentMsg := struct {
				Name     string `json:"name"`
				Content  string `json:"content"`
				Filename string `json:"filename"`
			}{
				Name:     "FILE_CONTENT",
				Content:  string(data),
				Filename: filename,
			}
			msg, err := json.Marshal(fileContentMsg)
			if err != nil {
				log.Println("error: marshalling FILE_CONTENT msg:", err)
				return
			}
			conn.WriteMessage(websocket.TextMessage, msg)
		case "TERMINAL_INPUT":
			_, err := tty.Write([]byte(event["data"]))
			if err != nil {
				log.Println("error: writing to tty:", err)
			}
		}
	}
}

func main() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		upgrader := websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("error: upgrading socket connection:", err)
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"error": "failed to upgrade to ws connection"}`))
			return
		}
		cmd := exec.Command("/bin/bash")
		tty, err := pty.Start(cmd)
		if err != nil {
			log.Println("error: creating tty:", err)
			return
		}
		go readConn(conn, tty)
		go readPTY(conn, tty)
	})

	// TODO: configure this port
	fmt.Println("debug: ws server listening on port 8080")
	http.ListenAndServe(":8080", nil)
}
