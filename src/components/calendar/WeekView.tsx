import React from 'react';
import { motion } from 'motion/react';
import { format, isSameDay } from 'date-fns';
import { cn, toTibetanNumerals } from '../../lib/utils';
import { UI_LABELS, ANIMAL_ICONS, MENTSKHANG_SYMBOLS } from '../../constants';
import { COMBINATIONS } from '../../lib/tibetanCalendar';

interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  getTibetanDate: (date: Date) => any;
  getElementalHarmony: (birth: string | undefined, day: string) => string;
  getAnimalAffinity: (birth: string | undefined, day: string) => string;
  userData: any;
  t: (en: string, tib: string) => string;
  n: (val: any) => string;
}

export function WeekView({ 
  weekDays, 
  selectedDate, 
  setSelectedDate, 
  getTibetanDate, 
  getElementalHarmony, 
  getAnimalAffinity, 
  userData, 
  t,
  n
}: WeekViewProps) {
  const isDateToday = (date: Date) => isSameDay(date, new Date());

  return (
    <motion.div
      key="week"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-6"
    >
      <div className="space-y-3">
        {weekDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isDateToday(date);
          const tib = getTibetanDate(date);

          // Personal Indicators
          const isLaDay = userData.birthAnimal && getAnimalAffinity(userData.birthAnimal, tib.animal) === 'trine';
          const isSokDay = userData.birthAnimal && getAnimalAffinity(userData.birthAnimal, tib.animal) === 'same';
          const isEnemyDay = userData.birthAnimal && getAnimalAffinity(userData.birthAnimal, tib.animal) === 'conflict';

          const note = userData.notes?.[format(date, 'yyyy-MM-dd')];
          const sticker = userData.stickers?.[format(date, 'yyyy-MM-dd')];

          return (
            <motion.div
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              layout
              whileTap={{ scale: 0.98 }}
              className={cn(
                "p-5 rounded-[28px] cursor-pointer transition-all duration-300 border",
                isSelected
                  ? "bg-white/10 border-gold/30 ring-1 ring-gold/20 shadow-xl shadow-gold/5"
                  : isToday
                  ? "bg-white/5 border-white/10"
                  : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Date Badge */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 transition-all",
                    isSelected
                      ? "bg-gold text-midnight shadow-lg shadow-gold/20"
                      : isToday
                      ? "bg-white/15 text-white"
                      : "bg-white/8 text-stone-400"
                  )}>
                    <span className="text-[9px] uppercase leading-none tracking-wider opacity-80">{format(date, 'EEE')}</span>
                    <span className="text-[17px] font-serif leading-none mt-0.5">{format(date, 'd')}</span>
                  </div>

                  {/* Day Info */}
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 text-stone-500 mb-1">
                      {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)} {n(tib.day)}
                      {tib.day === 15 && <span className="text-[13px]">🌕</span>}
                      {tib.day === 30 && <span className="text-[13px]">🌑</span>}
                      <span className="opacity-20 mx-0.5">•</span>
                      <span className="text-[9px] font-black text-turquoise/80">
                        {tib.lunarSymbol ? (
                          <span className="flex items-center gap-1">
                            {MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.icon} {t(tib.lunarSymbol, MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.tib)}
                          </span>
                        ) : (
                          t(`${tib.planetElement}-${tib.mansionElement}`, COMBINATIONS[`${tib.planetElement}-${tib.mansionElement}`]?.tib || tib.combination)
                        )}
                      </span>
                    </p>
                    <h4 className={cn(
                      "text-[15px] font-serif font-bold truncate",
                      isSelected ? "text-white" : isToday ? "text-gold" : "text-stone-200"
                    )}>
                      {isToday
                        ? t(UI_LABELS.PRESENT_MOMENT.en, UI_LABELS.PRESENT_MOMENT.tib)
                        : t(UI_LABELS.CLEAR_SKY.en, UI_LABELS.CLEAR_SKY.tib)}
                    </h4>
                  </div>
                </div>

                {/* Right Side Indicators */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {sticker?.emoji && <span className="text-[16px]">{sticker.emoji}</span>}

                    {/* Power Day Badges */}
                    {isLaDay && (
                      <div className="flex items-center gap-1 bg-emerald-500/15 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[8px] font-black text-emerald-400 uppercase">L</span>
                      </div>
                    )}
                    {isSokDay && (
                      <div className="flex items-center gap-1 bg-blue-500/15 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="text-[8px] font-black text-blue-400 uppercase">S</span>
                      </div>
                    )}
                    {isEnemyDay && (
                      <div className="flex items-center gap-1 bg-red-500/15 px-1.5 py-0.5 rounded-full border border-red-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="text-[8px] font-black text-red-400 uppercase">E</span>
                      </div>
                    )}

                    {note && <div className="w-1.5 h-1.5 rounded-full bg-turquoise" />}
                  </div>

                  {/* Animal + Element pill */}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-tight",
                    isSelected
                      ? "bg-white/10 border-white/20 text-stone-200"
                      : "bg-white/5 border-white/10 text-stone-500"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      tib.element === 'Fire' ? 'bg-red-400' :
                      tib.element === 'Water' ? 'bg-blue-400' :
                      tib.element === 'Earth' ? 'bg-amber-500' :
                      tib.element === 'Iron' ? 'bg-stone-400' : 'bg-emerald-400'
                    )} />
                    <span>{ANIMAL_ICONS[tib.animal]} {tib.animal.slice(0, 3)}</span>
                  </div>
                </div>
              </div>

              {/* Inline Note Preview */}
              {note && (
                <p className={cn(
                  "text-[12px] font-medium mt-3 px-1 leading-relaxed line-clamp-1 border-l-2 pl-3 break-all",
                  isSelected ? "text-stone-400 border-gold/30" : "text-stone-600 border-white/10"
                )}>
                  {note}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/5 space-y-5 px-1">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
            {t('Personal Alignment', 'རང་གི་རྟགས།')}
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10.5px] text-stone-500 font-black uppercase tracking-tight">{t('Soul Day (La)', 'བླ་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10.5px] text-stone-500 font-black uppercase tracking-tight">{t('Vitality (Sok)', 'སྲོག་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10.5px] text-stone-500 font-black uppercase tracking-tight">{t('Conflict Day', 'གཤེད་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-[10.5px] text-stone-500 font-black uppercase tracking-tight">{t('Sacred Festival', 'དུས་ཆེན།')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
            {t('Day Elements', 'ཉིན་རེའི་འབྱུང་བ།')}
          </h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { color: 'bg-red-400', label: t('Fire', 'མེ།') },
              { color: 'bg-blue-400', label: t('Water', 'ཆུ།') },
              { color: 'bg-amber-500', label: t('Earth', 'ས།') },
              { color: 'bg-stone-400', label: t('Iron/Wind', 'ལྕགས།') },
              { color: 'bg-emerald-400', label: t('Wood', 'ཤིང་།') },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10.5px] text-stone-500 font-bold uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
