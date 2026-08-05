<script setup lang="ts">
import type { DocumentData } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';

import { useLeaderboards } from '@/composables/useLeaderboards.ts';
import { useTranslations } from '@/composables/useTranslations.ts';
import type { Mode, GameMode, Gen, Type, TopTrainer } from '@/types.ts';

const props = defineProps<TopTrainer>();

const { getLeaderboardsAsync } = useLeaderboards();
const { t } = useI18n();
const { getGenTranslation, getTypeTranslation, getGameModeTranslation } = useTranslations();

// Top-level await for Suspense integration
const topTrainers = await getLeaderboardsAsync(props);

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
  <div
    class="table-container"
    v-if="topTrainers && topTrainers.length > 0"
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
          <td>{{ user.gameMode === 'full' ? t('fullQuiz') : t(user.gameMode ?? 'full') }}</td>
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
</template>

<style scoped>
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
</style>
