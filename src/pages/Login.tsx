import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';
import authService from '../services/authService';
import { validateForm } from '../utils/validation';
import ForgotPasswordModal from '../components/common/ForgotPasswordModal';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
  details?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, 'login');
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      let errorDetails = '';

      // Check if error is an object with message and details
      if (typeof error === 'object' && error.message) {
        errorMessage = error.message;
        errorDetails = error.details || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setErrors({
        general: errorMessage,
        details: errorDetails,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Login - InternHub"
        description="Sign in to your InternHub account to manage internships"
        keywords={['login', 'sign in', 'internship', 'management']}
      />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10">

          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Cancel login and return to landing page"
            className="cursor-pointer absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition duration-300"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>

          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
              <span className="text-white text-xl font-bold">IH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-3 text-sm">
              Sign in to continue to InternHub
            </p>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div className={`border-l-4 px-4 py-4 rounded-lg mb-6 text-sm ${
              errors.general === 'Account not verified' || 
              errors.general === 'Account pending approval' || 
              errors.general === 'Account inactive'
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              <p className="font-semibold">{errors.general}</p>
              {errors.details && (
                <p className="mt-2 text-sm opacity-90">{errors.details}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                    errors.email
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                <div className="absolute right-3 top-3 text-gray-400"></div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 text-xs font-medium">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="flex items-center justify-between w-full">
            {/* Forgot Password - Left Side */}
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-sm text-indigo-600 hover:text-purple-600 font-semibold transition duration-300"
            >
              Forgot Password?
            </button>

            {/* Sign Up - Right Side */}
            <Link
              to="/register"
              className="text-sm font-semibold text-indigo-600 hover:text-purple-600 transition duration-300"
            >
              Sign Up
            </Link>
          </div>

          {/* Footer Text */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>By signing in, you agree to our Terms of Service</p>
          </div> */}
        </div>
      </div>
    </div>

    {/* Forgot Password Modal */}
    <ForgotPasswordModal
      isOpen={showForgotPasswordModal}
      onClose={() => setShowForgotPasswordModal(false)}
    />
    </>
  );
}
