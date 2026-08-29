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
  runTransaction,
} from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed, ref as vueRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { realtimeDb } from '@/firebase.ts';
import { parseRoomListing, parseOwnerState } from '@/schemas/room.schema.ts';
import { useMessages } from '@/stores/useMessages.ts';
import type {
  SaveData,
  OwnerState,
  RoomEvent,
  UserSnapshot,
  RoomInfo,
  RoomConnectionOutcome,
  RoomOwnerOutcome,
} from '@/types.ts';

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
  const ownerOnline = vueRef(false);

  // Listeners callbacks
  let unsubscribeCallbacks: (() => void)[] = [];
  // Current listener generation
  let currentGeneration = 0;
  // Current owner state revision
  let currentRevision = 0;
  // Owner set queue
  let savingQueue = Promise.resolve();
  let hasReportedSaveError = false;

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
  const setOwnerId: () => Promise<{
    ownerId: string | null;
    outcome: RoomOwnerOutcome;
  }> = async () => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return { outcome: 'failed', ownerId: null };
    }

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);
    let outcome: RoomOwnerOutcome = 'failed';

    // Update the ownerId in a transaction
    const newOwner = await runTransaction(ownerIdRef, (currentOwnerId) => {
      if (currentOwnerId === null) {
        outcome = 'created';
        return auth.currentUser?.uid;
      }

      // Only update if it doesnt exist, dont take ownership of other rooms!
      if (currentOwnerId !== auth.currentUser?.uid) {
        outcome = 'occupied';
        return; // Abort the transaction
      }

      outcome = 'alreadyOwner';
      return currentOwnerId;
    });

    const ownerValue = newOwner.snapshot.val();
    const newOwnerId = typeof ownerValue === 'string' ? ownerValue : null;

    return {
      outcome,
      ownerId: newOwnerId,
    };
  };

  const listenToOwner = async (generation: number) => {
    if (!roomState.room) return;

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);

    const unsubscribe = onValue(ownerIdRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const ownerId = snapshot.val();

      if (ownerId) {
        roomState.ownerId = ownerId;
        ownerOnline.value = true;
      } else {
        roomState.ownerId = null;
        ownerOnline.value = false;
      }
    });

    unsubscribeCallbacks.push(unsubscribe);
  };

  // endregion

  // region Room Management

  const setRoom = (roomId: string) => {
    roomState.room = roomId ?? 'Untitled';
  };

  const createRoom = async (roomId: string): Promise<RoomConnectionOutcome> => {
    // Make sure we can own the room before creating and sending state
    const { outcome, ownerId } = await setOwnerId();
    let roomConnectionOutcome: RoomConnectionOutcome = 'failed';

    if (outcome === 'created') {
      const createdAtRef = ref(realtimeDb, `rooms/${roomId}/createdAt`);
      await set(createdAtRef, serverTimestamp());
      showUserMessage(t('createdRoom', { roomId }));

      currentRevision = 0;
      // The owner publishes the initial state once the room exists.
      await sendState();

      ownerOnline.value = true;
      roomConnectionOutcome = 'created';
    } else if (outcome === 'alreadyOwner' && ownerId) {
      roomConnectionOutcome = await resumeRoom(roomId, ownerId);
    } else if (outcome === 'occupied' && ownerId) {
      roomConnectionOutcome = await joinRoom(roomId, ownerId);
    } else {
      showUserMessage(t('userNotAuthenticated'), 'error');
    }

    roomState.ownerId = ownerId;
    return roomConnectionOutcome;
  };

  const joinRoom = async (roomId: string, userId: string): Promise<RoomConnectionOutcome> => {
    // Validate ownerState before joining
    const ownerState = await getOwnerState();
    if (!ownerState || !hasValidOwnerState(ownerState)) {
      stopListening({ notify: false });
      showUserMessage(t('disconnected', { roomId }), 'warning');
      return 'invalid';
    }

    roomState.ownerId = userId;
    showUserMessage(t('joinedRoom', { roomId }));
    return 'joined';
  };

  const resumeRoom = async (roomId: string, userId: string): Promise<RoomConnectionOutcome> => {
    // Validate ownerState before resuming
    const ownerState = await getOwnerState();
    if (!ownerState || !hasValidOwnerState(ownerState)) {
      stopListening({ notify: false });
      showUserMessage(t('disconnected', { roomId }), 'warning');
      return 'invalid';
    }

    // Apply the owner's state to the current user's state
    const { applyPartialState } = useSavedData();
    applyPartialState(ownerState);

    // Update the current revision to match the owner's revision
    currentRevision = ownerState.revision;

    roomState.ownerId = userId;
    ownerOnline.value = true;
    showUserMessage(t('joinedRoom', { roomId }));
    return 'resumed';
  };

  const connectToRoom = async (roomId: string, userId: string): Promise<RoomConnectionOutcome> => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return 'failed';
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
    let outcome: RoomConnectionOutcome;

    // If the room doesn't exist, create it and set the ownerId. If it does exist, just join it.
    if (!ownerId) {
      outcome = await createRoom(roomId);
    } else if (ownerId === userId) {
      outcome = await resumeRoom(roomId, userId);
    } else {
      outcome = await joinRoom(roomId, ownerId);
    }

    if (outcome === 'failed' || outcome === 'invalid') {
      return outcome;
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
    return outcome;
  };

  const joinOrCreateRoom = async (roomId: string, userId: string): Promise<RoomConnectionOutcome> => {
    isJoining.value = true;
    let outcome: RoomConnectionOutcome;

    try {
      outcome = await connectToRoom(roomId, userId);
    } finally {
      isJoining.value = false;
    }

    return outcome;
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

    ownerOnline.value = false;

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

    stopListening({ notify: false });

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

      if (user && user.username && snapshot.key !== auth.currentUser?.uid) {
        showUserMessage(`User ${user.username} joined room ${roomState.room}`);
        await saveOwnerState();
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };
  // endregion

  // region State Management
  const saveOwnerState = async () => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    if (!roomState.room || !roomState.isActive) return;

    const ownerId = await getOwnerId();
    // Broadcast the current state to the new user if we are the owner
    if (ownerId === auth.currentUser?.uid) {
      await sendState();
    }
  };

  const hasValidOwnerState = (state: OwnerState): boolean => {
    const isValid = parseOwnerState(state);
    return isValid.success;
  };

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
      revision: currentRevision,
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

  const getOwnerState = async (): Promise<OwnerState | null> => {
    if (!roomState.room) return null;

    const stateRef = ref(realtimeDb, `rooms/${roomState.room}/ownerState`);
    const snapshot = await get(stateRef);

    return snapshot.exists() ? (snapshot.val() as OwnerState) : null;
  };

  /** Send the current state to the room. Only the owner can send state. */
  const sendState = async () => {
    const { auth } = useFirebase();
    const { getSavedState } = useSavedData();
    const roomId = roomState.room;
    const generation = currentGeneration;
    if (!roomId) return;

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

    const stateRef = ref(realtimeDb, `rooms/${roomId}/ownerState`);

    // Use a promise queue to ensure that concurrent calls to sendState are executed in order
    const writePromise = savingQueue.then(async () => {
      // Do not let a queued write from an old room affect the current room.
      if (!isCurrentListener(generation, roomId)) return;

      try {
        await set(stateRef, {
          ...ownerState,
          revision: ++currentRevision,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.uid,
        });
        hasReportedSaveError = false;
      } catch (error) {
        if (!hasReportedSaveError) {
          hasReportedSaveError = true;
          const message = error instanceof Error ? error.message : String(error);
          showUserMessage(t('firebaseError', { error: message }), 'error');
        }
        throw error;
      }
    });

    // Recover the queue for future writes without hiding this write's failure.
    savingQueue = writePromise.catch(() => undefined);
    await writePromise;
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

      if (!state || !hasValidOwnerState(state)) {
        const roomId = roomState.room;
        stopListening({ notify: false });
        showUserMessage(`Room ${roomId} state is invalid or missing. You have been disconnected.`, 'warning');
        return;
      }

      if (state) {
        showUserMessage(`Room ${roomState.room} state updated`);
        // Here you can update the local state with the new ownerState
        applyPartialState(state);
      }

      // Unsubscribe upon applying
      unsubscribe();
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
        stopListening({});
        break;
      case 'disconnect':
        // Handle disconnect event
        stopListening({});
        break;
      default:
        // Handle unknown event
        break;
    }
  };

  // endregion

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

  const stopListening = ({ notify = true }: { notify?: boolean }) => {
    if (!roomState.room) return;

    clearListeners();
    cancelPresence();
    currentGeneration += 1;

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;
    ownerOnline.value = false;

    if (notify) {
      showUserMessage(t('disconnected'), 'warning');
    }
  };

  return {
    destroyRoom,
    getRecentRooms,
    isJoiner,
    isJoining,
    isOwner,
    joinOrCreateRoom,
    leaveRoom,
    listenToRecentRooms,
    ownerOnline,
    roomState,
    saveOwnerState,
    sendEvent,
    sendMessage,
    sendState,
    setRoom,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRooms, import.meta.hot));
}
