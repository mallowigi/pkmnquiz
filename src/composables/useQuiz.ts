import { useI18n } from 'vue-i18n';

import { useShuffles } from '@/composables/useShuffles.ts';
import { usePageTitle } from '@/composables/useTitle.ts';
import { useTranslations } from '@/composables/useTranslations.ts';
import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentRegion } from '@/stores/useCurrentRegion.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState.ts';
import { useTimer } from '@/stores/useTimer.ts';
import type { Type, Gen } from '@/types.ts';
import { scrollToTop, capitalize } from '@/utils/utils.ts';

export const useQuiz = ({ withDialog = false } = {}) => {
  const { t } = useI18n();
  const { startGame, setGameSelectionState } = useGameFlow();
  const { setGameMode, state } = useState();
  const { setDialog } = useDialogs();
  const { clearCurrentGens, setCurrentGens } = useCurrentGen();
  const { clearCurrentBox } = useCurrentBox();
  const { clearCurrentType, setCurrentType } = useCurrentType();
  const { resetPokemonState } = usePokemons();
  const { resetTimer } = useTimer();
  const { updateShuffles } = useShuffles();
  const { getCurrentRegions } = useCurrentRegion();
  const { getCurrentType } = useCurrentType();
  const { getBoxTranslation, getTypeTranslation } = useTranslations();
  const { setTitle } = usePageTitle();

  let randomNameInterval = 0;

  const setFullQuiz = () => {
    if (state.gameMode === 'full') return;

    const onQuizStart = () => {
      setGameMode('full');
      clearCurrentGens();
      clearCurrentBox();
      clearCurrentType();
      resetPokemonState();
      updateShuffles();
      resetTimer();
      startGame();
      scrollToTop();
      setTitle();
    };

    if (withDialog) {
      setDialog('switchQuiz', () => {
        onQuizStart();
      });
      return;
    }

    onQuizStart();
  };

  const setGenQuiz = (gens: Gen[]) => {
    const onQuizStart = () => {
      setGameMode('gen');
      clearCurrentType();
      setCurrentGens(gens);
      resetPokemonState();
      updateShuffles();
      resetTimer();
      startGame();
      scrollToTop();
      setTitle();
    };

    if (withDialog) {
      setDialog('switchQuiz', () => {
        onQuizStart();
      });
      return;
    }

    onQuizStart();
  };

  const setTypeQuiz = () => {
    const onQuizStart = () => {
      clearCurrentGens();
      clearCurrentType();
      resetPokemonState();
      resetTimer();
      setGameSelectionState('types');
      scrollToTop();
    };

    if (withDialog) {
      setDialog('switchQuiz', () => {
        onQuizStart();
      });
      return;
    }

    onQuizStart();
  };

  const setTypeOrSpecial = (type: string) => {
    clearCurrentGens();
    clearCurrentType();

    switch (type) {
      case 'special':
        setGameMode('special');
        break;
      case 'mega':
        setGameMode('mega');
        break;
      default:
        setCurrentType(type as Type);
        setGameMode('types');
    }

    setTitle();
    resetPokemonState();
    resetTimer();
    setGameSelectionState(null);
    startGame();
    scrollToTop();
  };

  const getRegionGameModeName = () => {
    const currentRegions = getCurrentRegions();
    if (currentRegions.length === 0) return '';

    // Cycle through the regions to get a different name each time
    const randomRegion = currentRegions[randomNameInterval] ?? currentRegions[0];
    randomNameInterval = (randomNameInterval + 1) % currentRegions.length;
    return capitalize(getBoxTranslation(randomRegion.id));
  };

  const getGameModeName = () => {
    const gameMode = state.gameMode;

    switch (gameMode) {
      case 'full':
        return capitalize(t('full'));
      case 'gen':
        return getRegionGameModeName();
      case 'types':
        const currentType = getCurrentType();
        return currentType ? capitalize(getTypeTranslation(currentType?.id)) : '';
      case 'special':
        return capitalize(t('special'));
      case 'mega':
        return capitalize(t('mega'));
      default:
        return '';
    }
  };

  return {
    getGameModeName,
    setFullQuiz,
    setGenQuiz,
    setTitle,
    setTypeOrSpecial,
    setTypeQuiz,
  };
};
