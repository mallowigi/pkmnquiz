<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import ProfileDetailedStats from '@/components/dialogs/userProfile/ProfileDetailedStats.vue';
import ProfileStats from '@/components/dialogs/userProfile/ProfileStats.vue';
import ProfilePic from '@/components/header/ProfilePic.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useUsername } from '@/composables/useUsername.ts';
import { useDialogs } from '@/stores/useDialogs.ts';

const { auth, signout } = useFirebase();
const { closeDialog } = useDialogs();
const { username } = useUsername();

const { t } = useI18n();

const cancel = () => {
  closeDialog();
};

const handleSignout = async () => {
  await signout();
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

        <h3 class="profile-name">{{ username }}</h3>

        <ProfileStats />

        <ProfileDetailedStats />
      </div>

      <div class="row">
        <RoundedButton
          @click.stop="handleSignout"
          class="danger-btn"
        >
          {{ t('signout') }}
        </RoundedButton>

        <RoundedButton
          @click.stop="cancel"
          primary
        >
          {{ t('close') }}
        </RoundedButton>
      </div>
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

  .mobile & {
    gap: 12px;
  }
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

  .mobile & {
    width: 80px;
    height: 80px;
    margin-bottom: 8px;

    &::after {
      font-size: 24px;
    }
  }
}

.profile-name {
  font-size: 24px;
  margin: 0 0 12px 0;
  color: white;

  .mobile & {
    font-size: 20px;
    margin-bottom: 8px;
  }
}

.profile-records {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-records h4 {
  margin: 0 0 12px 0;
  color: white;
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
