import { computed, type CSSProperties } from 'vue';

export const useGlitchedEffect = () => {
  const glitchStyles = computed<CSSProperties>(() => {
    const effects: CSSProperties[] = [
      { imageRendering: 'pixelated', transform: 'scale(1.2)' },
      { filter: 'grayscale(100%)' },
      { filter: 'sepia(100%)' },
      { filter: 'invert(100%)' },
      { filter: 'brightness(50%)' },
      { filter: 'blur(10%)' },
      { filter: 'translate(5px, 5px)' },
      { transform: 'scaleX(-1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(0.7)' },
      { filter: 'hue-rotate(90deg)' },
      { transform: 'skew(15deg)' },
      { transform: 'rotate(180deg)' },
      { transform: 'rotate(45deg)' },
    ];

    const index = Math.floor(Math.random() * effects.length);
    return effects[index];
  });

  return {
    glitchStyles,
  };
};
