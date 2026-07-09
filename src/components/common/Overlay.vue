<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  preventClosing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  if (!props.preventClosing) {
    emit('close');
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    :class="['overlay', $attrs.class]"
    @click.self="close"
  >
    <slot />
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  background-color: var(--overlay-bg, rgba(16, 17, 14, 0.8));
  z-index: 4;
  inset: 0;
  display: flex;
  width: 100dvw;
  height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overscroll-behavior: contain;

  .mobile & {
    overflow: hidden;
  }
}

:deep(.prompt) {
  text-align: center;
  color: white;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
