// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// Get auth token from localStorage (for client-side only)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Get refresh token from localStorage (for client-side only)
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

// Set tokens in localStorage
const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Clear tokens from localStorage
const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Create full API URL
export const getApiUrl = (endpoint: string): string => {
  // Remove duplicate /api/v1 prefixes if they exist
  const cleanEndpoint = endpoint.replace(/^\/api\/v1/, '');
  return `${API_BASE_URL}${API_V1_PREFIX}${cleanEndpoint}`;
};

// Enhanced fetch function with authentication and error handling
export const authenticatedFetcher = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(getApiUrl(url), config);

  // Handle 401 unauthorized - attempt token refresh
  if (response.status === 401 && token) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        // Attempt to refresh token
        const refreshResponse = await fetch(getApiUrl('/auth/refresh'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const { access_token, refresh_token } = await refreshResponse.json();
          setTokens(access_token, refresh_token);

          // Retry original request with new token
          const retryHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${access_token}`,
          };

          response = await fetch(getApiUrl(url), {
            ...config,
            headers: retryHeaders,
          });
        } else {
          // Refresh failed, logout user
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Authentication failed');
        }
      } catch {
        // Refresh failed, logout user
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed');
      }
    } else {
      // No refresh token, logout user
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(getErrorMessage(errorData, response.status));
    error.name = 'APIError';
    throw error;
  }

  return response.json();
};

// Simple fetcher for SWR (GET requests) with proper typing
export const swrFetcher = <T = unknown>(url: string): Promise<T> =>
  authenticatedFetcher<T>(url);

// Mutation helper for non-GET requests
export const mutationFetcher = async <T = unknown>(
  url: string,
  { method = 'POST', data }: { method?: string; data?: unknown } = {}
): Promise<T> => {
  const options: RequestInit = {
    method,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return authenticatedFetcher<T>(url, options);
};

// Error message extractor
export const getErrorMessage = (
  errorData: unknown,
  status?: number
): string => {
  if (errorData && typeof errorData === 'object' && errorData !== null) {
    const data = errorData as Record<string, unknown>;

    if (data.detail) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.map((err: { msg: string }) => err.msg).join(', ');
      }
    }

    if (typeof data.message === 'string') {
      return data.message;
    }
  }

  if (status) {
    switch (status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 500:
        return 'Internal server error';
      default:
        return `Request failed with status ${status}`;
    }
  }

  return 'An unexpected error occurred';
};

// Auth API functions using fetch
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authAPI = {
  // Login user
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    return mutationFetcher<TokenResponse>('/auth/login', {
      method: 'POST',
      data,
    });
  },

  // Register user
  register: async (data: RegisterRequest) => {
    return mutationFetcher('/auth/register', { method: 'POST', data });
  },

  // Get current user
  getCurrentUser: async () => {
    return authenticatedFetcher('/auth/me');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    return mutationFetcher<TokenResponse>('/auth/refresh', {
      method: 'POST',
      data: { refresh_token: refreshToken },
    });
  },

  // Logout
  logout: async () => {
    return mutationFetcher('/auth/logout', { method: 'POST' });
  },
};
