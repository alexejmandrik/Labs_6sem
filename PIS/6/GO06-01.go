package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
)

type Celebrity struct {
	ID           int    `json:"id" gorm:"primaryKey;autoIncrement"`
	FullName     string `json:"fullname"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var db *gorm.DB

// ---------------- DB INIT ----------------
func initDB() {
	dsn := "sqlserver://pis_user:1234@localhost:1433?database=PIS&encrypt=disable&trustservercertificate=true"

	var err error
	db, err = gorm.Open(sqlserver.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("DB connection error:", err)
	}

	// 🔥 САМО СОЗДАЁТ ТАБЛИЦУ
	err = db.AutoMigrate(&Celebrity{})
	if err != nil {
		log.Fatal("AutoMigrate error:", err)
	}

	log.Println("Connected to SQL Server + AutoMigrate OK")
}

// ---------------- GET ALL ----------------
func getAllCelebrities(w http.ResponseWriter, r *http.Request) {
	var celebrities []Celebrity

	if err := db.Find(&celebrities).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(celebrities)
}

// ---------------- GET BY ID ----------------
func getCelebrity(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	var c Celebrity
	if err := db.First(&c, id).Error; err != nil {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(c)
}

// ---------------- POST ----------------
func createCelebrity(w http.ResponseWriter, r *http.Request) {
	var c Celebrity

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// ID не должен дублироваться
	var existing Celebrity
	if err := db.First(&existing, c.ID).Error; err == nil {
		http.Error(w, "ID already exists", http.StatusConflict)
		return
	}

	if err := db.Create(&c).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(c)
}

// ---------------- PUT (FIXED) ----------------
func updateCelebrity(w http.ResponseWriter, r *http.Request) {
	paramID, _ := strconv.Atoi(mux.Vars(r)["id"])

	var updated Celebrity

	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var current Celebrity
	if err := db.First(&current, paramID).Error; err != nil {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	// ❗ нельзя занять чужой ID
	if updated.ID != paramID {
		var conflict Celebrity
		if err := db.First(&conflict, updated.ID).Error; err == nil {
			http.Error(w, "ID already exists", http.StatusConflict)
			return
		}
	}

	current.ID = updated.ID
	current.FullName = updated.FullName
	current.Nationality = updated.Nationality
	current.ReqPhotoPath = updated.ReqPhotoPath

	if err := db.Save(&current).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(current)
}

// ---------------- DELETE ----------------
func deleteCelebrity(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	if err := db.Delete(&Celebrity{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---------------- MAIN ----------------
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
