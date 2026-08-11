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
  specialType?: SpecialType;
  megaType?: MegaType;
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
  toggledMissingno: boolean;
  typeShuffleClicks: number;
  boxShuffleClicks: number;
  spellingClicks: number;
  shiniesDiscovered: number;
  summonedShadows: number;
  summonedCries: number;
  summonedInitials: number;
};

export type FinishedGames = {
  full: number;
  chaos: number;
  normal: number;
  order: number;
  gen: Record<Gen, number>;
  special: number;
  mega: number;
  types: Record<Type, number>;
  noShadows: number;
  noCries: number;
};

export type Profile = {
  plays: number;
  finishedGames: FinishedGames;
};

export type Bonus = {
  bonus: number;
  score: number;
  spellCheckerTriggered: boolean;
};

export type Skips = {
  skipScore: number;
  skips: number;
};

export type State = {
  gameMode: GameMode | null;
  isDark: boolean;
  mode: Mode;

  withShadows: boolean;
  withTypeShuffle: boolean;
  withBoxShuffle: boolean;
  withCriesShuffle: boolean;
};

export type Settings = {
  name: string | null;
  avatar: string | null;
  autoPause: boolean;
  withCycleSprites: boolean;
  withCycleTypes: boolean;
  withCycleRegions: boolean;
  withShadowHelper: boolean;
  withCriesHelper: boolean;
  withInitialsHelper: boolean;
  withShinies: boolean;
  withSound: boolean;
  withSpelling: boolean;
  withScrollIntoView: boolean;
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
  shinyRate: number;
};

export type TimerState = {
  elapsed: number;
  isLimited: boolean;
  minutes: number;
  savedAt: number | null;
  startTime: number | null;
};

export type ChallengeMode = 'free' | 'challenge';

export type GameSelectionState = 'new' | 'gen' | 'types' | 'special' | null | 'challenge' | 'challengeSetup';

export type GameFlowState = {
  gameSelectionState: GameSelectionState;
  challengeMode: ChallengeMode;
  sessionId: string | null;
  isEnded: boolean;
  isGivenUp: boolean;
  isPaused: boolean;
  isSettingsOpen: boolean;
  isStarted: boolean;
  missingno: boolean;
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
    sessionId: string | null;
    currentType: Type | null;
    currentTypes: Type[] | null;
    currentBox: RegionBox | null;
    currentSpecialBox: SpecialType | null;
    currentMegaBox: RegionBox | null;
    gameSelectionState: GameSelectionState | null;
    challengeMode: ChallengeMode;
    gens: Gen[] | null;
    languages: Language[];
    pokemonProgress: PokemonProgress;
    score: number;
    skips: number;
    skipScore: number;
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

export type TopTrainer = UserRecord & {
  id: string;
};

export type AbilityInfo = {
  effect: string;
  name: string;
  url: string;
};

export type PokemonDetails = PokemonInfo & {
  artwork: string;
  height: number;
  weight: number;
  catchRate: number;
  description: string;
  species: string;
  abilities: AbilityInfo[];
  genderRatio:
    | {
        male: number;
        female: number;
      }
    | 'genderless';
  stats: {
    atk: number;
    def: number;
    hp: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
};
