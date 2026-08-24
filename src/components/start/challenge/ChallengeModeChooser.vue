<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import MultiplayerInvite from '@/components/game/settings/MultiplayerInvite.vue';
import { useAppBreakpoints } from '@/composables/useAppBreakpoints.ts';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useMessages } from '@/stores/useMessages.ts';

const { t } = useI18n();
const { setGameSelectionState, setChallengeMode } = useGameFlow();

const { isMobile } = useAppBreakpoints();
const { auth } = useFirebase();
const { showUserMessage } = useMessages();

const selectFreeMode = () => {
  setGameSelectionState('gen');
  setChallengeMode('free');
};

const selectChallengeMode = () => {
  setGameSelectionState('challengeSetup');
  setChallengeMode('challenge');
};

const selectMultiplayerMode = () => {
  if (!auth.currentUser?.uid) {
    showUserMessage('You must be logged in to join a room.', 'error');
    return;
  }

  setGameSelectionState('createRoom');
};
</script>

<template>
  <div class="root">
    <h2>{{ t('typeOfChallenge') }}</h2>

    <div class="top-section">
      <div
        class="twocols"
        :class="{ vertical: isMobile }"
      >
        <div class="side">
          <RoundedButton
            primary
            @click="selectFreeMode"
          >
            {{ t('freeMode') }}
          </RoundedButton>

          <p class="description">
            {{ t('freeModeDescription') }}
          </p>
        </div>

        <div class="separator" />

        <div class="side">
          <RoundedButton
            class="danger-btn"
            primary
            @click="selectChallengeMode"
          >
            {{ t('challengeMode') }}
          </RoundedButton>

          <p class="description">
            {{ t('challengeModeDescription') }}
          </p>
        </div>

        <div
          class="separator"
          v-if="auth.currentUser?.uid"
        />

        <div
          class="side"
          v-if="auth.currentUser?.uid"
        >
          <RoundedButton
            class="danger-btn"
            primary
            @click="selectMultiplayerMode"
          >
            {{ t('multiplayerInvite') }}
          </RoundedButton>

          <p class="description">
            {{ t('multiplayerModeDescription') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.top-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: center;
  padding: 16px 0;

  .mobile & {
    gap: 16px;
    padding: 8px 0;
  }
}

.separator {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--text);
  opacity: 0.2;
  margin: 16px 0;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}

.mobile {
  .separator,
  .save-buttons,
  .leaderboards-table {
    display: none;
  }
}

.twocols {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: center;
  padding: 16px 0;

  &.vertical {
    flex-direction: column;
  }
}

.separator {
  display: inline-block;
  width: 1px;
  margin: 0 0 -10px 10px;
  border: 1px dashed var(--secondary);
  align-self: stretch;
}

.large-text {
  padding: 6px;
  width: 200px;
}

.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.description {
  margin-top: 8px;
  color: var(--secondary);
  max-width: 300px;
  line-height: 1.4;
}
</style>
