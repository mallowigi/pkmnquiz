<script setup lang="ts">
import { ref } from 'vue';

/**
 * MorphResizeTransition
 *
 * A crossfade transition that ALSO smoothly animates its own height between the
 * outgoing and incoming content. This is ideal for swapping a loading skeleton
 * for real content when the two have a different number of rows/height: instead
 * of the layout snapping to a new size, the wrapper eases from the old height to
 * the new one while the contents blur-crossfade over each other.
 *
 * How it works:
 * - Uses the Transition default (simultaneous) mode so both children are present
 *   at the same time, enabling a true crossfade.
 * - The leaving element is pulled out of the flow (position: absolute) so the
 *   entering element defines the natural height.
 * - JS hooks lock the wrapper to the old height, then animate it to the new one
 *   using a CSS transition on `height`.
 */
const props = withDefaults(
  defineProps<{
    /** Duration of the crossfade / resize in milliseconds. */
    duration?: number;
  }>(),
  { duration: 300 },
);

const wrapper = ref<HTMLElement | null>(null);

/** Measures an element's full outer height, including vertical margins. */
const measure = (el: Element): number => {
  const htmlEl = el as HTMLElement;
  const style = getComputedStyle(htmlEl);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  return htmlEl.offsetHeight + marginTop + marginBottom;
};

const onBeforeLeave = (el: Element) => {
  const wrapperEl = wrapper.value;
  if (!wrapperEl) return;

  // Clip during the animation so the taller/absolute element doesn't spill out,
  // then lock the wrapper to the current (outgoing) height as the start point.
  wrapperEl.style.overflow = 'hidden';
  wrapperEl.style.height = `${measure(el)}px`;
};

const onEnter = (el: Element) => {
  const wrapperEl = wrapper.value;
  if (!wrapperEl) return;

  const targetHeight = measure(el);

  // If there was no leaving element (e.g. first mount), lock the start height now.
  if (!wrapperEl.style.height) {
    wrapperEl.style.overflow = 'hidden';
    wrapperEl.style.height = `${wrapperEl.offsetHeight}px`;
  }

  // Next frame: animate from the locked start height to the incoming height.
  requestAnimationFrame(() => {
    wrapperEl.style.height = `${targetHeight}px`;
  });
};

const onAfterEnter = () => {
  const wrapperEl = wrapper.value;
  if (!wrapperEl) return;

  // Release the explicit height/overflow so the content can size naturally again.
  wrapperEl.style.height = '';
  wrapperEl.style.overflow = '';
};
</script>

<template>
  <div
    ref="wrapper"
    class="morph-resize"
    :style="{ '--morph-resize-duration': `${props.duration}ms` }"
  >
    <Transition
      name="morph-resize"
      @before-leave="onBeforeLeave"
      @enter="onEnter"
      @after-enter="onAfterEnter"
    >
      <slot></slot>
    </Transition>
  </div>
</template>

<style scoped>
.morph-resize {
  position: relative;
  width: 100%;
  transition: height var(--morph-resize-duration, 300ms) ease-in-out;
}

.morph-resize-enter-active,
.morph-resize-leave-active {
  transition:
    opacity var(--morph-resize-duration, 300ms) ease-in-out,
    filter var(--morph-resize-duration, 300ms) ease-in-out;
}

.morph-resize-enter-from,
.morph-resize-leave-to {
  opacity: 0;
  filter: blur(8px);
}

/* Pull the leaving element out of flow so the entering one drives the height. */
.morph-resize-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .morph-resize,
  .morph-resize-enter-active,
  .morph-resize-leave-active {
    transition: none;
  }

  .morph-resize-enter-from,
  .morph-resize-leave-to {
    filter: none;
  }
}
</style>
