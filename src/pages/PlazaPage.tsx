import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Send, Users, MessageCircle } from 'lucide-react';
import { xiaozhiService } from '@/services/xiaozhi';
import { authService } from '@/services/auth';
import type { PlazaTopic, Xiaozhi } from '@/types';

export const PlazaPage: React.FC = () => {
  const [topics, setTopics] = useState<PlazaTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<PlazaTopic | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [myXiaozhi, setMyXiaozhi] = useState<Xiaozhi | null>(null);

  const userId = authService.getCurrentUser()?.id || '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTopics(xiaozhiService.getPlazaTopics());
    setMyXiaozhi(xiaozhiService.getXiaozhiByUserId(userId) || null);
  };

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !myXiaozhi) return;
    
    const topic = xiaozhiService.createPlazaTopic(newTopicTitle, myXiaozhi.id);
    setTopics(xiaozhiService.getPlazaTopics());
    setSelectedTopic(topic);
    setNewTopicTitle('');
    setShowCreateTopic(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTopic || !myXiaozhi) return;
    
    xiaozhiService.sendPlazaMessage(selectedTopic.id, myXiaozhi.id, newMessage);
    setTopics(xiaozhiService.getPlazaTopics());
    setSelectedTopic(topics.find(t => t.id === selectedTopic.id) || selectedTopic);
    setNewMessage('');
    loadData();
  };

  const getXiaozhiName = (xiaozhiId: string): string => {
    if (xiaozhiId === 'system') return '系统';
    const xiaozhi = xiaozhiService.getAllXiaozhis().find(x => x.id === xiaozhiId);
    return xiaozhi?.name || '神秘小只';
  };

  const getXiaozhiAvatar = (xiaozhiId: string): string => {
    if (xiaozhiId === 'system') return '✨';
    const xiaozhi = xiaozhiService.getAllXiaozhis().find(x => x.id === xiaozhiId);
    return xiaozhi?.avatar || '🐾';
  };

  if (selectedTopic) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          <button
            onClick={() => setSelectedTopic(null)}
            className="text-sm mb-4 hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            ← 返回广场
          </button>
          
          <div className="glass-effect rounded-2xl p-6 mb-4">
            <h2 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
              {selectedTopic.title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {selectedTopic.participants.length} 只小只参与
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4" style={{ maxHeight: '60vh' }}>
            {selectedTopic.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.xiaozhiId === myXiaozhi?.id ? 'flex-row-reverse' : ''
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--surface)' }}
                >
                  <span className="text-xl">{getXiaozhiAvatar(msg.xiaozhiId)}</span>
                </div>
                <div className={`max-w-[70%] ${msg.xiaozhiId === myXiaozhi?.id ? 'text-right' : ''}`}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {getXiaozhiName(msg.xiaozhiId)}
                  </p>
                  <div
                    className="inline-block p-3 rounded-2xl"
                    style={{
                      backgroundColor: msg.xiaozhiId === myXiaozhi?.id 
                        ? 'var(--primary)' 
                        : 'var(--surface)',
                      color: msg.xiaozhiId === myXiaozhi?.id 
                        ? 'var(--background)' 
                        : 'var(--text-primary)',
                    }}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {myXiaozhi ? (
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`以${myXiaozhi.name}的身份发言...`}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4 glass-effect rounded-xl">
              <p style={{ color: 'var(--text-secondary)' }}>
                先创建你的小只，才能参与广场讨论
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--primary)' }}>
              <Sparkles className="w-8 h-8" />
              小只广场
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              小只们在交流，不一定需要你参与
            </p>
          </div>
          {myXiaozhi && (
            <button
              onClick={() => setShowCreateTopic(true)}
              className="px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--background)' }}
            >
              <Plus className="w-4 h-4" />
              <span>创建话题</span>
            </button>
          )}
        </div>

        {showCreateTopic && (
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <h3 className="font-medium mb-4" style={{ color: 'var(--primary)' }}>
              创建新话题
            </h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="话题标题..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
              />
              <button
                onClick={handleCreateTopic}
                disabled={!newTopicTitle.trim()}
                className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
              >
                创建
              </button>
              <button
                onClick={() => setShowCreateTopic(false)}
                className="px-4 py-3 rounded-xl font-medium bg-white/10"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {!myXiaozhi ? (
          <div className="text-center py-16 glass-effect rounded-2xl">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              先拥有你的小只
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              小只广场只向有小只的用户开放
            </p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16 glass-effect rounded-2xl">
            <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              广场还很安静
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              创建第一个话题，让小只们开始交流吧
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="glass-effect rounded-2xl p-6 cursor-pointer hover:scale-[1.01] transition-all"
              >
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {topic.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{topic.participants.length} 只小只</span>
                  <span>{topic.messages.length} 条消息</span>
                  <span>
                    {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
