import React from 'react';
import { Star, Moon, Share } from 'lucide-react';
import { MoonPhase } from '../shared/MoonPhase';
import { TibetanDate } from '../../lib/tibetanCalendar';
import { MENTSKHANG_SYMBOLS, ANIMAL_ICONS, TIBETAN_ANIMALS } from '../../constants';
import { DharmaWheel } from '../shared/Symbols';
import { COMBINATIONS } from '../../lib/tibetanCalendar';
import { getElementalHarmony, getAnimalAffinity } from '../../lib/horoscope';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface TodayCardProps {
  tibCurrent: TibetanDate;
  userData: any;
  t: (en: string, tib: string) => string;
  n: (val: string | number | undefined) => string;
  toTibetanNumerals: (num: number | string | undefined) => string;
  UI_LABELS: any;
  TIBETAN_WEEKDAYS: any;
}

export function TodayCard({ tibCurrent, userData, t, n, toTibetanNumerals, UI_LABELS, TIBETAN_WEEKDAYS }: TodayCardProps) {
  const handleShare = async () => {
    const text = `Tibetan Calendar: ${format(new Date(), 'EEEE, MMM d')}
Lunar Day: ${tibCurrent.day}
Animal: ${tibCurrent.animal}
Combination: ${tibCurrent.combination}
Rabjung: ${tibCurrent.rabjung}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tibetan Calendar',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="relative rounded-[40px] bg-stone-950 p-8 text-white overflow-hidden shadow-native">
      {/* Dharma Wheel watermark */}
      <DharmaWheel className="absolute -right-16 -bottom-16 w-64 h-64 text-white/[0.04] pointer-events-none" />

      <div className="relative space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-500">{t(UI_LABELS.PHUGPA_TRADITION.en, UI_LABELS.PHUGPA_TRADITION.tib)}</p>
            <h1 className="text-[30px] font-serif font-black tracking-tight leading-[1.1]">
              {t(format(new Date(), 'EEEE'), TIBETAN_WEEKDAYS[format(new Date(), 'EEEE')])}, <br />
              <span className="text-saffron italic">{n(format(new Date(), 'MMM d'))}</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full   text-stone-400  transition-all active:scale-90"
              >
                <Share size={16} />
              </button>
              <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10.5px]  uppercase tracking-widest text-stone-400">
                  {t(UI_LABELS.RABJUNG.en, UI_LABELS.RABJUNG.tib)} {toTibetanNumerals(tibCurrent.rabjung)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest flex items-center gap-2">
              {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)}
              {(tibCurrent.day === 15 || tibCurrent.day === 30) && <MoonPhase day={tibCurrent.day} size={10} isDark />}
            </p>
            <p className="text-[25.5px] font-serif font-black text-white">{toTibetanNumerals(tibCurrent.day)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.CELESTIAL_SIGN.en, UI_LABELS.CELESTIAL_SIGN.tib)}</p>
            <p className="text-[19.5px] font-serif font-bold text-stone-100">
              {ANIMAL_ICONS[tibCurrent.animal]} {t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.INDICATOR.en, UI_LABELS.INDICATOR.tib)}</p>
            <div className="flex items-center gap-2">
              <span className="text-[19.5px] font-serif font-bold text-saffron">
                {tibCurrent.lunarSymbol ? t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol]?.tib) : toTibetanNumerals(tibCurrent.mewa)}
              </span>
              {tibCurrent.isHandDay && <span className="px-2 py-0.5 bg-saffron/10 text-saffron text-[8px] font-black uppercase rounded-md">Hand</span>}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.COMBINATION.en, UI_LABELS.COMBINATION.tib)}</p>
            <p className="text-[15.5px] font-serif font-bold text-turquoise truncate">
              {t(tibCurrent.combination, COMBINATIONS[tibCurrent.combination]?.tib || tibCurrent.combination)}
            </p>
          </div>
        </div>

        {userData.birthAnimal && (
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-stone-500">{t(UI_LABELS.PERSONAL_RESONANCE.en, UI_LABELS.PERSONAL_RESONANCE.tib)}</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9.5px] uppercase tracking-wider",
                getElementalHarmony(userData.birthElement, tibCurrent.element) === 'life' ? "bg-turquoise/20 text-turquoise" :
                  getElementalHarmony(userData.birthElement, tibCurrent.element) === 'enemy' ? "bg-red-500/20 text-red-100" : "bg-white/10 text-stone-400"
              )}>
                {getElementalHarmony(userData.birthElement, tibCurrent.element)} energy
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9.5px]  uppercase tracking-wider",
                getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'trine' ? "bg-saffron/20 text-saffron" :
                  getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'conflict' ? "bg-red-500/20 text-red-100" : "bg-white/10 text-stone-400"
              )}>
                {getAnimalAffinity(userData.birthAnimal, tibCurrent.animal)} affinity
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Symbolic (Simplified Text Bar) */}
      {tibCurrent.lunarSymbol && MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol] && (
        <div className="flex items-center gap-3 py-3 border-t border-white/10 mt-6">
          <span className="text-[25.5px] shrink-0">{MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] leading-relaxed text-stone-500 italic">
              <span className="font-black text-stone-200 not-italic uppercase tracking-widest mr-2">
                {t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].en)}:
              </span>

              {t(MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].description, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].descriptionTib)}
              {MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbidden.length > 0 && (
                <span className="ml-2 text-red-500 font-black  tracking-tighter not-italic">
                  <br></br>
                  {t('Avoid', 'འཛེམས་བྱ།')} {t(MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbidden.join(', '), MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbiddenTib.join(', '))}
                </span>
              )}
            </p>
          </div>
        </div>
      )
      }
    </div >
  );
}
