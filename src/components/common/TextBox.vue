<script setup lang="ts">
import { ref } from 'vue';

const inputRef = ref<HTMLInputElement | null>(null);

defineExpose({ inputRef });
</script>

<template>
  <input
    ref="inputRef"
    type="text"
    class="input-name"
  />
</template>

<style scoped>
.input-name {
  color: var(--input-text);
  background-color: var(--input-bg);
  font-size: 20px;
  border-radius: 4px 10px 4px 4px;
  border: 2px solid #444;
  padding: 2px 2px 2px 4px;

  &:focus {
    outline: none;
    background: white;
  }
}

.large-text {
  padding: 6px;
  width: 260px;
}
</style>
