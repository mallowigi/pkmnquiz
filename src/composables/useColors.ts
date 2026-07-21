type Color = {
  light: string;
  dark: string;
  name: string;
  filter?: string;
};

export const useColors = () => {
  const colors: Record<string, Color> = {
    blue: {
      dark: 'hsl(186, 58%, 46%)',
      filter: 'hue-rotate(80deg)',
      light: 'hsl(186, 54%, 51%)',
      name: 'blue',
    },
    gray: {
      dark: 'hsl(195, 2%, 63%)',
      filter: 'grayscale(100%)',
      light: 'hsl(0, 0%, 80%)',
      name: 'gray',
    },
    green: {
      dark: 'hsl(86, 54%, 51%)',
      light: 'hsl(86, 54%, 51%)',
      name: 'green',
    },
    orange: {
      dark: 'hsl(36, 58%, 46%)',
      filter: 'hue-rotate(310deg)',
      light: 'hsl(396, 54%, 51%)',
      name: 'orange',
    },
    pink: {
      dark: 'hsl(336, 58%, 46%)',
      filter: 'hue-rotate(240deg)',
      light: 'hsl(326, 64%, 65%)',
      name: 'pink',
    },
    purple: {
      dark: 'hsl(276, 58%, 46%)',
      filter: 'hue-rotate(180deg)',
      light: 'hsl(266, 64%, 65%)',
      name: 'purple',
    },
    red: {
      dark: 'hsl(6 58% 46%)',
      filter: 'hue-rotate(270deg)',
      light: 'hsl(6, 74%, 65%)',
      name: 'red',
    },
    yellow: {
      dark: 'hsl(50, 100%, 38%)',
      filter: 'hue-rotate(330deg)',
      light: 'hsl(56, 54%, 51%)',
      name: 'yellow',
    },
  };

  const getColor = (name: string): Color | undefined => {
    return colors[name];
  };

  return {
    colors,
    getColor,
  };
};
