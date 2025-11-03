import useSWRMutation from 'swr/mutation';
import { useAuthStore } from '@/stores/auth';
import {
  authAPI,
  handleAPIError,
  LoginRequest,
  RegisterRequest,
} from '../lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Global flag to ensure initialization only happens once across all components
let globalInitStarted = false;

export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized: storeInitialized,
    error,
    setUser,
    setTokens,
    logout: logoutStore,
    setLoading,
    setError,
    hasRole,
    hasPermission,
    initialize,
  } = useAuthStore();

  // DEBUG
  console.log('[useAuth] Render:', { hasUser: !!user, isAuthenticated, isLoading, storeInitialized, globalInitStarted });

  // Initialize auth state on mount ONCE GLOBALLY
  useEffect(() => {
    // Skip if already started initialization globally
    if (globalInitStarted) {
      console.log('[useAuth] SKIP - Global init already started');
      return;
    }

    let mounted = true;
    globalInitStarted = true;

    const initializeAuth = async () => {
      console.log('[useAuth] INIT START');
      setLoading(true);

      try {
        await initialize();

        // If we have tokens but no user, try to fetch user data
        const store = useAuthStore.getState();
        console.log('[useAuth] After initialize:', store.isAuthenticated, !!store.user);
        
        if (
          store.isAuthenticated &&
          store.accessToken &&
          !store.user &&
          mounted
        ) {
          try {
            const userData = await authAPI.getCurrentUser();
            if (mounted) {
              setUser(userData);
            }
          } catch {
            // If user fetch fails, clear auth state
            if (mounted) {
              logoutStore();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          console.log('[useAuth] INIT COMPLETE');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Login mutation using SWR
  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation(
    'auth/login',
    async (url: string, { arg }: { arg: LoginRequest }) => authAPI.login(arg),
    {
      onSuccess: async (data) => {
        setTokens(data.access_token, data.refresh_token);

        // Fetch user data after successful login
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setLoading(false);
          router.push('/dashboard');
        } catch (error) {
          setError(handleAPIError(error));
          setLoading(false);
        }
      },
      onError: (error) => {
        setError(handleAPIError(error));
        setLoading(false);
      },
    }
  );

  // Register mutation using SWR
  const { trigger: register, isMutating: isRegistering } = useSWRMutation(
    'auth/register',
    async (url: string, { arg }: { arg: RegisterRequest }) =>
      authAPI.register(arg),
    {
      onSuccess: () => {
        setLoading(false);
        // Redirect to login after successful registration
        router.push('/login?message=Registration successful. Please log in.');
      },
      onError: (error) => {
        setError(handleAPIError(error));
        setLoading(false);
      },
    }
  );

  // Logout mutation using SWR
  const { trigger: logout } = useSWRMutation(
    'auth/logout',
    () => authAPI.logout(),
    {
      onSuccess: () => {
        logoutStore();
        router.push('/login');
      },
      onError: () => {
        // Logout locally even if API call fails
        logoutStore();
        router.push('/login');
      },
    }
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || isLoggingIn || isRegistering,
    error,

    // Actions - these functions now handle the loading state and errors internally
    login: (data: LoginRequest) => {
      setLoading(true);
      setError(null);
      login(data);
    },
    register: (data: RegisterRequest) => {
      setLoading(true);
      setError(null);
      register(data);
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
    isInitialized: storeInitialized && !isLoading,
  };
};
