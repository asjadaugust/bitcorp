import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useAuthStore } from '@/stores/auth'
import { authAPI, handleAPIError, LoginRequest, RegisterRequest } from '../lib/api'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuth = () => {
  const router = useRouter()
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    setUser, 
    setTokens, 
    logout: logoutStore, 
    setLoading, 
    setError,
    hasRole,
    hasPermission,
    initialize
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      setLoading(true)
      
      try {
        await initialize()
        
        // If we have tokens but no user, try to fetch user data
        const store = useAuthStore.getState()
        if (store.isAuthenticated && store.accessToken && !store.user && mounted) {
          try {
            const userData = await authAPI.getCurrentUser()
            if (mounted) {
              setUser(userData)
            }
          } catch {
            // If user fetch fails, clear auth state
            if (mounted) {
              logoutStore()
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()
    
    return () => {
      mounted = false
    }
  }, [initialize, setUser, setLoading, logoutStore])

  // Get current user query using SWR
  const { data: currentUser, isLoading: isUserLoading } = useSWR(
    isAuthenticated && !user ? 'currentUser' : null,
    authAPI.getCurrentUser,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Update user in store when query resolves
  if (currentUser && !user) {
    setUser(currentUser)
  }

  // Login mutation using SWR
  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation(
    'auth/login',
    async (url: string, { arg }: { arg: LoginRequest }) => authAPI.login(arg),
    {
      onSuccess: async (data) => {
        setTokens(data.access_token, data.refresh_token)
        
        // Fetch user data after successful login
        try {
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setLoading(false)
          router.push('/dashboard')
        } catch (error) {
          setError(handleAPIError(error))
          setLoading(false)
        }
      },
      onError: (error) => {
        setError(handleAPIError(error))
        setLoading(false)
      }
    }
  )

  // Register mutation using SWR
  const { trigger: register, isMutating: isRegistering } = useSWRMutation(
    'auth/register',
    async (url: string, { arg }: { arg: RegisterRequest }) => authAPI.register(arg),
    {
      onSuccess: () => {
        setLoading(false)
        // Redirect to login after successful registration
        router.push('/login?message=Registration successful. Please log in.')
      },
      onError: (error) => {
        setError(handleAPIError(error))
        setLoading(false)
      }
    }
  )

  // Logout mutation using SWR
  const { trigger: logout } = useSWRMutation(
    'auth/logout',
    () => authAPI.logout(),
    {
      onSuccess: () => {
        logoutStore()
        router.push('/login')
      },
      onError: () => {
        // Logout locally even if API call fails
        logoutStore()
        router.push('/login')
      }
    }
  )

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || isUserLoading || isLoggingIn || isRegistering,
    error,

    // Actions - these functions now handle the loading state and errors internally
    login: (data: LoginRequest) => {
      setLoading(true)
      setError(null)
      login(data)
    },
    register: (data: RegisterRequest) => {
      setLoading(true)
      setError(null)
      register(data)
    },
    logout: () => logout(),

    // Permissions
    hasRole,
    hasPermission,

    // Mutation states for more granular loading control
    isLoginPending: isLoggingIn,
    isRegisterPending: isRegistering,
    isLogoutPending: false,
    
    // Additional state for better UX
    isInitialized: !isLoading && !isUserLoading,
  }
}
