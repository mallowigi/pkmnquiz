<script setup lang="ts">
import { computed } from 'vue';

import MorphTransition from '@/components/common/transitions/MorphTransition.vue';
import { useUnknownSprite } from '@/composables/useUnknownSprite.ts';
import { useLanguages } from '@/stores/useLanguages.ts';
import { usePkmnData } from '@/stores/usePkmnStore.ts';
import { usePokemons } from '@/stores/usePokemons.ts';

const { unknownSprite } = useUnknownSprite();
const { getLastPokemon, getStatus } = usePokemons();
const { data } = usePkmnData();
const { getTranslation } = useLanguages();

const lastPokemon = computed(() => getLastPokemon());

const lastPokemonStatus = computed(() => (lastPokemon.value ? getStatus(lastPokemon.value) : null));

const spriteData = computed(() => {
  const { sprites, shinies } = data;
  const lp = lastPokemon.value;
  if (!lp) {
    return {
      shiny: '',
      sprite: '',
    };
  }

  return {
    shiny: shinies?.[lp.id] ?? '',
    sprite: sprites?.[lp.id] ?? '',
  };
});

const bgImg = computed(() => {
  if (lastPokemon.value && lastPokemonStatus.value) {
    if (spriteData.value.shiny && lastPokemonStatus.value.isShiny) {
      return `url(${spriteData.value.shiny})`;
    }

    if (spriteData.value.sprite) {
      return `url(${spriteData.value.sprite})`;
    }
  }

  return `url(${unknownSprite.value})`;
});

const isUnknown = computed(() => !lastPokemon.value || (!spriteData.value.shiny && !spriteData.value.sprite));

const title = computed(() => (lastPokemon.value ? getTranslation(lastPokemon.value) : ''));
</script>

<template>
  <div class="last-pokemon-container">
    <MorphTransition mode="out-in">
      <div
        :key="lastPokemon?.id ?? 'unknown'"
        class="sprite"
        :class="{ unknown: isUnknown }"
        v-tooltip:bottom="title"
        :style="{ '--bg-img': bgImg }"
      />
    </MorphTransition>
  </div>
</template>

<style scoped>
.last-pokemon-container {
  width: 28px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sprite {
  width: 28px;
  height: 32px;
  overflow: visible;
  position: relative;

  &.unknown {
    z-index: 0;
  }

  &:before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 44px;
    height: 44px;
    background-image: var(--bg-img);
    background-size: auto;
    background-position: bottom center;
    pointer-events: none;
    z-index: 10;
  }
}
</style>
