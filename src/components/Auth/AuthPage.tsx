import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Lock, User } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
        // After register, switch to login or auto-login (store handles logic, but here we might want to show success)
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch {
      // Error is handled in store and displayed via error state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row transition-colors">
        
        {/* Left Side - Hero */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">LINGUANET AI</h1>
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Master English with your personal AI tutor.
            </h2>
            <p className="text-blue-100 text-lg opacity-90">
              Chat, learn, and improve your skills with real-time feedback and personalized lessons.
            </p>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isLogin ? 'Please enter your details to sign in.' : 'Start your journey with us today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</span>
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Clear errors when switching
                  useAuthStore.setState({ error: null });
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
