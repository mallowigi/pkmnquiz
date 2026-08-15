import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import type { HelpSection } from '@/types.ts';

interface HelpState {
  showHelp: boolean;
  expandedSections: Set<string>;
  selectedImage: string | null;
}

export const useHelp = defineStore('help', () => {
  const getHelpSections = (): HelpSection[] => {
    const { t } = useI18n();
    return [
      {
        description: t('helpPopup.howToPlay.description'),
        id: 'howToPlay',
        subsections: [
          {
            description: t('helpPopup.howToPlay.typing.description'),
            id: 'typing',
            title: t('helpPopup.howToPlay.typing.title'),
          },
          {
            description: t('helpPopup.howToPlay.scoring.description'),
            id: 'scoring',
            listItems: [
              t('helpPopup.howToPlay.scoring.listItems.0-3'),
              t('helpPopup.howToPlay.scoring.listItems.3-7'),
              t('helpPopup.howToPlay.scoring.listItems.7-15'),
              t('helpPopup.howToPlay.scoring.listItems.15-30'),
              t('helpPopup.howToPlay.scoring.listItems.+30'),
            ],
            title: t('helpPopup.howToPlay.scoring.title'),
          },
        ],
        title: t('helpPopup.howToPlay.title'),
      },
      {
        description: t('helpPopup.gameModes.description'),
        id: 'gameModes',
        subsections: [
          {
            description: t('helpPopup.gameModes.freeMode.description'),
            id: 'freeMode',
            title: t('helpPopup.gameModes.freeMode.title'),
          },
          {
            description: t('helpPopup.gameModes.challengeMode.description'),
            id: 'challengeMode',
            title: t('helpPopup.gameModes.challengeMode.title'),
          },
          {
            description: t('helpPopup.gameModes.quizTypes.description'),
            id: 'quizTypes',
            listItems: [
              t('helpPopup.gameModes.quizTypes.listItems.gen'),
              t('helpPopup.gameModes.quizTypes.listItems.type'),
              t('helpPopup.gameModes.quizTypes.listItems.full'),
              t('helpPopup.gameModes.quizTypes.listItems.mega'),
              t('helpPopup.gameModes.quizTypes.listItems.special'),
            ],
            title: t('helpPopup.gameModes.quizTypes.title'),
          },
          {
            description: t('helpPopup.gameModes.orderModes.description'),
            id: 'orderModes',
            listItems: [
              t('helpPopup.gameModes.orderModes.listItems.normal'),
              t('helpPopup.gameModes.orderModes.listItems.dex'),
              t('helpPopup.gameModes.orderModes.listItems.chaos'),
            ],
            title: t('helpPopup.gameModes.orderModes.title'),
          },
        ],
        title: t('helpPopup.gameModes.title'),
      },
      {
        description: t('helpPopup.helpers.description'),
        id: 'helpers',
        subsections: [
          {
            description: t('helpPopup.helpers.shadows.description'),
            id: 'shadows',
            title: t('helpPopup.helpers.shadows.title'),
          },
          {
            description: t('helpPopup.helpers.cries.description'),
            id: 'cries',
            title: t('helpPopup.helpers.cries.title'),
          },
          {
            description: t('helpPopup.helpers.spelling.description'),
            id: 'spelling',
            title: t('helpPopup.helpers.spelling.title'),
          },
        ],
        title: t('helpPopup.helpers.title'),
      },
      {
        description: t('helpPopup.shuffleModes.description'),
        id: 'shuffleModes',
        subsections: [
          {
            description: t('helpPopup.shuffleModes.typeShuffle.description'),
            id: 'typeShuffle',
            title: t('helpPopup.shuffleModes.typeShuffle.title'),
          },
          {
            description: t('helpPopup.shuffleModes.boxShuffle.description'),
            id: 'boxShuffle',
            title: t('helpPopup.shuffleModes.boxShuffle.title'),
          },
        ],
        title: t('helpPopup.shuffleModes.title'),
      },
      {
        description: t('helpPopup.settings.description'),
        id: 'settings',
        subsections: [
          {
            description: t('helpPopup.settings.visual.description'),
            id: 'visual',
            listItems: [
              t('helpPopup.settings.visual.listItems.darkMode'),
              t('helpPopup.settings.visual.listItems.themeColor'),
              t('helpPopup.settings.visual.listItems.language'),
            ],
            title: t('helpPopup.settings.visual.title'),
          },
          {
            description: t('helpPopup.settings.gameplay.description'),
            id: 'gameplay',
            listItems: [
              t('helpPopup.settings.gameplay.listItems.shinyCharm'),
              t('helpPopup.settings.gameplay.listItems.autoPause'),
              t('helpPopup.settings.gameplay.listItems.sync'),
              t('helpPopup.settings.gameplay.listItems.autoScroll'),
              t('helpPopup.settings.gameplay.listItems.sounds'),
              t('helpPopup.settings.gameplay.listItems.cycleSprites'),
              t('helpPopup.settings.gameplay.listItems.cycleRegions'),
              t('helpPopup.settings.gameplay.listItems.cycleTypes'),
            ],
            title: t('helpPopup.settings.gameplay.title'),
          },
          {
            description: t('helpPopup.settings.languages.description'),
            id: 'languages',
            title: t('helpPopup.settings.languages.title'),
          },
        ],
        title: t('helpPopup.settings.title'),
      },
      {
        description: t('helpPopup.shortcuts.description'),
        id: 'shortcuts',
        subsections: [
          {
            description: t('helpPopup.shortcuts.keyboard.description'),
            id: 'keyboard',
            listItems: [
              t('helpPopup.shortcuts.keyboard.listItems.cries'),
              t('helpPopup.shortcuts.keyboard.listItems.shadow'),
            ],
            title: t('helpPopup.shortcuts.keyboard.title'),
          },
          {
            description: t('helpPopup.shortcuts.mobile.description'),
            id: 'mobile',
            listItems: [
              t('helpPopup.shortcuts.mobile.listItems.cries'),
              t('helpPopup.shortcuts.mobile.listItems.shadow'),
            ],
            title: t('helpPopup.shortcuts.mobile.title'),
          },
        ],
        title: t('helpPopup.shortcuts.title'),
      },
      {
        description: t('helpPopup.saveLoad.description'),
        id: 'saveLoad',
        subsections: [
          {
            description: t('helpPopup.saveLoad.cloudSync.description'),
            id: 'cloudSync',
            title: t('helpPopup.saveLoad.cloudSync.title'),
          },
          {
            description: t('helpPopup.saveLoad.localSave.description'),
            id: 'localSave',
            title: t('helpPopup.saveLoad.localSave.title'),
          },
        ],
        title: t('helpPopup.saveLoad.title'),
      },
      {
        description: t('helpPopup.leaderboards.description'),
        id: 'leaderboards',
        title: t('helpPopup.leaderboards.title'),
      },
    ];
  };

  const helpState = reactive<HelpState>({
    expandedSections: new Set(['howToPlay']),
    selectedImage: null,
    showHelp: false,
  });

  const showHelp = () => {
    helpState.showHelp = true;
  };

  const hideHelp = () => {
    helpState.showHelp = false;
  };

  const toggleSection = (sectionId: string) => {
    if (helpState.expandedSections.has(sectionId)) {
      helpState.expandedSections.delete(sectionId);
    } else {
      helpState.expandedSections.add(sectionId);
    }
  };

  const isSectionExpanded = (sectionId: string) => {
    return helpState.expandedSections.has(sectionId);
  };

  const openImageModal = (imagePath: string) => {
    helpState.selectedImage = imagePath;
  };

  const closeImageModal = () => {
    helpState.selectedImage = null;
  };

  return {
    closeImageModal,
    getHelpSections,
    helpState,
    hideHelp,
    isSectionExpanded,
    openImageModal,
    showHelp,
    toggleSection,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHelp, import.meta.hot));
}
