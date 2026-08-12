<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import PauseIcon from '@/components/common/icons/PauseIcon.vue';
import SettingsIcon from '@/components/common/icons/SettingsIcon.vue';
import SkipIcon from '@/components/common/icons/SkipIcon.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import RevealZoomTransition from '@/components/common/transitions/RevealZoomTransition.vue';
import ZoomTransition from '@/components/common/transitions/ZoomTransition.vue';
import AutoPauseToggle from '@/components/game/settings/AutoPauseToggle.vue';
import AutoSaveToggle from '@/components/game/settings/AutoSaveToggle.vue';
import BoxShuffle from '@/components/game/settings/BoxShuffle.vue';
import CriesHotkeyToggle from '@/components/game/settings/CriesHotkeyToggle.vue';
import CycleRegionsToggle from '@/components/game/settings/CycleRegionsToggle.vue';
import CycleSpritesToggle from '@/components/game/settings/CycleSpritesToggle.vue';
import CycleTypesToggle from '@/components/game/settings/CycleTypesToggle.vue';
import GameAbort from '@/components/game/settings/GameAbort.vue';
import GameModeSelection from '@/components/game/settings/GameModeSelection.vue';
import LanguagesSelection from '@/components/game/settings/LanguagesSelection.vue';
import ModeSelection from '@/components/game/settings/ModeSelection.vue';
import MultiplayerInvite from '@/components/game/settings/MultiplayerInvite.vue';
import ScrollIntoViewToggle from '@/components/game/settings/ScrollIntoViewToggle.vue';
import ShadowHotkeyToggle from '@/components/game/settings/ShadowHotkeyToggle.vue';
import ShinyToggle from '@/components/game/settings/ShinyToggle.vue';
import SoundToggle from '@/components/game/settings/SoundToggle.vue';
import SpellingToggle from '@/components/game/settings/SpellingToggle.vue';
import TimerSelection from '@/components/game/settings/TimerSelection.vue';
import TypeShuffle from '@/components/game/settings/TypeShuffle.vue';
import { useShuffles } from '@/composables/useShuffles.ts';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useSkips } from '@/stores/useSkips.ts';
import { useState } from '@/stores/useState.ts';

const { t } = useI18n();
const { flowState, toggleSettings, pauseGame } = useGameFlow();
const { isChallengeMode } = storeToRefs(useGameFlow());
const { updateShuffles } = useShuffles();
const { state } = useState();
const { skipsState, useSkip } = useSkips();

const canSkip = computed(() => {
  if (!state.withBoxShuffle && !state.withTypeShuffle && !state.withCriesShuffle) return false;

  const numSkips = skipsState.skips;
  if (Number(numSkips) <= 0) return false;

  return !isChallengeMode.value;
});

const openSettings = () => {
  toggleSettings();
};

const togglePause = () => pauseGame();

const skipPokemon = () => {
  useSkip();
  updateShuffles();
};
</script>

<template>
  <div class="game-options">
    <div class="selection-row">
      <GameAbort />

      <div>
        <!-- Settings -->
        <RoundedButton
          class="settings rad-br-tl"
          v-tooltip:top="t('toggleSettings')"
          @click="openSettings"
        >
          <SettingsIcon />
        </RoundedButton>

        <!-- Pause -->
        <RoundedButton
          class="settings rad-br-tl"
          v-tooltip:top="t('pause')"
          @click="togglePause"
        >
          <PauseIcon />
        </RoundedButton>

        <!-- Skip -->
        <RevealZoomTransition>
          <RoundedButton
            class="settings rad-br-tl"
            @click="skipPokemon"
            v-tooltip:top="t('skip', { count: skipsState.skips })"
            v-if="canSkip"
          >
            <SkipIcon />
            <span class="skip-count">{{ skipsState.skips }}</span>
          </RoundedButton>
        </RevealZoomTransition>
      </div>
    </div>

    <AnimatePresence>
      <motion.div
        v-if="flowState.isSettingsOpen"
        class="options-container"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="{ duration: 0.3, ease: 'easeInOut' }"
      >
        <div
          class="selection-row"
          v-if="!isChallengeMode"
        >
          <GameModeSelection />

          <TimerSelection />

          <ModeSelection />

          <TypeShuffle />

          <BoxShuffle />
        </div>

        <div
          class="selection-row"
          v-if="!isChallengeMode"
        >
          <ShinyToggle />

          <SpellingToggle />

          <ShadowHotkeyToggle />

          <CriesHotkeyToggle />

          <AutoPauseToggle />

          <AutoSaveToggle />
        </div>

        <div class="selection-row">
          <CycleSpritesToggle />

          <CycleTypesToggle />

          <CycleRegionsToggle />

          <ScrollIntoViewToggle />

          <SoundToggle />
        </div>

        <div
          class="selection-row"
          v-if="!isChallengeMode"
        >
          <LanguagesSelection />

          <MultiplayerInvite />
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.options-container {
  overflow: hidden;
}

.selection-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .mobile & {
    justify-content: center;
    align-self: center;
  }
}

.settings {
  min-width: 0;
  position: relative;

  * {
    color: var(--text);
    stroke: var(--text);
  }
}

.skip-count {
  position: absolute;
  top: -8px;
  right: -2px;
  color: var(--text);
  font-size: 10px;
  font-weight: bold;
  padding: 2px 4px;
}
</style>
