import React from 'react';
import { motion } from 'motion/react';
import { UpcomingDay } from '../../lib/sacredInsights';

interface SacredCountdownProps {
  upcoming: UpcomingDay[];
  t: (en: string, tib: string) => string;
}

export function SacredCountdown({ upcoming, t }: SacredCountdownProps) {
  if (!upcoming.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600 px-1">
        {t('Upcoming Sacred Days', 'མདུན་ལམ་གྱི་དུས་བཟང་།')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {upcoming.map((obs, i) => (
          <div
            key={i}
            className="flex items-center gap-4 glass rounded-2xl px-4 py-3 border border-white/5 hover:border-gold/20 transition-colors group"
          >
            <span className="text-[20px] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">{obs.icon}</span>
            <div className="min-w-0">
              <p className="text-[12px] text-white font-serif font-black leading-none truncate">
                {t(obs.name.split('/')[0].trim(), obs.nameTib)}
              </p>
              <p className="text-[9px] text-gold font-black uppercase tracking-widest leading-none mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gold/50" />
                {obs.daysUntil === 1 ? t('Tomorrow', 'སང་ཉིན།') : obs.daysUntil === 0 ? t('Today', 'དེ་རིང་།') : `${t('in', 'ཉིན་')} ${obs.daysUntil}d`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
