<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import RoundedBox from '@/components/common/RoundedBox.vue';
import { usePokemonTypesStyles } from '@/composables/usePokemonTypesStyles.ts';
import { pokemonTypes } from '@/data/pokemonTypes.ts';
import { usePkmnDetails } from '@/stores/usePkmnDetails.ts';
import type { Type } from '@/types.ts';

const { t } = useI18n();
const { pkmnDetailsState } = usePkmnDetails();
let currentPokemon = pkmnDetailsState.currentPokemon;

const styles = usePokemonTypesStyles(currentPokemon);
</script>

<template>
  <RoundedBox
    class="basic-info"
    v-if="pkmnDetailsState.currentPokemon"
    :style="styles"
  >
    <!-- Dex number -->
    <span class="dex-num">#{{ String(pkmnDetailsState.currentPokemon.dexNum).padStart(3, '0') }}</span>

    <!-- Name -->
    <h2 class="name">
      <a
        :href="`https://bulbapedia.bulbagarden.net/wiki/${pkmnDetailsState.currentPokemon.baseName}_(Pokémon)`"
        target="_blank"
        rel="noopener noreferrer"
        >{{ pkmnDetailsState.currentPokemon.baseName }}</a
      >
    </h2>

    <!-- Species -->
    <p class="species">{{ pkmnDetailsState.currentPokemon.species }}</p>

    <!-- Types -->
    <div class="types">
      <!-- Primary -->
      <span class="type-badge primary">{{ t(pkmnDetailsState.currentPokemon.primaryType) }}</span>

      <!-- Secondary -->
      <span
        v-if="pkmnDetailsState.currentPokemon.secondaryType"
        class="type-badge secondary"
      >
        {{ t(pkmnDetailsState.currentPokemon.secondaryType) }}
      </span>
    </div>

    <!--  Description -->
    <p class="description">{{ pkmnDetailsState.currentPokemon.description }}</p>
  </RoundedBox>
</template>

<style scoped>
.basic-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5em;
  margin: 0 1em;
  max-height: initial;
}

.dex-num {
  font-family: monospace;
  font-size: 1.2rem;
  opacity: 0.7;
}

.name {
  font-family: 'DynaPuff', system-ui;
  margin: 0.5rem 0;
  text-transform: capitalize;
  font-weight: 500;
  font-size: 1.8rem;
}

.species {
  font-style: italic;
  opacity: 0.8;
}

.types {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.type-badge {
  padding: 0.2rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: bold;

  &.primary {
    background-color: var(--primary-type);

    .dark & {
      background-color: var(--primary-type-dark);
    }
  }

  &.secondary {
    background-color: var(--secondary-type);

    .dark & {
      background-color: var(--secondary-type-dark);
    }
  }
}

.description {
  max-width: 400px;
  opacity: 0.9;
  line-height: 1.5;
  min-height: 4.5em;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
