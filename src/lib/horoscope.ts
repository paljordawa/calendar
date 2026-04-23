/**
 * Tibetan Astrology Logic (Horoscope, Elemental Harmony, Animal Affinity)
 */

export const VITALITY_RELATIONS: Record<string, { mother: string; son: string; enemy: string }> = {
  'Fire': { mother: 'Wood', son: 'Earth', enemy: 'Water' },
  'Earth': { mother: 'Fire', son: 'Metal', enemy: 'Wood' },
  'Metal': { mother: 'Earth', son: 'Water', enemy: 'Fire' },
  'Water': { mother: 'Metal', son: 'Wood', enemy: 'Earth' },
  'Wood': { mother: 'Water', son: 'Fire', enemy: 'Metal' }
};

export const DHUN_ZUR: Record<string, { opposite: string }> = {
  'Rat': { opposite: 'Horse' }, 'Horse': { opposite: 'Rat' },
  'Ox': { opposite: 'Sheep' }, 'Sheep': { opposite: 'Ox' },
  'Tiger': { opposite: 'Monkey' }, 'Monkey': { opposite: 'Tiger' },
  'Rabbit': { opposite: 'Bird' }, 'Bird': { opposite: 'Rabbit' },
  'Dragon': { opposite: 'Dog' }, 'Dog': { opposite: 'Dragon' },
  'Snake': { opposite: 'Pig' }, 'Pig': { opposite: 'Snake' }
};

export const getElementalHarmony = (birth: string | undefined, day: string) => {
  if (!birth) return 'neutral';
  if (birth === day) return 'same';
  const relations = VITALITY_RELATIONS[birth];
  if (!relations) return 'neutral';
  if (relations.mother === day) return 'life';
  if (relations.son === day) return 'son';
  if (relations.enemy === day) return 'enemy';
  return 'neutral';
};

export const getAnimalAffinity = (birth: string | undefined, day: string) => {
  if (!birth) return 'neutral';
  const trines = [
    ['Rat', 'Dragon', 'Monkey'],
    ['Ox', 'Snake', 'Bird'],
    ['Tiger', 'Horse', 'Dog'],
    ['Rabbit', 'Sheep', 'Pig']
  ];
  const oppositions: Record<string, string> = {
    'Rat': 'Horse', 'Horse': 'Rat',
    'Ox': 'Sheep', 'Sheep': 'Ox',
    'Tiger': 'Monkey', 'Monkey': 'Tiger',
    'Rabbit': 'Bird', 'Bird': 'Rabbit',
    'Dragon': 'Dog', 'Dog': 'Dragon',
    'Snake': 'Pig', 'Pig': 'Snake'
  };

  if (birth === day) return 'same';
  if (oppositions[birth] === day) return 'conflict';
  if (trines.some(t => t.includes(birth) && t.includes(day))) return 'trine';
  return 'neutral';
};

export const POWER_DAYS: Record<string, { power: string[]; weak: string[] }> = {
  'Rat': { power: ['Tuesday', 'Wednesday'], weak: ['Saturday'] },
  'Ox': { power: ['Wednesday', 'Saturday'], weak: ['Thursday'] },
  'Tiger': { power: ['Thursday', 'Saturday'], weak: ['Friday'] },
  'Rabbit': { power: ['Thursday', 'Saturday'], weak: ['Friday'] },
  'Dragon': { power: ['Sunday', 'Wednesday'], weak: ['Thursday'] },
  'Snake': { power: ['Tuesday', 'Friday'], weak: ['Wednesday'] },
  'Horse': { power: ['Tuesday', 'Friday'], weak: ['Wednesday'] },
  'Sheep': { power: ['Friday', 'Sunday'], weak: ['Thursday'] },
  'Monkey': { power: ['Friday', 'Sunday'], weak: ['Thursday'] },
  'Bird': { power: ['Friday', 'Saturday'], weak: ['Tuesday'] },
  'Dog': { power: ['Monday', 'Wednesday'], weak: ['Thursday'] },
  'Pig': { power: ['Monday', 'Wednesday'], weak: ['Saturday'] }
};
