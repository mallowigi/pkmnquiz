<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useProfile } from '@/stores/useProfile.ts';

const { profileState } = useProfile();

const { t } = useI18n();
</script>

<template>
  <div class="profile-stats">
    <div class="stat">
      <span class="stat-label">{{ t('plays') }}:</span>
      <span class="stat-value">{{ profileState.plays }}</span>
    </div>
  </div>
</template>

<style scoped>
.profile-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 12px 24px;
  background: var(--border);
  border-radius: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary);
}

.profile-records h4 {
  margin: 0 0 12px 0;
  color: var(--text);
  font-size: 18px;
}
</style>
