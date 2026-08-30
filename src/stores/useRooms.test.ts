import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  describe('destroyRoom', () => {
    it('does nothing and shows no warning when room is not active', () => {
      const store = useRooms();
      store.setRoom('my-room');
      expect(store.roomState.room).toBe('my-room');
      expect(store.roomState.isActive).toBe(false);
      expect(store.roomState.ownerId).toBeNull();

      store.destroyRoom();

      expect(mockShowUserMessage).not.toHaveBeenCalled();
    });

    it('shows warning when room is active but caller is not the owner', () => {
      const store = useRooms();
      store.setRoom('my-room');
      store.roomState.isActive = true;
      store.roomState.ownerId = 'other-user';

      store.destroyRoom();

      expect(mockShowUserMessage).toHaveBeenCalledWith('notRoomOwner', 'warning');
    });

    it('resets state and detaches when room is active and caller is the owner', () => {
      const store = useRooms();
      store.setRoom('my-room');
      store.roomState.isActive = true;
      store.roomState.ownerId = 'user-123';

      store.destroyRoom();

      expect(store.roomState.room).toBeNull();
      expect(store.roomState.isActive).toBe(false);
      expect(store.roomState.ownerId).toBeNull();
    });
  });
});
