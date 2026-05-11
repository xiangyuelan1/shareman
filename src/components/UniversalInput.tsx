import React, { useState } from 'react';
import { Send, Image, Mic, Smile, Link2, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { understandingEngine } from '@/engine/UnderstandingEngine';
import { insightEngine } from '@/engine/InsightEngine';
import { EmotionPicker } from './EmotionPicker';

type InputMode = 'text' | 'image' | 'voice' | 'emotion' | 'link';

export const UniversalInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<InputMode>('text');
  const [selectedMood, setSelectedMood] = useState<number>(0.5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState('');

  const { addMemory, memories, addInsight } = useStore();

  const modeButtons: { mode: InputMode; icon: React.ElementType; label: string }[] = [
    { mode: 'text', icon: FileText, label: '文字' },
    { mode: 'image', icon: Image, label: '图片' },
    { mode: 'voice', icon: Mic, label: '语音' },
    { mode: 'emotion', icon: Smile, label: '情绪' },
    { mode: 'link', icon: Link2, label: '链接' },
  ];

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsTyping(true);

    const parsed = understandingEngine.parse({
      type: mode === 'text' ? 'text' : mode === 'image' ? 'image' : mode === 'emotion' ? 'emotion' : mode === 'link' ? 'link' : 'text',
      content: content,
    });

    const memory = addMemory({
      content: content || (mode === 'emotion' ? `情绪指数: ${selectedMood}` : ''),
      type: mode === 'emotion' ? 'emotion' : mode === 'image' ? 'image' : mode === 'voice' ? 'voice' : mode === 'link' ? 'link' : 'text',
      metadata: {
        tags: parsed.suggestedTags.length > 0 ? parsed.suggestedTags : undefined,
        mood: mode === 'emotion' ? selectedMood : parsed.suggestedMood,
        imageUrl: imageUrl || undefined,
      },
    });

    setTimeout(() => {
      const response = understandingEngine.generateResponse(memory);
      setCurrentInsight(response);
      setShowInsight(true);

      const newInsights = insightEngine.generateAssociations(memory, memories);
      newInsights.forEach((insight) => {
        addInsight(insight);
      });

      setIsTyping(false);
    }, 800);

    setContent('');
    setImageUrl('');
    setSelectedMood(0.5);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center space-x-2 mb-4">
        {modeButtons.map((btn) => (
          <button
            key={btn.mode}
            onClick={() => setMode(btn.mode)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              mode === btn.mode ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: mode === btn.mode ? 'var(--primary)' : 'transparent',
              color: mode === btn.mode ? 'var(--background)' : 'var(--text-secondary)',
            }}
            title={btn.label}
          >
            <btn.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="relative">
        {mode === 'emotion' ? (
          <EmotionPicker value={selectedMood} onChange={setSelectedMood} />
        ) : mode === 'image' ? (
          <div className="space-y-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="输入图片URL或描述..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)]"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="为这张图片写点什么..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)] resize-none"
              rows={3}
            />
          </div>
        ) : mode === 'voice' ? (
          <div className="text-center py-8">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 animate-pulse-soft"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Mic className="w-8 h-8" style={{ color: 'var(--background)' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>点击开始录音</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              语音功能开发中，请先使用文字输入
            </p>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="分享此刻的想法、感受、灵感...任何事情都可以"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)] resize-none"
            rows={4}
            autoFocus
          />
        )}
      </div>

      {showInsight && currentInsight && (
        <div 
          className="mt-4 p-4 rounded-xl animate-slide-up"
          style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}
        >
          <div className="flex items-start space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-lg">🌟</span>
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--primary)' }}>
                同舟回应
              </p>
              <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                {currentInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {isTyping && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="flex space-x-1">
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }}
            />
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            正在理解...
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          按 Enter 发送，Shift + Enter 换行
        </p>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() && !imageUrl && mode !== 'emotion'}
          className="px-6 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center space-x-2"
          style={{ 
            backgroundColor: (content.trim() || imageUrl || mode === 'emotion') ? 'var(--primary)' : 'transparent',
            color: (content.trim() || imageUrl || mode === 'emotion') ? 'var(--background)' : 'var(--text-secondary)'
          }}
        >
          <Send className="w-4 h-4" />
          <span>分享</span>
        </button>
      </div>
    </div>
  );
};
