import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

export interface HelpSection {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  subsections?: HelpSubsection[];
  image?: string;
}

export interface HelpSubsection {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image?: string;
  tips?: string[];
}

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
        descriptionKey: t('helpPopup.howToPlay.description'),
        id: 'howToPlay',
        subsections: [
          {
            descriptionKey: t('helpPopup.howToPlay.typing.description'),
            id: 'typing',
            titleKey: t('helpPopup.howToPlay.typing.title'),
          },
          {
            descriptionKey: t('helpPopup.howToPlay.scoring.description'),
            id: 'scoring',
            titleKey: t('helpPopup.howToPlay.scoring.title'),
          },
        ],
        titleKey: t('helpPopup.howToPlay.title'),
      },
      {
        descriptionKey: t('helpPopup.gameModes.description'),
        id: 'gameModes',
        subsections: [
          {
            descriptionKey: t('helpPopup.gameModes.freeMode.description'),
            id: 'freeMode',
            titleKey: t('helpPopup.gameModes.freeMode.title'),
          },
          {
            descriptionKey: t('helpPopup.gameModes.challengeMode.description'),
            id: 'challengeMode',
            titleKey: t('helpPopup.gameModes.challengeMode.title'),
          },
          {
            descriptionKey: t('helpPopup.gameModes.quizTypes.description'),
            id: 'quizTypes',
            titleKey: t('helpPopup.gameModes.quizTypes.title'),
          },
          {
            descriptionKey: t('helpPopup.gameModes.orderModes.description'),
            id: 'orderModes',
            titleKey: t('helpPopup.gameModes.orderModes.title'),
          },
        ],
        titleKey: t('helpPopup.gameModes.title'),
      },
      {
        descriptionKey: t('helpPopup.helpers.description'),
        id: 'helpers',
        subsections: [
          {
            descriptionKey: t('helpPopup.helpers.shadows.description'),
            id: 'shadows',
            titleKey: t('helpPopup.helpers.shadows.title'),
          },
          {
            descriptionKey: t('helpPopup.helpers.cries.description'),
            id: 'cries',
            titleKey: t('helpPopup.helpers.cries.title'),
          },
          {
            descriptionKey: t('helpPopup.helpers.spelling.description'),
            id: 'spelling',
            titleKey: t('helpPopup.helpers.spelling.title'),
          },
        ],
        titleKey: t('helpPopup.helpers.title'),
      },
      {
        descriptionKey: t('helpPopup.settings.description'),
        id: 'settings',
        subsections: [
          {
            descriptionKey: t('helpPopup.settings.visual.description'),
            id: 'visual',
            titleKey: t('helpPopup.settings.visual.title'),
          },
          {
            descriptionKey: t('helpPopup.settings.gameplay.description'),
            id: 'gameplay',
            titleKey: t('helpPopup.settings.gameplay.title'),
          },
          {
            descriptionKey: t('helpPopup.settings.languages.description'),
            id: 'languages',
            titleKey: t('helpPopup.settings.languages.title'),
          },
        ],
        titleKey: t('helpPopup.settings.title'),
      },
      {
        descriptionKey: t('helpPopup.shuffleModes.description'),
        id: 'shuffleModes',
        subsections: [
          {
            descriptionKey: t('helpPopup.shuffleModes.typeShuffle.description'),
            id: 'typeShuffle',
            titleKey: t('helpPopup.shuffleModes.typeShuffle.title'),
          },
          {
            descriptionKey: t('helpPopup.shuffleModes.boxShuffle.description'),
            id: 'boxShuffle',
            titleKey: t('helpPopup.shuffleModes.boxShuffle.title'),
          },
        ],
        titleKey: t('helpPopup.shuffleModes.title'),
      },
      {
        descriptionKey: t('helpPopup.shortcuts.description'),
        id: 'shortcuts',
        subsections: [
          {
            descriptionKey: t('helpPopup.shortcuts.keyboard.description'),
            id: 'keyboard',
            titleKey: t('helpPopup.shortcuts.keyboard.title'),
          },
          {
            descriptionKey: t('helpPopup.shortcuts.mobile.description'),
            id: 'mobile',
            titleKey: t('helpPopup.shortcuts.mobile.title'),
          },
        ],
        titleKey: t('helpPopup.shortcuts.title'),
      },
      {
        descriptionKey: t('helpPopup.saveLoad.description'),
        id: 'saveLoad',
        subsections: [
          {
            descriptionKey: t('helpPopup.saveLoad.cloudSync.description'),
            id: 'cloudSync',
            titleKey: t('helpPopup.saveLoad.cloudSync.title'),
          },
          {
            descriptionKey: t('helpPopup.saveLoad.localSave.description'),
            id: 'localSave',
            titleKey: t('helpPopup.saveLoad.localSave.title'),
          },
        ],
        titleKey: t('helpPopup.saveLoad.title'),
      },
      {
        descriptionKey: t('helpPopup.leaderboards.description'),
        id: 'leaderboards',
        titleKey: t('helpPopup.leaderboards.title'),
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
