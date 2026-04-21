import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Moon, 
  Sun, 
  Bell,
  Sparkles,
  Home,
  Star,
  Settings,
  MoreHorizontal,
  Compass,
  Plus,
  StickyNote,
  X,
  Trash2,
  Clock,
  Check,
  Info,
  Loader2,
  ChevronDown,
  User,
  Search,
  Pencil
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday as isDateToday, parseISO, isWithinInterval, startOfDay, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { getTibetanDate, getTibetanYearInfo, FESTIVALS, TibetanDate, ANIMALS, ELEMENTS } from './lib/tibetanCalendar';
import { cn, cn_id, UI_IDS } from './lib/utils';
import { 
  STICKERS, 
  HOROSCOPE_RULES, 
  ANIMAL_CHARACTERISTICS, 
  ANIMAL_ICONS, 
  PARKHA_ICONS, 
  MEWA_ICONS, 
  PARKHA_CHARACTERISTICS, 
  MEWA_CHARACTERISTICS 
} from './constants';

type Tab = 'home' | 'calendar' | 'profile';
type HomeTab = 'guidance' | 'astro' | 'days';

interface CustomFestival {
  id: string;
  name: string;
  date: string;
  description: string;
}

interface UserData {
  notes: Record<string, string>;
  reminders: Record<string, boolean>;
  stickers: Record<string, { emoji?: string, label?: string }>;
  name?: string;
  birthAnimal?: string;
  birthElement?: string;
  birthDate?: string;
  language?: 'English' | 'Tibetan';
  onboardingComplete?: boolean;
  customFestivals?: CustomFestival[];
}

const getElementalHarmony = (birth: string | undefined, day: string) => {
  if (!birth) return 'neutral';
  const index: Record<string, number> = { "Fire": 0, "Earth": 1, "Iron": 2, "Water": 3, "Wood": 4 };
  const b = index[birth];
  const d = index[day];
  const diff = (d - b + 5) % 5;
  if (diff === 4) return 'life'; // Day supports Birth (Mother)
  if (diff === 1) return 'son';  // Birth supports Day (Prosperity)
  if (diff === 0) return 'same'; // Same energy
  if (diff === 2) return 'enemy';
  return 'neutral';
};

const getAnimalAffinity = (birth: string | undefined, day: string) => {
  if (!birth) return 'neutral';
  
  const trines = [
    ['Rat', 'Dragon', 'Monkey'],
    ['Ox', 'Snake', 'Bird'],
    ['Tiger', 'Horse', 'Dog'],
    ['Rabbit', 'Sheep', 'Pig']
  ];
  
  const oppositions: Record<string, string> = {
    'Rat': 'Horse', 'Horse': 'Rat',
    'Ox': 'Sheep', 'Sheep': 'Ox',
    'Tiger': 'Monkey', 'Monkey': 'Tiger',
    'Rabbit': 'Bird', 'Bird': 'Rabbit',
    'Dragon': 'Dog', 'Dog': 'Dragon',
    'Snake': 'Pig', 'Pig': 'Snake'
  };

  if (birth === day) return 'same';
  if (oppositions[birth] === day) return 'conflict';
  if (trines.some(t => t.includes(birth) && t.includes(day))) return 'trine';
  
  return 'neutral';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [homeTab, setHomeTab] = useState<HomeTab>('guidance');
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [isFestivalSheetOpen, setIsFestivalSheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isPrivacySheetOpen, setIsPrivacySheetOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [direction, setDirection] = useState(0);
  const [searchRange, setSearchRange] = useState({ 
    start: format(new Date(), 'yyyy-MM-dd'), 
    end: format(addMonths(new Date(), 1), 'yyyy-MM-dd') 
  });
  const [newFestival, setNewFestival] = useState({ name: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
  const [horoscope, setHoroscope] = useState<string | null>(null);
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('men_tsee_khang_user_data');
    const defaults = { notes: {}, reminders: {}, stickers: {} };
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('men_tsee_khang_user_data', JSON.stringify(userData));
  }, [userData]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const tibSelected = useMemo(() => getTibetanDate(selectedDate), [selectedDate]);
  const tibCurrent = useMemo(() => getTibetanDate(new Date()), []);

  const t = useCallback((en: string, tib: string) => {
    return userData.language === 'Tibetan' ? tib : en;
  }, [userData.language]);

  const STICKERS = [
    '🕉️', '🧘', '🔥', '💧', '☀️', '🌙', '🏔️', '🏠', 
    '🎨', '💼', '💊', '✈️', '🍲', '💰', '🌳', '🕯️',
    '⚡', '🌈', '🏔️', '☸️', '🐚', '📿', '🏔️', '🥣'
  ];

  const handleBirthDateChange = (dateStr: string) => {
    if (!dateStr) {
      setUserData(prev => ({ ...prev, birthDate: undefined }));
      return;
    }
    
    const date = new Date(dateStr);
    const tib = getTibetanDate(date);
    
    setUserData(prev => ({
      ...prev,
      birthDate: dateStr,
      // Auto-populate animal/element if they're not set or if we're doing a fresh calculation
      birthAnimal: tib.animal,
      birthElement: tib.element,
    }));
    setHoroscope(null);
  };

  const addCustomFestival = () => {
    if (!newFestival.name || !newFestival.date) return;
    
    const festival: CustomFestival = {
      id: Math.random().toString(36).substring(2, 9),
      ...newFestival
    };
    
    setUserData(prev => ({
      ...prev,
      customFestivals: [...(prev.customFestivals || []), festival]
    }));
    
    setIsFestivalSheetOpen(false);
    setNewFestival({ name: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
  };

  const removeCustomFestival = (id: string) => {
    setUserData(prev => ({
      ...prev,
      customFestivals: (prev.customFestivals || []).filter(f => f.id !== id)
    }));
  };
  
  const generateHoroscope = useCallback(() => {
    setIsHoroscopeLoading(true);
    
    // Artificial delay for "calculation" feel
    setTimeout(() => {
      const harmony = getElementalHarmony(userData.birthElement, tibCurrent.element);
      const rule = HOROSCOPE_RULES[harmony] || HOROSCOPE_RULES['neutral'];
      
      const text = `${rule.title}: ${rule.text} ${rule.advice}`;
      setHoroscope(text);
      setIsHoroscopeLoading(false);
    }, 800);
  }, [tibCurrent.element, userData.birthElement]);

  useEffect(() => {
    if (activeTab === 'astro' && !horoscope) {
      generateHoroscope();
    }
  }, [activeTab, horoscope, generateHoroscope]);

  const [onboardingStep, setOnboardingStep] = useState(1);

  const handlePrevMonth = () => {
    setDirection(-1);
    if (calendarView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNextMonth = () => {
    setDirection(1);
    if (calendarView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Hide header on scroll down, show on scroll up
    // threshold of 50px to prevent jitter at the very top
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      if (showHeader) setShowHeader(false);
    } else {
      if (!showHeader) setShowHeader(true);
    }
    
    setLastScrollY(currentScrollY);
  };

  const festivalsThisMonth = useMemo(() => {
    const list: { date: Date; name: string; description: string; isCustom: boolean }[] = [];

    monthDays.forEach(date => {
      const td = getTibetanDate(date);
      const traditionalFestivals = FESTIVALS.filter(f => f.month === td.month && f.day === td.day);
      traditionalFestivals.forEach(f => {
        list.push({ date, name: f.name, description: f.description, isCustom: false });
      });

      const dateKey = format(date, 'yyyy-MM-dd');
      const customOnThisDay = (userData.customFestivals || []).filter(f => f.date === dateKey);
      customOnThisDay.forEach(f => {
        list.push({ date, name: f.name, description: f.description, isCustom: true });
      });
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [monthDays, userData.customFestivals]);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentNote = userData.notes[selectedDateKey] || '';
  const currentReminder = userData.reminders[selectedDateKey] || false;
  const currentSticker = userData.stickers?.[selectedDateKey] || {};
  const customFestivalToday = userData.customFestivals?.find(f => f.date === selectedDateKey);

  const searchResults = useMemo(() => {
    try {
      const start = startOfDay(parseISO(searchRange.start));
      const end = startOfDay(parseISO(searchRange.end));
      
      const interval = { start, end };
      const results: { date: Date; name: string; description: string; isCustom: boolean }[] = [];

      // Loop through each day in interval to find traditional festivals
      // For performance, we might want to optimize this if the interval is huge
      // But for common date picker ranges (weeks/months), it's fine
      const days = eachDayOfInterval(interval);
      
      days.forEach(date => {
        const td = getTibetanDate(date);
        const traditional = FESTIVALS.filter(f => f.month === td.month && f.day === td.day);
        traditional.forEach(f => {
          results.push({ date, name: f.name, description: f.description, isCustom: false });
        });

        const dateKey = format(date, 'yyyy-MM-dd');
        const custom = (userData.customFestivals || []).filter(f => f.date === dateKey);
        custom.forEach(f => {
          results.push({ date, name: f.name, description: f.description, isCustom: true });
        });
        
        // Also check for notes
        const note = userData.notes[dateKey];
        if (note) {
          results.push({ date, name: "Note", description: note, isCustom: true });
        }
      });

      return results.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (e) {
      return [];
    }
  }, [searchRange, userData]);

  const handleSaveNote = (note: string) => {
    setUserData(prev => ({
      ...prev,
      notes: { ...prev.notes, [selectedDateKey]: note }
    }));
  };

  const handleDeleteNote = () => {
    setUserData(prev => {
      const newNotes = { ...prev.notes };
      delete newNotes[selectedDateKey];
      return { ...prev, notes: newNotes };
    });
  };

  const toggleReminder = () => {
    setUserData(prev => ({
      ...prev,
      reminders: { ...prev.reminders, [selectedDateKey]: !prev.reminders[selectedDateKey] }
    }));
  };

  const handleSetSticker = (emoji: string | undefined, label: string | undefined) => {
    setUserData(prev => ({
      ...prev,
      stickers: { 
        ...(prev.stickers || {}), 
        [selectedDateKey]: { emoji, label } 
      }
    }));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `men_tsee_khang_backup_${format(new Date(), 'yyyy_MM_dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && typeof json === 'object') {
          setUserData(json);
          alert('Data sync successful. Your sacred practitioner profile has been restored.');
          window.location.reload();
        }
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid Men-Tsee-Khang backup.');
      }
    };
    reader.readAsText(file);
  };

  if (!userData.onboardingComplete) {
    return (
      <div className="fixed inset-0 bg-stone-50 z-[100] flex flex-col overflow-hidden font-sans">
        <AnimatePresence mode="wait">
          {onboardingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col items-center justify-center p-8 space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-stone-900 rounded-[40px] flex items-center justify-center text-stone-100 text-5xl font-serif mx-auto shadow-2xl shadow-stone-200">
                  <span className="text-saffron">࿇</span>
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-black text-stone-950">Welcome</h1>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Sino-Tibetan Astro Guidance</p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-6">
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center px-1">Select Language</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setUserData(prev => ({ ...prev, language: 'English' }));
                        setOnboardingStep(2);
                      }}
                      className="w-full p-6 bg-white border border-stone-100 rounded-3xl flex items-center justify-between hover:border-saffron/50 transition-all group shadow-sm"
                    >
                      <span className="font-serif text-xl font-bold text-stone-900">English</span>
                      <ChevronRight size={20} className="text-stone-300 group-hover:text-saffron group-hover:translate-x-1 transition-all" />
                    </button>
                    <button
                      onClick={() => {
                        setUserData(prev => ({ ...prev, language: 'Tibetan' }));
                        setOnboardingStep(2);
                      }}
                      className="w-full p-6 bg-white border border-stone-100 rounded-3xl flex items-center justify-between hover:border-saffron/50 transition-all group shadow-sm"
                    >
                      <div className="text-left">
                        <span className="font-serif text-xl font-bold text-stone-900 block leading-tight">བོད་ཡིག</span>
                        <span className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">Tibetan</span>
                      </div>
                      <ChevronRight size={20} className="text-stone-300 group-hover:text-saffron group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-1.5">
                  <div className="w-10 h-1 rounded-full bg-saffron" />
                  <div className="w-2 h-1 rounded-full bg-stone-200" />
                  <div className="w-2 h-1 rounded-full bg-stone-200" />
                  <div className="w-2 h-1 rounded-full bg-stone-200" />
                </div>
              </div>
            </motion.div>
          )}

          {onboardingStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 pt-16 space-y-8 overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setOnboardingStep(1)} className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-10 h-1 rounded-full bg-saffron" />
                    <div className="w-2 h-1 rounded-full bg-stone-200" />
                    <div className="w-2 h-1 rounded-full bg-stone-200" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-black text-stone-950">Practitioner Details</h2>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">Foundational for personalized timing</p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-stone-400 uppercase px-1">Dharma Name / Nickname</label>
                    <input
                      type="text"
                      placeholder="e.g. Tenzin"
                      value={userData.name || ''}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Date</label>
                    <input
                      type="date"
                      value={userData.birthDate || ''}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Animal</label>
                      <div className="relative">
                        <select
                          value={userData.birthAnimal || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthAnimal: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
                        >
                          <option value="">Select Sign</option>
                          {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {a}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Element</label>
                      <div className="relative">
                        <select
                          value={userData.birthElement || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthElement: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
                        >
                          <option value="">Select Element</option>
                          {ELEMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="w-full bg-stone-950 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Continue Discovery
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {onboardingStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 pt-16 space-y-10 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button onClick={() => setOnboardingStep(2)} className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-10 h-1 rounded-full bg-saffron" />
                    <div className="w-2 h-1 rounded-full bg-stone-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-black text-stone-950">Astro-Science</h2>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    Men-Tsee-Khang utilizes ancient Phugpa tradition to calculate the celestial winds of your life.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-turquoise/10 flex items-center justify-center text-turquoise">
                      <Compass size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">Atmospheric Almanac</h4>
                      <p className="text-[11px] text-stone-500 italic">Track daily Parkha (Trigrams) and Mewa (Magic Squares) to align with universal flows.</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center text-saffron">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">Personal Resonance</h4>
                      <p className="text-[11px] text-stone-500 italic">See how the day's elements interact with your birth sign through 5 dimensional analysis.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="w-full bg-stone-950 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Sacred Planning
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {onboardingStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 pt-16 space-y-10 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button onClick={() => setOnboardingStep(3)} className="p-2 -ml-2 text-stone-400 hover:text-stone-900 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-2 h-1 rounded-full bg-saffron/30" />
                    <div className="w-10 h-1 rounded-full bg-saffron" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-black text-stone-950">Daily Discipline</h2>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    Your digital Lo-tho (Almanac) for consistent practice and mindfulness.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">Duchen Festivals</h4>
                      <p className="text-[11px] text-stone-500 italic">Never miss merit-multiplying days and important Tibetan religious holidays.</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <StickyNote size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">Practitioner Logs</h4>
                      <p className="text-[11px] text-stone-500 italic">Record observations, dreams, and spiritual notes directly on your sacred calendar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setUserData(prev => ({ ...prev, onboardingComplete: true }))}
                  className="w-full bg-saffron text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-saffron/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Enter Sanctuary
                  <Check size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-warm text-stone-900 font-sans overflow-hidden">
      
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50"></div>

      {/* Main Content Area */}
      <div 
        onScroll={handleMainScroll}
        className="flex-1 overflow-y-auto pb-24 scroll-smooth"
      >
        {/* Global Branding Header */}
        <motion.header 
          initial={false}
          animate={{ 
            y: showHeader ? 0 : -100,
            opacity: showHeader ? 1 : 0
          }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a "premium" smooth feeling
            delay: 0.1 // Adding the requested "little delay"
          }}
          className={cn(
            "px-6 py-4 sticky top-0 z-40 transition-colors duration-500 backdrop-blur-md border-b",
            activeTab === 'home' ? "bg-stone-50/80 border-stone-100" : "bg-white/80 border-stone-50",
            !showHeader && "pointer-events-none"
          )}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center font-bold text-white font-serif text-xl border-2 border-stone-800">
                <span className="text-saffron">࿇</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-950 uppercase tracking-[0.2em] leading-none">{t('Men-Tsee-Khang', 'བོད་གཞུང་སྨན་རྩིས་ཁང་།')}</span>
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{t('Phugpa Tradition', 'ཕུག་ལུགས་རྩིས་རིག')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setIsSearchSheetOpen(true)}
                  className="p-2.5 bg-white/50 rounded-2xl text-stone-400 hover:text-saffron transition-colors"
                >
                  <Search size={18} />
               </button>
               <button 
                  onClick={() => setIsSettingsSheetOpen(true)}
                  className="p-2.5 bg-white/50 rounded-2xl text-stone-400 hover:text-stone-900 transition-colors"
               >
                  <Settings size={18} />
               </button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-lg mx-auto pb-32 pt-6"
            >
              {/* Home Sub-Tabs */}
              <div className="px-6 mb-8">
                <div className="flex bg-stone-100/50 p-1 rounded-2xl backdrop-blur-sm">
                  {[
                    { id: 'guidance', label: t('Day', 'ཉིན་མོ།'), icon: <Sun size={14} /> },
                    { id: 'astro', label: t('Astro', 'སྐར་རྩིས།'), icon: <Compass size={14} /> },
                    { id: 'days', label: t('Sacred', 'དུས་ཆེན།'), icon: <Bell size={14} /> }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setHomeTab(t.id as HomeTab)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        homeTab === t.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                      )}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 space-y-8">
                {homeTab === 'guidance' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {/* Today Card */}
                    <div id={UI_IDS.HOME.TODAY_CARD} className="relative rounded-3xl bg-stone-900 p-6 text-white overflow-hidden shadow-lg">
                      <div className="relative space-y-4">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1">{t('Phugpa Tradition', 'ཕུག་ལུགས་སྐར་རྩིས་རིག་པ།')}</p>
                          <h1 className="text-3xl font-serif font-black tracking-tight leading-tight">
                            {format(new Date(), 'EEEE')}, <br/>
                            <span className="text-stone-400 font-light">{format(new Date(), 'MMM d')}</span>
                          </h1>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex gap-8">
                          <div className="space-y-0.5">
                              <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{t('Tshe', 'ཚེས།')}</p>
                              <p className="text-lg font-serif font-bold text-saffron">{tibCurrent.day}</p>
                          </div>
                          <div className="space-y-0.5">
                              <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{t('Sign', 'རྟགས།')}</p>
                              <p className="text-lg font-serif font-bold">{ANIMAL_ICONS[tibCurrent.animal]} {tibCurrent.animal}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/50">
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{t('Month', 'ཟླ་བ་')}</p>
                        <p className="text-base font-serif font-bold text-stone-900">{tibCurrent.month}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/50">
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1">{t('Rabjung', 'རབ་བྱུང་།')}</p>
                        <p className="text-base font-serif font-bold text-stone-900">{tibCurrent.rabjung}</p>
                      </div>
                    </div>

                    {/* Daily Tibetan Almanac (Lo-tho) - Home Integration */}
                    <section id={UI_IDS.HOME.ALMANAC_SECTION} className="space-y-3 pt-2">
                      <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest px-1">{t('Daily Almanac', 'རྒྱུན་མཁོའི་ལོ་ཐོ།')}</h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 px-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{PARKHA_ICONS[tibCurrent.parkha]}</span>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{t('Parkha', 'སྤར་ཁ།')}</p>
                          </div>
                          <p className="text-sm font-serif font-black text-stone-900">{tibCurrent.parkha}</p>
                          <p className="text-[9px] text-stone-500 leading-relaxed line-clamp-1">{PARKHA_CHARACTERISTICS[tibCurrent.parkha]}</p>
                        </div>

                        <div className="space-y-1 px-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{MEWA_ICONS[tibCurrent.mewa]}</span>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{t('Mewa', 'སྨེ་བ།')}</p>
                          </div>
                          <p className="text-sm font-serif font-black text-stone-900">{tibCurrent.mewa}</p>
                          <p className="text-[9px] text-stone-500 leading-relaxed line-clamp-1">{MEWA_CHARACTERISTICS[tibCurrent.mewa]}</p>
                        </div>
                      </div>
                    </section>

                    {/* Daily Wisdom Section */}
                    <section className="bg-amber-50/50 rounded-2xl p-4 border border-stone-100 flex gap-4 items-start">
                      <Star size={16} className="text-saffron shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-stone-800 leading-relaxed italic">
                         "As the {tibCurrent.element} energy aligns with the {ANIMAL_ICONS[tibCurrent.animal]} {tibCurrent.animal} sign, practitioners are encouraged toward mindfulness."
                      </p>
                    </section>

                    {/* My Notes Highlights */}
                    {Object.keys(userData.notes).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest px-1">My Notes</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                          {Object.entries(userData.notes).map(([dateStr, note]) => (
                            <button 
                              key={dateStr}
                              onClick={() => {
                                setSelectedDate(parseISO(dateStr));
                                setActiveTab('calendar');
                              }}
                              className="shrink-0 w-44 bg-white p-4 rounded-2xl text-left border border-stone-100 space-y-2 active:scale-95 transition-transform"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] font-bold text-saffron uppercase tracking-widest">{format(parseISO(dateStr), 'MMM d')}</span>
                                <StickyNote size={12} className="text-stone-300" />
                              </div>
                              <p className="text-xs text-stone-600 line-clamp-1 leading-relaxed">{note}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {homeTab === 'days' && (
                   <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <header className="flex items-center justify-between">
                        <h1 className="text-3xl font-serif font-black text-stone-950">{t('Grand', 'གནད་ཆེའི།')} <br/> <span className="text-stone-400 font-light italic">{t('Duchen Days', 'དུས་ཆེན་བཟང་པོ།')}</span></h1>
                        <button 
                          onClick={() => setIsFestivalSheetOpen(true)}
                          className="p-4 bg-saffron text-white rounded-3xl active:scale-95 transition-transform"
                        >
                          <Plus size={24} />
                        </button>
                    </header>

                    {/* Custom Festivals Section */}
                    {(userData.customFestivals && userData.customFestivals.length > 0) && (
                      <section className="space-y-4">
                          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">My Important Dates</h3>
                          <div className="space-y-3">
                            {userData.customFestivals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((f) => (
                              <div key={f.id} className="bg-amber-50/50 p-5 rounded-3xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-5 min-w-0">
                                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-saffron flex flex-col items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                      <span className="text-[8px] opacity-70">{format(parseISO(f.date), 'MMM')}</span>
                                      <span className="text-lg leading-none">{format(parseISO(f.date), 'd')}</span>
                                  </div>
                                  <div className="min-w-0">
                                      <h4 className="text-sm font-bold text-stone-900 truncate">{f.name}</h4>
                                      <p className="text-[11px] text-stone-500 line-clamp-1 italic">{f.description}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    setUserData(prev => ({
                                      ...prev,
                                      customFestivals: prev.customFestivals?.filter(cf => cf.id !== f.id)
                                    }));
                                  }}
                                  className="p-2 text-stone-300 hover:text-tibetan-red transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                      </section>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Traditional Calendar</h3>
                        <div className="space-y-3">
                          {FESTIVALS.map((f, i) => (
                            <div key={i} className="bg-white p-5 rounded-3xl flex items-center gap-5 border border-stone-50">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-stone-900 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                                  <span>M{f.month}</span>
                                  <span className="text-lg leading-none mt-0.5">D{f.day}</span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-stone-900 truncate">{f.name}</h4>
                                  <p className="text-[11px] text-stone-400 line-clamp-1 italic">{f.description}</p>
                                </div>
                            </div>
                          ))}
                        </div>
                    </div>
                  </motion.div>
                )}

                {homeTab === 'astro' && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <header className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-3xl bg-stone-900 flex items-center justify-center text-white">
                            <Compass size={24} className="animate-spin-slow" />
                          </div>
                          <h1 className="text-3xl font-serif font-black text-stone-950">{t('Astro-Science', 'སྐར་རྩིས་རིག་པ།')}</h1>
                        </div>
                        <p className="text-sm font-medium text-stone-400 leading-relaxed italic">
                          The intersection of energy alignment based on the Men-Tsee-Khang Phugpa tradition.
                        </p>
                    </header>

                    {/* Personalized Horoscope */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Horoscope', 'རང་རེའི་བླ་རྟགས།')}</h3>
                        <button 
                          onClick={() => { setHoroscope(null); generateHoroscope(); }}
                          className="text-[8px] font-bold text-saffron uppercase hover:underline"
                        >
                          Refresh
                        </button>
                      </div>

                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 relative overflow-hidden group">
                        {isHoroscopeLoading ? (
                          <div className="py-8 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="animate-spin text-stone-300" size={24} />
                            <p className="text-[10px] text-stone-400 italic font-serif">Consulting...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-xs text-stone-700 leading-relaxed italic">
                              {horoscope || "Your daily alignment is being calculated."}
                            </p>
                            
                            <div className="flex items-center gap-2 pt-2 grayscale opacity-50">
                               <div className="w-1 h-1 rounded-full bg-stone-400" />
                               <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
                                 {userData.birthElement || "Unset"} {userData.birthAnimal ? `${ANIMAL_ICONS[userData.birthAnimal]} ${userData.birthAnimal}` : "Sign"}
                               </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Dimensional Analysis Card */}
                    <div className="bg-stone-950 rounded-[40px] p-8 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-turquoise/20 rounded-full blur-3xl -mr-20 -mt-20" />
                      
                      <div className="relative space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">{t("Today's Alignment", 'དེ་རིང་གི་རྩིས་འབྲས།')}</h2>
                          <div className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-extrabold uppercase tracking-widest text-turquoise">
                            Cycle {tibCurrent.rabjung}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4 border-r border-white/5 pr-4">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Primary Element</p>
                                <p className="text-3xl font-serif font-black text-turquoise italic">{tibCurrent.element}</p>
                              </div>
                              <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                                Fundamental energy flow for this current lunar day.
                              </p>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Animal Sign</p>
                                <p className="text-3xl font-serif font-black text-saffron italic">
                                  {ANIMAL_ICONS[tibCurrent.animal]} {tibCurrent.animal}
                                </p>
                              </div>
                              <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                                Influences social interactions and external success.
                              </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Tibetan Almanac (Lo-tho) */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Daily Tibetan Almanac', 'ཉིན་རེའི་ཟླ་ཐོ།')}</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest italic">Lo-tho Details</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[32px] p-6 border border-stone-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white text-xs font-serif italic">
                              {PARKHA_ICONS[tibCurrent.parkha]}
                            </div>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Parkha</p>
                          </div>
                          <div>
                            <p className="text-xl font-serif font-black text-stone-900">{tibCurrent.parkha}</p>
                            <p className="text-[10px] text-stone-500 italic mt-1 leading-relaxed line-clamp-2">
                              {PARKHA_CHARACTERISTICS[tibCurrent.parkha]}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-6 border border-stone-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-saffron flex items-center justify-center text-white text-xs font-serif italic">
                              {MEWA_ICONS[tibCurrent.mewa]}
                            </div>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Mewa</p>
                          </div>
                          <div>
                            <p className="text-xl font-serif font-black text-stone-900">{tibCurrent.mewa}</p>
                            <p className="text-[10px] text-stone-500 italic mt-1 leading-relaxed line-clamp-2">
                              {MEWA_CHARACTERISTICS[tibCurrent.mewa]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Annual Resonance Section */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Annual Essence</h3>
                        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest italic">{tibCurrent.yearName} Year</span>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100/50">
                        <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                           <img 
                             src={`https://picsum.photos/seed/${tibCurrent.animal.toLowerCase()}/100/100`}
                             alt={tibCurrent.animal}
                             className="w-full h-full object-cover grayscale opacity-60"
                             referrerPolicy="no-referrer"
                           />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-serif font-black text-stone-950 truncate">
                            {ANIMAL_ICONS[tibCurrent.animal]} {tibCurrent.yearName}
                          </h4>
                          <p className="text-[10px] text-stone-500 italic line-clamp-2 mt-1">
                            {ANIMAL_CHARACTERISTICS[tibCurrent.animal]}
                          </p>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 max-w-lg mx-auto pb-32"
            >
              <header className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-[8px] font-black text-saffron uppercase tracking-widest leading-none mb-1">
                        Year {tibSelected.year} • {tibSelected.yearName}
                    </h2>
                    <h2 className="text-2xl font-serif font-black text-stone-950">
                      {calendarView === 'month' ? format(currentDate, 'MMMM yyyy') : 'Annual Cycle'}
                    </h2>
                </div>
                <div className="flex bg-stone-100/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setCalendarView('week')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      calendarView === 'week' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                    )}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setCalendarView('month')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      calendarView === 'month' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                    )}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setCalendarView('year')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      calendarView === 'year' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                    )}
                  >
                    Year
                  </button>
                </div>
              </header>

              {calendarView === 'week' && (
                <div className="space-y-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="p-3 bg-white rounded-2xl active:scale-95 transition-transform"><ChevronLeft size={16} /></button>
                        <button onClick={handleNextMonth} className="p-3 bg-white rounded-2xl active:scale-95 transition-transform"><ChevronRight size={16} /></button>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
                    </span>
                  </div>

                  <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    <motion.div
                      key={format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd')}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -100) handleNextMonth();
                        else if (info.offset.x > 100) handlePrevMonth();
                      }}
                      className="touch-pan-y"
                    >
                      <div className="grid grid-cols-7 gap-1 text-center mb-4 text-[9px] font-black text-stone-400 tracking-[0.2em] uppercase">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                      </div>

                      <div className="space-y-3">
                        {weekDays.map((date, i) => {
                          const tib = getTibetanDate(date);
                          const isSelected = isSameDay(date, selectedDate);
                          const isToday = isDateToday(date);
                          const dateKey = format(date, 'yyyy-MM-dd');
                          const note = userData.notes[dateKey];
                          const sticker = userData.stickers?.[dateKey];
                          const dayFestivals = FESTIVALS.filter(f => f.month === tib.month && f.day === tib.day);
                          const customFestivals = (userData.customFestivals || []).filter(f => f.date === dateKey);
                          const allEvents = [...dayFestivals, ...customFestivals];

                          return (
                            <motion.div 
                              key={dateKey}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedDate(date)}
                              className={cn(
                                "p-5 rounded-[32px] transition-all cursor-pointer mb-3 last:mb-0",
                                isSelected ? "bg-stone-900 text-white shadow-xl scale-[1.02]" : "bg-white text-stone-900 border border-stone-50"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black",
                                    isSelected ? "bg-white/10" : "bg-stone-50 text-stone-400"
                                  )}>
                                    <span className="text-[8px] uppercase leading-none">{format(date, 'EEE')}</span>
                                    <span className="text-sm font-serif leading-none mt-1">{format(date, 'd')}</span>
                                  </div>
                                  <div>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", isSelected ? "text-stone-400" : "text-stone-300")}>
                                      Tshe {tib.day}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <h4 className="text-sm font-serif font-bold">
                                        {allEvents.length > 0 ? allEvents[0].name : (isToday ? 'Present Moment' : 'Clear Sky')}
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {sticker?.emoji && <span className="text-lg">{sticker.emoji}</span>}
                                   {note && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-turquoise" : "bg-turquoise/40")} />}
                                   {allEvents.length > 1 && (
                                     <div className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-[8px] font-black uppercase">
                                       +{allEvents.length - 1} Events
                                     </div>
                                   )}
                                </div>
                              </div>
                              
                              {note && (
                                <p className={cn(
                                  "text-[11px] font-medium mt-3 px-1 leading-relaxed line-clamp-1 border-l-2 pl-3",
                                  isSelected ? "text-stone-400 border-white/20" : "text-stone-400 border-stone-100"
                                )}>
                                  {note}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {calendarView === 'month' && (
                <>
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex gap-2">
                          <button onClick={handlePrevMonth} className="px-3 py-2 bg-stone-50 rounded-xl active:scale-95 transition-transform"><ChevronLeft size={16} /></button>
                          <button onClick={handleNextMonth} className="px-3 py-2 bg-stone-50 rounded-xl active:scale-95 transition-transform"><ChevronRight size={16} /></button>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Month {tibSelected.month}</span>
                    </div>

                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                      <motion.div
                        key={format(currentDate, 'yyyy-MM')}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="touch-pan-y"
                      >
                        <div className="grid grid-cols-7 gap-px text-[9px] font-black text-stone-400 tracking-[0.2em] uppercase mb-2">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="py-2 text-center">{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-px rounded-2xl overflow-hidden border border-stone-100 bg-stone-100">
                          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                            <div key={`pad-${i}`} className="bg-stone-50/50 aspect-square" />
                          ))}
                          {monthDays.map((date, idx) => {
                              const isSelected = isSameDay(date, selectedDate);
                              const isToday = isDateToday(date);
                              const tib = getTibetanDate(date);
                              
                              // Detect skipped day by comparing with previous day
                              let isSkippedBefore = false;
                              if (idx > 0) {
                                const prevTib = getTibetanDate(monthDays[idx - 1]);
                                if (tib.day > prevTib.day + 1 || (tib.day === 1 && prevTib.day < 30 && prevTib.day !== 0)) {
                                  isSkippedBefore = true;
                                }
                              }

                              const dateKey = format(date, 'yyyy-MM-dd');
                              const hasFestival = FESTIVALS.some(f => f.month === tib.month && f.day === tib.day);
                              const hasCustomFestival = userData.customFestivals?.some(f => f.date === dateKey);
                              const hasNote = userData.notes[dateKey];
                              const hasReminder = userData.reminders[dateKey];
                              const sticker = userData.stickers?.[dateKey];

                              return (
                                  <button
                                      key={date.toISOString()}
                                      onClick={() => setSelectedDate(date)}
                                      className={cn(
                                          "relative aspect-square flex flex-col items-center justify-center transition-all focus:outline-none",
                                          isSelected ? "bg-amber-50" : "bg-white",
                                      )}
                                  >
                                      <span className={cn(
                                          "text-sm font-serif font-bold",
                                          isSelected ? "text-saffron" : (isToday ? "text-stone-950 underline decoration-saffron decoration-2" : "text-stone-400")
                                      )}>{format(date, 'd')}</span>
                                      
                                      <div className="flex items-center gap-1">
                                        <span className={cn("text-[7px] font-black uppercase", isSelected ? "text-stone-800" : "text-stone-300")}>
                                          {tib.day}
                                          {tib.isDoubleDay && "⁺"}
                                        </span>
                                      </div>
                                      
                                      {/* Sticker/Label Display */}
                                      {sticker && (
                                        <div className="absolute top-1 left-1 pointer-events-none flex flex-col items-start gap-0.5 z-20">
                                          {sticker.emoji && (
                                            <span className="text-[12px] leading-none drop-shadow-sm">
                                              {sticker.emoji}
                                            </span>
                                          )}
                                          {sticker.label && (
                                            <span className="px-1 py-0.5 bg-saffron/90 text-white text-[5px] font-black uppercase tracking-tighter rounded-sm truncate max-w-[28px] leading-none shadow-sm">
                                              {sticker.label}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      <div className="absolute top-1 right-1 flex flex-col items-center gap-0.5">
                                        {(hasFestival || hasCustomFestival) && <div className="w-1 h-1 rounded-full bg-tibetan-red" />}
                                        {hasNote && <div className="w-1 h-1 rounded-full bg-turquoise" />}
                                      </div>
                                      {hasReminder && (
                                        <div className="absolute bottom-1 w-3 h-0.5 bg-saffron/40 rounded-full" />
                                      )}
                                  </button>
                              );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Detail Card Overlay */}
                  <div className="mt-6 border-t border-stone-100 pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white text-lg font-serif font-black">{format(selectedDate, 'd')}</div>
                        <div>
                          <h3 className="text-base font-serif font-bold leading-none">{format(selectedDate, 'EEEE')}</h3>
                          <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                            Tshe {tibSelected.day} • {ANIMAL_ICONS[tibSelected.animal]} {tibSelected.animal}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsNoteSheetOpen(true)}
                        className="p-2.5 bg-stone-50 rounded-xl text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Display existing note/reminder/custom festival if any */}
                    {(currentNote || currentReminder || customFestivalToday) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        {customFestivalToday && (
                          <div className="bg-amber-50 p-4 rounded-2xl space-y-2">
                             <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-saffron uppercase tracking-widest">Custom Event</span>
                                <CalendarIcon size={12} className="text-saffron" />
                             </div>
                             <h4 className="text-sm font-bold text-stone-900">{customFestivalToday.name}</h4>
                             {customFestivalToday.description && (
                               <p className="text-[11px] text-stone-500 italic">{customFestivalToday.description}</p>
                             )}
                          </div>
                        )}
                        {currentReminder && (
                          <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-2xl">
                            <Clock size={16} className="text-saffron" />
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Remind me today</span>
                          </div>
                        )}
                        {currentNote && (
                          <div className="bg-stone-50 p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">My Notes</span>
                              <StickyNote size={12} className="text-stone-300" />
                            </div>
                            <p className="text-xs font-medium text-stone-600 leading-relaxed">{currentNote}</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Personalized Alignment info */}
                    {userData.birthElement && (
                       <div className="space-y-4">
                          <div className={cn(
                            "p-6 rounded-[32px] transition-all duration-500 relative overflow-hidden group",
                            (() => {
                              const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                              const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                              if (h === 'life' || h === 'son' || a === 'trine') return "bg-emerald-50/40 border border-emerald-100/50";
                              if (h === 'enemy' || a === 'conflict') return "bg-red-50/20 border border-red-100/20";
                              return "bg-stone-50/50 border border-stone-100/30";
                            })()
                          )}>
                             {/* Decorative Background Icon */}
                             <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                               <Compass size={80} />
                             </div>

                             <div className="relative space-y-4">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm",
                                        (() => {
                                          const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                          if (h === 'life' || h === 'son') return "bg-emerald-500";
                                          if (h === 'enemy') return "bg-red-500";
                                          return "bg-stone-900";
                                        })()
                                      )}>
                                         <Sparkles size={18} />
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-black text-stone-950 uppercase tracking-[0.2em] leading-none mb-1">Sacred Alignment</p>
                                         <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest leading-none">Birth Chart Resonance</p>
                                      </div>
                                   </div>
                                   
                                   {/* Status Badge */}
                                   <div className={cn(
                                     "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2",
                                     (() => {
                                       const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                       const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                                       if (h === 'life' || h === 'son' || a === 'trine') return "bg-emerald-500 text-white";
                                       if (h === 'enemy' || a === 'conflict') return "bg-red-500 text-white";
                                       return "bg-stone-100 text-stone-500";
                                     })()
                                   )}>
                                     {(() => {
                                       const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                       const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                                       if (h === 'life' || h === 'son' || a === 'trine') return <><Sparkles size={10} /> Highly Supportive</>;
                                       if (h === 'enemy' || a === 'conflict') return <><Info size={10} /> Potentially Opposed</>;
                                       return <><Compass size={10} /> Balanced Alignment</>;
                                     })()}
                                   </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                   <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                                      <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Energy (Element)</p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-900">
                                            {(() => {
                                               const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                               if (h === 'life') return 'Nourishing';
                                               if (h === 'same') return 'Equanimous';
                                               if (h === 'son') return 'Prosperous';
                                               if (h === 'enemy') return 'Friction';
                                               return 'Neutral';
                                            })()}
                                        </span>
                                        <div className={cn("w-2 h-2 rounded-full", (() => {
                                            const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                            if (h === 'life' || h === 'son') return "bg-emerald-500";
                                            if (h === 'enemy') return "bg-red-500";
                                            return "bg-stone-300";
                                         })())} />
                                      </div>
                                   </div>

                                   <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                                      <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Social (Animal)</p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-900">
                                            {(() => {
                                               const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                                               if (a === 'trine') return 'Auspicious';
                                               if (a === 'same') return 'Stable';
                                               if (a === 'conflict') return 'Sensitive';
                                               return 'Neutral';
                                            })()}
                                        </span>
                                        <div className={cn("w-2 h-2 rounded-full", (() => {
                                            const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                                            if (a === 'trine' || a === 'same') return "bg-emerald-500";
                                            if (a === 'conflict') return "bg-red-500";
                                            return "bg-stone-300";
                                         })())} />
                                      </div>
                                   </div>
                                </div>

                                {/* Dynamic Insight */}
                                <div className="pt-2 px-1">
                                  <p className="text-[11px] text-stone-600 font-medium leading-relaxed italic">
                                    {(() => {
                                      const h = getElementalHarmony(userData.birthElement, tibSelected.element);
                                      const a = getAnimalAffinity(userData.birthAnimal, tibSelected.animal);
                                      if (h === 'life') return "The day's energy acts as your celestial 'Mother'. Perfect for starting projects or seeking blessings.";
                                      if (h === 'enemy') return "Cosmic friction detected. Practice patience and avoid major social confrontations today.";
                                      if (h === 'son') return "A day of prosperity where your inner energy supports external growth. High success likelihood.";
                                      if (a === 'conflict') return "Social interactions may feel tense. Focus on internal work and move with gentleness.";
                                      return "Celestial energies are stable. A balanced time for routine spiritual practice and quiet awareness.";
                                    })()}
                                  </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Trigram (Parkha)</p>
                            <p className="text-xs font-bold text-stone-900">{PARKHA_ICONS[tibSelected.parkha]} {tibSelected.parkha}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Magic Sq (Mewa)</p>
                            <p className="text-xs font-bold text-stone-900">{MEWA_ICONS[tibSelected.mewa]} {tibSelected.mewa}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Identity</p>
                            <p className="text-xs font-bold text-amber-800">{tibSelected.yearName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Logic</p>
                            <p className="text-xs font-bold text-stone-800">{tibSelected.gender} • Month {tibSelected.month}</p>
                        </div>
                    </div>
                  </div>
                </>
              )}

              {calendarView === 'year' && (
                <div className="space-y-6">
                  {/* Yearly Overview Section */}
                  <div className="bg-stone-950 rounded-[40px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="relative space-y-6">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-saffron" />
                        <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Annual Essence</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-serif font-black italic">{tibCurrent.yearName} Year</p>
                        <p className="text-xs font-medium text-stone-400 leading-relaxed">
                          A period dominated by the {tibCurrent.element} element, favoring {tibCurrent.gender === 'Male' ? 'active growth' : 'nurturing stable'} energies.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 12-Month Path */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Lunar Path</h3>
                    <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-stone-50">
                      {Array.from({ length: 12 }).map((_, monthIdx) => {
                        const m = monthIdx + 1;
                        const monthFestivals = FESTIVALS.filter(f => f.month === m);
                        return (
                          <div key={m} className="p-6 flex items-start gap-5 hover:bg-stone-50 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex flex-col items-center justify-center text-saffron shrink-0">
                              <span className="text-[8px] font-black uppercase tracking-tighter">Month</span>
                              <span className="text-lg font-serif font-black leading-none">{m}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between pt-1">
                                <p className="text-xs font-black text-stone-900 uppercase tracking-widest">
                                  {m === 1 ? 'Losar Cycle' : m === 4 ? 'Saga Dawa Season' : `Lunar Cycle ${m}`}
                                </p>
                                <div className="flex gap-1">
                                  {monthFestivals.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-tibetan-red" />)}
                                </div>
                              </div>
                              
                              {monthFestivals.length > 0 ? (
                                <div className="space-y-2">
                                  {monthFestivals.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 group">
                                      <div className="w-1 h-1 rounded-full bg-stone-200" />
                                      <span className="text-[11px] font-bold text-stone-600">Day {f.day}: {f.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-stone-400 italic">Balanced energetic period</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wisdom Note */}
                  <div className="p-8 text-center text-stone-400 space-y-2">
                    <Sparkles size={24} className="mx-auto opacity-20" />
                    <p className="text-[11px] italic leading-relaxed max-w-xs mx-auto">
                      "One year of breath, twelve cycles of light. Map your path with intentional merit."
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
               key="profile"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="px-6 py-10 max-w-lg mx-auto pb-32 space-y-8"
            >
               {/* Minimal Social Profile Header */}
               <header className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center text-stone-100 text-3xl font-serif">
                    <span className="text-saffron">࿇</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-2xl font-serif font-black text-stone-950 tracking-tight">
                        {userData.name ? userData.name : 'Practitioner'}
                      </h1>
                      <button 
                        onClick={() => setIsProfileSheetOpen(true)}
                        className="p-1 text-stone-300 hover:text-saffron transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                    <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">Active Alignment</p>
                  </div>
               </header>

               {/* Profile Info - Seamless List Style */}
               <section className="space-y-6 pt-4 border-t border-stone-100">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <CalendarIcon size={16} className="text-stone-300 group-hover:text-saffron transition-colors" />
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Birth Date</p>
                          <p className="text-xs font-bold text-stone-800">
                            {userData.birthDate ? format(parseISO(userData.birthDate), 'MMMM do, yyyy') : 'Establish alignment'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <p className="w-4 text-center text-stone-300 group-hover:text-saffron transition-colors text-lg font-serif">
                          {userData.birthAnimal ? ANIMAL_ICONS[userData.birthAnimal] : '🐾'}
                        </p>
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Animal Sign</p>
                          <p className="text-xs font-bold text-stone-800">
                            {userData.birthAnimal || 'Uncalculated'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-saffron transition-colors flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-saffron transition-colors" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Primary Element</p>
                          <p className="text-xs font-bold text-stone-800">
                            {userData.birthElement || 'Uncalculated'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
               </section>

               <div className="pt-8 text-center opacity-40">
                  <p className="text-[9px] text-stone-400 font-medium italic max-w-[180px] mx-auto leading-relaxed">
                    Honor the path of your arrival.
                  </p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Note & Reminder Bottom Sheet */}
      <AnimatePresence>
        {isProfileSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileSheetOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe overflow-y-auto max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white">
                    <Pencil size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">Update Profile</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">Sacred Alignment Update</p>
                  </div>
                </div>
                <button onClick={() => setIsProfileSheetOpen(false)} className="p-3 bg-stone-50 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <section className="space-y-4">
                  <div className="bg-stone-50 rounded-[32px] p-6 space-y-6 border border-stone-100/30">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase px-1">Dharma Name</label>
                        <input 
                            type="text"
                            placeholder="Enter name"
                            value={userData.name || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Date</label>
                      <input 
                          type="date"
                          value={userData.birthDate || ''}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className="w-full bg-white rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Animal</label>
                        <div className="relative">
                          <select 
                            value={userData.birthAnimal || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthAnimal: e.target.value }));
                              setHoroscope(null);
                            }}
                            className="w-full bg-white rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm px-4"
                          >
                            <option value="">Animal</option>
                            {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {a}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase px-1">Birth Element</label>
                        <div className="relative">
                          <select 
                            value={userData.birthElement || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthElement: e.target.value }));
                              setHoroscope(null);
                            }}
                            className="w-full bg-white rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm px-4"
                          >
                            <option value="">Element</option>
                            {ELEMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <button 
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="w-full bg-stone-900 text-white p-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs active:scale-[0.98] transition-all"
                >
                  Confirm & Sync
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isSettingsSheetOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 bg-bg-warm z-[101] flex flex-col pt-safe px-4 pb-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-between py-6 px-1 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-sm">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-black text-stone-950 leading-tight">Settings</h2>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest leading-none">System & Alignment</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsSheetOpen(false)} 
                className="w-10 h-10 flex items-center justify-center bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-12">
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-3">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Interface</h3>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm">
                        <Sun size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-stone-700">Light Mode</span>
                    </div>
                    <div className="w-10 h-5 bg-saffron rounded-full relative">
                       <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                <div id={UI_IDS.SETTINGS.LANGUAGE_SELECTOR} className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-4">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t('Language Selection', 'སྐད་ཡིག་འདམ་ཀ')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setUserData(prev => ({ ...prev, language: 'English' }))}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                        userData.language !== 'Tibetan' ? "bg-stone-900 text-white border-stone-800 shadow-md" : "bg-stone-50/50 text-stone-600 border-stone-100/30"
                      )}
                    >
                      <span className="text-[11px] font-bold">English</span>
                      {userData.language !== 'Tibetan' && <Check size={12} className="text-saffron" />}
                    </button>
                    <button 
                      onClick={() => setUserData(prev => ({ ...prev, language: 'Tibetan' }))}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                        userData.language === 'Tibetan' ? "bg-stone-900 text-white border-stone-800 shadow-md" : "bg-stone-50/50 text-stone-600 border-stone-100/30"
                      )}
                    >
                      <span className="text-[11px] font-bold">བོད་ཡིག</span>
                      {userData.language === 'Tibetan' && <Check size={12} className="text-saffron" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-3">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Traditional Method</h3>
                  <div className="flex items-center justify-between p-3 bg-stone-50/50 rounded-2xl border border-stone-100/30">
                    <span className="text-[11px] font-bold text-stone-900">Phugpa anchor system</span>
                    <Check size={12} className="text-saffron" />
                  </div>
                  <p className="text-[8px] text-stone-400 font-medium italic px-1 leading-relaxed">Modern Men-Tsee-Khang calculations based on sacred Phugpa lineages.</p>
                </div>

                <div className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-3">
                   <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Sync & Alignment</h3>
                   <div className="grid grid-cols-2 gap-2">
                     <button 
                      onClick={handleExportData}
                      className="flex flex-col items-center gap-1.5 p-4 bg-stone-50/50 rounded-2xl border border-stone-100/30 hover:border-saffron/20 group transition-all"
                     >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-400 group-hover:text-saffron shadow-sm transition-colors">
                          <Compass size={16} />
                        </div>
                        <span className="text-[9px] font-black text-stone-900 uppercase tracking-tight">Export Profile</span>
                     </button>
                     <label className="flex flex-col items-center gap-1.5 p-4 bg-stone-50/50 rounded-2xl border border-stone-100/30 hover:border-saffron/20 group transition-all cursor-pointer">
                        <input 
                          type="file" 
                          accept=".json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImportData(file);
                          }}
                          className="hidden" 
                        />
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-400 group-hover:text-saffron shadow-sm transition-colors">
                          <Loader2 size={16} />
                        </div>
                        <span className="text-[9px] font-black text-stone-900 uppercase tracking-tight">Restore Data</span>
                     </label>
                   </div>
                   <p className="text-[8px] text-stone-400 italic text-center">Back up your alignment history locally.</p>
                </div>

                <div className="p-4 bg-stone-50/30 rounded-[28px] border border-stone-100/50 space-y-3">
                   <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Danger Zone</h3>
                   <button 
                     onClick={() => setIsPrivacySheetOpen(true)}
                     className="w-full flex items-center justify-between p-3 bg-white rounded-2xl text-stone-600 border border-stone-100/50 hover:bg-stone-50 transition-colors mb-2"
                   >
                     <span className="text-[11px] font-bold">Privacy Policy</span>
                     <Info size={14} />
                   </button>
                   <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to clear all personal data? This cannot be undone.')) {
                        setUserData({ notes: {}, reminders: {} });
                        localStorage.removeItem('men_tsee_khang_user_data');
                        window.location.reload();
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-2xl text-red-500 border border-red-100/50 hover:bg-red-50/50 transition-colors"
                   >
                     <span className="text-[11px] font-bold">Clear All System Cache</span>
                     <Trash2 size={14} />
                   </button>
                </div>

                <div className="py-2 text-center">
                  <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest opacity-30">Phugpa Edition v1.2.0</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isPrivacySheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrivacySheetOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-bg-warm rounded-t-[40px] z-[201] p-8 space-y-8 max-w-lg mx-auto pb-safe flex flex-col h-[70vh]"
            >
              <div className="w-12 h-1.5 bg-stone-200/50 rounded-full mx-auto flex-shrink-0" />
              
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white">
                    <Info size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">Privacy Policy</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Digital Sanctuary Guards</p>
                  </div>
                </div>
                <button onClick={() => setIsPrivacySheetOpen(false)} className="p-3 bg-stone-100 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 text-stone-600 text-sm leading-relaxed pb-8">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">Local Sanctuary</h4>
                  <p>All your data, including birth certificates, ritual notes, and personal reminders, is stored strictly on your local device's <b>LocalStorage</b>. We do not have servers that store your personal information.</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">Data Sovereignty</h4>
                  <p>You have total control over your digital footprint. You can export your profile as a JSON file or clear everything instantly using the "Clear All System Cache" button in settings.</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">Third Party Services</h4>
                  <p>We use standard web technologies. When using AI-powered horoscope features (if enabled), only necessary data is processed to generate seasonal guidance. No identifiable data is permanently retained beyond the session.</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">Contact</h4>
                  <p>For any questions regarding the Phugpa Tradition or the application's digital hygiene, please reach out to the development collective.</p>
                </section>

                <div className="pt-6 border-t border-stone-100">
                  <p className="text-[10px] text-stone-400 italic">Effective Alignment Date: April 2026</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {isSearchSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchSheetOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-bg-warm rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe flex flex-col h-[85vh]"
            >
              <div className="w-12 h-1.5 bg-stone-200/50 rounded-full mx-auto flex-shrink-0" />
              
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">Event Search</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Find sacred alignments</p>
                  </div>
                </div>
                <button onClick={() => setIsSearchSheetOpen(false)} className="p-3 bg-stone-100 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Start Date</label>
                  <input 
                    type="date"
                    value={searchRange.start}
                    onChange={(e) => setSearchRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-4 bg-white/50 rounded-2xl text-xs font-bold border border-transparent focus:border-stone-200 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">End Date</label>
                  <input 
                    type="date"
                    value={searchRange.end}
                    onChange={(e) => setSearchRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full p-4 bg-white/50 rounded-2xl text-xs font-bold border border-transparent focus:border-stone-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    {searchResults.length} Rituals & Events Found
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-sm font-medium text-stone-400 font-serif italic">No alignments in this period</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((result, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/60 p-5 rounded-[24px] group hover:bg-white transition-all duration-300"
                        onClick={() => {
                          setSelectedDate(result.date);
                          setCurrentDate(result.date);
                          setIsSearchSheetOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0",
                            result.isCustom ? "bg-amber-50 text-saffron" : "bg-stone-900 text-white"
                          )}>
                            <span className="text-[10px] font-black uppercase leading-none">{format(result.date, 'MMM')}</span>
                            <span className="text-lg font-black font-serif leading-none mt-0.5">{format(result.date, 'd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-black text-stone-900 truncate pr-2">{result.name}</h3>
                              {result.isCustom && <Star size={12} className="text-saffron fill-saffron mt-1" />}
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">{result.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[8px] font-bold text-stone-300 uppercase tracking-[0.2em]">
                                Tshe {getTibetanDate(result.date).day} · {getTibetanDate(result.date).animal}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {isFestivalSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFestivalSheetOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-saffron flex items-center justify-center text-white">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">Add Custom Event</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">Mark a significant moment</p>
                  </div>
                </div>
                <button onClick={() => setIsFestivalSheetOpen(false)} className="p-3 bg-stone-50 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">Event Name</label>
                  <input 
                    type="text"
                    placeholder="e.g., Birthday, Special Prayer"
                    value={newFestival.name}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">Date</label>
                  <input 
                    type="date"
                    value={newFestival.date}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">Short Description</label>
                  <textarea 
                    placeholder="Adding context to this day..."
                    value={newFestival.description}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-saffron/20 resize-none"
                  />
                </div>

                <button 
                  onClick={addCustomFestival}
                  disabled={!newFestival.name || !newFestival.date}
                  className="w-full bg-stone-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  Save to Calendar
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isNoteSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteSheetOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-saffron flex items-center justify-center text-white">
                    <StickyNote size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">Add Details</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{format(selectedDate, 'MMMM do')}</p>
                  </div>
                </div>
                <button onClick={() => setIsNoteSheetOpen(false)} className="p-3 bg-stone-50 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              {/* Reminder Toggle */}
              <button 
                onClick={toggleReminder}
                className={cn(
                  "w-full p-6 rounded-3xl border flex items-center justify-between transition-all duration-300",
                  currentReminder ? "bg-amber-50 border-saffron shadow-sm" : "bg-white border-stone-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", currentReminder ? "bg-saffron text-white" : "bg-stone-50 text-stone-300")}>
                    <Bell size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-stone-900">Push Notification</p>
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">Remind me on this date</p>
                  </div>
                </div>
                {currentReminder && <Check size={20} className="text-saffron" />}
              </button>

              {/* Note Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Personal Notes</label>
                <textarea 
                  value={currentNote}
                  onChange={(e) => handleSaveNote(e.target.value)}
                  placeholder="Enter your notes here..."
                  className="w-full h-40 bg-stone-50 rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-saffron/20 border-none outline-none resize-none placeholder:text-stone-300"
                />
              </div>

              {/* Custom Sticker & Label Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Icon & Custom Label</label>
                    <p className="text-[8px] text-stone-300 font-bold uppercase tracking-widest">Personalize the calendar view</p>
                  </div>
                  {(currentSticker.emoji || currentSticker.label) && (
                    <button 
                      onClick={() => handleSetSticker(undefined, undefined)}
                      className="text-[9px] font-black text-stone-400 uppercase bg-stone-50 px-3 py-1 rounded-lg hover:text-tibetan-red hover:bg-red-50 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-6 gap-2 bg-stone-50/50 p-4 rounded-3xl">
                  {STICKERS.map(s => (
                    <button 
                      key={s}
                      onClick={() => handleSetSticker(s, currentSticker.label)}
                      className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center text-xl transition-all duration-300",
                        currentSticker.emoji === s 
                          ? "bg-white scale-110 shadow-md ring-2 ring-saffron/20" 
                          : "bg-white/50 hover:bg-white text-stone-300 hover:text-stone-900"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <input 
                    type="text"
                    maxLength={12}
                    placeholder="Short label (e.g., RETREAT)"
                    value={currentSticker.label || ''}
                    onChange={(e) => handleSetSticker(currentSticker.emoji, e.target.value.toUpperCase())}
                    className="w-full bg-stone-50 border-2 border-transparent focus:border-saffron/10 rounded-2xl p-4 text-[10px] font-black tracking-widest outline-none transition-all placeholder:text-stone-300 uppercase"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-stone-300 uppercase bg-white px-2 py-1 rounded-md shadow-sm">
                    {(currentSticker.label || '').length}/12
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-4">
                <button 
                  onClick={handleDeleteNote}
                  className="p-4 bg-red-50 text-red-500 rounded-3xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={24} />
                </button>
                <button 
                  onClick={() => setIsNoteSheetOpen(false)}
                  className="flex-1 p-6 bg-stone-900 text-white rounded-3xl font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  Finish Editing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-stone-line flex items-center justify-around px-4 z-40 pb-safe">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={t('Home', 'གཙོ་ཞལ།')} />
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={22} />} label={t('Plan', 'ཟླ་ཐོ།')} />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} />} label={t('Profile', 'རང་ཞལ།')} />
      </nav>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .animate-spin-slow { animation: spin 40s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea:focus { box-shadow: none; }
      `}</style>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90",
      active ? "text-saffron" : "text-stone-300"
    )}>
      <div className={cn("transition-transform", active && "scale-110")}>{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-saffron mt-0.5" />}
    </button>
  );
}


