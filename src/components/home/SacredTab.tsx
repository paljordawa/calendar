import React, { useState } from 'react';
import { Plus, Search, X, Trash2, MoreHorizontal, Sparkles, Copy, StickyNote, Compass } from 'lucide-react';
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
    <div
      className="space-y-10 pb-20"
    >
      <header className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-[32px] font-serif font-black text-white leading-tight">
              {t(UI_LABELS.GRAND.en, UI_LABELS.GRAND.tib)}
            </h1>
            <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em] mt-1">
              {t(UI_LABELS.GRAND_DUCHEN.en, UI_LABELS.GRAND_DUCHEN.tib)}
            </p>
          </div>
          <button
            onClick={() => setIsFestivalSheetOpen(true)}
            className="w-14 h-14 text-gold active:scale-95 transition-transform flex items-center justify-center"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group px-1">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            value={festivalSearch}
            onChange={(e) => setFestivalSearch(e.target.value)}
            placeholder={t(UI_LABELS.SEARCH_FESTIVALS.en, UI_LABELS.SEARCH_FESTIVALS.tib)}
            className="w-full bg-white/5 border border-white/5 rounded-[10px] py-4 pl-14 pr-6 text-[14px] font-bold text-white placeholder:text-stone-700 focus:ring-2 focus:ring-gold/20 outline-none transition-all"
          />
          {festivalSearch && (
            <button 
              onClick={() => setFestivalSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Custom Festivals Section */}
      {(userData.customFestivals && userData.customFestivals.length > 0) && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <Sparkles size={13} className="text-stone-600" />
            <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">{t(UI_LABELS.IMPORTANT_DATES.en, UI_LABELS.IMPORTANT_DATES.tib)}</h3>
          </div>
          <div className="space-y-4">
            {userData.customFestivals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((f: any) => (
              <div key={f.id} className="glass p-3 rounded-[10px] border border-white/5 flex items-center justify-between gap-4 group hover:border-gold/20 transition-all shadow-xl shadow-black/20">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-14 h-14 shrink-0 rounded-[10px] bg-gold flex flex-col items-center justify-center text-midnight font-bold shadow-lg shadow-gold/10 glow">
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none opacity-60">{format(parseISO(f.date), 'MMM')}</span>
                    <span className="text-[22px] font-serif font-black leading-none mt-1">{format(parseISO(f.date), 'd')}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[17px] font-serif font-black text-white truncate">{f.name}</h4>
                    <p className="text-[12px] text-stone-500 line-clamp-1 italic font-medium mt-0.5">{f.description}</p>
                  </div>
                </div>
                <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center transition-all active:scale-90",
                        openMenuId === f.id ? "text-gold" : "text-stone-500 hover:text-white"
                      )}
                    >
                    <MoreHorizontal size={20} />
                  </button>

                    {openMenuId === f.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)} 
                        />
                          <div
                            className="absolute right-0 bottom-full mb-2 glass rounded-[10px] shadow-2xl border border-white/10 p-2 z-20 min-w-[150px] flex flex-col gap-1"
                          >
                            <button
                              onClick={() => {
                                setSelectedDate(new Date(f.date));
                                setIsNoteSheetOpen(true);
                                setActiveTab('calendar');
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-[10px] transition-colors text-left"
                            >
                              <StickyNote size={14} className="text-gold" />
                              <span className="text-[12px] font-black uppercase tracking-widest text-white">{t('Add Note', 'ཟིན་ཐོ་འགོད།')}</span>
                            </button>
                            <button
                              onClick={() => {
                                setUserData((prev: any) => ({
                                  ...prev,
                                  customFestivals: prev.customFestivals?.filter((cf: any) => cf.id !== f.id)
                                }));
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-3 hover:bg-red-400/20 rounded-[10px] transition-colors text-left"
                            >
                              <Trash2 size={14} className="text-red-400" />
                              <span className="text-[12px] font-black uppercase tracking-widest text-red-400">{t('Delete', 'སུབ་པ།')}</span>
                            </button>
                          </div>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Traditional Festivals Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Compass size={13} className="text-stone-600" />
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">{t(UI_LABELS.TRADITIONAL_CALENDAR.en, UI_LABELS.TRADITIONAL_CALENDAR.tib)}</h3>
        </div>
        <div className="space-y-4">
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
                  "glass p-3 rounded-[10px] flex items-center gap-5 border border-white/5 transition-all relative group shadow-2xl shadow-black/40",
                  isPast && "opacity-40 grayscale-[0.5]",
                  isTodayFestival && "ring-2 ring-gold bg-gold/5 border-gold/20"
                )}>
                  <div className={cn(
                    "w-14 h-14 shrink-0 rounded-[10px] flex flex-col items-center justify-center font-bold shadow-lg transition-all duration-500",
                    isTodayFestival ? "bg-gold text-midnight glow" : "bg-white/10 text-stone-400 group-hover:bg-white/20 group-hover:text-white"
                  )}>
                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-60 leading-none">ཟླ་{toTibetanNumerals(f.month)}</span>
                    <span className="text-[18px] font-serif font-black leading-none mt-1">ཚེས་{toTibetanNumerals(f.day)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2",
                      isTodayFestival ? "text-gold" : "text-stone-600"
                    )}>
                      {westernDate || 'TBA'} {isTodayFestival && <span className="px-2 py-0.5 bg-gold text-midnight rounded-full text-[8px] tracking-widest shadow-sm">TODAY</span>}
                    </div>
                    <h4 className="text-[17px] font-serif font-black text-white truncate leading-tight">{t(f.name, f.nameTib || f.name)}</h4>
                    <p className="text-[12px] text-stone-500 line-clamp-1 italic font-medium mt-1">{t(f.description, f.descriptionTib || f.description)}</p>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === i ? null : i)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center transition-all active:scale-90",
                        openMenuId === i ? "text-gold" : "text-stone-500 hover:text-white"
                      )}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                      {openMenuId === i && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)} 
                          />
                          <div
                            className="absolute right-0 bottom-full mb-2 glass rounded-[10px] shadow-2xl border border-white/10 p-2 z-20 min-w-[150px] flex flex-col gap-1"
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
                              className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-[10px] transition-colors text-left"
                            >
                              <StickyNote size={14} className="text-gold" />
                              <span className="text-[12px] font-black uppercase tracking-widest text-white">{t('Add Note', 'ཟིན་ཐོ་འགོད།')}</span>
                            </button>
                            <button
                              onClick={() => {
                                const text = `${t(f.name, f.nameTib || f.name)} - ${westernDate || ''} (Tibetan Month ${f.month}, Day ${f.day})`;
                                navigator.clipboard.writeText(text);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-[10px] transition-colors text-left"
                            >
                              <Copy size={14} className="text-gold" />
                              <span className="text-[12px] font-black uppercase tracking-widest text-white">{t('Copy Info', 'འདྲ་བཤུས།')}</span>
                            </button>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
