import { describe, expect, it } from 'vitest';

import { parseSaveData } from '@/schemas/saveData.schema.ts';
import type { SaveData } from '@/types.ts';

const validSaveData: SaveData = {
  gameMode: 'gen',
  isDark: false,
  mode: 'normal',
  withShadows: false,
  withTypeShuffle: false,
  withBoxShuffle: false,
  withCriesShuffle: false,
  name: 'Ash',
  avatar: null,
  autoPause: false,
  withCycleSprites: true,
  withCycleTypes: true,
  withCycleRegions: true,
  withShadowHelper: false,
  withCriesHelper: false,
  withInitialsHelper: false,
  withShinies: false,
  withSound: true,
  withSpelling: false,
  withScrollIntoView: true,
  autoSync: true,
  toggledAutoPause: false,
  toggledDisplayShadows: false,
  toggledLanguage: false,
  toggledShadowHelper: false,
  toggledShinyCharm: false,
  toggledCriesHelper: false,
  toggledInitialsHelper: false,
  toggledSpelling: false,
  toggledMissingno: false,
  typeShuffleClicks: 0,
  boxShuffleClicks: 0,
  spellingClicks: 0,
  shiniesDiscovered: 0,
  summonedShadows: 0,
  summonedCries: 0,
  summonedInitials: 0,
  sessionId: 'session-1',
  currentType: null,
  currentTypes: [],
  currentBox: null,
  currentSpecialBox: null,
  currentMegaBox: null,
  gameSelectionState: null,
  challengeMode: 'free',
  gens: ['gen1'],
  types: [],
  languages: ['en', 'fr'],
  pokemonProgress: {
    pokemonFound: [{ id: 'bulbasaur', lastFoundAt: 100 }],
    pokemonShadowed: [],
    shinyPokemon: [],
  },
  score: 10,
  skips: 1,
  skipScore: 25,
  timer: {
    elapsed: 120,
    isLimited: false,
    minutes: 35,
    savedAt: 200,
    startTime: 80,
  },
  version: 1,
};

describe('parseSaveData', () => {
  it('accepts the current flat save shape', () => {
    const result = parseSaveData(validSaveData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validSaveData);
    }
  });

  it.each([
    ['a primitive', 'invalid'],
    ['null', null],
    ['an array', []],
  ])('rejects %s input', (_description, input) => {
    expect(parseSaveData(input).success).toBe(false);
  });

  it('rejects invalid enum values', () => {
    expect(parseSaveData({ ...validSaveData, gameMode: 'unknown' }).success).toBe(false);
    expect(parseSaveData({ ...validSaveData, mode: 'unknown' }).success).toBe(false);
    expect(parseSaveData({ ...validSaveData, gens: ['generation-1'] }).success).toBe(false);
    expect(parseSaveData({ ...validSaveData, types: ['unknown'] }).success).toBe(false);
  });

  it('rejects invalid primitive and numeric values', () => {
    expect(parseSaveData({ ...validSaveData, isDark: 'false' }).success).toBe(false);
    expect(parseSaveData({ ...validSaveData, score: -1 }).success).toBe(false);
    expect(parseSaveData({ ...validSaveData, timer: { ...validSaveData.timer, elapsed: Number.NaN } }).success).toBe(
      false,
    );
    expect(parseSaveData({ ...validSaveData, pokemonProgress: { pokemonFound: [{}] } }).success).toBe(false);
  });

  it('accepts unknown fields without including them in the parsed data', () => {
    const result = parseSaveData({ ...validSaveData, unexpected: true });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('unexpected');
    }
  });

  it('rejects unsupported versions', () => {
    expect(parseSaveData({ ...validSaveData, version: 2 }).success).toBe(false);
  });
});
