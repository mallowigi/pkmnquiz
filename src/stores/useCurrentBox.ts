import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState';
import type { RegionBox, SpecialType } from '@/types.ts';

type CurrentBoxState = {
  currentBox: RegionBox | null;
  currentSpecialBox: SpecialType | null;
  currentMegaBox: RegionBox | null;
};

export const useCurrentBox = defineStore('currentBox', () => {
  const { state } = useState();

  const currentBoxState = reactive<CurrentBoxState>({
    currentBox: null,
    currentMegaBox: null,
    currentSpecialBox: null,
  });

  const setCurrentBox = (box: RegionBox | null) => {
    currentBoxState.currentBox = box;
  };

  const setCurrentSpecialBox = (box: SpecialType | null) => {
    currentBoxState.currentSpecialBox = box;
  };

  const setCurrentMegaBox = (box: RegionBox | null) => {
    currentBoxState.currentMegaBox = box;
  };

  const clearCurrentBox = () => {
    currentBoxState.currentBox = null;
    currentBoxState.currentSpecialBox = null;
    currentBoxState.currentMegaBox = null;
    state.withBoxShuffle = false;
  };

  const setRandomCurrentBox = () => {
    if (state.gameMode === 'gen') return;

    const { getRandomRemainingPokemon } = usePokemons();
    const remainingPokemon = getRandomRemainingPokemon();
    if (!remainingPokemon) return;

    setCurrentBox(remainingPokemon.box);
    setCurrentSpecialBox(remainingPokemon.specialType);
    setCurrentMegaBox(remainingPokemon.box);
  };

  return {
    clearCurrentBox,
    currentBoxState,
    setCurrentBox,
    setCurrentMegaBox,
    setCurrentSpecialBox,
    setRandomCurrentBox,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentBox, import.meta.hot));
}
