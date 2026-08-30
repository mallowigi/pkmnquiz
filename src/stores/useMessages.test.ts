import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('@/main.ts', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}));

import { useMessages } from '@/stores/useMessages.ts';

describe('useMessages', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('assigns unique IDs to rapidly added messages', () => {
    const store = useMessages();
    store.showUserMessage('First message');
    store.showUserMessage('Second message');
    store.showUserMessage('Third message');

    expect(store.state.messages).toHaveLength(3);
    const ids = store.state.messages.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('removes messages specifically by their ID after 5 seconds', () => {
    const store = useMessages();
    store.showUserMessage('Message 1');
    vi.advanceTimersByTime(2000);

    store.showUserMessage('Message 2');
    expect(store.state.messages).toHaveLength(2);

    // After 3 more seconds (5s from Message 1), Message 1 should be removed, Message 2 remains
    vi.advanceTimersByTime(3000);
    expect(store.state.messages).toHaveLength(1);
    expect(store.state.messages[0].text).toBe('Message 2');

    // After 2 more seconds (5s from Message 2), Message 2 should be removed
    vi.advanceTimersByTime(2000);
    expect(store.state.messages).toHaveLength(0);
  });

  it('clears all messages with clearMessages', () => {
    const store = useMessages();
    store.showUserMessage('Message 1');
    store.showUserMessage('Message 2');
    expect(store.state.messages).toHaveLength(2);

    store.clearMessages();
    expect(store.state.messages).toHaveLength(0);
  });
});
