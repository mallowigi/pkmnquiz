import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { i18n } from '@/main.ts';
import type { Message, MessageType } from '@/types.ts';

interface MessagesState {
  messages: Message[];
}

let lastMessageId = 0;

export const useMessages = defineStore('messages', () => {
  const state = reactive<MessagesState>({
    messages: [],
  });

  const showUserMessage = (message: string, type?: MessageType) => {
    const id = ++lastMessageId;
    state.messages.push({
      id,
      text: message,
      type: type ?? 'info',
    });

    setTimeout(() => {
      state.messages = state.messages.filter((msg) => msg.id !== id);
    }, 5000);
  };

  const showDebugMessage = (message: string, type?: MessageType) => {
    if (import.meta.env.DEV) {
      showUserMessage(message, type);
    }
  };

  const clearMessages = () => {
    state.messages = [];
  };

  const showErrorMessage = (error: unknown, context = 'Firebase error') => {
    console.error(`${context}:`, error);
    const detail = error instanceof Error ? error.message : String(error);
    showUserMessage(i18n.global.t('firebaseError', { error: detail }), 'error');
  };

  return {
    clearMessages,
    showDebugMessage,
    showErrorMessage,
    showUserMessage,
    state,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot));
}
