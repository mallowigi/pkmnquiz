<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import TextBox from '@/components/common/TextBox.vue';
import RecentRoomsTable from '@/components/start/multiplayer/RecentRoomsTable.vue';
import { useNameGenerator } from '@/composables/useNameGenerator.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { setGameSelectionState, startGame } = useGameFlow();
const { t } = useI18n();
const { setRoom, getOwnerIdForRoom } = useRooms();
const { generateName } = useNameGenerator();

const roomName = ref('');

const goBack = () => {
  setGameSelectionState('challenge');
};

const editName = (event: Event) => {
  const target = event.target as HTMLInputElement;
  roomName.value = target.value;
};

const submitJoinRoom = async () => {
  const trimmed = roomName.value.trim();
  if (!trimmed) return;

  const ownerId = await getOwnerIdForRoom(trimmed);
  setRoom(trimmed);

  if (ownerId) {
    await startGame();
  } else {
    setGameSelectionState('gen');
  }
};

onMounted(() => {
  roomName.value = generateName();
});
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
        :disabled="!roomName.length"
        primary
      >
        {{ t('submit') }}
      </RoundedButton>
    </div>

    <RecentRoomsTable />
  </div>
</template>

<style scoped>
.room-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 800px;
  line-height: 1.6;
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
