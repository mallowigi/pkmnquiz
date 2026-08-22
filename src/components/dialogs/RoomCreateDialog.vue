<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import TextBox from '@/components/common/TextBox.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { closeDialog } = useDialogs();
const { t } = useI18n();
const { joinOrCreateRoom } = useRooms();
const { showUserMessage } = useMessages();

const roomName = ref('');

const close = () => {
  closeDialog();
};

const editName = (event: Event) => {
  const target = event.target as HTMLInputElement;
  roomName.value = target.value;
};

const submitJoinRoom = () => {
  const { auth } = useFirebase();
  if (!auth.currentUser?.uid || !roomName.value) {
    showUserMessage('You must be logged in and provide a room name to join or create a room.', 'error');
    return;
  }

  joinOrCreateRoom(roomName.value, auth.currentUser?.uid);
  close();
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="close"
  >
    <div class="prompt settings-dialog">
      <h2>{{ t('createOrJoinRoom') }}</h2>

      <div class="settings-content">
        <form @submit.prevent="submitJoinRoom">
          <TextBox
            class="large-text"
            maxlength="50"
            type="text"
            :placeholder="t('enterRoomName')"
            @input="editName"
            :value="roomName"
          />
        </form>
      </div>

      <RoundedButton
        @click.stop="submitJoinRoom"
        primary
      >
        {{ t('submit') }}
      </RoundedButton>

      <RoundedButton
        @click.stop="close"
        primary
      >
        {{ t('close') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped>
.settings-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 400px;
  width: 90%;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
</style>
