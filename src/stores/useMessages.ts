import { defineStore, acceptHMRUpdate } from 'pinia';
import { reactive } from 'vue';

import { i18n } from '@/main.ts';
import type { Message, MessageType } from '@/types.ts';

interface MessagesState {
  messages: Message[];
}

export const useMessages = defineStore('messages', () => {
  const state = reactive<MessagesState>({
    messages: [],
  });

  const showUserMessage = (message: string, type?: MessageType) => {
    state.messages.push({
      id: Date.now(),
      text: message,
      type: type ?? 'info',
    });

    setTimeout(() => {
      state.messages.shift();
    }, 5000);
  };

  const clearMessages = () => {
    state.messages = [];
  };

  /**
   * Logs an error to the console (preserving debugging context) and surfaces it
   * to the user as an error notification, so failures that would otherwise only
   * appear in the console (e.g. Firebase errors) are not missed.
   */
  const showErrorMessage = (error: unknown, context = 'Firebase error') => {
    console.error(`${context}:`, error);
    const detail = error instanceof Error ? error.message : String(error);
    showUserMessage(i18n.global.t('firebaseError', { error: detail }), 'error');
  };

  return {
    clearMessages,
    showErrorMessage,
    showUserMessage,
    state,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessages, import.meta.hot));
}
