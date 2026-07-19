import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

interface UseMultiTapOptions {
  onDoubleTap: () => void;
  onTripleTap: () => void;
  disabled?: Ref<boolean>;
  timeout?: number;
}

const TAP_MAX_MOVE = 10;

export function useMultiTap({ onDoubleTap, onTripleTap, disabled, timeout = 300 }: UseMultiTapOptions) {
  let tapCount = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (disabled?.value) return;

    // Ignore scroll gestures
    if (e.changedTouches.length > 0) {
      const dx = Math.abs(e.changedTouches[0].clientX - startX);
      const dy = Math.abs(e.changedTouches[0].clientY - startY);

      if (dx > TAP_MAX_MOVE || dy > TAP_MAX_MOVE) {
        tapCount = 0;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        return;
      }
    }

    tapCount++;

    // Prevent text selection / double-tap zoom on 2nd+ taps
    if (tapCount > 1) {
      e.preventDefault();
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (tapCount === 2) {
        onDoubleTap();
      } else if (tapCount >= 3) {
        onTripleTap();
      }

      tapCount = 0;
      timer = null;
    }, timeout);
  };

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);
  });

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchend', onTouchEnd);
    if (timer) clearTimeout(timer);
  });
}
