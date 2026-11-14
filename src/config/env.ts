export type ApiEnvironmentMode = 'auto' | 'local' | 'production';

const API_ENV_STORAGE_KEY = 'agrolens_api_env';

export const API_ENDPOINTS = {
  local: (import.meta.env.VITE_LOCAL_API_URL as string | undefined)?.replace(/\/$/, '') || '/api',
  localAbsolute: 'http://localhost:3000/api',
  production:
    (import.meta.env.VITE_DEPLOYED_API_URL as string | undefined)?.replace(/\/$/, '') ||
    'https://agrolensserver.vercel.app/api',
};

export function getApiEnvironmentMode(): ApiEnvironmentMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = window.localStorage.getItem(API_ENV_STORAGE_KEY);
  if (stored === 'local' || stored === 'production' || stored === 'auto') {
    return stored;
  }
  return 'auto';
}

export function setApiEnvironmentMode(mode: ApiEnvironmentMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(API_ENV_STORAGE_KEY, mode);
}

export function resolveApiBaseUrl(): string {
  const mode = getApiEnvironmentMode();
  if (mode === 'local') {
    return API_ENDPOINTS.local;
  }
  if (mode === 'production') {
    return API_ENDPOINTS.production;
  }

  // Explicit build-time override takes priority in auto mode
  const explicit = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (explicit) {
    const clean = explicit.replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Auto-detect local full-stack Express runtime (localhost / 127.0.0.1 / AI Studio Cloud Run container)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.run.app')) {
      return API_ENDPOINTS.local;
    }
  }

  // Hosted static frontend falls back to deployed Vercel serverless backend
  return API_ENDPOINTS.production;
}
