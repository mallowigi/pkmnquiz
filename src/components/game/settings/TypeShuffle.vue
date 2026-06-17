<script setup lang="ts">
import { computed } from 'vue';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useCurrentType } from '@/stores/useCurrentType.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.js';
import { useState } from '@/stores/useState.js';
import { useI18n } from 'vue-i18n';

const { state, setTypeShuffle } = useState();
const { showUserMessage } = useMessages();
const { flowState } = useGameFlow();
const { setRandomCurrentType, clearCurrentType } = useCurrentType();
const { t } = useI18n();

const applyTypeShuffle = (value: boolean) => {
  if (state.withTypeShuffle === value) return;

  if (state.mode !== 'normal') {
    showUserMessage(t('typeShuffleOnlyInRegularModeTooltip'));
    return;
  }

  setTypeShuffle(value);
  if (value) {
    setRandomCurrentType();
  } else {
    clearCurrentType();
  }
  showUserMessage(t('typeShuffleSet', { status: value ? t('enabled') : t('disabled') }));
};

const isDisabled = computed(
  () =>
    flowState.isGivenUp ||
    flowState.isEnded ||
    state.mode !== 'normal' ||
    state.gameMode === 'types' ||
    state.gameMode === 'special' ||
    state.gameMode === 'mega',
);
</script>

<template>
  <RoundedBox
    v-tooltip="t('typeShuffleTooltip')"
    v-tooltip.disabled="t('typeShuffleOnlyInRegularModeTooltip')"
    :class="{ disabled: isDisabled }"
  >
    <SegmentButton
      :active="{
        left: state.withTypeShuffle,
        right: !state.withTypeShuffle,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyTypeShuffle(true)"
      @click:right="applyTypeShuffle(false)"
    >
      <template #prefix> {{ t('typeShuffle') }}: </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
