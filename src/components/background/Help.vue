<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useI18n } from 'vue-i18n';

import HelpSection from '@/components/background/help/HelpSection.vue';
import ImageModal from '@/components/common/ImageModal.vue';
import { useHelp } from '@/stores/useHelp.ts';

const { hideHelp, getHelpSections, toggleSection, isSectionExpanded, openImageModal, closeImageModal, helpState } =
  useHelp();
const { t } = useI18n();
</script>

<template>
  <div
    class="popuptext rad"
    ref="target"
    v-on-click-outside="hideHelp"
  >
    <div
      class="title pointer"
      @click="hideHelp"
    >
      {{ t('help') }}
      <div class="close pointer">🞬</div>
    </div>

    <div class="help-popup">
      <div class="help-list">
        <HelpSection
          v-for="section in getHelpSections()"
          :key="section.id"
          :section="section"
          :is-expanded="isSectionExpanded(section.id)"
          @toggle="toggleSection(section.id)"
          @open-image="openImageModal"
        />
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal
      :selected-image="helpState.selectedImage"
      @close-image-modal="closeImageModal"
    />
  </div>
</template>

<style scoped>
.popuptext {
  width: 75vw;
  height: 70%;
  max-height: 80vh;
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

.title {
  font-size: 1.25rem;
  padding-bottom: 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  text-align: center;
}

.help-popup {
  overflow: auto;
  min-height: 0;
  padding-right: 5px;
}

.help-list {
  font-size: 0.9em;
  display: grid;
  grid-auto-rows: minmax(0, auto);
  width: 100%;
  gap: 8px;
}

@media (max-width: 768px) {
  .popuptext {
    width: 90vw;
    height: 80%;
    top: 5%;
  }
}

b,
strong,
em,
i,
.highlight {
  :deep(&) {
    color: var(--type-inline-color, var(--primary));
  }
}
</style>
