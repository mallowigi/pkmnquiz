import { defineStore, acceptHMRUpdate } from 'pinia';

import { boxes } from '@/data/boxes';
import { useCurrentGen } from '@/stores/useCurrentGen';
import type { RegionBoxInfo } from '@/types.ts';

export const useCurrentRegion = defineStore('currentRegion', () => {
  const { getCurrentGens } = useCurrentGen();

  const getCurrentRegions = (): RegionBoxInfo[] => {
    const currentGens = getCurrentGens();
    if (!currentGens) {
      return [];
    }

    const regions = currentGens.map((gen) => {
      const firstBox = gen.boxes?.[0];
      if (!firstBox) {
        return null;
      }

      return boxes[firstBox];
    });

    return regions.filter((region) => region !== null);
  };

  return {
    getCurrentRegions,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentRegion, import.meta.hot));
}
