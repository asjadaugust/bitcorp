import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { authAPI, handleAPIError, LoginRequest, RegisterRequest } from '@/lib/api'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
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
    hasPermission
  } = useAuthStore()

  // Get current user query
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    enabled: isAuthenticated && !user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update user in store when query resolves
  if (currentUser && !user) {
    setUser(currentUser)
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: async (data) => {
      setTokens(data.access_token, data.refresh_token)
      
      // Fetch user data after successful login
      try {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
        queryClient.setQueryData(['currentUser'], userData)
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
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: () => {
      setLoading(false)
      // Redirect to login after successful registration
      router.push('/login?message=Registration successful. Please log in.')
    },
    onError: (error) => {
      setError(handleAPIError(error))
      setLoading(false)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      // Logout locally even if API call fails
      logoutStore()
      queryClient.clear()
      router.push('/login')
    }
  })

  // Auth functions
  const login = (data: LoginRequest) => {
    loginMutation.mutate(data)
  }

  const register = (data: RegisterRequest) => {
    registerMutation.mutate(data)
  }

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || isUserLoading || loginMutation.isPending || registerMutation.isPending,
    error,

    // Actions
    login,
    register,
    logout,

    // Permissions
    hasRole,
    hasPermission,

    // Mutation states
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  }
}
