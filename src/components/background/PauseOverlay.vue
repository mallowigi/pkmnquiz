<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import SaveButtons from '@/components/background/SaveButtons.vue';
import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useGameFlow } from '@/stores/useGameFlow';

const { resumeGame } = useGameFlow();
const { t } = useI18n();

const resume = () => resumeGame();
</script>

<template>
  <Overlay
    class="full-overlay"
    :prevent-closing="true"
    @close="resume"
  >
    <div class="prompt">
      <h2 class="left-margin">{{ t('paused') }}</h2>

      <RoundedButton
        :primary="true"
        @click.stop="resume"
      >
        {{ t('resume') }}
      </RoundedButton>

      <SaveButtons />
    </div>
  </Overlay>
</template>

<style scoped>
.full-overlay {
  z-index: 10;
  --overlay-bg: var(--full-overlay);
}

.left-margin {
  margin-left: 10px;
}

.prompt {
  flex-direction: column;
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
