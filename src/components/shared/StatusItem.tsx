import React from 'react';
import { cn } from '../../lib/utils';

interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
  color?: string;
}

export function StatusItem({ icon, label, detail, color }: StatusItemProps) {
  return (
    <div className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 group">
      <div className={cn("w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[19.5px] shrink-0 transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-[12.5px] font-black text-stone-200 uppercase tracking-wide">{label}</h5>
        <p className="text-[11.5px] text-stone-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
