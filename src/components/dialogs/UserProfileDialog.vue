<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import ProfileDetailedStats from '@/components/dialogs/ProfileDetailedStats.vue';
import ProfileStats from '@/components/dialogs/ProfileStats.vue';
import ProfilePic from '@/components/header/ProfilePic.vue';
import Leaderboards from '@/components/start/Leaderboards.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useSettings } from '@/stores/useSettings.ts';

const { closeDialog } = useDialogs();
const { auth } = useFirebase();
const { user } = useAuth(auth);
const { settingsState } = useSettings();

const { t } = useI18n();

const cancel = () => {
  closeDialog();
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="cancel"
  >
    <div class="prompt profile-dialog">
      <h2>{{ t('userProfile') }}</h2>

      <div class="profile-content">
        <ProfilePic
          class="profile-avatar"
          :size="100"
        />

        <h3 class="profile-name">{{ settingsState.name }}</h3>

        <ProfileStats />

        <ProfileDetailedStats />
      </div>

      <RoundedButton
        @click.stop="cancel"
        primary
      >
        {{ t('close') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped>
.profile-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 700px;
  width: 90%;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--type-btn-color, var(--primary));
  background-color: var(--darkPrimary, var(--border));
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 12px;

  &::after {
    content: attr(data-name);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 32px;
    font-weight: bold;
  }
}

.profile-name {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: var(--text);
}

.profile-records {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-records h4 {
  margin: 0 0 12px 0;
  color: var(--text);
  font-size: 18px;
}

.large-text {
  padding: 6px;
  margin: 1em;
}

.row {
  justify-content: center;
  gap: 8px;
}
</style>
