import { useI18n } from 'vue-i18n';

import type { Gen, Type, RegionBox, GameMode, Language, Mode, SpecialType } from '@/types.ts';

export const useTranslations = () => {
  const { t } = useI18n();

  const getGenTranslation = (genId: Gen | undefined): string => {
    if (!genId) return '';

    switch (genId) {
      case 'gen1':
        return t('kanto');
      case 'gen2':
        return t('johto');
      case 'gen3':
        return t('hoenn');
      case 'gen4':
        return t('sinnoh');
      case 'gen5':
        return t('unova');
      case 'gen6':
        return t('kalos');
      case 'gen7':
        return t('alola');
      case 'gen8':
        return t('galar');
      case 'gen9':
        return t('paldea');
      default:
        return '';
    }
  };

  const getTypeTranslation = (typeId: Type | undefined): string => {
    if (!typeId) return '';

    switch (typeId) {
      case 'bug':
        return t('bug');
      case 'dark':
        return t('dark');
      case 'dragon':
        return t('dragon');
      case 'electric':
        return t('electric');
      case 'fairy':
        return t('fairy');
      case 'fighting':
        return t('fighting');
      case 'fire':
        return t('fire');
      case 'flying':
        return t('flying');
      case 'ghost':
        return t('ghost');
      case 'grass':
        return t('grass');
      case 'ground':
        return t('ground');
      case 'ice':
        return t('ice');
      case 'normal':
        return t('normal');
      case 'poison':
        return t('poison');
      case 'psychic':
        return t('psychic');
      case 'rock':
        return t('rock');
      case 'steel':
        return t('steel');
      case 'water':
        return t('water');
      default:
        return '';
    }
  };

  const getSpecialTypeTranslation = (typeId: SpecialType | undefined): string => {
    if (!typeId) return '';

    switch (typeId) {
      case 'no':
        return t('special');
      case 'sublegendary':
        return t('sublegendary');
      case 'legendary':
        return t('legendary');
      case 'mythical':
        return t('mythical');
      case 'ultrabeast':
        return t('ultrabeast');
      case 'paradox':
        return t('paradox');
      default:
        return '';
    }
  };

  const getBoxTranslation = (boxId: RegionBox | undefined): string => {
    if (!boxId) return '';

    switch (boxId) {
      case 'alola':
        return t('alola');
      case 'areazero':
        return t('areazero');
      case 'galar':
        return t('galar');
      case 'gmax':
        return t('gmax');
      case 'hisui':
        return t('hisui');
      case 'hoenn':
        return t('hoenn');
      case 'hoennmega':
        return t('hoennmega');
      case 'hyperspace':
        return t('hyperspace');
      case 'johto':
        return t('johto');
      case 'kalos':
        return t('kalos');
      case 'kalosmega':
        return t('kalosmega');
      case 'kanto':
        return t('kanto');
      case 'lumiose':
        return t('lumiose');
      case 'paldea':
        return t('paldea');
      case 'pokemongo':
        return t('pokemongo');
      case 'sinnoh':
        return t('sinnoh');
      case 'unova':
        return t('unova');
      default:
        return '';
    }
  };

  const getGameModeTranslation = (modeId: GameMode | undefined): string => {
    if (!modeId) return '';

    switch (modeId) {
      case 'full':
        return t('full');
      case 'gen':
        return t('gen');
      case 'mega':
        return t('mega');
      case 'special':
        return t('special');
      case 'types':
        return t('types');
      default:
        return '';
    }
  };

  const getLanguageTranslation = (languageId: Language | undefined): string => {
    if (!languageId) return '';

    switch (languageId) {
      case 'cn':
        return t('cn');
      case 'de':
        return t('de');
      case 'en':
        return t('en');
      case 'fr':
        return t('fr');
      case 'ja':
        return t('ja');
      case 'ko':
        return t('ko');
      case 'zh':
        return t('zh');
      default:
        return '';
    }
  };

  const getModeTranslation = (modeId: Mode | undefined): string => {
    if (!modeId) return '';

    switch (modeId) {
      case 'chaos':
        return t('chaos');
      case 'normal':
        return t('normal');
      case 'order':
        return t('order');
      default:
        return '';
    }
  };

  const getTypeOrSpecialTranslation = (typeId: Type | SpecialType | undefined): string => {
    if (!typeId) return '';

    const typeTranslation = getTypeTranslation(typeId as Type);
    if (typeTranslation) return typeTranslation;

    const specialTypeTranslation = getSpecialTypeTranslation(typeId as SpecialType);
    if (specialTypeTranslation) return specialTypeTranslation;

    return '';
  };

  return {
    getBoxTranslation,
    getGameModeTranslation,
    getGenTranslation,
    getLanguageTranslation,
    getModeTranslation,
    getSpecialTypeTranslation,
    getTypeOrSpecialTranslation,
    getTypeTranslation,
  };
};
