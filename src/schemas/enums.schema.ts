import { z } from 'zod';

export const gameModeSchema = z.enum(['full', 'gen', 'special', 'mega', 'types']);
export const modeSchema = z.enum(['chaos', 'normal', 'order']);
export const regionBoxSchema = z.enum([
  'alola',
  'areazero',
  'galar',
  'gmax',
  'hisui',
  'hoenn',
  'hoennmega',
  'hyperspace',
  'johto',
  'kalos',
  'kalosmega',
  'kanto',
  'lumiose',
  'paldea',
  'pokemongo',
  'sinnoh',
  'unova',
]);
export const typeSchema = z.enum([
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
]);
export const specialTypeSchema = z.enum(['no', 'sublegendary', 'legendary', 'mythical', 'ultrabeast', 'paradox']);
export const languageSchema = z.enum(['cn', 'de', 'en', 'fr', 'ja', 'ko', 'zh']);
export const generationSchema = z.enum(['gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6', 'gen7', 'gen8', 'gen9']);
export const gameSelectionStateSchema = z
  .enum(['new', 'gen', 'types', 'special', 'challenge', 'challengeSetup', 'createRoom'])
  .nullable();
export const challengeModeSchema = z.enum(['free', 'challenge']);
