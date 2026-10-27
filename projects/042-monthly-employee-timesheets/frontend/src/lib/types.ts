export type Role = "ADMIN" | "EMPLOYEE";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  projects?: Project[];
  assigned_project_ids?: number[];
  total_hours_logged?: number;
}

export interface CompanySettings {
  id: number;
  company_name: string;
  allowed_domain: string;
  work_days: string; // e.g. "1,2,3,4,5"
  daily_target_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  client: string;
  code: string;
  color: string;
  billable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_user_ids?: number[];
  total_hours_logged?: number;
  active_members?: number;
}

export interface TimeEntry {
  id: number;
  user_id: number;
  project_id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  description: string;
  billable: boolean;
  created_at: string;
  updated_at: string;

  project_name?: string;
  project_color?: string;
  project_client?: string;
  user_name?: string;
  user_email?: string;
}

export interface ProjectStat {
  project_id: number;
  name: string;
  color: string;
  client: string;
  hours: number;
  percent: number;
}

export interface DailyStat {
  date: string;
  day_of_week: string;
  hours: number;
}

export interface UserStat {
  user_id: number;
  name: string;
  email: string;
  hours: number;
}

export interface DashboardStats {
  today_hours: number;
  week_hours: number;
  month_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_projects: number;
  total_employees: number;
  target_hours_week: number;
  project_breakdown: ProjectStat[];
  daily_hours: DailyStat[];
  user_breakdown?: UserStat[];
  recent_entries: TimeEntry[];
}
