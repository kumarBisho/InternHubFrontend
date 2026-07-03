import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';
import authService from '../services/authService';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrors({ general: 'Invalid or missing reset token' });
        setValidating(false);
        return;
      }

      try {
        await authService.validateResetToken(token);
        setTokenValid(true);
      } catch (err: any) {
        setErrors({ general: err || 'Invalid or expired reset token' });
        setTokenValid(false);
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        throw new Error('Invalid token');
      }

      await authService.resetPassword(token, formData.password, formData.confirmPassword);
      setResetSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrors({
        general: err || 'Failed to reset password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <>
        <SEOHead
          title="Reset Password - InternHub"
          description="Reset your InternHub password"
          keywords={['reset', 'password', 'account']}
        />
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl mb-4">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-purple-600"></div>
            </div>
            <p className="text-white text-lg font-semibold">Validating your request...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Reset Password - InternHub"
        description="Reset your InternHub password"
        keywords={['reset', 'password', 'account']}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
                <span className="text-white text-xl font-bold">IH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Reset Password
              </h2>
              <p className="text-gray-600 mt-3 text-sm">
                Enter a new password to regain access to your account
              </p>
            </div>

            {!tokenValid ? (
              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 font-semibold mb-2">Invalid or Expired Link</p>
                  <p className="text-red-600 text-sm mb-4">{errors.general}</p>
                  <Link
                    to="/login"
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : resetSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-center">
                  <div className="text-green-600 font-bold text-2xl mb-2">✓</div>
                  <p className="text-green-700 font-semibold mb-2">Password Reset Successful!</p>
                  <p className="text-green-600 text-sm mb-4">
                    Your password has been reset. Redirecting you to login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.general && (
                  <div className="bg-red-50 border-l-4 border-red-500 px-4 py-4 rounded-lg text-sm">
                    <p className="text-red-700 font-semibold">{errors.general}</p>
                  </div>
                )}

                {/* Email Display */}
                {/* <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">Resetting password for:</p>
                  <p className="text-sm font-semibold text-gray-700">{userEmail}</p>
                </div> */}

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 ${
                        errors.password
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2">⚠ {errors.password}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    Must be at least 8 characters long with uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
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
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? '👁' : '👁‍🗨'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2">⚠ {errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Remember your password?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
