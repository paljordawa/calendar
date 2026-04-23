import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LungtaStripProps {
  scores: any;
  t: (en: string, tib: string) => string;
  UI_LABELS: any;
}

export function LungtaStrip({ scores, t, UI_LABELS }: LungtaStripProps) {
  if (!scores) return null;

  const categories = [
    { key: 'vitality', label: UI_LABELS.VITALITY_SOK, color: 'bg-emerald-400 shadow-emerald-500/20' },
    { key: 'body', label: UI_LABELS.BODY_LU, color: 'bg-blue-400 shadow-blue-500/20' },
    { key: 'power', label: UI_LABELS.POWER_WANG, color: 'bg-gold shadow-gold/20' },
    { key: 'luck', label: UI_LABELS.LUCK_LUNGTA, color: 'bg-red-400 shadow-red-500/20' },
  ];

  const scoreMap: Record<string, number> = {
    'mother': 100,
    'son': 75,
    'same': 60,
    'neutral': 40,
    'enemy': 20
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((cat) => {
        const value = scores[cat.key] || 'neutral';
        const percent = scoreMap[value] || 40;
        
        return (
          <div key={cat.key} className="space-y-2">
            <div className="flex flex-col">
              <span className="text-[7.5px] font-black text-stone-500 uppercase tracking-wider truncate">
                {t(cat.label.en, cat.label.tib)}
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className={cn("h-full rounded-full shadow-[0_0_8px] glow", cat.color)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
