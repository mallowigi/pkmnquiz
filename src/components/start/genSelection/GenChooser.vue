<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import CyclingSpecial from '@/components/start/genSelection/CyclingSpecial.vue';
import CyclingStarters from '@/components/start/genSelection/CyclingStarters.vue';
import CyclingType from '@/components/start/genSelection/CyclingType.vue';
import { useQuiz } from '@/composables/useQuiz.js';
import { gens } from '@/data/gens';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import type { Gen } from '@/types.js';

const activeGens = ref<Set<Gen>>(new Set());

const { t } = useI18n();
const { setGameSelectionState } = useGameFlow();

const { setFullQuiz, setGenQuiz, setTypeQuiz } = useQuiz();

const goBack = () => {
  setGameSelectionState('new');
};

const openSpecialChooser = () => {
  setGameSelectionState('special');
};

const toggleGen = (gen: Gen) => {
  if (activeGens.value.has(gen)) {
    activeGens.value.delete(gen);
  } else {
    activeGens.value.add(gen);
  }
};

const startQuiz = (gens: Set<Gen>) => {
  setGenQuiz(Array.from(gens));
};
</script>

<template>
  <div class="container">
    <div class="gens-grid">
      <!-- Full quiz-->
      <div />
      <div class="cell-full">
        <div
          class="cell rad-bl-tr"
          @click="setFullQuiz"
        >
          {{ t('fullQuiz') }}
        </div>
      </div>
      <div />

      <!-- Gens -->
      <div
        class="cell rad-bl"
        v-for="(gen, id, i) in gens"
        :class="{
          'rad-bl': i % 3 === 0,
          rad: i % 3 === 1,
          'rad-tr': i % 3 === 2,
          active: activeGens.has(gen.id),
        }"
        @click="toggleGen(gen.id)"
        :style="{ '--gen-color': gen.color }"
        :key="id"
      >
        <div hidden>{{ id }}</div>
        <div class="gen-name">{{ gen.name }}</div>

        <CyclingStarters
          :gen="gen"
          :start="i % 3"
        />
      </div>

      <!-- Types -->
      <CyclingType
        class="cell cell-type rad-bl"
        @click="setTypeQuiz"
      />

      <RoundedButton
        class="cell button-type button-back rad"
        @click="goBack"
      >
        <div class="type-name">{{ t('back') }}</div>
      </RoundedButton>

      <CyclingSpecial
        class="cell cell-type rad-tr"
        @click="openSpecialChooser"
      />
    </div>

    <RoundedButton
      :disabled="activeGens.size === 0"
      class="cell rad-bl-tr large-btn"
      @click="startQuiz(activeGens)"
    >
      <div class="type-name">{{ t('startQuiz') }}</div>
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

.gens-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 6px;
  margin: 3px;
  text-align: center;

  .mobile & {
    grid-template-columns: repeat(3, minmax(80px, 1fr));
  }
}

.cell {
  background: var(--gen-color, var(--type-btn-color, var(--primary)));
  color: var(--type-fg-color, var(--text));
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
    top: 4px; /* Matches the shadow height above */
    box-shadow: 0 0 0 rgba(0, 0, 0, 0); /* Shadow disappears as it hits the floor */
    filter: brightness(0.5);

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

.cell-full {
  padding: 16px 0 8px;
}

.cell-type {
  padding: 10px 20px;
}

.gen-name {
  display: inline-block;
}

.button-back {
  margin: 0;
  background-color: #111;
  border-color: var(--border);
  color: #fff;
}
</style>
