import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { gens } from '@/data/gens.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import type { GameMode, Gen, Mode, Type } from '@/types.ts';

type BrowserTab = 'all' | 'modes' | 'gameModes' | 'gens' | 'types';

type TabOption<T> = {
  color?: string;
  id: T;
  label: string;
  text?: string;
};

type LeaderboardFilter = {
  gameMode: GameMode | null;
  gen: Gen | null;
  mode: Mode | null;
  type: Type | null;
};

export const useLeaderboardBrowser = () => {
  const { t } = useI18n();

  const activeTab = ref<BrowserTab>('all');
  const activeMode = ref<Mode | null>(null);
  const activeGameMode = ref<GameMode | null>(null);
  const activeGen = ref<Gen | null>(null);
  const activeType = ref<Type | null>(null);

  const tabs = computed<TabOption<BrowserTab>[]>(() => [
    { id: 'all', label: t('all') },
    { id: 'modes', label: t('modes') },
    { id: 'gameModes', label: t('gameModes') },
    { id: 'gens', label: t('gen') },
    { id: 'types', label: t('types') },
  ]);

  const modeOptions = computed<TabOption<Mode>[]>(() => [
    { color: '#950015', id: 'chaos', label: t('chaos') },
    { color: '#262626', id: 'normal', label: t('normal') },
    { color: '#123F9B', id: 'order', label: t('order') },
  ]);

  const gameModeOptions = computed<TabOption<GameMode>[]>(() => [
    { color: '#31adbb', id: 'full', label: t('full') },
    { color: '#4D3833', id: 'gen', label: t('gen') },
    { color: '#6767AB', id: 'types', label: t('types') },
    { color: '#f5c242', id: 'special', label: t('special') },
    { color: '#008a8a', id: 'mega', label: t('mega') },
  ]);

  const genOptions = computed<TabOption<Gen>[]>(() =>
    Object.values(gens).map((gen) => ({
      color: gen.color,
      id: gen.id,
      label: t(gen.name.toLowerCase()),
    })),
  );

  const typeOptions = computed<TabOption<Type>[]>(() =>
    Object.values(pokemonTypes).map((type) => ({
      color: type.buttonColor,
      id: type.id,
      label: t(type.id),
      text: type.fgColor,
    })),
  );

  /** Derived filter state for the leaderboard query. */
  const currentFilter = computed<LeaderboardFilter>(() => {
    switch (activeTab.value) {
      case 'modes':
        return {
          gameMode: null,
          gen: null,
          mode: activeMode.value,
          type: null,
        };
      case 'gameModes':
        return {
          gameMode: activeGameMode.value,
          gen: null,
          mode: null,
          type: null,
        };
      case 'gens':
        return {
          gameMode: 'gen',
          gen: activeGen.value,
          mode: null,
          type: null,
        };
      case 'types':
        return {
          gameMode: 'types',
          gen: null,
          mode: null,
          type: activeType.value,
        };
      default:
        return {
          gameMode: null,
          gen: null,
          mode: null,
          type: null,
        };
    }
  });

  const setTab = (tab: BrowserTab) => {
    activeTab.value = tab;
    activeMode.value = null;
    activeGameMode.value = null;
    activeGen.value = null;
    activeType.value = null;
  };

  return {
    activeGameMode,
    activeGen,
    activeMode,
    activeTab,
    activeType,
    currentFilter,
    gameModeOptions,
    genOptions,
    modeOptions,
    setTab,
    tabs,
    typeOptions,
  };
};
