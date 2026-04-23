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
      className="space-y-4"
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
              className={cn(
                "p-5 rounded-[32px] transition-all cursor-pointer mb-3 last:mb-0",
                isSelected ? "bg-stone-900 text-white shadow-xl scale-[1.02]" : "bg-white text-stone-900 border border-stone-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black",
                    isSelected ? "bg-white/10" : "bg-stone-50 text-stone-400"
                  )}>
                    <span className="text-[9.5px] uppercase leading-none">{format(date, 'EEE')}</span>
                    <span className="text-[15.5px] font-serif leading-none mt-1">{format(date, 'd')}</span>
                  </div>
                  <div>
                    <p className={cn("text-[11.5px] font-bold uppercase tracking-widest flex items-center gap-1.5", isSelected ? "text-stone-400" : "text-stone-300")}>
                      {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)} {n(tib.day)}
                      {tib.day === 15 && <span className="text-yellow-500 text-[13.5px]">🌕</span>}
                      {tib.day === 30 && <span className="text-stone-400 text-[13.5px]">🌑</span>}
                      <span className="mx-1 opacity-20">•</span>
                      <span className={cn("text-[9.5px] font-black", isSelected ? "text-turquoise" : "text-turquoise")}>
                        {tib.lunarSymbol ? (
                          <span className="flex items-center gap-1">
                            {MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.icon} {t(tib.lunarSymbol, MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.tib)}
                          </span>
                        ) : (
                          t(`${tib.planetElement}-${tib.mansionElement}`, COMBINATIONS[`${tib.planetElement}-${tib.mansionElement}`]?.tib || tib.combination)
                        )}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <h4 className="text-[15.5px] font-serif font-bold">
                        {isToday ? t(UI_LABELS.PRESENT_MOMENT.en, UI_LABELS.PRESENT_MOMENT.tib) : t(UI_LABELS.CLEAR_SKY.en, UI_LABELS.CLEAR_SKY.tib)}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sticker?.emoji && <span className="text-[19.5px]">{sticker.emoji}</span>}
                  
                  {/* Personal Power Day Indicators */}
                  <div className="flex items-center gap-1">
                    {isLaDay && (
                      <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[8.5px] font-black text-green-700 uppercase">L</span>
                      </div>
                    )}
                    {isSokDay && (
                      <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[8.5px] font-black text-blue-700 uppercase">S</span>
                      </div>
                    )}
                    {isEnemyDay && (
                      <div className="flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-[8.5px] font-black text-red-700 uppercase">E</span>
                      </div>
                    )}
                  </div>

                  {/* Day Element & Animal Indicator */}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9.5px] font-black uppercase tracking-tighter",
                    isSelected ? "bg-white/10 border-white/20 text-white" : "bg-stone-50 border-stone-100 text-stone-400"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      tib.element === 'Fire' ? 'bg-red-500' : 
                      tib.element === 'Water' ? 'bg-blue-500' :
                      tib.element === 'Earth' ? 'bg-amber-600' :
                      tib.element === 'Iron' ? 'bg-stone-400' : 'bg-green-500'
                    )} />
                    <span>{ANIMAL_ICONS[tib.animal]} {tib.animal.slice(0, 3)}</span>
                  </div>

                  {note && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-turquoise" : "bg-turquoise/40")} />}
                </div>
              </div>

              {note && (
                <p className={cn(
                  "text-[12.5px] font-medium mt-3 px-1 leading-relaxed line-clamp-1 border-l-2 pl-3 break-all",
                  isSelected ? "text-stone-400 border-white/20" : "text-stone-400 border-stone-100"
                )}>
                  {note}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend Section */}
      <div className="mt-8 px-2 space-y-6 pb-12 border-t border-stone-50 pt-8">
        <div className="space-y-3">
          <h4 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Alignment', 'རང་གི་རྟགས།')}</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
              <span className="text-[11.5px] text-stone-500 font-black uppercase tracking-tight">{t('Soul Day (La-Day)', 'བླ་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-[11.5px] text-stone-500 font-black uppercase tracking-tight">{t('Vitality Day (Sok)', 'སྲོག་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
              <span className="text-[11.5px] text-stone-500 font-black uppercase tracking-tight">{t('Conflict Day', 'གཤེད་གཟའ།')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-saffron shadow-sm" />
              <span className="text-[11.5px] text-stone-500 font-black uppercase tracking-tight">{t('Sacred Festival', 'དུས་ཆེན།')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Alignment Legend', 'རང་གི་སྐར་རྩིས་མཚོན་རྟགས།')}</h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10.5px] text-stone-500 font-bold uppercase">L: La (Soul)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10.5px] text-stone-500 font-bold uppercase">S: Sok (Vitality)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[10.5px] text-stone-500 font-bold uppercase">E: Enemy (Conflict)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest">{t('Day Elements', 'ཉིན་རེའི་འབྱུང་བ།')}</h4>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[11.5px] text-stone-500 font-bold uppercase">{t('Fire', 'མེ།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11.5px] text-stone-500 font-bold uppercase">{t('Water', 'ཆུ།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-[11.5px] text-stone-500 font-bold uppercase">{t('Earth', 'ས།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-[11.5px] text-stone-500 font-bold uppercase">{t('Iron/Wind', 'ལྕགས་རླུང་།')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[11.5px] text-stone-500 font-bold uppercase">{t('Wood', 'ཤིང་།')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
