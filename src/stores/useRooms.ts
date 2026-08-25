import {
  ref,
  set,
  get,
  onDisconnect,
  serverTimestamp,
  onChildAdded,
  push,
  remove,
  onValue,
  query,
  orderByChild,
  DataSnapshot,
  limitToLast,
  type DatabaseReference,
} from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed, ref as vueRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { realtimeDb } from '@/firebase.ts';
import { parseRoomListing } from '@/schemas/room.schema.ts';
import { useMessages } from '@/stores/useMessages.ts';
import type { SaveData, OwnerState, RoomEvent, UserSnapshot, RoomInfo } from '@/types.ts';

interface RoomMessagesState {
  ownerId: string | null;
  room: string | null;
  isActive: boolean;
}

export const useRooms = defineStore('roomMessages', () => {
  const { showUserMessage } = useMessages();
  const { t } = useI18n();
  const { auth } = useFirebase();

  const roomState = reactive<RoomMessagesState>({
    isActive: false,
    ownerId: null,
    room: null,
  });

  const isJoining = vueRef(false);

  let unsubscribeCallbacks: (() => void)[] = [];
  let currentGeneration = 0;

  let presenceRef: DatabaseReference | null = null;

  /** Clear all listeners and unsubscribe callbacks. */
  const clearListeners = () => {
    unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    unsubscribeCallbacks = [];
  };

  const cancelPresence = () => {
    if (!presenceRef) return;

    onDisconnect(presenceRef).cancel();
    presenceRef = null;
  };

  /**
   * Supplementary check to avoid calling listeners more than once per room by keeping a generation counter. This is
   * necessary because Firebase listeners can sometimes be called multiple times for the same event, especially when
   * switching rooms or reconnecting.
   */
  const isCurrentListener = (generation: number, room: string) => {
    if (!roomState.isActive) return false;

    if (generation !== currentGeneration) return false;

    return room === roomState.room;
  };

  // region Owner Management
  const isOwner = computed(() => {
    // Don't check if we're not in multi mode or unauthenticated.
    if (!auth.currentUser) return true;

    if (!roomState.room) return true;

    return auth.currentUser.uid === roomState.ownerId;
  });

  const isJoiner = computed(() => roomState.isActive && !isOwner.value);

  /** Get the ownerId of the room. If the room doesn't exist, it will return null. */
  const getOwnerId = async (): Promise<string | null> => {
    if (!roomState.room) return null;

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);
    const snapshot = await get(ownerIdRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  };

  /** Assigns the ownerId. Only the owner can send state. */
  const setOwnerId = async () => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);
    const ownerId = await getOwnerId();

    if (ownerId !== null && ownerId !== auth.currentUser.uid) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    await set(ownerIdRef, auth.currentUser.uid);
  };

  const listenToOwner = async (generation: number) => {
    if (!roomState.room) return;

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);

    const unsubscribe = onValue(ownerIdRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const ownerId = snapshot.val();

      if (ownerId) {
        roomState.ownerId = ownerId;
      } else {
        roomState.ownerId = null;
      }
    });

    unsubscribeCallbacks.push(unsubscribe);
  };

  // endregion

  // region Room Management

  const setRoom = (roomId: string) => {
    roomState.room = roomId ?? 'Untitled';
  };

  const createRoom = async (roomId: string, userId: string) => {
    roomState.ownerId = userId;
    await setOwnerId();

    const createdAtRef = ref(realtimeDb, `rooms/${roomId}/createdAt`);
    await set(createdAtRef, serverTimestamp());

    showUserMessage(t('createdRoom', { roomId }));

    // The owner publishes the initial state once the room exists.
    sendState();
  };

  const joinRoom = (roomId: string) => {
    showUserMessage(t('joinedRoom', { roomId }));
  };

  const resumeRoom = async (roomId: string, userId: string) => {
    roomState.ownerId = userId;
    showUserMessage(t('joinedRoom', { roomId }));
  };

  const connectToRoom = async (roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    // Force cleanup of previous session
    clearListeners();
    cancelPresence();
    currentGeneration += 1;

    roomState.room = roomId;
    roomState.isActive = true;

    // Keep the reference of the presence ref in the store.
    const currentPresenceRef = ref(realtimeDb, `rooms/${roomId}/active_users/${userId}`);
    presenceRef = currentPresenceRef;

    const ownerId = await getOwnerId();

    // If the room doesn't exist, create it and set the ownerId. If it does exist, just join it.
    if (!ownerId) {
      await createRoom(roomId, userId);
    } else if (ownerId === userId) {
      await resumeRoom(roomId, userId);
    } else {
      joinRoom(roomId);
    }

    set(currentPresenceRef, {
      updatedAt: serverTimestamp(),
      username: auth.currentUser.displayName,
    });

    // Start listening
    listenToOwner(currentGeneration);
    listenToMessages(currentGeneration);
    listenToJoins(currentGeneration);
    listenToEvents(currentGeneration);

    if (roomState.ownerId !== auth.currentUser.uid) {
      listenToState(currentGeneration);
    }

    onDisconnect(currentPresenceRef).remove();
  };

  const joinOrCreateRoom = async (roomId: string, userId: string) => {
    isJoining.value = true;

    try {
      await connectToRoom(roomId, userId);
    } finally {
      isJoining.value = false;
    }
  };

  const leaveRoom = async (userId: string) => {
    if (!roomState.room) return;

    const currentPresenceRef = ref(realtimeDb, `rooms/${roomState.room}/active_users/${userId}`);
    await remove(currentPresenceRef);

    clearListeners();
    cancelPresence();
    currentGeneration += 1;

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;

    showUserMessage(t('leftRoom', { roomId: roomState.room }));
  };

  const destroyRoom = async () => {
    if (!roomState.room) return;

    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const ownerId = await getOwnerId();
    if (ownerId !== auth.currentUser.uid) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    await sendEvent('disconnect');

    const roomRef = ref(realtimeDb, `rooms/${roomState.room}`);
    await remove(roomRef);

    stopListening(false);

    showUserMessage(t('destroyedRoom', { roomId: roomState.room }));
  };

  const listenToJoins = (generation: number) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    if (!roomState.room) return;
    const activeUsersRef = ref(realtimeDb, `rooms/${roomState.room}/active_users`);

    const unsubscribe = onChildAdded(activeUsersRef, async (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const user = snapshot.val() as UserSnapshot;
      const ownerId = await getOwnerId();

      if (user && user.username && snapshot.key !== auth.currentUser?.uid) {
        showUserMessage(`User ${user.username} joined room ${roomState.room}`);

        // Broadcast the current state to the new user if we are the owner
        if (ownerId === auth.currentUser?.uid) {
          sendState();
        }
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };
  // endregion

  // region State Management
  const toOwnerState = (savedState: SaveData): OwnerState => {
    return {
      currentBox: savedState.currentBox,
      currentMegaBox: savedState.currentMegaBox,
      currentSpecialBox: savedState.currentSpecialBox,
      currentType: savedState.currentType,
      currentTypes: savedState.currentTypes,
      gameMode: savedState.gameMode,
      gens: savedState.gens,
      mode: savedState.mode,
      pokemonProgress: savedState.pokemonProgress,
      score: savedState.score,
      sessionId: savedState.sessionId,
      skipScore: savedState.skipScore,
      skips: savedState.skips,
      timer: savedState.timer,
      types: savedState.types,
      version: savedState.version,
      withBoxShuffle: savedState.withBoxShuffle,
      withCriesShuffle: savedState.withCriesShuffle,
      withShadows: savedState.withShadows,
      withTypeShuffle: savedState.withTypeShuffle,
    };
  };

  /** Send the current state to the room. Only the owner can send state. */
  const sendState = async () => {
    const { auth } = useFirebase();
    const { getSavedState } = useSavedData();
    if (!roomState.room) return;

    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    // We also need to check in the db
    const ownerId = await getOwnerId();
    if (ownerId !== null && ownerId !== auth.currentUser.uid) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    const ownerState = toOwnerState(getSavedState());

    const stateRef = ref(realtimeDb, `rooms/${roomState.room}/ownerState`);
    await set(stateRef, {
      ...ownerState,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid,
    });
  };

  /** Listen to state changes in the room. This is both "resume game" and "sync state" for new users joining the room */
  const listenToState = (generation: number) => {
    const { applyPartialState } = useSavedData();
    if (!roomState.room) return;

    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const stateRef = ref(realtimeDb, `rooms/${roomState.room}/ownerState`);

    // Fetch state from firebase - this is both "resume game" and "sync state" for new users joining the room
    const unsubscribe = onValue(stateRef, async (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const state = snapshot.val() as OwnerState;

      if (state) {
        showUserMessage(`Room ${roomState.room} state updated`);
        // Here you can update the local state with the new ownerState
        applyPartialState(state);
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };
  // endregion

  // region Messages
  /** Broadcast a message to the room. The message will be deleted immediately after being sent */
  const sendMessage = async (message: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      message,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    // Delete immediately. The dispatch is already done!
    await remove(newMessageRef);
  };

  /** Listen to messages (e.g. the pokemon found) */
  const listenToMessages = (generation: number) => {
    if (!roomState.room) return;
    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      showUserMessage(`New message in room ${roomState.room}`);
      const messages = snapshot.val();

      if (messages) {
        showUserMessage(`New message in room ${roomState.room}: ${messages.message}`);
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };

  // endregion

  // region Events
  const sendEvent = async (event: RoomEvent) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    // We also need to check in the db
    const ownerId = await getOwnerId();
    if (ownerId !== null && ownerId !== auth.currentUser.uid) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    const eventsRef = ref(realtimeDb, `rooms/${roomState.room}/events`);
    const newEventRef = push(eventsRef);

    await set(newEventRef, {
      event,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    await remove(newEventRef);
  };

  const listenToEvents = (generation: number) => {
    if (!roomState.room) return;
    const eventsRef = ref(realtimeDb, `rooms/${roomState.room}/events`);

    const unsubscribe = onChildAdded(eventsRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const event = snapshot.val();
      if (event) {
        showUserMessage(`New event in room ${roomState.room}: ${event.event}`);
        // Here you can handle the event as needed
        handleEvent(event);
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };

  const handleEvent = (event: RoomEvent) => {
    switch (event) {
      case 'gamePaused':
        // Handle game paused event
        break;
      case 'gameEnded':
        // Handle game ended event
        stopListening();
        break;
      case 'disconnect':
        // Handle disconnect event
        stopListening();
        break;
      default:
        // Handle unknown event
        break;
    }
  };

  // endregion

  const stopListening = (notify = true) => {
    if (!roomState.room) return;

    clearListeners();
    cancelPresence();
    currentGeneration += 1;

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;

    if (notify) {
      showUserMessage(t('disconnected'), 'warning');
    }
  };

  // region Recent Rooms
  const fetchRecentRooms = async (snapshot: DataSnapshot) => {
    const rooms: RoomInfo[] = [];

    snapshot.forEach((childSnapshot) => {
      if (!childSnapshot.key) return;

      const parsedRoom = parseRoomListing(childSnapshot.val());
      if (!parsedRoom.success) return;

      const { active_users: activeUsers, name } = parsedRoom.data;

      rooms.unshift({
        createdAt: parsedRoom.data.createdAt,
        id: childSnapshot.key,
        name: name || childSnapshot.key,
        userCount: activeUsers ? Object.keys(activeUsers).length : 0,
      });
    });

    return rooms.slice(-5);
  };

  /** Fetch the 5 most recently created rooms. */
  const getRecentRooms = async (): Promise<RoomInfo[]> => {
    const roomsQuery = query(ref(realtimeDb, 'rooms'), orderByChild('createdAt'), limitToLast(30));
    const snapshot = await get(roomsQuery);

    return fetchRecentRooms(snapshot);
  };

  /** Listen to the 5 most recently created rooms in real time. Returns an unsubscribe function. */
  const listenToRecentRooms = (callback: (rooms: RoomInfo[]) => void): (() => void) => {
    const roomsQuery = query(ref(realtimeDb, 'rooms'), orderByChild('createdAt'), limitToLast(5));

    return onValue(roomsQuery, async (snapshot) => {
      const rooms = await fetchRecentRooms(snapshot);

      callback(rooms);
    });
  };
  // endregion

  return {
    destroyRoom,
    getRecentRooms,
    isJoiner,
    isJoining,
    isOwner,
    joinOrCreateRoom,
    leaveRoom,
    listenToRecentRooms,
    roomState,
    sendEvent,
    sendMessage,
    sendState,
    setRoom,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRooms, import.meta.hot));
}
