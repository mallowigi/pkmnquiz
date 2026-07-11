import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState';
import type { RegionBox } from '@/types.ts';

type CurrentBoxState = {
  currentBox: RegionBox | null;
};

export const useCurrentBox = defineStore('currentBox', () => {
  const { state } = useState();

  const currentBoxState = reactive<CurrentBoxState>({
    currentBox: null,
  });

  const setCurrentBox = (box: RegionBox | null) => {
    currentBoxState.currentBox = box;
  };

  const clearCurrentBox = () => {
    currentBoxState.currentBox = null;
    state.withBoxShuffle = false;
  };

  const setRandomCurrentBox = () => {
    if (state.gameMode === 'gen') return;

    const { getRandomRemainingPokemon } = usePokemons();
    const remainingPokemon = getRandomRemainingPokemon();
    if (!remainingPokemon) return;

    setCurrentBox(remainingPokemon.box);
  };

  return {
    clearCurrentBox,
    currentBoxState,
    setCurrentBox,
    setRandomCurrentBox,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentBox, import.meta.hot));
}
