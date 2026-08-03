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

  let nextGenIndex = 0;

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

  const getNextGen = (): GenerationInfo | null => {
    const nextGen = Array.from(currentGenState.gens)[nextGenIndex];
    if (!nextGen) return null;

    nextGenIndex = (nextGenIndex + 1) % currentGenState.gens.size;
    return gens[nextGen];
  };

  const clearCurrentGens = () => {
    currentGenState.gens.clear();
  };

  return {
    clearCurrentGens,
    currentGenState,
    getCurrentGens,
    getNextGen,
    setCurrentGens,
    toggleGen,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentGen, import.meta.hot));
}
