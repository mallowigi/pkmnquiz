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
  update,
  type DatabaseReference,
  runTransaction,
  onChildRemoved,
} from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed, ref as vueRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { realtimeDb } from '@/firebase.ts';
import { parseRoomListing, parseOwnerState } from '@/schemas/room.schema.ts';
import { useMessages } from '@/stores/useMessages.ts';
import { usePokemons } from '@/stores/usePokemons.ts';
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
  const { showUserMessage, showDebugMessage } = useMessages();
  const { t } = useI18n();
  const { auth } = useFirebase();

  const roomState = reactive<RoomMessagesState>({
    isActive: false,
    ownerId: null,
    room: null,
  });

  const activeUsers = new Set<string>();

  // Communicate to the UI that the user is in the process of joining a room.
  const isJoining = vueRef(false);
  // Communicate the owner online status to the UI.
  const ownerOnline = vueRef(false);
  // Communicate to the UI that the room has been terminated (e.g. by the owner)
  const roomTerminated = vueRef(false);

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
  let presenceCallback: (() => void) | null = null;

  /** Clear all listeners and unsubscribe callbacks. */
  const clearListeners = () => {
    unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    unsubscribeCallbacks = [];
  };

  const cancelPresence = () => {
    presenceCallback?.();
    presenceCallback = null;

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

  const fetchActiveUsers = async (roomId: string) => {
    if (!roomState.isActive) return;

    activeUsers.clear();

    const activeUsersRef = ref(realtimeDb, `rooms/${roomId}/active_users`);
    const snapshot = await get(activeUsersRef);

    if (snapshot.exists()) {
      const currentUsers = snapshot.val() as Record<string, UserSnapshot>;
      Object.keys(currentUsers).forEach((userId) => activeUsers.add(userId));
    }
  };

  // region Owner Management
  const isOwner = computed(() => {
    const { auth } = useFirebase();
    // Don't check if we're not in multi mode or unauthenticated.
    if (!auth.currentUser) return true;

    if (!roomState.room || !roomState.isActive) return true;

    return auth.currentUser.uid === roomState.ownerId;
  });

  const isJoiner = computed(() => roomState.isActive && !isOwner.value);

  /** Get the ownerId of a room. If the room doesn't exist, it will return null. */
  const getOwnerIdForRoom = async (roomId: string): Promise<string | null> => {
    const ownerIdRef = ref(realtimeDb, `rooms/${roomId}/ownerId`);
    const snapshot = await get(ownerIdRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  };

  const getOwnerId = async (): Promise<string | null> => {
    if (!roomState.room) return null;
    return getOwnerIdForRoom(roomState.room);
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

    // Listen for new owner id and for owner presence changes
    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);

    // Listen to ownerId changes
    const unsubscribeOwnerCallback = onValue(ownerIdRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const ownerId = snapshot.val();

      if (ownerId) {
        roomState.ownerId = ownerId;
        ownerOnline.value = true;
        listenToOwnerPresence(generation, ownerId);
      } else {
        roomState.ownerId = null;
        ownerOnline.value = false;
        // Room is gone
        cancelPresence();
      }
    });

    unsubscribeCallbacks.push(unsubscribeOwnerCallback);
  };

  const listenToOwnerPresence = async (generation: number, ownerId: string) => {
    const ownerPresenceRef = ref(realtimeDb, `rooms/${roomState.room}/active_users/${ownerId}`);

    // Listen to owner presence changes
    void presenceCallback?.(); // Cancel previous presence listener if any
    presenceCallback = onValue(ownerPresenceRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const ownerPresence = snapshot.val();
      ownerOnline.value = !!ownerPresence;
    });
  };

  // endregion

  // region Room Management

  const setRoom = (roomId: string) => {
    roomState.room = roomId ?? 'Untitled';
  };

  const createRoom = async (roomId: string): Promise<RoomConnectionOutcome> => {
    // Make sure we can own the room before creating and sending state
    const { outcome, ownerId } = await setOwnerId();
    roomState.ownerId = ownerId;
    let roomConnectionOutcome: RoomConnectionOutcome = 'failed';

    if (outcome === 'created') {
      await update(ref(realtimeDb, `rooms/${roomId}`), {
        createdAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      });
      showUserMessage(t('createdRoom', { roomId }));

      currentRevision = 0;
      // The owner publishes the initial state once the room exists.
      try {
        await sendState();
      } catch {
        return 'failed';
      }

      ownerOnline.value = true;
      roomConnectionOutcome = 'created';
    } else if (outcome === 'alreadyOwner' && ownerId) {
      roomConnectionOutcome = await resumeRoom(roomId, ownerId);
    } else if (outcome === 'occupied' && ownerId) {
      roomConnectionOutcome = await joinRoom(roomId, ownerId);
    } else {
      showUserMessage(t('userNotAuthenticated'), 'error');
    }

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
    ownerOnline.value = true;
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
    roomTerminated.value = false;

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

    await set(currentPresenceRef, {
      updatedAt: serverTimestamp(),
      username: auth.currentUser.displayName,
    });
    await update(ref(realtimeDb, `rooms/${roomId}`), { lastActivityAt: serverTimestamp() });

    // Get the state of active users before listening
    await fetchActiveUsers(roomId);

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

    try {
      await remove(currentPresenceRef);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      showUserMessage(t('firebaseError', { error: message }), 'error');
    } finally {
      clearListeners();
      cancelPresence();
      currentGeneration += 1;

      const roomId = roomState.room;
      roomState.room = null;
      roomState.ownerId = null;
      roomState.isActive = false;
      ownerOnline.value = false;
      roomTerminated.value = true;

      showDebugMessage(t('leftRoom', { roomId }));
    }
  };

  const destroyRoom = () => {
    if (!roomState.room || !roomState.isActive) return;

    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const roomId = roomState.room;
    const userId = auth.currentUser.uid;
    if (roomState.ownerId !== userId) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    // Detach locally before any asynchronous Firebase work. This prevents a
    // synchronous reset/new-game flow from observing the old room as active.
    currentRevision = 0;
    stopListening({ notify: false });

    // Disconnect asynchronously
    void (async () => await disconnectFromRoom(roomId, userId))();
  };

  const disconnectFromRoom = async (roomId: string, userId: string) => {
    try {
      const ownerId = await getOwnerIdForRoom(roomId);
      if (ownerId !== userId) {
        showUserMessage(t('notRoomOwner'), 'warning');
        return;
      }

      await sendEventForRoom('disconnect', roomId, userId);
      await remove(ref(realtimeDb, `rooms/${roomId}`));
      showUserMessage(t('destroyedRoom', { roomId }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showUserMessage(t('firebaseError', { error: message }), 'error');
    }
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

      // ignore existing users
      if (snapshot.key && activeUsers.has(snapshot.key)) {
        return;
      }

      const user = snapshot.val() as UserSnapshot;

      if (user && user.username && snapshot.key !== auth.currentUser?.uid) {
        showUserMessage(`User ${user.username} joined room ${roomState.room}`);
        activeUsers.add(snapshot.key!);

        await saveOwnerState().catch(() => {
          // sendState reports the persistence failure to the user.
        });
      }
    });

    const unsubscribeLeaves = onChildRemoved(activeUsersRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const user = snapshot.val() as UserSnapshot;

      if (user && user.username && snapshot.key !== auth.currentUser?.uid) {
        showUserMessage(`User ${user.username} left room ${roomState.room}`);
        activeUsers.delete(snapshot.key!);
      }
    });

    unsubscribeCallbacks.push(unsubscribe);
    unsubscribeCallbacks.push(unsubscribeLeaves);
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

    const roomRef = ref(realtimeDb, `rooms/${roomId}`);

    // Use a promise queue to ensure that concurrent calls to sendState are executed in order
    const writePromise = savingQueue.then(async () => {
      // Do not let a queued write from an old room affect the current room.
      if (!isCurrentListener(generation, roomId)) return;

      try {
        await update(roomRef, {
          lastActivityAt: serverTimestamp(),
          ownerState: {
            ...ownerState,
            revision: ++currentRevision,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser?.uid,
          },
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
        showDebugMessage(`Room ${roomId} state is invalid or missing. You have been disconnected.`, 'warning');
        return;
      }

      if (state) {
        showDebugMessage(`Room ${roomState.room} state updated`);
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
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    if (!roomState.room) return;

    const { findPokemon, addFound } = usePokemons();
    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const messages = snapshot.val();

      if (messages && messages.message) {
        // showDebugMessage(`New message in room ${roomState.room}: ${messages.message}`);

        // Add pokemon to all clients
        if (messages.senderId !== auth.currentUser?.uid) {
          const foundPokemon = findPokemon(messages.message);
          if (foundPokemon && foundPokemon.length > 0) {
            addFound(foundPokemon);
          }
        }
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };

  // endregion

  // region Events
  const sendEventForRoom = async (event: RoomEvent, roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    // We also need to check in the db
    const ownerId = await getOwnerIdForRoom(roomId);
    if (ownerId !== null && ownerId !== userId) {
      showUserMessage(t('notRoomOwner'), 'warning');
      return;
    }

    const eventsRef = ref(realtimeDb, `rooms/${roomId}/events`);
    const newEventRef = push(eventsRef);

    await set(newEventRef, {
      event,
      senderId: userId,
      timestamp: serverTimestamp(),
    });

    await remove(newEventRef);
  };

  const sendEvent = async (event: RoomEvent) => {
    const userId = auth.currentUser?.uid;
    if (!roomState.room || !userId) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    await sendEventForRoom(event, roomState.room, userId);
  };

  const listenToEvents = (generation: number) => {
    if (!roomState.room) return;
    const eventsRef = ref(realtimeDb, `rooms/${roomState.room}/events`);

    const unsubscribe = onChildAdded(eventsRef, (snapshot) => {
      if (!isCurrentListener(generation, roomState.room!)) return;

      const event = snapshot.val();
      if (event) {
        showDebugMessage(`New event in room ${roomState.room}: ${event.event}`);
        // Here you can handle the event as needed
        handleEvent(event.event ?? event);
      }
    });
    unsubscribeCallbacks.push(unsubscribe);
  };

  const handleEvent = (event: RoomEvent | string) => {
    switch (event) {
      case 'gamePaused':
        // Handle game paused event
        break;
      case 'gameEnded':
        if (isJoiner.value) {
          roomTerminated.value = true;
          return;
        }
        stopListening({});
        break;
      case 'disconnect':
        if (isJoiner.value) {
          roomTerminated.value = true;
          return;
        }
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

      const { active_users: activeUsers, name, createdAt, ownerId } = parsedRoom.data;

      rooms.unshift({
        createdAt: createdAt ?? null,
        id: childSnapshot.key,
        isStale: !activeUsers?.[ownerId],
        name: name || childSnapshot.key,
        userCount: activeUsers ? Object.keys(activeUsers).length : 0,
      });
    });

    return rooms.slice(0, 5);
  };

  /** Fetch the 5 most recently created rooms. */
  const getRecentRooms = async (): Promise<RoomInfo[]> => {
    const roomsQuery = query(ref(realtimeDb, 'rooms'), orderByChild('createdAt'), limitToLast(30));
    const snapshot = await get(roomsQuery);

    return fetchRecentRooms(snapshot);
  };

  /** Listen to the 5 most recently created rooms in real time. Returns an unsubscribe function. */
  const listenToRecentRooms = (callback: (rooms: RoomInfo[]) => void): (() => void) => {
    const roomsQuery = query(ref(realtimeDb, 'rooms'), orderByChild('createdAt'), limitToLast(30));

    return onValue(roomsQuery, async (snapshot) => {
      const rooms = await fetchRecentRooms(snapshot);

      callback(rooms);
    });
  };
  // endregion

  const stopListening = ({ notify = true }: { notify?: boolean }) => {
    clearListeners();
    cancelPresence();
    currentGeneration += 1;

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;
    ownerOnline.value = false;
    roomTerminated.value = false;

    if (notify) {
      showUserMessage(t('disconnected'), 'warning');
    }
  };

  return {
    destroyRoom,
    getOwnerIdForRoom,
    getRecentRooms,
    isJoiner,
    isJoining,
    isOwner,
    joinOrCreateRoom,
    leaveRoom,
    listenToRecentRooms,
    ownerOnline,
    roomState,
    roomTerminated,
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
