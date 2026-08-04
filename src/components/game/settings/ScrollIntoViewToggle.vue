<script setup lang="ts">
import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useMessages } from '@/stores/useMessages.ts';
import { useI18n } from 'vue-i18n';
import { useSettings } from '@/stores/useSettings.ts';

const { settingsState, setScrollIntoView } = useSettings();
const { showUserMessage } = useMessages();
const { t } = useI18n();

const applyScrollIntoView = (value: boolean) => {
  if (settingsState.withScrollIntoView === value) return;

  setScrollIntoView(value);
  showUserMessage(t('scrollIntoViewSet', { status: value ? t('enabled') : t('disabled') }));
};
</script>

<template>
  <RoundedBox
    v-tooltip="t('scrollIntoViewTooltip')"
    v-game-ended
  >
    <SegmentButton
      :active="{
        left: settingsState.withScrollIntoView,
        right: !settingsState.withScrollIntoView,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyScrollIntoView(true)"
      @click:right="applyScrollIntoView(false)"
    >
      <template #prefix> {{ t('scrollIntoView') }} </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped></style>
