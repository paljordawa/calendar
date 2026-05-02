import React from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Pencil, Sparkles, Compass, Calendar as CalendarIcon, Clock, StickyNote, ChevronRight, Bell } from 'lucide-react';
import { cn, toTibetanNumerals } from '../../lib/utils';
import { 
  UI_LABELS, 
  ANIMAL_ICONS, 
  TIBETAN_ANIMALS, 
  TIBETAN_WEEKDAYS,
  MENTSKHANG_SYMBOLS, 
  PARKHA_ICONS, 
  MEWA_ICONS, 
} from '../../constants';
import { FESTIVALS, COMBINATIONS } from '../../lib/tibetanCalendar';
import { StatusItem } from '../shared/StatusItem';
import { MoonPhase } from '../shared/MoonPhase';
import { ActivityScore } from '../shared/ActivityScore';
import { getActivityScores } from '../../lib/sacredInsights';

interface DayDetailCardProps {
  selectedDate: Date;
  tibSelected: any;
  userData: any;
  setIsNoteSheetOpen: (val: boolean) => void;
  getElementalHarmony: (birth: string | undefined, day: string) => string;
  t: (en: string, tib: string) => string;
  n: (val: string | number | undefined) => string;
}

export function DayDetailCard({ 
  selectedDate, 
  tibSelected, 
  userData, 
  setIsNoteSheetOpen, 
  getElementalHarmony, 
  t, 
  n 
}: DayDetailCardProps) {
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedNote = userData.notes?.[selectedDateKey];
  const currentReminder = userData.reminders?.[selectedDateKey] || false;
  const customFestivalToday = (userData.customFestivals || []).find((f: any) => f.date === selectedDateKey);
  const selectedSticker = userData.stickers?.[selectedDateKey];

  return (
    <div className="mt-8 border-t border-white/5 pt-4 space-y-6">
      {/* My Notes section — matches Home layout */}
      <div className="space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <StickyNote size={13} className="text-stone-500" />
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
              {t(UI_LABELS.MY_NOTES?.en || 'My Notes', UI_LABELS.MY_NOTES?.tib || 'ཟིན་ཐོ།')}
            </span>
          </div>
          <button
            onClick={() => setIsNoteSheetOpen(true)}
            className="p-2 rounded-[10px] text-stone-400 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* Note card */}
        <button
          onClick={() => setIsNoteSheetOpen(true)}
          className="w-full text-left active:scale-[0.98] transition-all group"
        >
          {selectedNote ? (
            <div className="glass p-3 rounded-[10px] border border-white/5 flex items-start gap-4 group-hover:border-white/10 transition-all">
              {/* Date badge */}
              <div className="w-12 h-12 rounded-[10px] bg-white/5 flex flex-col items-center justify-center text-stone-500 font-bold flex-shrink-0 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                <span className="text-[9px] uppercase tracking-tighter leading-none">{format(selectedDate, 'MMM')}</span>
                <span className="text-[18px] leading-tight mt-0.5">{format(selectedDate, 'd')}</span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-stone-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  {t(format(selectedDate, 'EEEE'), TIBETAN_WEEKDAYS[format(selectedDate, 'EEEE')] || format(selectedDate, 'EEEE'))}
                  {currentReminder && <Bell size={10} className="text-gold fill-gold/20" />}
                </p>
                <p className="text-[15px] text-stone-200 font-medium leading-snug line-clamp-2">{selectedNote}</p>
                {/* Sticker label */}
                {selectedSticker && (selectedSticker.emoji || selectedSticker.label) && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {selectedSticker.emoji && <span className="text-[12px]">{selectedSticker.emoji}</span>}
                    {selectedSticker.label && (
                      <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {selectedSticker.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-stone-700 group-hover:text-gold transition-colors flex-shrink-0 mt-1" />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2 group">
              <div className="w-10 h-10 flex items-center justify-center text-stone-800 group-hover:text-gold/50 transition-colors">
                <StickyNote size={16} />
              </div>
              <span className="text-[13px] text-stone-700 font-medium group-hover:text-stone-500">
                {t(UI_LABELS.ADD_NOTE?.en || 'Add personal note...', UI_LABELS.ADD_NOTE?.tib || 'ཟིན་ཐོ་བཀོད་པ།')}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Activity Auspiciousness Score */}
      <ActivityScore activities={getActivityScores(tibSelected)} t={t} />

      {/* Day Alignment & Specifications */}
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <h4 className="text-[11.5px] font-black text-stone-300 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.DAY_SPECIFICATIONS?.en || 'Day Specifications', UI_LABELS.DAY_SPECIFICATIONS?.tib || 'ཉིན་རེའི་གནས་བབས།')}</h4>
          <div className="space-y-2.5">
            {/* Moon Phases */}
            {tibSelected.isFullMoon && <StatusItem icon={<MoonPhase day={15} size={22} isFullMoon={true} isDark={true} />} label={t(UI_LABELS.FULL_MOON?.en || 'Full Moon', UI_LABELS.FULL_MOON?.tib || 'ཉ་གང་།')} detail={t(UI_LABELS.LUNAR_DAY_15?.en || 'Full Moon Observance', UI_LABELS.LUNAR_DAY_15?.tib || 'བོད་ཚེས་ ༡༥ དུས་བཟང་།')} color="text-stone-900" />}
            {tibSelected.isNewMoon && <StatusItem icon={<MoonPhase day={30} size={22} isNewMoon={true} isDark={true} />} label={t(UI_LABELS.NEW_MOON?.en || 'New Moon', UI_LABELS.NEW_MOON?.tib || 'གནམ་གང་།')} detail={t(UI_LABELS.LUNAR_DAY_30?.en || 'New Moon Observance', UI_LABELS.LUNAR_DAY_30?.tib || 'བོད་ཚེས་ ༣༠ དུས་བཟང་།')} color="text-stone-900" />}

            {/* Personal Harmony Item */}
            {userData?.birthAnimal && (
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-[10px] border border-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-[10.5px] font-black text-stone-500 uppercase tracking-widest leading-none mb-1">{t(UI_LABELS.SACRED_ALIGNMENT?.en || 'Sacred Alignment', UI_LABELS.SACRED_ALIGNMENT?.tib || 'མཐུན་འཕྲོད་བྱིན་རླབས།')}</p>
                    <p className="text-[11.5px] font-bold text-stone-400 uppercase tracking-wide leading-none">{t(UI_LABELS.BIRTH_CHART_RESONANCE?.en || 'Birth Resonance', UI_LABELS.BIRTH_CHART_RESONANCE?.tib || 'སྐྱེས་རྩིས་མཐུན་ཆ།')}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <Compass size={10} className="text-stone-500" />
                  <span className="text-[10.5px] font-black text-stone-300 uppercase tracking-widest">
                    {getElementalHarmony(userData.birthElement, tibSelected.element) === 'life' ? t(UI_LABELS.LIFE_FORCE_ALIGNMENT?.en || 'Life Force', UI_LABELS.LIFE_FORCE_ALIGNMENT?.tib || 'སྲོག་རྩིས་མཐུན་པ།') :
                     getElementalHarmony(userData.birthElement, tibSelected.element) === 'son' ? t(UI_LABELS.PROSPERITY_ALIGNMENT?.en || 'Prosperity', UI_LABELS.PROSPERITY_ALIGNMENT?.tib || 'དཔལ་འབྱོར་མཐུན་པ།') :
                     getElementalHarmony(userData.birthElement, tibSelected.element) === 'enemy' ? t(UI_LABELS.OBSTACLE_ALIGNMENT?.en || 'Obstacle', UI_LABELS.OBSTACLE_ALIGNMENT?.tib || 'གཤེད་རྩིས་མཐུན་པ།') :
                     t(UI_LABELS.NEUTRAL_ALIGNMENT?.en || 'Neutral', UI_LABELS.NEUTRAL_ALIGNMENT?.tib || 'འབྲིང་གི་མཐུན་པ།')}
                  </span>
                </div>
              </div>
            )}

            {/* Mentskhang Symbol Indicator */}
            {tibSelected.lunarSymbol && (
              <div className="flex items-start gap-4 p-3 bg-white/5 rounded-[10px] border border-white/5 group">
                <div className="w-12 h-12 flex items-center justify-center text-[25.5px] group-hover:scale-105 transition-transform shrink-0 text-gold">
                  {MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.icon || '❓'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15.5px] font-serif font-black text-stone-100">
                      {t(tibSelected.lunarSymbol, MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.tib || 'མི་གསལ།')} ({MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.en || 'Unknown'})
                    </h4>
                    {tibSelected.isHandDay && <span className="px-1.5 py-0.5 bg-stone-900 text-white text-[8.5px] font-black uppercase rounded">{t(UI_LABELS.HAND?.en || 'Hand', UI_LABELS.HAND?.tib || 'ལག་པ།')}</span>}
                    {tibSelected.isYenKongDay && <span className="px-1.5 py-0.5 bg-stone-900 text-white text-[8.5px] font-black uppercase rounded">{t(UI_LABELS.YEN_KONG?.en || 'Yen Kong', UI_LABELS.YEN_KONG?.tib || 'ཡན་ཀོང་།')}</span>}
                  </div>
                  <p className="text-[11.5px] text-stone-500 italic leading-relaxed">
                    {t(MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.description || '', MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.descriptionTib || '')}
                  </p>
                  {MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.forbidden && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t(MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.forbidden || [], MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.forbiddenTib || []).map((f: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-500/15 text-red-400 text-[9.5px] font-black uppercase tracking-tighter rounded-full border border-red-500/20">
                          {userData.language === 'Tibetan' ? f : `No ${f}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Doubled/Skipped */}
            {tibSelected.isDoubleDay && <StatusItem icon={<span className="text-[21.5px] font-black text-saffron">⁺</span>} label={t(UI_LABELS.DOUBLE_DAY?.en || 'Double Day', UI_LABELS.DOUBLE_DAY?.tib || 'ཚེས་བཤོལ།')} detail={t(UI_LABELS.DOUBLE_DAY_DESC?.en || 'A duplicated lunar period', UI_LABELS.DOUBLE_DAY_DESC?.tib || 'བོད་ཚེས་ཟློས་པ།')} />}
            {tibSelected.isSkippedDay && <StatusItem icon={<span className="text-[21.5px] font-black text-red-500">⁻</span>} label={t(UI_LABELS.SKIPPED_DAY?.en || 'Skipped Day', UI_LABELS.SKIPPED_DAY?.tib || 'ཚེས་ཆད་པ།')} detail={t(UI_LABELS.SKIPPED_DAY_DESC?.en || 'This lunar day is omitted', UI_LABELS.SKIPPED_DAY_DESC?.tib || 'བོད་ཚེས་ཆད་པ།')} />}

            {/* Festivals */}
            {FESTIVALS.filter(f => f.month === tibSelected.month && f.day === tibSelected.day).map(f => (
              <StatusItem key={f.name} icon="🏮" label={t(f.name, f.nameTib)} detail={t(f.description, f.descriptionTib)} color="text-tibetan-red" />
            ))}

            {/* Generic Placeholder if empty */}
            {tibSelected.day !== 15 && tibSelected.day !== 30 && !tibSelected.isDoubleDay && !tibSelected.isSkippedDay && FESTIVALS.filter(f => f.month === tibSelected.month && f.day === tibSelected.day).length === 0 && !userData?.birthAnimal && (
              <div className="py-4 text-[11.5px] text-stone-300 font-medium italic text-center border-2 border-dashed border-stone-50 rounded-[10px]">{t(UI_LABELS.NO_CELESTIAL_MARKERS?.en || 'No markers', UI_LABELS.NO_CELESTIAL_MARKERS?.tib || 'མཐོང་ཆོས་མེད།')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Custom festival / reminder indicators */}
      {(currentReminder || customFestivalToday) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          {customFestivalToday && (
            <div className="bg-amber-50 p-4 rounded-[10px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black text-saffron uppercase tracking-widest">{t(UI_LABELS.CUSTOM_EVENT?.en || 'Custom Event', UI_LABELS.CUSTOM_EVENT?.tib || 'སྒེར་གྱི་དུས་དྲན།')}</span>
                <CalendarIcon size={12} className="text-saffron" />
              </div>
              <h4 className="text-[15.5px] font-bold text-stone-900 break-words">{customFestivalToday.name}</h4>
              {customFestivalToday.description && (
                <p className="text-[12.5px] text-stone-500 italic whitespace-pre-wrap break-words">{customFestivalToday.description}</p>
              )}
            </div>
          )}
          {currentReminder && (
            <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-[10px]">
              <Clock size={16} className="text-saffron" />
              <span className="text-[11.5px] font-bold text-amber-900 uppercase tracking-widest">{t(UI_LABELS.REMIND_ME_TODAY?.en || 'Remind Me', UI_LABELS.REMIND_ME_TODAY?.tib || 'དྲན་སྐུལ་བྱེད།')}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Grid Specifications (Mewa, Parkha, etc.) */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.TRIGRAM_PARKHA?.en || 'Trigram', UI_LABELS.TRIGRAM_PARKHA?.tib || 'སྤར་ཁ།')}</p>
          <p className="text-[13.5px] font-bold text-stone-200">{PARKHA_ICONS[tibSelected.parkha] || '❓'} {tibSelected.parkha}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.MAGIC_SQ_MEWA?.en || 'Magic Square', UI_LABELS.MAGIC_SQ_MEWA?.tib || 'སྨེ་བ།')}</p>
          <p className="text-[13.5px] font-bold text-stone-200">{MEWA_ICONS[tibSelected.mewa] || '❓'} {tibSelected.mewa}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.YEAR_SIGNATURE?.en || 'Year', UI_LABELS.YEAR_SIGNATURE?.tib || 'ལོ་རྟགས།')}</p>
          <p className="text-[13.5px] font-bold text-gold/80 italic">{tibSelected.yearName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.LUNAR_CYCLE?.en || 'Lunar Cycle', UI_LABELS.LUNAR_CYCLE?.tib || 'ཟླ་ཐོ།')}</p>
          <p className="text-[13.5px] font-bold text-stone-800">{t(UI_LABELS.MONTH_LABEL?.en || 'Month', UI_LABELS.MONTH_LABEL?.tib || 'ཟླ་བ།')} {n(tibSelected.month)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.DAY_CONJUNCTION?.en || 'Conjunction', UI_LABELS.DAY_CONJUNCTION?.tib || 'སྦྱོར་བ།')}</p>
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-bold text-turquoise">
              {t(tibSelected.combination, COMBINATIONS[`${tibSelected.planetElement}-${tibSelected.mansionElement}`]?.tib || tibSelected.combination)}
            </span>
            <span className="text-[9.5px] font-black text-stone-300 uppercase tracking-widest">
              ({tibSelected.planetElement}-{tibSelected.mansionElement})
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.FOCUS?.en || 'Focus', UI_LABELS.FOCUS?.tib || 'དོ་སྣང་།')}</p>
          <p className="text-[11.5px] font-medium text-stone-500 italic">
            {(() => {
              const combined = `${tibSelected.planetElement}-${tibSelected.mansionElement}`;
              if (combined === 'Earth-Water') return t(UI_LABELS.AUSPICIOUS_BUILDING?.en || 'Building', UI_LABELS.AUSPICIOUS_BUILDING?.tib || 'རྩིག་གཞི།');
              if (combined === 'Earth-Fire') return t(UI_LABELS.CAUTION_FRICTION?.en || 'Friction', UI_LABELS.CAUTION_FRICTION?.tib || 'འཁྲུག་པ།');
              if (combined === 'Water-Water') return t(UI_LABELS.FORTUNATE_HEALING?.en || 'Healing', UI_LABELS.FORTUNATE_HEALING?.tib || 'སྨན་བཅོས།');
              return t(UI_LABELS.BALANCED_ROUTINE?.en || 'Routine', UI_LABELS.BALANCED_ROUTINE?.tib || 'རྒྱུན་ལྡན།');
            })()}
          </p>
        </div>
      </div>


    </div>
  );
}
