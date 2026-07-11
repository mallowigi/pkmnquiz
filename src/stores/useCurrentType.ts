import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { megaTypes } from '@/data/megaTypes.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { specialTypes } from '@/data/specialTypes.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState';
import type { Type } from '@/types.ts';

type CurrentTypeState = {
  currentType: Type | null;
};

export const useCurrentType = defineStore('currentType', () => {
  const { state } = useState();

  const currentTypeState = reactive<CurrentTypeState>({
    currentType: null,
  });

  const setCurrentType = (type: Type | null) => {
    currentTypeState.currentType = type;
  };

  const clearCurrentType = () => {
    currentTypeState.currentType = null;
  };

  const getCurrentType = () => {
    if (!currentTypeState.currentType) return null;

    const foundType = pokemonTypes[currentTypeState.currentType];
    return foundType ?? null;
  };

  const getSpecialType = () => {
    return specialTypes.no;
  };

  const getMegaType = () => {
    return megaTypes.mega;
  };

  const getCurrentTypeOrSpecial = () => {
    const gameMode = state.gameMode;
    switch (gameMode) {
      case 'special':
        return getSpecialType();
      case 'mega':
        return getMegaType();
      default:
        return getCurrentType();
    }
  };

  const setRandomCurrentType = () => {
    const { getRandomRemainingPokemon } = usePokemons();
    const remainingPokemon = getRandomRemainingPokemon();
    if (!remainingPokemon) return;

    let randomType;
    if (!remainingPokemon.secondaryType) {
      randomType = remainingPokemon.primaryType;
      setCurrentType(randomType);
      return;
    }

    randomType = Math.random() < 0.5 ? remainingPokemon.primaryType : remainingPokemon.secondaryType;
    setCurrentType(randomType);
  };

  return {
    clearCurrentType,
    currentTypeState,
    getCurrentType,
    getCurrentTypeOrSpecial,
    getMegaType,
    getSpecialType,
    setCurrentType,
    setRandomCurrentType,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentType, import.meta.hot));
}
