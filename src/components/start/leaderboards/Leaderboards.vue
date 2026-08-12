<script setup lang="ts">
import LeaderboardTable from '@/components/start/leaderboards/LeaderboardTable.vue';
import SkeletonTable from '@/components/start/leaderboards/SkeletonTable.vue';
import type { TopTrainer } from '@/types.ts';

const props = defineProps<Partial<TopTrainer>>();
</script>

<template>
  <div class="leaderboard">
    <h2>{{ props.caption }}</h2>

    <Suspense>
      <!-- The asynchronous table component -->
      <LeaderboardTable v-bind="props" />

      <!-- The layout-consistent skeleton loading state -->
      <template #fallback>
        <SkeletonTable v-bind="props" />
      </template>
    </Suspense>
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

:deep(.table-container) {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 16px;
  background-color: var(--text-inverted);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.leaderboard-table) {
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
</style>
