<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useQuiz } from '@/composables/useQuiz.ts';
import { useDialogs } from '@/stores/useDialogs.js';
import { useGameFlow } from '@/stores/useGameFlow.js';
import { useState } from '@/stores/useState.js';
import type { Mode } from '@/types.js';
import { scrollToTop } from '@/utils/utils.ts';

const { state, setMode } = useState();
const { flowState } = useGameFlow();
const { setDialog } = useDialogs();
const { resetQuiz } = useQuiz();
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
