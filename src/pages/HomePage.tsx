import React, { useEffect } from 'react';
import { UniversalInput } from '@/components/UniversalInput';
import { MemoryStream } from '@/components/MemoryStream';
import { InsightBubble } from '@/components/InsightBubble';
import { useStore } from '@/store/useStore';
import { insightEngine } from '@/engine/InsightEngine';

export const HomePage: React.FC = () => {
  const { memories, insights, addInsight } = useStore();

  useEffect(() => {
    if (memories.length === 0 && insights.length === 0) {
      addInsight(insightEngine.generateWelcomeInsight());
    } else if (memories.length === 1 && insights.filter(i => i.viewed).length === 0) {
      addInsight(insightEngine.generateFirstMemoryInsight());
    }
  }, [memories.length]);

  const recentInsights = insights.filter((i) => !i.viewed).slice(0, 3);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
                分享此刻
              </h2>
              <UniversalInput />
            </div>

            {recentInsights.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  最新洞察
                </h3>
                <div className="space-y-3">
                  {recentInsights.map((insight) => (
                    <InsightBubble key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                  记忆流
                </h2>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {memories.length} 条记忆
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MemoryStream />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
