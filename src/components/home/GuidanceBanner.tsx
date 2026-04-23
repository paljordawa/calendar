import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { DailyGuidance } from '../../lib/sacredInsights';

interface GuidanceBannerProps {
  guidance: DailyGuidance;
  t: (en: string, tib: string) => string;
}

export function GuidanceBanner({ guidance, t }: GuidanceBannerProps) {
  const bg = guidance.tone === 'auspicious'
    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
    : guidance.tone === 'caution'
    ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
    : 'bg-gradient-to-br from-stone-50 to-stone-100/60 border-stone-100';

  const iconBg = guidance.tone === 'auspicious'
    ? 'bg-amber-100'
    : guidance.tone === 'caution'
    ? 'bg-red-100'
    : 'bg-stone-200';

  const headlineColor = guidance.tone === 'auspicious'
    ? 'text-amber-900'
    : guidance.tone === 'caution'
    ? 'text-red-900'
    : 'text-stone-800';

  const bodyColor = guidance.tone === 'auspicious'
    ? 'text-amber-800/70'
    : guidance.tone === 'caution'
    ? 'text-red-800/70'
    : 'text-stone-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-[28px] border p-5 flex items-start gap-4', bg)}
    >
      {/* Icon */}
      <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] flex-shrink-0', iconBg)}>
        {guidance.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">
          {t("Today's Guidance", 'དེ་རིང་གི་ལམ་སྟོན།')}
        </p>
        <h4 className={cn('text-[15px] font-serif font-black leading-snug mb-1', headlineColor)}>
          {t(guidance.headline, guidance.headlineTib)}
        </h4>
        <p className={cn('text-[11.5px] leading-relaxed', bodyColor)}>
          {t(guidance.body, guidance.bodyTib)}
        </p>
      </div>
    </motion.div>
  );
}
