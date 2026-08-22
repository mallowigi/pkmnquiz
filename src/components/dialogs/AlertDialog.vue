<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useAlerts } from '@/stores/useAlerts.ts';

const { alertState, closeAlert } = useAlerts();
const { t } = useI18n();

const confirm = () => {
  const cb = alertState.options?.onConfirm || alertState.callback;
  closeAlert();

  if (cb) {
    cb();
  }
};

const cancel = () => {
  const onCancel = alertState.options?.onCancel;
  closeAlert();

  if (onCancel) {
    onCancel();
  }
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="cancel"
  >
    <div class="prompt">
      <h2>{{ alertState.options?.title || t('alertDialog.title') }}</h2>
      <p
        v-if="alertState.options?.description"
        class="desc"
      >
        {{ alertState.options.description }}
      </p>

      <RoundedButton
        :class="alertState.options?.confirmClass || 'danger-btn'"
        @click.stop="confirm"
        primary
      >
        {{ alertState.options?.confirmText || t('continue') }}
      </RoundedButton>

      <RoundedButton
        @click.stop="cancel"
        primary
      >
        {{ alertState.options?.cancelText || t('cancel') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped></style>
