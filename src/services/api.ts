import type {
  AnalysisRecord,
  ClimateObservationRecord,
  CropProfile,
  ExtensionReview,
  FarmerPriorities,
  Farm,
  RotationPlan,
  SoilProfile,
  User,
  UserRole,
} from '../types/agrolens';

const TOKEN_KEY = 'agrolens_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (payload: {
      fullName: string;
      email: string;
      phone?: string;
      state: string;
      lga?: string;
      password: string;
      role?: UserRole;
    }) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

    login: (payload: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

    me: () => request<{ user: User }>('/auth/me'),
  },

  farms: {
    list: () => request<{ farms: Farm[] }>('/farms'),
    get: (id: string) => request<{ farm: Farm; soil: SoilProfile | null }>(`/farms/${id}`),
    create: (payload: Partial<Farm>) =>
      request<{ farm: Farm; soil: SoilProfile }>('/farms', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Farm>) =>
      request<{ farm: Farm }>(`/farms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (id: string) => request<{ deleted: boolean }>(`/farms/${id}`, { method: 'DELETE' }),
  },

  soil: {
    get: (farmId: string) => request<{ soil: SoilProfile | null }>(`/farms/${farmId}/soil`),
    save: (farmId: string, payload: Partial<SoilProfile>) =>
      request<{ soil: SoilProfile }>(`/farms/${farmId}/soil`, { method: 'POST', body: JSON.stringify(payload) }),
  },

  crops: {
    list: () => request<{ crops: CropProfile[] }>('/crops'),
    get: (id: string) => request<{ crop: CropProfile }>(`/crops/${id}`),
  },

  climate: {
    get: (farmId: string, rangeDays = 7) =>
      request<{ climate: ClimateObservationRecord }>(`/climate/${farmId}?rangeDays=${rangeDays}`),
    fetch: (farmId: string, rangeDays = 7, forceRefresh = true) =>
      request<{ climate: ClimateObservationRecord; cached: boolean }>('/climate/fetch', {
        method: 'POST',
        body: JSON.stringify({ farmId, rangeDays, forceRefresh }),
      }),
  },

  rotations: {
    list: (farmId: string) => request<{ rotations: RotationPlan[] }>(`/rotations/${farmId}`),
    create: (payload: { farmId: string; label: string; sequence: string[] }) =>
      request<{ rotation: RotationPlan }>('/rotations', { method: 'POST', body: JSON.stringify(payload) }),
  },

  analyses: {
    getLatestForFarm: (farmId: string) => request<{ analysis: AnalysisRecord }>(`/analyses/farm/${farmId}`),
    run: (payload: { farmId: string; priorities: FarmerPriorities; rangeDays?: number }) =>
      request<{ analysis: AnalysisRecord; climate: ClimateObservationRecord; soil: SoilProfile | null }>('/analyses', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  reviews: {
    list: (analysisId: string) => request<{ reviews: ExtensionReview[] }>(`/reviews/${analysisId}`),
    create: (payload: {
      analysisId: string;
      farmId: string;
      status: ExtensionReview['status'];
      comments: string;
      flaggedRisks: string[];
      missingInfoIdentified: string[];
      reviewerName?: string;
      reviewerRole?: string;
    }) => request<{ review: ExtensionReview }>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  },

  contact: {
    send: (payload: { name: string; email: string; message: string }) =>
      request<{ received: boolean; id: string }>('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  },
};
