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

export const POWER_DAYS: Record<string, { la: string; laTib: string; sok: string; sokTib: string; enemy: string; enemyTib: string }> = {
  'Rat': { la: 'Tuesday', laTib: 'གཟའ་མིག་དམར།', sok: 'Wednesday', sokTib: 'གཟའ་ལྷག་པ།', enemy: 'Saturday', enemyTib: 'གཟའ་སྤེན་པ།' },
  'Ox': { la: 'Wednesday', laTib: 'གཟའ་ལྷག་པ།', sok: 'Saturday', sokTib: 'གཟའ་སྤེན་པ།', enemy: 'Thursday', enemyTib: 'གཟའ་ཕུར་བུ།' },
  'Tiger': { la: 'Thursday', laTib: 'གཟའ་ཕུར་བུ།', sok: 'Saturday', sokTib: 'གཟའ་སྤེན་པ།', enemy: 'Friday', enemyTib: 'གཟའ་པ་སངས་།' },
  'Rabbit': { la: 'Thursday', laTib: 'གཟའ་ཕུར་བུ།', sok: 'Saturday', sokTib: 'གཟའ་སྤེན་པ།', enemy: 'Friday', enemyTib: 'གཟའ་པ་སངས་།' },
  'Dragon': { la: 'Sunday', laTib: 'གཟའ་ཉི་མ།', sok: 'Wednesday', sokTib: 'གཟའ་ལྷག་པ།', enemy: 'Thursday', enemyTib: 'གཟའ་ཕུར་བུ།' },
  'Snake': { la: 'Tuesday', laTib: 'གཟའ་མིག་དམར།', sok: 'Friday', sokTib: 'གཟའ་པ་སངས་།', enemy: 'Wednesday', enemyTib: 'གཟའ་ལྷག་པ།' },
  'Horse': { la: 'Tuesday', laTib: 'གཟའ་མིག་དམར།', sok: 'Friday', sokTib: 'གཟའ་པ་སངས་།', enemy: 'Wednesday', enemyTib: 'གཟའ་ལྷག་པ།' },
  'Sheep': { la: 'Friday', laTib: 'གཟའ་པ་སངས་།', sok: 'Sunday', sokTib: 'གཟའ་ཉི་མ།', enemy: 'Thursday', enemyTib: 'གཟའ་ཕུར་བུ།' },
  'Monkey': { la: 'Friday', laTib: 'གཟའ་པ་སངས་།', sok: 'Sunday', sokTib: 'གཟའ་ཉི་མ།', enemy: 'Thursday', enemyTib: 'གཟའ་ཕུར་བུ།' },
  'Bird': { la: 'Friday', laTib: 'གཟའ་པ་སངས་།', sok: 'Saturday', sokTib: 'གཟའ་སྤེན་པ།', enemy: 'Tuesday', enemyTib: 'གཟའ་མིག་དམར།' },
  'Dog': { la: 'Monday', laTib: 'གཟའ་ཟླ་བ།', sok: 'Wednesday', sokTib: 'གཟའ་ལྷག་པ།', enemy: 'Thursday', enemyTib: 'གཟའ་ཕུར་བུ།' },
  'Pig': { la: 'Monday', laTib: 'གཟའ་ཟླ་བ།', sok: 'Wednesday', sokTib: 'གཟའ་ལྷག་པ།', enemy: 'Saturday', enemyTib: 'གཟའ་སྤེན་པ།' }
};
