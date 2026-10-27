package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Role string

const (
	RoleAdmin    Role = "ADMIN"
	RoleEmployee Role = "EMPLOYEE"
)

type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         Role      `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Projects     []Project `json:"projects,omitempty"`
}

type CompanySettings struct {
	ID               int       `json:"id"`
	CompanyName      string    `json:"company_name"`
	AllowedDomain    string    `json:"allowed_domain"` // e.g. "acme.com" or empty
	WorkDays         string    `json:"work_days"`      // "1,2,3,4,5" (Mon-Fri)
	DailyTargetHours float64   `json:"daily_target_hours"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Project struct {
	ID               int       `json:"id"`
	Name             string    `json:"name"`
	Client           string    `json:"client"`
	Code             string    `json:"code"`
	Color            string    `json:"color"`
	Billable         bool      `json:"billable"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	AssignedUserIDs  []int     `json:"assigned_user_ids,omitempty"`
	TotalHoursLogged float64   `json:"total_hours_logged,omitempty"`
	ActiveMembers    int       `json:"active_members,omitempty"`
}

type TimeEntry struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	ProjectID       int       `json:"project_id"`
	Date            string    `json:"date"` // YYYY-MM-DD
	StartTime       string    `json:"start_time"` // HH:MM
	EndTime         string    `json:"end_time"`   // HH:MM
	DurationMinutes int       `json:"duration_minutes"`
	Description     string    `json:"description"`
	Billable        bool      `json:"billable"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Joined attributes for UI rendering
	ProjectName   string `json:"project_name,omitempty"`
	ProjectColor  string `json:"project_color,omitempty"`
	ProjectClient string `json:"project_client,omitempty"`
	UserName      string `json:"user_name,omitempty"`
	UserEmail     string `json:"user_email,omitempty"`
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   Role   `json:"role"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateUserRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Role       Role   `json:"role"`
	ProjectIDs []int  `json:"project_ids"`
}

type UpdateUserRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password,omitempty"`
	Role       Role   `json:"role"`
	IsActive   bool   `json:"is_active"`
	ProjectIDs []int  `json:"project_ids"`
}

type CreateProjectRequest struct {
	Name            string `json:"name"`
	Client          string `json:"client"`
	Code            string `json:"code"`
	Color           string `json:"color"`
	Billable        bool   `json:"billable"`
	AssignedUserIDs []int  `json:"assigned_user_ids"`
}

type UpdateProjectRequest struct {
	Name            string `json:"name"`
	Client          string `json:"client"`
	Code            string `json:"code"`
	Color           string `json:"color"`
	Billable        bool   `json:"billable"`
	IsActive        bool   `json:"is_active"`
	AssignedUserIDs []int  `json:"assigned_user_ids"`
}

type CreateTimeEntryRequest struct {
	ProjectID       int    `json:"project_id"`
	Date            string `json:"date"`
	StartTime       string `json:"start_time"`
	EndTime         string `json:"end_time"`
	DurationMinutes int    `json:"duration_minutes"`
	Description     string `json:"description"`
	Billable        bool   `json:"billable"`
}

type UpdateTimeEntryRequest struct {
	ProjectID       int    `json:"project_id"`
	Date            string `json:"date"`
	StartTime       string `json:"start_time"`
	EndTime         string `json:"end_time"`
	DurationMinutes int    `json:"duration_minutes"`
	Description     string `json:"description"`
	Billable        bool   `json:"billable"`
}

type DashboardStatsResponse struct {
	TodayHours       float64           `json:"today_hours"`
	WeekHours        float64           `json:"week_hours"`
	MonthHours       float64           `json:"month_hours"`
	BillableHours    float64           `json:"billable_hours"`
	NonBillableHours float64           `json:"non_billable_hours"`
	TotalProjects    int               `json:"total_projects"`
	TotalEmployees   int               `json:"total_employees"`
	TargetHoursWeek  float64           `json:"target_hours_week"`
	ProjectBreakdown []ProjectStat     `json:"project_breakdown"`
	DailyHours       []DailyStat       `json:"daily_hours"`
	UserBreakdown    []UserStat        `json:"user_breakdown,omitempty"`
	RecentEntries    []TimeEntry       `json:"recent_entries"`
}

type ProjectStat struct {
	ProjectID int     `json:"project_id"`
	Name      string  `json:"name"`
	Color     string  `json:"color"`
	Client    string  `json:"client"`
	Hours     float64 `json:"hours"`
	Percent   float64 `json:"percent"`
}

type DailyStat struct {
	Date      string  `json:"date"`
	DayOfWeek string  `json:"day_of_week"`
	Hours     float64 `json:"hours"`
}

type UserStat struct {
	UserID int     `json:"user_id"`
	Name   string  `json:"name"`
	Email  string  `json:"email"`
	Hours  float64 `json:"hours"`
}
