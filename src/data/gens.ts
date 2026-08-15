import type { GenerationInfo, Gen } from '@/types';

export const gens: Record<Gen, GenerationInfo> = {
  gen1: {
    boxes: ['kanto'],
    color: '#7EA35E',
    id: 'gen1',
    name: 'Kanto',
    sprites: ['bulbasaur', 'charmander', 'squirtle'],
  },
  gen2: {
    boxes: ['johto'],
    color: '#B59A4D',
    id: 'gen2',
    name: 'Johto',
    sprites: ['chikorita', 'cyndaquil', 'totodile'],
  },
  gen3: {
    boxes: ['hoenn'],
    color: '#45A090',
    id: 'gen3',
    name: 'Hoenn',
    sprites: ['treecko', 'torchic', 'mudkip'],
  },
  gen4: {
    boxes: ['sinnoh'],
    color: '#97A2B2',
    id: 'gen4',
    name: 'Sinnoh',
    sprites: ['turtwig', 'chimchar', 'piplup'],
  },
  gen5: {
    boxes: ['unova'],
    color: '#696969',
    id: 'gen5',
    name: 'Unova',
    sprites: ['snivy', 'tepig', 'oshawott'],
  },
  gen6: {
    boxes: ['kalos', 'kalosmega', 'hoennmega'],
    color: '#925791',
    id: 'gen6',
    name: 'Kalos',
    sprites: ['chespin', 'fennekin', 'froakie'],
  },
  gen7: {
    boxes: ['alola', 'pokemongo'],
    color: '#D98345',
    id: 'gen7',
    name: 'Alola',
    sprites: ['rowlet', 'litten', 'popplio'],
  },
  gen8: {
    boxes: ['galar', 'gmax', 'hisui'],
    color: '#5A82B3',
    id: 'gen8',
    name: 'Galar',
    sprites: ['grookey', 'scorbunny', 'sobble'],
  },
  gen9: {
    boxes: ['paldea', 'areazero', 'lumiose', 'hyperspace'],
    color: '#835DA3',
    id: 'gen9',
    name: 'Paldea',
    sprites: ['sprigatito', 'fuecoco', 'quaxly'],
  },
};
