import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    daoName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 密码强度检查
  const passwordChecks = {
    length: formData.password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('密码强度不足');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.daoName.length < 2 || formData.daoName.length > 20) {
      setError('道号需要2-20个字符');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.daoName);
      navigate('/cultivate');
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-xiu-dark via-xiu-navy to-xiu-dark">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-xiu-cyan/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-xiu-purple/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-xiu-gold to-xiu-goldLight mb-4">
            <Sparkles className="w-8 h-8 text-xiu-dark" />
          </div>
          <h1 className="text-2xl font-bold xiu-title mb-2">踏上仙途</h1>
          <p className="text-gray-400 text-sm">注册道号，开启修仙之旅</p>
        </div>

        {/* Register Form */}
        <div className="xiu-card rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                道号
              </label>
              <input
                type="text"
                value={formData.daoName}
                onChange={(e) => setFormData({ ...formData, daoName: e.target.value })}
                className="xiu-input"
                placeholder="请输入你的道号"
                required
              />
              <p className="mt-1 text-xs text-gray-500">2-20个字符，可使用中文、英文或数字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="xiu-input"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="xiu-input pr-10"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-xiu-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* 密码强度指示器 */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  {passwordChecks.length ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={passwordChecks.length ? 'text-green-400' : 'text-gray-500'}>至少8个字符</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {passwordChecks.hasLetter ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={passwordChecks.hasLetter ? 'text-green-400' : 'text-gray-500'}>包含字母</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  {passwordChecks.hasNumber ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={passwordChecks.hasNumber ? 'text-green-400' : 'text-gray-500'}>包含数字</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                确认密码
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="xiu-input"
                placeholder="请再次输入密码"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">两次输入的密码不一致</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full py-3 px-4 bg-gradient-to-r from-xiu-gold to-xiu-goldLight text-xiu-dark font-semibold rounded-lg hover:shadow-gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>注册中...</span>
                </>
              ) : (
                <span>注册</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              已有道号？{' '}
              <Link to="/login" className="text-xiu-gold hover:text-xiu-goldLight transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-xiu-gold text-sm transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
