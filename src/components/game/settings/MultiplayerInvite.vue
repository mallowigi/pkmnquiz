<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useAlerts } from '@/stores/useAlerts.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { t } = useI18n();
const { setDialog } = useDialogs();
const { showUserMessage } = useMessages();
const { auth } = useFirebase();
const { destroyRoom } = useRooms();

const join = () => {
  destroyRoom();
  setDialog('createRoom');
};

const handleInviteClick = () => {
  if (!auth.currentUser?.uid) {
    showUserMessage('You must be logged in to join a room.', 'error');
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
