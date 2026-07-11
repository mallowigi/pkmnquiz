<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useShuffles } from '@/composables/useShuffles.ts';
import { useCurrentBox } from '@/stores/useCurrentBox.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useState } from '@/stores/useState.ts';

const { state, setBoxShuffle } = useState();
const { showUserMessage } = useMessages();
const { flowState, isChallengeMode } = useGameFlow();
const { updateShuffles } = useShuffles();
const { clearCurrentBox } = useCurrentBox();
const { t } = useI18n();

const applyBoxShuffle = (value: boolean) => {
  if (state.withBoxShuffle === value) return;

  if (state.mode !== 'normal') {
    showUserMessage(t('boxShuffleOnlyInRegularModeTooltip'));
    return;
  }

  setBoxShuffle(value);
  if (value) {
    updateShuffles();
  } else {
    clearCurrentBox();
  }
  showUserMessage(t('boxShuffleSet', { status: value ? t('enabled') : t('disabled') }));
};

const isDisabled = computed(() => {
  if (flowState.isGivenUp || flowState.isEnded) return true;

  if (state.mode !== 'normal') return true;

  return false;
});
</script>

<template>
  <RoundedBox
    v-tooltip="t('boxShuffleTooltip')"
    v-tooltip.disabled="t('boxShuffleOnlyInFullQuizTooltip')"
    :class="{ disabled: isDisabled }"
  >
    <SegmentButton
      :active="{
        left: state.withBoxShuffle,
        right: !state.withBoxShuffle,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyBoxShuffle(true)"
      @click:right="applyBoxShuffle(false)"
    >
      <template #prefix> {{ t('boxShuffle') }}: </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
