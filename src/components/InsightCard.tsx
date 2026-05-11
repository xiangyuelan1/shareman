import React from 'react';
import { Sparkles, Check, Trash2, Clock } from 'lucide-react';
import type { Insight } from '@/types';
import { formatRelativeTime } from '@/utils/date';
import { useStore } from '@/store/useStore';

interface InsightCardProps {
  insight: Insight;
  onClick?: () => void;
}

const typeConfig = {
  association: { icon: '🔗', label: '关联', color: 'var(--accent)' },
  summary: { icon: '📝', label: '总结', color: 'var(--primary)' },
  reminder: { icon: '⏰', label: '提醒', color: 'var(--warning)' },
  pattern: { icon: '📊', label: '模式', color: 'var(--success)' },
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onClick }) => {
  const { markInsightViewed, deleteInsight, getMemoryById } = useStore();
  const config = typeConfig[insight.type];

  const handleMarkViewed = (e: React.MouseEvent) => {
    e.stopPropagation();
    markInsightViewed(insight.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定删除这条洞察吗？')) {
      deleteInsight(insight.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
        insight.viewed ? 'bg-white/5 border-white/10' : 'bg-white/10 border-[var(--primary)]/30'
      }`}
      style={{
        backgroundColor: insight.viewed ? 'var(--surface)' : 'rgba(212, 165, 116, 0.08)',
      }}
    >
      {!insight.viewed && (
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
              }}
            >
              {config.label}
            </span>
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {formatRelativeTime(insight.generatedAt)}
        </span>
      </div>

      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
        {insight.content}
      </p>

      {insight.relatedMemoryIds.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-1 mb-2">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              关联记忆
            </span>
          </div>
          <div className="space-y-1">
            {insight.relatedMemoryIds.slice(0, 2).map((id) => {
              const memory = getMemoryById(id);
              return memory ? (
                <p
                  key={id}
                  className="text-xs truncate pl-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  · {memory.content.substring(0, 50)}
                </p>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <button
          onClick={handleMarkViewed}
          disabled={insight.viewed}
          className={`flex items-center space-x-1 text-xs transition-all ${
            insight.viewed ? 'opacity-50 cursor-not-allowed' : 'hover:text-[var(--success)]'
          }`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <Check className="w-3 h-3" />
          <span>{insight.viewed ? '已读' : '标记已读'}</span>
        </button>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 text-xs transition-all hover:text-[var(--danger)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Trash2 className="w-3 h-3" />
          <span>删除</span>
        </button>
      </div>
    </div>
  );
};
