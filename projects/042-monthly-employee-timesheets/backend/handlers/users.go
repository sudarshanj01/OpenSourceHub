package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"opensheets-backend/database"
	"opensheets-backend/middleware"
	"opensheets-backend/models"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(`
		SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.updated_at,
		       COALESCE(SUM(te.duration_minutes), 0) as total_minutes
		FROM users u
		LEFT JOIN time_entries te ON u.id = te.user_id
		GROUP BY u.id
		ORDER BY u.id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}
	defer rows.Close()

	type UserWithStats struct {
		models.User
		TotalHoursLogged float64 `json:"total_hours_logged"`
		AssignedUserIDs  []int   `json:"assigned_project_ids"`
	}

	var users []UserWithStats
	for rows.Next() {
		var u UserWithStats
		var totalMinutes int
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt, &totalMinutes); err == nil {
			u.TotalHoursLogged = float64(totalMinutes) / 60.0
			u.AssignedUserIDs = []int{}
			users = append(users, u)
		}
	}

	// Fetch project memberships for each user
	for i := range users {
		pRows, err := database.DB.Query(`SELECT project_id FROM project_members WHERE user_id = $1`, users[i].ID)
		if err == nil {
			for pRows.Next() {
				var pid int
				if err := pRows.Scan(&pid); err == nil {
					users[i].AssignedUserIDs = append(users[i].AssignedUserIDs, pid)
				}
			}
			pRows.Close()
		}
	}

	writeJSON(w, http.StatusOK, users)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "Name, email, and password are required")
		return
	}

	if req.Role == "" {
		req.Role = models.RoleEmployee
	}

	// Check domain restriction if set in company settings
	var allowedDomain string
	_ = database.DB.QueryRow(`SELECT allowed_domain FROM company_settings ORDER BY id ASC LIMIT 1`).Scan(&allowedDomain)
	allowedDomain = strings.TrimSpace(strings.ToLower(allowedDomain))
	if allowedDomain != "" {
		parts := strings.Split(req.Email, "@")
		if len(parts) != 2 || parts[1] != allowedDomain {
			writeError(w, http.StatusBadRequest, "Email must be under company domain: @"+allowedDomain)
			return
		}
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	var newID int
	err = database.DB.QueryRow(`
		INSERT INTO users (name, email, password_hash, role, is_active)
		VALUES ($1, $2, $3, $4, true)
		RETURNING id`, req.Name, req.Email, string(hash), req.Role).Scan(&newID)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique") {
			writeError(w, http.StatusConflict, "A user with this email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "Failed to create user: "+err.Error())
		return
	}

	// Assign projects
	for _, pid := range req.ProjectIDs {
		_, _ = database.DB.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, pid, newID)
	}

	user := models.User{
		ID:       newID,
		Name:     req.Name,
		Email:    req.Email,
		Role:     req.Role,
		IsActive: true,
	}

	writeJSON(w, http.StatusCreated, user)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.Name == "" || req.Email == "" {
		writeError(w, http.StatusBadRequest, "Name and email are required")
		return
	}

	// Check domain restriction if set
	var allowedDomain string
	_ = database.DB.QueryRow(`SELECT allowed_domain FROM company_settings ORDER BY id ASC LIMIT 1`).Scan(&allowedDomain)
	allowedDomain = strings.TrimSpace(strings.ToLower(allowedDomain))
	if allowedDomain != "" {
		parts := strings.Split(req.Email, "@")
		if len(parts) != 2 || parts[1] != allowedDomain {
			writeError(w, http.StatusBadRequest, "Email must be under company domain: @"+allowedDomain)
			return
		}
	}

	if req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err == nil {
			_, err = database.DB.Exec(`
				UPDATE users
				SET name = $1, email = $2, role = $3, is_active = $4, password_hash = $5, updated_at = NOW()
				WHERE id = $6`, req.Name, req.Email, req.Role, req.IsActive, string(hash), targetID)
		}
	} else {
		_, err = database.DB.Exec(`
			UPDATE users
			SET name = $1, email = $2, role = $3, is_active = $4, updated_at = NOW()
			WHERE id = $5`, req.Name, req.Email, req.Role, req.IsActive, targetID)
	}

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	// Update project memberships
	_, _ = database.DB.Exec(`DELETE FROM project_members WHERE user_id = $1`, targetID)
	for _, pid := range req.ProjectIDs {
		_, _ = database.DB.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, pid, targetID)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":        targetID,
		"name":      req.Name,
		"email":     req.Email,
		"role":      req.Role,
		"is_active": req.IsActive,
	})
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	claims, _ := middleware.GetUserClaims(r)
	if claims.UserID == targetID {
		writeError(w, http.StatusBadRequest, "You cannot delete your own administrator account")
		return
	}

	res, err := database.DB.Exec(`DELETE FROM users WHERE id = $1`, targetID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		writeError(w, http.StatusNotFound, "User not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
}
