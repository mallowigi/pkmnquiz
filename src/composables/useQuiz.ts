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
  const { clearCurrentGens, setCurrentGens, getNextGen } = useCurrentGen();
  const { clearCurrentBox } = useCurrentBox();
  const { clearCurrentTypes, setCurrentTypes, getNextType } = useCurrentType();
  const { resetPokemonState } = usePokemons();
  const { resetTimer } = useTimer();
  const { updateShuffles } = useShuffles();
  const { getCurrentRegions } = useCurrentRegion();
  const { getCurrentTypes } = useCurrentType();
  const { getBoxTranslation, getTypeTranslation } = useTranslations();
  const { setTitle } = usePageTitle();

  const setFullQuiz = () => {
    if (state.gameMode === 'full') return;

    const onQuizStart = () => {
      setGameMode('full');
      clearCurrentGens();
      clearCurrentBox();
      clearCurrentTypes();
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
      clearCurrentTypes();
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
      clearCurrentTypes();
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

  const setTypesQuiz = (types: Type[]) => {
    const onQuizStart = () => {
      clearCurrentGens();
      clearCurrentTypes();
      setCurrentTypes(types);
      setGameMode('types');
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

  const setTypeOrSpecial = (type: string) => {
    clearCurrentGens();
    clearCurrentTypes();

    switch (type) {
      case 'special':
        setGameMode('special');
        break;
      case 'mega':
        setGameMode('mega');
        break;
      default:
        setCurrentTypes([type as Type]);
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

    const nextGen = getNextGen();
    if (!nextGen) return '';

    const region = currentRegions.find((r) => nextGen.boxes.includes(r.id));
    return capitalize(getBoxTranslation(region?.id));
  };

  const getTypeGameModeName = () => {
    const currentTypes = getCurrentTypes();
    if (currentTypes.length === 0) return '';

    const type = getNextType();
    if (!type) return '';
    return capitalize(getTypeTranslation(type.id));
  };

  const getGameModeName = () => {
    const gameMode = state.gameMode;

    switch (gameMode) {
      case 'full':
        return capitalize(t('full'));
      case 'gen':
        return getRegionGameModeName();
      case 'types':
        return getTypeGameModeName();
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
    setTypesQuiz,
  };
};
