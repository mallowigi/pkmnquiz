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
} from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive, computed } from 'vue';
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

  // region Owner Management
  const isOwner = computed(() => {
    // Don't check if we're not in multi mode or unauthenticated.
    if (!auth.currentUser) return true;

    if (!roomState.room) return true;

    return auth.currentUser.uid === roomState.ownerId;
  });

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

  const listenToOwner = async () => {
    if (!roomState.room) return;

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);
    onValue(ownerIdRef, (snapshot) => {
      const ownerId = snapshot.val();

      if (ownerId) {
        roomState.ownerId = ownerId;
      } else {
        roomState.ownerId = null;
      }
    });
  };

  // endregion

  // region Room Management

  const setRoom = (roomId: string) => {
    roomState.room = roomId ?? 'Untitled';
  };

  /**
   * Join or Create a room. If the room doesn't exist, it will be created and the user will become the owner. If the
   * room exists, the user will join it.
   */
  const joinOrCreateRoom = async (roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    roomState.room = roomId;
    roomState.isActive = true;

    const presenceRef = ref(realtimeDb, `rooms/${roomId}/active_users/${userId}`);
    const ownerId = await getOwnerId();

    // If the room doesn't exist, create it and set the ownerId. If it does exist, just join it.
    if (!ownerId) {
      roomState.ownerId = userId;

      // Set user as owner
      await setOwnerId();
      const createdAtRef = ref(realtimeDb, `rooms/${roomId}/createdAt`);
      await set(createdAtRef, serverTimestamp());
      showUserMessage(t('createdRoom', { roomId }));

      sendState();
    } else {
      // Joining
      showUserMessage(t('joinedRoom', { roomId }));
    }

    set(presenceRef, {
      updatedAt: serverTimestamp(),
      username: auth.currentUser.displayName,
    });

    // Start listening
    listenToOwner();
    listenToMessages();
    listenToJoins();
    listenToState();
    listenToEvents();

    onDisconnect(presenceRef).remove();
  };

  const leaveRoom = async (userId: string) => {
    if (!roomState.room) return;

    const presenceRef = ref(realtimeDb, `rooms/${roomState.room}/active_users/${userId}`);
    await remove(presenceRef);

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

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;
    stopListening();

    showUserMessage(t('destroyedRoom', { roomId: roomState.room }));
  };

  /** When creating a room, listen to joins so we can send them the current state. */
  const listenToJoins = () => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    if (!roomState.room) return;
    const activeUsersRef = ref(realtimeDb, `rooms/${roomState.room}/active_users`);

    onChildAdded(activeUsersRef, async (snapshot) => {
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
  const listenToState = () => {
    const { applyPartialState } = useSavedData();
    if (!roomState.room) return;

    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    const stateRef = ref(realtimeDb, `rooms/${roomState.room}/ownerState`);

    // Fetch state from firebase - this is both "resume game" and "sync state" for new users joining the room
    onValue(stateRef, async (snapshot) => {
      const state = snapshot.val() as OwnerState;

      if (state) {
        showUserMessage(`Room ${roomState.room} state updated`);
        // Here you can update the local state with the new ownerState
        applyPartialState(state);
      }
    });
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
  const listenToMessages = () => {
    if (!roomState.room) return;
    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);

    onChildAdded(messagesRef, (snapshot) => {
      showUserMessage(`New message in room ${roomState.room}`);
      const messages = snapshot.val();

      if (messages) {
        showUserMessage(`New message in room ${roomState.room}: ${messages.message}`);
      }
    });
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

  const listenToEvents = () => {
    if (!roomState.room) return;
    const eventsRef = ref(realtimeDb, `rooms/${roomState.room}/events`);

    onChildAdded(eventsRef, (snapshot) => {
      const event = snapshot.val();
      if (event) {
        showUserMessage(`New event in room ${roomState.room}: ${event.event}`);
        // Here you can handle the event as needed
        handleEvent(event);
      }
    });
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

  const stopListening = () => {
    if (!roomState.room) return;
    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);
    const eventsRef = ref(realtimeDb, `rooms/${roomState.room}/events`);
    const stateRef = ref(realtimeDb, `rooms/${roomState.room}/ownerState`);
    const activeUsersRef = ref(realtimeDb, `rooms/${roomState.room}/active_users`);

    // Remove all listeners
    onDisconnect(messagesRef).remove();
    onDisconnect(eventsRef).remove();
    onDisconnect(stateRef).remove();
    onDisconnect(activeUsersRef).remove();

    roomState.room = null;
    roomState.ownerId = null;
    roomState.isActive = false;
    showUserMessage(t('disconnected', { roomId: roomState.room }), 'warning');
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
