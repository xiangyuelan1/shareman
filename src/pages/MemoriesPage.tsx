import React, { useState } from 'react';
import { Archive, Users, Calendar, Grid, List } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { MemoryCard } from '@/components/MemoryCard';
import { Timeline } from '@/components/Timeline';
import { PersonCard } from '@/components/PersonCard';
import { TagFilter } from '@/components/TagFilter';

type ViewMode = 'grid' | 'list' | 'timeline';
type FilterType = 'all' | 'text' | 'emotion' | 'task' | 'idea';

export const MemoriesPage: React.FC = () => {
  const { memories, persons, getFilteredMemories, tags } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<'memories' | 'persons'>('memories');

  const filteredMemories = getFilteredMemories().filter((m) => {
    if (filterType === 'all') return true;
    if (filterType === 'idea') return m.metadata.tags?.includes('idea') || m.metadata.tags?.includes('灵感');
    return m.type === filterType;
  });

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              记忆中心
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              珍藏每一刻，见证成长
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[var(--primary)] text-[var(--background)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-[var(--primary)] text-[var(--background)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-[var(--primary)] text-[var(--background)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('memories')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'memories'
                ? 'bg-white/10 text-white'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>记忆 ({memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('persons')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'persons'
                ? 'bg-white/10 text-white'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>人物 ({persons.length})</span>
          </button>
        </div>

        {activeTab === 'memories' && (
          <>
            <div className="mb-6">
              <TagFilter />
            </div>

            <div className="flex items-center space-x-2 mb-6 overflow-x-auto scrollbar-hide">
              {(['all', 'text', 'emotion', 'task', 'idea'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    filterType === type
                      ? 'bg-[var(--primary)] text-[var(--background)]'
                      : 'bg-white/10 text-[var(--text-primary)] hover:bg-white/20'
                  }`}
                >
                  {type === 'all' ? '全部' : type === 'text' ? '文字' : type === 'emotion' ? '情绪' : type === 'task' ? '待办' : '灵感'}
                </button>
              ))}
            </div>

            {viewMode === 'timeline' ? (
              <Timeline memories={filteredMemories} />
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            )}

            {filteredMemories.length === 0 && (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  暂无记忆
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  去同舟空间分享你的第一个想法吧
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'persons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {persons.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}

        {activeTab === 'persons' && persons.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              暂无人物记录
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              在记忆中出现的人物会被自动记录在这里
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
