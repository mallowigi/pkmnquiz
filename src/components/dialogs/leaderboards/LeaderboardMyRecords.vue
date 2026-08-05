<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { useI18n } from 'vue-i18n';

import Leaderboards from '@/components/start/leaderboards/Leaderboards.vue';
import { useFirebase } from '@/composables/useFirebase.ts';

const { auth } = useFirebase();
const { user } = useAuth(auth);
const { t } = useI18n();
</script>

<template>
  <section
    v-if="user"
    class="my-records"
  >
    <h3 class="section-title">{{ t('leaderboardsDialog.myRecords') }}</h3>

    <Leaderboards
      :uid="user.uid"
      :limit="3"
    />
  </section>
</template>

<style scoped>
.my-records {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 14px;
  color: white;
  margin: 0 0 4px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
}
</style>
