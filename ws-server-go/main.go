package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var workpaceDir = flag.String("dir", "/", "workspace root directory")
var port = flag.Int("port", 8080, "server port")

func main() {
	flag.Parse()

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", WSHandler)

	addr := fmt.Sprintf(":%d", *port)
	log.Printf("debug: server listening on port %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
