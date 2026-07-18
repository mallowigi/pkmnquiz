<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import SaveButtons from '@/components/background/SaveButtons.vue';
import Spacer from '@/components/common/Spacer.vue';
import Leaderboards from '@/components/start/Leaderboards.vue';
import LoggedInInfo from '@/components/start/LoggedInInfo.vue';
import LoginControls from '@/components/start/LoginControls.vue';
import NewGameButtons from '@/components/start/NewGameButtons.vue';
import { useFirebase } from '@/composables/useFirebase.js';
import { useNameGenerator } from '@/composables/useNameGenerator.ts';
import { useUsername } from '@/composables/useUsername.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { useSettings } from '@/stores/useSettings.js';

const { t } = useI18n();
const { getSavedName } = useSavedData();
const { setName } = useSettings();
const { auth } = useFirebase();
const { isAuthenticated } = useAuth(auth);
const { username } = useUsername();
const { generateName } = useNameGenerator();

onMounted(() => {
  const savedName = getSavedName();
  const randomName = generateName();
  if (!isAuthenticated) {
    setName(savedName || randomName);
  } else {
    setName(username.value || savedName || randomName);
  }
});
</script>

<template>
  <div class="root">
    <h2>{{ t('welcome') }}</h2>

    <div class="top-section">
      <!-- Legged Out -->
      <LoginControls v-if="!isAuthenticated" />

      <!-- Logged In -->
      <LoggedInInfo v-else />
    </div>

    <hr class="separator" />

    <div class="bottom-section">
      <NewGameButtons />

      <!-- Save/Load -->
      <SaveButtons class="save-buttons" />

      <Spacer />
      <!-- Leaderboards -->
      <!--<Leaderboards-->
      <!--  class="leaderboards-table"-->
      <!--  :caption="t('topGuessers', { n: 3 })"-->
      <!--/>-->
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.top-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: center;
  padding: 16px 0;

  .mobile & {
    gap: 16px;
    padding: 8px 0;
  }
}

.separator {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--text);
  opacity: 0.2;
  margin: 16px 0;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}

.mobile {
  .separator,
  .save-buttons,
  .leaderboards-table {
    display: none;
  }
}
</style>
