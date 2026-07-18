import { ref } from 'vue';

const lastInput = ref<string | null>(null);

export const useLastInput = () => {
  const updateInput = (input: string | null) => {
    lastInput.value = input;
  };

  const resetInput = () => {
    lastInput.value = null;
  };

  return {
    lastInput,
    resetInput,
    updateInput,
  };
};
