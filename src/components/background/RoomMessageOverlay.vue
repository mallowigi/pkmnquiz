<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Overlay from '@/components/common/Overlay.vue';
import RoundedButton from '@/components/common/RoundedButton.vue';
import { useRooms } from '@/stores/useRooms.ts';

const { roomState } = useRooms();
const { t } = useI18n();
</script>

<template>
  <Overlay class="transparent-overlay">
    <div class="room-info">
      <div class="room-info-content">
        <span>{{ roomState.room }}</span>
      </div>
    </div>
  </Overlay>
</template>

<style scoped>
.transparent-overlay {
  background-color: rgba(0, 0, 0, 0);
  z-index: -1;
}

.room-info {
  position: absolute;
  right: anchor(--watermark-url right, 1rem);
  top: anchor(--watermark-url bottom, 7rem);
  background-color: var(--type-btn-color, var(--primary));
  padding: 0.5em;
  color: white;
  border-radius: 10px;
  font-size: 16px;
}
</style>
