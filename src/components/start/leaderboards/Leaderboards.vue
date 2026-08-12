<script setup lang="ts">
import { motion } from 'motion-v';

import LeaderboardTable from '@/components/start/leaderboards/LeaderboardTable.vue';
import SkeletonTable from '@/components/start/leaderboards/SkeletonTable.vue';
import type { LeaderboardsProps } from '@/types.ts';

const props = defineProps<LeaderboardsProps>();
</script>

<template>
  <div class="leaderboard">
    <h2>{{ props.caption }}</h2>

    <motion.div
      class="leaderboard-body"
      :layout="true"
      :transition="{ duration: 0.3, ease: 'easeInOut' }"
    >
      <Transition name="lb-morph">
        <KeepAlive>
          <Suspense>
            <!-- The asynchronous table component -->
            <LeaderboardTable v-bind="props" />

            <!-- The layout-consistent skeleton loading state -->
            <template #fallback>
              <SkeletonTable v-bind="props" />
            </template>
          </Suspense>
        </KeepAlive>
      </Transition>
    </motion.div>
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

.leaderboard-body {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Blur + opacity crossfade between the skeleton and the real results. */
.lb-morph-enter-active,
.lb-morph-leave-active {
  transition:
    opacity 0.3s ease-in-out,
    filter 0.3s ease-in-out;
}

.lb-morph-enter-from,
.lb-morph-leave-to {
  opacity: 0;
  filter: blur(8px);
}

.lb-morph-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .lb-morph-enter-active,
  .lb-morph-leave-active {
    transition: none;
  }

  .lb-morph-enter-from,
  .lb-morph-leave-to {
    filter: none;
  }
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
