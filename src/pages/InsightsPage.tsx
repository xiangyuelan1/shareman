import React, { useState } from 'react';
import { Lightbulb, Bell, Sparkles, Archive, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { InsightCard } from '@/components/InsightCard';

type InsightFilter = 'all' | 'unread' | 'association' | 'summary' | 'reminder' | 'pattern';

export const InsightsPage: React.FC = () => {
  const { insights, markInsightViewed, getRecentInsights } = useStore();
  const [filter, setFilter] = useState<InsightFilter>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const filteredInsights = insights.filter((insight) => {
    if (showOnlyUnread && insight.viewed) return false;
    if (filter === 'all') return true;
    return insight.type === filter;
  });

  const unreadCount = insights.filter((i) => !i.viewed).length;

  const filterOptions = [
    { key: 'all', label: '全部', icon: Lightbulb },
    { key: 'unread', label: '未读', icon: Bell, badge: unreadCount },
    { key: 'association', label: '关联', icon: Sparkles },
    { key: 'summary', label: '总结', icon: Archive },
    { key: 'reminder', label: '提醒', icon: Bell },
    { key: 'pattern', label: '模式', icon: Sparkles },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              洞察反馈
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              智慧的火花，温暖的提醒
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: unreadCount > 0 ? 'rgba(212, 165, 116, 0.2)' : 'rgba(123, 158, 137, 0.2)',
                color: unreadCount > 0 ? 'var(--primary)' : 'var(--accent)',
              }}
            >
              {unreadCount} 条未读
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setFilter(option.key as InsightFilter);
                  if (option.key === 'unread') {
                    setShowOnlyUnread(true);
                  } else {
                    setShowOnlyUnread(false);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  filter === option.key
                    ? 'bg-[var(--primary)] text-[var(--background)]'
                    : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/20'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm">{option.label}</span>
                {option.badge !== undefined && option.badge > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: filter === option.key ? 'rgba(0,0,0,0.2)' : 'var(--primary)',
                      color: filter === option.key ? 'white' : 'var(--background)',
                    }}
                  >
                    {option.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => insights.filter((i) => !i.viewed).forEach((i) => markInsightViewed(i.id))}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">全部标为已读</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, index) => (
            <div
              key={insight.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <InsightCard insight={insight} />
            </div>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <Lightbulb className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {filter === 'unread' || showOnlyUnread ? '暂无未读洞察' : '暂无洞察'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'unread' || showOnlyUnread
                ? '你已阅读所有洞察'
                : '继续记录，我会为你生成更多洞察'}
            </p>
          </div>
        )}

        {insights.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              共 {insights.length} 条洞察，已读 {insights.filter((i) => i.viewed).length} 条
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
