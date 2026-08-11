<script setup lang="ts">
import { usePokemonTypesStyles } from '@/composables/usePokemonTypesStyles.ts';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';

const { pkmnDetailsState } = usePkmnDetails();

const styles = usePokemonTypesStyles(pkmnDetailsState.currentPokemon);
</script>

<template>
  <div
    class="pane-header"
    v-if="pkmnDetailsState.currentPokemon"
  >
    <div
      class="artwork-gradient rad-br-tl"
      :style="styles"
    >
      <div class="artwork-container">
        <img
          :src="pkmnDetailsState.currentPokemon.artwork"
          :alt="pkmnDetailsState.currentPokemon.baseName"
          class="artwork"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pane-header {
  padding: 4rem 1.5rem 1rem;
  text-align: center;
}

.artwork-gradient {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--primary-type) 40%, var(--button)) 0%,
    color-mix(in srgb, var(--secondary-type) 40%, var(--button)) 100%
  );
  border: 3px solid var(--type-btn-color, var(--primary));
  padding: 1.5rem;
  display: inline-block;
  margin: 0 auto 1rem;
}

.artwork-container {
  width: 200px;
  height: 200px;
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
