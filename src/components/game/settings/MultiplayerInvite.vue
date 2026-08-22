<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useAlerts } from '@/stores/useAlerts.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRoomMessages } from '@/stores/useRoomMessages.ts';

const { t } = useI18n();
const { setDialog } = useDialogs();
const { setAlert } = useAlerts();
const { showUserMessage } = useMessages();
const { auth } = useFirebase();
const { destroyRoom, roomState } = useRoomMessages();

const join = () => {
  if (!auth.currentUser?.uid) {
    showUserMessage('You must be logged in to join a room.', 'error');
    return;
  }

  destroyRoom();
  setDialog('createRoom');
};

const handleInviteClick = () => {
  if (!auth.currentUser?.uid) {
    showUserMessage('You must be logged in to join a room.', 'error');
    return;
  }

  if (roomState.room) {
    setAlert({
      confirmText: t('continue'),
      description: t('leaveRoomDialog.description'),
      onConfirm: join,
      title: t('leaveRoomDialog.title'),
    });
    return;
  }

  join();
};
</script>

<template>
  <RoundedButton
    v-game-ended
    class="multi-toggle rad-br-tl"
    v-if="auth.currentUser?.uid"
    @click="handleInviteClick"
  >
    {{ t('multiplayerInvite') }}
  </RoundedButton>
</template>

<style scoped>
.multi-toggle {
  .mobile & {
    display: none;
  }
}
</style>
