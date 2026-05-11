import React, { useState, useRef } from 'react';
import { Send, Image, Mic, Smile, Link2, FileText, Upload, File, Database } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { understandingEngine } from '@/engine/UnderstandingEngine';
import { insightEngine } from '@/engine/InsightEngine';
import { dataFormatParser } from '@/services/dataParser';
import { EmotionPicker } from './EmotionPicker';
import type { DataFormat, MemoryType } from '@/types';

type InputMode = 'text' | 'image' | 'voice' | 'emotion' | 'link' | 'file' | 'import';

const SUPPORTED_FILE_TYPES = [
  '.txt', '.json', '.csv', '.md', '.markdown',
  '.xml', '.yaml', '.yml'
];

export const UniversalInput: React.FC = () => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<InputMode>('text');
  const [selectedMood, setSelectedMood] = useState<number>(0.5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<DataFormat>('text');
  const [importedData, setImportedData] = useState<string>('');
  const [previewMemories, setPreviewMemories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addMemory, memories, addInsight } = useStore();

  const modeButtons: { mode: InputMode; icon: React.ElementType; label: string }[] = [
    { mode: 'text', icon: FileText, label: '文字' },
    { mode: 'image', icon: Image, label: '图片' },
    { mode: 'file', icon: File, label: '文件' },
    { mode: 'import', icon: Database, label: '导入' },
    { mode: 'emotion', icon: Smile, label: '情绪' },
    { mode: 'link', icon: Link2, label: '链接' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
      alert('不支持的文件类型，请上传以下格式：' + SUPPORTED_FILE_TYPES.join(', '));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      setMode('import');
      setSelectedFormat(fileExtension.slice(1) as DataFormat);
      handlePreviewImport(text);
    };
    reader.readAsText(file);
  };

  const handlePreviewImport = (text?: string) => {
    const dataToImport = text || content;
    if (!dataToImport.trim()) return;

    const result = dataFormatParser.importData(dataToImport, selectedFormat);
    
    if (result.success) {
      setPreviewMemories(result.memories);
      setImportedData(dataToImport);
    } else {
      setPreviewMemories([]);
      alert(result.errors.join(', '));
    }
  };

  const handleSubmit = async () => {
    if (mode === 'import' && previewMemories.length > 0) {
      previewMemories.forEach((memoryData) => {
        addMemory(memoryData);
      });
      
      setCurrentInsight(`成功导入 ${previewMemories.length} 条记忆！`);
      setShowInsight(true);
      setPreviewMemories([]);
      setImportedData('');
      setContent('');
      return;
    }

    if (!content.trim() && !imageUrl) return;

    setIsTyping(true);

    const parsed = understandingEngine.parse({
      type: mode === 'text' ? 'text' : mode === 'image' ? 'image' : mode === 'emotion' ? 'emotion' : mode === 'link' ? 'link' : 'file' ? 'file' : 'text',
      content: content,
    });

    const memory = addMemory({
      content: content || (mode === 'emotion' ? `情绪指数: ${selectedMood}` : ''),
      type: mode === 'emotion' ? 'emotion' : mode === 'image' ? 'image' : mode === 'voice' ? 'voice' : mode === 'link' ? 'link' : mode === 'file' ? 'file' : 'text',
      metadata: {
        tags: parsed.suggestedTags.length > 0 ? parsed.suggestedTags : undefined,
        mood: mode === 'emotion' ? selectedMood : parsed.suggestedMood,
        imageUrl: imageUrl || undefined,
        fileName: mode === 'file' ? 'uploaded-file' : undefined,
        mimeType: mode === 'file' ? 'text/plain' : undefined,
        dataFormat: selectedFormat,
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
    setImportedData('');
    setPreviewMemories([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && mode !== 'import') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderInputArea = () => {
    switch (mode) {
      case 'emotion':
        return <EmotionPicker value={selectedMood} onChange={setSelectedMood} />;
      
      case 'image':
        return (
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
        );

      case 'file':
        return (
          <div className="text-center py-8">
            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_FILE_TYPES.join(',')}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center space-x-2 mx-auto"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              <Upload className="w-5 h-5" />
              <span>选择文件上传</span>
            </button>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              支持格式: {SUPPORTED_FILE_TYPES.join(', ')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              JSON, CSV, Markdown, XML, YAML 等
            </p>
          </div>
        );

      case 'import':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>数据格式:</span>
              {(['text', 'json', 'csv', 'markdown', 'xml', 'yaml'] as DataFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setSelectedFormat(fmt);
                    if (content) handlePreviewImport();
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedFormat === fmt
                      ? 'bg-[var(--primary)] text-[var(--background)]'
                      : 'bg-white/10 text-[var(--text-primary)]'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="粘贴或输入要导入的数据..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)] resize-none font-mono text-sm"
              rows={6}
            />
            
            <button
              onClick={() => handlePreviewImport()}
              className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-white/10"
              style={{ color: 'var(--primary)' }}
            >
              预览导入
            </button>

            {previewMemories.length > 0 && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(123, 158, 137, 0.1)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                  预览 ({previewMemories.length} 条记忆)
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {previewMemories.slice(0, 5).map((m, i) => (
                    <div key={i} className="text-xs p-2 rounded" style={{ backgroundColor: 'var(--surface)' }}>
                      <p className="truncate" style={{ color: 'var(--text-primary)' }}>{m.content}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        类型: {m.type} | 标签: {m.metadata?.tags?.join(', ') || '无'}
                      </p>
                    </div>
                  ))}
                  {previewMemories.length > 5 && (
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      还有 {previewMemories.length - 5} 条...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="分享此刻的想法、感受、灵感...任何事情都可以"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 transition-all focus:border-[var(--primary)] resize-none"
            rows={4}
            autoFocus
          />
        );
    }
  };

  const canSubmit = () => {
    if (mode === 'import') return previewMemories.length > 0;
    if (mode === 'emotion') return true;
    return content.trim() || imageUrl;
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
        {renderInputArea()}
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
          {mode === 'import' ? '预览后确认导入' : mode === 'file' ? '选择文件自动识别格式' : '按 Enter 发送，Shift + Enter 换行'}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="px-6 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center space-x-2"
          style={{ 
            backgroundColor: canSubmit() ? 'var(--primary)' : 'transparent',
            color: canSubmit() ? 'var(--background)' : 'var(--text-secondary)'
          }}
        >
          <Send className="w-4 h-4" />
          <span>{mode === 'import' ? '导入' : '分享'}</span>
        </button>
      </div>
    </div>
  );
};
