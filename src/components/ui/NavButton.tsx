import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={onClick} 
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 w-20 h-14 transition-colors duration-300",
        active ? "text-gold" : "text-stone-500 hover:text-stone-300"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white/10 rounded-2xl z-0 glow"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className={cn("relative z-10 transition-all duration-300", active && "scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]")}>{icon}</div>
      <span className="relative z-10 text-[8px] font-black uppercase tracking-[0.1em]">{label}</span>
    </motion.button>
  );
}
