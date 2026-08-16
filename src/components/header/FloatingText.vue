<script setup lang="ts">
import { ref, watch } from 'vue';

import { useBonus } from '@/stores/useBonus.ts';

const { bonusState } = useBonus();
const bonusShown = ref(false);
const scoreDelta = ref(0);

watch(
  () => bonusState.score,
  (newScore, oldScore) => {
    bonusShown.value = true;
    scoreDelta.value = newScore - oldScore;

    setTimeout(() => {
      bonusShown.value = false;
      scoreDelta.value = 0;
    }, 1000);
  },
);
</script>

<template>
  <div
    class="bonus"
    v-if="bonusShown"
  >
    {{ `+${scoreDelta}` }}
  </div>
</template>

<style scoped>
@keyframes score-fade {
  0% {
    opacity: 1;
    transform: scale(1);
    top: anchor(--score bottom);
  }
  100% {
    opacity: 0;
    transform: scale(2);
    top: calc(anchor(--score bottom) - 20px);
  }
}

.bonus {
  position: absolute;
  top: anchor(--score bottom);
  left: anchor(--score left);
  font-size: 1.2em;
  font-weight: bold;
  animation: score-fade 1s ease-in-out forwards;

  color: greenyellow;
  text-shadow:
    0 0 6px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(0, 0, 0, 0.9);
}
</style>
