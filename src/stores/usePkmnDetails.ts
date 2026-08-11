import { acceptHMRUpdate, defineStore } from 'pinia';
import { PokemonClient, type Pokemon, type PokemonSpecies, type PokemonAbility } from 'pokenode-ts';
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { usePokemons } from '@/stores/usePokemons.ts';
import type { PokemonDetails, PokemonInfo, AbilityInfo } from '@/types.ts';
import { abilityUrl } from '@/utils/utils.ts';

interface PkmnDetails {
  currentPokemon: PokemonDetails | null;
  detailsMap: Map<string, PokemonDetails>;
  error: string | null;
  isOpen: boolean;
  loading: boolean;
}

export const usePkmnDetails = defineStore('pkmnDetails', () => {
  const { locale } = useI18n();
  const pkmnDetailsState = reactive<PkmnDetails>({
    currentPokemon: null,
    detailsMap: new Map<string, PokemonDetails>(),
    error: null,
    isOpen: false,
    loading: false,
  });

  const api = new PokemonClient();

  watch(locale, () => {
    pkmnDetailsState.detailsMap.clear();
  });

  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case 'jp':
        return 'ja';
      case 'zh':
        return 'zh-Hant';
      case 'cn':
        return 'zh-Hans';
      case 'pt':
        return 'pt-BR';
      default:
        return lang;
    }
  };

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
    const lang = getLanguageCode(locale.value);
    const descriptionEntry =
      speciesData.flavor_text_entries.find((entry) => entry.language.name === lang) ??
      speciesData.flavor_text_entries.find((entry) => entry.language.name === 'en');
    return descriptionEntry ? descriptionEntry.flavor_text.replace(/\f/g, ' ') : '';
  };

  const fetchSpecies = (speciesData: PokemonSpecies): string => {
    const lang = getLanguageCode(locale.value);
    const speciesEntry =
      speciesData.genera.find((entry) => entry.language.name === lang) ??
      speciesData.genera.find((entry) => entry.language.name === 'en');
    return speciesEntry ? speciesEntry.genus : '';
  };

  const fetchName = (speciesData: PokemonSpecies): string => {
    const lang = getLanguageCode(locale.value);
    const nameEntry =
      speciesData.names.find((entry) => entry.language.name === lang) ??
      speciesData.names.find((entry) => entry.language.name === 'en');
    return nameEntry ? nameEntry.name : '';
  };

  const fetchGenderRatio = (speciesData: PokemonSpecies) =>
    speciesData.gender_rate === -1
      ? 'genderless'
      : {
          female: (speciesData.gender_rate / 8) * 100,
          male: ((8 - speciesData.gender_rate) / 8) * 100,
        };

  const getArtwork = (pokemonData: Pokemon, isShiny: boolean) => {
    const artwork = pokemonData.sprites.other?.['official-artwork'];
    // @ts-ignore
    return (isShiny ? artwork?.front_shiny : artwork?.front_default) ?? artwork?.front_default ?? '';
  };

  const buildResponse = ({
    pokemonData,
    speciesData,
    internalInfo,
    abilitiesData,
  }: {
    pokemonData: Pokemon;
    speciesData: PokemonSpecies;
    internalInfo: PokemonInfo;
    abilitiesData: AbilityInfo[];
  }): PokemonDetails => {
    const { getStatus } = usePokemons();
    const status = getStatus(internalInfo);
    const isShiny = status.isShiny;

    const pokemonStats = convertStats(pokemonData.stats);
    const description = fetchDescription(speciesData);
    const species = fetchSpecies(speciesData);
    const name = fetchName(speciesData);
    const genderRatio = fetchGenderRatio(speciesData);
    const artwork = getArtwork(pokemonData, isShiny);

    return {
      ...internalInfo,
      abilities: abilitiesData,
      artwork,
      baseName: name,
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
  };

  const fetchAbilityDetails = async (abilities: PokemonAbility[]) => {
    const lang = getLanguageCode(locale.value);

    return await Promise.all(
      abilities.map(async (ability) => {
        const abilityResponse = await api.getAbilityByName(ability.ability.name);
        const abilityEntry =
          abilityResponse.effect_entries.find((entry) => entry.language.name === lang) ??
          abilityResponse.effect_entries.find((entry) => entry.language.name === 'en');
        return {
          effect: abilityEntry?.effect ?? '',
          name: abilityResponse.name,
          url: abilityUrl(abilityResponse.name),
        };
      }),
    );
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

      // 4. Fetch abilities and other details from the species data
      const abilitiesResponse = await fetchAbilityDetails(pokemonResponse.abilities);

      const response = buildResponse({
        abilitiesData: abilitiesResponse,
        internalInfo,
        pokemonData: pokemonResponse,
        speciesData: speciesResponse,
      });
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
    pkmnDetailsState.currentPokemon = null;
    pkmnDetailsState.isOpen = true;

    if (details) {
      pkmnDetailsState.currentPokemon = details;
      return;
    }

    try {
      pkmnDetailsState.loading = true;
      pkmnDetailsState.currentPokemon = await fetchPokemon(id);
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
