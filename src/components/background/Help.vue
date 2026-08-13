<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ImageModal from '@/components/common/ImageModal.vue';
import { useHelp } from '@/stores/useHelp.ts';

const { hideHelp, getHelpSections } = useHelp();
const { t } = useI18n();
const selectedImage = ref<string | null>(null);

const expandedSections = ref<Set<string>>(new Set(['howToPlay']));

const toggleSection = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId);
  } else {
    expandedSections.value.add(sectionId);
  }
};

const isSectionExpanded = (sectionId: string) => {
  return expandedSections.value.has(sectionId);
};

const openImageModal = (imagePath: string) => {
  selectedImage.value = imagePath;
};

const closeImageModal = () => {
  selectedImage.value = null;
};
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
          v-for="section in getHelpSections()"
          :key="section.id"
          class="help-item"
        >
          <div
            class="section-header pointer"
            @click="toggleSection(section.id)"
          >
            <div class="section-title">
              <span class="expand-icon">{{ isSectionExpanded(section.id) ? '▼' : '▶' }}</span>
              {{ t(section.titleKey) }}
            </div>
          </div>

          <div
            v-if="isSectionExpanded(section.id)"
            class="section-content"
          >
            <div
              v-if="section.descriptionKey"
              class="section-description"
            >
              {{ t(section.descriptionKey) }}
            </div>

            <div
              v-if="section.image"
              class="section-image-container"
            >
              <img
                :src="section.image"
                :alt="t(section.titleKey)"
                class="section-image pointer"
                @click="openImageModal(section.image)"
              />
            </div>

            <div
              v-if="section.subsections"
              class="subsections"
            >
              <div
                v-for="subsection in section.subsections"
                :key="subsection.id"
                class="subsection"
              >
                <div class="subsection-title">
                  {{ t(subsection.titleKey) }}
                </div>
                <div class="subsection-description">
                  {{ t(subsection.descriptionKey) }}
                </div>

                <div
                  v-if="subsection.image"
                  class="subsection-image-container"
                >
                  <img
                    :src="subsection.image"
                    :alt="t(subsection.titleKey)"
                    class="subsection-image pointer"
                    @click="openImageModal(subsection.image)"
                  />
                </div>

                <div
                  v-if="subsection.tips"
                  class="tips"
                >
                  <div
                    v-for="(tip, index) in subsection.tips"
                    :key="index"
                    class="tip"
                  >
                    💡 {{ t(tip) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <ImageModal
      :selected-image="selectedImage"
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
  padding-right: 5px;
}

.help-list {
  font-size: 0.9em;
  display: grid;
  grid-auto-rows: minmax(0, auto);
  width: 100%;
  gap: 8px;
}

.help-item {
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid var(--type-btn-color, var(--primary));
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.help-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 12px 10px;
  background-color: rgba(var(--type-btn-color-rgb, 0, 0, 0), 0.05);
  transition: background-color 0.2s ease;
}

.section-header:hover {
  background-color: rgba(var(--type-btn-color-rgb, 0, 0, 0), 0.1);
}

.section-title {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--type-btn-color, var(--primary));
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 0.8em;
  transition: transform 0.2s ease;
  display: inline-block;
  width: 12px;
}

.section-content {
  padding: 10px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-description {
  line-height: 1.6;
  margin-bottom: 10px;
}

.section-image-container,
.subsection-image-container {
  margin: 12px 0;
  text-align: center;
}

.section-image,
.subsection-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid var(--type-btn-color, var(--primary));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.section-image:hover,
.subsection-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.subsections {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.subsection {
  padding: 10px;
  background-color: rgba(var(--type-btn-color-rgb, 0, 0, 0), 0.03);
  border-left: 3px solid var(--type-btn-color, var(--primary));
  border-radius: 4px;
}

.subsection-title {
  font-weight: 600;
  font-size: 1em;
  color: var(--type-btn-color, var(--primary));
  margin-bottom: 6px;
}

.subsection-description {
  line-height: 1.5;
  font-size: 0.95em;
}

.tips {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.tip {
  padding: 8px;
  background-color: rgba(255, 200, 0, 0.1);
  border-left: 3px solid #ffc800;
  border-radius: 3px;
  font-size: 0.9em;
  line-height: 1.4;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .popuptext {
    width: 90vw;
    height: 80%;
    top: 5%;
  }

  .section-title {
    font-size: 1em;
  }

  .subsection-title {
    font-size: 0.95em;
  }
}
</style>
