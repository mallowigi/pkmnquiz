<script setup lang="ts">
import { useShare } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { Temporal } from 'temporal-polyfill';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import { useQuiz } from '@/composables/useQuiz.ts';
import { useSavedLocale } from '@/composables/useSavedLocale.ts';
import { usePageTitle } from '@/composables/useTitle.ts';
import { donors } from '@/data/donors';
import { useCurrentGen } from '@/stores/useCurrentGen';
import { useCurrentType } from '@/stores/useCurrentType';
import { useGameFlow } from '@/stores/useGameFlow';
import { usePokemons } from '@/stores/usePokemons';
import { useState } from '@/stores/useState';
import { useTimer } from '@/stores/useTimer';

const { setGameOver } = useState();
const { setCurrentGen } = useCurrentGen();
const { clearCurrentType } = useCurrentType();
const { resetFlowState, setGameSelectionState } = useGameFlow();
const { resetTimer, timerState } = useTimer();
const { t } = useI18n();

const pokemonStore = usePokemons();
const { numFound, numShadows } = storeToRefs(pokemonStore);
const { resetPokemonState } = pokemonStore;
const { savedLocale } = useSavedLocale();
const { getGameModeName } = useQuiz();
const { getTitle } = usePageTitle();
const { share, isSupported } = useShare();

const startShare = () => {
  const regionOrType = getGameModeName();

  share({
    text: t('endOverlay.summary2', {
      elapsed: elapsed.value,
      numFound: numFound.value,
      regionOrType,
      url: window.location.href,
    }),
    title: getTitle().value ?? '',
    url: window.location.href,
  });
};

const closeOverlay = () => {
  clearCurrentType();
  setCurrentGen(null);
  resetFlowState();
  setGameSelectionState('new');
  resetPokemonState();
  resetTimer();
  setGameOver();
};

const elapsed = computed(() => {
  let elapsedTime = timerState.elapsed;

  if (elapsedTime === 0) {
    elapsedTime = 86400; // 24 hours in seconds
  }

  const duration = Temporal.Duration.from({ seconds: elapsedTime }).round({
    largestUnit: 'hours',
    roundingMode: 'trunc',
    smallestUnit: 'seconds',
  });

  return duration.toLocaleString(savedLocale.value, {
    style: 'long',
  });
});
</script>

<template>
  <Overlay
    class="overlay"
    @close="closeOverlay()"
  >
    <div class="sidepanel">
      <div class="section rad-bl-tr welldone">
        <h1>{{ t('endOverlay.wellDone') }}</h1>

        <h2>
          {{ t('endOverlay.summary', { numFound, elapsed }) }}
        </h2>

        <p v-if="numShadows > 0">
          {{ t('endOverlay.challenge') }}<br />
          <span class="small">({{ t('endOverlay.shadowsUsed', { numShadows }) }})</span>
        </p>
      </div>

      <div
        v-if="isSupported"
        class="section rad-bl-tr share"
        @click="startShare"
      >
        {{ t('share') }}
      </div>

      <div class="section rad-bl-tr supporters">
        <p class="small">
          {{ t('endOverlay.projectInfo1') }}<br />
          {{ t('endOverlay.projectInfo2') }}<br />
          {{ t('endOverlay.projectInfo3') }}
        </p>

        <p>
          <a
            href="https://ko-fi.com/mallowigi"
            target="_blank"
          >
            <img
              class="kofi2"
              src="@/assets/ko-fi.webp"
              alt="Ko-Fi"
            />
          </a>
        </p>

        <h2>{{ t('endOverlay.supporters') }}</h2>
        <div class="scrollbox">
          <ol>
            <li
              v-for="donor in donors"
              :key="donor"
            >
              {{ donor }}
            </li>
          </ol>
        </div>

        <p class="small">{{ t('endOverlay.appreciation') }}</p>
      </div>

      <p class="small">{{ t('endOverlay.clickToClose') }}</p>
    </div>
  </Overlay>
</template>

<style scoped>
.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  cursor: pointer;
  background: linear-gradient(
    90deg,
    rgb(0 0 0 / 0%) 0%,
    rgb(16 17 14 / 10%) 20%,
    rgb(16 17 14 / 30%) 50%,
    rgba(16, 17, 14, 0.8015581232492998) 100%
  );
}

.sidepanel {
  position: absolute;
  right: 0;
  text-align: center;
  width: 330px;
  height: 100%;
  color: var(--type-fg-color, var(--text));
  padding: 20px 10px;
  box-sizing: border-box;
  background-color: var(--type-bg-color, var(--primary));
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
  cursor: default;
  * {
    cursor: default;
  }
}

.section {
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 16px 20px;
  transition: background 0.2s ease;
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}

h1,
h2 {
  margin: 0;
  line-height: 32px;
}

.welldone {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.small {
  font-size: 0.9em;
}

.kofi2 {
  height: 50px;
}

.supporters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
  overflow: hidden;
}

.scrollbox {
  overflow: auto;
}

li {
  list-style-type: none;
}

.share {
  background: var(--button);
  color: var(--text);
}
</style>
