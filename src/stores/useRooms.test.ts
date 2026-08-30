import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get, onValue } from 'firebase/database';

const { mockAuth, mockShowUserMessage } = vi.hoisted(() => ({
  mockAuth: {
    currentUser: { uid: 'user-123' } as { uid: string } | null,
  },
  mockShowUserMessage: vi.fn(),
}));

vi.mock('@/firebase.ts', () => ({
  auth: mockAuth,
  db: {},
  default: {},
  realtimeDb: {},
}));

vi.mock('@/composables/useFirebase.ts', () => ({
  useFirebase: () => ({
    auth: mockAuth,
    realtimeDb: {},
  }),
}));

vi.mock('@/stores/useMessages.ts', () => ({
  useMessages: () => ({
    showUserMessage: mockShowUserMessage,
  }),
}));

vi.mock('@/main.ts', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

vi.mock('@/composables/useSavedData.ts', () => ({
  useSavedData: () => ({
    getSavedState: vi.fn(),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => `${key}${params ? JSON.stringify(params) : ''}`,
  }),
}));

vi.mock('firebase/database', () => ({
  get: vi.fn(),
  limitToLast: vi.fn(),
  onChildAdded: vi.fn(() => vi.fn()),
  onDisconnect: vi.fn(() => ({
    cancel: vi.fn(),
    remove: vi.fn(),
  })),
  onValue: vi.fn(() => vi.fn()),
  orderByChild: vi.fn(),
  push: vi.fn(),
  query: vi.fn(),
  ref: vi.fn((_db, path) => ({ path })),
  remove: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(),
  set: vi.fn(),
}));

import { useRooms } from '@/stores/useRooms.ts';

describe('useRooms', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockShowUserMessage.mockClear();
    mockAuth.currentUser = { uid: 'user-123' };
  });

  describe('isOwner', () => {
    it('returns true when room is not set', () => {
      const store = useRooms();
      expect(store.isOwner).toBe(true);
    });

    it('returns true when room name is set during setup but room is not active yet', () => {
      const store = useRooms();
      store.setRoom('my-room');
      expect(store.roomState.room).toBe('my-room');
      expect(store.roomState.isActive).toBe(false);
      expect(store.isOwner).toBe(true);
    });

    it('returns true when room is active and currentUser matches ownerId', () => {
      const store = useRooms();
      store.setRoom('my-room');
      store.roomState.isActive = true;
      store.roomState.ownerId = 'user-123';
      expect(store.isOwner).toBe(true);
      expect(store.isJoiner).toBe(false);
    });

    it('returns false when room is active and currentUser does not match ownerId', () => {
      const store = useRooms();
      store.setRoom('my-room');
      store.roomState.isActive = true;
      store.roomState.ownerId = 'other-user';
      expect(store.isOwner).toBe(false);
      expect(store.isJoiner).toBe(true);
    });
  });

  describe('getOwnerIdForRoom', () => {
    it('returns ownerId when room exists in database', async () => {
      const store = useRooms();
      vi.mocked(get).mockResolvedValueOnce({
        exists: () => true,
        val: () => 'owner-456',
      } as any);

      const ownerId = await store.getOwnerIdForRoom('my-room');
      expect(ownerId).toBe('owner-456');
    });

    it('returns null when room does not exist in database', async () => {
      const store = useRooms();
      vi.mocked(get).mockResolvedValueOnce({
        exists: () => false,
        val: () => null,
      } as any);

      const ownerId = await store.getOwnerIdForRoom('non-existent');
      expect(ownerId).toBeNull();
    });
  });

  describe('recent rooms', () => {
    const validOwnerState = {
      currentBox: null,
      currentMegaBox: null,
      currentSpecialBox: null,
      currentType: null,
      currentTypes: [],
      gameMode: 'gen' as const,
      gens: ['gen1' as const],
      mode: 'normal' as const,
      revision: 0,
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

    it('orders rooms newest-first and limits to 5', async () => {
      const store = useRooms();
      const mockRooms = [1, 2, 3, 4, 5, 6].map((i) => ({
        key: `room-${i}`,
        val: () => ({
          active_users: { [`user-${i}`]: { username: `User${i}` } },
          createdAt: 1000 + i * 10,
          name: `Room ${i}`,
          ownerId: `owner-${i}`,
          ownerState: validOwnerState,
        }),
      }));

      vi.mocked(get).mockResolvedValueOnce({
        forEach: (cb: (item: any) => void) => mockRooms.forEach(cb),
      } as any);

      const recentRooms = await store.getRecentRooms();
      expect(recentRooms).toHaveLength(5);
      expect(recentRooms[0].id).toBe('room-6');
      expect(recentRooms[0].name).toBe('Room 6');
      expect(recentRooms[4].id).toBe('room-2');
    });

    it('filters out invalid rooms silently', async () => {
      const store = useRooms();
      const mockRooms = [
        {
          key: 'room-valid',
          val: () => ({
            active_users: { 'user-1': { username: 'User1' } },
            createdAt: 1000,
            name: 'Valid Room',
            ownerId: 'owner-1',
            ownerState: validOwnerState,
          }),
        },
        {
          key: 'room-invalid',
          val: () => ({
            createdAt: 2000,
            name: 'Invalid Room',
            ownerId: 'owner-2',
            ownerState: { ...validOwnerState, gameMode: 'invalid' },
          }),
        },
      ];

      vi.mocked(get).mockResolvedValueOnce({
        forEach: (cb: (item: any) => void) => mockRooms.forEach(cb),
      } as any);

      const recentRooms = await store.getRecentRooms();
      expect(recentRooms).toHaveLength(1);
      expect(recentRooms[0].id).toBe('room-valid');
    });
  });

  describe('joining room', () => {
    const validOwnerState = {
      currentBox: null,
      currentMegaBox: null,
      currentSpecialBox: null,
      currentType: null,
      currentTypes: [],
      gameMode: 'gen' as const,
      gens: ['gen1' as const],
      mode: 'normal' as const,
      revision: 0,
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

    it('sets ownerId and ownerOnline to true when joining an existing room', async () => {
      const store = useRooms();
      vi.mocked(get).mockImplementation(async (reference: any) => {
        if (reference.path === 'rooms/my-room/ownerId') {
          return {
            exists: () => true,
            val: () => 'owner-456',
          } as any;
        }
        if (reference.path === 'rooms/my-room/ownerState') {
          return {
            exists: () => true,
            val: () => validOwnerState,
          } as any;
        }
        return {
          exists: () => false,
          val: () => null,
        } as any;
      });

      const outcome = await store.joinOrCreateRoom('my-room', 'user-123');

      expect(outcome).toBe('joined');
      expect(store.roomState.isActive).toBe(true);
      expect(store.roomState.ownerId).toBe('owner-456');
      expect(store.ownerOnline).toBe(true);
      expect(store.isJoiner).toBe(true);
      expect(store.isOwner).toBe(false);
      expect(store.roomTerminated).toBe(false);
    });
  });
});
