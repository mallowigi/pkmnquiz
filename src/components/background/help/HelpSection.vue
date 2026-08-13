<script setup lang="ts">
import HelpSubsection from '@/components/background/help/HelpSubsection.vue';
import type { HelpSection } from '@/stores/useHelp.ts';

const props = defineProps<{
  section: HelpSection;
  isExpanded: boolean;
}>();

const emits = defineEmits<{
  (e: 'toggle'): void;
  (e: 'openImage', imagePath: string): void;
}>();

const toggleSection = () => {
  emits('toggle');
};

const openImage = (imagePath: string) => {
  emits('openImage', imagePath);
};
</script>

<template>
  <div class="help-item">
    <div
      class="section-header pointer"
      @click="toggleSection"
    >
      <div class="section-title">
        <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
        {{ section.titleKey }}
      </div>
    </div>

    <div
      v-if="isExpanded"
      class="section-content"
    >
      <div
        v-if="section.descriptionKey"
        class="section-description"
      >
        {{ section.descriptionKey }}
      </div>

      <div
        v-if="section.image"
        class="section-image-container"
      >
        <img
          :src="section.image"
          :alt="section.titleKey"
          class="section-image pointer"
          @click="openImage(section.image)"
        />
      </div>

      <div
        v-if="section.subsections"
        class="subsections"
      >
        <HelpSubsection
          v-for="subsection in section.subsections"
          :key="subsection.id"
          :subsection="subsection"
          @open-image="openImage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.section-image-container {
  margin: 12px 0;
  text-align: center;
}

.section-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid var(--type-btn-color, var(--primary));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.section-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.subsections {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .section-title {
    font-size: 1em;
  }
}
</style>
