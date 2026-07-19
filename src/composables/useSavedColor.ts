import { useLocalStorage } from '@vueuse/core';

import { useColors } from '@/composables/useColors.ts';

const { colors } = useColors();
const savedColor = useLocalStorage('pkmnQuizColor', colors.blue);

export const useSavedColor = () => {
  return {
    savedColor,
  };
};
