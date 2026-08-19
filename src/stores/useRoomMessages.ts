import { ref, set, onDisconnect, serverTimestamp, onChildAdded, push, remove } from 'firebase/database';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { useFirebase } from '@/composables/useFirebase.ts';
import { realtimeDb } from '@/firebase.ts';
import { useMessages } from '@/stores/useMessages.ts';

interface RoomMessagesState {
  room: string | null;
  roomMessage: string | null;
}

export const useRoomMessages = defineStore('roomMessages', () => {
  const { showUserMessage } = useMessages();

  const roomState = reactive<RoomMessagesState>({
    room: null,
    roomMessage: null,
  });

  const joinRoom = (roomId: string, userId: string) => {
    const { auth } = useFirebase();
    if (!auth.currentUser) {
      showUserMessage('User is not authenticated', 'error');
      return;
    }

    const presenceRef = ref(realtimeDb, `rooms/${roomId}/active_users/${userId}`);

    set(presenceRef, {
      timestamp: serverTimestamp(),
      username: auth.currentUser.displayName,
    });

    showUserMessage(`Joined room ${roomId}`);

    roomState.room = roomId;
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
      showUserMessage('User is not authenticated', 'error');
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
    setRoomMessage,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoomMessages, import.meta.hot));
}
