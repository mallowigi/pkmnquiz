import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import type { AlertDialogOptions } from '@/types.ts';

interface AlertState {
  options: AlertDialogOptions | null;
  callback: (() => void) | null;
  shown: boolean;
}

export const useAlerts = defineStore('alerts', () => {
  const alertState = reactive<AlertState>({
    callback: null,
    options: null,
    shown: false,
  });

  const showAlert = (options: AlertDialogOptions) => {
    alertState.shown = true;
    alertState.options = options;
    alertState.callback = options.onConfirm || null;
  };

  const closeAlert = () => {
    alertState.shown = false;
  };

  return {
    alertState,
    closeAlert,
    showAlert,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAlerts, import.meta.hot));
}
