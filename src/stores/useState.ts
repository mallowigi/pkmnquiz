import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { useShuffles } from '@/composables/useShuffles.ts';
import { useTouches } from '@/stores/useTouches.ts';
import type { State, GameMode, Mode } from '@/types';

export const useState = defineStore('state', () => {
  const state = reactive<State>({
    gameMode: null,
    isDark: false,
    mode: 'normal',
    withBoxShuffle: false,
    withCriesShuffle: false,
    withShadows: false,
    withTypeShuffle: false,
  });

  const { toggledDisplayShadows, toggledTypeShuffle, toggledBoxShuffle } = useTouches();

  const setGameMode = (mode: GameMode | null) => {
    const { updateShuffles } = useShuffles();
    state.gameMode = mode;

    if (mode === 'special' || mode === 'types' || mode === 'mega') {
      state.mode = 'normal';
    }

    if (mode === 'types') {
      state.withTypeShuffle = false;
    }

    updateShuffles();
  };

  const setMode = (mode: Mode) => {
    state.mode = mode;
  };

  const toggleDarkMode = () => {
    state.isDark = !state.isDark;
  };

  const setDarkMode = (isDark: boolean) => {
    state.isDark = isDark;
  };

  const displayShadows = () => {
    state.withShadows = true;
    toggledDisplayShadows();
  };

  const hideShadows = () => {
    state.withShadows = false;
    toggledDisplayShadows();
  };

  const setTypeShuffle = (withTypeShuffle: boolean) => {
    state.withTypeShuffle = withTypeShuffle;
    toggledTypeShuffle(withTypeShuffle);
  };

  const setBoxShuffle = (withBoxShuffle: boolean) => {
    state.withBoxShuffle = withBoxShuffle;
    toggledBoxShuffle(withBoxShuffle);
  };

  const setCriesShuffle = (withCriesShuffle: boolean) => {
    state.withCriesShuffle = withCriesShuffle;
  };

  const setState = (newState: Partial<State>) => {
    Object.assign(state, newState);
  };

  const resetState = () => {
    Object.assign(state, {
      gameMode: null,
    });
  };

  const setGameOver = () => {
    state.gameMode = null;
  };

  return {
    displayShadows,
    hideShadows,
    resetState,
    setBoxShuffle,
    setCriesShuffle,
    setDarkMode,
    setGameMode,
    setGameOver,
    setMode,
    setState,
    setTypeShuffle,
    state,
    toggleDarkMode,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useState, import.meta.hot));
}
