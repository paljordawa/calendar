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
    <div className="relative rounded-[10px] glass-card p-4 text-white overflow-hidden shadow-2xl border border-white/5 group">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-gold/10 transition-colors duration-1000" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-lapis/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-lapis/10 transition-colors duration-1000" />

      {/* Dharma Wheel watermark */}
      <DharmaWheel className="absolute -right-16 -bottom-16 w-64 h-64 text-white/[0.03] pointer-events-none rotate-12 transition-transform duration-[10s] ease-linear group-hover:rotate-45" />

      <div className="relative space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">{t(UI_LABELS.PHUGPA_TRADITION.en, UI_LABELS.PHUGPA_TRADITION.tib)}</p>
            </div>
            <h1 className="text-[34px] font-serif font-black tracking-tight leading-[1.1] text-white">
              {t(format(new Date(), 'EEEE'), TIBETAN_WEEKDAYS[format(new Date(), 'EEEE')])}, <br />
              <span className="text-gold italic drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{n(format(new Date(), 'MMM d'))}</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={handleShare}
              className="p-3 rounded-[10px] bg-white/5 text-stone-400 hover:text-gold hover:bg-white/10 transition-all active:scale-90"
            >
              <Share size={18} />
            </button>
            <div className="px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold">
                {t(UI_LABELS.RABJUNG.en, UI_LABELS.RABJUNG.tib)} {toTibetanNumerals(tibCurrent.rabjung)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em]">
                {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)}
              </p>
              {(tibCurrent.day === 15 || tibCurrent.day === 30) && <MoonPhase day={tibCurrent.day} size={10} isDark />}
            </div>
            <p className="text-[32px] font-serif font-black text-white leading-none">{toTibetanNumerals(tibCurrent.day)}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em]">{t(UI_LABELS.CELESTIAL_SIGN.en, UI_LABELS.CELESTIAL_SIGN.tib)}</p>
            <div className="flex items-center gap-2">
              <span className="text-[24px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{ANIMAL_ICONS[tibCurrent.animal]}</span>
              <p className="text-[20px] font-serif font-black text-stone-100">
                {t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em]">{t(UI_LABELS.INDICATOR.en, UI_LABELS.INDICATOR.tib)}</p>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-serif font-black text-gold glow-text">
                {tibCurrent.lunarSymbol ? t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol]?.tib) : toTibetanNumerals(tibCurrent.mewa)}
              </span>
              {tibCurrent.isHandDay && <span className="px-2 py-0.5 bg-gold/10 text-gold text-[8px] font-black uppercase rounded-md border border-gold/20">Hand Day</span>}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black text-stone-500 tracking-[0.2em]">{t(UI_LABELS.COMBINATION.en, UI_LABELS.COMBINATION.tib)}</p>
            <p className="text-[16px] font-serif font-black text-turquoise truncate">
              {t(tibCurrent.combination, COMBINATIONS[tibCurrent.combination]?.tib || tibCurrent.combination)}
            </p>
          </div>
        </div>

        {userData.birthAnimal && (
          <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">{t(UI_LABELS.PERSONAL_RESONANCE.en, UI_LABELS.PERSONAL_RESONANCE.tib)}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                  getElementalHarmony(userData.birthElement, tibCurrent.element) === 'life' ? "bg-turquoise/10 text-turquoise border-turquoise/20" :
                    getElementalHarmony(userData.birthElement, tibCurrent.element) === 'enemy' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-stone-500 border-white/5"
                )}>
                  {getElementalHarmony(userData.birthElement, tibCurrent.element)} energy
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                  getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'trine' ? "bg-gold/10 text-gold border-gold/20" :
                    getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'conflict' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-stone-500 border-white/5"
                )}>
                  {getAnimalAffinity(userData.birthAnimal, tibCurrent.animal)} affinity
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Symbolic (Simplified Text Bar) */}
      {tibCurrent.lunarSymbol && MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol] && (
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-[10px] border border-white/5 mt-8 group-hover:bg-white/10 transition-colors">
          <span className="text-[32px] shrink-0 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] leading-relaxed text-stone-400 font-medium">
              <span className="font-black text-white uppercase tracking-widest mr-2">
                {t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].en)}:
              </span>

              {t(MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].description, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].descriptionTib)}
              {MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbidden.length > 0 && (
                <span className="block mt-1 text-red-400 font-bold text-[11px] tracking-tight">
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
