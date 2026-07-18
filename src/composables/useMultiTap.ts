import { onUnmounted } from 'vue';
import type { Ref } from 'vue';

interface UseMultiTapOptions {
  onDoubleTap: () => void;
  onTripleTap: () => void;
  disabled?: Ref<boolean>;
  timeout?: number;
}

/**
 * Detects double and triple tap gestures on touch devices.
 * Returns a `handleTap` handler to bind to `@touchend` on the target element.
 *
 * @example
 * const { handleTap } = useMultiTap({ onDoubleTap: playCry, onTripleTap: showShadow });
 * // <div @touchend="handleTap" />
 */
export function useMultiTap({ onDoubleTap, onTripleTap, disabled, timeout = 300 }: UseMultiTapOptions) {
  let tapCount = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const handleTap = (e: TouchEvent) => {
    if (disabled?.value) return;

    tapCount++;

    // Prevent text selection / click synthesis on 2nd+ taps
    if (tapCount > 1) {
      e.preventDefault();
    }

    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      if (tapCount === 2) onDoubleTap();
      else if (tapCount >= 3) onTripleTap();
      tapCount = 0;
      timer = null;
    }, timeout);
  };

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return { handleTap };
}
