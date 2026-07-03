import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { validateForm } from '../utils/validation';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  general?: string;
}

const ROLE_OPTIONS = [
  { id: 4, name: 'Intern' },
  { id: 3, name: 'Mentor' },
  { id: 2, name: 'Manager' },
  { id: 1, name: 'Admin' },
];

const getPasswordStrength = (password: string) => {
  if (!password) return { level: 0, text: 'None', color: 'bg-gray-300' };
  if (password.length < 6) return { level: 1, text: 'Weak', color: 'bg-red-500' };
  if (password.length < 12) return { level: 2, text: 'Fair', color: 'bg-yellow-500' };
  return { level: 3, text: 'Strong', color: 'bg-green-500' };
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roleId: 0, // Default to unselected
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const actualValue = name === 'roleId' ? parseInt(value, 10) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: actualValue,
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
    
    const validationErrors = validateForm(formData, 'register');
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.roleId
      );
      alert('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (error) {
      alert("Registration failed. Please try again.");
      setErrors({
        general: typeof error === 'string' ? error : 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl mb-4">
              <span className="text-white text-xl font-bold">IH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-600 mt-3 text-sm">
              Join InternHub and get started today
            </p>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-medium">Error</p>
              <p>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="group mb-6">
              <label htmlFor="roleId" className="block text-sm font-semibold text-gray-700 mb-2">
                Select Your Role
              </label>
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                  errors.roleId
                    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                }`}
              >
                <option value="0">Select your role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>{errors.roleId}
                </p>
              )}
            </div>

            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name Field */}
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                    errors.firstName
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>{errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                    errors.lastName
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>{errors.lastName}
                  </p>
                )}
              </div>
            </div>

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
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                <div className="absolute right-3 top-3 text-gray-400"></div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>{errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
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
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.color === 'bg-red-500' ? 'text-red-500' :
                      passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>{errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 bg-gray-50 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>{errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
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

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-700 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-green-600 hover:text-teal-600 transition duration-300 inline-flex items-center gap-1"
              >
                Sign in
                <span>→</span>
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>By creating an account, you agree to our Terms of Service</p>
          </div> */}
        </div>

        {/* Trust Badges */}
        {/* <div className="mt-6 flex justify-center gap-4 text-white/70 text-xs">
          <span className="flex items-center gap-1">✓ Free</span>
          <span className="flex items-center gap-1">✓ Easy</span>
          <span className="flex items-center gap-1">✓ Safe</span>
        </div> */}
      </div>
    </div>
  );
}
