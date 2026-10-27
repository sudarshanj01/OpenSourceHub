package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"opensheets-backend/database"
	"opensheets-backend/middleware"
	"opensheets-backend/models"

	"github.com/go-chi/chi/v5"
)

// Helper to compute minutes between two "HH:MM" timestamps
func calculateDuration(startTime, endTime string) int {
	if startTime == "" || endTime == "" {
		return 0
	}
	t1, err1 := time.Parse("15:04", startTime)
	t2, err2 := time.Parse("15:04", endTime)
	if err1 != nil || err2 != nil {
		return 0
	}
	diff := t2.Sub(t1)
	if diff < 0 {
		// e.g. overnight shift 22:00 to 02:00
		diff += 24 * time.Hour
	}
	return int(diff.Minutes())
}

func GetTimesheets(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	query := `
		SELECT te.id, te.user_id, te.project_id, te.date, te.start_time, te.end_time,
		       te.duration_minutes, te.description, te.billable, te.created_at, te.updated_at,
		       p.name, p.color, p.client, u.name, u.email
		FROM time_entries te
		JOIN projects p ON te.project_id = p.id
		JOIN users u ON te.user_id = u.id
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	// Security: Employee can only see their own timesheet entries
	if claims.Role != models.RoleAdmin {
		query += fmt.Sprintf(" AND te.user_id = $%d", argCount)
		args = append(args, claims.UserID)
		argCount++
	} else if uIDStr := r.URL.Query().Get("user_id"); uIDStr != "" {
		if uID, err := strconv.Atoi(uIDStr); err == nil && uID > 0 {
			query += fmt.Sprintf(" AND te.user_id = $%d", argCount)
			args = append(args, uID)
			argCount++
		}
	}

	if pIDStr := r.URL.Query().Get("project_id"); pIDStr != "" {
		if pID, err := strconv.Atoi(pIDStr); err == nil && pID > 0 {
			query += fmt.Sprintf(" AND te.project_id = $%d", argCount)
			args = append(args, pID)
			argCount++
		}
	}

	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		query += fmt.Sprintf(" AND te.date >= $%d", argCount)
		args = append(args, startDate)
		argCount++
	}

	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		query += fmt.Sprintf(" AND te.date <= $%d", argCount)
		args = append(args, endDate)
		argCount++
	}

	query += ` ORDER BY te.date DESC, te.start_time DESC, te.id DESC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to query timesheet entries: "+err.Error())
		return
	}
	defer rows.Close()

	var entries []models.TimeEntry
	for rows.Next() {
		var te models.TimeEntry
		var dateVal time.Time
		err := rows.Scan(
			&te.ID, &te.UserID, &te.ProjectID, &dateVal, &te.StartTime, &te.EndTime,
			&te.DurationMinutes, &te.Description, &te.Billable, &te.CreatedAt, &te.UpdatedAt,
			&te.ProjectName, &te.ProjectColor, &te.ProjectClient, &te.UserName, &te.UserEmail,
		)
		if err == nil {
			te.Date = dateVal.Format("2006-01-02")
			entries = append(entries, te)
		}
	}

	if entries == nil {
		entries = []models.TimeEntry{}
	}

	writeJSON(w, http.StatusOK, entries)
}

func CreateTimeEntry(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	var req models.CreateTimeEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.ProjectID <= 0 {
		writeError(w, http.StatusBadRequest, "Please select a valid project")
		return
	}

	req.Date = strings.TrimSpace(req.Date)
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	// Calculate duration
	if req.DurationMinutes <= 0 && req.StartTime != "" && req.EndTime != "" {
		req.DurationMinutes = calculateDuration(req.StartTime, req.EndTime)
	}

	if req.DurationMinutes <= 0 {
		writeError(w, http.StatusBadRequest, "Time duration must be greater than zero")
		return
	}

	// Verify project exists
	var billableDefault bool
	err := database.DB.QueryRow(`SELECT billable FROM projects WHERE id = $1 AND is_active = true`, req.ProjectID).Scan(&billableDefault)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Selected project does not exist or is inactive")
		return
	}

	// If billable flag was not explicitly sent or project default is billable
	// req.Billable remains as sent or defaults

	var newID int
	var createdAt, updatedAt time.Time
	err = database.DB.QueryRow(`
		INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at`,
		claims.UserID, req.ProjectID, req.Date, req.StartTime, req.EndTime, req.DurationMinutes, req.Description, req.Billable).
		Scan(&newID, &createdAt, &updatedAt)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to create timesheet entry: "+err.Error())
		return
	}

	// Fetch joined details
	var entry models.TimeEntry
	entry.ID = newID
	entry.UserID = claims.UserID
	entry.ProjectID = req.ProjectID
	entry.Date = req.Date
	entry.StartTime = req.StartTime
	entry.EndTime = req.EndTime
	entry.DurationMinutes = req.DurationMinutes
	entry.Description = req.Description
	entry.Billable = req.Billable
	entry.CreatedAt = createdAt
	entry.UpdatedAt = updatedAt

	_ = database.DB.QueryRow(`SELECT name, color, client FROM projects WHERE id = $1`, req.ProjectID).
		Scan(&entry.ProjectName, &entry.ProjectColor, &entry.ProjectClient)
	_ = database.DB.QueryRow(`SELECT name, email FROM users WHERE id = $1`, claims.UserID).
		Scan(&entry.UserName, &entry.UserEmail)

	writeJSON(w, http.StatusCreated, entry)
}

func UpdateTimeEntry(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid timesheet entry ID")
		return
	}

	// Verify ownership or admin
	var ownerID int
	err = database.DB.QueryRow(`SELECT user_id FROM time_entries WHERE id = $1`, targetID).Scan(&ownerID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Timesheet entry not found")
		return
	}

	if claims.Role != models.RoleAdmin && claims.UserID != ownerID {
		writeError(w, http.StatusForbidden, "You can only edit your own timesheet entries")
		return
	}

	var req models.UpdateTimeEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.DurationMinutes <= 0 && req.StartTime != "" && req.EndTime != "" {
		req.DurationMinutes = calculateDuration(req.StartTime, req.EndTime)
	}

	if req.DurationMinutes <= 0 {
		writeError(w, http.StatusBadRequest, "Duration must be greater than zero")
		return
	}

	_, err = database.DB.Exec(`
		UPDATE time_entries
		SET project_id = $1, date = $2, start_time = $3, end_time = $4,
		    duration_minutes = $5, description = $6, billable = $7, updated_at = NOW()
		WHERE id = $8`,
		req.ProjectID, req.Date, req.StartTime, req.EndTime, req.DurationMinutes, req.Description, req.Billable, targetID)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to update timesheet entry")
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":               targetID,
		"project_id":       req.ProjectID,
		"date":             req.Date,
		"start_time":       req.StartTime,
		"end_time":         req.EndTime,
		"duration_minutes": req.DurationMinutes,
		"description":      req.Description,
		"billable":         req.Billable,
	})
}

func DeleteTimeEntry(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	idStr := chi.URLParam(r, "id")
	targetID, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid timesheet entry ID")
		return
	}

	var ownerID int
	err = database.DB.QueryRow(`SELECT user_id FROM time_entries WHERE id = $1`, targetID).Scan(&ownerID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Timesheet entry not found")
		return
	}

	if claims.Role != models.RoleAdmin && claims.UserID != ownerID {
		writeError(w, http.StatusForbidden, "You can only delete your own timesheet entries")
		return
	}

	_, err = database.DB.Exec(`DELETE FROM time_entries WHERE id = $1`, targetID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to delete timesheet entry")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Timesheet entry deleted successfully"})
}
