'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import { 
  Microscope, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const { addNotification } = useAppStore();
  
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: '',
    remember_me: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', {
      username_or_email: formData.username_or_email ? '[PROVIDED]' : '[EMPTY]',
      password: formData.password ? '[PROVIDED]' : '[EMPTY]',
      remember_me: formData.remember_me
    });
    
    try {
      await login(formData);
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully logged in to your account.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'Please check your credentials.',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <Microscope className="w-10 h-10 text-lab-primary" />
            <span className="text-2xl font-bold text-gray-900">Lab Notebook</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back! 🔬
          </h1>
          <p className="text-gray-600">
            Sign in to your lab notebook account
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Login Failed</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username_or_email" className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username_or_email"
                  name="username_or_email"
                  value={formData.username_or_email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your username or email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pr-12"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember_me"
                    name="remember_me"
                    checked={formData.remember_me}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-lab-primary border-gray-300 rounded focus:ring-lab-primary"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember_me" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                
                <Link href="/forgot-password" className="text-sm text-lab-primary hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-lab-primary hover:text-blue-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
}