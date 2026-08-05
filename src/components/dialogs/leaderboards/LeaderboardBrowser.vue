<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import MorphTransition from '@/components/common/transitions/MorphTransition.vue';
import Leaderboards from '@/components/start/leaderboards/Leaderboards.vue';
import { useLeaderboardBrowser } from '@/composables/useLeaderboardBrowser.ts';

const { t } = useI18n();
const {
  activeGameMode,
  activeGen,
  activeMode,
  activeTab,
  activeType,
  currentFilter,
  gameModeOptions,
  genOptions,
  modeOptions,
  setTab,
  tabs,
  typeOptions,
} = useLeaderboardBrowser();
</script>

<template>
  <section class="leaderboard-browser">
    <h3 class="section-title">{{ t('leaderboardsDialog.browseLeaderboards') }}</h3>

    <!-- Primary tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Sub-options row -->
    <MorphTransition mode="out-in">
      <div
        v-if="activeTab === 'modes'"
        key="modes-sub"
        class="sub-options"
      >
        <button
          v-for="opt in modeOptions"
          :key="opt.id"
          class="sub-btn"
          :class="{ active: activeMode === opt.id }"
          :style="{ '--opt-color': opt.color }"
          @click="activeMode = activeMode === opt.id ? null : opt.id"
        >
          {{ opt.label }}
        </button>
      </div>

      <div
        v-else-if="activeTab === 'gameModes'"
        key="gameModes-sub"
        class="sub-options"
      >
        <button
          v-for="opt in gameModeOptions"
          :key="opt.id"
          class="sub-btn"
          :class="{ active: activeGameMode === opt.id }"
          :style="{ '--opt-color': opt.color }"
          @click="activeGameMode = activeGameMode === opt.id ? null : opt.id"
        >
          {{ opt.label }}
        </button>
      </div>

      <div
        v-else-if="activeTab === 'gens'"
        key="gens-sub"
        class="sub-options"
      >
        <button
          v-for="opt in genOptions"
          :key="opt.id"
          class="sub-btn"
          :class="{ active: activeGen === opt.id }"
          :style="{ '--opt-color': opt.color }"
          @click="activeGen = activeGen === opt.id ? null : opt.id"
        >
          {{ opt.label }}
        </button>
      </div>

      <div
        v-else-if="activeTab === 'types'"
        key="types-sub"
        class="sub-options"
      >
        <button
          v-for="opt in typeOptions"
          :key="opt.id"
          class="sub-btn"
          :class="{ active: activeType === opt.id }"
          :style="{ '--opt-color': opt.color, color: opt.text }"
          @click="activeType = activeType === opt.id ? null : opt.id"
        >
          {{ opt.label }}
        </button>
      </div>
    </MorphTransition>

    <!-- Leaderboard table -->
    <MorphTransition mode="out-in">
      <Leaderboards
        :key="`${activeTab}-${currentFilter.mode}-${currentFilter.gameMode}-${currentFilter.gen}-${currentFilter.type}`"
        :limit="10"
        :mode="currentFilter.mode"
        :gameMode="currentFilter.gameMode"
        :gen="currentFilter.gen"
        :type="currentFilter.type"
      />
    </MorphTransition>
  </section>
</template>

<style scoped>
.leaderboard-browser {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
}

.section-title {
  font-size: 14px;
  color: white;
  margin: 0 0 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
}

.tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab-btn {
  padding: 8px 16px;
  background: var(--button);
  border: none;
  border-radius: 20px;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: var(--button-hover);
    color: white;
  }

  &.active {
    background: var(--type-btn-color, var(--primary));
    color: white;
  }
}

.sub-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 12px;
  width: 100%;
}

.sub-btn {
  padding: 5px 12px;
  border: 2px solid var(--opt-color, var(--primary));
  border-radius: 16px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--opt-color, var(--primary));
    color: white;
    opacity: 0.85;
  }

  &.active {
    background: var(--opt-color, var(--primary));
    color: white;
  }
}
</style>
