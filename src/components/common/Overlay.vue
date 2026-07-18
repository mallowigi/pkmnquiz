<script setup lang="ts">
import { useDrag } from '@vueuse/gesture';
import { onMounted, onUnmounted, ref, computed } from 'vue';

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

const y = ref(0);
const dragging = ref(false);
const contentRef = ref<HTMLElement | null>(null);

useDrag(
  ({ movement: [, my], dragging: isDragging, last, velocity: [, vy], event }) => {
    if (props.preventClosing) return;

    const target = event.target as HTMLElement;
    const isAtTop = (el: HTMLElement): boolean => {
      if (el.scrollTop > 0) return false;
      let parent = el.parentElement;
      while (parent && parent !== contentRef.value) {
        if (parent.scrollTop > 0) return false;
        parent = parent.parentElement;
      }
      return true;
    };

    if (!isAtTop(target) && my > 0) return;

    dragging.value = isDragging;
    if (isDragging) {
      y.value = Math.max(0, my);
      if (y.value > 0 && event.cancelable) {
        event.preventDefault();
      }
    } else if (last) {
      if (y.value > 150 || (y.value > 50 && vy > 0.5)) {
        close();
      }
      y.value = 0;
    }
  },
  {
    axis: 'y',
    domTarget: contentRef,
    eventOptions: { passive: false },
  },
);

const contentStyle = computed(() => ({
  transform: `translateY(${y.value}px)`,
  transition: dragging.value ? 'none' : 'transform 0.3s ease-out',
}));

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div :class="['overlay', $attrs.class]">
    <div
      ref="contentRef"
      class="overlay-wrapper"
      :style="contentStyle"
      @click.self="close"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

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
