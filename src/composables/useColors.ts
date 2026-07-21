type Color = {
  light: string;
  dark: string;
  name: string;
};

export const useColors = () => {
  const colors: Record<string, Color> = {
    blue: {
      dark: '#31adbb',
      light: '#31ADBB',
      name: 'blue',
    },
    gray: {
      dark: '#CED3D4',
      light: '#CED3D4',
      name: 'gray',
    },
    green: {
      dark: '#8cc63f',
      light: '#8cc63f',
      name: 'green',
    },
    orange: {
      dark: '#BB8431',
      light: '#BB8431',
      name: 'orange',
    },
    pink: {
      dark: '#BB3168',
      light: '#BB3168',
      name: 'pink',
    },
    purple: {
      dark: '#8431BB',
      light: '#8431BB',
      name: 'purple',
    },
    red: {
      dark: '#BB3F31',
      light: '#BB3F31',
      name: 'red',
    },
    yellow: {
      dark: '#DFD516',
      light: '#DFD516',
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
