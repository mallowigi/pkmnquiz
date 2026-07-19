<script setup lang="ts">
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { useAuth } from '@vueuse/firebase';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProfilePic from '@/components/header/ProfilePic.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useDialogs } from '@/stores/useDialogs.ts';

const { auth, signout } = useFirebase();
const { isAuthenticated } = useAuth(auth);
const { setDialog } = useDialogs();
const { t } = useI18n();

const isMenuOpen = ref(false);
const avatarContainer = ref<HTMLElement | null>(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const openProfile = () => {
  setDialog('userProfile');
  isMenuOpen.value = false;
};

const openLogin = () => {
  setDialog('login');
  isMenuOpen.value = false;
};

const handleLogout = async () => {
  await signout();
  isMenuOpen.value = false;
};

onClickOutside(avatarContainer, () => {
  isMenuOpen.value = false;
});

onKeyStroke('Escape', () => {
  isMenuOpen.value = false;
});
</script>

<template>
  <div
    class="avatar-container"
    ref="avatarContainer"
  >
    <ProfilePic
      class="avatar"
      @click-picture="toggleMenu"
    />

    <div v-if="isAuthenticated">
      <div
        v-if="isMenuOpen"
        class="avatar-menu"
      >
        <div
          class="menu-item"
          @click="openProfile"
        >
          {{ t('userProfile') }}
        </div>
        <div
          class="menu-item"
          @click="handleLogout"
        >
          {{ t('signout') }}
        </div>
      </div>
    </div>

    <div v-else>
      <div
        v-if="isMenuOpen"
        class="avatar-menu"
      >
        <div
          class="menu-item"
          @click="openLogin"
        >
          {{ t('login') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes accordion {
  from {
    transform: scaleY(0);
    opacity: 0;
  }

  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.avatar {
  position: relative;
}

.avatar-menu {
  position: absolute;
  top: calc(anchor(--avatar bottom) + 8px);
  right: calc(anchor(--avatar right) - 80px);

  background: var(--button);
  border: 1px solid var(--type-btn-color, var(--primary));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: var(--text);
  border-radius: 4px;
  line-height: 16px;
  font-size: 16px;
  font-family: 'Roboto Condensed', sans-serif;
  padding: 0;
  z-index: 100;
  animation: accordion 0.2s ease-out;
  cursor: pointer;
}

.menu-item {
  line-height: 48px;
  min-width: 160px;
  border: none;
  box-shadow: none;
  outline: none;
  color: var(--text);
  padding: 0 12px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--type-dark-color, var(--darkPrimary));
    color: var(--text-inverted);
  }
}
</style>
