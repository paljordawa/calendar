import React from 'react';
import { addDays, format } from 'date-fns';
import { getTibetanDate, MONTHLY_OBSERVANCES, FESTIVALS } from '../../lib/tibetanCalendar';
import { cn } from '../../lib/utils';
import { toTibetanNumerals } from '../../lib/utils';

interface WeekAheadStripProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  t: (en: string, tib: string) => string;
}

function getSacredBadge(day: number, month: number): string | null {
  if (day === 15) return '🌕';
  if (day === 30) return '🌑';
  if (day === 10) return '🪷';
  if (day === 8)  return '💊';
  if (day === 25) return '🌺';
  const festival = FESTIVALS.find(f => f.month === month && f.day === day);
  if (festival) return '🏮';
  return null;
}

export function WeekAheadStrip({ currentDate, selectedDate, onSelectDate, t }: WeekAheadStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentDate, i);
    const tib = getTibetanDate(date);
    const isToday = i === 0;
    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const badge = getSacredBadge(tib.day, tib.month);
    return { date, tib, isToday, isSelected, badge };
  });

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">
        {t('Week Ahead', 'བདུན་ཕྲག་མདུན་མ།')}
      </p>
      <div className="flex gap-1.5">
        {days.map(({ date, tib, isToday, isSelected, badge }) => (
          <button
            key={date.toISOString()}
            onClick={() => onSelectDate(date)}
            className={cn(
              'flex-1 flex flex-col items-center py-2.5 rounded-[10px] transition-all active:scale-95',
              isSelected
                ? 'bg-stone-900 text-white'
                : isToday
                ? 'bg-saffron/10 text-stone-800 border border-saffron/20'
                : 'bg-white border border-stone-100 text-stone-600'
            )}
          >
            {/* Day name */}
            <span className={cn(
              'text-[8px] font-black uppercase tracking-wide leading-none mb-1',
              isSelected ? 'text-stone-400' : 'text-stone-400'
            )}>
              {format(date, 'EEE')}
            </span>
            {/* Gregorian day */}
            <span className={cn(
              'text-[15px] font-serif font-black leading-none',
              isToday && !isSelected ? 'text-saffron' : ''
            )}>
              {format(date, 'd')}
            </span>
            {/* Tibetan lunar day */}
            <span className={cn(
              'font-tibetan text-[9px] leading-none mt-0.5',
              isSelected ? 'text-stone-400' : 'text-stone-400'
            )}>
              {toTibetanNumerals(tib.day)}
            </span>
            {/* Sacred badge */}
            {badge && (
              <span className="text-[9px] mt-1 leading-none">{badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
