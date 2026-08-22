import { ref, set, get, onDisconnect, serverTimestamp, onChildAdded, push, remove, onValue } from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { realtimeDb } from '@/firebase.ts';
import { useMessages } from '@/stores/useMessages.ts';
import type { SaveData, OwnerState, RoomEvent, UserSnapshot } from '@/types.ts';

interface RoomMessagesState {
  ownerId: string | null;
  room: string | null;
  roomMessage: string | null;
}

export const useRoomMessages = defineStore('roomMessages', () => {
  const { showUserMessage } = useMessages();
  const { t } = useI18n();

  const roomState = reactive<RoomMessagesState>({
    ownerId: null,
    room: null,
    roomMessage: null,
  });

  const toOwnerState = (savedState: SaveData): OwnerState => {
    return {
      challengeMode: savedState.challengeMode,
      currentBox: savedState.currentBox,
      currentMegaBox: savedState.currentMegaBox,
      currentSpecialBox: savedState.currentSpecialBox,
      currentType: savedState.currentType,
      currentTypes: savedState.currentTypes,
      gameMode: savedState.gameMode,
      gameSelectionState: savedState.gameSelectionState,
      gens: savedState.gens,
      mode: savedState.mode,
      pokemonProgress: savedState.pokemonProgress,
      types: savedState.types,
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

    if (auth.currentUser.uid !== roomState.ownerId) {
      showUserMessage(t('notRoomOwner'), 'warning');
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

  /**
   * Join or Create a room. If the room doesn't exist, it will be created and the user will become the owner. If the
   * room exists, the user will join it.
   */
  const joinRoom = async (roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    roomState.room = roomId;

    const presenceRef = ref(realtimeDb, `rooms/${roomId}/active_users/${userId}`);
    const ownerId = await getOwnerId();

    // If the room doesn't exist, create it and set the ownerId. If it does exist, just join it.
    if (!ownerId) {
      roomState.ownerId = userId;

      // Set user as owner
      await setOwnerId();
      showUserMessage(t('createdRoom', { roomId }));
    } else {
      // Joining
      showUserMessage(t('joinedRoom', { roomId }));
    }

    set(presenceRef, {
      updatedAt: serverTimestamp(),
      username: auth.currentUser.displayName,
    });

    // Start listening
    listenToMessages();
    listenToJoins();
    listenToState();
    listenToEvents();

    onDisconnect(presenceRef).remove();
  };

  /** Listen to messages (e.g. the pokemon found) */
  const listenToMessages = () => {
    if (!roomState.room) return;
    const messagesRef = ref(realtimeDb, `rooms/${roomState.room}/messages`);

    onChildAdded(messagesRef, (snapshot) => {
      showUserMessage(`New message in room ${roomState.room}`);
      const messages = snapshot.val();

      if (messages) {
        roomState.roomMessage = messages.message;
        showUserMessage(`New message in room ${roomState.room}: ${messages.message}`);
      }
    });
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

  const sendEvent = async (event: RoomEvent) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

    if (auth.currentUser.uid !== roomState.ownerId) {
      showUserMessage(t('notRoomOwner'), 'warning');
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
        break;
      case 'disconnect':
        // Handle disconnect event
        break;
      default:
        // Handle unknown event
        break;
    }
  };

  const setRoomMessage = (message: string | null) => {
    roomState.roomMessage = message;
  };

  return {
    joinRoom,
    roomState,
    sendEvent,
    sendMessage,
    sendState,
    setRoomMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoomMessages, import.meta.hot));
}
