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
  Loader2,
  CheckCircle,
  UserCheck,
  Crown
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading, error } = useAuthStore();
  const { addNotification } = useAppStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    agree_terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Password validation
  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  // Password match validation
  useEffect(() => {
    if (formData.confirm_password) {
      setPasswordsMatch(formData.password === formData.confirm_password);
    }
  }, [formData.password, formData.confirm_password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match. Please check and try again.',
      });
      return;
    }

    // Check password strength
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordValid) {
      addNotification({
        type: 'error',
        title: 'Weak Password',
        message: 'Please ensure your password meets all security requirements.',
      });
      return;
    }

    // Check terms agreement
    if (!formData.agree_terms) {
      addNotification({
        type: 'error',
        title: 'Terms Required',
        message: 'Please agree to the terms and conditions to continue.',
      });
      return;
    }
    
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
      });

      addNotification({
        type: 'success',
        title: 'Welcome to Lab Notebook!',
        message: 'Your account has been created successfully.',
      });
      
      router.push('/dashboard');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error instanceof Error ? error.message : 'Please check your information and try again.',
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

  const getPasswordStrengthColor = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount <= 2) return 'bg-red-500';
    if (validCount <= 3) return 'bg-yellow-500';
    if (validCount <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount <= 2) return 'Weak';
    if (validCount <= 3) return 'Fair';
    if (validCount <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <Microscope className="w-10 h-10 text-lab-primary" />
            <span className="text-2xl font-bold text-gray-900">Lab Notebook</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join the Lab 🧪
          </h1>
          <p className="text-gray-600">
            Create your account to start digitizing lab notes
          </p>
        </div>


        {/* Registration Form */}
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
                  <p className="text-sm font-medium text-red-800">Registration Failed</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Choose a unique username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="your.email@university.edu"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Dr. Jane Smith"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
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
                    placeholder="Create a strong password"
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Password Strength:</span>
                      <span className={`text-sm font-medium ${
                        getPasswordStrengthColor().replace('bg-', 'text-')
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries({
                        'At least 8 characters': passwordValidation.length,
                        'Uppercase letter': passwordValidation.uppercase,
                        'Lowercase letter': passwordValidation.lowercase,
                        'Number': passwordValidation.number,
                        'Special character': passwordValidation.special,
                      }).map(([requirement, isValid]) => (
                        <div key={requirement} className="flex items-center space-x-1">
                          <CheckCircle className={`w-3 h-3 ${isValid ? 'text-green-600' : 'text-gray-300'}`} />
                          <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                            {requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`input-field pr-12 ${
                      formData.confirm_password && !passwordsMatch ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirm_password && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agree_terms"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-lab-primary border-gray-300 rounded focus:ring-lab-primary mt-0.5"
                  disabled={isLoading}
                  required
                />
                <label htmlFor="agree_terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-lab-primary hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-lab-primary hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordsMatch || !Object.values(passwordValidation).every(Boolean)}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-lab-primary hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}