package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected")

	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Client disconnected")
			log.Println("Read error:", err)
			break
		}

		log.Println("Received:", string(msg))

		response := "from server: " + string(msg)

		err = conn.WriteMessage(messageType, []byte(response))
		if err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)

	log.Println("WebSocket server started on :3000/ws")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
