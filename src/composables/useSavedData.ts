import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { usePageTitle } from '@/composables/useTitle.ts';
import { LOCAL_STORAGE_NAME_KEY, LOCAL_STORAGE_KEY, VERSION } from '@/data/global';
import { i18n } from '@/main.ts';
import { parseSaveData } from '@/schemas/saveData.schema.ts';
import { useBonus } from '@/stores/useBonus.ts';
import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useSettings } from '@/stores/useSettings.ts';
import { useSkips } from '@/stores/useSkips.ts';
import { useState } from '@/stores/useState.ts';
import { useTimer } from '@/stores/useTimer.ts';
import { useTouches } from '@/stores/useTouches.ts';
import type { SaveData, PokemonProgress } from '@/types.ts';
import { normalizeName } from '@/utils/utils.ts';

const ready = ref(false);

const debouncedSaveToFirebase = useDebounceFn(
  (savedState: SaveData) => {
    const { settingsState } = useSettings();
    const { isInGame } = storeToRefs(useGameFlow());
    if (!settingsState.autoSync || !isInGame.value) {
      return;
    }
    const { saveUserState } = useFirebase();
    saveUserState(savedState);
  },
  1000,
  { maxWait: 15000 },
);

export const useSavedData = () => {
  const { showUserMessage } = useMessages();
  const { deleteUserState } = useFirebase();
  const { setTitle } = usePageTitle();

  const setReady = () => {
    ready.value = true;
  };

  const getSavedName = () => {
    const savedStateStr = sessionStorage.getItem(LOCAL_STORAGE_NAME_KEY);
    if (!savedStateStr) {
      return null;
    }
    return sessionStorage.getItem(LOCAL_STORAGE_NAME_KEY);
  };

  const setSavedName = (name: string) => {
    sessionStorage.setItem(LOCAL_STORAGE_NAME_KEY, name);
  };

  const hasSavedState = () => {
    const savedStateStr = sessionStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedStateStr) {
      return false;
    }

    try {
      const result = parseSaveData(JSON.parse(savedStateStr));
      if (!result.success || result.data.gameSelectionState !== null) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to parse autosave data.', error);
      return false;
    }
  };

  const getSavedState = (): SaveData => {
    const { state } = useState();
    const { settingsState } = useSettings();
    const { currentGenState } = useCurrentGen();
    const { currentBoxState } = useCurrentBox();
    const { currentTypeState } = useCurrentType();
    const { pokemonState } = usePokemons();
    const { timerState } = useTimer();
    const { flowState } = useGameFlow();
    const { touchesState } = useTouches();
    const { bonusState } = useBonus();
    const { skipsState } = useSkips();

    const pokemonFound: PokemonProgress['pokemonFound'] = [];
    const pokemonShadowed: PokemonProgress['pokemonShadowed'] = [];
    const shinyPokemon: PokemonProgress['shinyPokemon'] = [];

    pokemonState.pokemonStatuses.forEach((status, name) => {
      if (status.isFound) {
        pokemonFound.push({ id: name, lastFoundAt: status.lastFoundAt });
      }
      if (status.isShadowed) {
        pokemonShadowed.push({ id: name, lastShadowedAt: status.lastShadowedAt });
      }
      if (status.isShiny) {
        shinyPokemon.push({ id: name });
      }
    });

    return {
      ...state,
      ...settingsState,
      ...touchesState,
      challengeMode: flowState.challengeMode,
      currentBox: currentBoxState.currentBox ?? null,
      currentMegaBox: currentBoxState.currentMegaBox ?? null,
      currentSpecialBox: currentBoxState.currentSpecialBox ?? null,
      currentType: currentTypeState.shuffledType,
      currentTypes: Array.from(currentTypeState.currentTypes),
      gameSelectionState: null,
      gens: Array.from(currentGenState.gens),
      languages: Array.from(settingsState.languages),
      pokemonProgress: {
        pokemonFound,
        pokemonShadowed,
        shinyPokemon,
      },
      score: bonusState.score,
      sessionId: flowState.sessionId,
      skipScore: skipsState.skipScore,
      skips: skipsState.skips,
      timer: {
        ...timerState,
        savedAt: Date.now(),
      },
      types: Array.from(currentTypeState.currentTypes),
      version: VERSION,
    };
  };

  const saveState = () => {
    const savedState = getSavedState();
    // Simulate a download by creating a blob and a temporary link
    const blob = new Blob([JSON.stringify(savedState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const [date, time] = new Date().toISOString().split('T');
    const formatDate = date.replace(/-/g, '_');
    const formatTime = time.replace(/:/g, '_').split('.')[0];
    link.download = `pkmn_quiz_state_${formatDate}_${formatTime}.json`;
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const autoSave = (saveToFirebase = false) => {
    // Prevent autosaving until app is ready
    if (!ready.value) return;

    const { flowState } = useGameFlow();
    if (flowState.isEnded || flowState.isGivenUp) {
      removeAutoSave();
      deleteUserState();
      return;
    }

    const savedState = getSavedState();
    sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedState));

    if (saveToFirebase) {
      debouncedSaveToFirebase(savedState);
    }
  };

  const removeAutoSave = () => {
    sessionStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const applyPartialState = (partialState: Partial<SaveData>) => {
    const parsedState = parseSaveData({ ...getSavedState(), ...partialState });
    if (!parsedState.success) {
      console.error('Failed to apply partial state: Invalid data.', parsedState.error.issues);
      showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
      return false;
    }

    applyValidatedState(parsedState.data);
    return true;
  };

  const applyState = (loadedState: unknown) => {
    const parsedState = parseSaveData(loadedState);
    if (!parsedState.success) {
      console.error('Failed to apply state: Invalid data.', parsedState.error.issues);
      showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
      return false;
    }

    applyValidatedState(parsedState.data);
    return true;
  };

  const applyValidatedState = (loadedState: SaveData) => {
    const { setState } = useState();
    const { setCurrentGens } = useCurrentGen();
    const { setCurrentBox, setCurrentSpecialBox, setCurrentMegaBox } = useCurrentBox();
    const { setCurrentTypes } = useCurrentType();
    const { setShuffledType } = useCurrentType();
    const { resetFlowState, setFlowState } = useGameFlow();
    const { pokemonState, resetPokemonState, findPokemon } = usePokemons();
    const { resetTimer, setTimerState } = useTimer();
    const { setLanguages, resetLanguages, setSettingsState } = useSettings();
    const { setTouchesState } = useTouches();
    const { setScore } = useBonus();
    const { setSkips } = useSkips();

    const {
      currentTypes,
      currentType,
      currentBox,
      currentSpecialBox,
      currentMegaBox,
      languages,
      pokemonProgress,
      timer,
      gameSelectionState,
      challengeMode,
      score,
      skipScore,
      skips,
      version: _version,
      ...statePayload
    } = loadedState as Partial<SaveData>;

    const { pokemonFound, pokemonShadowed, shinyPokemon } = pokemonProgress ?? {};
    const { isLimited, minutes, startTime, elapsed } = timer ?? {};

    // Languages
    resetLanguages();
    setLanguages(languages ?? []);

    // Type
    setCurrentTypes(currentTypes ?? []);
    setShuffledType(currentType ?? null);

    // Box
    setCurrentBox(currentBox ?? null);
    setCurrentSpecialBox(currentSpecialBox ?? null);
    setCurrentMegaBox(currentMegaBox ?? null);

    // Gen
    setCurrentGens(statePayload.gens ?? []);

    // Pokemon progress
    resetPokemonState();

    pokemonFound?.forEach((entry) => {
      const { id: name, lastFoundAt } = entry;

      const found = findPokemon(name);
      const nameToFound = found && found.length > 0 ? normalizeName(found[0].baseName) : name;
      const status = pokemonState.pokemonStatuses.get(nameToFound);

      if (status) {
        status.isFound = true;
        status.lastFoundAt = lastFoundAt;
      } else {
        pokemonState.pokemonStatuses.set(nameToFound, {
          isFound: true,
          isMissed: false,
          isShadowed: false,
          isShiny: false,
          lastFoundAt,
          lastShadowedAt: null,
        });
      }
    });

    pokemonShadowed?.forEach((entry) => {
      const { id: name, lastShadowedAt } = entry;

      const found = findPokemon(name);
      const nameToShadow = found && found.length > 0 ? normalizeName(found[0].baseName) : name;
      const status = pokemonState.pokemonStatuses.get(nameToShadow);

      if (status) {
        status.isShadowed = true;
        status.lastShadowedAt = lastShadowedAt;
      } else {
        pokemonState.pokemonStatuses.set(nameToShadow, {
          isFound: false,
          isMissed: false,
          isShadowed: true,
          isShiny: false,
          lastFoundAt: null,
          lastShadowedAt,
        });
      }
    });

    shinyPokemon?.forEach((entry) => {
      const { id: name } = entry;

      const found = findPokemon(name);
      const nameToShiny = found && found.length > 0 ? normalizeName(found[0].baseName) : name;
      const status = pokemonState.pokemonStatuses.get(nameToShiny);

      if (status) {
        status.isShiny = true;
      } else {
        pokemonState.pokemonStatuses.set(nameToShiny, {
          isFound: false,
          isMissed: false,
          isShadowed: false,
          isShiny: true,
          lastFoundAt: null,
          lastShadowedAt: null,
        });
      }
    });

    // Timer
    resetTimer();
    setTimerState({
      elapsed: elapsed ?? 0,
      isLimited: isLimited ?? false,
      minutes: minutes ?? 35,
      startTime: startTime ?? null,
    });

    // Game flow
    resetFlowState();

    setFlowState({
      challengeMode: challengeMode,
      gameSelectionState: gameSelectionState,
      isStarted: true,
      sessionId: statePayload.sessionId ?? crypto.randomUUID(),
    });

    // State
    setState({
      gameMode: statePayload.gameMode ?? null,
      isDark: statePayload.isDark ?? false,
      mode: statePayload.mode ?? 'normal',
      withBoxShuffle: statePayload.withBoxShuffle ?? false,
      withCriesShuffle: statePayload.withCriesShuffle ?? false,
      withShadows: statePayload.withShadows ?? false,
      withTypeShuffle: statePayload.withTypeShuffle ?? false,
    });

    setSettingsState({
      autoPause: statePayload.autoPause ?? false,
      autoSync: statePayload.autoSync ?? false,
      avatar: statePayload.avatar ?? null,
      name: statePayload.name ?? null,
      withCriesHelper: statePayload.withCriesHelper ?? false,
      withCycleRegions: statePayload.withCycleRegions ?? true,
      withCycleSprites: statePayload.withCycleSprites ?? true,
      withCycleTypes: statePayload.withCycleTypes ?? true,
      withInitialsHelper: statePayload.withInitialsHelper ?? false,
      withScrollIntoView: statePayload.withScrollIntoView ?? true,
      withShadowHelper: statePayload.withShadowHelper ?? false,
      withShinies: statePayload.withShinies ?? false,
      withSound: statePayload.withSound ?? true,
      withSpelling: statePayload.withSpelling ?? false,
    });

    setTouchesState({
      boxShuffleClicks: statePayload.boxShuffleClicks ?? 0,
      shiniesDiscovered: statePayload.shiniesDiscovered ?? 0,
      spellingClicks: statePayload.spellingClicks ?? 0,
      summonedCries: statePayload.summonedCries ?? 0,
      summonedInitials: statePayload.summonedInitials ?? 0,
      summonedShadows: statePayload.summonedShadows ?? 0,
      toggledAutoPause: statePayload.toggledAutoPause ?? false,
      toggledCriesHelper: statePayload.toggledCriesHelper ?? false,
      toggledDisplayShadows: statePayload.toggledDisplayShadows ?? false,
      toggledInitialsHelper: statePayload.toggledInitialsHelper ?? false,
      toggledLanguage: statePayload.toggledLanguage ?? false,
      toggledMissingno: statePayload.toggledMissingno ?? false,
      toggledShadowHelper: statePayload.toggledShadowHelper ?? false,
      toggledShinyCharm: statePayload.toggledShinyCharm ?? false,
      toggledSpelling: statePayload.toggledSpelling ?? false,
      typeShuffleClicks: statePayload.typeShuffleClicks ?? 0,
    });

    // Bonus and Skips
    setScore(score ?? 0);
    setSkips({
      skipScore: skipScore ?? 0,
      skips: skips ?? 0,
    });

    showUserMessage(i18n.global.t('quizLoaded'));
    setTitle();
  };

  const loadState = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (files.length === 0) {
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Save file did not contain text data.');
        }

        const parsedState = parseSaveData(JSON.parse(result));
        if (!parsedState.success) {
          console.error('Failed to load state: Invalid save data.', parsedState.error.issues);
          showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
          return;
        }

        if (applyState(parsedState.data)) {
          setReady();
        }
      } catch (error) {
        console.error('Failed to load state: Invalid file format.', error);
        showUserMessage(i18n.global.t('failedToLoadQuizFormat'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const hasFirebaseData = async () => {
    const { loadUserState } = useFirebase();
    const userState = await loadUserState();
    return !!userState;
  };

  const loadFromFirebase = async () => {
    const { loadUserState } = useFirebase();
    const userState = await loadUserState();
    if (!userState) {
      return;
    }

    try {
      const parsedState = parseSaveData(userState);
      if (!parsedState.success) {
        console.error('Failed to load cloud save: Invalid data.', parsedState.error.issues);
        showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
        return;
      }

      if (applyState(parsedState.data)) {
        setReady();
      }
    } catch (error) {
      console.error('Failed to load cloud save: Invalid data.', error);
      showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
    }
  };

  const saveToFirebase = () => {
    const savedState = getSavedState();
    const { saveUserState } = useFirebase();
    saveUserState(savedState);
  };

  const loadAutoSave = async () => {
    const savedStateStr = sessionStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedStateStr) {
      return;
    }

    try {
      const parsedState = parseSaveData(JSON.parse(savedStateStr));
      if (!parsedState.success) {
        console.error('Failed to load autosave: Invalid data.', parsedState.error.issues);
        showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
        return;
      }

      if (applyState(parsedState.data)) {
        setReady();
      }
    } catch (error) {
      console.error('Failed to load autosave: Invalid data.', error);
      showUserMessage(i18n.global.t('failedToLoadQuizInvalid'), 'error');
    }
  };

  return {
    applyPartialState,
    applyState,
    autoSave,
    getSavedName,
    getSavedState,
    hasFirebaseData,
    hasSavedState,
    loadAutoSave,
    loadFromFirebase,
    loadState,
    removeAutoSave,
    saveState,
    saveToFirebase,
    setReady,
    setSavedName,
  };
};
