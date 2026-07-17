---
sessionId: session-260711-111410-lf06
---

# Requirements

### Overview & Goals
The goal is to introduce a "Challenge Mode" that provides a more difficult and focused experience by restricting gameplay options and offering unique rewards like an increased shiny encounter rate.

### Scope
#### In Scope
- A new mode selection screen between "New Game" and quiz selection.
- A challenge setup screen for specific options (Order Mode, Shuffles).
- UI restrictions during gameplay (hiding most settings and toggles).
- Increased shiny encounter rate (2x).
- Visual indicator (banner) for Challenge Mode.
- Manual sync support while auto-sync is disabled.

#### Out of Scope
- New gameplay mechanics other than shiny rate and restricted options.
- Multiplayer-specific challenge modes (standard multiplayer is preserved).

### User Stories
- As a player, I want to be able to choose between a "Free Mode" and a "Challenge Mode" when starting a new game.
- As a player in Challenge Mode, I want to be challenged by restricted help and fixed settings.
- As a player in Challenge Mode, I want to see a banner indicating my current mode.
- As a player, I want a higher chance of finding shiny Pokémon as a reward for playing Challenge Mode.

# Technical Design

### Current Implementation
- `GameFlowState` manages the current step of the game flow (selection, started, ended).
- `GameSelection.vue` handles the UI for selecting generations, types, and special quizzes.
- `GameOptions.vue` and `TimerSelection.vue` contain the various toggles and settings available during gameplay.
- Shiny rates are calculated in `usePokemons.ts` based on the "Shiny Charm" setting.

### Proposed Changes
#### State & Persistence
- Extend `GameSelectionState` type to include `'challenge'` (initial choice) and `'challengeSetup'` (explanation/options).
- Add `challengeMode: ChallengeMode` to `GameFlowState` and `SaveData`.
- Update `useGameFlow` store to handle the transition: `new` -> `challenge` -> (`gen` OR `challengeSetup` -> `gen`).

#### UI Components
- **`ChallengeModeChooser.vue`**: (Already implemented) Shows two large buttons for Free and Challenge modes.
- **`ChallengeSetup.vue`**: A new component explaining the rules and providing Order Mode/Shuffle toggles.
- **`ChallengeBanner.vue`**: A small banner at the top of the screen, potentially using the `useGlitchedEffect` composable for a unique look.

#### ChallengeSetup.vue Implementation
The component will reuse existing settings components to allow configuration:
- `ModeSelection.vue` for Order Mode.
- `TypeShuffle.vue` and `BoxShuffle.vue` for shuffles.
- An explanation box detailing Challenge Mode rules (restricted helpers, 2x shiny rate).

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useGameFlow } from '@/stores/useGameFlow.ts';
import ModeSelection from '@/components/game/settings/ModeSelection.vue';
import TypeShuffle from '@/components/game/settings/TypeShuffle.vue';
import BoxShuffle from '@/components/game/settings/BoxShuffle.vue';

const { t } = useI18n();
const { setGameSelectionState, setChallengeMode } = useGameFlow();

const goNext = () => {
  setChallengeMode('challenge');
  setGameSelectionState('gen');
};

const goBack = () => {
  setGameSelectionState('challenge');
};
</script>

<template>
  <div class="root">
    <h2>{{ t('challengeSetup') }}</h2>

    <div class="explanation">
      <h3 class="rules-title">{{ t('challengeRulesTitle') }}</h3>
      <p class="rules-text">{{ t('challengeRulesExplanation') }}</p>
    </div>

    <div class="options">
      <ModeSelection />
      <TypeShuffle />
      <BoxShuffle />
    </div>

    <div class="actions">
      <RoundedButton @click="goBack">
        {{ t('back') }}
      </RoundedButton>
      <RoundedButton
        primary
        @click="goNext"
      >
        {{ t('next') }}
      </RoundedButton>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  max-width: 500px;
  width: 100%;
}

.explanation {
  text-align: center;
  background: var(--input-bg);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--secondary);
  color: var(--input-text);

  .rules-title {
    margin-top: 0;
    color: var(--darkPrimary);
  }

  .rules-text {
    margin-bottom: 0;
    line-height: 1.4;
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  align-items: center;
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>
```

#### UI Logic & Restrictions
- Update `GameOptions.vue` to wrap restricted toggles in `v-if="flowState.challengeMode === 'free'"`.
- Update `TimerSelection.vue` to conditionally hide configuration elements while keeping the pause suffix.
- Update `useSavedData.ts` to prevent auto-syncing to cloud when in challenge mode.

#### Gameplay Logic
- Update `addFound` in `usePokemons.ts` to apply a 2x multiplier to the `shinyRate` calculation if `flowState.challengeMode === 'challenge'`.

### File Structure
- `src/types.ts`: Update state types.
- `src/stores/useGameFlow.ts`: Manage challenge state.
- `src/stores/usePokemons.ts`: Update shiny rate logic.
- `src/components/start/genSelection/ChallengeModeChooser.vue`: Selection component.
- `src/components/start/genSelection/ChallengeSetup.vue`: New component.
- `src/components/header/ChallengeBanner.vue`: New component.
- `src/components/start/genSelection/GameSelection.vue`: Update routing.
- `src/components/game/settings/GameOptions.vue`: Hide buttons.
- `src/components/game/settings/TimerSelection.vue`: Hide timer setup.
- `src/locales/en.json`: New translations.

# Delivery Steps

###   Step 1: Implement ChallengeSetup.vue and Integrate
Implement the challenge setup screen and integrate it into the selection flow.
- Add new translations to `src/locales/en.json` (`challengeSetup`, `challengeRulesTitle`, `challengeRulesExplanation`, `next`).
- Create `src/components/start/genSelection/ChallengeSetup.vue` providing mode explanation and options (Order Mode, Shuffles).
- Update `src/components/start/genSelection/GameSelection.vue` to render `ChallengeSetup` when `gameSelectionState === 'challengeSetup'`.

###   Step 2: UI Restrictions & Challenge Banner
Apply challenge mode UI restrictions and add the banner.
- Add logic to `GameOptions.vue` to hide specific toggle buttons (Gen switching, Order mode, Shuffles, Helpers, etc.) when `challengeMode === 'challenge'`.
- Update `TimerSelection.vue` to hide everything except the pause button in challenge mode.
- Create and add a `ChallengeBanner` component to `App.vue` or `GameHeader.vue`.

###   Step 3: Gameplay Logic & Final Integration
Implement the gameplay logic changes for challenge mode.
- Modify `usePokemons.ts` to multiply the shiny encounter rate by 2 when `challengeMode === 'challenge'` is active.
- Ensure auto-sync to cloud is disabled in challenge mode by updating `useSavedData.ts`.