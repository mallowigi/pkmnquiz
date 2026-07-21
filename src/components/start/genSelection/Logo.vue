<script setup lang="ts">
import { useCssVar } from '@vueuse/core';
import { useTemplateRef, watch } from 'vue';

import { useColors } from '@/composables/useColors.ts';
import { useSavedColor } from '@/composables/useSavedColor.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';

const { flowState } = useGameFlow();
const { savedColor } = useSavedColor();
const { getColor } = useColors();
const logoRef = useTemplateRef('logo');
const themeFilter = useCssVar('--theme-filter', logoRef);

watch(
  savedColor,
  (newColor) => {
    const color = getColor(newColor) ?? getColor('blue');
    themeFilter.value = color?.filter;
  },
  { immediate: true },
);
</script>

<template>
  <div
    v-if="!flowState.isStarted"
    id="logo"
  >
    <img
      src="@/assets/logo.gif"
      class="logo"
      alt="Logo"
    />
  </div>
</template>

<style scoped>
.logo {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 600px;
  filter: var(--theme-filter);
}
</style>
