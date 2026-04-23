import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, X, Trash2, MoreHorizontal, Sparkles, Copy, StickyNote } from 'lucide-react';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import { cn, toTibetanNumerals } from '../../lib/utils';
import { DATABASE_2026 } from '../../lib/database2026';

interface SacredTabProps {
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  sortedFestivals: any[];
  festivalSearch: string;
  setFestivalSearch: (val: string) => void;
  setIsFestivalSheetOpen: (val: boolean) => void;
  t: (en: string, tib: string) => string;
  UI_LABELS: any;
  setSelectedDate: (date: Date) => void;
  setIsNoteSheetOpen: (val: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export function SacredTab({ 
  userData, 
  setUserData, 
  sortedFestivals, 
  festivalSearch, 
  setFestivalSearch, 
  setIsFestivalSheetOpen, 
  t, 
  UI_LABELS,
  setSelectedDate,
  setIsNoteSheetOpen,
  setActiveTab
}: SacredTabProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-serif font-black text-stone-950">
            {t(UI_LABELS.GRAND.en, UI_LABELS.GRAND.tib)} <br /> 
            <span className="text-stone-400 font-light italic">{t(UI_LABELS.GRAND_DUCHEN.en, UI_LABELS.GRAND_DUCHEN.tib)}</span>
          </h1>
          <button
            onClick={() => setIsFestivalSheetOpen(true)}
            className="p-4 bg-saffron text-white rounded-3xl active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-saffron transition-colors" />
          <input
            type="text"
            value={festivalSearch}
            onChange={(e) => setFestivalSearch(e.target.value)}
            placeholder={t(UI_LABELS.SEARCH_FESTIVALS.en, UI_LABELS.SEARCH_FESTIVALS.tib)}
            className="w-full bg-stone-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-[13.5px] font-bold text-stone-800 placeholder:text-stone-300 focus:ring-2 focus:ring-saffron/20 transition-all"
          />
          {festivalSearch && (
            <button 
              onClick={() => setFestivalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-300 hover:text-stone-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Custom Festivals Section */}
      {(userData.customFestivals && userData.customFestivals.length > 0) && (
        <section className="space-y-4">
          <h3 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.IMPORTANT_DATES.en, UI_LABELS.IMPORTANT_DATES.tib)}</h3>
          <div className="space-y-3">
            {userData.customFestivals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((f: any) => (
              <div key={f.id} className="bg-amber-50/50 p-5 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-saffron flex flex-col items-center justify-center text-white text-[11.5px] font-bold shadow-sm">
                    <span className="text-[9.5px] opacity-70">{format(parseISO(f.date), 'MMM')}</span>
                    <span className="text-[19.5px] leading-none">{format(parseISO(f.date), 'd')}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[15.5px] font-bold text-stone-900 truncate">{f.name}</h4>
                    <p className="text-[12.5px] text-stone-500 line-clamp-1 italic">{f.description}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                    className={cn(
                      "p-2 rounded-full transition-all active:scale-90",
                      openMenuId === f.id ? "bg-amber-100 text-stone-900" : "text-stone-300 hover:text-saffron"
                    )}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  <AnimatePresence>
                    {openMenuId === f.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                          className="absolute right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 z-20 min-w-[140px] flex flex-col gap-1"
                        >
                          <button
                            onClick={() => {
                              setSelectedDate(new Date(f.date));
                              setIsNoteSheetOpen(true);
                              setActiveTab('calendar');
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-xl transition-colors text-left"
                          >
                            <StickyNote size={14} className="text-stone-400" />
                            <span className="text-[12.5px] font-bold text-stone-700">{t('Add Note', 'ཟིན་ཐོ་འགོད།')}</span>
                          </button>
                          <button
                            onClick={() => {
                              setUserData((prev: any) => ({
                                ...prev,
                                customFestivals: prev.customFestivals?.filter((cf: any) => cf.id !== f.id)
                              }));
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-left"
                          >
                            <Trash2 size={14} className="text-tibetan-red" />
                            <span className="text-[12.5px] font-bold text-tibetan-red">{t('Delete', 'སུབ་པ།')}</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Traditional Festivals Section */}
      <section className="space-y-4">
        <h3 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.TRADITIONAL_CALENDAR.en, UI_LABELS.TRADITIONAL_CALENDAR.tib)}</h3>
        <div className="space-y-3">
          {sortedFestivals
            .filter(f => 
              f.name.toLowerCase().includes(festivalSearch.toLowerCase()) || 
              (f.nameTib && f.nameTib.includes(festivalSearch))
            )
            .map((f, i) => {
              const dbEntry = Object.entries(DATABASE_2026).find(([_, d]) => d.tibMonth === f.month && d.tibDay === f.day);
              const westernDate = dbEntry?.[1].westernDate;
              const isoDate = dbEntry?.[0];
              const isPast = isoDate ? startOfDay(new Date(isoDate)) < startOfDay(new Date()) : false;
              const isTodayFestival = isoDate ? isSameDay(new Date(isoDate), new Date()) : false;

              return (
                <div key={i} className={cn(
                  "bg-white p-5 rounded-3xl flex items-center gap-5 border border-stone-50 transition-all relative",
                  isPast && "opacity-40 grayscale-[0.5]",
                  isTodayFestival && "ring-2 ring-saffron bg-saffron/5 border-saffron/20"
                )}>
                  <div className={cn(
                    "w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center text-white font-bold",
                    isTodayFestival ? "bg-saffron" : "bg-stone-900"
                  )}>
                    <span className="text-[10.5px] opacity-70">ཟླ་{toTibetanNumerals(f.month)}</span>
                    <span className="text-[15.5px] leading-none mt-0.5">ཚེས་{toTibetanNumerals(f.day)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-[11.5px] font-black uppercase tracking-widest mb-0.5",
                      isTodayFestival ? "text-saffron-700" : "text-saffron"
                    )}>
                      {westernDate || 'TBA'} {isTodayFestival && '• TODAY'}
                    </div>
                    <h4 className="text-[15.5px] font-bold text-stone-900 truncate">{t(f.name, f.nameTib || f.name)}</h4>
                    <p className="text-[12.5px] text-stone-400 line-clamp-1 italic">{t(f.description, f.descriptionTib || f.description)}</p>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === i ? null : i)}
                      className={cn(
                        "p-2 rounded-full transition-all active:scale-90",
                        openMenuId === i ? "bg-stone-100 text-stone-900" : "text-stone-300 hover:text-stone-500"
                      )}
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    <AnimatePresence>
                      {openMenuId === i && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                            className="absolute right-0 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 z-20 min-w-[140px] flex flex-col gap-1"
                          >
                            <button
                              onClick={() => {
                                if (isoDate) {
                                  setSelectedDate(new Date(isoDate));
                                  setIsNoteSheetOpen(true);
                                  setActiveTab('calendar');
                                }
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-xl transition-colors text-left"
                            >
                              <StickyNote size={14} className="text-stone-400" />
                              <span className="text-[12.5px] font-bold text-stone-700">{t('Add Note', 'ཟིན་ཐོ་འགོད།')}</span>
                            </button>
                            <button
                              onClick={() => {
                                const text = `${t(f.name, f.nameTib || f.name)} - ${westernDate || ''} (Tibetan Month ${f.month}, Day ${f.day})`;
                                navigator.clipboard.writeText(text);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 rounded-xl transition-colors text-left"
                            >
                              <Copy size={14} className="text-stone-400" />
                              <span className="text-[12.5px] font-bold text-stone-700">{t('Copy Info', 'འདྲ་བཤུས།')}</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </motion.div>
  );
}
