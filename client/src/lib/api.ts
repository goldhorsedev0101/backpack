// client/src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function api(url: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res;
}