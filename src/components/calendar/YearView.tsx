import React from 'react';
import { Star } from 'lucide-react';
import { TibetanDate, FESTIVALS, MONTHLY_OBSERVANCES } from '../../lib/tibetanCalendar';
import { UI_LABELS } from '../../constants';

interface YearViewProps {
  tibCurrent: TibetanDate;
  t: (en: string, tib: string) => string;
  n: (val: string | number | undefined) => string;
}

const MONTH_NAMES: Record<number, { en: string; tib: string }> = {
  1:  { en: 'Losar',      tib: 'ལོ་གསར།' },
  2:  { en: 'Month 2',    tib: 'ཟླ་གཉིས།' },
  3:  { en: 'Month 3',    tib: 'ཟླ་གསུམ།' },
  4:  { en: 'Saga Dawa',  tib: 'ས་ག་ཟླ་བ།' },
  5:  { en: 'Month 5',    tib: 'ཟླ་ལྔ།' },
  6:  { en: 'Month 6',    tib: 'ཟླ་དྲུག' },
  7:  { en: 'Month 7',    tib: 'ཟླ་བདུན།' },
  8:  { en: 'Month 8',    tib: 'ཟླ་བརྒྱད།' },
  9:  { en: 'Month 9',    tib: 'ཟླ་དགུ།' },
  10: { en: 'Month 10',   tib: 'ཟླ་བཅུ།' },
  11: { en: 'Month 11',   tib: 'ཟླ་བཅུ་གཅིག' },
  12: { en: 'Month 12',   tib: 'ཟླ་བཅུ་གཉིས།' },
};

const SPECIAL_MONTHS = new Set([1, 4, 9]);

export function YearView({ tibCurrent, t, n }: YearViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Annual Essence Hero */}
      <div className="bg-stone-950 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-stone-900/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-saffron/15 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-tibetan-red/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
              <Star size={14} className="text-saffron" />
            </div>
            <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em]">
              {t(UI_LABELS.ANNUAL_ESSENCE?.en || 'Annual Essence', UI_LABELS.ANNUAL_ESSENCE?.tib || 'ལོ་རེའི་ནུས་པ།')}
            </h3>
          </div>

          <div className="space-y-3">
            <h2 className="text-[42px] font-serif font-black italic leading-none tracking-tight">
              {tibCurrent.yearName} <span className="text-saffron">{t('Year', 'ལོ།')}</span>
            </h2>
            <p className="text-[14.5px] font-medium text-stone-400 leading-relaxed max-w-md">
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
        <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] px-2">
          {t(UI_LABELS.LUNAR_PATH?.en || 'Lunar Path', UI_LABELS.LUNAR_PATH?.tib || 'ཟླ་བ་བཅུ་གཉིས་ཀྱི་བགྲོད་པ།')}
        </h3>

        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, monthIdx) => {
            const m = monthIdx + 1;
            const monthFestivals = FESTIVALS.filter(f => f.month === m);
            const isSpecial = SPECIAL_MONTHS.has(m);

            return (
              <div
                key={m}
                className={`relative flex items-start gap-4 rounded-[24px] p-5 border transition-all duration-300 group
                  ${isSpecial
                    ? 'bg-white border-saffron/20 shadow-sm shadow-saffron/5'
                    : 'bg-white border-stone-100 hover:border-stone-200'
                  }`}
              >
                {/* Month number badge */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center font-serif font-black text-[17px] transition-all duration-300
                  ${isSpecial
                    ? 'bg-saffron text-white shadow-md shadow-saffron/30'
                    : 'bg-stone-50 text-stone-400 group-hover:bg-stone-900 group-hover:text-white'
                  }`}
                >
                  {n(m)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Month name row */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-black text-stone-900 uppercase tracking-widest">
                      {t(MONTH_NAMES[m].en, MONTH_NAMES[m].tib)}
                    </p>
                    <span className="flex-shrink-0 text-[10px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-2.5 py-1 rounded-full">
                      {monthFestivals.length + MONTHLY_OBSERVANCES.length} {t('days', 'ཉིན།')}
                    </span>
                  </div>

                  {/* Festivals list */}
                  {monthFestivals.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {monthFestivals.map((f, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                            ${isSpecial ? 'bg-saffron/10 text-saffron' : 'bg-stone-100 text-stone-500'}`}
                        >
                          <span className="w-1 h-1 rounded-full bg-tibetan-red flex-shrink-0" />
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
