<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useGameFlow } from '@/stores/useGameFlow';
import { usePokemons } from '@/stores/usePokemons';
import { useTimer } from '@/stores/useTimer';
import { useShuffles } from '@/composables/useShuffles.ts';

const { resetFlowState, startGame } = useGameFlow();
const { resetPokemonState } = usePokemons();
const { resetTimer } = useTimer();
const { updateShuffles } = useShuffles();
const { dialogs, closeDialog } = useDialogs();
const { t } = useI18n();

const reset = () => {
  closeDialog();
  resetPokemonState();
  updateShuffles();
  resetTimer();
  resetFlowState();
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
