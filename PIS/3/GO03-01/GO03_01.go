package main

import (
	"log"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Method: %s, Path: %s\n", r.Method, r.URL.Path)
}

func main() {

	http.HandleFunc("/A", handler)
	http.HandleFunc("/A/B", handler)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete:
			log.Printf("Method: %s, Path: %s\n", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Server started on port 3000")

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
