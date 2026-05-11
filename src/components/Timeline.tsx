import React from 'react';
import type { Memory } from '@/types';
import { formatDate, isSameDay } from '@/utils/date';

interface TimelineProps {
  memories: Memory[];
  onMemoryClick?: (memory: Memory) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ memories, onMemoryClick }) => {
  const groupedMemories = memories.reduce((groups, memory) => {
    const date = new Date(memory.createdAt);
    const key = date.toDateString();
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(memory);
    return groups;
  }, {} as Record<string, Memory[]>);

  const sortedDates = Object.keys(groupedMemories).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'var(--primary)',
      emotion: 'var(--warning)',
      task: 'var(--danger)',
      idea: 'var(--accent)',
    };
    return colors[type] || 'var(--primary)';
  };

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-secondary)' }}>暂无记忆</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute left-4 top-0 bottom-0 w-px"
        style={{ backgroundColor: 'rgba(212, 165, 116, 0.3)' }}
      />

      <div className="space-y-8">
        {sortedDates.map((dateKey) => {
          const dayMemories = groupedMemories[dateKey];
          const date = new Date(dateKey);
          const isToday = isSameDay(date, new Date());

          return (
            <div key={dateKey} className="relative pl-12">
              <div
                className="absolute left-2 w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: getTypeColor(dayMemories[0].type),
                }}
              />

              <div className="mb-4">
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  {isToday ? '今天' : formatDate(date)}
                </span>
                <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {dayMemories.length} 条记忆
                </span>
              </div>

              <div className="space-y-3">
                {dayMemories.map((memory) => (
                  <div
                    key={memory.id}
                    onClick={() => onMemoryClick?.(memory)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {memory.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getTypeColor(memory.type)}20`,
                          color: getTypeColor(memory.type),
                        }}
                      >
                        {memory.type}
                      </span>
                      {memory.metadata.tags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
