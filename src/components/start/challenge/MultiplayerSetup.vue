<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import TextBox from '@/components/common/TextBox.vue';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { setGameSelectionState } = useGameFlow();
const { t } = useI18n();
const { setRoom } = useRooms();

const roomName = ref('');

const goBack = () => {
  setGameSelectionState('challenge');
};

const editName = (event: Event) => {
  const target = event.target as HTMLInputElement;
  roomName.value = target.value;
};

const submitJoinRoom = () => {
  setRoom(roomName.value);
  setGameSelectionState('gen');
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
        v-if="roomName"
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
