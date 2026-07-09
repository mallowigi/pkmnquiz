import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { useTouches } from '@/stores/useTouches.ts';
import type { State, GameMode, Mode } from '@/types';

export const useState = defineStore('state', () => {
  const state = reactive<State>({
    gameMode: null,
    isDark: false,
    mode: 'normal',
    withCriesShuffle: false,
    withShadows: false,
    withTypeShuffle: false,
    withBoxShuffle: false,
  });

  const { toggledDisplayShadows, toggledTypeShuffle, toggledBoxShuffle } = useTouches();

  const setGameMode = (mode: GameMode | null) => {
    state.gameMode = mode;

    if (mode === 'special' || mode === 'types' || mode === 'mega') {
      state.mode = 'normal';
      state.withTypeShuffle = false;
      state.withBoxShuffle = false;
      state.withCriesShuffle = false;
    }
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
    setCriesShuffle,
    setDarkMode,
    setGameMode,
    setGameOver,
    setMode,
    setBoxShuffle,
    setState,
    setTypeShuffle,
    state,
    toggleDarkMode,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useState, import.meta.hot));
}
