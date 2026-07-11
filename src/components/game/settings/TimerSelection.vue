<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useDialogs } from '@/stores/useDialogs.js';
import { useGameFlow } from '@/stores/useGameFlow';
import { usePokemons } from '@/stores/usePokemons';
import { useTimer } from '@/stores/useTimer';
import { useShuffles } from '@/composables/useShuffles.ts';

const { flowState, resetFlowState, pauseGame, startGame } = useGameFlow();
const { resetPokemonState } = usePokemons();
const { resetTimer, setMinutes, setIsLimited, timerState } = useTimer();
const { updateShuffles } = useShuffles();
const { setDialog } = useDialogs();
const { t } = useI18n();

const setInfinite = () => {
  if (!timerState.isLimited) return;

  if (!flowState.isStarted) {
    setIsLimited(false);
    return;
  }

  setDialog('timer', () => {
    resetFlowState();
    resetPokemonState();
    updateShuffles();
    resetTimer();
    setIsLimited(false);
    startGame();
  });
};

const setFinite = () => {
  if (!flowState.isStarted) {
    setIsLimited(true);
    return;
  }

  setDialog('timer', () => {
    resetFlowState();
    resetPokemonState();
    updateShuffles();
    resetTimer();
    setIsLimited(true);
    startGame();
  });
};

const togglePause = () => pauseGame();

const minutes = computed({
  get: () => timerState.minutes,
  set: (value) => setMinutes(value),
});
</script>

<template>
  <RoundedBox
    class="timer-box"
    v-tooltip="t('timerTooltip')"
    v-game-ended
  >
    <SegmentButton
      :active="{
        left: !timerState.isLimited,
        right: timerState.isLimited,
        suffix: flowState.isPaused,
      }"
      :attached="{
        right: true,
      }"
      :classes="{
        center: 'input-segment',
        suffix: 'toggle',
      }"
      @click:left="setInfinite"
      @click:right="setFinite"
      @click:suffix="togglePause"
    >
      <template #prefix> {{ t('timer') }} </template>

      <template #left> ∞ </template>

      <template #center>
        <div
          class="input-timer-container"
          :data-unit="t('min')"
        >
          <input
            type="number"
            name="timer"
            class="input-timer"
            min="1"
            max="999"
            v-model="minutes"
            autocomplete="off"
            placeholder="1"
          />
        </div>
      </template>

      <template #right> {{ t('set') }} </template>

      <template #suffix> ⏸ </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped>
:deep(.input-segment) {
  padding: 0;
  display: flex;
  align-items: stretch;
  flex: 1;
}

.input-timer-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;

  &::after {
    content: attr(data-unit);
    position: absolute;
    right: 3px;
    color: var(--input-text);
    pointer-events: none;
  }
}

.input-timer {
  border: none;
  box-sizing: border-box;
  font-size: 16px;
  border-radius: 3px 0 0 0px;
  color: var(--input-text);
  background: var(--input);
  padding: 2px 32px 2px 0;
  text-align: right;
  width: 100%;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}
</style>
