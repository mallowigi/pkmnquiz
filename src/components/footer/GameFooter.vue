<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import GitHubIcon from '@/components/common/icons/GitHubIcon.vue';
import { useCredits } from '@/stores/useCredits.ts';
import { useHelp } from '@/stores/useHelp.ts';
import KofiButton from '@/components/common/KofiButton.vue';

const { toggleShowCredits } = useCredits();
const { showHelp } = useHelp();

const { t } = useI18n();
</script>

<template>
  <footer class="footer rad transition-element">
    <!-- Authors -->
    <div class="footerRow">
      <i18n-t
        keypath="footer.projectBy"
        class="p1"
        tag="p"
      >
        <template #charon>
          <a
            href="https://linktr.ee/adeptcharon"
            target="_blank"
            >Charon</a
          >
        </template>

        <template #mallowigi>
          <a
            href="https://github.com/mallowigi"
            target="_blank"
            >Mallowigi</a
          >
        </template>
      </i18n-t>

      <a
        href="https://github.com/mallowigi/pkmnvuequiz"
        target="_blank"
      >
        <GitHubIcon class="github" />
      </a>
    </div>

    <div class="footerRow">
      <!-- Original Project -->
      <i18n-t
        keypath="footer.originalProject"
        class="p2"
        tag="p"
      >
        <template #location>
          <a
            href="https://pkmnquiz.com/"
            target="_blank"
            >https://pkmnquiz.com/</a
          >
        </template>

        <template #donation>
          <KofiButton
            id="pkmnquiz"
            color="teal"
            text="AdeptCharon on Ko-Fi"
          />

          <KofiButton
            id="mallowigi"
            color="purple"
            text="Mallowigi on Ko-Fi"
          />
        </template>
      </i18n-t>
    </div>

    <div class="footerRow">
      <!-- Sprites -->
      <i18n-t
        keypath="footer.sprites"
        class="p2"
        tag="p"
      >
        <template #artists>
          <span
            class="link"
            @click="toggleShowCredits()"
            >{{ t('variousArtists') }}
          </span>
        </template>

        <template #project>
          <a
            href="https://www.deviantart.com/pikafan2000/art/National-Pokedex-Version-Delta-Icon-Dex-824897934"
            target="_blank"
            >Icon Dex Project</a
          >
        </template>
      </i18n-t>
    </div>

    <div class="footerRow">
      <!-- Resources -->
      <i18n-t
        keypath="footer.resources"
        class="p2"
        tag="p"
      >
        <template #pokeapi>
          <a
            href="https://github.com/PokeAPI/"
            target="_blank"
            >PokéAPI</a
          >
        </template>

        <template #sprites>
          <a
            href="https://github.com/msikma/pokesprite"
            target="_blank"
            >Pokésprite Database</a
          >
        </template>
      </i18n-t>

      <a
        href="/privacy.html"
        target="_blank"
      >
        <p class="p2">
          {{ t('footer.privacy') }}
        </p>
      </a>

      <p
        class="p2 link"
        @click="showHelp"
      >
        {{ t('help.title') }}
      </p>
    </div>

    <div class="footerRow">
      <p class="p2">
        {{ t('footer.license') }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--black);
  color: #fff;
  margin: 10px 10px 0;
  padding: 11px 14px;

  .mobile & {
    font-size: 12px;
    margin: 0;
  }
}

.p1 {
  font-size: 1.15em;
  display: inline-block;
}

.p2 {
  font-size: 0.9em;
}

.footerRow {
  line-height: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .mobile & {
    text-align: center;
    line-height: 1.5;
    justify-content: center;
  }
}

.link {
  cursor: pointer;
  color: var(--type-inline-color, var(--primary));
}

.kofi {
  height: 24px;
  vertical-align: middle;
  margin: 0 8px;
}

.github {
  display: inline-flex;
}
</style>
