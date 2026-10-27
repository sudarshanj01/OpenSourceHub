package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"opensheets-backend/database"
	"opensheets-backend/handlers"
	"opensheets-backend/middleware"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	log.Println("Starting OpenSheets Backend Server...")

	// Initialize Database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Fatal: Database initialization failed: %v", err)
	}
	defer db.Close()

	r := chi.NewRouter()

	// Base middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link", "Content-Disposition"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","app":"OpenSheets","version":"1.0.0"}`))
	})

	// Public Routes
	r.Group(func(r chi.Router) {
		r.Post("/api/auth/login", handlers.Login)
		r.Post("/api/auth/logout", handlers.Logout)
		r.Get("/api/settings", handlers.GetSettings)
	})

	// Authenticated Routes (Employee & Admin)
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Get("/api/auth/me", handlers.Me)
		r.Get("/api/projects", handlers.GetProjects)
		r.Get("/api/timesheets", handlers.GetTimesheets)
		r.Post("/api/timesheets", handlers.CreateTimeEntry)
		r.Put("/api/timesheets/{id}", handlers.UpdateTimeEntry)
		r.Delete("/api/timesheets/{id}", handlers.DeleteTimeEntry)
		r.Get("/api/dashboard/stats", handlers.GetDashboardStats)
		r.Get("/api/reports/export", handlers.ExportCSV)

		// Admin-Only Routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AdminOnlyMiddleware)

			// Settings
			r.Put("/api/settings", handlers.UpdateSettings)

			// Projects management
			r.Post("/api/projects", handlers.CreateProject)
			r.Put("/api/projects/{id}", handlers.UpdateProject)
			r.Delete("/api/projects/{id}", handlers.DeleteProject)

			// Team & User management
			r.Get("/api/users", handlers.GetUsers)
			r.Post("/api/users", handlers.CreateUser)
			r.Put("/api/users/{id}", handlers.UpdateUser)
			r.Delete("/api/users/{id}", handlers.DeleteUser)
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("OpenSheets Backend listening on port %s", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
