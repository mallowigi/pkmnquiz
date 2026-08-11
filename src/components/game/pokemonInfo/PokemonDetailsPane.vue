<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import MorphTransition from '@/components/common/transitions/MorphTransition.vue';
import SlideInRightTransition from '@/components/common/transitions/SlideInRightTransition.vue';
import Artwork from '@/components/game/pokemonInfo/Artwork.vue';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { pkmnDetailsState, closeDetails } = usePkmnDetails();
const { t } = useI18n();

const getStatPercentage = (value: number) => {
  return Math.min(100, (value / 255) * 100);
};

const formatValue = (value: number, unit: string) => {
  return `${value}${unit}`;
};

const getTypeStyle = (type: string) => {
  const typeInfo = pokemonTypes[type as keyof typeof pokemonTypes];
  if (!typeInfo) return {};
  return {
    backgroundColor: typeInfo.bgColor,
    color: typeInfo.fgColor,
  };
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="closeDetails"
  >
    <SlideInRightTransition>
      <aside
        class="details-pane"
        v-if="pkmnDetailsState.isOpen"
      >
        <MorphTransition mode="out-in">
          <div
            class="details-pane-contents"
            v-if="pkmnDetailsState.currentPokemon"
          >
            <Artwork />
            <!--    <div class="basic-info">-->
            <!--      <span class="dex-num">#{{ String(pkmnDetailsState.currentPokemon.dexNum).padStart(3, '0') }}</span>-->
            <!--      <h2 class="name">{{ pkmnDetailsState.currentPokemon.baseName }}</h2>-->
            <!--      <div class="types">-->
            <!--        <span-->
            <!--          v-for="type in [-->
            <!--            pkmnDetailsState.currentPokemon.primaryType,-->
            <!--            pkmnDetailsState.currentPokemon.secondaryType,-->
            <!--          ].filter(Boolean)"-->
            <!--          :key="type"-->
            <!--          class="type-badge"-->
            <!--          :style="getTypeStyle(type!)"-->
            <!--        >-->
            <!--          {{ t(type!) }}-->
            <!--        </span>-->
            <!--      </div>-->
            <!--      <p class="species">{{ pkmnDetailsState.currentPokemon.species }}</p>-->
            <!--    </div>-->
            <!--  </div>-->

            <!--  <div class="pane-content">-->
            <!--    <section class="description">-->
            <!--      <p>{{ pkmnDetailsState.currentPokemon.description }}</p>-->
            <!--    </section>-->

            <!--    <section class="details-grid">-->
            <!--      <div class="detail-item">-->
            <!--        <span class="label">{{ t('height') }}</span>-->
            <!--        <span class="value">{{ formatValue(pkmnDetailsState.currentPokemon.height, 'm') }}</span>-->
            <!--      </div>-->
            <!--      <div class="detail-item">-->
            <!--        <span class="label">{{ t('weight') }}</span>-->
            <!--        <span class="value">{{ formatValue(pkmnDetailsState.currentPokemon.weight, 'kg') }}</span>-->
            <!--      </div>-->
            <!--      <div class="detail-item">-->
            <!--        <span class="label">{{ t('abilities') }}</span>-->
            <!--        <span class="value">{{ pkmnDetailsState.currentPokemon.abilities.join(', ') }}</span>-->
            <!--      </div>-->
            <!--      <div class="detail-item">-->
            <!--        <span class="label">{{ t('catchRate') }}</span>-->
            <!--        <span class="value">{{ pkmnDetailsState.currentPokemon.catchRate }}</span>-->
            <!--      </div>-->
            <!--    </section>-->

            <!--    <section class="stats-section">-->
            <!--      <h3>{{ t('stats') }}</h3>-->
            <!--      <div-->
            <!--        v-for="(value, stat) in pkmnDetailsState.currentPokemon.stats"-->
            <!--        :key="stat"-->
            <!--        class="stat-row"-->
            <!--      >-->
            <!--        <span class="stat-label">{{ t(stat) }}</span>-->
            <!--        <span class="stat-value">{{ value }}</span>-->
            <!--        <div class="stat-bar-container">-->
            <!--          <div-->
            <!--            class="stat-bar"-->
            <!--            :style="{ width: getStatPercentage(value) + '%', backgroundColor: 'var(&#45;&#45;primary)' }"-->
            <!--          ></div>-->
            <!--        </div>-->
            <!--      </div>-->
            <!--    </section>-->

            <!--    <section class="gender-section">-->
            <!--      <h3>{{ t('genderRatio') }}</h3>-->
            <!--      <div-->
            <!--        v-if="pkmnDetailsState.currentPokemon.genderRatio === 'genderless'"-->
            <!--        class="genderless"-->
            <!--      >-->
            <!--        {{ t('genderless') }}-->
            <!--      </div>-->
            <!--      <div-->
            <!--        v-else-->
            <!--        class="gender-bar-container"-->
            <!--      >-->
            <!--        <div-->
            <!--          class="gender-bar male"-->
            <!--          :style="{ width: pkmnDetailsState.currentPokemon.genderRatio.male + '%' }"-->
            <!--        >-->
            <!--          <span v-if="pkmnDetailsState.currentPokemon.genderRatio.male > 0"-->
            <!--            >{{ pkmnDetailsState.currentPokemon.genderRatio.male }}% ♂</span-->
            <!--          >-->
            <!--        </div>-->
            <!--        <div-->
            <!--          class="gender-bar female"-->
            <!--          :style="{ width: pkmnDetailsState.currentPokemon.genderRatio.female + '%' }"-->
            <!--        >-->
            <!--          <span v-if="pkmnDetailsState.currentPokemon.genderRatio.female > 0"-->
            <!--            >{{ pkmnDetailsState.currentPokemon.genderRatio.female }}% ♀</span-->
            <!--          >-->
            <!--        </div>-->
            <!--      </div>-->
            <!--    </section>-->
            <!--</aside>-->

            <!--<aside-->
            <!--  v-else-if="pkmnDetailsState.loading"-->
            <!--  class="details-pane loading"-->
            <!--&gt;-->
            <!--  <div class="loader"></div>-->
            <!--  <p>Loading details...</p>-->
            <!--</aside>-->

            <!--<aside-->
            <!--  v-else-if="pkmnDetailsState.error"-->
            <!--  class="details-pane error"-->
            <!--&gt;-->
            <!--  <button-->
            <!--    class="close-btn"-->
            <!--    @click="closeDetails"-->
            <!--    aria-label="Close"-->
            <!--  >-->
            <!--    ×-->
            <!--  </button>-->
            <!--  <p>{{ pkmnDetailsState.error }}</p>-->
          </div>

          <div
            class="details-pane-contents loading"
            v-if="pkmnDetailsState.loading"
          >
            <div class="loader"></div>
            <p>Loading details...</p>
          </div>

          <div
            class="details-pane-contents error"
            v-if="pkmnDetailsState.error"
          >
            <p>{{ pkmnDetailsState.error }}</p>
          </div>
        </MorphTransition>

        <button
          class="close-btn"
          @click="closeDetails"
          aria-label="Close"
        >
          ×
        </button>
      </aside>
    </SlideInRightTransition>
  </Overlay>
</template>

<style scoped>
.overlay {
  padding-right: 0;
}

:deep(.overlay-wrapper) {
  justify-content: flex-end;
}

.details-pane {
  max-width: 400px;
  min-width: 300px;
  height: 100vh;
  color: var(--text);
  background: var(--button);
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  border-left: 2px solid var(--type-btn-color, var(--primary));

  &:has(.loading),
  &:has(.error) {
    justify-content: center;
  }

  .loading,
  .error {
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2rem;
  }
}

.loader {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--type-btn-color, var(--primary));
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  justify-self: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text);
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}

.name {
  margin: 0.5rem 0;
  text-transform: capitalize;
  font-size: 1.8rem;
}

.dex-num {
  font-family: monospace;
  font-size: 1.2rem;
  opacity: 0.7;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.type-badge {
  padding: 0.2rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: bold;
}

.species {
  font-style: italic;
  opacity: 0.8;
}

.pane-content {
  padding: 1rem 1.5rem 2rem;
}

.description {
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
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

.stats-section,
.gender-section {
  margin-bottom: 1.5rem;
}

h3 {
  border-bottom: 1px solid var(--primary);
  padding-bottom: 0.3rem;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  gap: 0.5rem;
}

.stat-label {
  width: 60px;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.stat-value {
  width: 30px;
  text-align: right;
  font-weight: bold;
}

.stat-bar-container {
  flex-grow: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 4px;
}

.gender-bar-container {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.gender-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.male {
  background-color: #4a90e2;
}

.female {
  background-color: #e91e63;
}

.genderless {
  text-align: center;
  font-style: italic;
}
</style>
