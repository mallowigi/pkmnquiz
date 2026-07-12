<script setup lang="ts">
import { computed } from 'vue';

import bg50Grey from '@/assets/background-50-grey.svg';
import bg50 from '@/assets/background-50.svg';
import bgDarkGrey from '@/assets/background-dark-grey.svg';
import bgDark from '@/assets/background-dark.svg';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { specialTypes } from '@/data/specialTypes.ts';

const backgroundImages = [bg50, bgDark, bg50Grey, bgDarkGrey];

const allTypeIcons = computed(() => {
  const icons = new Set<string>();

  Object.values(pokemonTypes).forEach((t) => icons.add(t.icon));

  icons.add(specialTypes.no.icon);
  return Array.from(icons);
});
</script>

<template>
  <div
    class="preload"
    aria-hidden="true"
  >
    <img
      v-for="bg in backgroundImages"
      :key="bg"
      :src="bg"
      :alt="`Background image ${bg}`"
    />
    <img
      v-for="icon in allTypeIcons"
      :key="icon"
      :src="`/assets/types/${icon}.svg`"
      :alt="`Type icon ${icon}`"
    />
  </div>
</template>

<style scoped>
@keyframes animated-bg {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.preload {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  z-index: -100;
  opacity: 0;
  pointer-events: none;
}
</style>
