<script setup lang="ts">
defineProps<{
  mode?: 'in-out' | 'out-in';
}>();
</script>

<template>
  <Transition
    appear
    :mode="mode"
  >
    <slot></slot>
  </Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
