import React from 'react';
import { FileText, Image, Mic, Smile, Link2, CheckSquare, Trash2 } from 'lucide-react';
import type { Memory } from '@/types';
import { getTimePeriod } from '@/utils/date';
import { useStore } from '@/store/useStore';

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
}

const typeIcons: Record<string, React.ElementType> = {
  text: FileText,
  image: Image,
  voice: Mic,
  emotion: Smile,
  link: Link2,
  task: CheckSquare,
};

const typeColors: Record<string, string> = {
  text: '#D4A574',
  image: '#7B9E89',
  voice: '#8B7355',
  emotion: '#E8B86D',
  link: '#6BBF8A',
  task: '#D4726A',
};

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩'];

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onClick }) => {
  const { deleteMemory } = useStore();
  const TypeIcon = typeIcons[memory.type] || FileText;
  const typeColor = typeColors[memory.type] || '#D4A574';

  const getMoodEmoji = () => {
    if (memory.metadata.mood !== undefined) {
      const index = Math.round(memory.metadata.mood * 6);
      return moodEmojis[Math.min(index, moodEmojis.length - 1)];
    }
    return null;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记忆吗？')) {
      deleteMemory(memory.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg cursor-pointer"
      style={{
        backgroundColor: 'var(--surface)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            <TypeIcon className="w-4 h-4" style={{ color: typeColor }} />
          </div>
          <div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {getTimePeriod(memory.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getMoodEmoji() && (
            <span className="text-lg">{getMoodEmoji()}</span>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" style={{ color: 'var(--danger)' }} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {memory.metadata.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={memory.metadata.imageUrl}
              alt="记忆图片"
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <p 
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {memory.content}
        </p>

        {memory.metadata.tags && memory.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memory.metadata.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: 'rgba(212, 165, 116, 0.15)',
                  color: 'var(--primary)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {memory.relatedIds.length > 0 && (
        <div 
          className="mt-3 pt-3 border-t border-white/10 flex items-center space-x-2"
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            相关记忆
          </span>
          <div className="flex -space-x-1">
            {memory.relatedIds.slice(0, 3).map((id, index) => (
              <div
                key={id}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs"
                style={{
                  borderColor: 'var(--surface)',
                  backgroundColor: 'var(--secondary)',
                  zIndex: 3 - index,
                }}
              >
                📝
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
