import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export function useAutoSave() {
  const memories = useStore((state) => state.memories);
  const persons = useStore((state) => state.persons);
  const insights = useStore((state) => state.insights);
  const growthRecords = useStore((state) => state.growthRecords);
  const tags = useStore((state) => state.tags);

  const lastSaveRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const currentState = JSON.stringify({
      memories,
      persons,
      insights,
      growthRecords,
      tags,
    });

    if (lastSaveRef.current === currentState) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      lastSaveRef.current = currentState;
      console.debug('[AutoSave] Data saved to localStorage');
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [memories, persons, insights, growthRecords, tags]);

  return {
    lastSaveTime: lastSaveRef.current,
  };
}
