import { defineStore } from 'pinia';
import { reactive } from 'vue';

import type { Skips } from '@/types.ts';

export const useSkips = defineStore('skips', () => {
  const skipsState = reactive<Skips>({
    skipScore: 0,
    skips: 0,
  });

  const SKIP_THRESHOLD = 150;

  const addSkip = () => {
    skipsState.skips += 1;
  };

  const addSkipScore = (score: number) => {
    skipsState.skipScore += score;

    if (skipsState.skipScore / SKIP_THRESHOLD >= 1) {
      addSkip();
      skipsState.skipScore %= SKIP_THRESHOLD;
    }
  };

  const setSkips = (skips: Skips) => {
    skipsState.skips = skips.skips;
    skipsState.skipScore = skips.skipScore;
  };

  const useSkip = () => {
    skipsState.skips -= 1;
  };

  const resetSkips = () => {
    skipsState.skips = 0;
    skipsState.skipScore = 0;
  };

  return {
    addSkip,
    addSkipScore,
    resetSkips,
    setSkips,
    skipsState,
    useSkip,
  };
});
