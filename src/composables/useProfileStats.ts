import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { gens } from '@/data/gens.ts';
import { megaTypes } from '@/data/megaTypes.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { specialTypes } from '@/data/specialTypes.ts';
import { useProfile } from '@/stores/useProfile.ts';
import type { Gen, Type } from '@/types.ts';

export const useProfileStats = () => {
  const { profileState } = useProfile();
  const { t } = useI18n();

  const activeTab = ref('modes');

  const tabs = [
    { id: 'modes', label: t('modes') },
    { id: 'gameModes', label: t('gameModes') },
    { id: 'gens', label: t('gen') },
    { id: 'types', label: t('types') },
    { id: 'special', label: t('special') },
    { id: 'mega', label: t('mega') },
  ];

  const finishedGames = computed(() => profileState.finishedGames);

  const modesStats = computed(() => [
    { color: '#ff6611', label: t('chaos'), value: finishedGames.value.chaos },
    { color: '#ddddcc', label: t('normal'), value: finishedGames.value.normal },
    { color: '#3377ff', label: t('order'), value: finishedGames.value.order },
  ]);

  const gameModesStats = computed(() => [
    { color: '#ffbb11', label: t('full'), value: finishedGames.value.full },
    { color: '#33ddff', label: t('gen'), value: Object.values(finishedGames.value.gen).reduce((a, b) => a + b, 0) },
    { color: '#cc22cc', label: t('types'), value: Object.values(finishedGames.value.types).reduce((a, b) => a + b, 0) },
    {
      color: '#f5c242',
      label: t('special'),
      value: finishedGames.value.special,
    },
    { color: '#ff88bb', label: t('mega'), value: finishedGames.value.mega },
  ]);

  const gensStats = computed(() =>
    Object.keys(gens).map((genKey) => {
      const gen = gens[genKey as Gen];
      return {
        color: gen.color,
        label: t(gen.name.toLowerCase()),
        value: finishedGames.value.gen[genKey as Gen] || 0,
      };
    }),
  );

  const typesStats = computed(() =>
    Object.keys(pokemonTypes)
      .map((typeKey) => {
        const type = pokemonTypes[typeKey as Type];
        return {
          color: type.buttonColor,
          icon: type.symbol,
          label: t(typeKey),
          value: finishedGames.value.types[typeKey as Type] || 0,
        };
      })
      .sort((a, b) => b.value - a.value),
  );

  const specialStats = computed(() => {
    return [
      {
        color: '#ffbb11',
        icon: specialTypes.no.symbol,
        label: t('special'),
        value: finishedGames.value.special || 0,
      },
    ];
  });

  const megaStats = computed(() => {
    return [
      {
        color: '#ff88bb',
        icon: megaTypes.mega.symbol,
        label: t('mega'),
        value: finishedGames.value.mega || 0,
      },
    ];
  });

  const currentStats = computed(() => {
    switch (activeTab.value) {
      case 'modes':
        return modesStats.value;
      case 'gameModes':
        return gameModesStats.value;
      case 'gens':
        return gensStats.value;
      case 'types':
        return typesStats.value;
      case 'special':
        return specialStats.value;
      case 'mega':
        return megaStats.value;
      default:
        return [];
    }
  });

  return {
    activeTab,
    currentStats,
    tabs,
  };
};
