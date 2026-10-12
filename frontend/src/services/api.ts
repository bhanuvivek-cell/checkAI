import { 
  AnalysisResponse, 
  HistoryItem, 
  FollowUpResponse, 
  HealthStatus, 
  CategoryType 
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/$/, '') || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to default message
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to the backend server. Please verify backend is running on port 8000.',
      0
    );
  }
}

export const api = {
  getHealth: async (): Promise<HealthStatus> => {
    return request<HealthStatus>('/health');
  },

  analyze: async (text: string, category: CategoryType, searchEnabled: boolean = true): Promise<AnalysisResponse> => {
    return request<AnalysisResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        text,
        category,
        search_enabled: searchEnabled,
      }),
    });
  },

  getHistory: async (params?: { category?: string; verdict?: string; search?: string }): Promise<HistoryItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.verdict) searchParams.append('verdict', params.verdict);
    if (params?.search) searchParams.append('search', params.search);

    const qs = searchParams.toString();
    return request<HistoryItem[]>(`/history${qs ? `?${qs}` : ''}`);
  },

  getHistoryDetail: async (id: number): Promise<AnalysisResponse> => {
    return request<AnalysisResponse>(`/history/${id}`);
  },

  deleteHistoryItem: async (id: number): Promise<{ message: string }> => {
    return request<{ message: string }>(`/history/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllHistory: async (): Promise<{ message: string }> => {
    return request<{ message: string }>('/history', {
      method: 'DELETE',
    });
  },

  askFollowUp: async (analysisId: number, question: string): Promise<FollowUpResponse> => {
    return request<FollowUpResponse>('/follow-up', {
      method: 'POST',
      body: JSON.stringify({
        analysis_id: analysisId,
        question,
      }),
    });
  },
};
