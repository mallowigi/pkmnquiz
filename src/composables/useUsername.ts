import { useAuth } from '@vueuse/firebase';
import { computed } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSettings } from '@/stores/useSettings.ts';

export const useUsername = () => {
  const { auth } = useFirebase();
  const { user } = useAuth(auth);
  const { settingsState } = useSettings();

  const username = computed(() => user.value?.displayName ?? settingsState.name);

  return {
    username,
  };
};
