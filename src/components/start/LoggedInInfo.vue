<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import ProfilePic from '@/components/header/ProfilePic.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useSettings } from '@/stores/useSettings.ts';

const { t } = useI18n();
const { settingsState } = useSettings();
const { signout, auth } = useFirebase();
const { user } = useAuth(auth);
</script>

<template>
  <div class="root">
    <h1 class="caption">{{ t('welcomeBack', { name: user?.displayName ?? settingsState.name }) }}</h1>

    <ProfilePic
      class="profile-avatar"
      :size="64"
    />

    <RoundedButton
      primary
      class="danger-btn"
      :aria-label="t('signout')"
      @click="signout"
    >
      {{ t('signout') }}
    </RoundedButton>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.caption {
  margin: 0;
}

.profile-avatar {
  border-radius: 50%;
}
</style>
