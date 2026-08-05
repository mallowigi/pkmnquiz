import { useFetch } from '@vueuse/core';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { reactive, ref } from 'vue';

import type { PokemonDetails } from '@/types.ts';

interface PkmnDetails {
  detailsMap: Map<string, PokemonDetails>;
  isOpen: boolean;
}

export const usePkmnDetails = defineStore('pkmnDetails', () => {
  const pkmnDetailsState = reactive<PkmnDetails>({
    detailsMap: new Map<string, PokemonDetails>(),
    isOpen: false,
  });

  const POKEAPI_URL = 'https://pokeapi.co/api/v2';

  const pokemonUrl = ref(`${POKEAPI_URL}/pokemon/`);
  // const pokemonSpeciesUrl = ref(`${POKEAPI_URL}/pokemon-species/`);

  const pokemonFetcher = useFetch(pokemonUrl, { immediate: false });
  // const pokemonSpeciesFetcher = useFetch(pokemonSpeciesUrl, { immediate: false, refetch: true });

  const setOpen = (isOpen: boolean) => {
    pkmnDetailsState.isOpen = isOpen;
  };

  const getDetails = (id: string) => {
    return pkmnDetailsState.detailsMap.get(id);
  };

  const fetchPokemon = (id: string) => {
    return useFetch(`${POKEAPI_URL}/pokemon/${id}`, {
      afterFetch: (response) => {
        console.log('Fetched Pokemon Data:', response.data);
        // Need to parse the API though
        pkmnDetailsState.detailsMap.set(id, response.data);
        return response;
      },
      immediate: false,
    });
  };

  return {
    fetchPokemon,
    getDetails,
    pkmnDetailsState,
    pokemonFetcher,
    setOpen,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePkmnDetails, import.meta.hot));
}
