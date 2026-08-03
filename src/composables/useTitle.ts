import { useTitle } from '@vueuse/core';

import { gens } from '@/data/gens.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useState } from '@/stores/useState.ts';
import { capitalize } from '@/utils/utils.ts';

export const TITLE = 'Pkmn Vue Quiz';

export const usePageTitle = () => {
  // const { t } = useI18n();

  const getTitle = () => {
    return useTitle();
  };

  const setTitle = () => {
    const { state } = useState();
    const { getNextGen } = useCurrentGen();
    const { getNextType } = useCurrentType();

    switch (state.gameMode) {
      case 'full':
        useTitle(`Full Quiz | ${TITLE}`);
        break;
      case 'gen':
        const nextGen = getNextGen();

        if (nextGen) {
          useTitle(`${capitalize(gens[nextGen.id].name)} Quiz | ${TITLE}`);
        } else {
          useTitle(`Generation Quiz | ${TITLE}`);
        }
        break;
      case 'types':
        const nextType = getNextType();

        if (nextType) {
          useTitle(`${capitalize(nextType.name)} Type Quiz | ${TITLE}`);
        } else {
          useTitle(`Type Quiz | ${TITLE}`);
        }
        break;
      case 'special':
        useTitle(`Special Quiz | ${TITLE}`);
        break;
      case 'mega':
        useTitle(`Mega Quiz | ${TITLE}`);
        break;
      default:
        useTitle(TITLE);
    }
  };

  return {
    getTitle,
    setTitle,
  };
};
