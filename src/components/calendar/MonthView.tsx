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
  const firstDay = monthDays[0];
  const lastDay = monthDays[monthDays.length - 1];
  const tibFirst = firstDay ? getTibetanDate(firstDay) : null;
  const tibLast = lastDay ? getTibetanDate(lastDay) : null;
  
  const monthDisplay = (tibFirst && tibLast && tibFirst.month !== tibLast.month)
    ? `${n(tibFirst.month)} - ${n(tibLast.month)}`
    : n(tibFirst?.month);

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-center mb-1 px-2">
        <span className="text-[9px] font-normal text-stone-600 uppercase tracking-[0.3em]">
          {t('Lunar Month', 'བོད་ཟླ།')} {monthDisplay}
        </span>
      </div>


      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={format(currentDate, 'yyyy-MM')}
          custom={direction}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="touch-pan-y"
        >
          <div className="grid grid-cols-7 gap-px text-[9px] font-black text-stone-600 tracking-[0.3em] uppercase mb-4 px-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="py-2 text-center">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 rounded-[10px] overflow-hidden p-1 bg-white/[0.02] border border-white/5">
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-transparent aspect-square" />
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
                    "relative aspect-square rounded-[10px] flex flex-col items-center justify-center gap-0 transition-all duration-300 overflow-hidden",
                    isSelected ? "bg-white/10 text-white z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/20 scale-[1.05]" : "bg-white/[0.03] text-stone-400 hover:bg-white/[0.08] border border-white/[0.05]"
                  )}
                >
                  {isSkippedBefore && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500/20" />
                  )}
                  {/* Moon phase — top-left corner */}
                  <div className="absolute top-1 left-1">
                    <MoonPhase day={tib.day} size={9} isDark={true} isFullMoon={tib.isFullMoon} isNewMoon={tib.isNewMoon} />
                  </div>
                  {/* Gregorian date — primary */}
                  <span className={cn(
                    "text-[18px] font-serif font-black leading-none transition-colors",
                    isToday && !isSelected ? "text-gold" : isSelected ? "text-white" : "text-stone-300"
                  )}>
                    {format(date, 'd')}
                  </span>
                  
                  {/* Indicators & Tibetan Date */}
                  <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
                    <span className={cn(
                      "font-tibetan text-[11px] font-normal leading-none drop-shadow-sm",
                      isSelected ? "text-white" : "text-gold"
                    )}>
                      {toTibetanNumerals(tib.day)}
                    </span>
                    <div className="flex flex-col items-end gap-0.5">
                      {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-gold shadow-[0_0_5px_rgba(234,179,8,0.5)]" />}
                      {isLungtaDay(tib.day, tib.combination || '') && (
                        <span className={cn("text-[7px] filter grayscale opacity-80", isSelected && "grayscale-0 opacity-100")}>🐴</span>
                      )}
                      {getMeritMultiplier(tib.day, tib.month) && (
                        <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-gold" : "bg-gold/60")} />
                      )}
                    </div>
                  </div>

                  {/* Bottom artifacts */}
                  <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center gap-1.5 px-1">
                    {/* Mentskhang symbol */}
                    {tib.lunarSymbol && MENTSKHANG_SYMBOLS[tib.lunarSymbol] && (
                      <span className={cn(
                        "text-[9px] leading-none transition-opacity",
                        isSelected ? "opacity-100" : "opacity-90"
                      )}>
                        {MENTSKHANG_SYMBOLS[tib.lunarSymbol].icon}
                      </span>
                    )}
                    
                    {/* Note indicator */}
                    {userData.notes?.[format(date, 'yyyy-MM-dd')] && (
                      <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white/80" : "bg-stone-600")} />
                    )}

                    {/* Sticker indicator */}
                    {(() => {
                      const sticker = userData.stickers?.[format(date, 'yyyy-MM-dd')];
                      return sticker?.emoji ? (
                        <span className="text-[9px] leading-none">{sticker.emoji}</span>
                      ) : null;
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
