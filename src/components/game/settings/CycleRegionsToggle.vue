<script setup lang="ts">
import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useMessages } from '@/stores/useMessages.ts';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/stores/useSettings.ts';

const { settingsState, setCycleRegions } = useSettings();
const { showUserMessage } = useMessages();
const { t } = useI18n();

const applyCycleRegions = (value: boolean) => {
  if (settingsState.withCycleRegions === value) return;

  setCycleRegions(value);
  showUserMessage(t('cycleRegionsSet', { status: value ? t('enabled') : t('disabled') }));
};
</script>

<template>
  <RoundedBox
    v-tooltip="t('cycleRegionsTooltip')"
    v-game-ended
  >
    <SegmentButton
      :active="{
        left: settingsState.withCycleRegions,
        right: !settingsState.withCycleRegions,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyCycleRegions(true)"
      @click:right="applyCycleRegions(false)"
    >
      <template #prefix> {{ t('cycleRegions') }} </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
