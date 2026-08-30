import { defineStore, acceptHMRUpdate, storeToRefs } from 'pinia';
import { reactive, computed, watch } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useLastInput } from '@/composables/useLastInput.ts';
import { usePlaySounds } from '@/composables/usePlaySounds.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { useVoice } from '@/composables/useVoice.ts';
import { i18n } from '@/main.ts';
import { useBonus } from '@/stores/useBonus.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useProfile } from '@/stores/useProfile.ts';
import { useRooms } from '@/stores/useRooms.ts';
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
  const { stopVoice } = useVoice();
  const { roomState, joinOrCreateRoom, destroyRoom } = useRooms();
  const { setDialog } = useDialogs();
  const { showUserMessage } = useMessages();

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

  let roomWatcher: (() => void) | null = null;

  const initRoom = async () => {
    if (!roomState.room) return;

    const { auth } = useFirebase();
    if (!auth.currentUser?.uid) {
      showUserMessage(i18n.global.t('userNotAuthenticated'), 'error');
      return;
    }

    const roomName = roomState.room;
    // Destroy previous room
    if (roomState.isActive) {
      setDialog('deleteRoom', async () => {
        await destroyRoom();
        await tryJoinRoom(auth.currentUser?.uid, roomName);
      });
    } else {
      await tryJoinRoom(auth.currentUser?.uid, roomName);
    }
  };

  const tryJoinRoom = async (userId: string | undefined, roomName: string) => {
    const joinOutcome = await joinOrCreateRoom(roomName, userId ?? '');
    if (joinOutcome === 'invalid' || joinOutcome === 'failed') {
      setGameSelectionState('createRoom');
      return;
    }

    watchRoom();
  };

  const watchRoom = () => {
    roomWatcher?.();

    const { auth } = useFirebase();
    if (!auth.currentUser?.uid) {
      showUserMessage(i18n.global.t('userNotAuthenticated'), 'error');
      return;
    }

    // Watch for owner online disconnection to convert game into local game
    const roomsStore = useRooms();
    const { leaveRoom } = roomsStore;
    const { ownerOnline, roomTerminated, isJoiner } = storeToRefs(roomsStore);
    const { autoSave } = useSavedData();

    // Semaphore to prevent multiple downgrades at the same time
    let isDowngrading = false;

    roomWatcher = watch(
      [() => ownerOnline.value, () => roomTerminated.value],
      async ([online, terminated]) => {
        // Skip if we are the owner or if the owner is still online
        if ((!terminated && online) || !isJoiner.value || isDowngrading) return;

        isDowngrading = true;

        try {
          // Regenerate a new sessionID
          flowState.sessionId = crypto.randomUUID();

          // Leave room and convert game into local game
          await leaveRoom(auth.currentUser?.uid ?? '');

          // Resume autosave
          await autoSave();
        } finally {
          isDowngrading = false;
        }
      },
      { immediate: true },
    );
  };

  const startGame = async () => {
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

    await initRoom();
  };

  const pauseGame = () => {
    flowState.isPaused = true;
    stopTypeCycle();
    stopGenCycle();
    stopVoice();
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
    const doEndGame = () => {
      flowState.isEnded = true;
      flowState.isStarted = false;
      flowState.gameSelectionState = null;
      flowState.isGivenUp = false;

      stopTypeCycle();
      stopGenCycle();
      stopVoice();
      removeAutoSave();
      createRecord();
      recordWin();
      playFanfare();
      resetInput();
      destroyRoom();
    };

    if (roomState.isActive) {
      setDialog('deleteRoom', () => doEndGame());
    } else {
      doEndGame();
    }
  };

  const giveUp = () => {
    const doGiveUp = () => {
      flowState.isGivenUp = true;

      stopTypeCycle();
      stopGenCycle();
      stopVoice();
      createRecord();
      removeAutoSave();
      showRemaining();
      resetInput();
      destroyRoom();
    };

    if (roomState.isActive) {
      setDialog('deleteRoom', () => doGiveUp());
    } else {
      doGiveUp();
    }
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
