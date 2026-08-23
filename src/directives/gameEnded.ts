import { type Directive, watchEffect } from 'vue';

import { useGameFlow } from '@/stores/useGameFlow.ts';

export type GameEndedDirective = Directive<HTMLElement, null>;

declare module 'vue' {
  export interface GlobalDirectives {
    vGameEnded: GameEndedDirective;
  }
}

export default {
  mounted(el: HTMLElement) {
    const { flowState } = useGameFlow();

    const watcher = watchEffect(() => {
      const isDisabled = flowState.isGivenUp || flowState.isEnded;

      if (isDisabled) {
        el.classList.add('hidden');
      } else {
        el.classList.remove('hidden');
      }
    });

    (el as any)._gameEndedWatcher = watcher;
  },

  unmounted(el: HTMLElement) {
    const watcher = (el as any)._gameEndedWatcher;
    if (watcher) {
      watcher();
      delete (el as any)._gameEndedWatcher;
    }
  },
} satisfies GameEndedDirective;
