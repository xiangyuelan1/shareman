import React, { useState, useRef } from 'react';
import { Send, Image, Mic, Smile, Link2, FileText, Upload, X, Camera } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { understandingEngine } from '@/engine/UnderstandingEngine';
import { insightEngine } from '@/engine/InsightEngine';
import { EmotionPicker } from './EmotionPicker';

type InputMode = 'text' | 'image' | 'voice' | 'emotion' | 'link';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export const UniversalInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<InputMode>('text');
  const [selectedMood, setSelectedMood] = useState<number>(0.5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addMemory, memories, addInsight } = useStore();

  const modeButtons: { mode: InputMode; icon: React.ElementType; label: string }[] = [
    { mode: 'text', icon: FileText, label: '文字' },
    { mode: 'image', icon: Image, label: '图片' },
    { mode: 'voice', icon: Mic, label: '语音' },
    { mode: 'emotion', icon: Smile, label: '情绪' },
    { mode: 'link', icon: Link2, label: '链接' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      alert('不支持的图片格式，请上传 JPG、PNG、GIF、WebP 或 SVG 格式的图片');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      alert('不支持的图片格式，请上传 JPG、PNG、GIF、WebP 或 SVG 格式的图片');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl && mode !== 'emotion') return;

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
    setUploadedImage(null);
    setSelectedMood(0.5);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="上传的图片"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={SUPPORTED_IMAGE_TYPES.join(',')}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Camera className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  拖拽图片到此处，或
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  选择图片
                </button>
                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                  支持 JPG、PNG、GIF、WebP、SVG，最大 5MB
                </p>
              </div>
            )}
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
          {mode === 'image' ? '拖拽或点击上传图片' : '按 Enter 发送，Shift + Enter 换行'}
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
