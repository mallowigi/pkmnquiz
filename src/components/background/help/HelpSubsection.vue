<script setup lang="ts">
import type { HelpSubsection } from '@/stores/useHelp.ts';

const props = defineProps<{
  subsection: HelpSubsection;
}>();

const emits = defineEmits<{
  (e: 'openImage', imagePath: string): void;
}>();

const openImage = (imagePath: string) => {
  emits('openImage', imagePath);
};
</script>

<template>
  <div class="subsection">
    <div class="subsection-title">
      {{ subsection.titleKey }}
    </div>
    <div class="subsection-description">
      {{ subsection.descriptionKey }}
    </div>

    <div
      v-if="subsection.image"
      class="subsection-image-container"
    >
      <img
        :src="subsection.image"
        :alt="subsection.titleKey"
        class="subsection-image pointer"
        @click="openImage(subsection.image)"
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
        💡 {{ tip }}
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.subsection-image-container {
  margin: 12px 0;
  text-align: center;
}

.subsection-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid var(--type-btn-color, var(--primary));
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.subsection-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  .subsection-title {
    font-size: 0.95em;
  }
}
</style>
