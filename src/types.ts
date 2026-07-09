import { type User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';

export type Dialog =
  | 'changeName'
  | 'chaos'
  | 'giveup'
  | 'leaderboards'
  | 'login'
  | 'normal'
  | 'order'
  | 'reset'
  | 'settings'
  | 'shadows'
  | 'switchQuiz'
  | 'timer'
  | 'userProfile';

export type GameMode = 'full' | 'gen' | 'special' | 'mega' | 'types';

export type GameModeInfo = {
  id: GameMode;
  name: string;
};

export type Mode = 'chaos' | 'normal' | 'order';

export type ModeInfo = {
  id: Mode;
  name: string;
};

export type RegionBox =
  | 'alola'
  | 'areazero'
  | 'galar'
  | 'gmax'
  | 'hisui'
  | 'hoenn'
  | 'hoennmega'
  | 'hyperspace'
  | 'johto'
  | 'kalos'
  | 'kalosmega'
  | 'kanto'
  | 'lumiose'
  | 'paldea'
  | 'pokemongo'
  | 'sinnoh'
  | 'unova';

export type RegionBoxInfo = {
  id: RegionBox;
  name: string;
};

export type Type =
  | 'bug'
  | 'dark'
  | 'dragon'
  | 'electric'
  | 'fairy'
  | 'fighting'
  | 'fire'
  | 'flying'
  | 'ghost'
  | 'grass'
  | 'ground'
  | 'ice'
  | 'normal'
  | 'poison'
  | 'psychic'
  | 'rock'
  | 'steel'
  | 'water';

export type TypeInfo = {
  bgColor: string;
  buttonColor: string;
  darkBgColor: string;
  fgColor: string;
  icon: string;
  id: Type;
  index: number;
  inlineColor: string;
  lightBgColor: string;
  lightFgColor: string;
  name: string;
  symbol: string;
};

export type SpecialType = 'no' | 'sublegendary' | 'legendary' | 'mythical' | 'ultrabeast' | 'paradox';

export type SpecialTypeInfo = Omit<TypeInfo, 'id'> & {
  id: SpecialType;
};

export type MegaType = 'mega' | 'gmax';

export type MegaTypeInfo = Omit<TypeInfo, 'id'> & {
  id: MegaType;
};

export type Gen = 'gen1' | 'gen2' | 'gen3' | 'gen4' | 'gen5' | 'gen6' | 'gen7' | 'gen8' | 'gen9';

export type GenerationInfo = {
  boxes: RegionBox[];
  color: string;
  id: Gen;
  name: string;
  sprites: string[];
};

export type Language = 'cn' | 'de' | 'en' | 'fr' | 'ja' | 'ko' | 'zh';

export type LanguageInfo = {
  id: Language;
  index: number;
  name: string;
  symbol: string;
};

export type PokemonInfo = {
  baseName: string;
  box: RegionBox;
  dexNum: number;
  id: string;
  primaryType: Type;
  secondaryType: Type | null;
  specialType: SpecialType;
  megaType: MegaType;
  sprites?: string[];
};

export type UserData = {
  user: User | null;
};

export type Touches = {
  toggledAutoPause: boolean;
  toggledDisplayShadows: boolean;
  toggledLanguage: boolean;
  toggledShadowHelper: boolean;
  toggledShinyCharm: boolean;
  toggledCriesHelper: boolean;
  toggledInitialsHelper: boolean;
  toggledSpelling: boolean;
  typeShuffleClicks: number;
  spellingClicks: number;
  shiniesDiscovered: number;
  summonedShadows: number;
  summonedCries: number;
  summonedInitials: number;
};

export type State = {
  gameMode: GameMode | null;
  isDark: boolean;
  mode: Mode;

  withShadows: boolean;
  withTypeShuffle: boolean;
  withCriesShuffle: boolean;
};

export type Settings = {
  name: string | null;
  avatar: string | null;
  autoPause: boolean;
  withCycleSprites: boolean;
  withShadowHelper: boolean;
  withCriesHelper: boolean;
  withInitialsHelper: boolean;
  withShinies: boolean;
  withSound: boolean;
  withSpelling: boolean;
  languages: Set<Language>;
  autoSync: boolean;
};

export type PokemonStatus = {
  isFound: boolean;
  isShadowed: boolean;
  isShiny: boolean;
  isMissed: boolean;
  lastFoundAt: number | null;
  lastShadowedAt: number | null;
};

export type PokemonProgressState = {
  lastIndex: number | null;
  lastPokemon: PokemonInfo | null;
  currentPokemon: PokemonInfo | null;
  pokemonStatuses: Map<string, PokemonStatus>;
};

export type TimerState = {
  elapsed: number;
  isLimited: boolean;
  minutes: number;
  savedAt: number | null;
  startTime: number | null;
};

export type GameSelectionState = 'new' | 'gen' | 'types' | 'special' | null;

export type GameFlowState = {
  gameSelectionState: GameSelectionState;
  isEnded: boolean;
  isGivenUp: boolean;
  isPaused: boolean;
  isSettingsOpen: boolean;
  isStarted: boolean;
  lastInput: string | null;
};

export type Translations = {
  cn: string;
  de: string;
  en: string;
  es: string;
  fr: string;
  it: string;
  ja: string;
  ko: string;
  zh: string;
};

export type PkmnData = {
  error: unknown;
  isLoaded: boolean;
  namings: Record<string, string> | null;
  pokemon: PokemonInfo[] | null;
  shinies: Record<string, string> | null;
  silhouettes: Record<string, string> | null;
  spriteCycles: Record<string, string[]> | null;
  sprites: Record<string, string> | null;
  suffixNamings: Record<string, string> | null;
  translations: Record<string, Translations> | null;
};

export type PokemonProgress = {
  pokemonFound: {
    id: string;
    lastFoundAt: number | null;
  }[];
  pokemonShadowed: {
    id: string;
    lastShadowedAt: number | null;
  }[];
  shinyPokemon: {
    id: string;
  }[];
};

export type SaveData = State &
  Omit<Settings, 'languages'> &
  Touches & {
    currentType: Type | null;
    gameSelectionState: GameSelectionState | null;
    gen: Gen | null;
    languages: Language[];
    pokemonProgress: PokemonProgress;
    timer: TimerState;
    version: number;
  };

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export type Message = {
  id: number;
  text: string;
  type: MessageType;
};

export interface UserRecord extends DocumentData, SaveData {
  id?: string;
  hasGivenUp: boolean;
  numShadows: number;
}

export const availableLanguages = ['en', 'cn', 'de', 'es', 'fr', 'it', 'jp', 'ko', 'pt', 'ru', 'zh'];
