<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import MultiplayerInvite from '@/components/game/settings/MultiplayerInvite.vue';
import ShadowsToggle from '@/components/game/settings/ShadowsToggle.vue';
import { useDialogs } from '@/stores/useDialogs.js';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { setDialog } = useDialogs();
const { t } = useI18n();
const { setGameSelectionState } = useGameFlow();
const { isOwner } = storeToRefs(useRooms());

const newGame = () => {
  setGameSelectionState('new');
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
        v-if="isOwner"
      >
        {{ t('newGame') }}
      </RoundedButton>

      <RoundedButton
        class="rad-br-tl danger-btn"
        @click="giveUp"
        v-game-ended
        v-if="isOwner"
      >
        {{ t('giveUp') }}
      </RoundedButton>

      <RoundedButton
        class="rad-br-tl danger-btn"
        @click="resetGame"
        v-if="isOwner"
      >
        {{ t('reset') }}
      </RoundedButton>

      <MultiplayerInvite />
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
