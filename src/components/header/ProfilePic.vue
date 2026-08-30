<script setup lang="ts">
import { useAuth } from '@vueuse/firebase';
import { computed } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useUsername } from '@/composables/useUsername.ts';

const { username } = useUsername();
const { auth } = useFirebase();
const { user } = useAuth(auth);

const props = defineProps<{
  size?: number;
}>();

const emits = defineEmits(['clickPicture']);

const toggleMenu = () => {
  emits('clickPicture');
};

const initials = computed(() => {
  const parts = (username.value || '').trim().split(' ').slice(0, 2);
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase();
});

const styles = computed(() => {
  return {
    '--avatar-url': user.value?.photoURL ? `url('${user.value.photoURL}')` : '',
    '--height': props.size ? `${props.size}px` : '32px',
    '--width': props.size ? `${props.size}px` : '32px',
  };
});
</script>

<template>
  <div
    class="avatar"
    v-tooltip:bottom="username ?? null"
    :style="styles"
    :data-name="user?.photoURL ? '' : initials"
    @click="toggleMenu"
  />
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
  width: var(--width);
  height: var(--height);
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--text);
  background-color: var(--darkPrimary, var(--border));
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;
  anchor-name: --avatar;

  &::after {
    content: attr(data-name);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }
}
</style>
