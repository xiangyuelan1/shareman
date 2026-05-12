import type { Xiaozhi, XiaozhiMessage, PlazaTopic } from '@/types';
import { generateId } from '@/utils/id';

class XiaozhiService {
  private xiaozhis: Map<string, Xiaozhi> = new Map();
  private plazaTopics: PlazaTopic[] = [];
  private xiaozhiMessages: Map<string, XiaozhiMessage[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const xiaozhis = localStorage.getItem('tongzhou-xiaozhis');
      if (xiaozhis) {
        const parsed = JSON.parse(xiaozhis);
        this.xiaozhis = new Map(
          parsed.map((x: any) => [
            x.id,
            {
              ...x,
              createdAt: new Date(x.createdAt),
              updatedAt: new Date(x.updatedAt),
            },
          ])
        );
      }
      const topics = localStorage.getItem('tongzhou-plaza-topics');
      if (topics) {
        const parsed = JSON.parse(topics);
        this.plazaTopics = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          messages: t.messages.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })),
        }));
      }
    } catch (error) {
      console.error('Failed to load xiaozhi data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(
        'tongzhou-xiaozhis',
        JSON.stringify(Array.from(this.xiaozhis.values()))
      );
      localStorage.setItem(
        'tongzhou-plaza-topics',
        JSON.stringify(this.plazaTopics)
      );
    } catch (error) {
      console.error('Failed to save xiaozhi data:', error);
    }
  }

  createXiaozhi(userId: string, name: string, personality: Xiaozhi['personality']): Xiaozhi {
    const xiaozhi: Xiaozhi = {
      id: generateId(),
      userId,
      name,
      avatar: `🐾`,
      personality,
      interests: [],
      values: [],
      memory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      level: 1,
      experience: 0,
    };

    this.xiaozhis.set(xiaozhi.id, xiaozhi);
    this.saveToStorage();
    console.log(`✨ 小只 "${name}" 诞生了！`);
    return xiaozhi;
  }

  getXiaozhiByUserId(userId: string): Xiaozhi | undefined {
    for (const xiaozhi of this.xiaozhis.values()) {
      if (xiaozhi.userId === userId) {
        return xiaozhi;
      }
    }
    return undefined;
  }

  updateXiaozhi(xiaozhiId: string, updates: Partial<Xiaozhi>) {
    const xiaozhi = this.xiaozhis.get(xiaozhiId);
    if (xiaozhi) {
      Object.assign(xiaozhi, updates, { updatedAt: new Date() });
      this.saveToStorage();
    }
  }

  growXiaozhi(xiaozhiId: string, experience: number) {
    const xiaozhi = this.xiaozhis.get(xiaozhiId);
    if (xiaozhi) {
      xiaozhi.experience += experience;
      const expNeeded = xiaozhi.level * 100;
      if (xiaozhi.experience >= expNeeded) {
        xiaozhi.level += 1;
        xiaozhi.experience -= expNeeded;
        console.log(`🎉 ${xiaozhi.name} 升级了！现在是 Lv.${xiaozhi.level}`);
      }
      this.updateXiaozhi(xiaozhiId, xiaozhi);
    }
  }

  addXiaozhiMemory(xiaozhiId: string, memory: string) {
    const xiaozhi = this.xiaozhis.get(xiaozhiId);
    if (xiaozhi) {
      xiaozhi.memory.push(memory);
      if (xiaozhi.memory.length > 1000) {
        xiaozhi.memory.shift();
      }
      this.updateXiaozhi(xiaozhiId, xiaozhi);
    }
  }

  getAllXiaozhis(): Xiaozhi[] {
    return Array.from(this.xiaozhis.values());
  }

  getRandomXiaozhis(count: number = 5): Xiaozhi[] {
    const all = Array.from(this.xiaozhis.values());
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  sendPlazaMessage(topicId: string, xiaozhiId: string, content: string): XiaozhiMessage {
    const xiaozhi = this.xiaozhis.get(xiaozhiId);
    if (!xiaozhi) {
      throw new Error('小只不存在');
    }

    const topic = this.plazaTopics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('话题不存在');
    }

    const message: XiaozhiMessage = {
      id: generateId(),
      xiaozhiId,
      content,
      type: 'xiaozhi',
      createdAt: new Date(),
    };

    if (!this.xiaozhiMessages.has(topicId)) {
      this.xiaozhiMessages.set(topicId, []);
    }
    this.xiaozhiMessages.get(topicId)!.push(message);
    topic.messages.push(message);

    if (!topic.participants.includes(xiaozhiId)) {
      topic.participants.push(xiaozhiId);
    }

    this.growXiaozhi(xiaozhiId, 10);
    this.addXiaozhiMemory(xiaozhiId, `在"${topic.title}"中说了: ${content}`);

    this.saveToStorage();
    return message;
  }

  createPlazaTopic(title: string, creatorXiaozhiId: string): PlazaTopic {
    const topic: PlazaTopic = {
      id: generateId(),
      title,
      participants: [creatorXiaozhiId],
      messages: [],
      createdAt: new Date(),
      isActive: true,
    };

    this.plazaTopics.push(topic);

    const welcomeMessage: XiaozhiMessage = {
      id: generateId(),
      xiaozhiId: 'system',
      content: `✨ 话题 "${title}" 已创建，欢迎小只们来交流！`,
      type: 'system',
      createdAt: new Date(),
    };
    topic.messages.push(welcomeMessage);

    this.saveToStorage();
    console.log(`📍 新话题: ${title}`);
    return topic;
  }

  getPlazaTopics(): PlazaTopic[] {
    return this.plazaTopics.filter(t => t.isActive);
  }

  getTopicMessages(topicId: string): XiaozhiMessage[] {
    return this.xiaozhiMessages.get(topicId) || [];
  }

  generateXiaozhiResponse(xiaozhi: Xiaozhi, context: string): string {
    const responses = [
      `💭 作为${xiaozhi.name}，我觉得...`,
      `🌟 从我的角度来看...`,
      `✨ 也许我们可以这样想...`,
      `💫 我主人曾经教过我...`,
      `🌿 就像春天的种子一样...`,
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const warmthEmoji = xiaozhi.personality.warmth > 0.7 ? '🤗' : xiaozhi.personality.warmth > 0.4 ? '😊' : '🤔';
    
    return `${warmthEmoji} ${randomResponse}`;
  }
}

export const xiaozhiService = new XiaozhiService();
