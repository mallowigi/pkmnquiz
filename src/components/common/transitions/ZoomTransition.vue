<script setup lang="ts"></script>

<template>
  <Transition appear>
    <slot></slot>
  </Transition>
</template>

<style scoped>
.v-enter-active {
  transition: all 1.5s ease;
}

.v-enter-from {
  transform: scaleX(2) scaleY(2) translateY(-10px);
}

.v-enter-to {
  transform: scaleX(1) scaleY(1) translateY(0);
}
</style>
