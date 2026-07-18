<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import RoundedButton from '@/components/common/RoundedButton.vue';
import ProfilePic from '@/components/header/ProfilePic.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useUsername } from '@/composables/useUsername.ts';

const { t } = useI18n();
const { signout } = useFirebase();
const { username } = useUsername();
</script>

<template>
  <div class="root">
    <h1 class="caption">{{ t('welcomeBack', { name: username }) }}</h1>

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
