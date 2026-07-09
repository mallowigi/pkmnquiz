<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';

import SettingsIcon from '@/components/common/icons/SettingsIcon.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import AutoPauseToggle from '@/components/game/settings/AutoPauseToggle.vue';
import AutoSaveToggle from '@/components/game/settings/AutoSaveToggle.vue';
import CriesHotkeyToggle from '@/components/game/settings/CriesHotkeyToggle.vue';
import CycleSpritesToggle from '@/components/game/settings/CycleSpritesToggle.vue';
import GameAbort from '@/components/game/settings/GameAbort.vue';
import GameModeSelection from '@/components/game/settings/GameModeSelection.vue';
import LanguagesSelection from '@/components/game/settings/LanguagesSelection.vue';
import ModeSelection from '@/components/game/settings/ModeSelection.vue';
import MultiplayerInvite from '@/components/game/settings/MultiplayerInvite.vue';
import ShadowHotkeyToggle from '@/components/game/settings/ShadowHotkeyToggle.vue';
import ShinyToggle from '@/components/game/settings/ShinyToggle.vue';
import SoundToggle from '@/components/game/settings/SoundToggle.vue';
import SpellingToggle from '@/components/game/settings/SpellingToggle.vue';
import TimerSelection from '@/components/game/settings/TimerSelection.vue';
import TypeShuffle from '@/components/game/settings/TypeShuffle.vue';
import { useGameFlow } from '@/stores/useGameFlow.ts';

const { flowState, toggleSettings } = useGameFlow();
const openSettings = () => {
  toggleSettings();
};
</script>

<template>
  <div class="selection-row">
    <GameAbort />

    <!-- Settings -->
    <RoundedButton
      class="settings rad-br-tl"
      @click="openSettings"
    >
      <SettingsIcon />
    </RoundedButton>
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
      <div class="selection-row">
        <GameModeSelection />

        <TimerSelection />

        <ModeSelection />

        <TypeShuffle />
      </div>

      <div class="selection-row">
        <ShinyToggle />

        <SpellingToggle />

        <ShadowHotkeyToggle />

        <CriesHotkeyToggle />

        <CycleSpritesToggle />

        <SoundToggle />

        <AutoPauseToggle />

        <AutoSaveToggle />
      </div>

      <div class="selection-row">
        <LanguagesSelection />

        <MultiplayerInvite />
      </div>
    </motion.div>
  </AnimatePresence>
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

  * {
    color: var(--text);
    stroke: var(--text);
  }
}
</style>
