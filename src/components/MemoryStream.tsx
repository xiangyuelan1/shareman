import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { MemoryCard } from './MemoryCard';
import type { Memory } from '@/types';

export const MemoryStream: React.FC = () => {
  const { getFilteredMemories, activeTags, toggleActiveTag, clearActiveTags, tags } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMemories = getFilteredMemories();

  const searchResults = searchQuery
    ? filteredMemories.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredMemories;

  const handleTagToggle = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    if (tag) {
      toggleActiveTag(tag.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索记忆..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)]"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-all ${
              showFilters || activeTags.length > 0 ? 'bg-[var(--primary)] text-[var(--background)]' : 'bg-white/5 text-[var(--text-secondary)]'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {activeTags.length > 0 && (
          <button
            onClick={clearActiveTags}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
            <span>清除筛选</span>
          </button>
        )}
      </div>

      {showFilters && tags.length > 0 && (
        <div
          className="p-4 rounded-xl animate-slide-up"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
            标签筛选
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.name)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  activeTags.includes(tag.id)
                    ? 'bg-[var(--primary)] text-[var(--background)]'
                    : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/20'
                }`}
              >
                #{tag.name} ({tag.count})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <span className="text-4xl">🌊</span>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery ? '没有找到相关记忆' : '还没有任何记忆'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {searchQuery
                ? '尝试其他关键词'
                : '在左侧输入框分享你的第一个想法，开启我们的旅程'}
            </p>
          </div>
        ) : (
          searchResults.map((memory, index) => (
            <div
              key={memory.id}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className="animate-fade-in"
            >
              <MemoryCard memory={memory} />
            </div>
          ))
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            共 {searchResults.length} 条记忆
          </p>
        </div>
      )}
    </div>
  );
};
