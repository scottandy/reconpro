import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Eye, EyeOff, ArrowLeft, Shield, Lock, Mail, Zap, Globe, Users, BarChart3 } from 'lucide-react';

interface SuperAdminLoginProps {
  onBack: () => void;
}

const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ onBack }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 p-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Platform Admin
              <Crown className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-purple-200">Manage the entire ReconPro platform</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg backdrop-blur-sm">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Platform Features */}
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Capabilities</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-medium text-white">All Dealerships</span>
                </div>
                <p className="text-xs text-purple-200">Manage every dealership</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-medium text-white">Analytics</span>
                </div>
                <p className="text-xs text-purple-200">Platform-wide insights</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-medium text-white">Security</span>
                </div>
                <p className="text-xs text-purple-200">System administration</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">Controls</span>
                </div>
                <p className="text-xs text-purple-200">Full system access</p>
              </div>
            </div>
          </div>

          {/* Manual Login Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">Administrator Authentication</h3>
              <p className="text-sm text-purple-200">Enter your platform administrator credentials</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Administrator Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-purple-300"
                  placeholder="admin@reconpro.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Administrator Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent pr-12 text-white placeholder-purple-300"
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border border-purple-500/50 text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Platform
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-200 mb-1">Restricted Access</p>
                <p className="text-xs text-yellow-300">
                  This area is restricted to authorized platform administrators only. All access is logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Credentials Helper */}
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-200 mb-1">Demo Environment</p>
                <p className="text-xs text-blue-300">
                  For demonstration purposes, use: <code className="bg-white/10 px-1 rounded">admin@reconpro.com</code> with password <code className="bg-white/10 px-1 rounded">demo</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;