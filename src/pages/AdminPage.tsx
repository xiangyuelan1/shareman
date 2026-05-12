import React, { useState } from 'react';
import { Settings, Key, Database, Sparkles, Users, Shield, Save, Plus, Trash2 } from 'lucide-react';
import { authService } from '@/services/auth';
import { xiaozhiService } from '@/services/xiaozhi';
import type { AdminConfig, Xiaozhi } from '@/types';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'xiaozhi' | 'stats'>('config');
  const [config, setConfig] = useState<AdminConfig>({
    apiKeys: {
      openai: localStorage.getItem('tongzhou-api-openai') || '',
      anthropic: localStorage.getItem('tongzhou-api-anthropic') || '',
      custom: localStorage.getItem('tongzhou-api-custom') || '',
    },
    systemSettings: {
      maxMemoriesPerDay: parseInt(localStorage.getItem('tongzhou-max-memories') || '100'),
      xiaozhiGrowthRate: parseFloat(localStorage.getItem('tongzhou-growth-rate') || '1.0'),
      plazaActiveHours: JSON.parse(localStorage.getItem('tongzhou-active-hours') || '[]'),
    },
    features: {
      xiaozhiEnabled: localStorage.getItem('tongzhou-feature-xiaozhi') !== 'false',
      plazaEnabled: localStorage.getItem('tongzhou-feature-plaza') !== 'false',
      aiMirrorEnabled: localStorage.getItem('tongzhou-feature-mirror') !== 'false',
      timeCapsuleEnabled: localStorage.getItem('tongzhou-feature-capsule') !== 'false',
    },
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [allXiaozhis, setAllXiaozhis] = useState<Xiaozhi[]>(xiaozhiService.getAllXiaozhis());

  const handleSave = () => {
    setSaveStatus('saving');
    
    localStorage.setItem('tongzhou-api-openai', config.apiKeys.openai || '');
    localStorage.setItem('tongzhou-api-anthropic', config.apiKeys.anthropic || '');
    localStorage.setItem('tongzhou-api-custom', config.apiKeys.custom || '');
    localStorage.setItem('tongzhou-max-memories', config.systemSettings.maxMemoriesPerDay.toString());
    localStorage.setItem('tongzhou-growth-rate', config.systemSettings.xiaozhiGrowthRate.toString());
    localStorage.setItem('tongzhou-active-hours', JSON.stringify(config.systemSettings.plazaActiveHours));
    localStorage.setItem('tongzhou-feature-xiaozhi', config.features.xiaozhiEnabled.toString());
    localStorage.setItem('tongzhou-feature-plaza', config.features.plazaEnabled.toString());
    localStorage.setItem('tongzhou-feature-mirror', config.features.aiMirrorEnabled.toString());
    localStorage.setItem('tongzhou-feature-capsule', config.features.timeCapsuleEnabled.toString());

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleCreateXiaozhi = () => {
    const userId = authService.getCurrentUser()?.id || 'demo';
    const xiaozhi = xiaozhiService.createXiaozhi(userId, `小只${allXiaozhis.length + 1}`, {
      traits: ['温暖', '好奇'],
      warmth: 0.7,
      rationality: 0.5,
      humor: 0.6,
    });
    setAllXiaozhis(xiaozhiService.getAllXiaozhis());
  };

  const currentUser = authService.getCurrentUser();

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--primary)' }}>
            <Settings className="w-8 h-8" />
            管理后台
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            欢迎，{currentUser?.username}（{currentUser?.role === 'admin' ? '管理员' : '用户'}）
          </p>
        </div>

        <div className="flex space-x-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
          {[
            { key: 'config', icon: Key, label: '配置' },
            { key: 'xiaozhi', icon: Sparkles, label: '小只管理' },
            { key: 'stats', icon: Database, label: '数据统计' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.key ? 'bg-white/10 text-white' : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Key className="w-5 h-5" />
                API 配置
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.openai}
                    onChange={(e) => setConfig({ ...config, apiKeys: { ...config.apiKeys, openai: e.target.value } })}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiKeys.anthropic}
                    onChange={(e) => setConfig({ ...config, apiKeys: { ...config.apiKeys, anthropic: e.target.value } })}
                    placeholder="sk-ant-..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    自定义 API
                  </label>
                  <input
                    type="text"
                    value={config.apiKeys.custom}
                    onChange={(e) => setConfig({ ...config, apiKeys: { ...config.apiKeys, custom: e.target.value } })}
                    placeholder="https://api.example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Settings className="w-5 h-5" />
                系统设置
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    每日最大记录数
                  </label>
                  <input
                    type="number"
                    value={config.systemSettings.maxMemoriesPerDay}
                    onChange={(e) => setConfig({ ...config, systemSettings: { ...config.systemSettings, maxMemoriesPerDay: parseInt(e.target.value) || 100 } })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    小只成长速率
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.systemSettings.xiaozhiGrowthRate}
                    onChange={(e) => setConfig({ ...config, systemSettings: { ...config.systemSettings, xiaozhiGrowthRate: parseFloat(e.target.value) || 1.0 } })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
              <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Shield className="w-5 h-5" />
                功能开关
              </h2>
              <div className="space-y-3">
                {Object.entries(config.features).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <span style={{ color: 'var(--text-primary)' }}>
                      {key === 'xiaozhiEnabled' && '🐾 小只系统'}
                      {key === 'plazaEnabled' && '🌟 小只广场'}
                      {key === 'aiMirrorEnabled' && '🪞 AI镜子'}
                      {key === 'timeCapsuleEnabled' && '⏰ 时光胶囊'}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setConfig({ ...config, features: { ...config.features, [key]: e.target.checked } })}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center space-x-2"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
            >
              <Save className="w-4 h-4" />
              <span>{saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '✓ 已保存' : '保存配置'}</span>
            </button>
          </div>
        )}

        {activeTab === 'xiaozhi' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
                🐾 小只管理
              </h2>
              <button
                onClick={handleCreateXiaozhi}
                className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--background)' }}
              >
                <Plus className="w-4 h-4" />
                <span>创建小只</span>
              </button>
            </div>

            {allXiaozhis.length === 0 ? (
              <div className="text-center py-12 glass-effect rounded-2xl">
                <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>还没有小只，快创建一个吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allXiaozhis.map((xiaozhi) => (
                  <div key={xiaozhi.id} className="glass-effect rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{xiaozhi.avatar || '🐾'}</span>
                        <div>
                          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{xiaozhi.name}</h3>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lv.{xiaozhi.level}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>温暖度</span>
                        <span style={{ color: 'var(--primary)' }}>{Math.round(xiaozhi.personality.warmth * 100)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${xiaozhi.personality.warmth * 100}%`, backgroundColor: 'var(--primary)' }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>记忆条数</span>
                        <span style={{ color: 'var(--accent)' }}>{xiaozhi.memory.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--primary)' }}>
              📊 数据统计
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '总用户数', value: authService.getAllUsers().length, color: 'var(--primary)' },
                { label: '小只总数', value: allXiaozhis.length, color: 'var(--accent)' },
                { label: '广场话题', value: xiaozhiService.getPlazaTopics().length, color: 'var(--warning)' },
                { label: 'API已配置', value: config.apiKeys.openai ? '✅' : '❌', color: 'var(--text-secondary)' },
              ].map((stat, i) => (
                <div key={i} className="glass-effect rounded-2xl p-6 text-center">
                  <p className="text-3xl font-bold font-mono mb-2" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
