<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import LeaderboardBrowser from '@/components/dialogs/leaderboards/LeaderboardBrowser.vue';
import LeaderboardMyRecords from '@/components/dialogs/leaderboards/LeaderboardMyRecords.vue';
import { useDialogs } from '@/stores/useDialogs.ts';

const { closeDialog } = useDialogs();
const { t } = useI18n();
</script>

<template>
  <Overlay
    class="overlay"
    @close="closeDialog"
  >
    <div class="prompt leaderboards-dialog">
      <h2 class="dialog-title">{{ t('showLeaderBoards') }}</h2>

      <div class="dialog-content">
        <LeaderboardMyRecords />

        <hr class="divider" />

        <LeaderboardBrowser />
      </div>

      <RoundedButton
        @click.stop="closeDialog"
        primary
      >
        {{ t('close') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped>
.leaderboards-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 800px;
  width: 95%;
}

.dialog-title {
  margin: 0;
  color: white;
  font-size: 22px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  gap: 16px;
  padding-right: 4px;
}

.divider {
  width: 100%;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin: 0;
}
</style>

