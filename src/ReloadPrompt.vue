<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
const { t } = useI18n();

function close() {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>

<template>
  <div
    class="pwa-toast rad-bl-tr"
    v-if="offlineReady || needRefresh"
    role="alert"
    aria-live="polite"
  >
    <p class="message">
      <span v-if="offlineReady"> {{ t('appReadyOffline') }} </span>
      <span v-else> {{ t('newContentAvailable') }} </span>
    </p>

    <div class="actions">
      <RoundedButton
        v-if="needRefresh"
        :primary="true"
        @click="updateServiceWorker()"
      >
        {{ t('reload') }}
      </RoundedButton>

      <RoundedButton @click="close">{{ t('close') }}</RoundedButton>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 16px;
  border: 2px solid var(--type-bg-color, var(--primary));
  color: var(--text);
  background-color: var(--button);

  z-index: 100;
  text-align: left;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  .mobile & {
    right: 8px;
    left: 8px;
    bottom: 8px;
    margin: 0;
    max-width: none;
    align-items: center;
    ta: c;
  }
}

.message {
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
