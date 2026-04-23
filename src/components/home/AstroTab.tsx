import React from 'react';
import { motion } from 'motion/react';
import { Compass, Zap, Sparkles, Star, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AstroTabProps {
  userData: any;
  yearlyHoroscope: any;
  powerDays: any;
  t: (en: string, tib: string) => string;
  toTibetanNumerals: (num: number | string | undefined) => string;
  setActiveTab: (tab: 'home' | 'calendar' | 'profile') => void;
  UI_LABELS: any;
}

export function AstroTab({ userData, yearlyHoroscope, powerDays, t, toTibetanNumerals, setActiveTab, UI_LABELS }: AstroTabProps) {
  if (!userData.birthAnimal) {
    return (
      <motion.div
        key="astro-onboarding"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-[40px] bg-stone-100/50 border border-stone-200/50 text-center space-y-4"
      >
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-stone-300 mx-auto shadow-sm">
          <Compass size={32} />
        </div>
        <div>
          <h4 className="text-[17.5px] font-serif font-black text-stone-900">{t(UI_LABELS.ASTRO_INSIGHTS.en, UI_LABELS.ASTRO_INSIGHTS.tib)}</h4>
          <p className="text-[12.5px] text-stone-500 max-w-[200px] mx-auto mt-2 leading-relaxed">
            {t(UI_LABELS.UNLOCK_ALIGNMENT_DESC.en, UI_LABELS.UNLOCK_ALIGNMENT_DESC.tib)}
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-[11.5px] font-black uppercase tracking-widest active:scale-95 transition-transform"
        >
          {t(UI_LABELS.SET_BIRTH_DATE.en, UI_LABELS.SET_BIRTH_DATE.tib)}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="astro"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-10"
    >
      {/* Yearly Energy Scores */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.YEARLY_ENERGY_SCORES.en, UI_LABELS.YEARLY_ENERGY_SCORES.tib)}</h3>
          <span className="text-[10.5px] font-bold text-saffron uppercase tracking-widest">{toTibetanNumerals(2026)} {t(UI_LABELS.FIRE_HORSE_YEAR.en, UI_LABELS.FIRE_HORSE_YEAR.tib)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(yearlyHoroscope?.scores || {}).map(([key, value]) => {
            const scoreMap: Record<string, { label: string, color: string, percent: number }> = {
              'mother': { label: t(UI_LABELS.EXCELLENT.en, UI_LABELS.EXCELLENT.tib), color: 'bg-green-500', percent: 100 },
              'son': { label: t(UI_LABELS.GOOD.en, UI_LABELS.GOOD.tib), color: 'bg-emerald-400', percent: 75 },
              'same': { label: t(UI_LABELS.STABLE.en, UI_LABELS.STABLE.tib), color: 'bg-blue-400', percent: 60 },
              'neutral': { label: t(UI_LABELS.NEUTRAL.en, UI_LABELS.NEUTRAL.tib), color: 'bg-stone-500', percent: 40 },
              'enemy': { label: t(UI_LABELS.CHALLENGING.en, UI_LABELS.CHALLENGING.tib), color: 'bg-red-400', percent: 20 }
            };
            const s = scoreMap[value as string] || scoreMap.neutral;
            const labels: Record<string, { en: string, tib: string }> = {
              vitality: { en: UI_LABELS.VITALITY_SOK.en, tib: UI_LABELS.VITALITY_SOK.tib },
              body: { en: UI_LABELS.BODY_LU.en, tib: UI_LABELS.BODY_LU.tib },
              power: { en: UI_LABELS.POWER_WANG.en, tib: UI_LABELS.POWER_WANG.tib },
              luck: { en: UI_LABELS.LUCK_LUNGTA.en, tib: UI_LABELS.LUCK_LUNGTA.tib }
            };

            return (
              <div key={key} className="p-5 rounded-[32px] bg-stone-900 text-white space-y-4 shadow-native">
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none">{t(labels[key].en, labels[key].tib)}</p>
                <div className="space-y-1">
                  <p className="text-[17.5px] font-serif font-black">{s.label}</p>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.percent}%` }}
                      className={cn("h-full rounded-full", s.color)}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Power Days List */}
      <section className="space-y-4">
        <h3 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest px-2">{t(UI_LABELS.WEEKLY_POWER_DAYS.en, UI_LABELS.WEEKLY_POWER_DAYS.tib)}</h3>
        <div className="bg-white rounded-[32px] border border-stone-100 overflow-hidden shadow-sm">
          {[
            { icon: <Sparkles size={16} />, label: t(UI_LABELS.SOUL_DAY.en, UI_LABELS.SOUL_DAY.tib), value: t(powerDays?.la || '', powerDays?.laTib || ''), badge: t(UI_LABELS.BEST.en, UI_LABELS.BEST.tib), color: 'text-green-500 bg-green-50' },
            { icon: <Star size={16} />, label: t(UI_LABELS.VITALITY_DAY.en, UI_LABELS.VITALITY_DAY.tib), value: t(powerDays?.sok || '', powerDays?.sokTib || ''), badge: t(UI_LABELS.STRONG.en, UI_LABELS.STRONG.tib), color: 'text-blue-500 bg-blue-50' },
            { icon: <X size={16} />, label: t(UI_LABELS.CONFLICT_DAY.en, UI_LABELS.CONFLICT_DAY.tib), value: t(powerDays?.enemy || '', powerDays?.enemyTib || ''), badge: t(UI_LABELS.AVOID.en, UI_LABELS.AVOID.tib), color: 'text-red-500 bg-red-50' }
          ].map((day, i) => (
            <div key={i} className={cn("flex items-center justify-between p-5", i !== 0 && "border-t border-stone-50")}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
                  {day.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">{day.label}</p>
                  <p className="text-[15.5px] font-bold text-stone-800">{day.value}</p>
                </div>
              </div>
              <span className={cn("text-[9.5px] font-black px-3 py-1 rounded-full uppercase tracking-widest", day.color)}>{day.badge}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
