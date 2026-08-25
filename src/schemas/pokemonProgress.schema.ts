import { z } from 'zod';

const pokemonFoundEntrySchema = z.object({
  id: z.string().min(1),
  lastFoundAt: z.number().nullish(),
});

const pokemonShadowedEntrySchema = z.object({
  id: z.string().min(1),
  lastShadowedAt: z.number().nullish(),
});

const shinyPokemonEntrySchema = z.object({
  id: z.string().min(1),
});

export const pokemonProgressSchema = z.object({
  pokemonFound: z.array(pokemonFoundEntrySchema),
  pokemonShadowed: z.array(pokemonShadowedEntrySchema),
  shinyPokemon: z.array(shinyPokemonEntrySchema),
});
