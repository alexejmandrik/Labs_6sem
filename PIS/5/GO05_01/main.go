package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	_ "github.com/denisenkom/go-mssqldb"
	"github.com/gorilla/mux"
)

type Celebrity struct {
	ID           int    `json:"id"`
	FullName     string `json:"fullname"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var db *sql.DB

func initDB() {
	var err error

	connString := "server=localhost;user id=pis_user;password=1234;database=PIS"
	db, err = sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("DB connection error:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("DB ping error:", err)
	}

	log.Println("Connected to SQL Server")
}

func getAllCelebrities(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT Id, FullName, Nationality, ReqPhotoPath FROM Celebrities")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var result []Celebrity

	for rows.Next() {
		var c Celebrity
		err := rows.Scan(&c.ID, &c.FullName, &c.Nationality, &c.ReqPhotoPath)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		result = append(result, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func getCelebrity(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	var c Celebrity
	err := db.QueryRow(
		"SELECT Id, FullName, Nationality, ReqPhotoPath FROM Celebrities WHERE Id=@p1",
		id,
	).Scan(&c.ID, &c.FullName, &c.Nationality, &c.ReqPhotoPath)

	if err == sql.ErrNoRows {
		http.Error(w, "Celebrity not found", 404)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}

func createCelebrity(w http.ResponseWriter, r *http.Request) {
	var c Celebrity

	err := json.NewDecoder(r.Body).Decode(&c)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	_, err = db.Exec(
		"INSERT INTO Celebrities (Id, FullName, Nationality, ReqPhotoPath) VALUES (@p1,@p2,@p3,@p4)",
		c.ID, c.FullName, c.Nationality, c.ReqPhotoPath,
	)

	if err != nil {
		http.Error(w, "ID already exists or DB error", 409)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

func updateCelebrity(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	var updatedCeleb Celebrity
	if err := json.NewDecoder(r.Body).Decode(&updatedCeleb); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if updatedCeleb.ID != id {
		var exists int
		err := db.QueryRow("SELECT COUNT(1) FROM Celebrities WHERE Id=@p1", updatedCeleb.ID).Scan(&exists)
		if err != nil {
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}
		if exists > 0 {
			http.Error(w, "ID already exists", http.StatusConflict)
			return
		}
	}

	res, err := db.Exec(
		"UPDATE Celebrities SET Id=@p1, FullName=@p2, Nationality=@p3, ReqPhotoPath=@p4 WHERE Id=@p5",
		updatedCeleb.ID, updatedCeleb.FullName, updatedCeleb.Nationality, updatedCeleb.ReqPhotoPath, id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedCeleb)
}

func deleteCelebrity(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	res, err := db.Exec("DELETE FROM Celebrities WHERE Id=@p1", id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Celebrity not found", 404)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func main() {
	initDB()

	router := mux.NewRouter()

	router.HandleFunc("/Celebrities/All", getAllCelebrities).Methods("GET")
	router.HandleFunc("/Celebrities/{id}", getCelebrity).Methods("GET")
	router.HandleFunc("/Celebrities", createCelebrity).Methods("POST")
	router.HandleFunc("/Celebrities/{id}", updateCelebrity).Methods("PUT")
	router.HandleFunc("/Celebrities/{id}", deleteCelebrity).Methods("DELETE")

	log.Println("Server started on port 3000")
	log.Fatal(http.ListenAndServe(":3000", router))
}
