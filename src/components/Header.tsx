import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import authService from '../services/authService';
import NotificationBell from './NotificationBell';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('Header - isAuthenticated:', isAuthenticated, 'user:', user);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close role menu if click is outside
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setRoleMenuOpen(false);
      }
      
      // Close profile menu if click is outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get navigation items based on user role
  const getRoleMenuItems = () => {
    if (!user) {
      console.log('No user found');
      return [];
    }
    
    console.log('Current user:', user);
    console.log('User role value:', user.role);
    
    // Handle different role formats (string or number)
    const userRole = String(user.role).toLowerCase();
    console.log('Normalized user role:', userRole);
    
    if (userRole === '1' || userRole === 'admin') {
      return [
        { label: 'Home', icon: '🏠', path: '/dashboard' },
        { label: 'Project Management', icon: '📋', path: '/admin/projects' },
        { label: 'Users', icon: '👥', path: '/users' },
        { label: 'Analytics', icon: '📊', path: '/analytics' },
        { label: 'Collaboration', icon: '🤝', path: '/collaboration' },
      ];
    } else if (userRole === '2' || userRole === 'manager') {
      return [
        { label: 'Home', icon: '🏠', path: '/dashboard' },
        { label: 'Tasks', icon: '✓', path: '/manager/tasks' },
        { label: 'Users', icon: '👥', path: '/manager/users' },
        { label: 'Analytics', icon: '📈', path: '/analytics' },
        { label: 'Collaboration', icon: '🤝', path: '/collaboration' },
      ];
    } else if (userRole === '3' || userRole === 'mentor') {
      return [
        { label: 'Home', icon: '🏠', path: '/dashboard' },
        { label: 'Task Management', icon: '✓', path: '/tasks' },
        { label: 'Users', icon: '👥', path: '/mentor/interns' },
        { label: 'Collaboration', icon: '🤝', path: '/collaboration' },
      ];
    } else if (userRole === '4' || userRole === 'intern' || !userRole) {
      return [
        { label: 'Home', icon: '🏠', path: '/dashboard' },
        { label: 'Tasks', icon: '✓', path: '/tasks' },
        { label: 'Mentor', icon: '👨‍🏫', path: '/intern/mentor' },
        { label: 'Collaboration', icon: '🤝', path: '/collaboration' },
        { label: 'Feedback', icon: '📝', path: '/intern/feedback' },
      ];
    }
    
    console.log('Unknown role, returning default menu');
    return [
      { label: 'Home', icon: '🏠', path: '/dashboard' },
    ];
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setRoleMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on the server, clear local storage to allow user to get unstuck
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/');
      setProfileDropdownOpen(false);
    }
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Menu Button + Logo */}
          <div className="flex items-center space-x-3">
            {/* Menu Button - Always visible for authenticated users */}
            {(isAuthenticated || authService.getAccessToken()) && (
              <div className="relative group" ref={roleMenuRef}>
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="cursor-pointer flex items-center justify-center w-10 h-10 rounded border-2 border-gray-700 hover:bg-gray-100 transition text-gray-700 font-bold text-lg"
                  title="Navigation Menu"
                >
                  <span>☰</span>
                </button>

                {/* Role-based Menu Dropdown */}
                {roleMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                    {getRoleMenuItems().length > 0 ? (
                      getRoleMenuItems().map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleMenuItemClick(item.path)}
                          className="cursor-pointer w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition flex items-center space-x-3 text-gray-700 hover:text-indigo-600"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">No menu items</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition cursor-pointer"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2">
                <span className="text-white font-bold text-2xl">IH</span>
              </div>
              <span className="hidden sm:inline font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                InternHub
              </span>
            </button>
          </div>

          {/* Middle Section - Navigation for unauthenticated users */}
          {/* {!isAuthenticated && (
            <div className="hidden sm:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 transition font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 transition font-medium">
                Contact
              </a>
            </div>
          )} */}

          {/* Right side - Auth or Profile */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <Link
                to="/search"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition text-gray-700 font-bold text-lg"
                title="Search"
              >
                <span>🔍</span>
              </Link>
            )}

            {/* Notification Bell */}
            {isAuthenticated && user && (
              <NotificationBell />
            )}
            
            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="cursor-pointer flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="hidden sm:inline text-gray-700 font-medium">
                    {user.firstName}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      {/* <p className="text-sm text-gray-600">{user.email}</p> */}
                      <p className="text-xs text-indigo-600 font-medium mt-1">
                        {user.role || 'User'}
                      </p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center space-x-2"
                    >
                      <span>👤</span>
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>

                <a
                  href="#features"
                  className="hidden sm:inline text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Features
                </a>

                <a
                  href="#about"
                  className="hidden sm:inline text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  About
                </a>

                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Login
                </Link>
                {/* <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition"
                >
                  Sign Up
                </Link> */}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-pointer md:hidden text-gray-700 hover:text-indigo-600"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            {isAuthenticated && user && (
              <>
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase px-2 mb-2">Navigation</p>
                  {getRoleMenuItems().map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        handleMenuItemClick(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className= "cursor-pointer w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center space-x-2 rounded"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {!isAuthenticated && (
              <>
                <a href="#features" className="block text-gray-700 hover:text-indigo-600 font-medium px-2">
                  Features
                </a>
                <a href="#about" className="block text-gray-700 hover:text-indigo-600 font-medium px-2">
                  About
                </a>
                <a href="#contact" className="block text-gray-700 hover:text-indigo-600 font-medium px-2">
                  Contact
                </a>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
