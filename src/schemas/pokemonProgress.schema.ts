import { z } from 'zod';

const pokemonFoundEntrySchema = z.object({
  id: z.string().min(1),
  lastFoundAt: z.number().nullable(),
});

const pokemonShadowedEntrySchema = z.object({
  id: z.string().min(1),
  lastShadowedAt: z.number().nullable(),
});

const shinyPokemonEntrySchema = z.object({
  id: z.string().min(1),
});

export const pokemonProgressSchema = z.object({
  pokemonFound: z.array(pokemonFoundEntrySchema).default([]),
  pokemonShadowed: z.array(pokemonShadowedEntrySchema).default([]),
  shinyPokemon: z.array(shinyPokemonEntrySchema).default([]),
});
