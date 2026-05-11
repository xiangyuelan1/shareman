import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { Insight } from '@/types';

interface InsightBubbleProps {
  insight: Insight;
  onClick?: () => void;
}

function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const diff = now.getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return d.toLocaleDateString('zh-CN');
}

export const InsightBubble: React.FC<InsightBubbleProps> = ({ insight, onClick }) => {
  const priorityColors = {
    high: 'var(--danger)',
    medium: 'var(--warning)',
    low: 'var(--accent)',
  };

  const priorityLabels = {
    high: '重要',
    medium: '提醒',
    low: '洞察',
  };

  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] animate-fade-in"
      style={{
        background: `linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(123, 158, 137, 0.1))`,
        borderLeft: `3px solid ${priorityColors[insight.priority || 'low']}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${priorityColors[insight.priority || 'low']}20`,
              color: priorityColors[insight.priority || 'low'],
            }}
          >
            {priorityLabels[insight.priority || 'low']}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {getRelativeTime(insight.generatedAt)}
        </span>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {insight.content}
      </p>

      {insight.relatedMemoryIds.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            关联 {insight.relatedMemoryIds.length} 条记忆
          </span>
          <ArrowRight
            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--primary)' }}
          />
        </div>
      )}

      {!insight.viewed && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      )}
    </div>
  );
}
