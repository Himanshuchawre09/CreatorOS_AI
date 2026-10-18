import { UserRole } from '../config/navigation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  orgName?: string;
  status: 'active' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  user?: User;
  message?: string;
  status?: string;
  errors?: unknown;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'creator' | 'brand' | 'freelancer' | 'talentManager';
  orgName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface HealthData {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime?: number;
  environment?: string;
  version?: string;
  database?: {
    isConnected?: boolean;
    state?: string;
    host?: string;
    name?: string;
  };
  memory?: {
    heapUsedMB?: number;
    heapTotalMB?: number;
    rssMB?: number;
  };
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    credentials: 'include', // Always send and receive cookies with API calls
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const message = responseData?.message || `Request failed with status ${response.status}`;
    const error: Error & { details?: unknown; errors?: unknown; statusCode?: number } = new Error(message);
    error.statusCode = response.status;
    error.errors = responseData?.errors;
    error.details = responseData?.details;
    throw error;
  }

  return responseData as ApiResponse<T>;
}

export const api = {
  getHealth: () => fetchApi<HealthData>('/health'),
  register: (payload: RegisterPayload) =>
    fetchApi<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginPayload) =>
    fetchApi<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    fetchApi<void>('/auth/logout', {
      method: 'POST',
    }),
  getMe: () => fetchApi<{ user: User }>('/auth/me'),
};
