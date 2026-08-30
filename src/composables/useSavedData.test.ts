import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCAL_STORAGE_KEY } from '@/data/global';

const setState = vi.fn();
const setCurrentGens = vi.fn();
const setCurrentBox = vi.fn();
const setCurrentSpecialBox = vi.fn();
const setCurrentMegaBox = vi.fn();
const setCurrentTypes = vi.fn();
const setShuffledType = vi.fn();
const setFlowState = vi.fn();
const setTimerState = vi.fn();
const setLanguages = vi.fn();
const setSettingsState = vi.fn();
const setTouchesState = vi.fn();
const setScore = vi.fn();
const setSkips = vi.fn();

const mockState = {
  gameMode: null as string | null,
  isDark: false,
  mode: 'normal',
  withBoxShuffle: false,
  withCriesShuffle: false,
  withShadows: false,
  withTypeShuffle: false,
};

const mockSettingsState = {
  autoPause: false,
  autoSync: false,
  avatar: null,
  languages: new Set(['en']),
  name: null,
  withCriesHelper: false,
  withCycleRegions: true,
  withCycleSprites: true,
  withCycleTypes: true,
  withInitialsHelper: false,
  withScrollIntoView: true,
  withShadowHelper: false,
  withShinies: false,
  withSound: true,
  withSpelling: false,
};

const mockTouchesState = {
  boxShuffleClicks: 0,
  shiniesDiscovered: 0,
  spellingClicks: 0,
  summonedCries: 0,
  summonedInitials: 0,
  summonedShadows: 0,
  toggledAutoPause: false,
  toggledCriesHelper: false,
  toggledDisplayShadows: false,
  toggledInitialsHelper: false,
  toggledLanguage: false,
  toggledMissingno: false,
  toggledShadowHelper: false,
  toggledShinyCharm: false,
  toggledSpelling: false,
  typeShuffleClicks: 0,
};

const mockFlowState = {
  challengeMode: 'free' as const,
  gameSelectionState: null,
  isEnded: false,
  isGivenUp: false,
  isPaused: false,
  isSettingsOpen: false,
  isStarted: true,
  missingno: false,
  sessionId: 'test-session',
};

const mockTimerState = {
  elapsed: 0,
  isLimited: false,
  minutes: 35,
  startTime: null,
};

const storage = new Map<string, string>();
const sessionStorageMock = {
  clear: () => storage.clear(),
  getItem: (key: string) => storage.get(key) ?? null,
  removeItem: (key: string) => storage.delete(key),
  setItem: (key: string, value: string) => storage.set(key, value),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

const mockLoadUserState = vi.fn();
vi.mock('@/composables/useFirebase.ts', () => ({
  useFirebase: () => ({
    deleteUserState: vi.fn(),
    loadUserState: mockLoadUserState,
    saveUserState: vi.fn(),
  }),
}));

vi.mock('@/main.ts', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock('@/stores/useMessages.ts', () => ({
  useMessages: () => ({
    showUserMessage: vi.fn(),
  }),
}));

vi.mock('@/composables/useTitle.ts', () => ({
  usePageTitle: () => ({
    setTitle: vi.fn(),
  }),
}));

vi.mock('@/stores/useRooms.ts', () => ({
  useRooms: () => ({
    isOwner: { value: false },
    roomState: { isActive: false, room: null },
    saveOwnerState: vi.fn(),
  }),
}));

vi.mock('@/stores/useState.ts', () => ({
  useState: () => ({ setState, state: mockState }),
}));

vi.mock('@/stores/useCurrentGen.ts', () => ({
  useCurrentGen: () => ({
    currentGenState: { gens: new Set(['gen1']) },
    setCurrentGens,
  }),
}));

vi.mock('@/stores/useCurrentBox.ts', () => ({
  useCurrentBox: () => ({
    currentBoxState: { currentBox: null, currentMegaBox: null, currentSpecialBox: null },
    setCurrentBox,
    setCurrentMegaBox,
    setCurrentSpecialBox,
  }),
}));

vi.mock('@/stores/useCurrentType.ts', () => ({
  useCurrentType: () => ({
    currentTypeState: { currentTypes: new Set(), shuffledType: null },
    setCurrentTypes,
    setShuffledType,
  }),
}));

vi.mock('@/stores/useGameFlow.ts', () => ({
  useGameFlow: () => ({
    flowState: mockFlowState,
    isInGame: { value: true },
    setFlowState,
  }),
}));

vi.mock('@/stores/usePokemons.ts', () => ({
  usePokemons: () => ({
    findPokemon: vi.fn(),
    pokemonState: { pokemonStatuses: new Map() },
    resetPokemonState: vi.fn(),
  }),
}));

vi.mock('@/stores/useTimer.ts', () => ({
  useTimer: () => ({ resetTimer: vi.fn(), setTimerState, timerState: mockTimerState }),
}));

vi.mock('@/stores/useSettings.ts', () => ({
  useSettings: () => ({
    resetLanguages: vi.fn(),
    setLanguages,
    setSettingsState,
    settingsState: mockSettingsState,
  }),
}));

vi.mock('@/stores/useTouches.ts', () => ({
  useTouches: () => ({ setTouchesState, touchesState: mockTouchesState }),
}));

vi.mock('@/stores/useBonus.ts', () => ({
  useBonus: () => ({ bonusState: { score: 0 }, setScore }),
}));

vi.mock('@/stores/useSkips.ts', () => ({
  useSkips: () => ({ setSkips, skipsState: { skipScore: 0, skips: 0 } }),
}));

describe('useSavedData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockState.gameMode = null;
  });

  it('does not mutate stores when the payload is invalid', async () => {
    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { applyState } = useSavedData();

    expect(applyState({ gameMode: 'invalid', version: 1 })).toBe(false);
    expect(setState).not.toHaveBeenCalled();
    expect(setCurrentGens).not.toHaveBeenCalled();
    expect(setCurrentBox).not.toHaveBeenCalled();
    expect(setCurrentTypes).not.toHaveBeenCalled();
    expect(setFlowState).not.toHaveBeenCalled();
    expect(setTimerState).not.toHaveBeenCalled();
    expect(setSettingsState).not.toHaveBeenCalled();
    expect(setTouchesState).not.toHaveBeenCalled();
    expect(setScore).not.toHaveBeenCalled();
    expect(setSkips).not.toHaveBeenCalled();
  });

  it('returns SaveData for getSavedState', async () => {
    mockState.gameMode = 'gen';
    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { getSavedState } = useSavedData();

    const state = getSavedState();
    expect(state).not.toBeNull();
    expect(state.gameMode).toBe('gen');
    expect(state.version).toBe(1);
  });

  it('hasSavedState returns false when gameMode is null in sessionStorage', async () => {
    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { hasSavedState } = useSavedData();

    sessionStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        gameMode: null,
        isDark: false,
        mode: 'normal',
        version: 1,
      }),
    );

    expect(hasSavedState()).toBe(false);
  });

  it('autoSave does not persist to sessionStorage if gameMode is null', async () => {
    mockState.gameMode = null;
    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { autoSave, setReady } = useSavedData();

    setReady();
    await autoSave();

    expect(sessionStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('loadAutoSave returns false and does not set state when autosave has null gameMode', async () => {
    sessionStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        gameMode: null,
        isDark: false,
        mode: 'normal',
        version: 1,
      }),
    );

    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { loadAutoSave } = useSavedData();

    const result = await loadAutoSave();
    expect(result).toBe(false);
    expect(setState).not.toHaveBeenCalled();
  });

  it('hasFirebaseData returns false when cloud save is invalid or null', async () => {
    mockLoadUserState.mockResolvedValueOnce(null);
    const { useSavedData } = await import('@/composables/useSavedData.ts');
    const { hasFirebaseData } = useSavedData();

    expect(await hasFirebaseData()).toBe(false);

    mockLoadUserState.mockResolvedValueOnce({ gameMode: null, version: 1 });
    expect(await hasFirebaseData()).toBe(false);
  });
});
