import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { gens } from '@/data/gens';
import type { Gen, GenerationInfo } from '@/types.ts';

type CurrentGenState = {
  gens: Set<Gen>;
};

export const useCurrentGen = defineStore('currentGen', () => {
  const currentGenState = reactive<CurrentGenState>({
    gens: new Set(),
  });

  const toggleGen = (gen: Gen) => {
    if (currentGenState.gens.has(gen)) {
      currentGenState.gens.delete(gen);
    } else {
      currentGenState.gens.add(gen);
    }
  };

  const setCurrentGens = (gens: Gen[]) => {
    currentGenState.gens = new Set(gens);
  };

  const getCurrentGens = (): GenerationInfo[] | null => {
    const currentGens = currentGenState.gens;
    if (!currentGens || currentGens.size === 0) return null;

    return Array.from(currentGens).map((gen) => gens[gen]);
  };

  const clearCurrentGens = () => {
    currentGenState.gens = new Set();
  };

  return {
    clearCurrentGens,
    currentGenState,
    getCurrentGens,
    setCurrentGens,
    toggleGen,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentGen, import.meta.hot));
}
