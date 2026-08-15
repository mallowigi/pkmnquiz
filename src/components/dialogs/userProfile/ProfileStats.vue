<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import { useProfile } from '@/stores/useProfile.ts';

const { profileState } = useProfile();

const totalWins = computed(() => {
  const fg = profileState.finishedGames;
  return fg.chaos + fg.normal + fg.order;
});

const { t } = useI18n();
</script>

<template>
  <div class="profile-stats">
    <RoundedBox class="stat rad-tl">
      <span class="stat-label">{{ t('plays') }}</span>
      <span class="stat-value">{{ profileState.plays }}</span>
    </RoundedBox>

    <RoundedBox class="stat rad-tr">
      <span class="stat-label">{{ t('wins') }}</span>
      <span class="stat-value">{{ totalWins }}</span>
    </RoundedBox>

    <RoundedBox class="stat rad-bl">
      <span class="stat-label">{{ t('winsNoShadows') }}</span>
      <span class="stat-value">{{ profileState.finishedGames.noShadows }}</span>
    </RoundedBox>

    <RoundedBox class="stat rad-br">
      <span class="stat-label">{{ t('winsNoCries') }}</span>
      <span class="stat-value">{{ profileState.finishedGames.noCries }}</span>
    </RoundedBox>
  </div>
</template>

<style scoped>
.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  margin-bottom: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-height: initial;
  opacity: 0.8;

  .mobile & {
    padding: 8px;
  }
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 2px;

  .mobile & {
    font-size: 11px;
    letter-spacing: 1px;
    line-height: 1.4;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--type-btn-color, var(--primary));

  .mobile & {
    font-size: 20px;
  }
}
</style>
