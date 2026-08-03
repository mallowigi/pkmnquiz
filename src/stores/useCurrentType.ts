import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { megaTypes } from '@/data/megaTypes.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { specialTypes } from '@/data/specialTypes.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState';
import type { Type, TypeInfo, SpecialTypeInfo, MegaTypeInfo } from '@/types.ts';

type CurrentTypeState = {
  shuffledType: Type | null;
  currentTypes: Set<Type>;
};

export const useCurrentType = defineStore('currentType', () => {
  const { state } = useState();

  const currentTypeState = reactive<CurrentTypeState>({
    currentTypes: new Set(),
    shuffledType: null,
  });

  let nextTypeIndex = 0;

  const toggleType = (type: Type) => {
    if (currentTypeState.currentTypes.has(type)) {
      currentTypeState.currentTypes.delete(type);
    } else {
      currentTypeState.currentTypes.add(type);
    }
  };

  const setShuffledType = (type: Type | null) => {
    currentTypeState.shuffledType = type;
  };

  const setCurrentTypes = (types: Type[]) => {
    currentTypeState.currentTypes = new Set(types);
  };

  const clearCurrentTypes = () => {
    currentTypeState.currentTypes.clear();
  };

  const getShuffledType = (): TypeInfo | null => {
    if (!currentTypeState.shuffledType) return null;

    const foundType = pokemonTypes[currentTypeState.shuffledType];
    return foundType ?? null;
  };

  const getCurrentTypes = (): TypeInfo[] => {
    return Array.from(currentTypeState.currentTypes).map((type) => pokemonTypes[type]);
  };

  const getNextType = (): TypeInfo | null => {
    const types = getCurrentTypes();
    if (types.length === 0) return null;

    const nextType = types[nextTypeIndex];
    nextTypeIndex = (nextTypeIndex + 1) % types.length;
    return nextType;
  };

  const getSpecialType = (): SpecialTypeInfo => {
    return specialTypes.no;
  };

  const getMegaType = (): MegaTypeInfo => {
    return megaTypes.mega;
  };

  const getCurrentTypeOrSpecial = (): TypeInfo | SpecialTypeInfo | MegaTypeInfo | null => {
    const gameMode = state.gameMode;
    switch (gameMode) {
      case 'special':
        return getSpecialType();
      case 'mega':
        return getMegaType();
      default:
        return getNextType();
    }
  };

  const getSecondaryType = (): TypeInfo | null => {
    const gameMode = state.gameMode;
    if (gameMode === 'special' || gameMode === 'mega') {
      return getNextType();
    }
    return null;
  };

  const setRandomCurrentType = () => {
    const { getRandomRemainingPokemon } = usePokemons();
    const remainingPokemon = getRandomRemainingPokemon();
    if (!remainingPokemon) return;

    let randomType;
    if (!remainingPokemon.secondaryType) {
      randomType = remainingPokemon.primaryType;
      setShuffledType(randomType);
      return;
    }

    randomType = Math.random() < 0.5 ? remainingPokemon.primaryType : remainingPokemon.secondaryType;
    setShuffledType(randomType);
  };

  return {
    clearCurrentTypes,
    currentTypeState,
    getCurrentTypeOrSpecial,
    getCurrentTypes,
    getMegaType,
    getNextType,
    getSecondaryType,
    getShuffledType,
    getSpecialType,
    setCurrentTypes,
    setRandomCurrentType,
    setShuffledType,
    toggleType,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrentType, import.meta.hot));
}
