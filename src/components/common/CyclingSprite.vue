<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { computed, ref } from 'vue';

import { useLanguages } from '@/stores/useLanguages.ts';
import { usePkmnData } from '@/stores/usePkmnStore.ts';
import { normalizeName } from '@/utils/utils.ts';

const props = defineProps<{
  sprites: readonly string[];
  start?: number;
}>();

const { data } = usePkmnData();
const { getTranslation } = useLanguages();

const sprites = computed(() => {
  if (!data.sprites) {
    return [];
  }
  return props.sprites.map((sprite) => data.sprites![normalizeName(sprite)]);
});

const currentIndex = ref(props.start ?? 0);

useIntervalFn(() => {
  currentIndex.value = (currentIndex.value + 1) % props.sprites.length;
}, 3000);
</script>

<template>
  <div
    :hidden="sprites.length === 0"
    class="sprite cycle"
    v-tooltip:bottom="sprites[currentIndex] ? getTranslation(props.sprites[currentIndex]) : ''"
    :style="{ '--bg-img': `url(${sprites[currentIndex]})` }"
  />
</template>

<style scoped>
.sprite {
  --bg-img: none;
  width: 24px;
  height: 24px;
  overflow: visible;
  position: relative;

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
