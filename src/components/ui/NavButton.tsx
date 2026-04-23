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
        "relative flex flex-col items-center justify-center gap-1 w-20 h-12 transition-colors duration-300",
        active ? "text-saffron" : "text-stone-400"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-saffron/5 rounded-2xl z-0"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className={cn("relative z-10 transition-transform", active && "scale-110")}>{icon}</div>
      <span className="relative z-10 text-[9.5px] font-black uppercase tracking-tighter">{label}</span>
    </motion.button>
  );
}
