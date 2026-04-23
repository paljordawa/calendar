/**
 * Sacred Insights Engine
 * Derives astrological guidance, merit multipliers, Lungta days,
 * upcoming observance countdowns, and auspiciousness scores
 * from the Tibetan calendar data.
 */

import { addDays, format } from 'date-fns';
import { TibetanDate, MONTHLY_OBSERVANCES, FESTIVALS, COMBINATIONS } from './tibetanCalendar';
import { MENTSKHANG_SYMBOLS } from '../constants';

// ─────────────────────────────────────────────
// 1. MERIT MULTIPLIER
// ─────────────────────────────────────────────
export function getMeritMultiplier(tibDay: number, tibMonth: number): {
  multiplier: number;
  label: string;
  labelTib: string;
} | null {
  // Major festival days — 100,000×
  const megaDays = [
    { month: 1, day: 15 },  // Chotrul Duchen
    { month: 4, day: 15 },  // Saga Dawa Duchen
    { month: 6, day: 4 },   // Chokhor Duchen
    { month: 9, day: 22 },  // Lhabab Duchen
  ];
  if (megaDays.some(d => d.month === tibMonth && d.day === tibDay)) {
    return { multiplier: 100000, label: '100,000× Merit Today', labelTib: 'བསོད་ནམས་ཁྲི་ཕྲག་འཕེལ།' };
  }
  // Full Moon & New Moon — 10,000×
  if (tibDay === 15 || tibDay === 30) {
    return { multiplier: 10000, label: '10,000× Merit Today', labelTib: 'བསོད་ནམས་ཁྲི་འཕེལ།' };
  }
  // Monthly sacred days — 10×
  if ([8, 10, 25].includes(tibDay)) {
    return { multiplier: 10, label: '10× Merit Today', labelTib: 'བསོད་ནམས་བཅུ་འཕེལ།' };
  }
  return null;
}

// ─────────────────────────────────────────────
// 2. LUNGTA (WIND HORSE) DAY CHECK
// ─────────────────────────────────────────────
const LUNGTA_FAVORABLE_COMBINATIONS = [
  'Fire-Wind',   // Strength
  'Wind-Wind',   // Perfection
  'Fire-Fire',   // Progress
  'Water-Water', // Nectar
  'Water-Earth', // Auspiciousness
  'Fire-Earth',  // Stability
];

export function isLungtaDay(tibDay: number, combination: string): boolean {
  const isSacredDay = [1, 8, 10, 15, 25, 30].includes(tibDay);
  const isFavorable = LUNGTA_FAVORABLE_COMBINATIONS.includes(combination);
  return isSacredDay || isFavorable;
}

export function getLungtaStrength(tibDay: number, combination: string): 'excellent' | 'good' | 'none' {
  const isSacredDay = [1, 8, 10, 15, 25, 30].includes(tibDay);
  const isFavorable = LUNGTA_FAVORABLE_COMBINATIONS.includes(combination);
  if (isSacredDay && isFavorable) return 'excellent';
  if (isSacredDay || isFavorable) return 'good';
  return 'none';
}

// ─────────────────────────────────────────────
// 3. SACRED DAY COUNTDOWN
// Returns next N upcoming observance days from today's lunar day
// ─────────────────────────────────────────────
export interface UpcomingDay {
  name: string;
  nameTib: string;
  day: number;
  daysUntil: number;
  icon: string;
}

const OBSERVANCE_ICONS: Record<number, string> = {
  8: '💊',   // Medicine Buddha
  10: '🪷',  // Guru Rinpoche
  15: '🌕',  // Full Moon
  25: '🌺',  // Dakini
  30: '🌑',  // New Moon
};

export function getUpcomingObservances(tibDay: number): UpcomingDay[] {
  const sacredDays = MONTHLY_OBSERVANCES.map(o => o.day).sort((a, b) => a - b);
  const results: UpcomingDay[] = [];

  for (const targetDay of sacredDays) {
    if (targetDay > tibDay) {
      const obs = MONTHLY_OBSERVANCES.find(o => o.day === targetDay)!;
      results.push({
        name: obs.name,
        nameTib: obs.nameTib,
        day: targetDay,
        daysUntil: targetDay - tibDay,
        icon: OBSERVANCE_ICONS[targetDay] || '✨',
      });
      if (results.length >= 3) break;
    }
  }

  // Wrap to next month if needed
  if (results.length < 3) {
    for (const targetDay of sacredDays) {
      if (results.length >= 3) break;
      const obs = MONTHLY_OBSERVANCES.find(o => o.day === targetDay)!;
      results.push({
        name: obs.name,
        nameTib: obs.nameTib,
        day: targetDay,
        daysUntil: (30 - tibDay) + targetDay,
        icon: OBSERVANCE_ICONS[targetDay] || '✨',
      });
    }
  }

  return results.slice(0, 3);
}

// ─────────────────────────────────────────────
// 4. DAILY GUIDANCE
// Returns a primary guidance message for today
// ─────────────────────────────────────────────
export interface DailyGuidance {
  headline: string;
  headlineTib: string;
  body: string;
  bodyTib: string;
  tone: 'auspicious' | 'caution' | 'neutral';
  icon: string;
}

export function getDailyGuidance(tib: TibetanDate): DailyGuidance {
  // Sacred days take priority
  if (tib.day === 15) {
    return {
      icon: '🌕',
      tone: 'auspicious',
      headline: 'Full Moon — Amitabha Day',
      headlineTib: 'བཅོ་ལྔ་མཆོད་པ།',
      body: 'Excellent day for Sang, Lungta, Tsok, and all virtuous practice. Merit is multiplied 10,000×.',
      bodyTib: 'བསང་དང་རླུང་རྟ། ཚོགས་འཁོར་སོགས་ལས་དམ་བཅའ་ལ་ཧ་ཅང་བཟང་བའི་ཉིན་མོ་ཡིན། བསོད་ནམས་ཁྲི་འཕེལ་བ།',
    };
  }
  if (tib.day === 30) {
    return {
      icon: '🌑',
      tone: 'auspicious',
      headline: 'New Moon — Shakyamuni Day',
      headlineTib: 'གནམ་གང་དུས་བཟང་།',
      body: 'Auspicious day for Sang, Lungta and purification. Avoid harmful actions — all karma multiplies 10,000×.',
      bodyTib: 'བསང་དང་རླུང་རྟ། སྦྱོང་བའི་ལས་ལ་དུས་བཟང་ཡིན། ལས་ངན་སྤང་ལ་ཁྲི་འཕེལ་བར་འགྱུར།',
    };
  }
  if (tib.day === 10) {
    return {
      icon: '🪷',
      tone: 'auspicious',
      headline: 'Guru Rinpoche Day',
      headlineTib: 'ཚེས་བཅུ་དུས་བཟང་།',
      body: 'Powerful day for Vajrayana practice, Tsok offering and Guru Yoga. Merit is multiplied 10×.',
      bodyTib: 'རྡོ་རྗེ་ཐེག་པའི་ཉམས་ལེན་དང་ཚོགས། བླ་མའི་རྣལ་འབྱོར་ལ་ཧ་ཅང་བཟང་། བསོད་ནམས་བཅུ་འཕེལ།',
    };
  }
  if (tib.day === 8) {
    return {
      icon: '💊',
      tone: 'auspicious',
      headline: 'Medicine Buddha Day',
      headlineTib: 'སྨན་བླའི་དུས་བཟང་།',
      body: 'Ideal for healing practices, taking medicine, and blessing medicines. Merit 10×.',
      bodyTib: 'སྨན་བླའི་སྒྲུབ་མཆོད་དང་སྨན་བཟུང་བར་དུས་བཟང་ཡིན། བསོད་ནམས་བཅུ་འཕེལ།',
    };
  }
  if (tib.day === 25) {
    return {
      icon: '🌺',
      tone: 'auspicious',
      headline: 'Dakini Day',
      headlineTib: 'མཁའ་འགྲོ་དུས་བཟང་།',
      body: 'Auspicious for Tsok, Chod and feminine wisdom practices. Merit 10×.',
      bodyTib: 'ཚོགས་དང་གཅོད། མཁའ་འགྲོའི་ཆོས་ལ་དུས་བཟང་ཡིན། བསོད་ནམས་བཅུ་འཕེལ།',
    };
  }

  // Mentskhang symbol-based guidance
  const sym = tib.lunarSymbol ? MENTSKHANG_SYMBOLS[tib.lunarSymbol] : null;

  // Combination-based guidance
  const combo = tib.combination ? (COMBINATIONS as any)[tib.combination] : null;
  const comboMeaning = combo?.en || '';

  if (tib.combination === 'Fire-Water' || tib.combination === 'Water-Fire') {
    return {
      icon: sym?.icon || '⚠️',
      tone: 'caution',
      headline: sym ? `${sym.en} Day — ${comboMeaning}` : `Caution: ${comboMeaning}`,
      headlineTib: sym?.tib || '།',
      body: sym?.forbidden?.length
        ? `Avoid: ${sym.forbidden.join(', ')}. ${comboMeaning} combination — postpone major decisions.`
        : `${comboMeaning} energy today — proceed carefully with important matters.`,
      bodyTib: sym?.descriptionTib || '།',
    };
  }

  const lungtaStrength = getLungtaStrength(tib.day, tib.combination || '');
  if (lungtaStrength === 'excellent' || lungtaStrength === 'good') {
    return {
      icon: '🐴',
      tone: 'auspicious',
      headline: lungtaStrength === 'excellent' ? 'Excellent Lungta Day' : 'Good Lungta Day',
      headlineTib: 'རླུང་རྟ་བཟང་བའི་ཉིན།',
      body: `${comboMeaning ? comboMeaning + ' combination. ' : ''}Auspicious for Sang, Wind Horse prayer flags, and virtuous activities.`,
      bodyTib: 'བསང་དང་རླུང་རྟ་བཏབ་པར་དུས་བཟང་ཡིན། ལས་དགེ་བར་དུས་མཐུན་ཡིན།',
    };
  }

  // Default neutral
  return {
    icon: sym?.icon || '📿',
    tone: 'neutral',
    headline: sym ? `${sym.en} Day` : 'Ordinary Day',
    headlineTib: sym?.tib || 'ཉིན་ཐུན་མོང་།',
    body: sym?.description
      ? `${sym.description}${sym.forbidden?.length ? ` Avoid: ${sym.forbidden.join(', ')}.` : ''}`
      : `${comboMeaning ? comboMeaning + ' energy.' : ''} A steady day for regular practice.`,
    bodyTib: sym?.descriptionTib || 'ཉིན་རེའི་ཉམས་ལེན་ལ་བཟང་བའི་ཉིན་མོ་ཡིན།',
  };
}

// ─────────────────────────────────────────────
// 5. AUSPICIOUSNESS SCORE for Activities
// ─────────────────────────────────────────────
export type ActivityStatus = 'green' | 'yellow' | 'red';

export interface ActivityItem {
  name: string;
  nameTib: string;
  status: ActivityStatus;
  reason?: string;
}

const ALL_ACTIVITIES: Array<{ name: string; nameTib: string; key: string }> = [
  { name: 'Spiritual Practice', nameTib: 'ཉམས་ལེན།', key: 'practice' },
  { name: 'Travel', nameTib: 'འགྲུལ་བཞུད།', key: 'travel' },
  { name: 'Business', nameTib: 'ཚོང་ལས།', key: 'business' },
  { name: 'Medical Treatment', nameTib: 'སྨན་གྱིས་བཅོས་པ།', key: 'medical' },
  { name: 'New Beginnings', nameTib: 'གསར་འགོ།', key: 'new' },
  { name: 'Marriage / Union', nameTib: 'བཟའ་ཚང་སྒྲིག་པ།', key: 'marriage' },
];

export function getActivityScores(tib: TibetanDate): ActivityItem[] {
  const sym = tib.lunarSymbol ? MENTSKHANG_SYMBOLS[tib.lunarSymbol] : null;
  const forbidden = sym?.forbidden?.map((f: string) => f.toLowerCase()) || [];
  const combination = tib.combination || '';

  const badCombos = ['Fire-Water', 'Water-Fire', 'Earth-Wind', 'Wind-Earth'];
  const isBadCombo = badCombos.includes(combination);
  const isExcellentCombo = ['Wind-Wind', 'Water-Water', 'Fire-Fire'].includes(combination);
  const isSacredDay = [8, 10, 15, 25, 30].includes(tib.day);

  return ALL_ACTIVITIES.map(act => {
    let status: ActivityStatus = 'yellow';

    const isForbidden = forbidden.some(f =>
      f.includes(act.key) ||
      (act.key === 'business' && (f.includes('business') || f.includes('trade') || f.includes('commerce'))) ||
      (act.key === 'marriage' && (f.includes('wedding') || f.includes('engagement') || f.includes('marriage'))) ||
      (act.key === 'travel' && f.includes('travel')) ||
      (act.key === 'medical' && f.includes('medical')) ||
      (act.key === 'new' && (f.includes('start') || f.includes('new') || f.includes('beginning')))
    );

    if (isForbidden || isBadCombo) {
      status = 'red';
    } else if (isSacredDay && act.key === 'practice') {
      status = 'green';
    } else if (isExcellentCombo || isSacredDay) {
      status = 'green';
    } else {
      status = 'yellow';
    }

    // Sacred days: always green for practice
    if (act.key === 'practice' && isSacredDay) status = 'green';

    return {
      name: act.name,
      nameTib: act.nameTib,
      status,
    };
  });
}
