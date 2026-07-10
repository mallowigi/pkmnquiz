export const normalizeName = (str: string) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/[éèêëẽ]/gu, 'e')
    .replace(/[áàâäã]/gu, 'a')
    .replace(/[ôòóöœõ]/gu, 'o')
    .replace(/[ùúûüũ]/gu, 'u')
    .replace(/[ìíîïĩ]/gu, 'i')
    .replace(/[ñń]/gu, 'n')
    .replace(/[ýÿ]/gu, 'y')
    .replace(/[ßš]/gu, 's')
    .replace(/[çč]/gu, 'c')
    .replace(/[^\p{L}\p{N}]/gu, '');
};

export const capitalize = (str: string) => {
  if (!str) return str;
  const words = str.split(/[\s_-]+/);
  return words
    .map((word) => {
      const [first, ...rest] = word;
      return first.toUpperCase() + rest.join('').toLowerCase();
    })
    .join(' ');
};

export const upsert = <T>(map: Map<string, T[]>, key: string, value: T) => {
  if (!map.has(key)) {
    map.set(key, []);
  }
  map.get(key)?.push(value);
};

export const scrollToTop = () => {
  window.scrollTo({ behavior: 'smooth', top: 0 });
};

export const glitchify = (str: string) => {
  const glitchChars = ['̷', '̸', '̴', '̵', '̶', '̷', '̸', '̹', '̺', '̻', '̀', '́', '͂', '̓', '̈́', 'ͅ'];
  return str
    .split('')
    .map((char) => {
      if (Math.random() < 0.2) {
        return char + glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    })
    .join('');
};
