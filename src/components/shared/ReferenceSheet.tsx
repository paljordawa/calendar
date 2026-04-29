import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen } from 'lucide-react';
import {
  UI_LABELS,
  MENTSKHANG_SYMBOLS,
  ANIMAL_CHARACTERISTICS,
  ANIMAL_ICONS,
  TIBETAN_ANIMALS,
  ELEMENT_CHARACTERISTICS,
  PARKHA_CHARACTERISTICS,
  PARKHA_ICONS,
  MEWA_CHARACTERISTICS,
  MEWA_ICONS
} from '../../constants';

interface ReferenceSheetProps {
  onClose: () => void;
  language: 'English' | 'Tibetan';
}

export function ReferenceSheet({ onClose, language }: ReferenceSheetProps) {
  const isTib = language === 'Tibetan';
  const t = (en: string, tib: string) => isTib ? tib : en;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed inset-0 glass z-[101] flex flex-col pt-safe px-4 pb-safe"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-1 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 flex items-center justify-center text-gold">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-[24px] font-serif font-black text-white leading-tight">{t('Reference Guide', 'ལམ་སྟོན་ཡིག་ཆ།')}</h2>
            <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">{t('Symbols & Icons', 'མཚོན་རྟགས་དང་འགྲེལ་བཤད།')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pb-8 px-2">
        
        {/* Mentskhang Symbols */}
        <section className="space-y-2 mt-4">
          <h3 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] pb-2 border-b border-white/10">
            {t('Mentskhang Daily Symbols', 'སྨན་རྩིས་ཁང་གི་ཉིན་རེའི་མཚོན་རྟགས།')}
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(MENTSKHANG_SYMBOLS).map(([key, data]) => (
              <div key={key} className="py-3 flex gap-4 items-start">
                <span className="text-[20px] leading-none mt-0.5">{data.icon}</span>
                <div className="space-y-1 flex-1">
                  <span className="text-[13px] font-black text-white tracking-widest uppercase">{t(data.en, data.tib)}</span>
                  <p className="text-[12px] text-stone-400 leading-relaxed">{t(data.description, data.descriptionTib)}</p>
                  {(data.forbidden && data.forbidden.length > 0) && (
                    <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {(isTib ? data.forbiddenTib : data.forbidden).map((f, i) => (
                        <span key={i} className="text-[10px] text-red-400/80 uppercase">
                          • {t('Avoid', 'འཛེམས་བྱ།')}: {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Animal Signs */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] pb-2 border-b border-white/10">
            {t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(ANIMAL_CHARACTERISTICS).map(([animal, desc]) => (
              <div key={animal} className="py-3 flex gap-4 items-start">
                <span className="text-[20px] leading-none mt-0.5">{ANIMAL_ICONS[animal as keyof typeof ANIMAL_ICONS]}</span>
                <div className="space-y-1 flex-1">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">{t(animal, TIBETAN_ANIMALS[animal as keyof typeof TIBETAN_ANIMALS])}</h4>
                  <p className="text-[12px] text-stone-400 leading-relaxed">{t(desc.en, desc.tib)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Elements */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] pb-2 border-b border-white/10">
            {t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(ELEMENT_CHARACTERISTICS).map(([element, desc]) => (
              <div key={element} className="py-3 flex gap-4 items-start">
                <div className="space-y-1 flex-1">
                  <h4 className="text-[13px] font-black text-emerald-400 uppercase tracking-widest">{t(element, desc.nameTib)}</h4>
                  <p className="text-[12px] text-stone-400 leading-relaxed">{t(desc.en, desc.tib)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Parkha */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] pb-2 border-b border-white/10">
            {t(UI_LABELS.TRIGRAM_PARKHA.en, UI_LABELS.TRIGRAM_PARKHA.tib)}
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(PARKHA_CHARACTERISTICS).map(([parkha, desc]) => (
              <div key={parkha} className="py-3 flex gap-4 items-start">
                <span className="text-[20px] leading-none mt-0.5">{PARKHA_ICONS[parkha as keyof typeof PARKHA_ICONS]}</span>
                <div className="space-y-1 flex-1">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">{parkha}</h4>
                  <p className="text-[12px] text-stone-400 leading-relaxed">{t(desc.en, desc.tib)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mewa */}
        <section className="space-y-2">
          <h3 className="text-[12px] font-black text-gold uppercase tracking-[0.2em] pb-2 border-b border-white/10">
            {t(UI_LABELS.MAGIC_SQ_MEWA.en, UI_LABELS.MAGIC_SQ_MEWA.tib)}
          </h3>
          <div className="divide-y divide-white/5">
            {Object.entries(MEWA_CHARACTERISTICS).map(([mewa, desc]) => (
              <div key={mewa} className="py-3 flex gap-4 items-start">
                <span className="text-[20px] leading-none mt-0.5">{MEWA_ICONS[mewa as keyof typeof MEWA_ICONS]}</span>
                <div className="space-y-1 flex-1">
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">{mewa.split('-')[1]}</h4>
                  <p className="text-[12px] text-stone-400 leading-relaxed">{t(desc.en, desc.tib)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
