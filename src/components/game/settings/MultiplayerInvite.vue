<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';

const { t } = useI18n();
const { setDialog } = useDialogs();
const { showUserMessage } = useMessages();
const { auth } = useFirebase();

const join = () => {
  if (!auth.currentUser?.uid) {
    showUserMessage('You must be logged in to join a room.', 'error');
    return;
  }

  setDialog('createRoom');
};
</script>

<template>
  <RoundedButton
    v-game-ended
    class="multi-toggle rad-br-tl"
    v-if="auth.currentUser?.uid"
    @click="join"
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
