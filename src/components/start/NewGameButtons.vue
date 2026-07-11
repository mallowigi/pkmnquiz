<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useSavedData } from '@/composables/useSavedData.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useSettings } from '@/stores/useSettings.ts';

const { t } = useI18n();
const { setGameSelectionState } = useGameFlow();
const { settingsState } = useSettings();
const { loadAutoSave, setReady, hasSavedState } = useSavedData();

const newGame = () => {
  if (!settingsState.name) {
    return;
  }

  setGameSelectionState('challenge');
  setReady();
};

const continueGame = () => {
  loadAutoSave();
  setReady();
};
</script>

<template>
  <div class="row">
    <RoundedButton
      primary
      :disabled="!settingsState.name"
      @click="newGame"
    >
      {{ t('newGame') }}
    </RoundedButton>

    <RoundedButton
      primary
      v-if="hasSavedState()"
      @click="continueGame"
    >
      {{ t('continue') }}
    </RoundedButton>
  </div>
</template>

<style scoped></style>
