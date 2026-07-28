import { authStorage } from '@/lib/auth-storage';
import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    authStorage.clear();
    return null;
  }

  const json = (await res.json()) as ApiResponse<{
    user: Parameters<typeof authStorage.setAuth>[0];
    tokens: Parameters<typeof authStorage.setAuth>[1];
  }>;

  authStorage.setAuth(json.data.user, json.data.tokens);
  return json.data.tokens.accessToken;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = authStorage.getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message ?? 'Request failed');
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

export { ApiError };
