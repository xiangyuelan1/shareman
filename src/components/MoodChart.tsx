import React from 'react';
import type { GrowthRecord } from '@/types';
import { format } from 'date-fns';

interface MoodChartProps {
  records: GrowthRecord[];
  period?: 'week' | 'month' | 'all';
}

export const MoodChart: React.FC<MoodChartProps> = ({ records, period = 'week' }) => {
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    return records.filter((r) => new Date(r.date) >= startDate);
  };

  const filteredRecords = getFilteredRecords();

  const maxMood = Math.max(...filteredRecords.map((r) => r.moodScore), 0.1);
  const minMood = Math.min(...filteredRecords.map((r) => r.moodScore), 1);
  const avgMood = filteredRecords.length > 0
    ? filteredRecords.reduce((sum, r) => sum + r.moodScore, 0) / filteredRecords.length
    : 0.5;

  const getMoodColor = (score: number) => {
    if (score > 0.7) return 'var(--success)';
    if (score > 0.4) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getMoodLabel = (score: number) => {
    if (score > 0.7) return '良好';
    if (score > 0.4) return '一般';
    return '低落';
  };

  if (filteredRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-secondary)' }}>暂无情绪数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            平均心情指数
          </p>
          <div className="flex items-baseline space-x-2">
            <span 
              className="text-3xl font-bold font-mono"
              style={{ color: getMoodColor(avgMood) }}
            >
              {(avgMood * 100).toFixed(0)}%
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {getMoodLabel(avgMood)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            记录天数
          </p>
          <span 
            className="text-2xl font-bold font-mono"
            style={{ color: 'var(--primary)' }}
          >
            {filteredRecords.length}
          </span>
        </div>
      </div>

      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {filteredRecords.length > 1 && (
            <>
              <path
                d={`
                  M ${100 / (filteredRecords.length - 1) * 0} ${100 - filteredRecords[0].moodScore * 100}
                  ${filteredRecords.map((r, i) => {
                    const x = 100 / (filteredRecords.length - 1) * i;
                    const y = 100 - r.moodScore * 100;
                    return `L ${x} ${y}`;
                  }).join(' ')}
                `}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="0.5"
              />
              <path
                d={`
                  M ${100 / (filteredRecords.length - 1) * 0} ${100 - filteredRecords[0].moodScore * 100}
                  ${filteredRecords.map((r, i) => {
                    const x = 100 / (filteredRecords.length - 1) * i;
                    const y = 100 - r.moodScore * 100;
                    return `L ${x} ${y}`;
                  }).join(' ')}
                  L ${100} 100 L 0 100 Z
                `}
                fill="url(#moodGradient)"
              />
            </>
          )}

          {filteredRecords.map((r, i) => {
            const x = filteredRecords.length === 1 ? 50 : 100 / (filteredRecords.length - 1) * i;
            const y = 100 - r.moodScore * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill={getMoodColor(r.moodScore)}
                className="animate-pulse"
              />
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-1" style={{ color: 'var(--text-secondary)' }}>
          {filteredRecords.length > 0 && (
            <>
              <span>{format(new Date(filteredRecords[0].date), 'M/d')}</span>
              {filteredRecords.length > 1 && (
                <span>{format(new Date(filteredRecords[filteredRecords.length - 1].date), 'M/d')}</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>良好</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>一般</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>低落</span>
        </div>
      </div>
    </div>
  );
};
