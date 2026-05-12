import React, { useState } from 'react';
import { Sparkles, Lock, User } from 'lucide-react';
import { authService } from '@/services/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await authService.register(email, password, username || email.split('@')[0]);
      } else {
        await authService.login({ email, password });
      }
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@admin');
    setPassword('admin123456');
    setIsLoading(true);
    try {
      await authService.login({ email: 'admin@admin', password: 'admin123456' });
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
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
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            你的终生思维伴侣 · 小只的家园
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <div className="flex mb-6 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                !isRegister ? 'bg-white/10 text-white' : 'text-gray-500'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                isRegister ? 'bg-white/10 text-white' : 'text-gray-500'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="给自己起个名字"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                邮箱
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              {isLoading ? '处理中...' : isRegister ? '创建账户' : '登录'}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleDemoLogin}
                className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] text-sm"
                style={{ backgroundColor: 'rgba(123, 158, 137, 0.2)', color: 'var(--accent)' }}
              >
                🚀 演示账户登录（admin@admin）
              </button>
              <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
                管理员：admin@admin / admin123456
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          在这里，没有观众，只有镜子。
        </p>
      </div>
    </div>
  );
};
