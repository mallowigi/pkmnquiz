import { useSound } from '@vueuse/sound';
import { ref } from 'vue';

import { useGameFlow } from '@/stores/useGameFlow.ts';
import { useSettings } from '@/stores/useSettings.ts';
import type { PokemonInfo } from '@/types.ts';

export const usePlaySounds = () => {
  const { settingsState } = useSettings();
  const { flowState } = useGameFlow();
  const soundFile = ref();

  const { play } = useSound(soundFile, { interrupt: true, volume: 0.5 });

  const playbackRate = () => {
    if (flowState.missingno) {
      return Math.random() * (1.5 - 0.5) + 0.5; // Random playback rate between 0.5 and 1.5
    }
    return 1;
  };

  const playFanfare = () => {
    if (!settingsState.withSound) return;

    soundFile.value = 'assets/sounds/finish.mp3';
    setTimeout(() => {
      play();
    }, 50);
  };

  const playFailSound = () => {
    if (!settingsState.withSound) return;

    soundFile.value = 'assets/sounds/wrong.mp3';
    setTimeout(() => {
      play();
    }, 50);
  };

  const playPokemonCry = (pokemonId: number) => {
    if (!settingsState.withSound) return;

    soundFile.value = `assets/sounds/latest/${pokemonId}.ogg`;
    setTimeout(() => {
      play({
        playbackRate: playbackRate(),
      });
    }, 50);
  };

  const playShiny = (pokemon: PokemonInfo) => {
    if (!settingsState.withSound) return;

    switch (true) {
      case ['kanto', 'johto'].includes(pokemon.box):
        soundFile.value = 'assets/sounds/gbshiny.mp3';
        break;
      case ['hoenn', 'sinnoh', 'unova'].includes(pokemon.box):
        soundFile.value = 'assets/sounds/gbashiny.mp3';
        break;
      case ['kalos', 'kalosmega', 'hoennmega', 'alola', 'pokemongo'].includes(pokemon.box):
        soundFile.value = 'assets/sounds/dsshiny.mp3';
        break;
      default:
        soundFile.value = 'assets/sounds/shiny.mp3';
    }

    setTimeout(() => {
      play();
    }, 50);
  };

  const playMissingno = () => {
    if (!settingsState.withSound) return;

    soundFile.value = 'assets/sounds/missingno.mp3';
    setTimeout(() => {
      play({
        playbackRate: Math.random() * (1.5 - 0.5) + 0.5, // Random playback rate between 0.5 and 1.5
      });
    }, 50);
  };

  return {
    playFailSound,
    playFanfare,
    playMissingno,
    playPokemonCry,
    playShiny,
  };
};
