<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import { useLastInput } from '@/composables/useLastInput.ts';
import { useBonus } from '@/stores/useBonus.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
import { capitalize } from '@/utils/utils.ts';

const { t } = useI18n();
const { lastInput } = useLastInput();
const { findClosestPokemon } = usePokemons();
const { triggerSpellChecker } = useBonus();

const hintShown = ref(false);
const hint = ref(t('notFound'));

const toggle = () => {
  hintShown.value = !hintShown.value;

  if (hintShown.value && lastInput.value) {
    hint.value = capitalize(findClosestPokemon(lastInput.value!) || 'not found');
    triggerSpellChecker();
  }
};

watch(
  () => lastInput.value,
  () => {
    hintShown.value = false;
  },
);
</script>

<template>
  <RoundedBox class="cell">
    <div class="label rad-bl">
      <span class="txt">{{ t('closestSpelling') }}</span>
    </div>

    <div class="button rad-tr transition-element">
      <div
        @click="toggle"
        :hidden="hintShown"
      >
        {{ t('revealHint') }}
      </div>

      <div
        @click="toggle"
        :hidden="!hintShown"
        class="txt hint"
      >
        {{ hint }}
      </div>
    </div>
  </RoundedBox>
</template>

<style scoped>
.cell {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: 150px;
  border-radius: 3px 20px;
  padding: 0;
  gap: 0;

  .mobile & {
    align-self: center;
    min-width: 0;
    position: sticky;
    top: 134px;
    z-index: 3;
  }
}

.label {
  background: var(--type-btn-color, var(--primary));
  color: var(--type-fg-color, var(--text));
  padding: 10px 18px;

  .mobile & {
    display: none;
  }
}

.button {
  cursor: pointer;
  padding: 10px 18px;

  &:hover {
    background-color: var(--type-dark-color, var(--darkPrimary));
    border-color: var(--type-dark-color, var(--darkPrimary));
  }

  .mobile & {
    border-radius: 3px 20px;
  }
}

.hint {
  font-size: 20px;
}
</style>
