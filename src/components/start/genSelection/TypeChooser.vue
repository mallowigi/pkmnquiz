<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import { useQuiz } from '@/composables/useQuiz.js';
import { useTranslations } from '@/composables/useTranslations.js';
import { gens } from '@/data/gens.ts';
import { typesList, pokemonTypes } from '@/data/pokemonTypes';
import { useCurrentType } from '@/stores/useCurrentType';
import { useGameFlow } from '@/stores/useGameFlow.js';
import type { Type, Gen } from '@/types.ts';

const activeTypes = ref<Set<Type>>(new Set());

const { setGameSelectionState } = useGameFlow();
const { getSpecialType } = useCurrentType();
const { setTypesQuiz } = useQuiz();
const { getTypeTranslation } = useTranslations();
const { t } = useI18n();

const goBack = () => {
  setGameSelectionState('gen');
};

const toggleType = (type: Type) => {
  if (activeTypes.value.has(type)) {
    activeTypes.value.delete(type);
  } else {
    activeTypes.value.add(type);
  }
};

const startQuiz = (types: Set<Type>) => {
  setTypesQuiz(Array.from(types));
};

const shuffle = () => {
  const typeIds = Object.keys(pokemonTypes);
  const randomSize = Math.floor(Math.random() * typeIds.length) + 1;
  const shuffledTypes = new Set<Type>();

  while (shuffledTypes.size < randomSize) {
    const randomIndex = Math.floor(Math.random() * typeIds.length);
    const randomTypeId = typeIds[randomIndex] as Type;
    shuffledTypes.add(randomTypeId);
  }

  console.log('Shuffled Types:', Array.from(shuffledTypes));
  activeTypes.value = shuffledTypes;
};
</script>

<template>
  <div class="container">
    <div class="type-grid">
      <!--Types -->
      <RoundedButton
        v-for="typeMeta in typesList"
        :key="typeMeta.id"
        class="button-type"
        :class="{
          active: activeTypes.has(typeMeta.id),
        }"
        @click="toggleType(typeMeta.id)"
        :style="{ '--bgColor': typeMeta.bgColor, '--fgColor': typeMeta.fgColor }"
      >
        <img
          :src="`/assets/types/${typeMeta.icon}.svg`"
          :alt="typeMeta.name"
          class="symbol"
        />
        <div hidden>{{ typeMeta.symbol }}</div>
        <div class="type-name">{{ getTypeTranslation(typeMeta.id) }}</div>
      </RoundedButton>

      <div class="button-hidden"></div>
      <RoundedButton
        class="button-type button-back"
        @click="goBack"
        :style="{ '--bgColor': '#111', '--fgColor': '#fff' }"
      >
        <div class="type-name">{{ t('back') }}</div>
      </RoundedButton>
      <div></div>

      <div class="button-hidden2"></div>
      <RoundedButton
        class="button-type button-randomize"
        @click="shuffle"
      >
        <div class="type-name">{{ t('randomize') }}</div>
      </RoundedButton>
      <div></div>
    </div>

    <RoundedButton
      :disabled="activeTypes.size === 0"
      class="cell rad-bl-tr large-btn"
      @click="startQuiz(activeTypes)"
    >
      <div>{{ t('startQuiz') }}</div>
    </RoundedButton>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-direction: column;
}

.cell {
  background: var(--primary);
  color: var(--text);
  padding: 16px 20px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  min-height: 30px;
  line-height: 30px;
  font-size: 18px;
  min-width: 80px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
  }

  .mobile & {
    padding: 8px;
    font-size: 16px;
    min-width: 60px;
    min-height: 64px;
  }

  &.active {
    top: 4px;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    filter: brightness(0.5);
    border: 2px solid var(--primary);
    transition: all 0.2s ease-in-out;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit; /* Keeps your leaf shape */
      box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }
  }

  &.disabled {
    opacity: 0;
    pointer-events: none;
  }
}

.type-grid {
  margin-top: 1em;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(8, auto);
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;

  .mobile & {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(11, auto);
    grid-auto-flow: row;
  }
}

.button-type {
  background-color: var(--bgColor);
  color: var(--fgColor);
  border: 2px solid #333;
  border-radius: 35px 5px 15px 35px;
  padding: 14px 20px;
  font-size: 18px;
  min-width: 80px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: white;
  }

  .mobile & {
    border-radius: 6px;
  }
}

.button-hidden {
  grid-row: 7;
  grid-column: 1;
}

.button-hidden2 {
  grid-row: 8;
  grid-column: 1;
}

.button-back {
  grid-row: 7;
  grid-column: 2;
}

.button-randomize {
  grid-row: 8;
  grid-column: 2;
  background: var(--primary);
}

.symbol {
  filter: brightness(0) invert(1);
  width: 42px;
}

.type-name {
  display: inline-block;
  min-width: 65px;
  vertical-align: top;

  .mobile & {
    display: none;
  }

  .mobile .button-back & {
    display: inline-block;
  }
}
</style>
