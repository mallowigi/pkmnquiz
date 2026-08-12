<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { LeaderboardsProps } from '@/types.ts';

const props = defineProps<LeaderboardsProps>();

const { t } = useI18n();
</script>

<template>
  <div class="table-container">
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
          v-for="n in 3"
          :key="`skeleton-${n}`"
        >
          <td class="rank"><div class="skeleton-bar rank-skeleton"></div></td>
          <td class="run-name"><div class="skeleton-bar name-skeleton"></div></td>
          <td class="run-score"><div class="skeleton-bar score-skeleton"></div></td>
          <td class="run-time"><div class="skeleton-bar time-skeleton"></div></td>
          <td><div class="skeleton-bar mode-skeleton"></div></td>
          <td><div class="skeleton-bar subtype-skeleton"></div></td>
          <td><div class="skeleton-bar ordermode-skeleton"></div></td>
          <td><div class="skeleton-bar shadows-skeleton"></div></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.skeleton-bar {
  height: 16px;
  background-color: var(--text);
  opacity: 0.15;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.rank-skeleton {
  width: 20px;
}

.name-skeleton {
  width: 100px;
}

.score-skeleton {
  width: 40px;
}

.time-skeleton {
  width: 60px;
}

.mode-skeleton {
  width: 80px;
}

.subtype-skeleton {
  width: 80px;
}

.ordermode-skeleton {
  width: 70px;
}

.shadows-skeleton {
  width: 30px;
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
