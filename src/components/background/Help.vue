<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useI18n } from 'vue-i18n';

import { useHelp } from '@/stores/useHelp.ts';

const { hideHelp } = useHelp();
const { t } = useI18n();

const sections = ['howToPlay', 'gameModes', 'settings', 'leaderboards'] as const;
</script>

<template>
  <div
    class="popuptext rad"
    ref="target"
    v-on-click-outside="hideHelp"
  >
    <div
      class="paragraph pointer"
      @click="hideHelp"
    >
      {{ t('help') }}
      <div class="close pointer">🞬</div>
    </div>

    <div class="help-popup">
      <div class="help-list">
        <div
          v-for="section in sections"
          :key="section"
          class="help-item"
        >
          <div class="section-title">
            {{ t(`helpPopup.${section}.title`) }}
          </div>

          <div class="section-description">
            {{ t(`helpPopup.${section}.description`) }}
          </div>
        </div>
      </div>
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

.help-popup {
  overflow: auto;
  min-height: 0;
}
.help-list {
  font-size: 0.9em;
  display: grid;
  grid-auto-rows: minmax(0, auto);
  width: 100%;
}

.help-item {
  display: grid;
  grid-template-columns: 1fr;
  border-top: 2px dotted var(--type-btn-color, var(--primary));
  padding: 10px 0;
}

.section-title {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--type-btn-color, var(--primary));
  margin-bottom: 5px;
}

.section-description {
  line-height: 1.4;
}
</style>
