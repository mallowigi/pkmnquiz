<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import IconButton from '@/components/common/IconButton.vue';
import CloudDownIcon from '@/components/common/icons/CloudDownIcon.vue';
import CloudUpIcon from '@/components/common/icons/CloudUpIcon.vue';
import LoadIcon from '@/components/common/icons/LoadIcon.vue';
import SaveIcon from '@/components/common/icons/SaveIcon.vue';
import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { useRooms } from '@/stores/useRooms.ts';

const { t } = useI18n();

const { saveState, loadState, loadFromFirebase, hasFirebaseData, saveToFirebase } = useSavedData();
const { auth } = useFirebase();
const { showUserMessage } = useMessages();
const { roomState } = useRooms();

const { state, isReady } = useAsyncState(() => {
  return hasFirebaseData();
}, false);

const saveToCloud = async () => {
  if (!isReady.value || !state.value) return;
  await saveToFirebase();
  showUserMessage(t('saveToCloudSuccess'));
};
</script>

<template>
  <div
    v-if="!roomState.isActive"
    class="root"
  >
    <input
      type="file"
      id="file-input"
      @change="loadState"
      hidden
      accept="application/json"
    />

    <h3 class="caption">{{ t('saveLoadState') }}</h3>

    <div class="buttons">
      <IconButton
        @click="saveState"
        v-tooltip="t('saveToDiskTooltip')"
      >
        <SaveIcon class="accent-icon" />
      </IconButton>

      <IconButton v-tooltip="t('loadFromDiskTooltip')">
        <label for="file-input">
          <LoadIcon class="accent-icon" />
        </label>
      </IconButton>

      <div
        class="separator"
        v-if="auth.currentUser"
      />

      <IconButton
        @click="loadFromFirebase()"
        v-tooltip="t('loadFromCloudTooltip')"
        v-if="auth.currentUser"
        :class="{ disabled: !isReady || !state }"
      >
        <CloudDownIcon class="accent-icon" />
      </IconButton>

      <IconButton
        @click="saveToCloud()"
        v-tooltip="t('saveFromCloudTooltip')"
        v-if="auth.currentUser"
        :class="{ disabled: !isReady || !state }"
      >
        <CloudUpIcon class="accent-icon" />
      </IconButton>
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.caption {
  margin: 4px;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.separator {
  display: inline-block;
  width: 1px;
  margin: 0 0 -10px 10px;
  border: 1px dashed var(--secondary);
  align-self: stretch;
}
</style>
