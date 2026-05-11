import type { Insight, Memory, GrowthRecord, Pattern } from '@/types';
import { generateId } from '@/utils/id';

export class InsightEngine {
  private static instance: InsightEngine;

  private constructor() {}

  static getInstance(): InsightEngine {
    if (!InsightEngine.instance) {
      InsightEngine.instance = new InsightEngine();
    }
    return InsightEngine.instance;
  }

  generateAssociations(memory: Memory, allMemories: Memory[]): Omit<Insight, 'id' | 'generatedAt'>[] {
    const insights: Omit<Insight, 'id' | 'generatedAt'>[] = [];

    const relatedMemories = allMemories.filter(
      (m) => memory.relatedIds.includes(m.id)
    );

    if (relatedMemories.length > 0) {
      const mostRecent = relatedMemories[0];
      insights.push({
        content: `你之前提到过"${mostRecent.content.substring(0, 30)}..."，现在又有新的想法，它们之间可能有联系`,
        type: 'association',
        relatedMemoryIds: [memory.id, mostRecent.id],
        viewed: false,
        priority: 'medium',
      });
    }

    const sameDayMemories = allMemories.filter((m) => {
      if (m.id === memory.id) return false;
      const d1 = new Date(m.createdAt);
      const d2 = new Date(memory.createdAt);
      return (
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
      );
    });

    if (sameDayMemories.length > 0) {
      insights.push({
        content: `今天你已经记录了 ${sameDayMemories.length + 1} 条想法，这是一个很有收获的日子！`,
        type: 'summary',
        relatedMemoryIds: [memory.id, ...sameDayMemories.map((m) => m.id)],
        viewed: false,
        priority: 'low',
      });
    }

    return insights;
  }

  generatePeriodicSummary(
    period: 'day' | 'week' | 'month',
    memories: Memory[],
    growthRecords: GrowthRecord[]
  ): Omit<Insight, 'id' | 'generatedAt'> | null {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const periodMemories = memories.filter(
      (m) => new Date(m.createdAt) >= startDate
    );

    if (periodMemories.length === 0) return null;

    const periodRecords = growthRecords.filter(
      (r) => new Date(r.date) >= startDate
    );

    const avgMood =
      periodRecords.length > 0
        ? periodRecords.reduce((sum, r) => sum + r.moodScore, 0) /
          periodRecords.length
        : 0.5;

    const moodEmoji = avgMood > 0.7 ? '😊' : avgMood > 0.4 ? '😐' : '😔';

    const summaryContent = {
      day: `今天你记录了 ${periodMemories.length} 条想法${moodEmoji}`,
      week: `这周你记录了 ${periodMemories.length} 条想法，平均心情指数${(avgMood * 100).toFixed(0)}%`,
      month: `这个月你记录了 ${periodMemories.length} 条想法，你的情绪变化曲线显示总体趋势${avgMood > 0.5 ? '积极' : '需要关注'}`,
    };

    return {
      content: summaryContent[period],
      type: 'summary',
      relatedMemoryIds: periodMemories.map((m) => m.id),
      viewed: false,
      priority: 'high',
    };
  }

  generateReminders(memories: Memory[]): Omit<Insight, 'id' | 'generatedAt'>[] {
    const reminders: Omit<Insight, 'id' | 'generatedAt'>[] = [];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oldMemories = memories.filter(
      (m) =>
        new Date(m.createdAt) >= oneWeekAgo &&
        m.metadata.tags?.includes('task')
    );

    if (oldMemories.length > 0) {
      reminders.push({
        content: `你有一周前记录的待办事项，是否已经完成？`,
        type: 'reminder',
        relatedMemoryIds: oldMemories.map((m) => m.id),
        viewed: false,
        priority: 'high',
      });
    }

    const taskMemories = memories.filter((m) => m.type === 'task');
    if (taskMemories.length > 3 && Math.random() > 0.7) {
      reminders.push({
        content: `你已经记录了 ${taskMemories.length} 个待办目标，继续保持专注！`,
        type: 'reminder',
        relatedMemoryIds: taskMemories.slice(0, 3).map((m) => m.id),
        viewed: false,
        priority: 'low',
      });
    }

    return reminders;
  }

  detectGrowthPatterns(growthRecords: GrowthRecord[]): Pattern[] {
    const patterns: Pattern[] = [];

    if (growthRecords.length < 7) return patterns;

    const recentRecords = growthRecords.slice(0, 7);
    const moodScores = recentRecords.map((r) => r.moodScore);

    const avgMood =
      moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;

    if (avgMood > 0.7) {
      patterns.push({
        id: generateId(),
        type: 'mood_trend',
        description: '近期情绪状态良好',
        evidence: ['最近一周平均心情指数较高', '生活状态积极'],
        detectedAt: new Date(),
      });
    } else if (avgMood < 0.4) {
      patterns.push({
        id: generateId(),
        type: 'mood_trend',
        description: '近期可能需要更多关注自己的情绪',
        evidence: ['最近情绪指数偏低', '建议多与朋友交流'],
        detectedAt: new Date(),
      });
    }

    const increasingDays = this.countConsecutiveIncreasing(moodScores);
    if (increasingDays >= 3) {
      patterns.push({
        id: generateId(),
        type: 'growth_milestone',
        description: `情绪连续${increasingDays}天上升`,
        evidence: ['呈现积极向上的趋势', '值得继续保持'],
        detectedAt: new Date(),
      });
    }

    const totalMemories = growthRecords.reduce(
      (sum, r) => sum + r.memoryCount,
      0
    );
    const avgDaily = totalMemories / growthRecords.length;

    if (avgDaily > 2) {
      patterns.push({
        id: generateId(),
        type: 'activity_pattern',
        description: '记录习惯良好',
        evidence: [`平均每天记录 ${avgDaily.toFixed(1)} 条`],
        detectedAt: new Date(),
      });
    }

    return patterns;
  }

  private countConsecutiveIncreasing(scores: number[]): number {
    let count = 0;
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[i - 1]) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  generateWelcomeInsight(): Omit<Insight, 'id' | 'generatedAt'> {
    return {
      content: '欢迎来到同舟！这里是你终生的思维伴侣。我会记住你说的每一句话，见证你的每一次成长。有什么想分享的，随时告诉我~',
      type: 'summary',
      relatedMemoryIds: [],
      viewed: false,
      priority: 'high',
    };
  }

  generateFirstMemoryInsight(): Omit<Insight, 'id' | 'generatedAt'> {
    return {
      content: '太好了，你开始记录了！每一条分享都是你成长的印记，我会好好珍藏它们。',
      type: 'summary',
      relatedMemoryIds: [],
      viewed: false,
      priority: 'medium',
    };
  }
}

export const insightEngine = InsightEngine.getInstance();
