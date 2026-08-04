import { useIntervalFn } from '@vueuse/core';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, ref } from 'vue';

import { usePageTitle } from '@/composables/useTitle';
import { gens } from '@/data/gens';
import type { Gen, GenerationInfo } from '@/types.ts';

type CurrentGenState = {
  gens: Set<Gen>;
};

export const useCurrentGen = defineStore('currentGen', () => {
  const { setTitle } = usePageTitle();

  const currentGenState = reactive<CurrentGenState>({
    gens: new Set(),
  });

  const nextGenIndex = ref(0);
  const nextGen = ref<Gen | null>(null);

  // Cycle types of the currentTypes on an interval
  const { pause, resume } = useIntervalFn(() => {
    const gens = Array.from(currentGenState.gens);
    if (gens.length > 0) {
      nextGenIndex.value = (nextGenIndex.value + 1) % gens.length;
      nextGen.value = gens[nextGenIndex.value];
      setTitle();
    }
  }, 15000);

  const startGenCycle = () => {
    resume();
  };

  const stopGenCycle = () => {
    pause();
  };

  const toggleGen = (gen: Gen) => {
    if (currentGenState.gens.has(gen)) {
      currentGenState.gens.delete(gen);
    } else {
      currentGenState.gens.add(gen);
    }
  };

  const setCurrentGens = (gens: Gen[]) => {
    currentGenState.gens = new Set(gens);
    nextGenIndex.value = 0;
    nextGen.value = gens[nextGenIndex.value];
  };

  const getCurrentGens = (): GenerationInfo[] | null => {
    const currentGens = currentGenState.gens;
    if (!currentGens || currentGens.size === 0) return null;

    return Array.from(currentGens).map((gen) => gens[gen]);
  };

  const getNextGen = (): GenerationInfo | null => {
    const currentGens = Array.from(currentGenState.gens);
    if (currentGens.length === 0) return null;

    const nextGen = currentGens[nextGenIndex.value % currentGens.length];
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
    startGenCycle,
    stopGenCycle,
    toggleGen,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentGen, import.meta.hot));
}
