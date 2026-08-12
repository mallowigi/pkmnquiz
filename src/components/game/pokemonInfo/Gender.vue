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
    <h3>{{ t('genderRatio') }}</h3>
    <div
      v-if="pkmnDetailsState.currentPokemon.genderRatio === 'genderless'"
      class="genderless"
    >
      {{ t('genderless') }}
    </div>

    <div
      v-else
      class="gender-bar-container"
    >
      <div
        v-if="pkmnDetailsState.currentPokemon.genderRatio.male > 0"
        class="gender-bar male"
        :style="{ width: pkmnDetailsState.currentPokemon.genderRatio.male + '%' }"
      >
        <span>{{ pkmnDetailsState.currentPokemon.genderRatio.male }}% ♂</span>
      </div>
      <div
        v-if="pkmnDetailsState.currentPokemon.genderRatio.female > 0"
        class="gender-bar female"
        :style="{ width: pkmnDetailsState.currentPokemon.genderRatio.female + '%' }"
      >
        <span>{{ pkmnDetailsState.currentPokemon.genderRatio.female }}% ♀</span>
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

.genderless {
  padding: 0.5rem;
  font-weight: bold;
}

.gender-bar-container {
  display: flex;
  height: 24px;
  background: var(--gauge);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.gender-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: width 0.3s ease;
  white-space: nowrap;

  &:last-child::after {
    content: '';
    padding-right: 20px; /* The "padding" at the end of the leak */
    display: inline-block;
    flex-shrink: 0;
  }
}

.male {
  background-color: #4488ff;
}

.female {
  background-color: #ff77aa;
}
</style>
