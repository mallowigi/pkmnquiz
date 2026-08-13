<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ChartIcon from '@/components/common/icons/ChartIcon.vue';
import CreditsIcon from '@/components/common/icons/CreditsIcon.vue';
import HelpIcon from '@/components/common/icons/HelpIcon.vue';
import AvatarMenu from '@/components/header/AvatarMenu.vue';
import ColorChanger from '@/components/header/ColorChanger.vue';
import LocaleChanger from '@/components/header/LocaleChanger.vue';
import { useCredits } from '@/stores/useCredits.ts';
import { useDialogs } from '@/stores/useDialogs.ts';
import { useHelp } from '@/stores/useHelp.ts';

const { setDialog } = useDialogs();
const { toggleShowCredits } = useCredits();
const { showHelp } = useHelp();
const { t } = useI18n();

const showLeaderBoards = () => {
  setDialog('leaderboards');
};

const showCredits = () => {
  toggleShowCredits();
};
</script>

<template>
  <div class="root row">
    <div class="icons row">
      <ChartIcon
        class="hide-laptop"
        @click="showLeaderBoards"
        v-tooltip:bottom="t('showLeaderBoards')"
      />

      <CreditsIcon
        class="hide-laptop"
        @click="showCredits"
        v-tooltip:bottom="t('showCredits')"
      />

      <HelpIcon
        class="hide-laptop"
        @click="showHelp"
        v-tooltip:bottom="t('help')"
      />

      <ColorChanger class="hide-laptop" />

      <LocaleChanger class="hide-laptop" />

      <AvatarMenu class="hide-laptop" />
    </div>

    <div class="watermark-url hide-laptop">pkmnvuequiz.netlify.app</div>
  </div>
</template>

<style scoped>
.root {
  border-top: 3px dotted var(--type-bg-color, var(--primary));
  position: absolute;
  right: 0;
}

.hide-laptop {
  .desktop & {
    display: none;
  }
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.watermark-url {
  font-size: 20px;
  z-index: 10;
  padding: 4px 10px 10px 40px;
  color: var(--text);
  anchor-name: --watermark-url;
}

.icons {
  padding: 4px;
}
</style>
