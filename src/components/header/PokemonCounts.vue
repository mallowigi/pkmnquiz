<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePokemons } from '@/stores/usePokemons.ts';

const pokemonStore = usePokemons();
const { numFound } = storeToRefs(pokemonStore);
const { getCurrentGameModePokemon } = pokemonStore;

const { flowState } = useGameFlow();

const found = computed(() => {
  if (!flowState.isStarted) return '--';
  return numFound.value;
});

const total = computed(() => {
  if (!flowState.isStarted) return '--';

  const pokemons = getCurrentGameModePokemon();
  return pokemons.size ?? 0;
});
</script>

<template>
  <div class="box rad-bl-tr counter">
    <span class="highlight">{{ found }}</span> / {{ total }}
  </div>
</template>

<style scoped>
.box {
  background: var(--type-bg-color, var(--primary));
  color: var(--type-fg-color, var(--text));
  min-height: 30px;
  line-height: 30px;
  padding: 10px 18px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  gap: 8px;
}

.counter {
  padding-left: 30px;
  padding-right: 30px;
}

.highlight {
  color: var(--text-inverted);
  text-shadow: 0 0 5px var(--text);
}
</style>
