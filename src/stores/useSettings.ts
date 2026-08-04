import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { useTouches } from '@/stores/useTouches.ts';
import type { Settings, Language } from '@/types';

export const useSettings = defineStore('settings', () => {
  const settingsState = reactive<Settings>({
    autoPause: false,
    autoSync: true,
    avatar: null,
    languages: new Set<Language>(['en', 'fr', 'de', 'ko', 'ja', 'zh', 'cn']),
    name: '',
    withCriesHelper: false,
    withCycleSprites: true,
    withCycleTypes: true,
    withCycleRegions: true,
    withInitialsHelper: false,
    withShadowHelper: false,
    withShinies: false,
    withSound: true,
    withSpelling: false,
  });

  const {
    toggledAutoPause,
    toggledLanguage,
    toggledShadowHelper,
    toggledSpelling,
    toggledShinyCharm,
    toggledCriesHelper,
    toggledInitialsHelper,
  } = useTouches();

  const toggleLanguage = (language: Language) => {
    if (settingsState.languages.has(language)) {
      settingsState.languages.delete(language);
      return;
    }
    settingsState.languages.add(language);
    toggledLanguage();
  };

  const setLanguages = (languages: Language[]) => {
    settingsState.languages = new Set<Language>(languages);
    toggledLanguage();
  };

  const resetLanguages = () => {
    settingsState.languages = new Set<Language>(['en', 'ko', 'ja', 'zh', 'cn']);
  };

  const setName = (name: string | null) => {
    settingsState.name = name;
  };

  const setAvatar = (avatar: string | null) => {
    settingsState.avatar = avatar;
  };

  const toggleShowShinies = () => {
    settingsState.withShinies = !settingsState.withShinies;
    toggledShinyCharm();
  };

  const toggleSpelling = () => {
    settingsState.withSpelling = !settingsState.withSpelling;
    toggledSpelling();
  };

  const toggleShadowHelper = () => {
    settingsState.withShadowHelper = !settingsState.withShadowHelper;
    toggledShadowHelper();
  };

  const toggleCriesHelper = () => {
    settingsState.withCriesHelper = !settingsState.withCriesHelper;
    toggledCriesHelper();
  };

  const toggleInitialsHelper = () => {
    settingsState.withInitialsHelper = !settingsState.withInitialsHelper;
    toggledInitialsHelper();
  };

  const setCycleSprites = (withCycleSprites: boolean) => {
    settingsState.withCycleSprites = withCycleSprites;
  };

  const setCycleTypes = (withCycleTypes: boolean) => {
    settingsState.withCycleTypes = withCycleTypes;
  };

  const setCycleRegions = (withCycleRegions: boolean) => {
    settingsState.withCycleRegions = withCycleRegions;
  };

  const setSound = (withSound: boolean) => {
    settingsState.withSound = withSound;
  };

  const toggleAutoPause = (autoPause: boolean) => {
    settingsState.autoPause = autoPause;
    toggledAutoPause();
  };

  const setSaveToCloud = (saveToCloud: boolean) => {
    settingsState.autoSync = saveToCloud;
  };

  const setSettingsState = (settings: Partial<Settings>) => {
    Object.assign(settingsState, settings);
  };

  return {
    resetLanguages,
    setAvatar,
    setCycleSprites,
    setCycleTypes,
    setCycleRegions,
    setLanguages,
    setName,
    setSaveToCloud,
    setSettingsState,
    setSound,
    settingsState,
    toggleAutoPause,
    toggleCriesHelper,
    toggleInitialsHelper,
    toggleLanguage,
    toggleShadowHelper,
    toggleShowShinies,
    toggleSpelling,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettings, import.meta.hot));
}
