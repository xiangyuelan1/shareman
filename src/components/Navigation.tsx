import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Archive, TrendingUp, Lightbulb, Sparkles, User, LogOut, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { authService } from '@/services/auth';

interface NavigationProps {
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const memories = useStore((state) => state.memories);
  const insights = useStore((state) => state.insights);
  
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const streakDays = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const hasRecord = memories.some((m) => {
        const memDate = new Date(m.createdAt);
        return memDate.toDateString() === checkDate.toDateString();
      });
      if (hasRecord) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [memories]);

  const unreadInsights = React.useMemo(
    () => insights.filter((i) => !i.viewed).length,
    [insights]
  );

  const navItems = [
    { to: '/', icon: Home, label: '同舟空间' },
    { to: '/memories', icon: Archive, label: '记忆中心' },
    { to: '/growth', icon: TrendingUp, label: '成长档案' },
    { to: '/insights', icon: Lightbulb, label: '洞察反馈', badge: unreadInsights },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav 
      className="sticky top-0 z-50 glass-effect border-b border-white/5"
      style={{ backgroundColor: 'rgba(26, 26, 29, 0.9)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center animate-breathe"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 
                className="font-serif text-xl font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                同舟
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                你的终生思维伴侣
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => 
                  isActive ? { backgroundColor: 'rgba(212, 165, 116, 0.15)' } : {}
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span 
                    className="ml-1 px-2 py-0.5 text-xs rounded-full"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: 'var(--background)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <span style={{ color: 'var(--text-secondary)' }}>记忆</span>
                <span 
                  className="font-mono font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  {memories.length}
                </span>
              </div>
              <div 
                className="w-px h-4 bg-white/10"
              />
              <div className="flex items-center space-x-1">
                <span style={{ color: 'var(--text-secondary)' }}>连续</span>
                <span 
                  className="font-mono font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  {streakDays}天
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pl-4 border-l border-white/10">
              <div className="hidden sm:flex items-center space-x-2">
                {isAdmin && (
                  <div 
                    className="flex items-center space-x-1 px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(212, 165, 116, 0.2)' }}
                  >
                    <Shield className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--primary)' }}>管理员</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {user?.username || user?.email || '用户'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all hover:bg-white/10"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden pb-2 px-4">
        <div className="flex justify-around">
          {navItems.map((item) => (
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
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-3 h-3 text-xs rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--primary)',
                      color: 'var(--background)',
                      fontSize: '8px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
