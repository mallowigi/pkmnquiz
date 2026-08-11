import type { PiniaPluginContext } from 'pinia';

import { useSavedData } from '@/composables/useSavedData.ts';

export function piniaStorePlugin({ store }: PiniaPluginContext) {
  const { autoSave } = useSavedData();
  let saveTimeout: ReturnType<typeof setTimeout>;

  const excludedStores = [
    'dialogs',
    'messages',
    'roomMessages',
    'pkmnData',
    'firebase',
    'tooltips',
    'credits',
    'profile',
    'pkmnDetails',
  ];
  if (excludedStores.includes(store.$id)) {
    return;
  }

  store.$subscribe(
    () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        autoSave(store.$id !== 'timer');
      }, 500);
    },
    { detached: true },
  );
}
