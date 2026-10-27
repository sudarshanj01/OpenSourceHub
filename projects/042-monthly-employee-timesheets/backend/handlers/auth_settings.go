package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"opensheets-backend/database"
	"opensheets-backend/middleware"
	"opensheets-backend/models"

	"golang.org/x/crypto/bcrypt"
)

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ---------------- AUTH HANDLERS ----------------

func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	var user models.User
	var passwordHash string
	err := database.DB.QueryRow(`
		SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
		FROM users WHERE LOWER(email) = $1`, req.Email).
		Scan(&user.ID, &user.Name, &user.Email, &passwordHash, &user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if !user.IsActive {
		writeError(w, http.StatusForbidden, "Your account has been deactivated. Please contact your administrator.")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to generate session token")
		return
	}

	// Set httpOnly cookie for 7-day persistence
	http.SetCookie(w, &http.Cookie{
		Name:     "opensheets_token",
		Value:    token,
		Path:     "/",
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

func Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	var user models.User
	err := database.DB.QueryRow(`
		SELECT id, name, email, role, is_active, created_at, updated_at
		FROM users WHERE id = $1`, claims.UserID).
		Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		writeError(w, http.StatusNotFound, "User not found")
		return
	}

	// Fetch assigned projects
	rows, err := database.DB.Query(`
		SELECT p.id, p.name, p.client, p.code, p.color, p.billable, p.is_active
		FROM projects p
		INNER JOIN project_members pm ON p.id = pm.project_id
		WHERE pm.user_id = $1 AND p.is_active = true`, user.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var p models.Project
			if err := rows.Scan(&p.ID, &p.Name, &p.Client, &p.Code, &p.Color, &p.Billable, &p.IsActive); err == nil {
				user.Projects = append(user.Projects, p)
			}
		}
	}

	writeJSON(w, http.StatusOK, user)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "opensheets_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})
	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

// ---------------- SETTINGS HANDLERS ----------------

func GetSettings(w http.ResponseWriter, r *http.Request) {
	var s models.CompanySettings
	err := database.DB.QueryRow(`
		SELECT id, company_name, allowed_domain, work_days, daily_target_hours, created_at, updated_at
		FROM company_settings ORDER BY id ASC LIMIT 1`).
		Scan(&s.ID, &s.CompanyName, &s.AllowedDomain, &s.WorkDays, &s.DailyTargetHours, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		// Return default
		s = models.CompanySettings{
			CompanyName:      "OpenSheets Organization",
			AllowedDomain:    "",
			WorkDays:         "1,2,3,4,5",
			DailyTargetHours: 8.00,
		}
	}

	writeJSON(w, http.StatusOK, s)
}

func UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req models.CompanySettings
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.CompanyName = strings.TrimSpace(req.CompanyName)
	if req.CompanyName == "" {
		req.CompanyName = "OpenSheets Organization"
	}
	req.AllowedDomain = strings.TrimSpace(strings.ToLower(req.AllowedDomain))
	if req.DailyTargetHours <= 0 {
		req.DailyTargetHours = 8.0
	}
	if req.WorkDays == "" {
		req.WorkDays = "1,2,3,4,5"
	}

	var id int
	err := database.DB.QueryRow(`
		UPDATE company_settings
		SET company_name = $1, allowed_domain = $2, work_days = $3, daily_target_hours = $4, updated_at = NOW()
		WHERE id = (SELECT id FROM company_settings ORDER BY id ASC LIMIT 1)
		RETURNING id`, req.CompanyName, req.AllowedDomain, req.WorkDays, req.DailyTargetHours).Scan(&id)

	if err != nil {
		// insert if empty
		_ = database.DB.QueryRow(`
			INSERT INTO company_settings (company_name, allowed_domain, work_days, daily_target_hours)
			VALUES ($1, $2, $3, $4) RETURNING id`,
			req.CompanyName, req.AllowedDomain, req.WorkDays, req.DailyTargetHours).Scan(&id)
	}

	req.ID = id
	writeJSON(w, http.StatusOK, req)
}
