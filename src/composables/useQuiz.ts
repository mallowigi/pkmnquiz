import { useTitle } from '@vueuse/core';

import { gens } from '@/data/gens.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState.ts';
import { useTimer } from '@/stores/useTimer.ts';
import type { Type, Gen } from '@/types.ts';
import { scrollToTop, capitalize } from '@/utils/utils.ts';

export const TITLE = 'Pkmn Vue Quiz';

export const useQuiz = ({ withDialog = false } = {}) => {
  const { startGame, setGameSelectionState } = useGameFlow();
  const { setGameMode, state } = useState();
  const { setDialog } = useDialogs();
  const { currentGenState, clearCurrentGen, setCurrentGen } = useCurrentGen();
  const { clearCurrentBox } = useCurrentBox();
  const { currentTypeState, clearCurrentType, setCurrentType } = useCurrentType();
  const { resetPokemonState } = usePokemons();
  const { resetTimer } = useTimer();

  const setTitle = () => {
    switch (state.gameMode) {
      case 'full':
        useTitle(`Full Quiz | ${TITLE}`);
        break;
      case 'gen':
        const genName = gens[currentGenState.gen!]?.name || 'Unknown Gen';
        useTitle(`${genName} Quiz | ${TITLE}`);
        break;
      case 'types':
        if (currentTypeState.currentType) {
          useTitle(`${capitalize(currentTypeState.currentType)} Type Quiz | ${TITLE}`);
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

  const setFullQuiz = () => {
    if (state.gameMode === 'full') return;

    const onQuizStart = () => {
      setGameMode('full');
      clearCurrentGen();
      clearCurrentBox();
      clearCurrentType();
      resetPokemonState();
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

  const setGenQuiz = (gen: Gen) => {
    const onQuizStart = () => {
      setGameMode('gen');
      clearCurrentType();
      setCurrentGen(gen);
      resetPokemonState();
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
      clearCurrentGen();
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
    clearCurrentGen();
    clearCurrentType();

    switch (type) {
      case 'special':
        setGameMode('special');
        break;
      case 'mega':
        setGameMode('mega');
        break;
      default:
        setGameMode('types');
        setCurrentType(type as Type);
    }

    setTitle();
    resetPokemonState();
    resetTimer();
    setGameSelectionState(null);
    startGame();
    scrollToTop();
  };

  return {
    setFullQuiz,
    setGenQuiz,
    setTitle,
    setTypeOrSpecial,
    setTypeQuiz,
  };
};
