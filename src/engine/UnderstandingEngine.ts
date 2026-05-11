import type { ParsedContent, Entity, IntentType, UserInput } from '@/types';

export class UnderstandingEngine {
  private emotionKeywords: Record<string, number> = {
    '开心': 0.9, '快乐': 0.9, '幸福': 0.95, '兴奋': 0.85,
    '平静': 0.6, '放松': 0.7, '期待': 0.75, '感恩': 0.85,
    '不错': 0.6, '还好': 0.4, '普通': 0.3,
    '焦虑': -0.6, '担心': -0.5, '难过': -0.7, '沮丧': -0.75, '失落': -0.65,
    '生气': -0.8, '愤怒': -0.9, '烦躁': -0.6, '压力': -0.65, '疲惫': -0.5,
    '迷茫': -0.5, '困惑': -0.4,
  };

  private tagKeywords: Record<string, string[]> = {
    'idea': ['想法', '灵感', '觉得', '思考', '认为', '观点', '理念', '创意', '点子'],
    'thought': ['感受', '心情', '情绪', '体会', '感悟', '领悟', '明白', '理解'],
    'memory': ['记得', '回忆', '过去', '曾经', '小时候', '那天', '以前', '难忘'],
    'task': ['计划', '待办', '要做', '任务', '目标', '完成', '截止', 'deadline'],
    'inspiration': ['启发', '触动', '感动', '震撼', '惊艳', '美好', '精彩', '棒'],
  };

  private personPatterns: RegExp[] = [
    /(?:跟|和|与|和|给|向|为)\s*([A-Za-z\u4e00-\u9fa5]{2,4})/g,
    /([A-Za-z\u4e00-\u9fa5]{2,4})(?:说|告诉|提到|提醒|帮助|支持|鼓励)/g,
    /(?:我的|认识|朋友|同学|同事|家人|爸妈|父母|老师)\s*([A-Za-z\u4e00-\u9fa5]{2,4})?/g,
  ];

  parse(input: UserInput): ParsedContent {
    const text = input.content;
    
    return {
      text,
      entities: this.extractEntities(text),
      suggestedTags: this.extractTags(text),
      suggestedMood: this.detectEmotion(text),
      intent: this.detectIntent(text),
    };
  }

  detectEmotion(content: string): number {
    let score = 0.5;
    let count = 0;

    for (const [keyword, value] of Object.entries(this.emotionKeywords)) {
      if (content.includes(keyword)) {
        score += value;
        count++;
      }
    }

    if (count === 0) return 0.5;
    
    return Math.max(0, Math.min(1, score / (count + 1)));
  }

  detectIntent(content: string): IntentType {
    const taskKeywords = ['计划', '待办', '要做', '任务', '完成', '开始', '结束'];
    const queryKeywords = ['为什么', '怎么', '如何', '是不是', '是不是', '什么'];
    const reflectKeywords = ['思考', '反思', '感悟', '明白', '理解', '认识'];

    for (const keyword of taskKeywords) {
      if (content.includes(keyword)) return 'task';
    }

    for (const keyword of queryKeywords) {
      if (content.includes(keyword)) return 'query';
    }

    for (const keyword of reflectKeywords) {
      if (content.includes(keyword)) return 'reflect';
    }

    return 'share';
  }

  extractEntities(content: string): Entity[] {
    const entities: Entity[] = [];

    for (const pattern of this.personPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1]?.trim();
        if (name && name.length >= 2 && name.length <= 4) {
          entities.push({
            type: 'person',
            value: name,
            confidence: 0.8,
          });
        }
      }
    }

    return entities;
  }

  extractTags(content: string): string[] {
    const tags: string[] = [];

    for (const [category, keywords] of Object.entries(this.tagKeywords)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          tags.push(keyword);
          break;
        }
      }
    }

    return [...new Set(tags)];
  }

  summarize(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    
    const sentences = content.split(/[。！？!?.]/);
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length <= maxLength) {
        summary += sentence;
      } else {
        break;
      }
    }
    
    return summary || content.substring(0, maxLength) + '...';
  }

  generateResponse(memory: { content: string; type: string }): string {
    const responses: Record<string, string[]> = {
      text: [
        '收到，我已经记住了这一刻',
        '好的，这个想法我帮你收藏',
        '嗯，我理解你的感受',
        '这段记录很有意义，我记住了',
      ],
      emotion: [
        '你的情绪我收到了',
        '我会陪着你',
        '感谢你分享此刻的感受',
        '记住这一刻，我们会一起成长',
      ],
      task: [
        '好的，这是一个重要的计划',
        '我帮你标记了这个任务',
        '期待看到你完成它',
        '记住这个目标了',
      ],
      idea: [
        '很棒的灵感！',
        '这个想法很有意思',
        '好的，我收藏了你的创意',
        '感谢分享这个观点',
      ],
    };

    const typeResponses = responses[memory.type] || responses.text;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  }
}

export const understandingEngine = new UnderstandingEngine();
