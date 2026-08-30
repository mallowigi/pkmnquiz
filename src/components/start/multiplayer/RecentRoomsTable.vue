<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useRooms } from '@/stores/useRooms.ts';
import type { RoomInfo } from '@/types.ts';

const { t } = useI18n();
const { listenToRecentRooms, getRecentRooms, setRoom } = useRooms();
const { auth } = useFirebase();
const { startGame } = useGameFlow();

const rooms = ref<RoomInfo[]>([]);
const loading = ref(true);

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  const recentRooms = await getRecentRooms();
  if (recentRooms) {
    rooms.value = recentRooms;
    loading.value = false;
  }

  unsubscribe = listenToRecentRooms((recentRooms) => {
    rooms.value = recentRooms;
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const handleJoin = async (roomId: string) => {
  if (!auth.currentUser) {
    console.error('User is not authenticated');
    return;
  }

  setRoom(roomId);
  await startGame();
};
</script>

<template>
  <div class="recent-rooms">
    <h3 class="recent-rooms-title">{{ t('recentRooms') }}</h3>

    <!-- Skeleton -->
    <div
      v-if="loading"
      class="table-container"
    >
      <table class="recent-rooms-table">
        <thead>
          <tr>
            <th>{{ t('roomName') }}</th>
            <th>{{ t('activeUsers') }}</th>
            <th class="action-header">{{ t('action') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="n in 3"
            :key="`skeleton-${n}`"
          >
            <td><div class="skeleton-bar room-skeleton"></div></td>
            <td><div class="skeleton-bar user-skeleton"></div></td>
            <td><div class="skeleton-bar action-skeleton"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="rooms.length === 0"
      class="no-rooms"
    >
      <p>{{ t('noActiveRooms') }}</p>
    </div>

    <!-- Rooms -->
    <div
      v-else
      class="table-container"
    >
      <table class="recent-rooms-table">
        <thead>
          <tr>
            <th>{{ t('roomName') }}</th>
            <th>{{ t('activeUsers') }}</th>
            <th class="action-header">{{ t('action') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="room in rooms"
            :key="room.id"
          >
            <td class="room-name">{{ room.name }}</td>
            <td class="user-count">{{ room.userCount }}</td>
            <td class="room-action">
              <RoundedButton
                primary
                class="join-btn"
                @click.stop="handleJoin(room.name)"
              >
                {{ t('join') }}
              </RoundedButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.recent-rooms {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.recent-rooms-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: var(--text);
  .overlay-wrapper & {
    color: var(--text-inverted);
  }
}

.table-container {
  width: 100%;
  overflow-x: auto;
  background-color: var(--text-inverted);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .mobile & {
    scrollbar-width: none;
  }
}

.recent-rooms-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
  font-size: 14px;

  .overlay-wrapper & {
    color: var(--text-inverted);
  }

  & th,
  & td {
    padding: 8px 14px;
    text-align: left;
    white-space: nowrap;
    vertical-align: middle;
  }

  & thead {
    background-color: var(--type-btn-color, var(--primary));
    color: white;
  }

  & th {
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  & .action-header {
    text-align: right;
  }

  & tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  & tbody tr:last-child {
    border-bottom: none;
  }

  & tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .dark & tbody tr:nth-of-type(even) {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .mobile & {
    font-size: 12px;

    & th,
    & td {
      padding: 6px 10px;
    }
  }
}

.room-name {
  font-weight: 500;
}

.user-count {
  color: var(--type-btn-color, var(--primary));
  font-weight: 600;
}

.room-action {
  text-align: right;
  width: 1%;
}

.join-btn {
  margin: 0 0 0 auto;
  min-width: 60px;
  min-height: 28px;
  line-height: 28px;
  padding: 0 14px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.no-rooms {
  padding: 16px;
  text-align: center;
  filter: brightness(0.7);

  p {
    color: var(--text);
    margin: 0;
    font-size: 14px;

    .overlay-wrapper & {
      color: var(--text-inverted);
    }
  }
}

.skeleton-bar {
  height: 16px;
  background-color: var(--text);
  opacity: 0.15;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.room-skeleton {
  width: 120px;
}

.user-skeleton {
  width: 24px;
}

.action-skeleton {
  width: 50px;
  margin-left: auto;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.05;
  }
  100% {
    opacity: 0.15;
  }
}
</style>
