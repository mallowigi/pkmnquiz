<script setup lang="ts">
defineProps<{
  stats: {
    label: string;
    value: number;
    color?: string;
    text?: string;
  }[];
}>();
</script>

<template>
  <div class="stat-grid">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="grid-item"
      :style="{
        '--accent-color': stat.color || 'var(--primary)',
        '--text-color': stat.text || 'white',
      }"
    >
      <div class="stat-info">
        <span class="stat-value">{{ stat.value }}</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--accent-color);
  border-color: var(--accent-color);
  border: 2px solid var(--accent-color);
  color: var(--text-color);
  border-radius: 6px;
  opacity: 0.8;
  min-height: 80px;
  justify-content: center;

  &:hover {
    opacity: 1;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.2s;
}
</style>
