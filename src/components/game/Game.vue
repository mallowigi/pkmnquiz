<script setup lang="ts">
import Spacer from '@/components/common/Spacer.vue';
import FadeTransition from '@/components/common/transitions/FadeTransition.vue';
import MissedNames from '@/components/game/MissedNames.vue';
import RegionBoxes from '@/components/game/RegionBoxes.vue';
import GameOptions from '@/components/game/settings/GameOptions.vue';
import SpellingChecker from '@/components/game/SpellingChecker.vue';
import { useGameFlow } from '@/stores/useGameFlow';
import { useSettings } from '@/stores/useSettings.ts';
import { useState } from '@/stores/useState';

const { state } = useState();
const { settingsState } = useSettings();
const { flowState } = useGameFlow();
</script>

<template>
  <div class="game">
    <FadeTransition>
      <MissedNames v-if="flowState.isGivenUp" />
    </FadeTransition>

    <FadeTransition>
      <SpellingChecker v-if="settingsState.withSpelling" />
    </FadeTransition>

    <RegionBoxes />
    <Spacer />
    <GameOptions v-if="state.gameMode !== null && !flowState.isEnded" />
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1;
  margin-bottom: 1rem;
}
</style>
