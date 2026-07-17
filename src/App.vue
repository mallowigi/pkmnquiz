<script setup lang="ts">
import { usePreferredDark, useBreakpoints } from '@vueuse/core';
import { watchEffect, watch } from 'vue';

import Background from '@/components/background/Background.vue';
import Credits from '@/components/background/Credits.vue';
import EndOverlay from '@/components/background/EndOverlay.vue';
import PauseOverlay from '@/components/background/PauseOverlay.vue';
import RoomMessageOverlay from '@/components/background/RoomMessageOverlay.vue';
import SavingIndicator from '@/components/background/SavingIndicator.vue';
import SnackBar from '@/components/background/SnackBar.vue';
import Tooltip from '@/components/background/Tooltip.vue';
import FadeTransition from '@/components/common/transitions/FadeTransition.vue';
import Dialogs from '@/components/dialogs/Dialogs.vue';
import GameFooter from '@/components/footer/GameFooter.vue';
import Game from '@/components/game/Game.vue';
import GameHeader from '@/components/header/GameHeader.vue';
import GameSelection from '@/components/start/genSelection/GameSelection.vue';
import { TYPE_STYLE_KEYS, useTypeStyles } from '@/composables/useTypeStyles';
import OfflineBanner from '@/OfflineBanner.vue';
import ReloadPrompt from '@/ReloadPrompt.vue';
import ScrollTop from '@/ScrollTop.vue';
import { useCredits } from '@/stores/useCredits';
import { useGameFlow } from '@/stores/useGameFlow';
import { useRoomMessages } from '@/stores/useRoomMessages';
import { useState } from '@/stores/useState';

const { state, setDarkMode } = useState();
const { flowState } = useGameFlow();
const { credits } = useCredits();
const { roomState } = useRoomMessages();
const typeStyles = useTypeStyles();

const breakpoints = useBreakpoints(
  {
    desktop: 1320,
    laptop: 1024,
    mobile: 640,
    tablet: 768,
  },
  {
    strategy: 'max-width',
  },
);

watchEffect(() => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const styles = typeStyles.value;

  TYPE_STYLE_KEYS.forEach((key) => {
    const value = styles[key];

    if (value) {
      root.style.setProperty(key, value);
      return;
    }

    root.style.removeProperty(key);
  });
});

const isDark = usePreferredDark();

watch(
  isDark,
  () => {
    setDarkMode(isDark.value);
  },
  { immediate: true },
);
</script>

<template>
  <main
    class="main"
    :class="{
      dark: state.isDark,
      mobile: breakpoints.mobile.value,
      laptop: breakpoints.laptop.value,
      desktop: breakpoints.desktop.value,
      missingno: flowState.missingno,
    }"
    :style="typeStyles"
  >
    <OfflineBanner />
    <ReloadPrompt />

    <!-- Background images -->
    <Background />

    <!-- Header -->
    <GameHeader />

    <!-- Game Contents -->
    <Game />

    <!-- Footer -->
    <GameFooter />

    <!-- Credits-->
    <FadeTransition>
      <Credits v-if="credits.showCredits" />
    </FadeTransition>

    <!-- Room messages -->
    <RoomMessageOverlay v-if="roomState.roomMessage !== null" />

    <!-- Pause -->
    <FadeTransition>
      <PauseOverlay v-if="flowState.isPaused" />
    </FadeTransition>

    <!-- Game Selection -->
    <FadeTransition>
      <GameSelection v-if="flowState.gameSelectionState" />
    </FadeTransition>

    <!-- Dialogs container -->
    <Dialogs />

    <!-- Ended Game -->
    <EndOverlay v-if="flowState.isEnded" />

    <!-- Notifications -->
    <SnackBar />

    <!-- Saving Indicator -->
    <SavingIndicator />

    <!-- Tooltips -->
    <Tooltip />

    <!-- Scroll Top -->
    <ScrollTop />
  </main>
</template>

<style scoped>
.main {
  min-height: 100dvh;
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
