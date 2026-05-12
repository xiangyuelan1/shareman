import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Archive, TrendingUp, Lightbulb, Sparkles, Settings, LogOut, PawPrint, Users, Eye } from 'lucide-react';
import { authService } from '@/services/auth';
import { xiaozhiService } from '@/services/xiaozhi';

interface NavigationProps {
  onLogout?: () => void;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout, isAdmin }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = authService.getCurrentUser();
  const xiaozhi = user ? xiaozhiService.getXiaozhiByUserId(user.id) : null;

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/memories', icon: Archive, label: '记忆' },
    { to: '/xiaozhi', icon: PawPrint, label: '小只', emoji: xiaozhi?.avatar },
    { to: '/plaza', icon: Users, label: '广场' },
    { to: '/mirror', icon: Eye, label: '镜子' },
    { to: '/growth', icon: TrendingUp, label: '成长' },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 glass-effect border-b border-white/5"
      style={{ backgroundColor: 'rgba(26, 26, 29, 0.95)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <NavLink to="/" className="flex items-center space-x-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-xl font-semibold hidden sm:block" style={{ color: 'var(--primary)' }}>
                同舟
              </span>
            </NavLink>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`
                  }
                  style={({ isActive }) => 
                    isActive ? { backgroundColor: 'rgba(212, 165, 116, 0.15)' } : {}
                  }
                >
                  {item.emoji ? (
                    <span className="text-lg">{item.emoji}</span>
                  ) : (
                    <item.icon className="w-4 h-4" />
                  )}
                  <span className="hidden lg:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-white/20' : 'hover:bg-white/10'
                  }`
                }
                style={{ 
                  backgroundColor: 'rgba(212, 165, 116, 0.2)',
                  color: 'var(--primary)',
                }}
                title="管理后台"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">管理</span>
              </NavLink>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
                >
                  {user?.username?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block text-sm" style={{ color: 'var(--text-primary)' }}>
                  {user?.username}
                </span>
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-2 z-50"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.username}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {user?.email}
                    </p>
                    {user?.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}>
                        管理员
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 transition-all"
                      style={{ color: 'var(--primary)' }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>管理后台</span>
                    </NavLink>
                  )}
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-white/10 transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden pb-2">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                    isActive ? '' : ''
                  }`
                }
                style={({ isActive }) => 
                  isActive 
                    ? { color: 'var(--primary)' } 
                    : { color: 'var(--text-secondary)' }
                }
              >
                {item.emoji ? (
                  <span className="text-xl">{item.emoji}</span>
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
                <span className="text-xs">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
