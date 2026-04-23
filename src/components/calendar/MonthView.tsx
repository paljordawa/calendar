import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, toTibetanNumerals } from '../../lib/utils';
import { MoonPhase } from '../shared/MoonPhase';
import { MENTSKHANG_SYMBOLS } from '../../constants';
import { getMeritMultiplier, isLungtaDay } from '../../lib/sacredInsights';

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  monthDays: Date[];
  direction: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  getTibetanDate: (date: Date) => any;
  isDateToday: (date: Date) => boolean;
  t: (en: string, tib: string) => string;
  n: (val: any) => string;
  userData: any;
}

export function MonthView({
  currentDate,
  selectedDate,
  setSelectedDate,
  monthDays,
  direction,
  handlePrevMonth,
  handleNextMonth,
  getTibetanDate,
  isDateToday,
  t,
  n,
  userData
}: MonthViewProps) {
  const tibSelected = getTibetanDate(selectedDate);

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="px-3 py-2 bg-stone-50 rounded-xl active:scale-95 transition-transform"><ChevronLeft size={16} /></button>
          <button onClick={handleNextMonth} className="px-3 py-2 bg-stone-50 rounded-xl active:scale-95 transition-transform"><ChevronRight size={16} /></button>
        </div>
        <span className="text-[11.5px] font-bold text-stone-400 uppercase tracking-widest">{t('Lunar Month', 'བོད་ཟླ།')} {n(tibSelected.month)}</span>
      </div>


      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="touch-pan-y"
        >
          <div className="grid grid-cols-7 gap-px text-[10.5px] font-black text-stone-400 tracking-[0.2em] uppercase mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="py-2 text-center">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-px rounded-2xl overflow-hidden border border-stone-100 bg-stone-100">
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-stone-50/50 aspect-square" />
            ))}
            {monthDays.map((date, idx) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isDateToday(date);
              const tib = getTibetanDate(date);

              // Detect skipped day
              let isSkippedBefore = false;
              if (idx > 0) {
                const prevTib = getTibetanDate(monthDays[idx - 1]);
                if (tib.day > prevTib.day + 1 || (tib.day === 1 && prevTib.day < 30 && prevTib.day !== 0)) {
                  isSkippedBefore = true;
                }
              }

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center gap-0 transition-all duration-300",
                    isSelected ? "bg-stone-900 text-white z-10 shadow-lg scale-105" : "bg-white text-stone-900 hover:bg-stone-50"
                  )}
                >
                  {isSkippedBefore && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-100/30" />
                  )}
                  {/* Moon phase — top-left corner */}
                  <div className="absolute top-1.5 left-1.5">
                    <MoonPhase day={tib.day} size={9} isDark={isSelected} />
                  </div>
                  {/* Gregorian date — primary */}
                  <span className={cn(
                    "text-[13px] font-serif font-black leading-none",
                    isToday && !isSelected && "text-saffron"
                  )}>
                    {format(date, 'd')}
                  </span>
                  {/* Tibetan lunar day — MonlamUniOuChan2 font */}
                  <span className={cn(
                    "font-tibetan text-[11px] leading-none mt-0.5",
                    isSelected ? "text-stone-300" : "text-stone-500"
                  )}>
                    {toTibetanNumerals(tib.day)}
                  </span>
                  {/* Sticker / emoji indicator — bottom-left */}
                  {(() => {
                    const sticker = userData.stickers?.[format(date, 'yyyy-MM-dd')];
                    return sticker?.emoji ? (
                      <div className="absolute bottom-1 left-1 text-[10px] leading-none">
                        {sticker.emoji}
                      </div>
                    ) : null;
                  })()}
                  {/* Mentskhang symbol — bottom-center */}
                  {tib.lunarSymbol && MENTSKHANG_SYMBOLS[tib.lunarSymbol] && (
                    <div
                      className="absolute bottom-0.5 inset-x-0 flex justify-center"
                      title={MENTSKHANG_SYMBOLS[tib.lunarSymbol].en}
                    >
                      <span className={cn(
                        "text-[9px] leading-none",
                        isSelected ? "opacity-60" : "opacity-40"
                      )}>
                        {MENTSKHANG_SYMBOLS[tib.lunarSymbol].icon}
                      </span>
                    </div>
                  )}

                  {/* Sacred Indicators — top-right */}
                  <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
                    {isToday && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-saffron" />}
                    {isLungtaDay(tib.day, tib.combination || '') && (
                      <span className={cn("text-[8px]", isSelected ? "text-stone-400" : "text-amber-500")}>🐴</span>
                    )}
                    {getMeritMultiplier(tib.day, tib.month) && (
                      <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-stone-300" : "bg-emerald-400")} />
                    )}
                  </div>
                  {/* Note indicator — bottom-right */}
                  {userData.notes?.[format(date, 'yyyy-MM-dd')] && (
                    <div className={cn("absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full", isSelected ? "bg-white/60" : "bg-stone-400")} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
