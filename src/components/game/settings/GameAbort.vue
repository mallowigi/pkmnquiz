<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import ShadowsToggle from '@/components/game/settings/ShadowsToggle.vue';
import { useDialogs } from '@/stores/useDialogs.js';
import { useGameFlow } from '@/stores/useGameFlow.ts';

const { setDialog } = useDialogs();
const { t } = useI18n();
const { setGameSelectionState } = useGameFlow();

const newGame = () => {
  setGameSelectionState('gen');
};

const giveUp = () => {
  setDialog('giveup');
};

const resetGame = () => {
  setDialog('reset');
};
</script>

<template>
  <div class="row">
    <div class="abort-buttons">
      <RoundedButton
        class="rad-br-tl danger-btn"
        @click="newGame"
        v-game-ended
      >
        {{ t('newGame') }}
      </RoundedButton>

      <RoundedButton
        class="rad-br-tl danger-btn"
        @click="giveUp"
        v-game-ended
      >
        {{ t('giveUp') }}
      </RoundedButton>

      <RoundedButton
        class="rad-br-tl danger-btn"
        @click="resetGame"
      >
        {{ t('reset') }}
      </RoundedButton>
    </div>

    <ShadowsToggle />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .mobile & {
    flex-direction: column;
    justify-content: center;
    align-self: center;
  }
}

.abort-buttons {
  display: flex;

  .mobile & {
    margin-left: -10px;
  }
}
</style>
