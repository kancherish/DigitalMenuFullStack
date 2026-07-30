// api/apiFetch.ts
import { getAccessToken,setAccessToken,triggerForceLogout } from "./tokenstore";
import type { ApiFetchOptions } from "../types";

const API_URL = import.meta.env.VITE_SERVER_ADDRESS;

// Single-flight refresh: if multiple requests 401 at once, only one refresh call fires.
// Others wait on this same promise.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const { accessToken, refreshToken: newRefreshToken } = data.data;

    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // Only set JSON content-type for string bodies (not FormData, not Blob, etc.)
  const isJsonBody = typeof options.body === 'string' || typeof options.body === 'undefined';
  console.log(isJsonBody)
  if (isJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }


  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status !== 401 || options._retried) {
    return res;
  }

  // 401 and not yet retried — attempt refresh
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newToken = await refreshPromise;

  if (!newToken) {
    triggerForceLogout();
    return res;
  }

  // Retry original request once, with new token
  const retryHeaders = new Headers(options.headers);
  retryHeaders.set('Authorization', `Bearer ${newToken}`);

  if (isJsonBody && !retryHeaders.has('Content-Type')) {
    retryHeaders.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${path}`, { ...options, headers: retryHeaders, _retried: true } as ApiFetchOptions);
}