<script setup lang="ts">
import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useMessages } from '@/stores/useMessages.ts';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/stores/useSettings.ts';

const { settingsState, setCycleTypes } = useSettings();
const { showUserMessage } = useMessages();
const { t } = useI18n();

const applyCycleTypes = (value: boolean) => {
  if (settingsState.withCycleTypes === value) return;

  setCycleTypes(value);
  showUserMessage(t('cycleTypesSet', { status: value ? t('enabled') : t('disabled') }));
};
</script>

<template>
  <RoundedBox
    v-tooltip="t('cycleTypesTooltip')"
    v-game-ended
  >
    <SegmentButton
      :active="{
        left: settingsState.withCycleTypes,
        right: !settingsState.withCycleTypes,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyCycleTypes(true)"
      @click:right="applyCycleTypes(false)"
    >
      <template #prefix> {{ t('cycleTypes') }} </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
