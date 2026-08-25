import { describe, expect, it } from 'vitest';

import { parseEventSnapshot, parseOwnerState, parseRoomEnvelope, parseRoomListing } from '@/schemas/room.schema.ts';

const ownerState = {
  currentBox: null,
  currentMegaBox: null,
  currentSpecialBox: null,
  currentType: null,
  currentTypes: [],
  gameMode: 'gen' as const,
  gens: ['gen1' as const],
  mode: 'normal' as const,
  pokemonProgress: {
    pokemonFound: [],
    pokemonShadowed: [],
    shinyPokemon: [],
  },
  score: 0,
  sessionId: 'session-1',
  skipScore: 0,
  skips: 0,
  timer: {
    elapsed: 0,
    isLimited: false,
    minutes: 35,
    savedAt: null,
    startTime: null,
  },
  types: [],
  version: 1 as const,
  withBoxShuffle: false,
  withCriesShuffle: false,
  withShadows: false,
  withTypeShuffle: false,
};

const roomEnvelope = {
  metadata: {
    createdAt: 100,
    lastActivityAt: 200,
    ownerId: 'owner-1',
    revision: 1,
    updatedAt: 200,
    updatedBy: 'owner-1',
  },
  state: ownerState,
};

const roomListing = {
  active_users: {
    'user-1': { username: 'Ash' },
  },
  createdAt: 100,
  name: 'room-1',
  ownerId: 'owner-1',
  ownerState,
};

describe('room schemas', () => {
  it('accepts a resumable owner state and room envelope', () => {
    expect(parseOwnerState(ownerState).success).toBe(true);
    expect(parseRoomEnvelope(roomEnvelope).success).toBe(true);
    expect(parseRoomListing(roomListing).success).toBe(true);
  });

  it('rejects invalid room configuration and metadata', () => {
    expect(parseOwnerState({ ...ownerState, gameMode: 'unsupported' }).success).toBe(false);
    expect(parseOwnerState({ ...ownerState, sessionId: '' }).success).toBe(false);
    expect(parseRoomEnvelope({ ...roomEnvelope, metadata: { ...roomEnvelope.metadata, revision: -1 } }).success).toBe(
      false,
    );
    expect(parseRoomListing({ ...roomListing, ownerState: { ...ownerState, gameMode: 'unsupported' } }).success).toBe(
      false,
    );
  });

  it('accepts valid event snapshots and rejects unknown events', () => {
    expect(parseEventSnapshot({ event: 'disconnect', senderId: 'owner-1', timestamp: 100 }).success).toBe(true);
    expect(parseEventSnapshot({ event: 'unknown', senderId: 'owner-1', timestamp: 100 }).success).toBe(false);
  });
});
