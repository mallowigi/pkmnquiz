<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedBox from '@/components/common/RoundedBox.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import ColorChanger from '@/components/header/ColorChanger.vue';
import LocaleChanger from '@/components/header/LocaleChanger.vue';
import { useDialogs } from '@/stores/useDialogs.ts';

const { closeDialog } = useDialogs();
const { t } = useI18n();

const close = () => {
  closeDialog();
};
</script>

<template>
  <Overlay
    class="overlay"
    @close="close"
  >
    <div class="prompt settings-dialog">
      <h2>{{ t('visualSettings') }}</h2>

      <div class="settings-content">
        <RoundedBox class="setting-item">
          <label>{{ t('language') }}</label>
          <LocaleChanger />
        </RoundedBox>

        <RoundedBox class="setting-item">
          <label>{{ t('themeColor') }}</label>
          <ColorChanger />
        </RoundedBox>
      </div>

      <RoundedButton
        @click.stop="close"
        primary
      >
        {{ t('close') }}
      </RoundedButton>
    </div>
  </Overlay>
</template>

<style scoped>
.settings-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 400px;
  width: 90%;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin: 0;
  width: 100%;
  max-height: none;
  align-self: stretch;

  label {
    font-weight: bold;
    color: var(--text);
  }
}

:deep(.color-changer) {
  .color-select {
    width: 32px;
    height: 32px;
  }
}

:deep(.locale-changer) {
  .select {
    font-size: 20px;
  }
}
</style>
