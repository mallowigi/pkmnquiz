<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingText from '@/components/header/FloatingText.vue';
import { useBonus } from '@/stores/useBonus.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { usePokemons } from '@/stores/usePokemons.ts';

const pokemonStore = usePokemons();
const { numFound } = storeToRefs(pokemonStore);
const { getCurrentGameModePokemon } = pokemonStore;

const { flowState } = useGameFlow();
const { bonusState } = useBonus();
const { t } = useI18n();

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
    <div class="counts">
      <span class="highlight">{{ found }}</span> / {{ total }}
    </div>

    <div
      v-if="flowState.isStarted"
      class="score"
    >
      <span class="score-label">{{ t('score') }}:</span>
      <span class="score-value highlight">{{ bonusState.score }}</span>

      <FloatingText />
    </div>
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
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.counts {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.score {
  display: flex;
  flex-direction: row;
  gap: 8px;
  border-left: 1px solid var(--text);
  padding-left: 20px;
  position: relative;
}

.score-label {
  font-weight: bold;
}

.score-value {
  anchor-name: --score;
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
