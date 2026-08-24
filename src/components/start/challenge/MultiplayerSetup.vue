<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import TextBox from '@/components/common/TextBox.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useAlerts } from '@/stores/useAlerts.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { closeDialog } = useDialogs();
const { setGameSelectionState } = useGameFlow();
const { t } = useI18n();
const { roomState, joinOrCreateRoom, destroyRoom } = useRooms();
const { showUserMessage } = useMessages();
const { setDialog } = useDialogs();

const roomName = ref('');

const goBack = () => {
  setGameSelectionState('challenge');
};

const close = () => {
  setGameSelectionState('gen');
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

  if (roomState.room) {
    setDialog('deleteRoom', () => {
      destroyRoom();
      joinOrCreateRoom(roomName.value, auth.currentUser?.uid ?? '');
      close();
    });
    return;
  }

  joinOrCreateRoom(roomName.value, auth.currentUser?.uid);
  close();
};
</script>

<template>
  <div class="room-create">
    <h2>{{ t('createOrJoinRoom') }}</h2>

    <p>{{ t('createOrJoinRoomDescription') }}</p>

    <div class="room-create-content">
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

    <div class="buttons">
      <RoundedButton @click.stop="goBack">
        {{ t('back') }}
      </RoundedButton>

      <RoundedButton
        @click.stop="submitJoinRoom"
        primary
      >
        {{ t('submit') }}
      </RoundedButton>
    </div>
  </div>
</template>

<style scoped>
.room-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.room-create-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
