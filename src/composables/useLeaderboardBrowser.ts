import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { gens } from '@/data/gens.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import type { GameMode, Gen, Mode, Type } from '@/types.ts';

type BrowserTab = 'all' | 'modes' | 'gameModes' | 'gens' | 'types';

export const useLeaderboardBrowser = () => {
  const { t } = useI18n();

  const activeTab = ref<BrowserTab>('all');
  const activeMode = ref<Mode | null>(null);
  const activeGameMode = ref<GameMode | null>(null);
  const activeGen = ref<Gen | null>(null);
  const activeType = ref<Type | null>(null);

  const tabs = computed(() => [
    { id: 'all' as BrowserTab, label: t('all') },
    { id: 'modes' as BrowserTab, label: t('modes') },
    { id: 'gameModes' as BrowserTab, label: t('gameModes') },
    { id: 'gens' as BrowserTab, label: t('gen') },
    { id: 'types' as BrowserTab, label: t('types') },
  ]);

  const modeOptions = computed(() => [
    { color: '#950015', id: 'chaos' as Mode, label: t('chaos') },
    { color: '#262626', id: 'normal' as Mode, label: t('normal') },
    { color: '#123F9B', id: 'order' as Mode, label: t('order') },
  ]);

  const gameModeOptions = computed(() => [
    { color: '#31adbb', id: 'full' as GameMode, label: t('full') },
    { color: '#4D3833', id: 'gen' as GameMode, label: t('gen') },
    { color: '#6767AB', id: 'types' as GameMode, label: t('types') },
    { color: '#f5c242', id: 'special' as GameMode, label: t('special') },
    { color: '#008a8a', id: 'mega' as GameMode, label: t('mega') },
  ]);

  const genOptions = computed(() =>
    Object.values(gens).map((gen) => ({
      color: gen.color,
      id: gen.id as Gen,
      label: t(gen.name.toLowerCase()),
    })),
  );

  const typeOptions = computed(() =>
    Object.values(pokemonTypes).map((type) => ({
      color: type.buttonColor,
      id: type.id as Type,
      label: t(type.id),
      text: type.fgColor,
    })),
  );

  /** Derived filter state for the leaderboard query. */
  const currentFilter = computed(() => {
    switch (activeTab.value) {
      case 'modes':
        return {
          gameMode: null as GameMode | null,
          gen: null as Gen | null,
          mode: activeMode.value,
          type: null as Type | null,
        };
      case 'gameModes':
        return {
          gameMode: activeGameMode.value,
          gen: null as Gen | null,
          mode: null as Mode | null,
          type: null as Type | null,
        };
      case 'gens':
        return {
          gameMode: 'gen' as GameMode,
          gen: activeGen.value,
          mode: null as Mode | null,
          type: null as Type | null,
        };
      case 'types':
        return {
          gameMode: 'types' as GameMode,
          gen: null as Gen | null,
          mode: null as Mode | null,
          type: activeType.value,
        };
      default:
        return {
          gameMode: null as GameMode | null,
          gen: null as Gen | null,
          mode: null as Mode | null,
          type: null as Type | null,
        };
    }
  });

  const setTab = (tab: BrowserTab) => {
    activeTab.value = tab;
    // Reset sub-selections when switching tabs
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
