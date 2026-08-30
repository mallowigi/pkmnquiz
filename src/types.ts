import { type User } from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';
import type { z } from 'zod';

import type {
  challengeModeSchema,
  gameModeSchema,
  gameSelectionStateSchema,
  generationSchema,
  languageSchema,
  modeSchema,
  regionBoxSchema,
  specialTypeSchema,
  typeSchema,
} from '@/schemas/enums.schema.ts';
import { pokemonProgressSchema } from '@/schemas/pokemonProgress.schema.ts';
import type {
  eventSnapshotSchema,
  ownerStateSchema,
  roomEnvelopeSchema,
  roomEventSchema,
} from '@/schemas/room.schema.ts';
import {
  saveDataBaseSchema,
  saveDataSchema,
  settingsSchema,
  stateSchema,
  touchesSchema,
} from '@/schemas/saveData.schema.ts';
import type { timerStateSchema } from '@/schemas/timer.schema.ts';

export type AlertDialogOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type Dialog =
  | 'alert'
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
  | 'userProfile'
  | 'visualSettings'
  | 'createRoom'
  | 'deleteRoom';

export type GameMode = z.infer<typeof gameModeSchema>;

export type GameModeInfo = {
  id: GameMode;
  name: string;
};

export type Mode = z.infer<typeof modeSchema>;

export type ModeInfo = {
  id: Mode;
  name: string;
};

export type RegionBox = z.infer<typeof regionBoxSchema>;

export type RegionBoxInfo = {
  id: RegionBox;
  name: string;
};

export type Type = z.infer<typeof typeSchema>;

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

export type SpecialType = z.infer<typeof specialTypeSchema>;

export type SpecialTypeInfo = Omit<TypeInfo, 'id'> & {
  id: SpecialType;
};

export type MegaType = 'mega' | 'gmax';

export type MegaTypeInfo = Omit<TypeInfo, 'id'> & {
  id: MegaType;
};

export type Gen = z.infer<typeof generationSchema>;

export type GenerationInfo = {
  boxes: RegionBox[];
  color: string;
  id: Gen;
  name: string;
  sprites: string[];
};

export type Language = z.infer<typeof languageSchema>;

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

export type State = z.infer<typeof stateSchema>;

export type Settings = z.infer<typeof settingsSchema>;

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

export type TimerState = z.infer<typeof timerStateSchema>;

export type ChallengeMode = z.infer<typeof challengeModeSchema>;

export type GameSelectionState = z.infer<typeof gameSelectionStateSchema>;

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

export type HelpSection = {
  id: string;
  title: string;
  description?: string;
  subsections?: HelpSubsection[];
  image?: string;
};

export type HelpSubsection = {
  id: string;
  title: string;
  description: string;
  listItems?: string[];
  image?: string;
  tips?: string[];
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

export type PokemonProgress = z.infer<typeof pokemonProgressSchema>;

export type Touches = z.infer<typeof touchesSchema>;

export type SaveData = z.infer<typeof saveDataSchema>;

export type SaveDataBase = z.infer<typeof saveDataBaseSchema>;

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export type Message = {
  id: number;
  text: string;
  type: MessageType;
};

export type UserRecord = DocumentData &
  SaveData & {
    id?: string;
    hasGivenUp: boolean;
    isMultiplayer: boolean;
    numShadows: number;
  };

export const availableLanguages = ['en', 'cn', 'de', 'es', 'fr', 'it', 'jp', 'ko', 'pt', 'ru', 'zh'];

export type TopTrainer = UserRecord & {
  id: string;
};

export type LeaderboardsProps = {
  gameMode?: GameMode | null;
  gen?: Gen | null;
  limit?: number;
  mode?: Mode | null;
  type?: Type | null;
  uid?: string | null;
  caption?: string;
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

export type OwnerState = z.infer<typeof ownerStateSchema>;

export type RoomEnvelope = z.infer<typeof roomEnvelopeSchema>;

export type UserSnapshot = {
  updatedAt: object;
  username: string;
};

export type MessageSnapshot = {
  timestamp: object;
  senderId: string;
  message: string;
};

export type RoomEvent = z.infer<typeof roomEventSchema>;

export type EventSnapshot = z.infer<typeof eventSnapshotSchema>;

export interface RoomInfo {
  id: string;
  name: string;
  userCount: number;
  createdAt: number | null;
  isStale: boolean;
}

export type RoomOwnerOutcome = 'created' | 'occupied' | 'failed' | 'alreadyOwner';

export type RoomConnectionOutcome = 'created' | 'joined' | 'resumed' | 'invalid' | 'failed';
