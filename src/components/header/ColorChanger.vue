<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useColors } from '@/composables/useColors.ts';
import { useSavedColor } from '@/composables/useSavedColor.ts';

const { savedColor } = useSavedColor();
const { colors } = useColors();
const { t } = useI18n();

const currentColor = computed(() => savedColor ?? colors.blue);
</script>

<template>
  <div class="color-changer">
    <select
      id="color"
      v-model="savedColor"
      v-tooltip:bottom="t('selectColor')"
      class="color-select"
      aria-label="Select color"
      :style="{ '--accent-color': currentColor.value }"
    >
      <button></button>
      <option
        v-for="(color, key) in colors"
        :key="`color-${color}`"
        :value="color"
      >
        <span
          class="swatch"
          :style="{ backgroundColor: color }"
          >&nbsp;</span
        >{{ t(key) }}
      </option>
    </select>
  </div>
</template>

<style scoped>
@keyframes accordion {
  from {
    transform: scaleY(0);
    opacity: 0;
  }

  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.color-changer {
  display: flex;
  align-items: center;
}

.color-select,
.color-select::picker(select) {
  appearance: base-select;
}

.color-select {
  border: 1px solid var(--text);
  border-radius: 50%;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: var(--accent-color);
  width: 32px;
  height: 32px;

  &:hover {
    background-color: var(--type-dark-color, var(--darkPrimary));
    color: var(--text-inverted);
  }

  &:focus-visible {
    outline: 2px solid var(--type-dark-color, var(--darkPrimary));
    outline-offset: 2px;
  }

  &::picker-icon {
    display: none;
  }

  option {
    line-height: 48px;
    min-width: 120px;
    border: none;
    box-shadow: none;
    outline: none;
    color: var(--text);
    padding: 0 12px;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;

    &:first-child {
      border-radius: 3px 20px 3px 3px;
    }

    &:last-child {
      border-radius: 3px 3px 3px 20px;
    }

    &:hover,
    &:focus,
    &:active {
      background-color: var(--type-dark-color, var(--darkPrimary));
      color: var(--text-inverted);
    }
  }

  button {
    appearance: none;
    background: transparent;
    border: none;
    width: 100%;
    height: 100%;
    cursor: pointer;
    padding: 0;
  }

  option::checkmark {
    display: none;
  }
}

.color-select::picker(select) {
  background: var(--button);
  border: 1px solid var(--type-btn-color, var(--primary));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: var(--text);
  overflow: visible;
  border-radius: 3px 20px;
  margin-top: 8px;
  transform-origin: center top;
  animation: accordion 0.2s ease-out;
}

.swatch {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
