import React from 'react';
import { TrendingUp, Flame, Trophy, Target, Zap, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { MoodChart } from '@/components/MoodChart';
import { formatDate } from '@/utils/date';

export const GrowthPage: React.FC = () => {
  const { growthRecords, memories, getStorageStats } = useStore();
  const stats = getStorageStats();

  const achievements = [
    {
      icon: Flame,
      title: '连续记录',
      value: `${stats.streakDays}天`,
      color: '#D4A574',
      description: '持续记录的习惯',
    },
    {
      icon: Trophy,
      title: '总记忆数',
      value: `${stats.totalMemories}`,
      color: '#7B9E89',
      description: '每一条都是成长',
    },
    {
      icon: Target,
      title: '本周记录',
      value: `${stats.memoriesThisWeek}`,
      color: '#6BBF8A',
      description: '继续保持',
    },
    {
      icon: Zap,
      title: '活跃洞察',
      value: `${stats.totalInsights}`,
      color: '#E8B86D',
      description: '智慧的火花',
    },
  ];

  const getRecentMilestones = () => {
    return growthRecords
      .filter((r) => r.milestones && r.milestones.length > 0)
      .flatMap((r) => r.milestones.map((m) => ({ milestone: m, date: r.date })))
      .slice(0, 5);
  };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--primary)' }}>
            成长档案
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            见证你的每一步成长
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              style={{
                backgroundColor: 'var(--surface)',
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <h3 className="text-2xl font-bold font-mono mb-1" style={{ color: 'var(--text-primary)' }}>
                {item.value}
              </h3>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                  情绪曲线
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  过去一周的心情变化
                </p>
              </div>
              <Calendar className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <MoodChart records={growthRecords} period="week" />
          </div>

          <div
            className="p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                  里程碑
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  重要的成长时刻
                </p>
              </div>
              <Trophy className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>

            {getRecentMilestones().length > 0 ? (
              <div className="space-y-3">
                {getRecentMilestones().map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-white/5"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        {item.milestone}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>
                  记录里程碑，见证成长
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="p-6 rounded-2xl"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                成长趋势
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                30天内的记录趋势
              </p>
            </div>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="h-64">
            <MoodChart records={growthRecords} period="month" />
          </div>
        </div>
      </div>
    </div>
  );
};
