import { useAuth } from '@vueuse/firebase';
import { computed } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSettings } from '@/stores/useSettings.ts';

/**
 * Composable to get the user's display name.
 * It prioritizes the Firebase user's display name, and falls back to the name in the settings.
 */
export const useUsername = () => {
  const { auth } = useFirebase();
  const { user } = useAuth(auth);
  const { settingsState } = useSettings();

  const username = computed(() => user.value?.displayName ?? settingsState.name);

  return {
    username,
  };
};
