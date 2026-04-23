import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ActivityItem, ActivityStatus } from '../../lib/sacredInsights';

interface ActivityScoreProps {
  activities: ActivityItem[];
  t: (en: string, tib: string) => string;
}

const STATUS_DOT: Record<ActivityStatus, string> = {
  green: 'bg-emerald-400',
  yellow: 'bg-amber-400',
  red: 'bg-red-400',
};

const STATUS_LABEL: Record<ActivityStatus, { en: string; tib: string }> = {
  green: { en: 'Auspicious', tib: 'བཀྲ་ཤིས།' },
  yellow: { en: 'Neutral', tib: 'འབྲིང་།' },
  red: { en: 'Avoid', tib: 'སྤང་།' },
};

export function ActivityScore({ activities, t }: ActivityScoreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h4 className="text-[11.5px] font-black text-stone-300 uppercase tracking-[0.2em] px-1">
        {t('Activity Guide', 'བྱ་བའི་ལམ་སྟོན།')}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {activities.map((act, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2.5 p-3 rounded-2xl border',
              act.status === 'green' ? 'bg-emerald-50/60 border-emerald-100' :
              act.status === 'red'   ? 'bg-red-50/60 border-red-100' :
                                       'bg-stone-50 border-stone-100'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[act.status])} />
            <div className="min-w-0">
              <p className={cn(
                'text-[10.5px] font-black leading-none',
                act.status === 'green' ? 'text-emerald-800' :
                act.status === 'red'   ? 'text-red-700' : 'text-stone-600'
              )}>
                {t(act.name, act.nameTib)}
              </p>
              <p className="text-[8.5px] font-bold uppercase tracking-wide text-stone-400 mt-0.5">
                {t(STATUS_LABEL[act.status].en, STATUS_LABEL[act.status].tib)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
