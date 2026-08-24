<script setup lang="ts">
import Overlay from '@/components/common/Overlay.vue';
import FadeTransition from '@/components/common/transitions/FadeTransition.vue';
import ChallengeModeChooser from '@/components/start/challenge/ChallengeModeChooser.vue';
import ChallengeSetup from '@/components/start/challenge/ChallengeSetup.vue';
import GenChooser from '@/components/start/genSelection/GenChooser.vue';
import Logo from '@/components/start/genSelection/Logo.vue';
import SpecialChooser from '@/components/start/genSelection/SpecialChooser.vue';
import TypeChooser from '@/components/start/genSelection/TypeChooser.vue';
import Loading from '@/components/start/Loading.vue';
import MultiplayerSetup from '@/components/start/multiplayer/MultiplayerSetup.vue';
import StartScreen from '@/components/start/StartScreen.vue';
import { useGameFlow } from '@/stores/useGameFlow.js';
import { usePkmnData } from '@/stores/usePkmnStore.js';

const { flowState, setGameSelectionState } = useGameFlow();
const { data } = usePkmnData();

const close = () => {
  if (!flowState.isStarted) {
    return;
  }
  setGameSelectionState(null);
};
</script>

<template>
  <Overlay @close="close">
    <FadeTransition>
      <div class="prompt">
        <Logo />

        <FadeTransition mode="out-in">
          <Loading v-if="!data.isLoaded" />

          <StartScreen v-else-if="data.isLoaded && flowState.gameSelectionState === 'new'" />

          <div v-else>
            <FadeTransition mode="out-in">
              <ChallengeModeChooser v-if="flowState.gameSelectionState === 'challenge'" />

              <ChallengeSetup v-if="flowState.gameSelectionState === 'challengeSetup'" />

              <GenChooser v-if="flowState.gameSelectionState === 'gen'" />

              <TypeChooser v-if="flowState.gameSelectionState === 'types'" />

              <SpecialChooser v-if="flowState.gameSelectionState === 'special'" />

              <MultiplayerSetup v-if="flowState.gameSelectionState === 'createRoom'" />
            </FadeTransition>
          </div>
        </FadeTransition>
      </div>
    </FadeTransition>
  </Overlay>
</template>

<style scoped>
.prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
