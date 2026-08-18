// noinspection JSUnfilteredForInLoop

import { useVibrate } from '@vueuse/core';
import { closest } from 'fastest-levenshtein';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed } from 'vue';

import { usePlaySounds } from '@/composables/usePlaySounds.ts';
import { useBonus } from '@/stores/useBonus.ts';
import { useCurrentBox } from '@/stores/useCurrentBox';
import { useCurrentGen } from '@/stores/useCurrentGen';
import { useCurrentType } from '@/stores/useCurrentType';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePkmnData } from '@/stores/usePkmnStore';
import { useSettings } from '@/stores/useSettings.ts';
import { useState } from '@/stores/useState';
import { useTimer } from '@/stores/useTimer.ts';
import { useTouches } from '@/stores/useTouches.ts';
import type {
  PokemonInfo,
  PokemonProgressState,
  RegionBox,
  SpecialType,
  Type,
  Language,
  PokemonStatus,
  MegaType,
} from '@/types.ts';
import { normalizeName, upsert } from '@/utils/utils.ts';

type PokemonMaps = {
  all: Map<string, Array<PokemonInfo>>;
  allMega: Map<string, Array<PokemonInfo>>;
  allSpecials: Map<string, Array<PokemonInfo>>;
  boxes: Record<RegionBox, Map<string, Array<PokemonInfo>>>;
  languages: Record<Language, Map<string, Array<PokemonInfo>>>;
  mega: Record<MegaType, Map<string, Array<PokemonInfo>>>;
  special: Record<SpecialType, Map<string, Array<PokemonInfo>>>;
  types: Record<Type, Map<string, Array<PokemonInfo>>>;
};

const pokemonMaps: PokemonMaps = {
  all: new Map<string, Array<PokemonInfo>>(),
  allMega: new Map<string, Array<PokemonInfo>>(),
  allSpecials: new Map<string, Array<PokemonInfo>>(),
  boxes: {
    alola: new Map<string, Array<PokemonInfo>>(),
    areazero: new Map<string, Array<PokemonInfo>>(),
    galar: new Map<string, Array<PokemonInfo>>(),
    gmax: new Map<string, Array<PokemonInfo>>(),
    hisui: new Map<string, Array<PokemonInfo>>(),
    hoenn: new Map<string, Array<PokemonInfo>>(),
    hoennmega: new Map<string, Array<PokemonInfo>>(),
    hyperspace: new Map<string, Array<PokemonInfo>>(),
    johto: new Map<string, Array<PokemonInfo>>(),
    kalos: new Map<string, Array<PokemonInfo>>(),
    kalosmega: new Map<string, Array<PokemonInfo>>(),
    kanto: new Map<string, Array<PokemonInfo>>(),
    lumiose: new Map<string, Array<PokemonInfo>>(),
    paldea: new Map<string, Array<PokemonInfo>>(),
    pokemongo: new Map<string, Array<PokemonInfo>>(),
    sinnoh: new Map<string, Array<PokemonInfo>>(),
    unova: new Map<string, Array<PokemonInfo>>(),
  },
  languages: {
    cn: new Map<string, Array<PokemonInfo>>(),
    de: new Map<string, Array<PokemonInfo>>(),
    en: new Map<string, Array<PokemonInfo>>(),
    fr: new Map<string, Array<PokemonInfo>>(),
    ja: new Map<string, Array<PokemonInfo>>(),
    ko: new Map<string, Array<PokemonInfo>>(),
    zh: new Map<string, Array<PokemonInfo>>(),
  },
  mega: {
    gmax: new Map<string, Array<PokemonInfo>>(),
    mega: new Map<string, Array<PokemonInfo>>(),
  },
  special: {
    legendary: new Map<string, Array<PokemonInfo>>(),
    mythical: new Map<string, Array<PokemonInfo>>(),
    no: new Map<string, Array<PokemonInfo>>(),
    paradox: new Map<string, Array<PokemonInfo>>(),
    sublegendary: new Map<string, Array<PokemonInfo>>(),
    ultrabeast: new Map<string, Array<PokemonInfo>>(),
  },
  types: {
    bug: new Map<string, Array<PokemonInfo>>(),
    dark: new Map<string, Array<PokemonInfo>>(),
    dragon: new Map<string, Array<PokemonInfo>>(),
    electric: new Map<string, Array<PokemonInfo>>(),
    fairy: new Map<string, Array<PokemonInfo>>(),
    fighting: new Map<string, Array<PokemonInfo>>(),
    fire: new Map<string, Array<PokemonInfo>>(),
    flying: new Map<string, Array<PokemonInfo>>(),
    ghost: new Map<string, Array<PokemonInfo>>(),
    grass: new Map<string, Array<PokemonInfo>>(),
    ground: new Map<string, Array<PokemonInfo>>(),
    ice: new Map<string, Array<PokemonInfo>>(),
    normal: new Map<string, Array<PokemonInfo>>(),
    poison: new Map<string, Array<PokemonInfo>>(),
    psychic: new Map<string, Array<PokemonInfo>>(),
    rock: new Map<string, Array<PokemonInfo>>(),
    steel: new Map<string, Array<PokemonInfo>>(),
    water: new Map<string, Array<PokemonInfo>>(),
  },
};

export const usePokemons = defineStore('pokemons', () => {
  const pokemonState = reactive<PokemonProgressState>({
    currentPokemon: null,
    lastIndex: null,
    lastPokemon: null,
    pokemonStatuses: new Map<string, PokemonStatus>(),
    shinyRate: 0.01,
  });
  const { state, hideShadows } = useState();
  const { getCurrentGens } = useCurrentGen();
  const { getShuffledType, getCurrentTypes } = useCurrentType();
  const { getCurrentBoxes } = useCurrentBox();
  const { settingsState } = useSettings();
  const { isChallengeMode } = useGameFlow();
  const { startTimer } = useTimer();
  const { addShinyDiscovered, summonedShadow } = useTouches();
  const { playShiny } = usePlaySounds();
  const { vibrate } = useVibrate();
  const { addScore } = useBonus();

  const numFound = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    return currentGameModePokemon.size - remaining.value.size;
  });

  const numShadows = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    return currentGameModePokemon.size - remainingShadow.value.size;
  });

  const remaining = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    const result = new Set<string>();

    for (const [name] of currentGameModePokemon) {
      const status = pokemonState.pokemonStatuses.get(name);
      if (status && !status.isFound) {
        result.add(name);
      }
    }
    return result;
  });

  const remainingShadow = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    const result = new Set<string>();

    for (const [name] of currentGameModePokemon) {
      const status = pokemonState.pokemonStatuses.get(name);
      if (status && !status.isShadowed) {
        result.add(name);
      }
    }
    return result;
  });

  const missed = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    const result = new Set<PokemonInfo>();

    for (const [name, pokemonInfo] of currentGameModePokemon) {
      const status = pokemonState.pokemonStatuses.get(name);
      if (status && status.isMissed) {
        result.add(pokemonInfo[0]);
      }
    }
    return result;
  });

  const remainingHead = computed(() => {
    const currentGameModePokemon = getCurrentGameModePokemon();
    const remainingArray = Array.from(remaining.value);
    if (remainingArray.length === 0) return null;

    const nextPokemonKey = remainingArray[0];
    const nextPokemon = currentGameModePokemon.get(nextPokemonKey);
    return nextPokemon ? nextPokemon[0] : null;
  });

  const initializePokemonMaps = () => {
    const { data } = usePkmnData();
    if (pokemonMaps.all.size > 0) return;

    if (!data || !data.isLoaded || !data.pokemon || !data.translations) {
      throw new Error('Pokemon data or translations not loaded');
    }

    data.pokemon.forEach((pokemon) => {
      const pokemonKey = normalizeName(pokemon.baseName);
      if (!pokemonKey) return;

      if (data.spriteCycles?.[pokemonKey]) {
        pokemon.sprites = data.spriteCycles[pokemonKey];
      }

      upsert(pokemonMaps.all, pokemonKey, pokemon);

      if (!pokemonState.pokemonStatuses.has(pokemonKey)) {
        pokemonState.pokemonStatuses.set(pokemonKey, {
          isFound: false,
          isMissed: false,
          isShadowed: false,
          isShiny: false,
          lastFoundAt: null,
          lastShadowedAt: null,
        });
      }

      if (pokemon.box) {
        upsert(pokemonMaps.boxes[pokemon.box], pokemonKey, pokemon);
      }

      if (pokemon.specialType) {
        upsert(pokemonMaps.special[pokemon.specialType], pokemonKey, pokemon);
        upsert(pokemonMaps.allSpecials, pokemonKey, pokemon);
      } else {
        upsert(pokemonMaps.special.no, pokemonKey, pokemon);
      }

      if (pokemon.megaType) {
        upsert(pokemonMaps.mega[pokemon.megaType], pokemonKey, pokemon);
        upsert(pokemonMaps.allMega, pokemonKey, pokemon);
      }

      if (pokemon.primaryType) {
        upsert(pokemonMaps.types[pokemon.primaryType], pokemonKey, pokemon);
      }

      if (pokemon.secondaryType) {
        upsert(pokemonMaps.types[pokemon.secondaryType], pokemonKey, pokemon);
      }

      for (const lang in pokemonMaps.languages) {
        const translations = data.translations![pokemonKey];
        const translation = translations?.[lang as Language];
        if (translation) {
          const translationKey = normalizeName(translation);
          if (translationKey) {
            upsert(pokemonMaps.languages[lang as Language], translationKey, pokemon);
          }
        }
      }
    });
  };

  const getShinyRate = () => {
    let rate = pokemonState.shinyRate;
    if (settingsState.withShinies) {
      rate *= 10;
    }

    if (isChallengeMode) {
      rate *= 2;
    }

    return rate;
  };

  const addFound = (pokemons: PokemonInfo[]) => {
    const { endGame } = useGameFlow();

    pokemons.forEach((pokemon) => {
      const normalizedPokemon = normalizeName(pokemon.baseName);
      const status = pokemonState.pokemonStatuses.get(normalizedPokemon);

      if (status && !status.isFound) {
        addScore(status.isShadowed);
        status.isFound = true;
        status.lastFoundAt = Date.now();
        vibrate(300);

        const shinyRandom = Math.random();
        const shinyRate = getShinyRate();
        if (shinyRandom < shinyRate) {
          status.isShiny = true;
          addShinyDiscovered();
          playShiny(pokemon);
          vibrate(700);
        }

        startTimer();
      }
    });

    setLastPokemon(pokemons[0]);

    if (remaining.value.size === 0) {
      endGame();
    }
  };

  const addShadow = (pokemon: string) => {
    const normalizedPokemon = normalizeName(pokemon);
    const status = pokemonState.pokemonStatuses.get(normalizedPokemon);
    if (status) {
      status.isShadowed = true;
      status.lastShadowedAt = Date.now();
      startTimer();
      summonedShadow();
    }
  };

  const setLastPokemon = (pokemon: PokemonInfo) => {
    pokemonState.lastPokemon = pokemon;
  };

  const addRandomShadow = () => {
    const nextShadowPokemon = getRandomPokemon();

    if (nextShadowPokemon) {
      addShadow(nextShadowPokemon.baseName);
    }
  };

  const getRandomPokemon = () => {
    let remainingArray = Array.from(remaining.value);
    const currentType = getShuffledType();
    const { currentSpecialBox, currentBox } = getCurrentBoxes();

    if (state.withTypeShuffle && currentType) {
      const typePokemon = pokemonMaps.types[currentType.id as Type];
      if (typePokemon) {
        remainingArray = remainingArray.filter((pokemon) => typePokemon.has(pokemon));
      }
    }

    if (state.withBoxShuffle) {
      switch (state.gameMode) {
        case 'special':
          const specialPokemon = pokemonMaps.special[currentSpecialBox as SpecialType];
          if (specialPokemon) {
            remainingArray = remainingArray.filter((pokemon) => specialPokemon.has(pokemon));
          }
          break;
        case 'mega':
          const megaPokemon = pokemonMaps.boxes[currentBox as RegionBox];
          if (megaPokemon) {
            remainingArray = remainingArray.filter((pokemon) => megaPokemon.has(pokemon));
          }
          break;
        default:
          const boxPokemon = pokemonMaps.boxes[currentBox as RegionBox];
          if (boxPokemon) {
            remainingArray = remainingArray.filter((pokemon) => boxPokemon.has(pokemon));
          }
          break;
      }
    }

    if (remainingArray.length === 0) return;

    let nextPokemon = null;
    let maxIterations = 100;
    let iterationCount = 0;

    if (state.mode === 'order') {
      nextPokemon = remainingArray[0];
      return pokemonMaps.all.get(nextPokemon)?.[0];
    }

    while (!nextPokemon && iterationCount < maxIterations) {
      const randomIndex = Math.floor(Math.random() * remainingArray.length);
      const randomPokemon = remainingArray[randomIndex];

      const status = pokemonState.pokemonStatuses.get(randomPokemon);
      if (status?.isShadowed) {
        iterationCount++;
        continue;
      }

      nextPokemon = randomPokemon;
      return pokemonMaps.all.get(nextPokemon)?.[0];
    }
  };

  const showRemainingShadows = () => {
    for (const pokemonStatus of pokemonState.pokemonStatuses.values()) {
      if (!pokemonStatus.isShadowed) {
        pokemonStatus.isShadowed = true;
        pokemonStatus.lastShadowedAt = Date.now();
      }
    }
  };

  const showRemaining = () => {
    for (const pokemonStatus of pokemonState.pokemonStatuses.values()) {
      if (!pokemonStatus.isFound) {
        pokemonStatus.isMissed = true;
        pokemonStatus.isFound = true;
        pokemonStatus.lastFoundAt = Date.now();
      }
    }
  };

  const prefillRemaining = () => {
    const remainingArray = Array.from(remaining.value);
    if (remainingArray.length <= 1) return;

    for (let i = 0; i < remainingArray.length - 1; i++) {
      const pokemonKey = remainingArray[i];
      const status = pokemonState.pokemonStatuses.get(pokemonKey);
      if (status) {
        status.isFound = true;
        status.lastFoundAt = Date.now();
      }
    }

    const lastPrefilledKey = remainingArray[remainingArray.length - 2];
    const lastPrefilled = getCurrentGameModePokemon().get(lastPrefilledKey);
    if (lastPrefilled) {
      setLastPokemon(lastPrefilled[0]);
    }
  };

  const resetPokemonState = () => {
    pokemonState.lastPokemon = null;
    pokemonState.pokemonStatuses.forEach((status) => {
      status.isFound = false;
      status.lastFoundAt = null;
      status.isShadowed = false;
      status.lastShadowedAt = null;
      status.isShiny = false;
      status.isMissed = false;
    });

    hideShadows();
  };

  const getGenPokemon = (boxId: RegionBox): Map<string, PokemonInfo[]> => {
    return pokemonMaps.boxes[boxId] ?? new Map();
  };

  const getTypedBoxPokemon = (types: Type[], boxId: RegionBox): Map<string, PokemonInfo[]> => {
    const boxPokemon = pokemonMaps.boxes[boxId];
    if (!boxPokemon) return new Map();

    const result = new Map<string, PokemonInfo[]>();

    for (const [key, pokemons] of boxPokemon) {
      const filtered = pokemons.filter(
        (p) => types.includes(p.primaryType) || (p.secondaryType && types.includes(p.secondaryType)),
      );
      if (filtered.length > 0) {
        result.set(key, filtered);
      }
    }

    return result;
  };

  const getCurrentGenPokemon = (): Map<string, PokemonInfo[]> => {
    const currentGens = getCurrentGens();
    const currentGenBoxes = currentGens?.map((gen) => gen?.boxes ?? []).flat() ?? [];
    const result = new Map<string, PokemonInfo[]>();

    for (const boxId of currentGenBoxes) {
      const box = pokemonMaps.boxes[boxId];
      if (box) {
        for (const [key, pokemons] of box) {
          result.set(key, pokemons);
        }
      }
    }

    return result;
  };

  const getTypePokemon = (typeId: Type): Map<string, PokemonInfo[]> => {
    return pokemonMaps.types[typeId] ?? new Map();
  };

  const getCurrentTypePokemon = (): Map<string, PokemonInfo[]> => {
    const currentTypes = getCurrentTypes();
    if (!currentTypes) return new Map();

    return currentTypes
      .map((type) => getTypePokemon(type.id as Type))
      .reduce((acc, map) => {
        for (const [key, pokemons] of map) {
          if (!acc.has(key)) {
            acc.set(key, []);
          }
          acc.get(key)?.push(...pokemons);
        }
        return acc;
      }, new Map<string, PokemonInfo[]>());
  };

  const getSpecialTypePokemon = (specialTypeId?: SpecialType): Map<string, PokemonInfo[]> => {
    if (specialTypeId) {
      return pokemonMaps.special[specialTypeId] ?? new Map();
    }
    return pokemonMaps.allSpecials ?? new Map();
  };

  const getMegaPokemon = (boxId?: RegionBox): Map<string, PokemonInfo[]> => {
    if (boxId) {
      const boxPokemon = pokemonMaps.boxes[boxId];
      if (!boxPokemon) return new Map();

      const result = new Map<string, PokemonInfo[]>();

      for (const [key, pokemons] of boxPokemon) {
        const filtered = pokemons.filter((p) => p.megaType !== undefined);
        if (filtered.length > 0) {
          result.set(key, filtered);
        }
      }

      return result;
    }
    return pokemonMaps.allMega ?? new Map();
  };

  const getAllPokemon = (): Map<string, PokemonInfo[]> => {
    return pokemonMaps.all;
  };

  const getCurrentGameModePokemon = (): Map<string, PokemonInfo[]> => {
    const gameMode = state.gameMode;
    switch (gameMode) {
      case 'gen':
        return getCurrentGenPokemon();
      case 'types':
        return getCurrentTypePokemon();
      case 'special':
        return getSpecialTypePokemon();
      case 'mega':
        return getMegaPokemon();
      case 'full':
        return getAllPokemon();
      default:
        return new Map();
    }
  };

  const getCurrentGameModeBoxPokemon = (boxId: RegionBox): Map<string, PokemonInfo[]> => {
    const gameMode = state.gameMode;
    switch (gameMode) {
      case 'gen': {
        return getGenPokemon(boxId);
      }
      case 'types': {
        const types = getCurrentTypes();
        if (!types || types.length === 0) {
          return getGenPokemon(boxId);
        }

        const typeIds = types.map((type) => type.id);
        if (!typeIds || typeIds.length === 0) {
          return getGenPokemon(boxId);
        }

        return getTypedBoxPokemon(typeIds, boxId);
      }
      case 'mega':
        return getMegaPokemon(boxId);
      case 'full':
        return getGenPokemon(boxId);
      default:
        return new Map();
    }
  };

  const isPokemonInCurrentGameMode = (pokemons: PokemonInfo[]) => {
    return pokemons.some((pokemon: PokemonInfo) => {
      const gameMode = state.gameMode;
      switch (gameMode) {
        case 'gen': {
          const currentGens = getCurrentGens();
          return currentGens ? currentGens.some((gen) => gen?.boxes.includes(pokemon.box)) : false;
        }
        case 'types': {
          const currentTypes = getCurrentTypes();
          if (!currentTypes || currentTypes.length === 0) return false;

          const types = [pokemon.primaryType, pokemon.secondaryType].filter(Boolean);
          return types.some((type) => currentTypes.some((currentType) => currentType.id === type));
        }
        case 'special':
          return pokemon.specialType !== undefined && pokemon.specialType !== 'no';
        case 'mega':
          return pokemon.megaType !== undefined;
        case 'full':
          return true;
        default:
          return false;
      }
    });
  };

  const isInRemaining = (pokemonName: string) => {
    const pokemonKey = normalizeName(pokemonName);

    for (const lang of settingsState.languages) {
      const languageMap = pokemonMaps.languages[lang];
      if (!languageMap) continue;

      for (const [translatedKey, pokemons] of languageMap) {
        if (translatedKey.startsWith(pokemonKey) && translatedKey !== pokemonKey) {
          if (pokemons.some((p) => remaining.value.has(normalizeName(p.baseName)))) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const getStatus = (pokemon: PokemonInfo): PokemonStatus => {
    return (
      pokemonState.pokemonStatuses.get(normalizeName(pokemon.baseName)) ?? {
        isFound: false,
        isMissed: false,
        isShadowed: false,
        isShiny: false,
        lastFoundAt: null,
        lastShadowedAt: null,
      }
    );
  };

  const isAlreadyFound = (pokemons: PokemonInfo[]) => {
    return pokemons.every((pokemon) => {
      const status = getStatus(pokemon);
      return status.isFound;
    });
  };

  const findPokemon = (input: string) => {
    const pokemonKey = normalizeName(input);

    for (const lang of settingsState.languages) {
      const foundPokemon = pokemonMaps.languages[lang].get(pokemonKey);
      if (foundPokemon) {
        return foundPokemon;
      }
    }
  };

  const getNextOrderedPokemon = () => {
    const head = remainingHead.value;
    if (!head) return null;

    return head;
  };

  const isWrongOrder = (pokemons: PokemonInfo[]) => {
    const next = getNextOrderedPokemon();
    if (!next || !pokemons[0]) return false;

    return next.dexNum !== pokemons[0].dexNum;
  };

  const getLastPokemon = () => {
    return pokemonState.lastPokemon;
  };

  const getRandomRemainingPokemon = () => {
    const remainingArray = Array.from(remaining.value);
    if (remainingArray.length === 0) return null;
    const currentGameModePokemon = getCurrentGameModePokemon();

    const randomIndex = Math.floor(Math.random() * remainingArray.length);
    const randomPokemonKey = remainingArray[randomIndex];
    const randomPokemon = currentGameModePokemon.get(randomPokemonKey);
    return randomPokemon ? randomPokemon[0] : null;
  };

  const setRandomCurrentPokemon = () => {
    pokemonState.currentPokemon = getRandomRemainingPokemon();
  };

  const findClosestPokemon = (input: string): string | null => {
    const pokemonKey = normalizeName(input);
    const names = Array.from(getCurrentGameModePokemon().values()).map((pokemons) =>
      normalizeName(pokemons[0].baseName),
    );

    return closest(pokemonKey, names);
  };

  return {
    addFound,
    addRandomShadow,
    addShadow,
    findClosestPokemon,
    findPokemon,
    getCurrentGameModeBoxPokemon,
    getCurrentGameModePokemon,
    getLastPokemon,
    getMegaPokemon,
    getNextOrderedPokemon,
    getRandomPokemon,
    getRandomRemainingPokemon,
    getSpecialTypePokemon,
    getStatus,
    initializePokemonMaps,
    isAlreadyFound,
    isInRemaining,
    isPokemonInCurrentGameMode,
    isWrongOrder,
    missed,
    numFound,
    numShadows,
    pokemonState,
    prefillRemaining,
    resetPokemonState,
    setLastPokemon,
    setRandomCurrentPokemon,
    showRemaining,
    showRemainingShadows,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePokemons, import.meta.hot));
}
