import type { PiniaPluginContext } from 'pinia';

import { useSavedData } from '@/composables/useSavedData.ts';

export function piniaStorePlugin({ store }: PiniaPluginContext) {
  const { autoSave } = useSavedData();
  let saveTimeout: ReturnType<typeof setTimeout>;

  const excludedStores = [
    'dialogs',
    'alerts',
    'messages',
    'roomMessages',
    'pkmnData',
    'firebase',
    'tooltips',
    'credits',
    'profile',
    'help',
    'pkmnDetails',
  ];
  if (excludedStores.includes(store.$id)) {
    return;
  }

  store.$subscribe(
    () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        void autoSave(store.$id !== 'timer').catch(() => {
          // autoSave reports persistence failures to the user.
        });
      }, 500);
    },
    { detached: true },
  );
}
