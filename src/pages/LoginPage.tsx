import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success: boolean;
    if (isLogin) {
      success = await login({ email, password });
    } else {
      success = await register(email, password, username);
    }

    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@admin');
    setPassword('admin123456');
    const success = await login({ email: 'admin@admin', password: 'admin123456' });
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 animate-breathe"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            同舟
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            你的终生思维伴侣
          </p>
        </div>

        <div 
          className="p-8 rounded-2xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
            {isLogin ? '登录账号' : '注册账号'}
          </h2>

          {error && (
            <div 
              className="mb-4 p-3 rounded-lg flex items-center space-x-2"
              style={{ backgroundColor: 'rgba(212, 114, 106, 0.1)' }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
              <span className="text-sm" style={{ color: 'var(--danger)' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              {isLoading ? (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--background)', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--background)', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--background)', animationDelay: '300ms' }} />
                </div>
              ) : (
                <>
                  <span>{isLogin ? '登录' : '注册'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm transition-colors hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={handleDemoLogin}
                className="w-full py-2 rounded-lg text-sm transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                演示账号登录 (admin@admin)
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          登录即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};
