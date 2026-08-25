import { z } from 'zod';

import { saveDataSchema } from '@/schemas/saveData.schema.ts';

/** Resumable gameplay state shared through the room handshake. */
export const ownerStateSchema = saveDataSchema.pick({
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

export const roomEventSchema = z.enum(['gamePaused', 'gameEnded', 'disconnect']);

export const eventSnapshotSchema = z.object({
  event: roomEventSchema,
  senderId: z.string().min(1),
  timestamp: z.number(),
});

export const parseOwnerState = (input: unknown) => ownerStateSchema.safeParse(input);
export const parseRoomEnvelope = (input: unknown) => roomEnvelopeSchema.safeParse(input);
export const parseEventSnapshot = (input: unknown) => eventSnapshotSchema.safeParse(input);
