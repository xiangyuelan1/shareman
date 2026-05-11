import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const TagFilter: React.FC = () => {
  const { tags, activeTags, toggleActiveTag, clearActiveTags } = useStore();

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
      <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
        标签:
      </span>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => toggleActiveTag(tag.id)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
            activeTags.includes(tag.id)
              ? 'bg-[var(--primary)] text-[var(--background)]'
              : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/20'
          }`}
        >
          <span>#{tag.name}</span>
          <span className="opacity-70">({tag.count})</span>
        </button>
      ))}
      {activeTags.length > 0 && (
        <button
          onClick={clearActiveTags}
          className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-all"
        >
          <X className="w-3 h-3" />
          <span>清除</span>
        </button>
      )}
    </div>
  );
};
