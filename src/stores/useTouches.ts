import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import type { Touches } from '@/types';

export const useTouches = defineStore('touches', () => {
  const touchesState = reactive<Touches>({
    shiniesDiscovered: 0,
    spellingClicks: 0,
    toggledAutoPause: false,
    toggledCriesHelper: false,
    toggledDisplayShadows: false,
    toggledInitialsHelper: false,
    toggledLanguage: false,
    toggledShadowHelper: false,
    toggledShinyCharm: false,
    toggledSpelling: false,
    typeShuffleClicks: 0,
  });

  const toggledAutoPause = () => {
    touchesState.toggledAutoPause = true;
  };

  const toggledDisplayShadows = () => {
    touchesState.toggledDisplayShadows = true;
  };

  const toggledLanguage = () => {
    touchesState.toggledLanguage = true;
  };

  const toggledShadowHelper = () => {
    touchesState.toggledShadowHelper = true;
  };

  const toggledSpelling = () => {
    touchesState.toggledSpelling = true;
  };

  const toggledCriesHelper = () => {
    touchesState.toggledCriesHelper = true;
  };

  const toggledInitialsHelper = () => {
    touchesState.toggledInitialsHelper = true;
  };

  const addShinyDiscovered = () => {
    touchesState.shiniesDiscovered += 1;
  };

  const toggledShinyCharm = () => {
    touchesState.toggledShinyCharm = true;
  };

  const toggledTypeShuffle = (usedTypeShuffle: boolean) => {
    if (usedTypeShuffle) {
      touchesState.typeShuffleClicks += 1;
    }
  };

  const setTouchesState = (touches: Partial<Touches>) => {
    Object.assign(touchesState, touches);
  };

  return {
    addShinyDiscovered,
    setTouchesState,
    toggledAutoPause,
    toggledCriesHelper,
    toggledDisplayShadows,
    toggledInitialsHelper,
    toggledLanguage,
    toggledShadowHelper,
    toggledShinyCharm,
    toggledSpelling,
    toggledTypeShuffle,
    touchesState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTouches, import.meta.hot));
}
