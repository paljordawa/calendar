import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { cn, toTibetanNumerals } from '../../lib/utils';
import { UI_LABELS, ANIMAL_ICONS, MENTSKHANG_SYMBOLS } from '../../constants';
import { COMBINATIONS } from '../../lib/tibetanCalendar';
import { MoreHorizontal, StickyNote, Trash2, Copy, X } from 'lucide-react';

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
  setIsNoteSheetOpen: (val: boolean) => void;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
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
  n,
  setIsNoteSheetOpen,
  setUserData
}: WeekViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isDateToday = (date: Date) => isSameDay(date, new Date());

  return (
    <motion.div
      key="week"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-4"
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
                "p-3 rounded-[10px] cursor-pointer transition-all duration-300 border flex flex-col gap-3",
                isSelected
                  ? "bg-white/10 border-gold/30 ring-1 ring-gold/20 shadow-xl shadow-gold/5"
                  : isToday
                  ? "bg-white/5 border-white/10"
                  : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Date Badge */}
                  <div className={cn(
                    "w-12 h-12 rounded-[10px] flex flex-col items-center justify-center font-black shrink-0 transition-all",
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
                  <div className="min-w-0 flex-1">
                    {/* Top Line: Lunar Day + All Symbols */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                      <p className="text-[10.5px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 text-stone-500 shrink-0">
                        {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)} {n(tib.day)}
                        {tib.day === 15 && <span className="text-[13px]">🌕</span>}
                        {tib.day === 30 && <span className="text-[13px]">🌑</span>}
                      </p>

                      <span className="opacity-20 text-stone-500 shrink-0">•</span>

                      {/* Astrological Symbols & Signs */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black text-turquoise/80 shrink-0">
                          {tib.lunarSymbol ? (
                            <span className="flex items-center gap-1">
                              {MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.icon} {t(tib.lunarSymbol, MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.tib)}
                            </span>
                          ) : (
                            t(`${tib.planetElement}-${tib.mansionElement}`, COMBINATIONS[`${tib.planetElement}-${tib.mansionElement}`]?.tib || tib.combination)
                          )}
                        </span>

                        {/* Animal + Element Mini-Indicator */}
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight text-stone-500 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5 shrink-0">
                          <span className={cn(
                            "w-1 h-1 rounded-full",
                            tib.element === 'Fire' ? 'bg-red-400' :
                            tib.element === 'Water' ? 'bg-blue-400' :
                            tib.element === 'Earth' ? 'bg-amber-500' :
                            tib.element === 'Iron' ? 'bg-stone-400' : 'bg-emerald-400'
                          )} />
                          <span>{ANIMAL_ICONS[tib.animal]} {tib.animal.slice(0, 3)}</span>
                        </div>

                        {/* Power Day Badges (Compact) */}
                        {isLaDay && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 border border-emerald-400/20" title="Soul (La)" />}
                        {isSokDay && <div className="w-2.5 h-2.5 rounded-full bg-blue-400/80 border border-blue-400/20" title="Vitality (Sok)" />}
                        {isEnemyDay && <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 border border-red-400/20" title="Conflict" />}
                        
                        {sticker?.emoji && <span className="text-[12px] shrink-0">{sticker.emoji}</span>}
                        {note && <div className="w-1.5 h-1.5 rounded-full bg-turquoise shrink-0" />}
                      </div>
                    </div>

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

                {/* Right-aligned Menu Button (Standalone child, matching SacredTab) */}
                <div className="relative shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const id = date.toISOString();
                      setOpenMenuId(openMenuId === id ? null : id);
                    }}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center transition-all active:scale-90 rounded-full hover:bg-white/5",
                      openMenuId === date.toISOString() ? "text-gold" : "text-stone-500 hover:text-white"
                    )}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  <AnimatePresence>
                    {openMenuId === date.toISOString() && (
                      <>
                        <div 
                          className="fixed inset-0 z-[60]" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                          className="absolute right-0 top-full mt-2 glass rounded-[10px] shadow-2xl border border-white/10 p-2 z-[70] min-w-[150px] flex flex-col gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedDate(date);
                              setIsNoteSheetOpen(true);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-[10px] transition-colors text-left"
                          >
                            <StickyNote size={14} className="text-gold" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-white">{t('Add Note', 'ཟིན་ཐོ་འགོད།')}</span>
                          </button>
                          <button
                            onClick={() => {
                              const info = `${format(date, 'yyyy-MM-dd')} - ${t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)} ${n(tib.day)} (${tib.element} ${tib.animal})`;
                              navigator.clipboard.writeText(info);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-[10px] transition-colors text-left"
                          >
                            <Copy size={14} className="text-gold" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-white">{t('Copy Info', 'འདྲ་བཤུས།')}</span>
                          </button>
                          {note && (
                            <button
                              onClick={() => {
                                const dateKey = format(date, 'yyyy-MM-dd');
                                setUserData((prev: any) => {
                                  const nextNotes = { ...prev.notes };
                                  delete nextNotes[dateKey];
                                  return { ...prev, notes: nextNotes };
                                });
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-3 hover:bg-red-400/20 rounded-[10px] transition-colors text-left"
                            >
                              <Trash2 size={14} className="text-red-400" />
                              <span className="text-[12px] font-black uppercase tracking-widest text-red-400">{t('Delete Note', 'ཟིན་ཐོ་སུབ།')}</span>
                            </button>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Inline Note Preview */}
              {note && (
                <p className={cn(
                  "text-[12px] font-medium px-1 leading-relaxed line-clamp-1 border-l-2 pl-3 break-all",
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
      <div className="mt-6 pt-4 border-t border-white/5 space-y-5 px-1">
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
