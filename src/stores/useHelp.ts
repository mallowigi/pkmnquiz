import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

interface HelpState {
  showHelp: boolean;
}

export const useHelp = defineStore('help', () => {
  const helpState = reactive<HelpState>({
    showHelp: false,
  });

  const showHelp = () => {
    helpState.showHelp = true;
  };

  const hideHelp = () => {
    helpState.showHelp = false;
  };

  return {
    helpState,
    hideHelp,
    showHelp,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHelp, import.meta.hot));
}
