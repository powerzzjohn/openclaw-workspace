import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';

// 页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CultivatePage from './pages/CultivatePage';
import BaziPage from './pages/BaziPage';
import ChatPage from './pages/ChatPage';
import ProverbPage from './pages/ProverbPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-xiu-dark">
        <div className="w-12 h-12 border-4 border-xiu-gold/20 border-t-xiu-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 公开路由（已登录用户重定向）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-xiu-dark">
        <div className="w-12 h-12 border-4 border-xiu-gold/20 border-t-xiu-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/cultivate" replace />;
  }

  return <>{children}</>;
};

// 应用布局
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-xiu-dark">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

// 路由配置
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 公开页面 */}
      <Route
        path="/"
        element={
          <AppLayout>
            <HomePage />
          </AppLayout>
        }
      />

      {/* 登录/注册（已登录用户重定向） */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AppLayout>
              <LoginPage />
            </AppLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AppLayout>
              <RegisterPage />
            </AppLayout>
          </PublicRoute>
        }
      />

      {/* 受保护页面 */}
      <Route
        path="/cultivate"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CultivatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bazi"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BaziPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proverb"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProverbPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <AppLayout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-xiu-gold mb-4">404</h1>
                <p className="text-gray-400 mb-6">此路不通，道友请回</p>
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-xiu-gold text-xiu-dark rounded-lg font-semibold hover:shadow-gold-glow transition-all"
                >
                  <span>返回首页</span>
                </a>
              </div>
            </div>
          </AppLayout>
        }
      />
    </Routes>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
