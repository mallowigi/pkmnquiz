<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useI18n } from 'vue-i18n';

import { credits } from '@/data/credits';
import { useCredits } from '@/stores/useCredits';
import { useHelp } from '@/stores/useHelp.ts';

const { showHelp, hideHelp } = useHelp();
const { t } = useI18n();
</script>

<template>
  <div
    class="popuptext rad"
    ref="target"
    v-on-click-outside="hideHelp"
  >
    <div
      class="paragraph pointer"
      @click="showHelp"
    >
      <div class="close pointer">🞬</div>
    </div>
  </div>
</template>

<style scoped>
.popuptext {
  width: 75vw;
  height: 70%;
  contain: content;
  background-color: var(--button);
  color: var(--text);
  padding: 10px 10px;
  position: fixed;
  z-index: 10;
  left: 0;
  right: 0;
  top: 10%;
  margin-inline: auto;
  border: var(--type-btn-color, var(--primary)) solid 2px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.close {
  color: var(--type-btn-color, var(--primary));
  font-size: 1.5em;
  line-height: 22px;
}

.paragraph {
  font-size: 1.15em;
  padding-bottom: 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
}
</style>
