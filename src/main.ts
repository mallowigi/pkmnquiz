import './assets/base.css';
import { GesturePlugin } from '@vueuse/gesture';
import { MotionPlugin } from 'motion-v';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import { useSavedLocale } from '@/composables/useSavedLocale.ts';
import hideMobile from '@/directives/breakpoint.ts';
import ellipsis from '@/directives/ellipsis.ts';
import gameEnded from '@/directives/gameEnded.ts';
import tooltip from '@/directives/tooltip.ts';
import cn from '@/locales/cn.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';
import jp from '@/locales/jp.json';
import ko from '@/locales/ko.json';
import pt from '@/locales/pt.json';
import ru from '@/locales/ru.json';
import zh from '@/locales/zh.json';
import { piniaStorePlugin } from '@/stores/piniaStorePlugin.ts';
import { capitalize } from '@/utils/utils.ts';

import App from './App.vue';


const { savedLocale } = useSavedLocale();

export const i18n = createI18n({
  fallbackLocale: 'en',
  locale: savedLocale.value,
  messages: { cn, de, en, es, fr, it, jp, ko, pt, ru, zh },
  modifiers: {
    capitalize: (value) => capitalize(value.toString()),
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(GesturePlugin);
app.use(MotionPlugin, {});
app.use(i18n);
app.directive('tooltip', tooltip);
app.directive('game-ended', gameEnded);
app.directive('ellipsis', ellipsis);
app.directive('breakpoint', hideMobile);

pinia.use(piniaStorePlugin);

app.mount('#app');
