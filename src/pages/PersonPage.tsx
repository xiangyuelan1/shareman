import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Archive } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Timeline } from '@/components/Timeline';
import { formatDate } from '@/utils/date';

export const PersonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPersonById, memories, getMemoryById } = useStore();

  const person = getPersonById(id || '');

  if (!person) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            未找到该人物
          </h2>
          <button
            onClick={() => navigate('/memories')}
            className="px-4 py-2 rounded-lg bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-all"
          >
            返回记忆中心
          </button>
        </div>
      </div>
    );
  }

  const personMemories = memories.filter((m) => person.memoryIds.includes(m.id));

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/memories')}
          className="flex items-center space-x-2 mb-6 text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>

        <div
          className="p-8 rounded-2xl mb-6"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-start space-x-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(212, 165, 116, 0.2)' }}
            >
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl" style={{ color: 'var(--primary)' }}>
                  {person.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {person.name}
              </h1>
              {person.description && (
                <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {person.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    首次出现: {formatDate(person.firstSeen)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Archive className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {person.memoryIds.length} 条相关记忆
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
            与 {person.name} 的记忆
          </h2>
          <Timeline memories={personMemories} />
        </div>
      </div>
    </div>
  );
};
