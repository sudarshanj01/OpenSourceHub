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
)

func GetProjects(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	query := `
		SELECT p.id, p.name, p.client, p.code, p.color, p.billable, p.is_active, p.created_at, p.updated_at,
		       COALESCE(SUM(te.duration_minutes), 0) as total_minutes,
		       COUNT(DISTINCT pm.user_id) as member_count
		FROM projects p
		LEFT JOIN time_entries te ON p.id = te.project_id
		LEFT JOIN project_members pm ON p.id = pm.project_id
	`

	var args []interface{}
	if claims.Role != models.RoleAdmin {
		// Employees only see active projects assigned to them
		query += ` WHERE p.is_active = true AND p.id IN (SELECT project_id FROM project_members WHERE user_id = $1) `
		args = append(args, claims.UserID)
	}

	query += ` GROUP BY p.id ORDER BY p.name ASC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to fetch projects")
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		var totalMinutes int
		if err := rows.Scan(&p.ID, &p.Name, &p.Client, &p.Code, &p.Color, &p.Billable, &p.IsActive, &p.CreatedAt, &p.UpdatedAt, &totalMinutes, &p.ActiveMembers); err == nil {
			p.TotalHoursLogged = float64(totalMinutes) / 60.0
			p.AssignedUserIDs = []int{}
			projects = append(projects, p)
		}
	}

	// If admin, also fetch assigned user IDs for each project
	if claims.Role == models.RoleAdmin {
		for i := range projects {
			mRows, err := database.DB.Query(`SELECT user_id FROM project_members WHERE project_id = $1`, projects[i].ID)
			if err == nil {
				for mRows.Next() {
					var uid int
					if err := mRows.Scan(&uid); err == nil {
						projects[i].AssignedUserIDs = append(projects[i].AssignedUserIDs, uid)
					}
				}
				mRows.Close()
			}
		}
	}

	if projects == nil {
		projects = []models.Project{}
	}

	writeJSON(w, http.StatusOK, projects)
}

func CreateProject(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "Project name is required")
		return
	}

	if req.Color == "" {
		req.Color = "#6366f1"
	}

	var newID int
	err := database.DB.QueryRow(`
		INSERT INTO projects (name, client, code, color, billable, is_active)
		VALUES ($1, $2, $3, $4, $5, true)
		RETURNING id`, req.Name, req.Client, req.Code, req.Color, req.Billable).Scan(&newID)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	// Assign members
	for _, uid := range req.AssignedUserIDs {
		_, _ = database.DB.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, newID, uid)
	}

	p := models.Project{
		ID:              newID,
		Name:            req.Name,
		Client:          req.Client,
		Code:            req.Code,
		Color:           req.Color,
		Billable:        req.Billable,
		IsActive:        true,
		AssignedUserIDs: req.AssignedUserIDs,
		ActiveMembers:   len(req.AssignedUserIDs),
	}

	writeJSON(w, http.StatusCreated, p)
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var req models.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "Project name is required")
		return
	}

	_, err = database.DB.Exec(`
		UPDATE projects
		SET name = $1, client = $2, code = $3, color = $4, billable = $5, is_active = $6, updated_at = NOW()
		WHERE id = $7`, req.Name, req.Client, req.Code, req.Color, req.Billable, req.IsActive, targetID)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update project")
		return
	}

	// Update member assignments
	_, _ = database.DB.Exec(`DELETE FROM project_members WHERE project_id = $1`, targetID)
	for _, uid := range req.AssignedUserIDs {
		_, _ = database.DB.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, targetID, uid)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":        targetID,
		"name":      req.Name,
		"client":    req.Client,
		"code":      req.Code,
		"color":     req.Color,
		"billable":  req.Billable,
		"is_active": req.IsActive,
	})
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	res, err := database.DB.Exec(`DELETE FROM projects WHERE id = $1`, targetID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete project")
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		writeError(w, http.StatusNotFound, "Project not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Project deleted successfully"})
}
