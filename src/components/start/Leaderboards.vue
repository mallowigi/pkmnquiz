<script setup lang="ts">
import type { DocumentData } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

import FadeTransition from '@/components/common/transitions/FadeTransition.vue';
import { useLeaderboards } from '@/composables/useLeaderboards.ts';
import { useTranslations } from '@/composables/useTranslations.js';
import type { Mode, GameMode, Gen, Type } from '@/types.ts';

const props = defineProps<{
  caption?: string;
  limit?: number;
  mode?: Mode | null;
  uid?: string | null;
  gameMode?: GameMode | null;
  gen?: Gen | null;
  type?: Type | null;
}>();

const { getLeaderboards } = useLeaderboards();
const { t } = useI18n();
const { getGenTranslation, getTypeTranslation, getGameModeTranslation } = useTranslations();

const topTrainers = getLeaderboards(props);

const formatTime = (timeInSec: number) => {
  const hours = String(Math.floor(timeInSec / 3600));
  const minutes = String(Math.floor((timeInSec % 3600) / 60));
  const seconds = String(timeInSec % 60);

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};

const subType = (user: DocumentData): string => {
  if (user.gameMode === 'types') return getTypeTranslation(user.type) ?? '';
  if (user.gameMode === 'gen') return getGenTranslation(user.gen) ?? '';
  return getGameModeTranslation(user.gameMode) ?? '';
};
</script>

<template>
  <div class="leaderboard">
    <h2>{{ props.caption }}</h2>

    <FadeTransition :mode="'out-in'">
      <Suspense>
        <div
          class="table-container"
          v-if="topTrainers?.length > 0"
        >
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('leaderboards.name') }}</th>
                <th>{{ t('score') }}</th>
                <th>{{ t('leaderboards.time') }}</th>
                <th>{{ t('leaderboards.gameMode') }}</th>
                <th>{{ t('leaderboards.genType') }}</th>
                <th>{{ t('leaderboards.orderMode') }}</th>
                <th>{{ t('leaderboards.shadowsUsed') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, index) in topTrainers"
                :key="user.id"
              >
                <td class="rank">{{ index + 1 }}</td>
                <td class="run-name">{{ user.name }}</td>
                <td class="run-score">{{ user.score }}</td>
                <td class="run-time">{{ formatTime(user.time) }}</td>
                <td>{{ t(user.gameMode === 'full' ? 'fullQuiz' : user.gameMode) }}</td>
                <td>{{ t(subType(user)) }}</td>
                <td>{{ t(user.mode) }}</td>
                <td>{{ user.numShadows }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="no-records"
        >
          <p>{{ t('leaderboards.noRecords') }}</p>
        </div>

        <template #fallback> {{ t('loadingQuiz') }} </template>
      </Suspense>
    </FadeTransition>
  </div>
</template>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  min-height: 200px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 16px;
  background-color: var(--text-inverted);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text);
  font-size: 15px;

  & th,
  & td {
    padding: 10px 14px;
    text-align: left;
    white-space: nowrap;
  }

  & thead {
    background-color: var(--type-btn-color, var(--primary));
    color: white;
  }

  & th {
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  & tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  & tbody tr:last-child {
    border-bottom: none;
  }

  & tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0, 0.4);
  }
}

.rank {
  font-weight: bold;
  color: var(--type-btn-color, var(--primary));
}

.run-score {
  font-weight: 700;
  animation: pulse 2s infinite;
}

.no-records {
  padding: 20px;
  filter: brightness(0.5);
  p {
    color: var(--type-fg-color, var(--text));
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}

.create-btn {
  margin-top: 8px;
}
</style>
