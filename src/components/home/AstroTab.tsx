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
      className="space-y-12"
    >
      {/* Yearly Energy Scores */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em]">{t(UI_LABELS.YEARLY_ENERGY_SCORES.en, UI_LABELS.YEARLY_ENERGY_SCORES.tib)}</h3>
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/20">{toTibetanNumerals(2026)} {t(UI_LABELS.FIRE_HORSE_YEAR.en, UI_LABELS.FIRE_HORSE_YEAR.tib)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(yearlyHoroscope?.scores || {}).map(([key, value]) => {
            const scoreMap: Record<string, { label: string, color: string, glow: string, percent: number }> = {
              'mother': { label: t(UI_LABELS.EXCELLENT.en, UI_LABELS.EXCELLENT.tib), color: 'bg-emerald-400', glow: 'shadow-emerald-500/40', percent: 100 },
              'son': { label: t(UI_LABELS.GOOD.en, UI_LABELS.GOOD.tib), color: 'bg-blue-400', glow: 'shadow-blue-500/40', percent: 75 },
              'same': { label: t(UI_LABELS.STABLE.en, UI_LABELS.STABLE.tib), color: 'bg-gold', glow: 'shadow-gold/40', percent: 60 },
              'neutral': { label: t(UI_LABELS.NEUTRAL.en, UI_LABELS.NEUTRAL.tib), color: 'bg-stone-500', glow: 'shadow-stone-500/40', percent: 40 },
              'enemy': { label: t(UI_LABELS.CHALLENGING.en, UI_LABELS.CHALLENGING.tib), color: 'bg-red-500', glow: 'shadow-red-500/40', percent: 20 }
            };
            const s = scoreMap[value as string] || scoreMap.neutral;
            const labels: Record<string, { en: string, tib: string }> = {
              vitality: { en: UI_LABELS.VITALITY_SOK.en, tib: UI_LABELS.VITALITY_SOK.tib },
              body: { en: UI_LABELS.BODY_LU.en, tib: UI_LABELS.BODY_LU.tib },
              power: { en: UI_LABELS.POWER_WANG.en, tib: UI_LABELS.POWER_WANG.tib },
              luck: { en: UI_LABELS.LUCK_LUNGTA.en, tib: UI_LABELS.LUCK_LUNGTA.tib }
            };

            return (
              <div key={key} className="p-6 rounded-[32px] glass text-white space-y-4 shadow-xl border border-white/5 group hover:border-white/10 transition-colors">
                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest leading-none">{t(labels[key].en, labels[key].tib)}</p>
                <div className="space-y-2">
                  <p className="text-[18px] font-serif font-black">{s.label}</p>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.percent}%` }}
                      className={cn("h-full rounded-full glow", s.color, s.glow)}
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
        <h3 className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] px-2">{t(UI_LABELS.WEEKLY_POWER_DAYS.en, UI_LABELS.WEEKLY_POWER_DAYS.tib)}</h3>
        <div className="glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
          {[
            { icon: <Sparkles size={16} />, label: t(UI_LABELS.SOUL_DAY.en, UI_LABELS.SOUL_DAY.tib), value: t(powerDays?.la || '', powerDays?.laTib || ''), badge: t(UI_LABELS.BEST.en, UI_LABELS.BEST.tib), color: 'text-emerald-400 bg-emerald-400/10' },
            { icon: <Star size={16} />, label: t(UI_LABELS.VITALITY_DAY.en, UI_LABELS.VITALITY_DAY.tib), value: t(powerDays?.sok || '', powerDays?.sokTib || ''), badge: t(UI_LABELS.STRONG.en, UI_LABELS.STRONG.tib), color: 'text-blue-400 bg-blue-400/10' },
            { icon: <X size={16} />, label: t(UI_LABELS.CONFLICT_DAY.en, UI_LABELS.CONFLICT_DAY.tib), value: t(powerDays?.enemy || '', powerDays?.enemyTib || ''), badge: t(UI_LABELS.AVOID.en, UI_LABELS.AVOID.tib), color: 'text-red-400 bg-red-400/10' }
          ].map((day, i) => (
            <div key={i} className={cn("flex items-center justify-between p-6", i !== 0 && "border-t border-white/5")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-stone-400 border border-white/5">
                  {day.icon}
                </div>
                <div>
                  <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none mb-1">{day.label}</p>
                  <p className="text-[17px] font-serif font-black text-white">{day.value}</p>
                </div>
              </div>
              <span className={cn("text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-current/20", day.color)}>{day.badge}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
