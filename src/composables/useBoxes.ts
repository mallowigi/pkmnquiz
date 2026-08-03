import { gens } from '@/data/gens.ts';
import { specialTypes } from '@/data/specialTypes.ts';
import { useCurrentGen } from '@/stores/useCurrentGen.ts';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { usePkmnData } from '@/stores/usePkmnStore.ts';
import { useState } from '@/stores/useState.ts';

export const useBoxes = () => {
  const { state } = useState();
  const { getCurrentGens } = useCurrentGen();
  const { data } = usePkmnData();
  const { getCurrentTypes } = useCurrentType();

  const getCurrentGenBoxes = () => {
    const currentGens = getCurrentGens();
    if (!currentGens) return [];

    return currentGens.map((gen) => gens[gen.id].boxes).flat();
  };

  const getAllBoxes = () => {
    return Object.values(gens).flatMap((gen) => gen.boxes);
  };

  const getCurrentTypeBoxes = () => {
    const currentTypes = getCurrentTypes();
    if (!currentTypes) return [];

    return getAllBoxes().filter((box) => {
      return data.pokemon?.some((pkmn) => {
        const types = [pkmn.primaryType, pkmn.secondaryType].filter(Boolean);
        return pkmn.box === box && types.some((type) => currentTypes.some((currentType) => currentType.id === type));
      });
    });
  };

  const getSpecialBoxes = () => {
    return Object.values(specialTypes)
      .filter((specialType) => specialType.id !== 'no')
      .sort((a, b) => a.index - b.index)
      .flatMap((type) => type.id);
  };

  const getMegaBoxes = () => {
    return getAllBoxes().filter((box) => {
      return data.pokemon?.some((pkmn) => {
        return pkmn.box === box && !!pkmn.megaType;
      });
    });
  };

  const getCurrentGameModeBoxes = () => {
    switch (state.gameMode) {
      case 'gen':
        return getCurrentGenBoxes();
      case 'full':
        return getAllBoxes();
      case 'types':
        return getCurrentTypeBoxes();
      case 'mega':
        return getMegaBoxes();
      default:
        return [];
    }
  };

  return {
    getAllBoxes,
    getCurrentGameModeBoxes,
    getCurrentGenBoxes,
    getMegaBoxes,
    getSpecialBoxes,
  };
};
