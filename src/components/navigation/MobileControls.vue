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
  hideHelp();
  setDialog('visualSettings');
};
</script>

<template>
  <div
    class="mobile-controls rad-br-tl"
    v-if="flowState.isStarted"
  >
    <div class="controls-row">
      <RoundedButton
        class="control-btn"
        :selected="dialogs.dialog === 'leaderboards'"
        @click="showLeaderBoards"
        v-tooltip:top="t('showLeaderBoards')"
      >
        <ChartIcon />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        :selected="helpState.showHelp"
        @click="toggleHelp"
        v-tooltip:top="t('help')"
      >
        <HelpIcon />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        :selected="dialogs.dialog === 'userProfile' || dialogs.dialog === 'login'"
        @click="showUserProfile"
        v-tooltip:top="t('userProfile')"
      >
        <ProfilePic :size="24" />
      </RoundedButton>

      <RoundedButton
        class="control-btn"
        :selected="dialogs.dialog === 'visualSettings'"
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
  bottom: 0.5rem;
  left: 1rem;
  right: 1rem;
  background: var(--button);
  padding: 0;
  z-index: 2;
  backdrop-filter: blur(5px);
  filter: opacity(0.8);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
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
  padding: 10px;

  &:first-child {
    border-left: 2px solid var(--type-btn-color, var(--primary));
    border-radius: 20px 0 0 3px;
  }

  &:last-child {
    border-right-style: solid;
    border-radius: 0 3px 20px 0;
  }

  &:hover {
    background-color: var(--type-dark-color, var(--darkPrimary));
    border-color: var(--type-dark-color, var(--darkPrimary));
    border-left: none;
  }

  &.selected {
    background-color: var(--type-btn-color, var(--primary));
    border-color: var(--type-btn-color, var(--primary));
    border-left: none;
  }
}

:deep(.avatar) {
  border: 1px solid var(--text);
}
</style>
