import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useLastInput } from '@/composables/useLastInput.ts';
import { usePlaySounds } from '@/composables/usePlaySounds.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { useVoice } from '@/composables/useVoice.ts';
import { useBonus } from '@/stores/useBonus.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useProfile } from '@/stores/useProfile.ts';
import { useTouches } from '@/stores/useTouches.ts';
import type { GameFlowState, GameSelectionState, ChallengeMode } from '@/types.ts';

export const useGameFlow = defineStore('gameFlow', () => {
  const { playFanfare, playMissingno } = usePlaySounds();
  const { removeAutoSave } = useSavedData();
  const { createRecord } = useFirebase();
  const { showRemaining } = usePokemons();
  const { incrementPlays, updateFinishedGames } = useProfile();
  const { toggledMissingno } = useTouches();
  const { resetInput } = useLastInput();
  const { resetBonus } = useBonus();
  const { startTypeCycle, stopTypeCycle } = useCurrentType();
  const { startGenCycle, stopGenCycle } = useCurrentGen();
  const { toggleVoice } = useVoice();

  const flowState = reactive<GameFlowState>({
    challengeMode: 'free',
    gameSelectionState: 'new',
    isEnded: false,
    isGivenUp: false,
    isPaused: false,
    isSettingsOpen: false,
    isStarted: false,
    missingno: false,
    sessionId: null,
  });

  const startGame = () => {
    flowState.isStarted = true;
    flowState.isEnded = false;
    flowState.gameSelectionState = null;
    flowState.isGivenUp = false;
    flowState.missingno = false;
    flowState.sessionId = crypto.randomUUID();
    incrementPlays();
    resetInput();
    resetBonus();
    startTypeCycle();
    startGenCycle();
  };

  const pauseGame = () => {
    flowState.isPaused = true;
    stopTypeCycle();
    stopGenCycle();
    toggleVoice();
  };

  const resumeGame = () => {
    flowState.isPaused = false;
    startTypeCycle();
    startGenCycle();
  };

  const recordWin = () => {
    updateFinishedGames();
  };

  const endGame = () => {
    flowState.isEnded = true;
    flowState.isStarted = false;
    flowState.gameSelectionState = null;
    flowState.isGivenUp = false;

    stopTypeCycle();
    stopGenCycle();
    toggleVoice();
    removeAutoSave();
    createRecord();
    recordWin();
    playFanfare();
    resetInput();
  };

  const giveUp = () => {
    flowState.isGivenUp = true;

    stopTypeCycle();
    stopGenCycle();
    toggleVoice();
    createRecord();
    removeAutoSave();
    showRemaining();
    resetInput();
  };

  const setGameSelectionState = (state: GameSelectionState) => {
    flowState.gameSelectionState = state;
    resetInput();
  };

  const setChallengeMode = (mode: ChallengeMode) => {
    flowState.challengeMode = mode;
  };

  const resetFlowState = () => {
    flowState.isEnded = false;
    flowState.isGivenUp = false;
    flowState.isPaused = false;
    flowState.isStarted = false;
  };

  const setFlowState = (state: Partial<GameFlowState>) => {
    Object.assign(flowState, state);
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
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameFlow, import.meta.hot));
}
