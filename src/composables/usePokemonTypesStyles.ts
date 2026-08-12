import { computed } from 'vue';

import { pokemonTypes } from '@/data/pokemonTypes.ts';
import type { PokemonInfo } from '@/types.ts';

export const PKMN_TYPE_STYLE_KEYS = ['--primary-type', '--secondary-type', '--type-btn-color'] as const;

type PokemonTypeStyleKey = (typeof PKMN_TYPE_STYLE_KEYS)[number];
type PokemonTypeStyles = Partial<Record<PokemonTypeStyleKey, string>>;

export const usePokemonTypesStyles = (pokemon: PokemonInfo | null) => {
  return computed<PokemonTypeStyles>(() => {
    const primaryType = pokemon?.primaryType;
    const secondaryType = pokemon?.secondaryType;

    const primaryTypeColor = primaryType && pokemonTypes[primaryType as keyof typeof pokemonTypes];
    const secondaryTypeColor = secondaryType && pokemonTypes[secondaryType as keyof typeof pokemonTypes];

    return {
      '--primary-type': primaryTypeColor?.lightBgColor ?? 'var(--type-bg-color)',
      '--primary-type-dark': primaryTypeColor?.darkBgColor ?? 'var(--type-dark-color)',
      '--primary-type-text': primaryTypeColor?.fgColor ?? 'var(--type-fg-color)',
      '--primary-type-text-dark': primaryTypeColor?.fgColor ?? 'var(--type-fg-color-dark)',

      '--secondary-type': secondaryTypeColor?.lightBgColor ?? primaryTypeColor?.lightBgColor ?? 'var(--type-bg-color)',
      '--secondary-type-dark':
        secondaryTypeColor?.darkBgColor ?? primaryTypeColor?.darkBgColor ?? 'var(--type-dark-color)',
      '--secondary-type-text': secondaryTypeColor?.fgColor ?? 'var(--type-fg-color)',
      '--secondary-type-text-dark': secondaryTypeColor?.fgColor ?? 'var(--type-fg-color-dark)',

      '--type-btn-color': primaryTypeColor?.buttonColor ?? 'var(--primary)',
    };
  });
};
