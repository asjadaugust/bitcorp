import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login?: string
  roles: Role[]
}

interface Role {
  id: number
  name: string
  description?: string
  is_active: boolean
  created_at: string
  permissions: Permission[]
}

interface Permission {
  id: number
  name: string
  description?: string
  resource: string
  action: string
  created_at: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  hasRole: (roleName: string) => boolean
  hasPermission: (permissionName: string) => boolean
  initialize: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: true, 
          error: null 
        }),

      setTokens: (accessToken, refreshToken) => {
        // Set in store state
        set({ 
          accessToken, 
          refreshToken, 
          isAuthenticated: true 
        })
        
        // Also set in localStorage for API functions
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
        
        // Clear from localStorage too
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      },

      setLoading: (isLoading) => 
        set({ isLoading }),

      setError: (error) => 
        set({ error }),

      hasRole: (roleName: string) => {
        const { user } = get()
        return user?.roles?.some(role => role.name === roleName) ?? false
      },

      hasPermission: (permissionName: string) => {
        const { user } = get()
        if (!user?.roles) return false
        
        return user.roles.some(role =>
          role.permissions?.some(permission => permission.name === permissionName)
        )
      },

      initialize: () => {
        // Sync tokens from store to localStorage on initialization
        const { accessToken, refreshToken } = get()
        if (accessToken && refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export type { User, Role, Permission }
