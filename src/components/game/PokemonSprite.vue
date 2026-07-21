<script setup lang="ts">
import { useScroll } from '@vueuse/core';
import { computed, capitalize, watch, useTemplateRef, nextTick } from 'vue';

import CyclingSprite from '@/components/common/CyclingSprite.vue';
import RevealZoomTransition from '@/components/common/transitions/RevealZoomTransition.vue';
import LastPokemon from '@/components/header/LastPokemon.vue';
import { useGlitchedEffect } from '@/composables/useGlitchedEffect.ts';
import { useUnknownSprite } from '@/composables/useUnknownSprite.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePkmnData } from '@/stores/usePkmnStore.ts';
import { useState } from '@/stores/useState.ts';
import type { PokemonInfo, PokemonStatus } from '@/types.ts';
import { glitchify } from '@/utils/utils.ts';

type Props = {
  pokemon: PokemonInfo;
  status: PokemonStatus;
  index?: number;
};

type SpriteData = {
  silhouette: string;
  shiny: string;
  sprite: string;
  spriteCycle: readonly string[];
};

type DisplayedSprite = {
  image: string;
  sprites?: readonly string[];
  key: string;
  kind: 'found' | 'shadowed' | 'cycle' | 'unknown';
  title: string | null;
};

const props = defineProps<Props>();

const { state } = useState();
const { flowState } = useGameFlow();
const { data } = usePkmnData();
const { unknownSprite } = useUnknownSprite();
const { glitchStyles } = useGlitchedEffect();
const el = useTemplateRef('el');
const { isScrolling } = useScroll(el);

const makeGlitchy = (text: string) => {
  const { flowState } = useGameFlow();
  const isGlitchy = flowState.missingno;

  if (isGlitchy) {
    return glitchify(text);
  }
  return text;
};

const spriteData = computed<SpriteData>(() => {
  const { silhouettes, sprites, spriteCycles, shinies } = data;
  return {
    shiny: shinies?.[props.pokemon.id] ?? '',
    silhouette: silhouettes?.[props.pokemon.id] ?? '',
    sprite: sprites?.[props.pokemon.id] ?? '',
    spriteCycle: spriteCycles?.[props.pokemon.id] ?? [],
  };
});

const displayedSprite = computed<DisplayedSprite>(() => {
  if (props.status.isFound) {
    if (spriteData.value.spriteCycle.length) {
      return {
        image: spriteData.value.spriteCycle[0],
        key: 'found-cycle',
        kind: 'cycle',
        sprites: spriteData.value.spriteCycle,
        title: makeGlitchy(capitalize(props.pokemon.baseName)),
      };
    }

    if (spriteData.value.shiny && props.status.isShiny) {
      return {
        image: spriteData.value.shiny,
        key: 'found-shiny',
        kind: 'found',
        title: `${makeGlitchy(capitalize(props.pokemon.baseName))} (Shiny)`,
      };
    }

    if (spriteData.value.sprite) {
      return {
        image: spriteData.value.sprite,
        key: 'found-default',
        kind: 'found',
        title: makeGlitchy(capitalize(props.pokemon.baseName)),
      };
    }
  }

  if (props.status.isShadowed && spriteData.value.silhouette) {
    return {
      image: spriteData.value.silhouette,
      key: 'shadowed',
      kind: 'shadowed',
      title: "Who's that Pokemon?",
    };
  }

  return {
    image: unknownSprite.value,
    key: 'unknown',
    kind: 'unknown',
    title: null,
  };
});

const spriteDelay = computed<string>(() => {
  const rawDelay = (props.index ?? 0) * 50;
  // Make staggering animation when we need to display all found or all shadows
  if (state.withShadows || flowState.isGivenUp) {
    return `${rawDelay}ms`;
  }

  // No delay otherwise
  return `10ms`;
});

const isDitto = computed(() => {
  return props.pokemon.baseName === 'ditto';
});

watch(displayedSprite, (newSprite, oldSprite) => {
  if (newSprite.kind === 'unknown' || newSprite.kind === oldSprite?.kind) return;

  // Do not scroll if already scrolling
  if (isScrolling.value) return;

  // Lock scrolling for a bit to allow smooth scroll to finish and prevent jitter
  isScrolling.value = true;
  setTimeout(() => {
    isScrolling.value = false;
  }, 1000);

  // Use nextTick to ensure that the DOM has updated with the new sprite before scrolling
  nextTick(() => {
    el.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  });
});
</script>

<template>
  <section
    ref="el"
    class="container"
    :class="{ full: state.gameMode === 'full', missed: props.status.isMissed }"
    :style="{ '--sprite-delay': spriteDelay }"
  >
    <RevealZoomTransition
      appear
      mode="out-in"
      v-if="displayedSprite.kind !== 'cycle' && displayedSprite.kind !== 'unknown' && !isDitto"
    >
      <div
        :key="displayedSprite.key"
        class="sprite"
        :class="displayedSprite.kind"
        v-tooltip:bottom="displayedSprite.title ?? null"
        :style="[{ '--bg-img': `url(${displayedSprite.image})` }, flowState.missingno ? glitchStyles : {}]"
      />
    </RevealZoomTransition>

    <!-- Sprite Cycle -->
    <RevealZoomTransition
      appear
      mode="out-in"
      v-else-if="displayedSprite.sprites && !isDitto"
    >
      <CyclingSprite
        :sprites="displayedSprite.sprites"
        :style="flowState.missingno ? glitchStyles : {}"
      />
    </RevealZoomTransition>

    <!-- Ditto -->
    <RevealZoomTransition
      appear
      mode="out-in"
      v-else-if="isDitto && props.status.isFound"
    >
      <LastPokemon :style="flowState.missingno ? glitchStyles : {}" />
    </RevealZoomTransition>

    <!-- Shadow -->
    <Transition
      name="sprite-swap"
      appear
      mode="out-in"
      v-else-if="isDitto && props.status.isShadowed && !props.status.isMissed"
    >
      <!-- Ditto not found -->
      <div
        :key="displayedSprite.key"
        class="sprite"
        :class="displayedSprite.kind"
        v-tooltip:bottom="displayedSprite.title ?? null"
        :style="[{ '--bg-img': `url(${displayedSprite.image})` }, flowState.missingno ? glitchStyles : {}]"
      />
    </Transition>

    <!-- Unknown -->
    <div
      :key="displayedSprite.key"
      class="sprite unknown"
      v-else
      :style="{ '--bg-img': `url(${unknownSprite})` }"
    />
  </section>
</template>

<style scoped>
.container {
  position: relative;
}

.sprite-swap-enter-active,
.sprite-swap-leave-active {
  transition:
    transform 700ms ease,
    opacity 0s ease;
  transition-delay: var(--sprite-delay, 0ms);
}

.sprite-swap-enter-from,
.sprite-swap-leave-to {
  opacity: 0;
  transform: scale(2);
}

.container.missed > * {
  filter: grayscale(100%);
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0); /* Start completely hidden and tiny */
  }
  50% {
    opacity: 1;
    transform: scale(2); /* Scale up past normal size */
  }
  75% {
    transform: scale(0.85); /* Descale below normal size */
  }
  100% {
    opacity: 1;
    transform: scale(1); /* Settle at native size */
  }
}

.sprite {
  --bg-img: none;
  width: 28px;
  height: 32px;
  overflow: visible;
  position: relative;
  transition: transform 0.5s ease;

  &.found,
  &.cycle,
  &.shadowed {
    image-rendering: high-quality;
    animation: appear 1.5s ease-in-out backwards;
    animation-delay: var(--sprite-delay, 0.1s);

    &:hover {
      transform: scale(2);
      z-index: 10;
    }
  }

  &.sprite-swap-leave-active {
    position: absolute;
  }

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
    height: 56px;
    background-image: var(--bg-img);
    pointer-events: none;
    background-size: auto;
    background-position: bottom center;
    z-index: 10;
  }
}
</style>
