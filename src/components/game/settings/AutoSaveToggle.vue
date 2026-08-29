<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import SegmentButton from '@/components/common/SegmentButton.vue';
import { useMessages } from '@/stores/useMessages.ts';
import { useSettings } from '@/stores/useSettings.ts';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { settingsState, setSaveToCloud } = useSettings();
const { showUserMessage } = useMessages();
const { t } = useI18n();
const { auth } = useFirebase();
const { roomState } = useRooms();

const applyAutoSave = (value: boolean) => {
  if (settingsState.autoSync === value) return;

  setSaveToCloud(value);
  showUserMessage(t('autoSaveSet', { status: value ? t('enabled') : t('disabled') }));
};
</script>

<template>
  <RoundedBox
    class="auto-save-toggle"
    v-game-ended
    v-if="auth.currentUser && !roomState.isActive"
    v-tooltip="t('autoSaveTooltip')"
  >
    <SegmentButton
      :active="{
        left: settingsState.autoSync,
        right: !settingsState.autoSync,
      }"
      :attached="{
        right: true,
      }"
      @click:left="applyAutoSave(true)"
      @click:right="applyAutoSave(false)"
    >
      <template #prefix> {{ t('autoSave') }} </template>

      <template #left> {{ t('on') }} </template>
      <template #right> {{ t('off') }} </template>
    </SegmentButton>
  </RoundedBox>
</template>

<style scoped>
.auto-save-toggle {
  .mobile & {
    display: none;
  }
}
</style>
