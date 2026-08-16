<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useQuiz } from '@/composables/useQuiz.ts';
import { useShuffles } from '@/composables/useShuffles.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useState } from '@/stores/useState.ts';
import type { Mode } from '@/types.ts';
import { scrollToTop } from '@/utils/utils.ts';

const { state, setMode } = useState();
const { flowState, startGame } = useGameFlow();
const { setDialog } = useDialogs();
const { resetQuiz } = useQuiz();
const { updateShuffles } = useShuffles();
const { t } = useI18n();

const applyMode = (mode: Mode) => {
  if (state.mode === mode) return;

  if (!flowState.isStarted) {
    setMode(mode);
    return;
  }
  setDialog(mode, () => {
    setMode(mode);
    resetQuiz();
    updateShuffles();
    startGame();
    scrollToTop();
  });
};

const isDisabled = computed(
  () =>
    flowState.isGivenUp ||
    flowState.isEnded ||
    state.withTypeShuffle ||
    state.withCriesShuffle ||
    state.gameMode === 'types' ||
    state.gameMode === 'special' ||
    state.gameMode === 'mega',
);

const disabledTooltip = computed(() => {
  if (state.withTypeShuffle) {
    return t('modeCannotChangeWithTypeShuffleTooltip');
  }
  if (state.withCriesShuffle) {
    return t('modeCannotChangeWithCriesShuffleTooltip');
  }
  if (state.gameMode === 'special' || state.gameMode === 'mega') {
    return t('modeCannotChangeInSpecialModeTooltip');
  }
  if (state.gameMode === 'types') {
    return t('modeCannotChangeInTypesModeTooltip');
  }
  return null;
});
</script>

<template>
  <RoundedBox
    :class="{ disabled: isDisabled }"
    v-tooltip.disabled="disabledTooltip"
  >
    <SegmentButton
      :active="{
        left: state.mode === 'chaos',
        center: state.mode === 'normal',
        right: state.mode === 'order',
      }"
      @click:left="applyMode('chaos')"
      @click:center="applyMode('normal')"
      @click:right="applyMode('order')"
    >
      <template #prefix> {{ t('mode') }}: </template>

      <template #left>
        <span v-tooltip="t('chaosModeTooltip')">{{ t('chaos') }}</span>
      </template>

      <template #center>
        <span v-tooltip="t('regularModeTooltip')">{{ t('regular') }}</span>
      </template>

      <template #right>
        <span v-tooltip="t('dexOrderModeTooltip')">{{ t('dexOrder') }}</span>
      </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
