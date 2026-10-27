import { CompanySettings, DashboardStats, Project, TimeEntry, User } from "./types";

const TOKEN_KEY = "opensheets_auth_token";
const USER_KEY = "opensheets_auth_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // If unauthorized, clear auth only if not currently trying to log in
    if (endpoint !== "/api/auth/login") {
      clearStoredAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.dispatchEvent(new Event("auth-changed"));
      }
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setStoredAuth(res.token, res.user);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    clearStoredAuth();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  // Settings
  async getSettings(): Promise<CompanySettings> {
    return request<CompanySettings>("/api/settings");
  },

  async updateSettings(data: Partial<CompanySettings>): Promise<CompanySettings> {
    return request<CompanySettings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    return request<Project[]>("/api/projects");
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    return request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    return request<Project>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },

  // Users (Admin only)
  async getUsers(): Promise<User[]> {
    return request<User[]>("/api/users");
  },

  async createUser(data: { name: string; email: string; password: string; role?: string; project_ids?: number[] }): Promise<User> {
    return request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: number, data: Partial<User> & { password?: string; project_ids?: number[] }): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  // Timesheets
  async getTimesheets(params?: { start_date?: string; end_date?: string; project_id?: number; user_id?: number }): Promise<TimeEntry[]> {
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    if (params?.project_id) query.set("project_id", params.project_id.toString());
    if (params?.user_id) query.set("user_id", params.user_id.toString());

    return request<TimeEntry[]>(`/api/timesheets?${query.toString()}`);
  },

  async createTimeEntry(data: {
    project_id: number;
    date: string;
    start_time?: string;
    end_time?: string;
    duration_minutes?: number;
    description: string;
    billable?: boolean;
  }): Promise<TimeEntry> {
    return request<TimeEntry>("/api/timesheets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateTimeEntry(id: number, data: Partial<TimeEntry>): Promise<TimeEntry> {
    return request<TimeEntry>(`/api/timesheets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteTimeEntry(id: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/timesheets/${id}`, {
      method: "DELETE",
    });
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>("/api/dashboard/stats");
  },

  // Export CSV url generator
  getExportUrl(params?: { start_date?: string; end_date?: string; project_id?: number; user_id?: number }): string {
    const query = new URLSearchParams();
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    if (params?.project_id) query.set("project_id", params.project_id.toString());
    if (params?.user_id) query.set("user_id", params.user_id.toString());
    return `/api/reports/export?${query.toString()}`;
  },
};
