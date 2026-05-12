import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Heart, MessageCircle, Edit2, Star } from 'lucide-react';
import { xiaozhiService } from '@/services/xiaozhi';
import { authService } from '@/services/auth';
import type { Xiaozhi } from '@/types';

export const XiaozhiPage: React.FC = () => {
  const [xiaozhi, setXiaozhi] = useState<Xiaozhi | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [xiaozhiName, setXiaozhiName] = useState('');
  const [xiaozhiTraits, setXiaozhiTraits] = useState<string[]>(['温暖', '好奇']);
  const [xiaozhiWarmth, setXiaozhiWarmth] = useState(0.7);
  const userId = authService.getCurrentUser()?.id || '';

  useEffect(() => {
    const myXiaozhi = xiaozhiService.getXiaozhiByUserId(userId);
    setXiaozhi(myXiaozhi || null);
    if (!myXiaozhi) {
      setShowCreate(true);
    }
  }, [userId]);

  const handleCreateXiaozhi = () => {
    if (!xiaozhiName.trim()) return;
    
    const newXiaozhi = xiaozhiService.createXiaozhi(userId, xiaozhiName, {
      traits: xiaozhiTraits,
      warmth: xiaozhiWarmth,
      rationality: 0.5,
      humor: 0.6,
    });
    setXiaozhi(newXiaozhi);
    setShowCreate(false);
  };

  const traitOptions = ['温暖', '好奇', '理性', '幽默', '感性', '沉稳', '活泼', '内向'];

  if (!xiaozhi && !showCreate) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (showCreate || !xiaozhi) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-effect rounded-2xl p-8">
          <div className="text-center mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
              创建你的小只
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              小只是你的人格投影，会陪你一起成长
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                给小只起个名字
              </label>
              <input
                type="text"
                value={xiaozhiName}
                onChange={(e) => setXiaozhiName(e.target.value)}
                placeholder="例如：小舟、忆忆..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                性格特点（可多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {traitOptions.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => {
                      if (xiaozhiTraits.includes(trait)) {
                        setXiaozhiTraits(xiaozhiTraits.filter(t => t !== trait));
                      } else if (xiaozhiTraits.length < 4) {
                        setXiaozhiTraits([...xiaozhiTraits, trait]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      xiaozhiTraits.includes(trait)
                        ? 'bg-[var(--primary)] text-[var(--background)]'
                        : 'bg-white/10 text-[var(--text-primary)]'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                温暖度：{Math.round(xiaozhiWarmth * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={xiaozhiWarmth}
                onChange={(e) => setXiaozhiWarmth(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full"
                style={{
                  background: `linear-gradient(to right, var(--danger) 0%, var(--warning) 50%, var(--success) 100%)`,
                }}
              />
            </div>

            <button
              onClick={handleCreateXiaozhi}
              disabled={!xiaozhiName.trim()}
              className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              ✨ 创造小只
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 animate-breathe"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <span className="text-6xl">{xiaozhi.avatar}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            {xiaozhi.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Lv.{xiaozhi.level} · 经验 {xiaozhi.experience}/{xiaozhi.level * 100}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-effect rounded-2xl p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--danger)' }} />
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {Math.round(xiaozhi.personality.warmth * 100)}%
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>温暖度</p>
          </div>
          <div className="glass-effect rounded-2xl p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--warning)' }} />
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {xiaozhi.memory.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>记忆条数</p>
          </div>
          <div className="glass-effect rounded-2xl p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {xiaozhi.personality.traits.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>性格标签</p>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
            性格特点
          </h2>
          <div className="flex flex-wrap gap-2">
            {xiaozhi.personality.traits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'rgba(212, 165, 116, 0.2)', color: 'var(--primary)' }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
            最近的记忆
          </h2>
          {xiaozhi.memory.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              还没有记忆，继续记录吧~
            </p>
          ) : (
            <div className="space-y-3">
              {xiaozhi.memory.slice(-5).reverse().map((mem, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{mem}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
