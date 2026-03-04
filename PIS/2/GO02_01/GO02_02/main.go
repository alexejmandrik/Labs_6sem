package main

import (
	"fmt"
	"net/http"
)

var A01 = 3

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "A01 = %d\n", A01)
	fmt.Fprintf(w, "A02 = %t\n", A02)
	fmt.Fprintf(w, "A03 = %s\n", go02_02lib.A03)
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server started at http://localhost:4000")
	http.ListenAndServe(":4000", nil)
}
