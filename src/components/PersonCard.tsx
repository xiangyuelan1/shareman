import React from 'react';
import { User } from 'lucide-react';
import type { Person } from '@/types';
import { formatRelativeTime } from '@/utils/date';

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="flex items-start space-x-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(212, 165, 116, 0.2)' }}
        >
          {person.avatar ? (
            <img
              src={person.avatar}
              alt={person.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl" style={{ color: 'var(--primary)' }}>
              {person.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {person.name}
          </h3>
          {person.description && (
            <p
              className="text-sm truncate mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {person.description}
            </p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>记忆 {person.memoryIds.length} 条</span>
            <span>首次出现 {formatRelativeTime(person.firstSeen)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            最后出现 {formatRelativeTime(person.lastSeen)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(123, 158, 137, 0.2)', color: 'var(--accent)' }}
          >
            重要关系
          </span>
        </div>
      </div>
    </div>
  );
};
