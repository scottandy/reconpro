import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Eye, EyeOff, ArrowLeft, Building2, Users, Mail, Lock, Shield } from 'lucide-react';

interface LoginFormProps {
  onBack: () => void;
  onShowRegister: () => void;
  onShowSuperAdmin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onShowRegister, onShowSuperAdmin }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(formData);
  };

  const handleDemoLogin = async (email: string) => {
    console.log('🎯 Demo login attempt for:', email);
    clearError();
    try {
      await login({ email, password: 'demo' });
    } catch (error) {
      console.error('❌ Demo login failed:', error);
    }
  };

  const demoAccounts = [
    {
      type: 'Premier Auto Group',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      accounts: [
        { email: 'admin@premierauto.com', role: 'Admin', name: 'John Smith', description: 'Dealership admin' },
        { email: 'manager@premierauto.com', role: 'Manager', name: 'Sarah Johnson', description: 'Operations manager' },
        { email: 'tech@premierauto.com', role: 'Technician', name: 'Mike Wilson', description: 'Service technician' }
      ]
    },
    {
      type: 'City Motors',
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-gray-50 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      accounts: [
        { email: 'admin@citymotors.com', role: 'Admin', name: 'Lisa Davis', description: 'Dealership admin' },
        { email: 'sales@citymotors.com', role: 'Sales', name: 'Tom Brown', description: 'Sales representative' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900/20 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 w-full max-w-lg transition-colors duration-300">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="absolute top-4 left-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your dealership account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Demo Accounts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Demo Dealership Accounts</h3>
              <button
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {showDemoAccounts ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showDemoAccounts && (
              <div className="space-y-4">
                {demoAccounts.map((group, index) => (
                  <div key={index} className={`${group.bgColor} rounded-xl p-4 border ${group.borderColor} transition-colors duration-300`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-8 h-8 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <group.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{group.type}</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {group.accounts.map((account, accountIndex) => (
                        <button
                          key={accountIndex}
                          onClick={() => handleDemoLogin(account.email)}
                          disabled={isLoading}
                          className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{account.name}</p>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{account.email}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{account.description}</p>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                                account.role === 'Admin'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                              }`}>
                                {account.role}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Quick Access</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Click any account above to instantly log in with demo credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Login Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Or sign in manually:</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={onShowRegister}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Register your dealership
              </button>
            </p>
            
            {/* Super Admin Access Link */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onShowSuperAdmin}
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Platform Administrator Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;