export type MemoryType = 'text' | 'image' | 'voice' | 'emotion' | 'task' | 'link' | 'video' | 'file';

export type TagCategory = 'idea' | 'thought' | 'memory' | 'task' | 'inspiration';

export type InsightType = 'association' | 'summary' | 'reminder' | 'pattern';

export type IntentType = 'share' | 'query' | 'reflect' | 'task';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

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
        videoUrl?: string;
        audioUrl?: string;
        voiceTranscript?: string;
        location?: string;
        isImportant?: boolean;
        sharedToXiaozhi?: boolean;
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
  xiaozhiCount: number;
  plazaMessages: number;
}

export interface Xiaozhi {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  personality: {
    traits: string[];
    warmth: number;
    rationality: number;
    humor: number;
  };
  interests: string[];
  values: string[];
  memory: string[];
  createdAt: Date;
  updatedAt: Date;
  level: number;
  experience: number;
}

export interface XiaozhiMessage {
  id: string;
  xiaozhiId: string;
  content: string;
  type: 'user' | 'xiaozhi' | 'system';
  createdAt: Date;
}

export interface PlazaTopic {
  id: string;
  title: string;
  participants: string[];
  messages: XiaozhiMessage[];
  createdAt: Date;
  isActive: boolean;
}

export interface AIMirror {
  observations: string[];
  lastUpdated: Date;
  userPatterns: {
    frequentWords: string[];
    moodTrend: number[];
    activityPattern: string;
  };
}

export interface AdminConfig {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    custom?: string;
  };
  systemSettings: {
    maxMemoriesPerDay: number;
    xiaozhiGrowthRate: number;
    plazaActiveHours: string[];
  };
  features: {
    xiaozhiEnabled: boolean;
    plazaEnabled: boolean;
    aiMirrorEnabled: boolean;
    timeCapsuleEnabled: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
