package main

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	url := "ws://localhost:3000/ws"

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		log.Fatal("Dial error:", err)
	}
	defer conn.Close()

	log.Println("Connected to server")

	for i := 1; i <= 5; i++ {
		msg := "message " + time.Now().Format("15:04:05")

		err := conn.WriteMessage(websocket.TextMessage, []byte(msg))
		if err != nil {
			log.Println("Write error:", err)
			return
		}

		log.Println("Sent:", msg)

		_, resp, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			return
		}

		log.Println("Received:", string(resp))

		time.Sleep(1 * time.Second)
	}

	log.Println("Client finished")
}
