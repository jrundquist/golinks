package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

type Link struct {
	Alias       string
	URL         string
	CreatedTime time.Time
	NumVisits   int
}

var staticDir = "/app/build/"

func (link *Link) UpdateUsageCount() error {
	_, err := db.Exec("UPDATE links SET num_visits = num_visits + 1 WHERE alias = ?", link.Alias)
	return err
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite3", "/data/links_v0.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS links (
		alias TEXT PRIMARY KEY NOT NULL,
		url TEXT,
		created_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		num_visits INTEGER DEFAULT 0 NOT NULL
	);`)
	if err != nil {
		panic(err)
	}

	router := mux.NewRouter()

	router.HandleFunc("/_api_/new", createLinkHandler).Methods("POST")

	// Serve static files first if they are present
	staticFilesystem := http.Dir(staticDir)
	fileServer := http.FileServer(staticFilesystem)

	// define a handler that serves static files, and falls through to the next handler if the file is not found
	staticHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// if the file is not found, fall through to the next handler
		if _, err := os.Stat(staticDir + r.URL.Path); os.IsNotExist(err) {
			log.Println("File not found, falling through to next handler")
			handleLink(w, r)
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	router.PathPrefix("/").Handler(staticHandler)

	// use the custom NotFoundHandler that falls through to the next handler in the chain
	router.NotFoundHandler = http.HandlerFunc(handleLink)

	// CORS middleware
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	log.Println("Starting server on port 8080")
	http.ListenAndServe(":8080", handlers.CORS(headers, methods, origins)(router))
}

func createLinkHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse form data
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	// Get alias and url values from form data
	alias := r.FormValue("alias")
	url := r.FormValue("url")

	// Insert new link into database
	stmt, err := db.Prepare("INSERT INTO links(alias, url) values(?, ?)")
	if err != nil {
		http.Error(w, "Error preparing database statement", http.StatusInternalServerError)
		return
	}

	_, err = stmt.Exec(alias, url)
	if err != nil {
		http.Error(w, fmt.Sprintf("error inserting link into database - : %v", err), http.StatusInternalServerError)
		return
	}

	// Send 200 OK response
	w.WriteHeader(http.StatusOK)
}

func handleLink(w http.ResponseWriter, r *http.Request) {
	// split the path based on the pattern "/{alias}/{rest:.*}"
	parts := strings.Split(r.URL.Path, "/")

	// the first part is an empty string, so ignore it
	alias := parts[1]

	var rest string
	if len(parts) > 2 {
		rest = parts[2]
	}

	log.Printf("Looking for %s", alias)
	link, err := findLink(alias)
	if err != nil {
		log.Printf("Err for %v", err)

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if link == nil {
		log.Printf("Not found Serving index for %q", alias)
		http.ServeFile(w, r, path.Join(staticDir, "index.html"))
		return
	}

	url := link.URL

	if rest != "" {
		url += "/" + rest
	}

	http.Redirect(w, r, url, http.StatusFound)

	link.UpdateUsageCount()
}

func findLink(alias string) (*Link, error) {
	row := db.QueryRow("SELECT alias, url, num_visits FROM links WHERE alias = ?", alias)

	var link Link
	err := row.Scan(&link.Alias, &link.URL, &link.NumVisits)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &link, nil
}
