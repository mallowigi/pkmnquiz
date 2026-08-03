import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState.ts';

export const useShuffles = () => {
  const { state } = useState();
  const { setShuffledType } = useCurrentType();
  const { setCurrentBox, setCurrentSpecialBox, setCurrentMegaBox } = useCurrentBox();
  const { getRandomRemainingPokemon } = usePokemons();

  const updateShuffles = () => {
    if (!state.withTypeShuffle && !state.withBoxShuffle) return;

    const remainingPokemon = getRandomRemainingPokemon();
    if (!remainingPokemon) return;

    if (state.withTypeShuffle) {
      let randomType;
      if (!remainingPokemon.secondaryType) {
        randomType = remainingPokemon.primaryType;
      } else {
        randomType = Math.random() < 0.5 ? remainingPokemon.primaryType : remainingPokemon.secondaryType;
      }
      setShuffledType(randomType);
    }

    if (state.withBoxShuffle) {
      setCurrentBox(remainingPokemon.box);
      setCurrentSpecialBox(remainingPokemon.specialType);
      setCurrentMegaBox(remainingPokemon.box);
    }
  };

  return {
    updateShuffles,
  };
};
