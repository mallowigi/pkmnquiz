<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import MorphTransition from '@/components/common/transitions/MorphTransition.vue';
import SlideInRightTransition from '@/components/common/transitions/SlideInRightTransition.vue';
import Artwork from '@/components/game/pokemonInfo/Artwork.vue';
import BasicInfo from '@/components/game/pokemonInfo/BasicInfo.vue';
import Profile from '@/components/game/pokemonInfo/Profile.vue';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { pkmnDetailsState, closeDetails } = usePkmnDetails();
const { t } = useI18n();

const getStatPercentage = (value: number) => {
  return Math.min(100, (value / 255) * 100);
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
            <!-- Pokemon Artwork -->
            <Artwork />

            <!-- Name, Description, Types and Species -->
            <BasicInfo />

            <Profile />

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
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  border-left: 2px solid var(--type-btn-color, var(--primary));

  background-image: url(@/assets/background-50-grey.svg);
  background-blend-mode: hard-light;
  background-repeat: no-repeat;
  background-size: 100vw;
  background-position: right bottom;
  background-attachment: scroll;
  background-color: var(--type-bg-color, var(--primary));

  .dark & {
    background-image: url(@/assets/background-dark-grey.svg);
  }

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

.details-pane-contents {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  gap: 1rem;
}

:deep(.box) {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
  gap: 0.5em;
  margin: 0 1em;
  max-height: initial;
  align-self: stretch;
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
