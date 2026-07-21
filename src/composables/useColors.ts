type Color = {
  light: string;
  dark: string;
  name: string;
  filter?: string;
};

export const useColors = () => {
  const colors: Record<string, Color> = {
    blue: {
      dark: '#31adbb',
      filter: 'hue-rotate(80deg)',
      light: 'hsl(186, 54%, 51%)',
      name: 'blue',
    },
    gray: {
      dark: '#CED3D4',
      filter: 'grayscale(100%)',
      light: 'hsl(0, 0%, 80%)',
      name: 'gray',
    },
    green: {
      dark: '#8cc63f',
      light: 'hsl(86, 54%, 51%)',
      name: 'green',
    },
    orange: {
      dark: '#BB8431',
      filter: 'hue-rotate(310deg)',
      light: 'hsl(396, 54%, 51%)',
      name: 'orange',
    },
    pink: {
      dark: '#BB3168',
      filter: 'hue-rotate(240deg)',
      light: 'hsl(326, 64%, 65%)',
      name: 'pink',
    },
    purple: {
      dark: '#8431BB',
      filter: 'hue-rotate(180deg)',
      light: 'hsl(266, 64%, 65%)',
      name: 'purple',
    },
    red: {
      dark: '#BB3F31',
      filter: 'hue-rotate(270deg)',
      light: 'hsl(6, 74%, 65%)',
      name: 'red',
    },
    yellow: {
      dark: '#DFD516',
      filter: 'hue-rotate(330deg)',
      light: 'hsl(56, 54%, 51%)',
      name: 'yellow',
    },
  };

  const getColorByName = (name: string): Color | undefined => {
    return colors[name];
  };

  return {
    colors,
    getColorByName,
  };
};
