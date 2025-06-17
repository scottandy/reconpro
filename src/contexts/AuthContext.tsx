import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, Dealership, LoginCredentials, RegisterDealershipData, RegisterUserData } from '../types/auth';
import { AuthManager } from '../utils/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  registerDealership: (data: RegisterDealershipData) => Promise<void>;
  registerUser: (data: RegisterUserData) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; dealership: Dealership } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  dealership: null,
  isLoading: true,
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        dealership: action.payload.dealership,
        isLoading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        dealership: null,
        isLoading: false,
        error: null
      };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize demo data
    AuthManager.initializeDemoData();

    // Check for existing session
    const session = AuthManager.getCurrentSession();
    if (session) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: session });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await AuthManager.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
    }
  };

  const logout = () => {
    AuthManager.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const registerDealership = async (data: RegisterDealershipData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await AuthManager.registerDealership(data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' });
    }
  };

  const registerUser = async (data: RegisterUserData) => {
    if (!state.dealership) {
      throw new Error('No dealership context');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await AuthManager.registerUser(data, state.dealership.id);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'User registration failed' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        registerDealership,
        registerUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};