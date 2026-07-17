import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { usePlaySounds } from '@/composables/usePlaySounds.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useProfile } from '@/stores/useProfile.ts';
import { useTouches } from '@/stores/useTouches.ts';
import type { GameFlowState, GameSelectionState, ChallengeMode } from '@/types.ts';

export const useGameFlow = defineStore('gameFlow', () => {
  const { playFanfare, playMissingno } = usePlaySounds();
  const { removeAutoSave } = useSavedData();
  const { createRecord } = useFirebase();
  const { showRemaining } = usePokemons();
  const { incrementPlays } = useProfile();
  const { toggledMissingno } = useTouches();

  const flowState = reactive<GameFlowState>({
    challengeMode: 'free',
    gameSelectionState: 'new',
    isEnded: false,
    isGivenUp: false,
    isPaused: false,
    isSettingsOpen: false,
    isStarted: false,
    lastInput: null,
    missingno: false,
    sessionId: null,
  });

  const startGame = () => {
    flowState.isStarted = true;
    flowState.isEnded = false;
    flowState.gameSelectionState = null;
    flowState.isGivenUp = false;
    flowState.lastInput = null;
    flowState.missingno = false;
    flowState.sessionId = crypto.randomUUID();
    incrementPlays();
  };

  const pauseGame = () => {
    flowState.isPaused = true;
  };

  const resumeGame = () => {
    flowState.isPaused = false;
  };

  const endGame = () => {
    flowState.isEnded = true;
    flowState.isStarted = false;
    flowState.gameSelectionState = null;
    flowState.isGivenUp = false;
    flowState.lastInput = null;

    removeAutoSave();
    createRecord();
    playFanfare();
  };

  const giveUp = () => {
    flowState.isGivenUp = true;
    flowState.lastInput = null;

    createRecord();
    removeAutoSave();
    showRemaining();
  };

  const setGameSelectionState = (state: GameSelectionState) => {
    flowState.gameSelectionState = state;
    flowState.lastInput = null;
  };

  const setChallengeMode = (mode: ChallengeMode) => {
    flowState.challengeMode = mode;
  };

  const resetFlowState = () => {
    flowState.isEnded = false;
    flowState.isGivenUp = false;
    flowState.isPaused = false;
    flowState.isStarted = false;
    flowState.lastInput = null;
  };

  const setFlowState = (state: Partial<GameFlowState>) => {
    Object.assign(flowState, state);
  };

  const updateInput = (input: string | null) => {
    flowState.lastInput = input;
  };

  const toggleSettings = () => {
    flowState.isSettingsOpen = !flowState.isSettingsOpen;
  };

  const toggleMissingno = (missingno: boolean) => {
    flowState.missingno = missingno;
    playMissingno();
    toggledMissingno();
  };

  const isInGame = computed(() => {
    if (flowState.isEnded || flowState.isGivenUp || flowState.isPaused) return false;
    return flowState.isStarted;
  });

  const isChallengeMode = computed(() => {
    return flowState.challengeMode === 'challenge';
  });

  return {
    endGame,
    flowState,
    giveUp,
    isChallengeMode,
    isInGame,
    pauseGame,
    resetFlowState,
    resumeGame,
    setChallengeMode,
    setFlowState,
    setGameSelectionState,
    startGame,
    toggleMissingno,
    toggleSettings,
    updateInput,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameFlow, import.meta.hot));
}
