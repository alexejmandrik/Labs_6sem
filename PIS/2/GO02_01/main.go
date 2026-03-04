package main

import (
	"fmt"
	"net/http"
	"project/lib"
)

const C01 = 3.14

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintln(w, "405 - Method Not Allowed")
		return
	}
	fmt.Fprintf(w, "C01 = %.2f\n", C01)
	fmt.Fprintf(w, "C02 = %e\n", C02)
	fmt.Fprintf(w, "C03 = %.6f\n", lib.C03)
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server started at http://localhost:3000")
	http.ListenAndServe(":3000", nil)
}
