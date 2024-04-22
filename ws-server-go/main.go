package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const BASE_DIR = "/home/kb/repos/kicks-react-template/"

func readPTY(conn *websocket.Conn, tty *os.File) {
	buf := make([]byte, 1024)
	for {
		n, err := tty.Read(buf)
		if err != nil {
			log.Println("error: reading from tty:", err)
			return
		}
		if n > 0 {
			event := TerminalOutputEvent{
				Event: Event{
					Name: "TERMINAL_OUTPUT",
				},
				Data: string(buf[:n]),
			}
			msg, err := json.Marshal(event)
			if err != nil {
				log.Println("error: marshalling TERMINAL_OUTPUT event:", err)
				return
			}
			conn.WriteMessage(websocket.TextMessage, msg)
		}
	}
}

func readConn(conn *websocket.Conn, tty *os.File) {
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("error: reading socket message:", err)
			return
		}

		var event map[string]string
		err = json.Unmarshal(msg, &event)
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

			dirListingsEvent := DirListingsEvent{
				Event: Event{
					Name: "DIR_LISTINGS",
				},
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
				dirListingsEvent.Files = append(dirListingsEvent.Files, &d)
			}

			msg, err := json.Marshal(dirListingsEvent)
			if err != nil {
				log.Println("error: marshalling DIR_LISTINGS msg:", err)
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

			fileContentEvent := FileContentEvent{
				Event: Event{
					Name: "FILE_CONTENT",
				},
				Content:  string(data),
				Filename: filename,
			}

			msg, err := json.Marshal(fileContentEvent)
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
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", WSHandler)

	// TODO: configure this port
	log.Println("debug: ws server listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
