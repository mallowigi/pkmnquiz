<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { useI18n } from 'vue-i18n';

import ChartIcon from '@/components/common/icons/ChartIcon.vue';
import HelpIcon from '@/components/common/icons/HelpIcon.vue';
import SettingsIcon from '@/components/common/icons/SettingsIcon.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import ProfilePic from '@/components/header/ProfilePic.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useHelp } from '@/stores/useHelp.ts';

const { setDialog, dialogs } = useDialogs();
const { showHelp, hideHelp, helpState } = useHelp();
const { t } = useI18n();
const { auth } = useFirebase();
const { flowState } = useGameFlow();
const { isAuthenticated } = useAuth(auth);

const showLeaderBoards = () => {
  hideHelp();
  if (dialogs.dialog === 'leaderboards') {
    setDialog(null);
    return;
  }
  setDialog('leaderboards');
};

const toggleHelp = () => {
  setDialog(null);
  if (helpState.showHelp) {
    hideHelp();
    return;
  }
  showHelp();
};

const showUserProfile = () => {
  hideHelp();
  if (isAuthenticated.value) {
    setDialog('userProfile');
  } else {
    setDialog('login');
  }
};

const showVisualSettings = () => {
  // Not implemented yet
};
</script>

<template>
  <div
    class="mobile-controls"
    v-if="flowState.isStarted"
  >
    <div class="controls-row">
      <RoundedButton
        class="control-btn"
        @click="showLeaderBoards"
        v-tooltip:top="t('showLeaderBoards')"
      >
        <ChartIcon />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        @click="toggleHelp"
        v-tooltip:top="t('help')"
      >
        <HelpIcon />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        @click="showUserProfile"
        v-tooltip:top="t('userProfile')"
      >
        <ProfilePic :size="24" />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        @click="showVisualSettings"
        v-tooltip:top="t('visualSettings')"
      >
        <SettingsIcon />
      </RoundedButton>
    </div>
  </div>
</template>

<style scoped>
.mobile-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--button);
  border-top: 2px solid var(--type-btn-color, var(--primary));
  padding: 10px;
  z-index: 100;
}

.controls-row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.control-btn {
  margin: 0;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  border-radius: 0;
  border-right-style: dotted;
  border-left: none;
  padding: 12px;

  &:first-child {
    border-left: 2px solid var(--type-btn-color, var(--primary));
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  &:last-child {
    border-right-style: solid;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:hover {
    background-color: var(--type-dark-color, var(--darkPrimary));
    border-color: var(--type-dark-color, var(--darkPrimary));
  }

  &.selected {
    background-color: var(--type-btn-color, var(--primary));
    border-color: var(--type-btn-color, var(--primary));
    color: var(--type-fg-color, var(--text));
  }
}

:deep(.avatar) {
  border: 1px solid var(--text);
}
</style>
