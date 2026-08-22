<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import TextBox from '@/components/common/TextBox.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useAlerts } from '@/stores/useAlerts.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { closeDialog } = useDialogs();
const { t } = useI18n();
const { roomState, joinOrCreateRoom, destroyRoom } = useRooms();
const { dialogs } = useDialogs();

const promptDelete = () => {
  closeDialog();

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
      <h2>{{ t('leaveRoomDialog.title') }}</h2>
      <p class="desc">{{ t('leaveRoomDialog.description') }}</p>

      <RoundedButton
        class="danger-btn"
        @click.stop="promptDelete"
      >
        {{ t('continue') }}
      </RoundedButton>

      <RoundedButton @click.stop="cancel">
        {{ t('cancel') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>
