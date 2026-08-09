import { acceptHMRUpdate, defineStore } from 'pinia';
import { PokemonClient } from 'pokenode-ts';
import { reactive } from 'vue';

import type { PokemonDetails } from '@/types.ts';

interface PkmnDetails {
  currentPokemon: PokemonDetails | null;
  detailsMap: Map<string, PokemonDetails>;
  error: string | null;
  isOpen: boolean;
}

export const usePkmnDetails = defineStore('pkmnDetails', () => {
  const pkmnDetailsState = reactive<PkmnDetails>({
    currentPokemon: null,
    detailsMap: new Map<string, PokemonDetails>(),
    error: null,
    isOpen: false,
  });

  const api = new PokemonClient();

  const setOpen = (isOpen: boolean) => {
    pkmnDetailsState.isOpen = isOpen;
  };

  const fetchPokemon = async (id: string) => {
    const response = await api.getPokemonByName(id);
    if (response) {
      pkmnDetailsState.detailsMap.set(id, response);
    }
    return response;
  };

  const displayPokemonDetails = async (id: string) => {
    const details = pkmnDetailsState.detailsMap.get(id);

    if (details) {
      pkmnDetailsState.currentPokemon = details;
      setOpen(true);
      return;
    }

    const fetchedDetails = await fetchPokemon(id);
    if (fetchedDetails) {
      pkmnDetailsState.currentPokemon = fetchedDetails;
      setOpen(true);
      return;
    } else {
      pkmnDetailsState.error = `Failed to fetch details for Pokémon with ID: ${id}`;
    }
  };

  return {
    displayPokemonDetails,
    pkmnDetailsState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePkmnDetails, import.meta.hot));
}
