import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, FileText, LayoutDashboard, History, User, LogOut, Terminal } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel border-b border-white/5 sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-xl text-white shadow-lg group-hover:rotate-6 transition-transform">
          <Terminal size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gradient font-sans">
          IntervAI
        </span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive('/dashboard') ? 'bg-white/5 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              to="/resume"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive('/resume') ? 'bg-white/5 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={16} />
              Resume Analyzer
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive('/profile') ? 'bg-white/5 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={16} />
              Profile
            </Link>
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs text-gray-400">Welcome,</span>
              <span className="text-sm font-semibold text-white">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all font-medium"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
