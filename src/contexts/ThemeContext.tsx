import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface ThemeState {
  isDarkMode: boolean;
  isLoading: boolean;
}

interface ThemeContextType extends ThemeState {
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeAction =
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: ThemeState = {
  isDarkMode: false,
  isLoading: true
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_DARK_MODE':
      return { ...state, isDarkMode: action.payload, isLoading: false };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDarkMode = savedTheme ? JSON.parse(savedTheme) : prefersDark;
    
    dispatch({ type: 'SET_DARK_MODE', payload: isDarkMode });
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme changes to document
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', JSON.stringify(state.isDarkMode));
  }, [state.isDarkMode]);

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setDarkMode = (enabled: boolean) => {
    dispatch({ type: 'SET_DARK_MODE', payload: enabled });
  };

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        toggleDarkMode,
        setDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};