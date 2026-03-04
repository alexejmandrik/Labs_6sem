package main

import (
	"fmt"
	"net/http"
)

var A01 = 3

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintln(w, "405 - Method Not Allowed")
		return
	}
	fmt.Fprintf(w, "A01 = %d\n", A01)
	fmt.Fprintf(w, "A02 = %t\n", A02)
	fmt.Fprintf(w, "A03 = %s\n", lib.A03)
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server started at http://localhost:4000")
	http.ListenAndServe(":4000", nil)
}
