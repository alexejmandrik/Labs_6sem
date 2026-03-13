package main

import (
	P03_02 "GO03_02/package"
	"log"
	"net/http"
	"sync"
)

var stats = &P03_02.Stats{
	Mu: sync.Mutex{},
}

func handlerS(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		stats.PlusGet()
	} else if r.Method == http.MethodPost {
		stats.PlusPost()
	}

	log.Printf("Method: %s Path: %s\n", r.Method, r.URL.Path)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func handlerG(w http.ResponseWriter, r *http.Request) {
	result := stats.GenStr()

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(result))
}

func main() {
	http.HandleFunc("/S", handlerS)
	http.HandleFunc("/G", handlerG)

	log.Println("Server started on port 3000")

	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
