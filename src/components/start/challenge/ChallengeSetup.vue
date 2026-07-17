<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import BoxShuffle from '@/components/game/settings/BoxShuffle.vue';
import ModeSelection from '@/components/game/settings/ModeSelection.vue';
import TypeShuffle from '@/components/game/settings/TypeShuffle.vue';
import { useGameFlow } from '@/stores/useGameFlow.ts';

const { t } = useI18n();
const { setGameSelectionState, setChallengeMode } = useGameFlow();

const goNext = () => {
  setChallengeMode('challenge');
  setGameSelectionState('gen');
};

const goBack = () => {
  setGameSelectionState('challenge');
};
</script>

<template>
  <div class="root">
    <h2>{{ t('challengeSetup') }}</h2>

    <div class="explanation">
      <p class="rules-text">{{ t('challengeRulesExplanation') }}</p>
    </div>

    <div class="options">
      <ModeSelection />

      <TypeShuffle />

      <BoxShuffle />
    </div>

    <div class="actions">
      <RoundedButton @click="goBack">
        {{ t('back') }}
      </RoundedButton>

      <RoundedButton
        primary
        @click="goNext"
      >
        {{ t('next') }}
      </RoundedButton>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
}

.explanation {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  max-width: 500px;
  line-height: 1.4;

  .rules-text {
    margin-bottom: 0;
    line-height: 1.8;
  }
}

.options {
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
  align-items: center;
  justify-content: center;

  .mobile & {
    flex-direction: column;

    > * {
      align-self: center;
    }
  }
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>
