/**
 * Thin fetch wrapper for auth and resume API calls.
 * Uses relative /api/... URLs with credentials:'include' for httpOnly cookies.
 */

const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await request<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/me');
}

// ---------- Resumes ----------

export interface ResumeListItem {
  id: string;
  name: string;
  category: string | null;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeResponse extends ResumeListItem {
  userId: string;
  data: Record<string, unknown>;
}

export interface ResumeListResponse {
  resumes: ResumeListItem[];
}

export interface CreateResumePayload {
  name: string;
  category?: string;
  templateId?: string;
  data?: Record<string, unknown>;
}

export interface UpdateResumePayload {
  name?: string;
  category?: string;
  templateId?: string;
  data?: Record<string, unknown>;
}

export async function listResumes(): Promise<ResumeListResponse> {
  return request<ResumeListResponse>('/resumes');
}

export async function getResume(id: string): Promise<ResumeResponse> {
  return request<ResumeResponse>(`/resumes/${id}`);
}

export async function createResume(payload: CreateResumePayload): Promise<ResumeResponse> {
  return request<ResumeResponse>('/resumes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateResume(id: string, payload: UpdateResumePayload): Promise<ResumeResponse> {
  return request<ResumeResponse>(`/resumes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteResume(id: string): Promise<void> {
  await request<{ success: boolean }>(`/resumes/${id}`, { method: 'DELETE' });
}
