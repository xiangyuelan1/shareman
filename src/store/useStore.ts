import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Memory, Person, Insight, GrowthRecord, Tag, StorageStats, MemoryType } from '@/types';
import { generateId } from '@/utils/id';

interface AppState {
  memories: Memory[];
  persons: Person[];
  insights: Insight[];
  growthRecords: GrowthRecord[];
  tags: Tag[];
  activeTags: string[];
  currentTimeRange: 'all' | 'today' | 'week' | 'month';
  isLoading: boolean;

  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt' | 'relatedIds'>) => Memory;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  getMemoryById: (id: string) => Memory | undefined;

  addPerson: (person: Omit<Person, 'id' | 'memoryIds' | 'firstSeen' | 'lastSeen'>) => void;
  getPersonById: (id: string) => Person | undefined;
  getPersonByName: (name: string) => Person | undefined;

  addInsight: (insight: Omit<Insight, 'id' | 'generatedAt'>) => void;
  markInsightViewed: (id: string) => void;
  deleteInsight: (id: string) => void;

  addGrowthRecord: (record: Omit<GrowthRecord, 'id'>) => void;
  updateGrowthRecord: (id: string, updates: Partial<GrowthRecord>) => void;

  addTag: (tag: Omit<Tag, 'id' | 'count'>) => void;
  incrementTagCount: (tagId: string) => void;
  toggleActiveTag: (tagId: string) => void;
  clearActiveTags: () => void;

  setCurrentTimeRange: (range: AppState['currentTimeRange']) => void;

  getFilteredMemories: () => Memory[];
  getStorageStats: () => StorageStats;
  getRecentInsights: () => Insight[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      memories: [],
      persons: [],
      insights: [],
      growthRecords: [],
      tags: [],
      activeTags: [],
      currentTimeRange: 'all',
      isLoading: false,

      addMemory: (memoryData) => {
        const now = new Date();
        const newMemory: Memory = {
          ...memoryData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          relatedIds: [],
        };

        set((state) => ({
          memories: [newMemory, ...state.memories],
        }));

        if (memoryData.metadata?.tags) {
          const { addTag, incrementTagCount } = get();
          memoryData.metadata.tags.forEach((tagName) => {
            const existingTag = get().tags.find((t) => t.name === tagName);
            if (!existingTag) {
              addTag({ name: tagName, category: 'idea', color: '#D4A574' });
            } else {
              incrementTagCount(existingTag.id);
            }
          });
        }

        const todayRecord = get().growthRecords.find((r) => {
          const recordDate = new Date(r.date);
          return (
            recordDate.getDate() === now.getDate() &&
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
          );
        });

        if (todayRecord) {
          get().updateGrowthRecord(todayRecord.id, {
            memoryCount: todayRecord.memoryCount + 1,
          });
        } else {
          get().addGrowthRecord({
            date: now,
            moodScore: memoryData.metadata?.mood ?? 0.5,
            summary: '',
            milestones: [],
            memoryCount: 1,
          });
        }

        return newMemory;
      },

      updateMemory: (id, updates) => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
          ),
        }));
      },

      deleteMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        }));
      },

      getMemoryById: (id) => {
        return get().memories.find((m) => m.id === id);
      },

      addPerson: (personData) => {
        const newPerson: Person = {
          ...personData,
          id: generateId(),
          memoryIds: [],
          firstSeen: new Date(),
          lastSeen: new Date(),
        };

        set((state) => ({
          persons: [...state.persons, newPerson],
        }));
      },

      getPersonById: (id) => {
        return get().persons.find((p) => p.id === id);
      },

      getPersonByName: (name) => {
        return get().persons.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
      },

      addInsight: (insightData) => {
        const newInsight: Insight = {
          ...insightData,
          id: generateId(),
          generatedAt: new Date(),
        };

        set((state) => ({
          insights: [newInsight, ...state.insights],
        }));
      },

      markInsightViewed: (id) => {
        set((state) => ({
          insights: state.insights.map((i) =>
            i.id === id ? { ...i, viewed: true } : i
          ),
        }));
      },

      deleteInsight: (id) => {
        set((state) => ({
          insights: state.insights.filter((i) => i.id !== id),
        }));
      },

      addGrowthRecord: (recordData) => {
        const newRecord: GrowthRecord = {
          ...recordData,
          id: generateId(),
        };

        set((state) => ({
          growthRecords: [newRecord, ...state.growthRecords],
        }));
      },

      updateGrowthRecord: (id, updates) => {
        set((state) => ({
          growthRecords: state.growthRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      addTag: (tagData) => {
        const newTag: Tag = {
          ...tagData,
          id: generateId(),
          count: 1,
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));
      },

      incrementTagCount: (tagId) => {
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === tagId ? { ...t, count: t.count + 1 } : t
          ),
        }));
      },

      toggleActiveTag: (tagId) => {
        set((state) => ({
          activeTags: state.activeTags.includes(tagId)
            ? state.activeTags.filter((id) => id !== tagId)
            : [...state.activeTags, tagId],
        }));
      },

      clearActiveTags: () => {
        set({ activeTags: [] });
      },

      setCurrentTimeRange: (range) => {
        set({ currentTimeRange: range });
      },

      getFilteredMemories: () => {
        const { memories, activeTags, currentTimeRange } = get();
        let filtered = [...memories];

        if (activeTags.length > 0) {
          filtered = filtered.filter((m) =>
            m.metadata.tags?.some((tag) => activeTags.includes(tag))
          );
        }

        const now = new Date();
        switch (currentTimeRange) {
          case 'today':
            filtered = filtered.filter((m) => {
              const date = new Date(m.createdAt);
              return date.toDateString() === now.toDateString();
            });
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter((m) => new Date(m.createdAt) >= weekAgo);
            break;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter((m) => new Date(m.createdAt) >= monthAgo);
            break;
        }

        return filtered;
      },

      getStorageStats: () => {
        const { memories, persons, insights, tags, growthRecords } = get();

        const moodAverage =
          growthRecords.length > 0
            ? growthRecords.reduce((sum, r) => sum + r.moodScore, 0) /
              growthRecords.length
            : 0;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const memoriesThisWeek = memories.filter(
          (m) => new Date(m.createdAt) >= weekAgo
        ).length;

        const sortedTags = [...tags].sort((a, b) => b.count - a.count);
        const mostUsedTags = sortedTags.slice(0, 5);

        let streakDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const hasRecord = growthRecords.some((r) => {
            const recordDate = new Date(r.date);
            return recordDate.toDateString() === checkDate.toDateString();
          });

          if (hasRecord) {
            streakDays++;
          } else if (i > 0) {
            break;
          }
        }

        return {
          totalMemories: memories.length,
          totalPersons: persons.length,
          totalInsights: insights.length,
          streakDays,
          mostUsedTags,
          moodAverage,
          memoriesThisWeek,
        };
      },

      getRecentInsights: () => {
        return get().insights.filter((i) => !i.viewed).slice(0, 10);
      },
    }),
    {
      name: 'tongzhou-storage',
      partialize: (state) => ({
        memories: state.memories,
        persons: state.persons,
        insights: state.insights,
        growthRecords: state.growthRecords,
        tags: state.tags,
      }),
    }
  )
);
