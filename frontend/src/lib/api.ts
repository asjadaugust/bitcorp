/**
 * Simplified API utilities using fetch
 * For new projects using SWR
 */

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_V1_PREFIX = '/api/v1'

// Simple error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Get auth token from localStorage (for client-side only)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

// Create a fetch wrapper with auth headers
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken()
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${API_V1_PREFIX}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new APIError(
      errorData.message || errorData.detail || `HTTP ${response.status}`,
      response.status,
      errorData
    )
  }

  return response
}

// Auth API functions using fetch
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  first_name: string
  last_name: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authAPI = {
  // Login user
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Register user
  register: async (data: RegisterRequest) => {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await fetchWithAuth('/auth/me')
    return response.json()
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetchWithAuth('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    return response.json()
  },

  // Logout
  logout: async () => {
    const response = await fetchWithAuth('/auth/logout', { method: 'POST' })
    return response.json()
  },
}

// Generic API error handler
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}