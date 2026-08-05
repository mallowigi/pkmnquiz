<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useQuiz } from '@/composables/useQuiz.ts';
import { useShuffles } from '@/composables/useShuffles.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow';

const { startGame } = useGameFlow();
const { resetQuiz } = useQuiz();
const { updateShuffles } = useShuffles();
const { dialogs, closeDialog } = useDialogs();
const { t } = useI18n();

const reset = () => {
  closeDialog();
  resetQuiz();
  updateShuffles();
  startGame();

  if (dialogs.callback) {
    dialogs.callback();
  }
};

const cancel = () => {
  closeDialog();
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="cancel"
  >
    <div class="prompt">
      <h2>{{ t('resetDialog.title') }}</h2>
      <p class="desc">{{ t('resetDialog.description') }}</p>

      <RoundedButton
        @click.stop="reset"
        primary
      >
        {{ t('reset') }}
      </RoundedButton>

      <RoundedButton
        @click.stop="cancel"
        primary
      >
        {{ t('cancel') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped></style>
