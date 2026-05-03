import React from 'react';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';
import { TibetanDate, FESTIVALS, MONTHLY_OBSERVANCES } from '../../lib/tibetanCalendar';
import { UI_LABELS } from '../../constants';

interface YearViewProps {
  tibCurrent: TibetanDate;
  t: (en: string, tib: string) => string;
  n: (val: string | number | undefined) => string;
}

const MONTH_NAMES: Record<number, { en: string; tib: string }> = {
  1:  { en: 'Losar',     tib: 'ལོ་གསར།' },
  2:  { en: 'Month 2',   tib: 'ཟླ་གཉིས།' },
  3:  { en: 'Month 3',   tib: 'ཟླ་གསུམ།' },
  4:  { en: 'Saga Dawa', tib: 'ས་ག་ཟླ་བ།' },
  5:  { en: 'Month 5',   tib: 'ཟླ་ལྔ།' },
  6:  { en: 'Month 6',   tib: 'ཟླ་དྲུག' },
  7:  { en: 'Month 7',   tib: 'ཟླ་བདུན།' },
  8:  { en: 'Month 8',   tib: 'ཟླ་བརྒྱད།' },
  9:  { en: 'Month 9',   tib: 'ཟླ་དགུ།' },
  10: { en: 'Month 10',  tib: 'ཟླ་བཅུ།' },
  11: { en: 'Month 11',  tib: 'ཟླ་བཅུ་གཅིག' },
  12: { en: 'Month 12',  tib: 'ཟླ་བཅུ་གཉིས།' },
};

const SPECIAL_MONTHS = new Set([1, 4, 9]);

export function YearView({ tibCurrent, t, n }: YearViewProps) {
  return (
    <div
      className="space-y-8 pb-4"
    >
      {/* Annual Essence Hero */}
      <div className="glass rounded-[10px] p-5 relative overflow-hidden border border-white/10 shadow-2xl">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/10 rounded-full blur-[100px] -mr-36 -mt-36 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gold/5 rounded-full blur-[80px] -ml-28 -mb-28 pointer-events-none" />

        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-gold/15 flex items-center justify-center border border-gold/20">
              <Star size={14} className="text-gold" />
            </div>
            <h3 className="text-[10px] font-black text-gold/70 uppercase tracking-[0.3em]">
              {t(UI_LABELS.ANNUAL_ESSENCE?.en || 'Annual Essence', UI_LABELS.ANNUAL_ESSENCE?.tib || 'ལོ་རེའི་ནུས་པ།')}
            </h3>
          </div>

          <div className="space-y-3">
            <h2 className="text-[40px] font-serif font-black italic leading-none tracking-tight text-white">
              {tibCurrent.yearName} <span className="text-gold">{t('Year', 'ལོ།')}</span>
            </h2>
            <p className="text-[14px] font-medium text-stone-400 leading-relaxed max-w-sm">
              {t(
                `A year of the ${tibCurrent.element} ${tibCurrent.animal}, carrying ${tibCurrent.gender === 'Male' ? 'active and expansive' : 'nurturing and stable'} energies.`,
                `${tibCurrent.element} ${tibCurrent.animal}གི་ལོ་འདི་ནི་${tibCurrent.gender === 'Male' ? 'ཡར་རྒྱས་དང་ནུས་པ་' : 'བརྟན་ལྷིང་དང་འབྱུང་བའི་'}རྟེན་འབྲེལ་བཟང་པོ་ཡོད།`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 12-Month Column List */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <Sparkles size={12} className="text-stone-600" />
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
            {t(UI_LABELS.LUNAR_PATH?.en || 'Lunar Path', UI_LABELS.LUNAR_PATH?.tib || 'ཟླ་བ་བཅུ་གཉིས་ཀྱི་བགྲོད་པ།')}
          </h3>
        </div>

        <div className="space-y-2.5">
          {Array.from({ length: 12 }).map((_, monthIdx) => {
            const m = monthIdx + 1;
            const monthFestivals = FESTIVALS.filter(f => f.month === m);
            const isSpecial = SPECIAL_MONTHS.has(m);

            return (
              <div
                key={m}
                className={`relative flex items-start gap-4 rounded-[10px] p-3 border transition-all duration-300 group ${
                  isSpecial
                    ? 'bg-gold/5 border-gold/20 shadow-sm shadow-gold/5'
                    : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
                }`}
              >
                {/* Month number badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-[10px] flex flex-col items-center justify-center font-black transition-all duration-300 ${
                  isSpecial
                    ? 'bg-gold text-midnight shadow-lg shadow-gold/20 glow'
                    : 'bg-white/8 text-stone-400 group-hover:bg-white/15 group-hover:text-white'
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-tight opacity-70 leading-none">
                    {t('Mo', 'ཟླ')}
                  </span>
                  <span className="text-[17px] font-serif leading-tight">{n(m)}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[13px] font-black uppercase tracking-widest ${
                      isSpecial ? 'text-gold' : 'text-stone-200'
                    }`}>
                      {t(MONTH_NAMES[m].en, MONTH_NAMES[m].tib)}
                    </p>
                    <span className={`flex-shrink-0 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      isSpecial
                        ? 'bg-gold/15 text-gold border border-gold/20'
                        : 'bg-white/5 text-stone-500 border border-white/5'
                    }`}>
                      {monthFestivals.length + MONTHLY_OBSERVANCES.length} {t('days', 'ཉིན།')}
                    </span>
                  </div>

                  {/* Festival pills */}
                  {monthFestivals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {monthFestivals.map((f, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSpecial
                              ? 'bg-gold/10 text-gold border border-gold/15'
                              : 'bg-white/5 text-stone-500 border border-white/5'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-gold/50 flex-shrink-0" />
                          {t(f.name, f.nameTib)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
