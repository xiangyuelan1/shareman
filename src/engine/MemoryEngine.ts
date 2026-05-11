import type { Memory, Person } from '@/types';
import { understandingEngine } from './UnderstandingEngine';

export class MemoryEngine {
  private static instance: MemoryEngine;

  private constructor() {}

  static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  store(memory: Memory, allMemories: Memory[]): Memory {
    const relatedIds = this.findRelatedIds(memory, allMemories);
    
    return {
      ...memory,
      relatedIds,
    };
  }

  findRelated(memoryId: string, memories: Memory[]): Memory[] {
    const memory = memories.find((m) => m.id === memoryId);
    if (!memory) return [];

    return memory.relatedIds
      .map((id) => memories.find((m) => m.id === id))
      .filter((m): m is Memory => m !== undefined);
  }

  findByTimeRange(
    start: Date,
    end: Date,
    memories: Memory[]
  ): Memory[] {
    return memories.filter((m) => {
      const date = new Date(m.createdAt);
      return date >= start && date <= end;
    });
  }

  findByTag(tagName: string, memories: Memory[]): Memory[] {
    return memories.filter((m) => m.metadata.tags?.includes(tagName));
  }

  findByPerson(personName: string, memories: Memory[]): Memory[] {
    return memories.filter((m) => 
      m.metadata.persons?.some(
        (p) => p.toLowerCase() === personName.toLowerCase()
      )
    );
  }

  extractPersons(content: string): string[] {
    const entities = understandingEngine.extractEntities(content);
    
    return entities
      .filter((e) => e.type === 'person')
      .map((e) => e.value);
  }

  extractTags(content: string): string[] {
    return understandingEngine.extractTags(content);
  }

  calculateSimilarity(memory1: Memory, memory2: Memory): number {
    let similarity = 0;

    const tags1 = memory1.metadata.tags || [];
    const tags2 = memory2.metadata.tags || [];
    const commonTags = tags1.filter((t) => tags2.includes(t));
    similarity += (commonTags.length / Math.max(tags1.length, tags2.length, 1)) * 0.4;

    const words1 = new Set(memory1.content.split(/\s+/));
    const words2 = new Set(memory2.content.split(/\s+/));
    const commonWords = [...words1].filter((w) => words2.has(w));
    similarity += (commonWords.length / Math.max(words1.size, words2.size, 1)) * 0.3;

    if (memory1.type === memory2.type) {
      similarity += 0.2;
    }

    if (memory1.metadata.mood && memory2.metadata.mood) {
      const moodDiff = Math.abs(memory1.metadata.mood - memory2.metadata.mood);
      similarity += (1 - moodDiff) * 0.1;
    }

    return Math.min(1, similarity);
  }

  private findRelatedIds(memory: Memory, allMemories: Memory[]): string[] {
    const threshold = 0.3;
    const related: { id: string; similarity: number }[] = [];

    for (const other of allMemories) {
      if (other.id === memory.id) continue;

      const similarity = this.calculateSimilarity(memory, other);
      if (similarity >= threshold) {
        related.push({ id: other.id, similarity });
      }
    }

    related.sort((a, b) => b.similarity - a.similarity);
    return related.slice(0, 5).map((r) => r.id);
  }

  generateMemoryNetwork(memories: Memory[]): {
    nodes: Array<{ id: string; label: string; size: number }>;
    edges: Array<{ source: string; target: string; weight: number }>;
  } {
    const nodes = memories.map((m) => ({
      id: m.id,
      label: m.content.substring(0, 20),
      size: Math.max(20, Math.min(60, m.content.length / 5)),
    }));

    const edges: Array<{ source: string; target: string; weight: number }> = [];
    const seenEdges = new Set<string>();

    for (const memory of memories) {
      for (const relatedId of memory.relatedIds) {
        const edgeKey = [memory.id, relatedId].sort().join('-');
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edges.push({
            source: memory.id,
            target: relatedId,
            weight: this.calculateSimilarity(memory, memories.find((m) => m.id === relatedId)!),
          });
        }
      }
    }

    return { nodes, edges };
  }
}

export const memoryEngine = MemoryEngine.getInstance();
