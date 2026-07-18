<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import MorphTransition from '@/components/common/transitions/MorphTransition.vue';
import ProfileStatGrid from '@/components/dialogs/userProfile/ProfileStatGrid.vue';
import { useProfileStats } from '@/composables/useProfileStats.ts';
import { useProfile } from '@/stores/useProfile.ts';

const { t } = useI18n();
const { profileState } = useProfile();
const { activeTab, currentStats, tabs } = useProfileStats();
</script>

<template>
  <div class="profile-detailed-stats">
    <h3 class="breakdown-title">{{ t('winsBreakdown') }}</h3>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <MorphTransition mode="out-in">
        <ProfileStatGrid
          :key="activeTab"
          :stats="currentStats"
        />
      </MorphTransition>
    </div>
  </div>
</template>

<style scoped>
.profile-detailed-stats {
  margin-top: 24px;
}

.breakdown-title {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
}

.tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  margin-bottom: 16px;
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

.tab-content {
  min-height: 200px;
}
</style>
