<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import CryIcon from '@/components/common/icons/CryIcon.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useMessages } from '@/stores/useMessages.ts';
import { useSettings } from '@/stores/useSettings.ts';

const { settingsState, toggleCriesHelper } = useSettings();
const { showUserMessage } = useMessages();
const { t } = useI18n();

const toggle = () => {
  toggleCriesHelper();
  showUserMessage(t('criesHotkeySet', { status: settingsState.withCriesHelper ? t('enabled') : t('disabled') }));
};

const tooltipMessage = `${t('criesHotkeyTooltip', { key: '.' })}`;
</script>

<template>
  <RoundedButton
    class="hotkey-toggle rad-br-tl"
    v-tooltip="tooltipMessage"
    v-game-ended
    :selected="settingsState.withCriesHelper"
    @click="toggle"
  >
    <CryIcon />
  </RoundedButton>
</template>

<style scoped>
.hotkey-toggle {
  padding: 9px 14px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  & img {
    margin: -5px;
    width: 52px;
    height: 39px;
    object-fit: none;
    object-position: 50% 100%;
    filter: brightness(0) invert(0.7);
  }

  &.selected {
    & img {
      filter: brightness(0) invert(1);
    }
  }

  &:hover {
    & img {
      filter: brightness(0) invert(0.8);
    }
  }
}
</style>
