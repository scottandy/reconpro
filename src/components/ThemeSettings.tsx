import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

const ThemeSettings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();

  const handleSystemTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Theme Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">Customize your visual experience</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Theme Options */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Appearance</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Mode */}
            <button
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                !isDarkMode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  !isDarkMode ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                }`}>
                  <Sun className="w-4 h-4 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  !isDarkMode ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Light
                </span>
              </div>
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                isDarkMode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
                }`}>
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Dark
                </span>
              </div>
            </button>

            {/* System Theme */}
            <button
              onClick={handleSystemTheme}
              className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  System
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Toggle */}
        <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Toggle</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
              <div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;