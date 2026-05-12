import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Brain, Heart, Clock, MessageCircle } from 'lucide-react';
import { xiaozhiService } from '@/services/xiaozhi';
import { authService } from '@/services/auth';
import { useStore } from '@/store/useStore';
import type { Xiaozhi } from '@/types';

export const MirrorPage: React.FC = () => {
  const [xiaozhi, setXiaozhi] = useState<Xiaozhi | null>(null);
  const [observations, setObservations] = useState<string[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const memories = useStore((state) => state.memories);
  const userId = authService.getCurrentUser()?.id || '';

  useEffect(() => {
    const myXiaozhi = xiaozhiService.getXiaozhiByUserId(userId);
    setXiaozhi(myXiaozhi || null);
    generateObservations();
  }, [memories, userId]);

  const generateObservations = () => {
    const obs: string[] = [];
    
    if (memories.length === 0) {
      obs.push('你还没有开始记录，但没关系，我在这里等你。');
      obs.push('当你准备好分享时，我会认真倾听。');
    } else {
      const totalMemories = memories.length;
      obs.push(`你已经记录了 ${totalMemories} 条记忆，这很珍贵。`);
      
      const recentMemories = memories.slice(0, 10);
      const textMemories = recentMemories.filter(m => m.type === 'text');
      const emotionMemories = recentMemories.filter(m => m.type === 'emotion');
      
      if (emotionMemories.length > 0) {
        const avgMood = emotionMemories.reduce((sum, m) => sum + (m.metadata.mood || 0.5), 0) / emotionMemories.length;
        if (avgMood > 0.7) {
          obs.push('最近你的情绪指数偏高，看来生活很顺心。');
        } else if (avgMood < 0.4) {
          obs.push('最近你的情绪有些低落，记得对自己温柔一点。');
        } else {
          obs.push('最近你的情绪比较平稳，这是很好的状态。');
        }
      }
      
      const moodValues = memories
        .filter(m => m.metadata.mood !== undefined)
        .map(m => m.metadata.mood!);
      
      if (moodValues.length > 1) {
        const trend = moodValues[moodValues.length - 1] - moodValues[0];
        if (trend > 0.2) {
          obs.push('你的情绪曲线在上升，这是一个好兆头。');
        } else if (trend < -0.2) {
          obs.push('你的情绪曲线有些下降，不过这很正常。');
        }
      }
      
      const allTags = memories.flatMap(m => m.metadata.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (topTags.length > 0) {
        const tagList = topTags.map(([tag]) => `"${tag}"`).join('、');
        obs.push(`你最常提到的话题是：${tagList}`);
      }
      
      const hours = memories.map(m => new Date(m.createdAt).getHours());
      const eveningMemories = hours.filter(h => h >= 21 || h <= 2).length;
      const morningMemories = hours.filter(h => h >= 6 && h <= 9).length;
      
      if (eveningMemories > memories.length * 0.3) {
        obs.push('你似乎喜欢在夜深人静时记录，那时的思考往往更深刻。');
      }
      if (morningMemories > memories.length * 0.2) {
        obs.push('你是晨型人，喜欢在清晨整理思绪。');
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMemories = memories.filter(m => new Date(m.createdAt) >= today);
      if (todayMemories.length > 0) {
        obs.push('今天你已经记录了一些想法，继续保持~');
      }
    }
    
    setObservations(obs);
  };

  const handleAsk = () => {
    if (!userQuestion.trim()) return;
    
    setIsThinking(true);
    setTimeout(() => {
      const responses = [
        `💭 ${xiaozhi?.name || '我'} 注意到你问的是"${userQuestion}"。这个问题值得深思。`,
        `✨ ${xiaozhi?.name || '我'} 认为，关于"${userQuestion}"，也许答案就在你的记忆里。`,
        `🌟 ${xiaozhi?.name || '我'} 观察到，你提到的"${userQuestion}"，在你最近的记录中出现频率在变化。`,
        `💫 ${xiaozhi?.name || '我'} 无法回答这个问题，但我可以陪你一起思考。`,
      ];
      setAiResponse(responses[Math.floor(Math.random() * responses.length)] + 
        '\n\n这些只是观察，不是建议。你永远有权选择忽略这些话语。');
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Eye className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            AI镜子
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {xiaozhi ? `${xiaozhi.name} 在默默观察你` : '我会默默观察你'}
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <Brain className="w-5 h-5" />
            我的观察
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            这些只是观察，不是评判
          </p>
          <div className="space-y-3">
            {observations.map((obs, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                <Eye className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{obs}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <MessageCircle className="w-5 h-5" />
            和镜子对话
          </h2>
          <div className="space-y-4">
            <textarea
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder={`问${xiaozhi?.name || '我'}一个问题...`}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleAsk}
              disabled={!userQuestion.trim() || isThinking}
              className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              {isThinking ? '思考中...' : '提问'}
            </button>
            {aiResponse && (
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
          <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            镜子不会评判你，它只是忠实映照。
          </p>
        </div>
      </div>
    </div>
  );
};
