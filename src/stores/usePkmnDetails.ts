import { acceptHMRUpdate, defineStore } from 'pinia';
import { PokemonClient, type Pokemon, type PokemonSpecies } from 'pokenode-ts';
import { reactive } from 'vue';

import { usePokemons } from '@/stores/usePokemons.ts';
import type { PokemonDetails, PokemonInfo } from '@/types.ts';

interface PkmnDetails {
  currentPokemon: PokemonDetails | null;
  detailsMap: Map<string, PokemonDetails>;
  error: string | null;
  isOpen: boolean;
  loading: boolean;
}

export const usePkmnDetails = defineStore('pkmnDetails', () => {
  const pkmnDetailsState = reactive<PkmnDetails>({
    currentPokemon: null,
    detailsMap: new Map<string, PokemonDetails>(),
    error: null,
    isOpen: false,
    loading: false,
  });

  const api = new PokemonClient();

  const convertStats = (stats: Pokemon['stats']): PokemonDetails['stats'] => {
    return stats.reduce(
      (acc, stat) => {
        switch (stat.stat.name) {
          case 'hp':
            acc.hp = stat.base_stat;
            break;
          case 'attack':
            acc.atk = stat.base_stat;
            break;
          case 'defense':
            acc.def = stat.base_stat;
            break;
          case 'special-attack':
            acc.spAtk = stat.base_stat;
            break;
          case 'special-defense':
            acc.spDef = stat.base_stat;
            break;
          case 'speed':
            acc.speed = stat.base_stat;
            break;
          default:
            break;
        }
        return acc;
      },
      {} as PokemonDetails['stats'],
    );
  };

  const fetchDescription = (speciesData: PokemonSpecies): string => {
    // todo use current language
    const descriptionEntry = speciesData.flavor_text_entries.find((entry) => entry.language.name === 'en');
    return descriptionEntry ? descriptionEntry.flavor_text.replace(/\f/g, ' ') : '';
  };

  const computeGenderRatio = (speciesData: PokemonSpecies) =>
    speciesData.gender_rate === -1
      ? 'genderless'
      : {
          female: (speciesData.gender_rate / 8) * 100,
          male: ((8 - speciesData.gender_rate) / 8) * 100,
        };

  const buildResponse = (
    pokemonData: Pokemon,
    speciesData: PokemonSpecies,
    internalInfo: PokemonInfo,
  ): PokemonDetails => {
    const pokemonStats = convertStats(pokemonData.stats);
    const description = fetchDescription(speciesData);
    const species = speciesData.genera.find((g) => g.language.name === 'en')?.genus ?? '';
    const abilities = pokemonData.abilities.map((a) => a.ability.name);
    const genderRatio: PokemonDetails['genderRatio'] = computeGenderRatio(speciesData);

    return {
      ...internalInfo,
      abilities,
      artwork: pokemonData.sprites.other?.['official-artwork'].front_default ?? '',
      catchRate: speciesData.capture_rate,
      description,
      genderRatio,
      height: pokemonData.height / 10, // Convert to meters
      species,
      stats: pokemonStats,
      weight: pokemonData.weight / 10, // Convert to kg
    };
  };

  const closeDetails = () => {
    pkmnDetailsState.isOpen = false;
    pkmnDetailsState.currentPokemon = null;
  };

  const fetchPokemon = async (id: string) => {
    const { findPokemon } = usePokemons();
    const internalInfo = findPokemon(id)?.[0];

    if (!internalInfo) {
      throw new Error(`Pokémon not found in local data: ${id}`);
    }

    try {
      // 1. Fetch species data using dex number to get all varieties
      const speciesResponse = await api.getPokemonSpeciesByName(internalInfo.dexNum.toString());

      // 2. Find the correct variety that matches our internal ID
      // Mapping: charizardmegax -> charizard-mega-x
      const targetVariety = speciesResponse.varieties.find((v) => {
        const varietyName = v.pokemon.name.replace(/-/g, '');
        return varietyName === id.toLowerCase();
      });

      const pokemonName = targetVariety?.pokemon.name ?? speciesResponse.name;

      // 3. Fetch specific pokemon details for that variety
      const pokemonResponse = await api.getPokemonByName(pokemonName);

      const response = buildResponse(pokemonResponse, speciesResponse, internalInfo);
      pkmnDetailsState.detailsMap.set(id, response);
      return response;
    } catch (e) {
      console.error('Failed to fetch pokemon details:', e);
      throw e;
    }
  };

  const displayPokemonDetails = async (id: string) => {
    const details = pkmnDetailsState.detailsMap.get(id);

    pkmnDetailsState.error = null;
    pkmnDetailsState.isOpen = true;

    if (details) {
      pkmnDetailsState.currentPokemon = details;
      return;
    }

    try {
      pkmnDetailsState.loading = true;
      const fetchedDetails = await fetchPokemon(id);
      pkmnDetailsState.currentPokemon = fetchedDetails;
    } catch (e) {
      pkmnDetailsState.error = `Failed to fetch details for Pokémon with ID: ${id}. Error: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      pkmnDetailsState.loading = false;
    }
  };

  return {
    closeDetails,
    displayPokemonDetails,
    pkmnDetailsState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePkmnDetails, import.meta.hot));
}
