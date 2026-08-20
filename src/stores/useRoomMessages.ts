import { ref, set, get, onDisconnect, serverTimestamp, onChildAdded, push, remove } from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFirebase } from '@/composables/useFirebase.ts';
import { useSavedData } from '@/composables/useSavedData.ts';
import { realtimeDb } from '@/firebase.ts';
import { useMessages } from '@/stores/useMessages.ts';
import type { SaveData, OwnerState } from '@/types.ts';

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

  // Send current state to all listeners
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
    if (ownerId !== auth.currentUser.uid) {
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

  const getOwnerId = async () => {
    if (!roomState.room) return null;

    const ownerIdRef = ref(realtimeDb, `rooms/${roomState.room}/ownerId`);
    const snapshot = await get(ownerIdRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  };

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

    await set(ownerIdRef, ownerId);
  };

  const joinRoom = async (roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage(t('userNotAuthenticated'), 'error');
      return;
    }

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

    roomState.room = roomId;
    set(presenceRef, {
      updatedAt: serverTimestamp(),
      username: auth.currentUser.displayName,
    });

    // Start listening
    listenToMessages();

    onDisconnect(presenceRef).remove();
  };

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

  const setRoomMessage = (message: string | null) => {
    roomState.roomMessage = message;
  };

  return {
    joinRoom,
    listenToMessages,
    roomState,
    sendMessage,
    sendState,
    setRoomMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoomMessages, import.meta.hot));
}
