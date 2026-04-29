import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bell, Calendar as CalendarIcon, ChevronRight, StickyNote, Zap } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { TodayCard } from './TodayCard';
import { SacredCountdown } from './SacredCountdown';
import { TibetanDate } from '../../lib/tibetanCalendar';
import { getDailyGuidance, getUpcomingObservances, getMeritMultiplier } from '../../lib/sacredInsights';
import { LungtaStrip } from '../shared/LungtaStrip';

interface TodayTabProps {
  tibCurrent: TibetanDate;
  userData: any;
  t: (en: string, tib: string) => string;
  n: (val: any) => string;
  toTibetanNumerals: (val: any) => string;
  setActiveTab: (tab: any) => void;
  setSelectedDate: (date: Date) => void;
  UI_LABELS: any;
  TIBETAN_WEEKDAYS: any;
  TIBETAN_ELEMENTS: any;
  TIBETAN_ANIMALS: any;
  ANIMAL_ICONS: any;
  MONTHLY_OBSERVANCES: any[];
  yearlyHoroscope: any;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  tibCurrent,
  userData,
  t,
  n,
  toTibetanNumerals,
  setActiveTab,
  setSelectedDate,
  UI_LABELS,
  TIBETAN_WEEKDAYS,
  TIBETAN_ELEMENTS,
  TIBETAN_ANIMALS,
  ANIMAL_ICONS,
  MONTHLY_OBSERVANCES,
  yearlyHoroscope
}) => {
  const guidance = getDailyGuidance(tibCurrent);
  const upcoming = getUpcomingObservances(tibCurrent.day);
  const merit = getMeritMultiplier(tibCurrent.day, tibCurrent.month);

  return (
    <motion.div
      key="guidance"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-8"
    >
      {/* Persistent Lungta Energy Strip */}
      <div className="px-1 pt-2">
        <LungtaStrip scores={yearlyHoroscope?.scores} t={t} UI_LABELS={UI_LABELS} />
      </div>

      {/* Alignment Onboarding Hint */}
      {!userData.birthDate && !userData.tibetanBirthYear && (
        <motion.button
          onClick={() => setActiveTab('profile')}
          className="p-4 rounded-[10px] glass text-white relative overflow-hidden group active:scale-[0.98] transition-all text-left block w-full shadow-2xl shadow-black/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="relative flex items-center gap-5">
            <div className="w-12 h-12 flex items-center justify-center text-gold shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-[15.5px] font-serif font-black">{t(UI_LABELS.UNLOCK_ALIGNMENT?.en || 'Sacred Resonance', UI_LABELS.UNLOCK_ALIGNMENT?.tib || 'མཐུན་འཕྲོད་བྱིན་རླབས།')}</h4>
              <p className="text-[10.5px] text-stone-500 font-bold uppercase tracking-widest mt-1 opacity-80 leading-relaxed">
                {t(UI_LABELS.UNLOCK_ALIGNMENT_DESC?.en || 'Complete your profile', UI_LABELS.UNLOCK_ALIGNMENT_DESC?.tib || 'རང་གི་གནས་ཚུལ་བསྐང་ནས་མཐུན་འཕྲོད་ལྟ་བ།')}
              </p>
            </div>
          </div>
        </motion.button>
      )}

      {/* Today Card Widget */}
      <TodayCard
        tibCurrent={tibCurrent}
        userData={userData}
        t={t}
        n={n}
        toTibetanNumerals={toTibetanNumerals}
        UI_LABELS={UI_LABELS}
        TIBETAN_WEEKDAYS={TIBETAN_WEEKDAYS}
      />



      {/* Merit Multiplier Alert */}
      {merit && (
        <div className="bg-gold text-midnight p-4 rounded-[10px] flex items-center gap-4 shadow-lg shadow-gold/20 glow">
          <div className="w-10 h-10 flex items-center justify-center">
            <Zap size={20} className="fill-current" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">{t('Power Day', 'དུས་བཟང་བྱིན་ཅན།')}</p>
            <p className="text-[14px] font-bold leading-tight">{t(merit.label, merit.labelTib)}</p>
          </div>
        </div>
      )}

      {/* Sacred Countdown */}
      <SacredCountdown upcoming={upcoming} t={t} />

      {/* Special Observance Notice */}
      {(tibCurrent.day === 8 || tibCurrent.day === 10 || tibCurrent.day === 15 || tibCurrent.day === 25 || tibCurrent.day === 30) && (
        <div className="p-3 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center text-gold">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-[11.5px] font-black text-gold uppercase tracking-widest">{t(UI_LABELS.SPECIAL_OBSERVANCE?.en || 'Special Observance', UI_LABELS.SPECIAL_OBSERVANCE?.tib || 'དུས་ཁྱད་པར་ཅན།')}</p>
              <h4 className="text-[15.5px] font-serif font-black text-white">
                {t(MONTHLY_OBSERVANCES.find(o => o.day === tibCurrent.day)?.name || 'Sacred Day', MONTHLY_OBSERVANCES.find(o => o.day === tibCurrent.day)?.nameTib || 'དུས་བཟང་།')}
              </h4>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setActiveTab('calendar');
            }}
            className="p-3 rounded-[10px] bg-white/10 text-white hover:bg-gold hover:text-midnight transition-colors"
          >
            <CalendarIcon size={16} />
          </button>
        </div>
      )}

      {/* My Notes Section */}
      {Object.keys(userData.notes).length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <StickyNote size={13} className="text-stone-500" />
              <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                {t(UI_LABELS.MY_NOTES?.en || 'My Notes', UI_LABELS.MY_NOTES?.tib || 'ཟིན་ཐོ།')}
              </h3>
            </div>
            <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {Object.keys(userData.notes).length} {t(UI_LABELS.ENTRIES?.en || 'Entries', UI_LABELS.ENTRIES?.tib || 'ཟིན་ཐོ།')}
            </span>
          </div>
          <div className="space-y-4">
            {Object.entries(userData.notes)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 3) // Show only recent 3 for cleaner dashboard
              .map(([dateStr, note]) => {
                const sticker = userData.stickers?.[dateStr];
                return (
                  <motion.button
                    key={dateStr}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setSelectedDate(parseISO(dateStr));
                      setActiveTab('calendar');
                    }}
                    className="w-full glass p-3 rounded-[10px] border border-white/5 flex items-center gap-5 text-left active:scale-[0.98] transition-all group shadow-lg"
                  >
                    {/* Date badge */}
                    <div className="w-12 h-12 rounded-[10px] bg-white/5 flex flex-col items-center justify-center text-stone-500 font-bold group-hover:bg-gold/10 group-hover:text-gold transition-colors flex-shrink-0">
                      <span className="text-[10px] uppercase tracking-tighter leading-none">{format(parseISO(dateStr), 'MMM')}</span>
                      <span className="text-[19px] font-black leading-tight mt-0.5">{format(parseISO(dateStr), 'd')}</span>
                    </div>
                    {/* Note content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-stone-600 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        {t(format(parseISO(dateStr), 'EEEE'), TIBETAN_WEEKDAYS[format(parseISO(dateStr), 'EEEE')] || format(parseISO(dateStr), 'EEEE'))}
                        {userData.reminders?.[dateStr] && <Bell size={10} className="text-gold fill-gold/20" />}
                      </p>
                      <p className="text-[15px] text-stone-200 line-clamp-1 leading-snug font-medium">
                        {note as string}
                      </p>
                      {/* Sticker label */}
                      {sticker && (sticker.emoji || sticker.label) && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {sticker.emoji && <span className="text-[12px]">{sticker.emoji}</span>}
                          {sticker.label && (
                            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                              {sticker.label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-stone-800 group-hover:text-gold transition-colors flex-shrink-0" />
                  </motion.button>
                );
              })}
          </div>
        </section>
      )}
    </motion.div>
  );
};
