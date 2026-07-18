<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import BlueskyIcon from '@/components/common/icons/BlueskyIcon.vue';
import FacebookIcon from '@/components/common/icons/FacebookIcon.vue';
import XIcon from '@/components/common/icons/XIcon.vue';
import { useSocialShare } from '@/composables/useSocialShare.ts';

const { t } = useI18n();
const { shareNative, shareX, shareFacebook, shareBluesky, isSupported } = useSocialShare();

const props = defineProps<{
  elapsed: string;
  numFound: number;
}>();
</script>

<template>
  <div class="share-container">
    <div
      v-if="isSupported"
      class="section rad-bl-tr share"
      @click="shareNative({ elapsed, numFound })"
    >
      {{ t('share') }}
    </div>

    <div class="social-share">
      <div
        class="social-icon rad-bl-tr"
        @click="shareX({ elapsed, numFound })"
        :title="t('x')"
      >
        <XIcon />
      </div>

      <div
        class="social-icon rad-bl-tr"
        @click="shareFacebook({ elapsed, numFound })"
        :title="t('facebook')"
      >
        <FacebookIcon />
      </div>

      <div
        class="social-icon rad-bl-tr"
        @click="shareBluesky({ elapsed, numFound })"
        :title="t('bluesky')"
      >
        <BlueskyIcon />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section {
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 16px 20px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}

h1,
h2 {
  margin: 0;
  line-height: 32px;
}

li {
  list-style-type: none;
}

.share-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share {
  background: var(--button);
  color: var(--text);
}

.social-share {
  display: flex;
  gap: 10px;
  justify-content: space-around;
}

.social-icon {
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 10px;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text);

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}
</style>
