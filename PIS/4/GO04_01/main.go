package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
)

type Celebrity struct {
	ID           int    `json:"id"`
	FullName     string `json:"fullname"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var celebrities []Celebrity
var jsonFile = "celebrities.json"

func loadCelebrities() error {
	file, err := os.ReadFile(jsonFile)
	if err != nil {
		return err
	}
	return json.Unmarshal(file, &celebrities)
}

func saveCelebrities() error {
	data, err := json.MarshalIndent(celebrities, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(jsonFile, data, 0644)
}

func getAllCelebrities(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(celebrities)
}

func getCelebrity(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for _, celeb := range celebrities {
		if celeb.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(celeb)
			return
		}
	}
	http.Error(w, "Celebrity not found", http.StatusNotFound)
}

func createCelebrity(w http.ResponseWriter, r *http.Request) {
	var newCeleb Celebrity
	if err := json.NewDecoder(r.Body).Decode(&newCeleb); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, celeb := range celebrities {
		if celeb.ID == newCeleb.ID {
			http.Error(w, "ID already exists", http.StatusConflict)
			return
		}
	}

	celebrities = append(celebrities, newCeleb)
	saveCelebrities()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newCeleb)
}

func updateCelebrity(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var updatedCeleb Celebrity
	if err := json.NewDecoder(r.Body).Decode(&updatedCeleb); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for _, celeb := range celebrities {
		if celeb.ID == updatedCeleb.ID && celeb.ID != id {
			http.Error(w, "ID already exists", http.StatusBadRequest)
			return
		}
	}

	for i, celeb := range celebrities {
		if celeb.ID == id {
			celebrities[i] = updatedCeleb
			saveCelebrities()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updatedCeleb)
			return
		}
	}

	http.Error(w, "Celebrity not found", http.StatusNotFound)
}

func deleteCelebrity(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for i, celeb := range celebrities {
		if celeb.ID == id {
			celebrities = append(celebrities[:i], celebrities[i+1:]...)
			saveCelebrities()
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	http.Error(w, "Celebrity not found", http.StatusNotFound)
}

func main() {
	if err := loadCelebrities(); err != nil {
		log.Printf("Could not load celebrities: %v", err)
		celebrities = []Celebrity{}
	}

	router := mux.NewRouter()

	router.HandleFunc("/Celebrities/All", getAllCelebrities).Methods("GET")
	router.HandleFunc("/Celebrities/{id}", getCelebrity).Methods("GET")
	router.HandleFunc("/Celebrities", createCelebrity).Methods("POST")
	router.HandleFunc("/Celebrities/{id}", updateCelebrity).Methods("PUT")
	router.HandleFunc("/Celebrities/{id}", deleteCelebrity).Methods("DELETE")

	log.Println("Server started on port 3000")
	log.Fatal(http.ListenAndServe(":3000", router))
}
