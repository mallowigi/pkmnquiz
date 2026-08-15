<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  selectedImage: string | null;
}>();

const emits = defineEmits<{
  (e: 'closeImageModal'): void;
}>();

const closeImageModal = () => {
  emits('closeImageModal');
};
</script>

<template>
  <div
    v-if="selectedImage"
    class="image-modal"
    @click="closeImageModal"
  >
    <div class="image-modal-content">
      <img
        :src="selectedImage"
        alt="Help screenshot"
        class="modal-image"
      />
      <div class="modal-close">{{ t('close') }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.modal-image {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-close {
  color: white;
  font-size: 1.1em;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
