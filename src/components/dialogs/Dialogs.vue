<script setup lang="ts">
import ChangeTimerDialog from '@/components/dialogs/ChangeTimerDialog.vue';
import GiveUpDialog from '@/components/dialogs/GiveUpDialog.vue';
import ModeDialog from '@/components/dialogs/ModeDialog.vue';
import ResetDialog from '@/components/dialogs/ResetDialog.vue';
import ShadowsDialog from '@/components/dialogs/ShadowsDialog.vue';
import SwitchQuizDialog from '@/components/dialogs/SwitchQuizDialog.vue';
import { useDialogs } from '@/stores/useDialogs';
import LeaderBoardsDialog from '@/components/dialogs/LeaderBoardsDialog.vue';
import FadeTransition from '@/components/common/transitions/FadeTransition.vue';
import UserProfileDialog from '@/components/dialogs/UserProfileDialog.vue';
import { useI18n } from 'vue-i18n';
import LoginDialog from '@/components/dialogs/LoginDialog.vue';
import VisualSettingsDialog from '@/components/dialogs/VisualSettingsDialog.vue';

const { dialogs } = useDialogs();
const { t } = useI18n();
</script>

<template>
  <FadeTransition>
    <ModeDialog
      mode="chaos"
      :caption="t('modeDialog.chaosCaption')"
      v-if="dialogs.dialog === 'chaos'"
    />

    <ModeDialog
      mode="order"
      :caption="t('modeDialog.orderCaption')"
      v-if="dialogs.dialog === 'order'"
    />

    <ModeDialog
      mode="normal"
      :caption="t('modeDialog.normalCaption')"
      v-if="dialogs.dialog === 'normal'"
    />

    <ShadowsDialog v-if="dialogs.dialog === 'shadows'" />

    <SwitchQuizDialog v-if="dialogs.dialog === 'switchQuiz'" />

    <ChangeTimerDialog v-if="dialogs.dialog === 'timer'" />

    <GiveUpDialog v-if="dialogs.dialog === 'giveup'" />

    <ResetDialog v-if="dialogs.dialog === 'reset'" />

    <LeaderBoardsDialog v-if="dialogs.dialog === 'leaderboards'" />

    <UserProfileDialog v-if="dialogs.dialog === 'userProfile'" />

    <LoginDialog v-if="dialogs.dialog === 'login'" />

    <VisualSettingsDialog v-if="dialogs.dialog === 'visualSettings'" />
  </FadeTransition>
</template>

<style scoped></style>
