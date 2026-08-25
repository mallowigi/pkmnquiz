import { z } from 'zod';

import { VERSION } from '@/data/global.ts';
import {
  challengeModeSchema,
  gameModeSchema,
  generationSchema,
  languageSchema,
  modeSchema,
  regionBoxSchema,
  specialTypeSchema,
  typeSchema,
} from '@/schemas/enums.schema.ts';
import { pokemonProgressSchema } from '@/schemas/pokemonProgress.schema.ts';
import { timerStateSchema } from '@/schemas/timer.schema.ts';

export const stateSchema = z.object({
  gameMode: gameModeSchema.nullable(),
  isDark: z.boolean(),
  mode: modeSchema,
  withBoxShuffle: z.boolean(),
  withCriesShuffle: z.boolean(),
  withShadows: z.boolean(),
  withTypeShuffle: z.boolean(),
});

export const settingsSchema = z.object({
  autoPause: z.boolean(),
  autoSync: z.boolean(),
  avatar: z.string().nullish(),
  languages: z.set(languageSchema),
  name: z.string().nullish(),
  withCriesHelper: z.boolean(),
  withCycleRegions: z.boolean(),
  withCycleSprites: z.boolean(),
  withCycleTypes: z.boolean(),
  withInitialsHelper: z.boolean(),
  withScrollIntoView: z.boolean(),
  withShadowHelper: z.boolean(),
  withShinies: z.boolean(),
  withSound: z.boolean(),
  withSpelling: z.boolean(),
});

export const touchesSchema = z.object({
  boxShuffleClicks: z.number().int().nonnegative(),
  shiniesDiscovered: z.number().int().nonnegative(),
  spellingClicks: z.number().int().nonnegative(),
  summonedCries: z.number().int().nonnegative(),
  summonedInitials: z.number().int().nonnegative(),
  summonedShadows: z.number().int().nonnegative(),
  toggledAutoPause: z.boolean(),
  toggledCriesHelper: z.boolean(),
  toggledDisplayShadows: z.boolean(),
  toggledInitialsHelper: z.boolean(),
  toggledLanguage: z.boolean(),
  toggledMissingno: z.boolean(),
  toggledShadowHelper: z.boolean(),
  toggledShinyCharm: z.boolean(),
  toggledSpelling: z.boolean(),
  typeShuffleClicks: z.number().int().nonnegative(),
});

/** Runtime schema for the flat state currently written to browser and cloud saves. */
export const saveDataSchema = z.object({
  ...stateSchema.shape,
  ...touchesSchema.shape,
  autoPause: z.boolean(),
  autoSync: z.boolean(),
  avatar: z.string().nullish(),
  challengeMode: challengeModeSchema,
  currentBox: regionBoxSchema.nullish(),
  currentMegaBox: regionBoxSchema.nullish(),
  currentSpecialBox: specialTypeSchema.nullish(),
  currentType: typeSchema.nullish(),
  currentTypes: z.array(typeSchema).nullish(),
  gameSelectionState: z.null(),
  gens: z.array(generationSchema).nullish(),
  languages: z.array(languageSchema),
  name: z.string().nullable(),
  pokemonProgress: pokemonProgressSchema,
  score: z.number().int().nonnegative(),
  sessionId: z.string().min(1),
  skipScore: z.number().int().nonnegative(),
  skips: z.number().int().nonnegative(),
  timer: timerStateSchema,
  types: z.array(typeSchema).nullish(),
  version: z.literal(VERSION),
  withCriesHelper: z.boolean(),
  withCycleRegions: z.boolean(),
  withCycleSprites: z.boolean(),
  withCycleTypes: z.boolean(),
  withInitialsHelper: z.boolean(),
  withScrollIntoView: z.boolean(),
  withShadowHelper: z.boolean(),
  withShinies: z.boolean(),
  withSound: z.boolean(),
  withSpelling: z.boolean(),
});

export const parseSaveData = (input: unknown) => saveDataSchema.safeParse(input);
