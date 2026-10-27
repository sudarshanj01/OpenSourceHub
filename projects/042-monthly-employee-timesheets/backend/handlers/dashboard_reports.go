package handlers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"opensheets-backend/database"
	"opensheets-backend/middleware"
	"opensheets-backend/models"
)

func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	var stats models.DashboardStatsResponse

	// Company Target hours & Work Days
	var dailyTarget float64 = 8.0
	var workDaysStr string = "1,2,3,4,5"
	_ = database.DB.QueryRow(`SELECT daily_target_hours, work_days FROM company_settings ORDER BY id ASC LIMIT 1`).
		Scan(&dailyTarget, &workDaysStr)
	workDayCount := len(workDaysStr) / 2 + 1
	if workDayCount <= 0 {
		workDayCount = 5
	}
	stats.TargetHoursWeek = dailyTarget * float64(workDayCount)

	now := time.Now()
	todayStr := now.Format("2006-01-02")

	// Calculate start of current week (Monday)
	offset := int(now.Weekday() - time.Monday)
	if offset < 0 {
		offset += 7
	}
	startOfWeek := now.AddDate(0, 0, -offset)
	startOfWeekStr := startOfWeek.Format("2006-01-02")
	endOfWeekStr := startOfWeek.AddDate(0, 0, 6).Format("2006-01-02")

	// Calculate start of month
	startOfMonthStr := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02")

	var userCondition string
	var argsToday, argsWeek, argsMonth []interface{}
	if claims.Role != models.RoleAdmin {
		userCondition = " AND user_id = $1"
		argsToday = []interface{}{claims.UserID, todayStr}
		argsWeek = []interface{}{claims.UserID, startOfWeekStr, endOfWeekStr}
		argsMonth = []interface{}{claims.UserID, startOfMonthStr}
	} else {
		argsToday = []interface{}{todayStr}
		argsWeek = []interface{}{startOfWeekStr, endOfWeekStr}
		argsMonth = []interface{}{startOfMonthStr}
	}

	// 1. Today Hours
	queryToday := "SELECT COALESCE(SUM(duration_minutes), 0) FROM time_entries WHERE 1=1"
	if claims.Role != models.RoleAdmin {
		queryToday += " AND user_id = $1 AND date = $2"
	} else {
		queryToday += " AND date = $1"
	}
	var todayMinutes int
	_ = database.DB.QueryRow(queryToday, argsToday...).Scan(&todayMinutes)
	stats.TodayHours = float64(todayMinutes) / 60.0

	// 2. Week Hours & Billable breakdown
	queryWeek := "SELECT COALESCE(SUM(duration_minutes), 0), COALESCE(SUM(CASE WHEN billable THEN duration_minutes ELSE 0 END), 0) FROM time_entries WHERE 1=1"
	if claims.Role != models.RoleAdmin {
		queryWeek += " AND user_id = $1 AND date >= $2 AND date <= $3"
	} else {
		queryWeek += " AND date >= $1 AND date <= $2"
	}
	var weekMinutes, billableMinutes int
	_ = database.DB.QueryRow(queryWeek, argsWeek...).Scan(&weekMinutes, &billableMinutes)
	stats.WeekHours = float64(weekMinutes) / 60.0
	stats.BillableHours = float64(billableMinutes) / 60.0
	stats.NonBillableHours = stats.WeekHours - stats.BillableHours

	// 3. Month Hours
	queryMonth := "SELECT COALESCE(SUM(duration_minutes), 0) FROM time_entries WHERE 1=1"
	if claims.Role != models.RoleAdmin {
		queryMonth += " AND user_id = $1 AND date >= $2"
	} else {
		queryMonth += " AND date >= $1"
	}
	var monthMinutes int
	_ = database.DB.QueryRow(queryMonth, argsMonth...).Scan(&monthMinutes)
	stats.MonthHours = float64(monthMinutes) / 60.0

	// 4. Totals Counts
	_ = database.DB.QueryRow("SELECT COUNT(*) FROM projects WHERE is_active = true").Scan(&stats.TotalProjects)
	_ = database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE is_active = true AND role = 'EMPLOYEE'").Scan(&stats.TotalEmployees)

	// 5. Project Breakdown for current week
	qProject := `
		SELECT p.id, p.name, p.color, p.client, COALESCE(SUM(te.duration_minutes), 0) as mins
		FROM time_entries te
		JOIN projects p ON te.project_id = p.id
		WHERE te.date >= $1 AND te.date <= $2
	`
	var pArgs []interface{}
	if claims.Role != models.RoleAdmin {
		qProject += " AND te.user_id = $3 GROUP BY p.id ORDER BY mins DESC"
		pArgs = []interface{}{startOfWeekStr, endOfWeekStr, claims.UserID}
	} else {
		qProject += " GROUP BY p.id ORDER BY mins DESC"
		pArgs = []interface{}{startOfWeekStr, endOfWeekStr}
	}

	pRows, err := database.DB.Query(qProject, pArgs...)
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var ps models.ProjectStat
			var mins int
			if err := pRows.Scan(&ps.ProjectID, &ps.Name, &ps.Color, &ps.Client, &mins); err == nil && mins > 0 {
				ps.Hours = float64(mins) / 60.0
				if stats.WeekHours > 0 {
					ps.Percent = (ps.Hours / stats.WeekHours) * 100.0
				}
				stats.ProjectBreakdown = append(stats.ProjectBreakdown, ps)
			}
		}
	}

	// 6. Daily Hours for this week (Monday through Sunday)
	daysOfWeek := []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
	for i := 0; i < 7; i++ {
		curDate := startOfWeek.AddDate(0, 0, i)
		dateStr := curDate.Format("2006-01-02")
		qDay := "SELECT COALESCE(SUM(duration_minutes), 0) FROM time_entries WHERE date = $1"
		var dayMins int
		if claims.Role != models.RoleAdmin {
			qDay += " AND user_id = $2"
			_ = database.DB.QueryRow(qDay, dateStr, claims.UserID).Scan(&dayMins)
		} else {
			_ = database.DB.QueryRow(qDay, dateStr).Scan(&dayMins)
		}
		stats.DailyHours = append(stats.DailyHours, models.DailyStat{
			Date:      dateStr,
			DayOfWeek: daysOfWeek[i],
			Hours:     float64(dayMins) / 60.0,
		})
	}

	// 7. If Admin, User Breakdown for this week
	if claims.Role == models.RoleAdmin {
		qUser := `
			SELECT u.id, u.name, u.email, COALESCE(SUM(te.duration_minutes), 0) as mins
			FROM users u
			LEFT JOIN time_entries te ON u.id = te.user_id AND te.date >= $1 AND te.date <= $2
			WHERE u.is_active = true
			GROUP BY u.id
			ORDER BY mins DESC
		`
		uRows, err := database.DB.Query(qUser, startOfWeekStr, endOfWeekStr)
		if err == nil {
			defer uRows.Close()
			for uRows.Next() {
				var us models.UserStat
				var mins int
				if err := uRows.Scan(&us.UserID, &us.Name, &us.Email, &mins); err == nil {
					us.Hours = float64(mins) / 60.0
					stats.UserBreakdown = append(stats.UserBreakdown, us)
				}
			}
		}
	}

	// 8. Recent entries (5 entries)
	qRecent := `
		SELECT te.id, te.user_id, te.project_id, te.date, te.start_time, te.end_time,
		       te.duration_minutes, te.description, te.billable, te.created_at, te.updated_at,
		       p.name, p.color, p.client, u.name, u.email
		FROM time_entries te
		JOIN projects p ON te.project_id = p.id
		JOIN users u ON te.user_id = u.id
		WHERE 1=1
	`
	var rArgs []interface{}
	if claims.Role != models.RoleAdmin {
		qRecent += " AND te.user_id = $1"
		rArgs = append(rArgs, claims.UserID)
	}
	qRecent += " ORDER BY te.date DESC, te.created_at DESC LIMIT 5"

	rRows, err := database.DB.Query(qRecent, rArgs...)
	if err == nil {
		defer rRows.Close()
		for rRows.Next() {
			var te models.TimeEntry
			var d time.Time
			if err := rRows.Scan(
				&te.ID, &te.UserID, &te.ProjectID, &d, &te.StartTime, &te.EndTime,
				&te.DurationMinutes, &te.Description, &te.Billable, &te.CreatedAt, &te.UpdatedAt,
				&te.ProjectName, &te.ProjectColor, &te.ProjectClient, &te.UserName, &te.UserEmail,
			); err == nil {
				te.Date = d.Format("2006-01-02")
				stats.RecentEntries = append(stats.RecentEntries, te)
			}
		}
	}

	if stats.ProjectBreakdown == nil {
		stats.ProjectBreakdown = []models.ProjectStat{}
	}
	if stats.RecentEntries == nil {
		stats.RecentEntries = []models.TimeEntry{}
	}
	if stats.UserBreakdown == nil {
		stats.UserBreakdown = []models.UserStat{}
	}

	_ = userCondition // silence unused variable if any
	writeJSON(w, http.StatusOK, stats)
}

func ExportCSV(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserClaims(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "Not authenticated")
		return
	}

	query := `
		SELECT te.date, u.name, u.email, p.name, p.code, p.client, te.billable,
		       te.start_time, te.end_time, te.duration_minutes, te.description
		FROM time_entries te
		JOIN projects p ON te.project_id = p.id
		JOIN users u ON te.user_id = u.id
		WHERE 1=1
	`
	var args []interface{}
	argCount := 1

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

	query += ` ORDER BY te.date DESC, te.start_time DESC`

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to generate CSV")
		return
	}
	defer rows.Close()

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=\"opensheets_timesheet_export.csv\"")

	csvWriter := csv.NewWriter(w)
	defer csvWriter.Flush()

	// Header row
	_ = csvWriter.Write([]string{
		"Date", "Employee Name", "Employee Email", "Project Name", "Project Code",
		"Client", "Billable", "Start Time", "End Time", "Duration (Hours)", "Duration (Minutes)", "Description",
	})

	for rows.Next() {
		var dateVal time.Time
		var uName, uEmail, pName, pCode, pClient, desc, startTime, endTime string
		var billable bool
		var durMins int

		if err := rows.Scan(&dateVal, &uName, &uEmail, &pName, &pCode, &pClient, &billable, &startTime, &endTime, &durMins, &desc); err == nil {
			billableStr := "No"
			if billable {
				billableStr = "Yes"
			}
			hoursStr := fmt.Sprintf("%.2f", float64(durMins)/60.0)
			_ = csvWriter.Write([]string{
				dateVal.Format("2006-01-02"),
				uName,
				uEmail,
				pName,
				pCode,
				pClient,
				billableStr,
				startTime,
				endTime,
				hoursStr,
				strconv.Itoa(durMins),
				desc,
			})
		}
	}
}
