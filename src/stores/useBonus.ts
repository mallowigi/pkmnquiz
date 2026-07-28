import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

export const useBonus = defineStore('bonus', () => {
  const state = reactive({
    bonus: 1,
    currentScore: 0,
    spellCheckerTriggered: false,
  });

  let timeouts: ReturnType<typeof setTimeout>[] = [];

  const clearTimeouts = () => {
    timeouts.forEach((t) => clearTimeout(t));
    timeouts = [];
  };

  const startBonusSequence = () => {
    clearTimeouts();
    state.bonus = 5;

    timeouts.push(
      setTimeout(() => {
        state.bonus = 4;
      }, 3000),
    );
    timeouts.push(
      setTimeout(() => {
        state.bonus = 3;
      }, 7000),
    );
    timeouts.push(
      setTimeout(() => {
        state.bonus = 2;
      }, 15000),
    );
    timeouts.push(
      setTimeout(() => {
        state.bonus = 1;
      }, 30000),
    );
  };

  const addScore = (isShadowed: boolean) => {
    if (state.spellCheckerTriggered || isShadowed) {
      state.spellCheckerTriggered = false;
      return;
    }

    state.currentScore += state.bonus;
    state.spellCheckerTriggered = false;
    startBonusSequence();
  };

  const triggerSpellChecker = () => {
    state.spellCheckerTriggered = true;
  };

  const resetBonus = () => {
    state.currentScore = 0;
    state.spellCheckerTriggered = false;
    startBonusSequence();
  };

  return {
    addScore,
    resetBonus,
    state,
    triggerSpellChecker,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBonus, import.meta.hot));
}
