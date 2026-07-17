<script setup lang="ts">
import { useOnline } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const online = useOnline();
</script>

<template>
  <div
    class="banner"
    v-if="!online"
  >
    {{ t('offlineModeBanner') }}
  </div>
</template>

<style scoped>
.banner {
  width: 100vw;
  height: 32px;
  padding: 8px;
  background-color: var(--danger);
  color: white;
}
</style>
