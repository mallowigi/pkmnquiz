import { z } from 'zod';

import { saveDataBaseSchema } from '@/schemas/saveData.schema.ts';

/** Resumable gameplay state shared through the room handshake. */
export const ownerStateSchema = saveDataBaseSchema
  .pick({
    currentBox: true,
    currentMegaBox: true,
    currentSpecialBox: true,
    currentType: true,
    currentTypes: true,
    gameMode: true,
    gens: true,
    mode: true,
    pokemonProgress: true,
    score: true,
    sessionId: true,
    skipScore: true,
    skips: true,
    timer: true,
    types: true,
    version: true,
    withBoxShuffle: true,
    withCriesShuffle: true,
    withShadows: true,
    withTypeShuffle: true,
  })
  .extend({
    revision: z.number().int().nonnegative(),
    updatedAt: z.number().nullish(),
    updatedBy: z.string().nullish(),
  });

export const roomMetadataSchema = z.object({
  createdAt: z.number(),
  lastActivityAt: z.number(),
  ownerId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  updatedAt: z.number(),
  updatedBy: z.string().min(1),
});

/** Room state and transport metadata are deliberately separate payloads. */
export const roomEnvelopeSchema = z.object({
  metadata: roomMetadataSchema,
  state: ownerStateSchema,
});

/** Current flat room shape used by the recent-room directory. */
export const roomListingSchema = z.object({
  active_users: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.number(),
  name: z.string().optional(),
  ownerId: z.string().min(1),
  ownerState: ownerStateSchema,
});

export const roomEventSchema = z.enum(['gamePaused', 'gameEnded', 'disconnect']);

export const eventSnapshotSchema = z.object({
  event: roomEventSchema,
  senderId: z.string().min(1),
  timestamp: z.number(),
});

export const parseOwnerState = (input: unknown) => ownerStateSchema.safeParse(input);
export const parseRoomEnvelope = (input: unknown) => roomEnvelopeSchema.safeParse(input);
export const parseRoomListing = (input: unknown) => roomListingSchema.safeParse(input);
export const parseEventSnapshot = (input: unknown) => eventSnapshotSchema.safeParse(input);
