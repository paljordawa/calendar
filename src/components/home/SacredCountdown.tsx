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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <p className="text-[10px]  uppercase  text-stone-400 px-1">
        {t('Upcoming Sacred Days', 'མདུན་ལམ་གྱི་དུས་བཟང་།')}
      </p>
      <div className="flex gap-2 flex-wrap">
        {upcoming.map((obs, i) => (
          <div
            key={i}
            className="flex items-center gap-2  rounded-xl px-3 py-2 shadow-sm"
          >
            <span className="text-[14px]">{obs.icon}</span>
            <div>
              <p className="text-[10px] text-stone-800 leading-none">
                {obs.daysUntil === 1 ? t('Tomorrow', 'སང་ཉིན།') : obs.daysUntil === 0 ? t('Today', 'དེ་རིང་།') : `${t('in', 'ཉིན་')} ${obs.daysUntil}d`}
              </p>
              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wide leading-none mt-0.5">
                {t(obs.name.split('/')[0].trim(), obs.nameTib)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
