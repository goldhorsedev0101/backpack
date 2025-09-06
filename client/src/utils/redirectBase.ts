export function getRedirectBase(): string {
  // First priority: explicit APP_URL for production
  const appUrl = (import.meta as any).env?.VITE_APP_URL;
  if (appUrl) {
    const httpsBase = appUrl.replace('http://', 'https://');
    return httpsBase.endsWith('/') ? httpsBase.slice(0, -1) : httpsBase;
  }

  // Second priority: window.location.origin (browser only)
  if (typeof window !== 'undefined') {
    const base = window.location.origin;
    const httpsBase = base.replace('http://', 'https://');
    return httpsBase.endsWith('/') ? httpsBase.slice(0, -1) : httpsBase;
  }

  // Fallback for server-side
  const fallback = 'https://localhost:5000';
  return fallback;
}