import { beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('@/composables/useFirebase.ts', () => ({
  useFirebase: () => ({
    deleteUserState: vi.fn(),
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

vi.mock('@/stores/useState.ts', () => ({
  useState: () => ({ setState }),
}));

vi.mock('@/stores/useCurrentGen.ts', () => ({
  useCurrentGen: () => ({ setCurrentGens }),
}));

vi.mock('@/stores/useCurrentBox.ts', () => ({
  useCurrentBox: () => ({ setCurrentBox, setCurrentMegaBox, setCurrentSpecialBox }),
}));

vi.mock('@/stores/useCurrentType.ts', () => ({
  useCurrentType: () => ({ setCurrentTypes, setShuffledType }),
}));

vi.mock('@/stores/useGameFlow.ts', () => ({
  useGameFlow: () => ({ setFlowState }),
}));

vi.mock('@/stores/usePokemons.ts', () => ({
  usePokemons: () => ({
    findPokemon: vi.fn(),
    pokemonState: { pokemonStatuses: new Map() },
    resetPokemonState: vi.fn(),
  }),
}));

vi.mock('@/stores/useTimer.ts', () => ({
  useTimer: () => ({ resetTimer: vi.fn(), setTimerState }),
}));

vi.mock('@/stores/useSettings.ts', () => ({
  useSettings: () => ({
    resetLanguages: vi.fn(),
    setLanguages,
    setSettingsState,
  }),
}));

vi.mock('@/stores/useTouches.ts', () => ({
  useTouches: () => ({ setTouchesState }),
}));

vi.mock('@/stores/useBonus.ts', () => ({
  useBonus: () => ({ setScore }),
}));

vi.mock('@/stores/useSkips.ts', () => ({
  useSkips: () => ({ setSkips }),
}));

describe('useSavedData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
