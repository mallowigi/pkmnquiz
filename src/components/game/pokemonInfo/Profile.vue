<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { t } = useI18n();
const { pkmnDetailsState } = usePkmnDetails();
</script>

<template>
  <RoundedBox
    class="box"
    v-if="pkmnDetailsState.currentPokemon"
  >
    <section class="details-grid">
      <div class="detail-item">
        <span class="label">{{ t('height') }}</span>
        <span class="value">{{ pkmnDetailsState.currentPokemon.height }}m</span>
      </div>

      <div class="detail-item">
        <span class="label">{{ t('weight') }}</span>
        <span class="value">{{ pkmnDetailsState.currentPokemon.weight }}kg</span>
      </div>

      <div class="detail-item">
        <span class="label">{{ t('abilities') }}</span>
        <a
          class="value"
          v-for="ability in pkmnDetailsState.currentPokemon.abilities"
          :key="ability.name"
          v-tooltip="ability.effect"
          :href="ability.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ ability.name }}
        </a>
      </div>

      <div class="detail-item">
        <span class="label">{{ t('catchRate') }}</span>
        <span class="value">{{ pkmnDetailsState.currentPokemon.catchRate }}</span>
      </div>
    </section>
  </RoundedBox>
</template>

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  rule: 2px dashed var(--type-btn-color, var(--primary));
  rule-break: intersection;
}

.detail-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label {
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
}

.value {
  font-weight: bold;
  text-transform: capitalize;
}
</style>
