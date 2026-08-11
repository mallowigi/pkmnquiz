<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { pkmnDetailsState } = usePkmnDetails();
</script>

<template>
  <div
    class="pane-header"
    v-if="pkmnDetailsState.currentPokemon"
  >
    <div class="artwork-container">
      <img
        :src="pkmnDetailsState.currentPokemon.artwork"
        :alt="pkmnDetailsState.currentPokemon.baseName"
        class="artwork"
      />
    </div>
  </div>
</template>

<style scoped>
.pane-header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

.artwork-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artwork {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2));
}

h3 {
  border-bottom: 1px solid var(--primary);
  padding-bottom: 0.3rem;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}
</style>
