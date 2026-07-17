<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import PokemonSprite from '@/components/game/PokemonSprite.vue';
import { useBoxes } from '@/composables/useBoxes.ts';
import { boxes } from '@/data/boxes.js';
import { specialTypes } from '@/data/specialTypes.ts';
import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { useState } from '@/stores/useState.ts';
import type { SpecialType, RegionBox, PokemonInfo } from '@/types.ts';

const { getCurrentGameModeBoxes, getSpecialBoxes } = useBoxes();
const { getCurrentGameModeBoxPokemon, getSpecialTypePokemon, getStatus, getMegaPokemon } = usePokemons();
const { currentBoxState } = useCurrentBox();
const { state } = useState();
const { t } = useI18n();

const currentBoxes = computed(() => {
  switch (state.gameMode) {
    case 'special':
      const specialGameModeBoxes = getSpecialBoxes();
      return specialGameModeBoxes?.map((box) => specialTypes[box]);
    default:
      const currentGameModeBoxes = getCurrentGameModeBoxes();
      return currentGameModeBoxes?.map((box) => boxes[box]);
  }
});

function orderByFoundAt(pokemonA: PokemonInfo, pokemonB: PokemonInfo): number {
  const statusA = getStatus(pokemonA);
  const statusB = getStatus(pokemonB);

  if (!statusA.lastFoundAt && statusB.lastFoundAt) {
    return 1; // pokemonA should come after pokemonB
  } else if (statusA.lastFoundAt && !statusB.lastFoundAt) {
    return -1; // pokemonA should come before pokemonB
  } else if (!statusA.lastFoundAt && !statusB.lastFoundAt) {
    return 0; // maintain original order
  } else {
    return statusA.lastFoundAt! - statusB.lastFoundAt!;
  }
}

const getCurrentGamePokemon = (boxId: SpecialType | RegionBox): Map<string, PokemonInfo[]> => {
  let result;

  switch (state.gameMode) {
    case 'special':
      result = getSpecialTypePokemon(boxId as SpecialType);
      break;
    case 'mega':
      result = getMegaPokemon(boxId as RegionBox);
      break;
    default:
      result = getCurrentGameModeBoxPokemon(boxId as RegionBox);
      break;
  }

  // Apply chaos mode sorting
  if (state.mode === 'chaos') {
    const entries = Array.from(result.entries());
    entries.sort(([, pokemonsA], [, pokemonsB]) => orderByFoundAt(pokemonsA[0], pokemonsB[0]));
    return new Map(entries);
  }

  return result;
};

const getBoxPokemons = (boxId: SpecialType | RegionBox): PokemonInfo[] => {
  const pokemonByName = getCurrentGamePokemon(boxId);
  return Array.from(pokemonByName.values()).map((pokemons) => pokemons[0]);
};

const isFull = (boxId: SpecialType | RegionBox) => {
  const pokemons = getBoxPokemons(boxId);
  return pokemons.every((pokemon) => getStatus(pokemon).isFound);
};

const isDimmed = (boxId: SpecialType | RegionBox) => {
  if (!state.withBoxShuffle) return false;

  switch (state.gameMode) {
    case 'special':
      return currentBoxState.currentSpecialBox !== boxId;
    case 'mega':
      return currentBoxState.currentMegaBox !== boxId;
    default:
      return currentBoxState.currentBox !== boxId;
  }
};
</script>

<template>
  <div
    class="region-boxes"
    :class="state.gameMode"
  >
    <RoundedBox
      v-for="(box, index) in currentBoxes"
      :key="box.id"
      v-motion
      :initial="{ opacity: 0, y: 50 }"
      :animate="{
        opacity: 1,
        y: 0,
        transition: {
          delay: index * 0.05,
          duration: 0.4,
        },
      }"
      class="region-box"
      :class="{
        full: isFull(box.id),
        dimmed: isDimmed(box.id),
      }"
    >
      <span class="region-name">{{ t(box.id) }}</span>

      <div class="sprite-container">
        <PokemonSprite
          v-for="(pokemon, index) in getBoxPokemons(box.id)"
          :key="pokemon.id"
          :pokemon="pokemon"
          :status="getStatus(pokemon)"
          :index="index"
        />
      </div>
    </RoundedBox>
  </div>
</template>

<style scoped>
.region-boxes {
  display: block;
  margin: 10px;
  max-width: var(--max-width);
  columns: var(--col-width, auto) var(--num-cols, auto);
  column-gap: 10px;

  & .region-box {
    display: inline-flex;
    width: 100%;
    margin: 0 0 10px;
    padding: 12px 12px 12px 10px;
    break-inside: avoid;
    border-radius: 3px 20px;
  }

  &.types,
  &.full {
    --max-width: none;
    --num-cols: auto;
    --col-width: 25vh;
    --sprite-width: 57px;
    --text-padding: 0;
  }

  &.special {
    --max-width: 66%;
    --num-cols: 2;
    --sprite-width: 62px;
    --text-padding: 10px;
  }

  &.mega {
    --max-width: 66%;
    --num-cols: 1;
    --sprite-width: 62px;
    --text-padding: 10px;
  }

  &.gen {
    --max-width: 66%;
    --num-cols: 1;
    --sprite-width: 64px;
    --text-padding: 10px;
  }

  .laptop & {
    max-width: 100%;
    columns: 1;
  }
}

.region-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  max-height: inherit;
  margin: 10px;
  border: none;

  transform: translate3d(0, 0, 0.1px);
  will-change: transform, visibility;
  transform-style: preserve-3d;
  transition: box-shadow 0.2s ease-in-out;
  box-shadow: 0 10px 20px -5px var(--glow);

  &:hover {
    --glow: var(--type-btn-color, var(--primary));
  }

  &.full {
    box-shadow: 0 0 0 2px var(--type-btn-color, var(--primary)) inset;
  }

  &.dimmed {
    pointer-events: none;
    filter: brightness(0.5) saturate(0.5);
  }
}

.region-name {
  color: var(--text);
  padding-left: 10px;
}

.sprite-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  height: 100%;
  line-height: 26px;
}

.sprite-container > *:has(.shadowed) {
  filter: brightness(calc(0.9 + 0.2 * cos(sibling-index() * 1.5)));
}
</style>
