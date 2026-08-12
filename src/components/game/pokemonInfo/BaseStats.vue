<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { t } = useI18n();
const { pkmnDetailsState } = usePkmnDetails();

const statEntries = computed(() => {
  const stats = pkmnDetailsState.currentPokemon?.stats;
  if (!stats) return [];

  return [
    { key: 'hp', value: stats.hp },
    { key: 'atk', value: stats.atk },
    { key: 'def', value: stats.def },
    { key: 'spAtk', value: stats.spAtk },
    { key: 'spDef', value: stats.spDef },
    { key: 'speed', value: stats.speed },
  ];
});

const getStatPercentage = (value: number) => {
  return Math.min(100, (value / 255) * 100);
};

const getStatColor = (value: number) => {
  const hue = (value / 255) * 120;
  return hue;
};

const getStatStyles = (value: number) => {
  const percentage = getStatPercentage(value);
  const color = getStatColor(value);
  return {
    '--stat-color': color,
    '--stat-percentage': percentage,
  };
};
</script>

<template>
  <RoundedBox
    class="box"
    v-if="pkmnDetailsState.currentPokemon"
  >
    <h3>{{ t('stats') }}</h3>
    <div
      v-for="stat in statEntries"
      :key="stat.key"
      class="stat-row"
    >
      <span class="stat-label">{{ t(stat.key) }}</span>
      <span class="stat-value">{{ stat.value }}</span>

      <div class="stat-bar-container">
        <div
          class="stat-bar"
          :style="getStatStyles(stat.value)"
        ></div>
      </div>
    </div>
  </RoundedBox>
</template>

<style scoped>
h3 {
  border-bottom: 1px solid var(--type-btn-color, var(--primary));
  margin: 0;
  padding-bottom: 0.4em;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  width: 60px;
  font-size: 0.85rem;
  text-transform: uppercase;
  text-align: left;
}

.stat-value {
  width: 30px;
  text-align: right;
  font-weight: bold;
}

.stat-bar-container {
  flex-grow: 1;
  height: 10px;
  background: var(--button);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  width: calc(var(--stat-percentage) * 1%);
  background-color: hsl(var(--stat-color), 70%, 50%);
}
</style>
