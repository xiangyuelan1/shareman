export type MemoryType = 'text' | 'image' | 'voice' | 'emotion' | 'task' | 'link';

export type TagCategory = 'idea' | 'thought' | 'memory' | 'task' | 'inspiration';

export type InsightType = 'association' | 'summary' | 'reminder' | 'pattern';

export type IntentType = 'share' | 'query' | 'reflect' | 'task';

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    tags?: string[];
    persons?: string[];
    mood?: number;
    source?: string;
    imageUrl?: string;
  };
  relatedIds: string[];
}

export interface Person {
  id: string;
  name: string;
  description: string;
  memoryIds: string[];
  firstSeen: Date;
  lastSeen: Date;
  avatar?: string;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  count: number;
  color?: string;
}

export interface Insight {
  id: string;
  content: string;
  type: InsightType;
  relatedMemoryIds: string[];
  generatedAt: Date;
  viewed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface GrowthRecord {
  id: string;
  date: Date;
  moodScore: number;
  summary: string;
  milestones: string[];
  memoryCount: number;
}

export interface Entity {
  type: 'person' | 'place' | 'concept' | 'emotion';
  value: string;
  confidence: number;
}

export interface ParsedContent {
  text: string;
  entities: Entity[];
  suggestedTags: string[];
  suggestedMood?: number;
  intent: IntentType;
}

export interface UserInput {
  type: MemoryType;
  content: string;
  metadata?: Partial<Memory['metadata']>;
}

export interface Pattern {
  id: string;
  type: 'mood_trend' | 'activity_pattern' | 'growth_milestone';
  description: string;
  evidence: string[];
  detectedAt: Date;
}

export interface StorageStats {
  totalMemories: number;
  totalPersons: number;
  totalInsights: number;
  streakDays: number;
  mostUsedTags: Tag[];
  moodAverage: number;
  memoriesThisWeek: number;
}
