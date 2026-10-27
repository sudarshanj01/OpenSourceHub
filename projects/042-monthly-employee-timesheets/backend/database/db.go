package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func InitDB() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		host := os.Getenv("POSTGRES_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("POSTGRES_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("POSTGRES_USER")
		if user == "" {
			user = "postgres"
		}
		password := os.Getenv("POSTGRES_PASSWORD")
		if password == "" {
			password = "postgres"
		}
		dbname := os.Getenv("POSTGRES_DB")
		if dbname == "" {
			dbname = "opensheets"
		}
		connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			host, port, user, password, dbname)
	}

	var db *sql.DB
	var err error

	// Retry loop for Docker startup
	for i := 1; i <= 15; i++ {
		db, err = sql.Open("postgres", connStr)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Connected to PostgreSQL database successfully")
				break
			}
		}
		log.Printf("Waiting for database connection (attempt %d/15): %v", i, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database after retries: %w", err)
	}

	DB = db
	if err := migrateSchema(db); err != nil {
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	if err := seedInitialData(db); err != nil {
		log.Printf("Seeding notice: %v", err)
	}

	return db, nil
}

func migrateSchema(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS company_settings (
			id SERIAL PRIMARY KEY,
			company_name VARCHAR(255) NOT NULL DEFAULT 'OpenSheets Organization',
			allowed_domain VARCHAR(255) NOT NULL DEFAULT '',
			work_days VARCHAR(50) NOT NULL DEFAULT '1,2,3,4,5',
			daily_target_hours NUMERIC(4,2) NOT NULL DEFAULT 8.00,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS projects (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			client VARCHAR(255) NOT NULL DEFAULT '',
			code VARCHAR(50) NOT NULL DEFAULT '',
			color VARCHAR(50) NOT NULL DEFAULT '#6366f1',
			billable BOOLEAN NOT NULL DEFAULT TRUE,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE TABLE IF NOT EXISTS project_members (
			project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			PRIMARY KEY (project_id, user_id)
		);`,

		`CREATE TABLE IF NOT EXISTS time_entries (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			date DATE NOT NULL,
			start_time VARCHAR(10) NOT NULL DEFAULT '',
			end_time VARCHAR(10) NOT NULL DEFAULT '',
			duration_minutes INTEGER NOT NULL DEFAULT 0,
			description TEXT NOT NULL DEFAULT '',
			billable BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,

		`CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date);`,
		`CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);`,
		`CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return fmt.Errorf("error executing schema statement: %w\nStatement: %s", err, q)
		}
	}

	return nil
}

func seedInitialData(db *sql.DB) error {
	// 1. Ensure company_settings exists
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM company_settings").Scan(&count)
	if err == nil && count == 0 {
		companyName := os.Getenv("COMPANY_NAME")
		if companyName == "" {
			companyName = "Apex Studio Inc."
		}
		allowedDomain := os.Getenv("ALLOWED_DOMAIN")
		_, err = db.Exec(`INSERT INTO company_settings (company_name, allowed_domain, work_days, daily_target_hours)
			VALUES ($1, $2, '1,2,3,4,5', 8.00)`, companyName, allowedDomain)
		if err != nil {
			log.Printf("failed to insert default company settings: %v", err)
		}
	}

	// 2. Ensure Admin user exists
	var adminCount int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'ADMIN'").Scan(&adminCount)
	if err == nil && adminCount == 0 {
		adminEmail := os.Getenv("ADMIN_EMAIL")
		if adminEmail == "" {
			adminEmail = "admin@opensheets.internal"
		}
		adminPass := os.Getenv("ADMIN_PASSWORD")
		if adminPass == "" {
			adminPass = "Admin@123456"
		}

		hash, _ := bcrypt.GenerateFromPassword([]byte(adminPass), bcrypt.DefaultCost)
		var adminID int
		err = db.QueryRow(`INSERT INTO users (name, email, password_hash, role, is_active)
			VALUES ($1, $2, $3, 'ADMIN', true) RETURNING id`, "HR Administrator", adminEmail, string(hash)).Scan(&adminID)
		if err != nil {
			log.Printf("Failed to seed admin: %v", err)
		} else {
			log.Printf("Seeded default admin user: %s", adminEmail)
		}

		// Also seed 2 initial employees if no employees exist
		empPass := "Employee@123"
		empHash, _ := bcrypt.GenerateFromPassword([]byte(empPass), bcrypt.DefaultCost)

		var emp1ID, emp2ID int
		db.QueryRow(`INSERT INTO users (name, email, password_hash, role, is_active)
			VALUES ($1, $2, $3, 'EMPLOYEE', true) RETURNING id`, "Sarah Jenkins", "sarah@opensheets.internal", string(empHash)).Scan(&emp1ID)
		db.QueryRow(`INSERT INTO users (name, email, password_hash, role, is_active)
			VALUES ($1, $2, $3, 'EMPLOYEE', true) RETURNING id`, "Alex Rivera", "alex@opensheets.internal", string(empHash)).Scan(&emp2ID)

		// Seed standard projects
		var p1ID, p2ID, p3ID, p4ID int
		db.QueryRow(`INSERT INTO projects (name, client, code, color, billable, is_active)
			VALUES ($1, $2, $3, $4, true, true) RETURNING id`, "Core Web Platform", "Product Org", "OSH-01", "#6366f1").Scan(&p1ID)
		db.QueryRow(`INSERT INTO projects (name, client, code, color, billable, is_active)
			VALUES ($1, $2, $3, $4, true, true) RETURNING id`, "Cloud Infrastructure", "DevOps", "OPS-22", "#06b6d4").Scan(&p2ID)
		db.QueryRow(`INSERT INTO projects (name, client, code, color, billable, is_active)
			VALUES ($1, $2, $3, $4, true, true) RETURNING id`, "FinTech Mobile App", "Apex Global", "FIN-09", "#10b981").Scan(&p3ID)
		db.QueryRow(`INSERT INTO projects (name, client, code, color, billable, is_active)
			VALUES ($1, $2, $3, $4, false, true) RETURNING id`, "Internal Architecture Review", "Engineering", "ENG-88", "#f59e0b").Scan(&p4ID)

		// Assign users to projects
		for _, pid := range []int{p1ID, p2ID, p3ID, p4ID} {
			if pid > 0 {
				db.Exec("INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", pid, adminID)
				if emp1ID > 0 {
					db.Exec("INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", pid, emp1ID)
				}
				if emp2ID > 0 && pid != p4ID {
					db.Exec("INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", pid, emp2ID)
				}
			}
		}

		// Seed initial time entries for Sarah and Alex for recent days
		now := time.Now()
		todayStr := now.Format("2006-01-02")
		yesterdayStr := now.AddDate(0, 0, -1).Format("2006-01-02")
		twoDaysAgoStr := now.AddDate(0, 0, -2).Format("2006-01-02")

		if emp1ID > 0 && p1ID > 0 {
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '10:00', '13:00', 180, 'Implemented weekly timesheet matrix layout and responsive grid', true)`,
				emp1ID, p1ID, todayStr)
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '14:00', '18:30', 270, 'Configured Go Chi router endpoints and JWT persistent sessions', true)`,
				emp1ID, p2ID, todayStr)
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '09:30', '13:00', 210, 'Designed Aceternity-inspired UI styling and bento card metrics', true)`,
				emp1ID, p1ID, yesterdayStr)
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '14:00', '18:00', 240, 'Refactored project assignment and team management dashboard', true)`,
				emp1ID, p3ID, yesterdayStr)
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '10:00', '17:00', 420, 'Database query optimization for timesheet aggregation and CSV exports', true)`,
				emp1ID, p2ID, twoDaysAgoStr)
		}

		if emp2ID > 0 && p3ID > 0 {
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '09:00', '12:30', 210, 'Mobile screen touch target audits and card view responsive styling', true)`,
				emp2ID, p3ID, todayStr)
			db.Exec(`INSERT INTO time_entries (user_id, project_id, date, start_time, end_time, duration_minutes, description, billable)
				VALUES ($1, $2, $3, '13:30', '17:30', 240, 'Implemented time duration calculator and formatters', true)`,
				emp2ID, p1ID, todayStr)
		}

		log.Println("Seeded realistic starter projects and timesheet entries successfully")
	}

	return nil
}
