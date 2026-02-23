import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  User, 
  Sparkles, 
  MessageCircle, 
  History, 
  LogOut,
  Menu,
  X,
  Scroll
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home, showAlways: true },
    { path: '/cultivate', label: '修炼大厅', icon: Sparkles, auth: true },
    { path: '/chat', label: 'AI道友', icon: MessageCircle, auth: true },
    { path: '/proverb', label: '每日箴言', icon: Scroll, auth: true },
    { path: '/history', label: '修炼记录', icon: History, auth: true },
    { path: '/profile', label: '个人中心', icon: User, auth: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNavItems = navItems.filter(item => 
    item.showAlways || (item.auth && isAuthenticated)
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-xiu-dark/90 backdrop-blur-md border-b border-xiu-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-xiu-gold to-xiu-goldLight flex items-center justify-center group-hover:shadow-gold-glow transition-all duration-300">
              <Sparkles className="w-5 h-5 text-xiu-dark" />
            </div>
            <span className="xiu-title text-xl hidden sm:block">凡人修仙</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-xiu-gold/20 text-xiu-gold border border-xiu-gold/30'
                      : 'text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                  <span className="text-xiu-gold">{user?.daoName}</span>
                  <span>·</span>
                  <span>{user?.realmName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-400 hover:text-xiu-red hover:bg-xiu-red/10 transition-all duration-300"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-xiu-gold border border-xiu-gold/30 rounded-lg hover:bg-xiu-gold/10 transition-all duration-300"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-xiu-gold text-xiu-dark rounded-lg hover:shadow-gold-glow transition-all duration-300"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-xiu-gold transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-xiu-gold/20 bg-xiu-dark/95">
            <div className="px-4 py-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-xiu-gold/20 text-xiu-gold border border-xiu-gold/30'
                        : 'text-gray-400 hover:text-xiu-gold hover:bg-xiu-gold/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {isAuthenticated && (
                <div className="pt-3 border-t border-xiu-gold/20">
                  <div className="px-4 py-2 text-sm text-gray-400">
                    <span className="text-xiu-gold">{user?.daoName}</span>
                    <span> · {user?.realmName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
