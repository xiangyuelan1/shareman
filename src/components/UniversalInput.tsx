import React, { useState, useRef, useEffect } from 'react';
import { Mic, Camera, Video, X, StopCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { understandingEngine } from '@/engine/UnderstandingEngine';
import { insightEngine } from '@/engine/InsightEngine';
import { xiaozhiService } from '@/services/xiaozhi';
import { authService } from '@/services/auth';

// 模拟语音转文字（实际生产中可使用 SpeechRecognition API 或第三方服务）
const mockSpeechToText = () => {
  const phrases = [
    '今天天气真好，心情很愉快',
    '我刚才突然想到一个很棒的想法',
    '今天的工作很有成就感',
    '和朋友聊得很开心，感谢今天',
    '记录一下此刻的平静与美好',
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

export const UniversalInput: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  const longPressTimerRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addMemory, memories, addInsight } = useStore();
  const userId = authService.getCurrentUser()?.id || '';

  // 处理长按逻辑
  const handleMouseDown = () => {
    longPressTimerRef.current = window.setTimeout(() => {
      startRecording();
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    longPressTimerRef.current = window.setTimeout(() => {
      startRecording();
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
  };

  // 开始/停止录音
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(true);
    
    // 模拟语音转文字
    setTimeout(() => {
      const text = mockSpeechToText();
      setRecordedText(text);
      setIsProcessing(false);
      setShowOptions(true);
    }, 1500);
  };

  // 处理拍照/视频
  const handleCameraTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    
    if (timeSinceLastTap < 300) {
      // 双击 - 录视频
      alert('视频录制功能开发中...');
    } else {
      // 单击 - 拍照
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
      }
    }
    setLastTapTime(now);
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      saveMemory('image', result);
    };
    reader.readAsDataURL(file);
  };

  // 保存记忆
  const saveMemory = async (type: 'voice' | 'image', content: string) => {
    const parsed = understandingEngine.parse({
      type: type === 'voice' ? 'text' : 'image',
      content: type === 'voice' ? content : '图片记录',
    });

    const memory = addMemory({
      content: type === 'voice' ? content : '📷 拍照记录',
      type: type === 'voice' ? 'voice' : 'image',
      metadata: {
        tags: parsed.suggestedTags.length > 0 ? parsed.suggestedTags : undefined,
        mood: parsed.suggestedMood,
        imageUrl: type === 'image' ? content : undefined,
        voiceTranscript: type === 'voice' ? content : undefined,
      },
    });

    // 给小只增加经验
    const xiaozhi = xiaozhiService.getXiaozhiByUserId(userId);
    if (xiaozhi) {
      xiaozhiService.growXiaozhi(xiaozhi.id, 5);
      xiaozhiService.addXiaozhiMemory(xiaozhi.id, type === 'voice' ? content : '记录了一张照片');
    }

    setTimeout(() => {
      const response = understandingEngine.generateResponse(memory);
      const newInsights = insightEngine.generateAssociations(memory, memories);
      newInsights.forEach((insight) => addInsight(insight));
    }, 800);

    setShowOptions(false);
    setRecordedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-effect rounded-2xl p-6 animate-fade-in">
      {/* 两个大按钮 */}
      {!showOptions && !isRecording && !isProcessing && (
        <div className="grid grid-cols-2 gap-4">
          {/* 录音按钮 */}
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border-2 border-dashed hover:border-solid"
            style={{
              backgroundColor: 'rgba(212, 165, 116, 0.1)',
              borderColor: 'var(--primary)',
            }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <Mic className="w-8 h-8" style={{ color: 'var(--background)' }} />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                按住说话
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                长按录音，自动转文字
              </p>
            </div>
          </button>

          {/* 拍照/视频按钮 */}
          <button
            onClick={handleCameraTap}
            className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border-2 border-dashed hover:border-solid"
            style={{
              backgroundColor: 'rgba(123, 158, 137, 0.1)',
              borderColor: 'var(--accent)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
              <Camera className="w-8 h-8" style={{ color: 'var(--background)' }} />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                拍照记录
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                点击拍照，双击录视频
              </p>
            </div>
          </button>
        </div>
      )}

      {/* 录音中状态 */}
      {isRecording && (
        <div className="text-center py-8">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse-soft"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <StopCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <p className="text-2xl font-mono mb-2" style={{ color: 'var(--text-primary)' }}>
            {formatTime(recordingTime)}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            松开结束录音
          </p>
        </div>
      )}

      {/* 处理中状态 */}
      {isProcessing && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            正在转文字...
          </p>
        </div>
      )}

      {/* 录音结果确认 */}
      {showOptions && recordedText && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
            <p style={{ color: 'var(--text-primary)' }}>
              "{recordedText}"
            </p>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setShowOptions(false);
                setRecordedText('');
              }}
              className="flex-1 py-3 rounded-xl font-medium border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4 inline mr-2" />
              取消
            </button>
            <button
              onClick={() => saveMemory('voice', recordedText)}
              className="flex-1 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!showOptions && !isRecording && !isProcessing && (
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
          两个简单的方式记录你的生活
        </p>
      )}
    </div>
  );
};
