<script setup lang="ts">
import { computed } from 'vue';

import BackgroundPreload from '@/components/background/BackgroundPreload.vue';
import { useCurrentType } from '@/stores/useCurrentType';
import { useState } from '@/stores/useState';

const { state } = useState();
const { getCurrentTypeOrSpecial, getSecondaryType } = useCurrentType();

const currentType = computed(() => {
  return getCurrentTypeOrSpecial();
});

const secondaryType = computed(() => {
  return getSecondaryType();
});
</script>

<template>
  <div
    class="background"
    :class="{
      typed: currentType,
      'double-typed': secondaryType,
      dark: state.isDark,
    }"
  >
    <!-- Preload background images and type icons -->
    <BackgroundPreload />

    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="currentType"
        :key="currentType.id + (secondaryType?.id ?? '')"
      >
        <!-- First logo -->
        <img
          :alt="currentType?.name"
          :src="`/assets/types/${currentType?.icon}.svg`"
          id="bgpattern"
          class="bgpattern"
        />

        <!-- Second logo -->
        <img
          :alt="secondaryType ? secondaryType.name : currentType?.name"
          :src="`/assets/types/${secondaryType ? secondaryType.icon : currentType?.icon}.svg`"
          id="bgpattern2"
          class="bgpattern2"
        />
      </div>
    </Transition>
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

.background {
  background-image: url(@/assets/background-50-grey.svg);
  background-blend-mode: hard-light;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-color: var(--type-bg-color, var(--primary));
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: all 0.2s ease-in-out;

  &.dark {
    background-image: url(@/assets/background-dark-grey.svg);
  }

  &.double-typed {
    background-image:
      url(@/assets/background-50-grey.svg),
      linear-gradient(to bottom right, var(--type-bg-color), var(--type-bg-color-secondary, var(--type-bg-color)));
    background-blend-mode: hard-light, normal;
  }

  &.double-typed.dark {
    background-image:
      url(@/assets/background-dark-grey.svg),
      linear-gradient(to bottom right, var(--type-bg-color), var(--type-bg-color-secondary, var(--type-bg-color)));
  }
}

.bgpattern {
  position: fixed;
  bottom: 24%;
  left: 10%;
  width: 18%;
  opacity: 0.9;
  z-index: -2;
  animation: animated-bg 10s ease-in-out infinite;
}

.bgpattern2 {
  position: fixed;
  bottom: calc(100px + 40%);
  right: 14%;
  width: 33%;
  opacity: 0.2;
  z-index: -2;
  animation: animated-bg 10s ease-in-out infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
