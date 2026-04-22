import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Pencil,
  Share
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday as isDateToday, parseISO, isWithinInterval, startOfDay, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { getTibetanDate, getTibetanYearInfo, FESTIVALS, MONTHLY_OBSERVANCES, TibetanDate, ANIMALS, ELEMENTS, COMBINATIONS } from './lib/tibetanCalendar';
import { cn, cn_id, UI_IDS, toTibetanNumerals } from './lib/utils';
import { DATABASE_2026 } from './lib/database2026';
import {
  STICKERS,
  HOROSCOPE_RULES,
  ANIMAL_CHARACTERISTICS,
  ANIMAL_ICONS,
  PARKHA_ICONS,
  MEWA_ICONS,
  PARKHA_CHARACTERISTICS,
  MEWA_CHARACTERISTICS,
  TIBETAN_ANIMALS,
  TIBETAN_ELEMENTS,
  MENTSKHANG_SYMBOLS,
  ELEMENT_CHARACTERISTICS,
  DHUN_ZUR,
  POWER_DAYS,
  VITALITY_RELATIONS,
  UI_LABELS,
  TIBETAN_WEEKDAYS
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
  birthDateSystem?: 'International' | 'Tibetan';
  tibetanBirthYear?: number;
  tibetanBirthMonth?: number;
  tibetanBirthDay?: number;
  gender?: 'Male' | 'Female';
  onboardingComplete?: boolean;
  customFestivals?: CustomFestival[];
}

const getElementalHarmony = (birth: string | undefined, day: string) => {
  if (!birth) return 'neutral';
  const index: Record<string, number> = { "Wood": 0, "Fire": 1, "Earth": 2, "Iron": 3, "Water": 4 };
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
  const todayRef = useRef<HTMLDivElement>(null);
  const [showJumpToday, setShowJumpToday] = useState(false);
  const [festivalSearch, setFestivalSearch] = useState('');
  const [newFestival, setNewFestival] = useState({ name: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
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

  const sortedFestivals = useMemo(() => {
    const today = startOfDay(new Date());
    const dbEntries = Object.entries(DATABASE_2026);

    return [...FESTIVALS].sort((a, b) => {
      const aDateStr = dbEntries.find(([_, d]) => d.tibMonth === a.month && d.tibDay === a.day)?.[0];
      const bDateStr = dbEntries.find(([_, d]) => d.tibMonth === b.month && d.tibDay === b.day)?.[0];

      const aDate = aDateStr ? startOfDay(new Date(aDateStr)) : new Date(2099, 11, 31);
      const bDate = bDateStr ? startOfDay(new Date(bDateStr)) : new Date(2099, 11, 31);

      const isAPast = aDate < today;
      const isBPast = bDate < today;

      if (isAPast && !isBPast) return 1;
      if (!isAPast && isBPast) return -1;

      return aDate.getTime() - bDate.getTime();
    });
  }, []);

  const powerDays = useMemo(() => {
    if (!userData.birthAnimal) return null;
    return POWER_DAYS[userData.birthAnimal];
  }, [userData.birthAnimal]);

  const yearlyHoroscope = useMemo(() => {
    if (!userData.birthAnimal || !userData.birthElement) return null;

    const yearAnimal = "Horse";
    const yearElement = "Fire";

    const isDhunZur = DHUN_ZUR[userData.birthAnimal]?.opposite === yearAnimal;

    const getRelation = (e1: string, e2: string) => {
      const relation = VITALITY_RELATIONS[e1];
      if (!relation) return 'neutral';
      if (relation.mother === e2) return 'mother';
      if (relation.son === e2) return 'son';
      if (relation.enemy === e2) return 'enemy';
      if (e1 === e2) return 'same';
      return 'neutral';
    };

    return {
      isDhunZur,
      scores: {
        vitality: getRelation(userData.birthElement, yearElement),
        body: getRelation(userData.birthElement, yearElement),
        power: getRelation(userData.birthElement, yearElement),
        luck: userData.birthAnimal === yearAnimal ? 'same' : (isDhunZur ? 'enemy' : 'neutral')
      }
    };
  }, [userData.birthAnimal, userData.birthElement]);

  useEffect(() => {
    localStorage.setItem('men_tsee_khang_user_data', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowJumpToday(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const n = useCallback((val: string | number | undefined) => {
    if (val === undefined) return '';
    return userData.language === 'Tibetan' ? toTibetanNumerals(val) : val;
  }, [userData.language]);

  const convertedGregorian = useMemo(() => {
    if (userData.birthDateSystem !== 'Tibetan' || !userData.tibetanBirthYear) return null;
    try {
      const adYear = userData.tibetanBirthYear;
      const targetMonth = userData.tibetanBirthMonth || 1;
      const targetDay = userData.tibetanBirthDay || 1;
      // Optimize: Search a 60-day window around the likely Tibetan New Year period
      const searchStart = new Date(adYear, 0, 25); // Jan 25
      const searchEnd = new Date(adYear, 3, 25);   // April 25
      for (let d = new Date(searchStart); d <= searchEnd; d.setDate(d.getDate() + 1)) {
        const tib = getTibetanDate(new Date(d));
        if (tib.month === targetMonth && tib.day === targetDay) {
          return new Date(d);
        }
      }
    } catch (e) { return null; }
    return null;
  }, [userData.birthDateSystem, userData.tibetanBirthYear, userData.tibetanBirthMonth, userData.tibetanBirthDay]);

  const STICKERS = [
    '🕉️', '🧘', '🔥', '💧', '☀️', '🌙', '🏔️', '🏠',
    '🎨', '💼', '💊', '✈️', '🍲', '💰', '🌳', '🕯️',
    '⚡', '🌈', '🏔️', '☸️', '🐚', '📿', '🏔️', '🥣'
  ];

  const handleBirthDateChange = (dateStr: string) => {
    setUserData(prev => ({ ...prev, birthDate: dateStr || undefined }));
  };

  const handleTibetanYearChange = (year: number) => {
    setUserData(prev => ({ ...prev, tibetanBirthYear: year || undefined }));
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

  const [onboardingStep, setOnboardingStep] = useState(1);

  // Sync Birth Data (Animal/Element) based on date changes
  useEffect(() => {
    if (userData.birthDateSystem === 'Tibetan' && userData.tibetanBirthYear) {
      // Calculate based on the Year (AD) while ignoring specific month/day for sign
      // Note: 2114 Royal Year = 1987 AD.
      // If user enters 1987, it's AD.
      const tibYear = userData.tibetanBirthYear > 1000 && userData.tibetanBirthYear < 2080
        ? userData.tibetanBirthYear + 127  // Convert AD to Royal approx if they enter 1987...
        : userData.tibetanBirthYear;

      const yearInfo = getTibetanYearInfo(tibYear);
      if (userData.birthAnimal !== yearInfo.animal || userData.birthElement !== yearInfo.element) {
        setUserData(prev => ({
          ...prev,
          birthAnimal: yearInfo.animal,
          birthElement: yearInfo.element
        }));
      }
    } else if ((userData.birthDateSystem === 'International' || !userData.birthDateSystem) && userData.birthDate) {
      const date = new Date(userData.birthDate);
      const tib = getTibetanDate(date);
      if (userData.birthAnimal !== tib.animal || userData.birthElement !== tib.element) {
        setUserData(prev => ({
          ...prev,
          birthAnimal: tib.animal,
          birthElement: tib.element
        }));
      }
    }
  }, [userData.birthDate, userData.tibetanBirthYear, userData.birthDateSystem]);

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
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

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
                  <h1 className="text-3xl font-serif font-black text-stone-950">{t(UI_LABELS.WELCOME.en, UI_LABELS.WELCOME.tib)}</h1>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">{t(UI_LABELS.SINO_TIBETAN_GUIDANCE.en, UI_LABELS.SINO_TIBETAN_GUIDANCE.tib)}</p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-6">
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-widest text-center px-1">{t(UI_LABELS.SELECT_LANGUAGE.en, UI_LABELS.SELECT_LANGUAGE.tib)}</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setUserData(prev => ({ ...prev, language: 'English' }));
                        setOnboardingStep(2);
                      }}
                      className="w-full p-6 bg-white border border-stone-100 rounded-3xl flex items-center justify-between hover:border-saffron/50 transition-all group shadow-sm"
                    >
                      <span className="font-serif text-xl font-bold text-stone-900">{t('English', 'དབྱིན་ཡིག')}</span>
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
                        <span className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">{t('Tibetan', 'བོད་ཡིག')}</span>
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
                  <h2 className="text-2xl font-serif font-black text-stone-950">{t(UI_LABELS.PRACTITIONER_DETAILS.en, UI_LABELS.PRACTITIONER_DETAILS.tib)}</h2>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">{t(UI_LABELS.FOUNDATIONAL_HINT.en, UI_LABELS.FOUNDATIONAL_HINT.tib)}</p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.DHARMA_NAME.en, UI_LABELS.DHARMA_NAME.tib)}</label>
                    <input
                      type="text"
                      placeholder="e.g. Tenzin"
                      value={userData.name || ''}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.GENDER.en, UI_LABELS.GENDER.tib)}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setUserData(prev => ({ ...prev, gender: g as any }))}
                          className={cn(
                            "p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2",
                            userData.gender === g
                              ? "bg-stone-900 text-white border-stone-800 shadow-lg scale-[1.02]"
                              : "bg-white text-stone-500 border-stone-100 shadow-sm"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-1 rounded-full",
                            userData.gender === g ? "bg-saffron" : "bg-stone-200"
                          )} />
                          {g === 'Male' ? t(UI_LABELS.MALE.en, UI_LABELS.MALE.tib) : t(UI_LABELS.FEMALE.en, UI_LABELS.FEMALE.tib)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.BIRTH_SYSTEM.en, UI_LABELS.BIRTH_SYSTEM.tib)}</label>
                      <div className="flex bg-white rounded-full p-1 border border-stone-100 shadow-sm">
                        {['International', 'Tibetan'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setUserData(prev => ({ ...prev, birthDateSystem: s as any }))}
                            className={cn(
                              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                              (userData.birthDateSystem || 'International') === s ? "bg-stone-900 text-white shadow-md" : "text-stone-400"
                            )}
                          >
                             {s === 'International' ? t(UI_LABELS.INTERNATIONAL.en, UI_LABELS.INTERNATIONAL.tib) : t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">
                        {(userData.birthDateSystem || 'International') === 'Tibetan' ? t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib) + ' ' + t(UI_LABELS.DAY_LABEL.en, UI_LABELS.DAY_LABEL.tib) : t(UI_LABELS.BIRTH_DATE_GREGORIAN.en, UI_LABELS.BIRTH_DATE_GREGORIAN.tib)}
                      </label>
                      {(userData.birthDateSystem || 'International') === 'Tibetan' ? (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 relative">
                            <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.BIRTH_YEAR_AD.en, UI_LABELS.BIRTH_YEAR_AD.tib)}</label>
                            <input
                              type="number"
                              placeholder="e.g., 1987"
                              value={userData.tibetanBirthYear || ''}
                              onChange={(e) => handleTibetanYearChange(parseInt(e.target.value))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.MONTH_LABEL.en, UI_LABELS.MONTH_LABEL.tib)}</label>
                            <select
                              value={userData.tibetanBirthMonth || 1}
                              onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthMonth: parseInt(e.target.value) }))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 appearance-none"
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.LUNAR_DAY_LABEL.en, UI_LABELS.LUNAR_DAY_LABEL.tib)}</label>
                            <select
                              value={userData.tibetanBirthDay || 1}
                              onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthDay: parseInt(e.target.value) }))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 appearance-none"
                            >
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="date"
                          value={userData.birthDate || ''}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</label>
                        {userData.birthDate && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter pulse">{t(UI_LABELS.AUTOMATIC.en, UI_LABELS.AUTOMATIC.tib)}</span>}
                      </div>
                      <div className="relative">
                        <select
                          value={userData.birthAnimal || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthAnimal: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
                        >
                          <option value="">{t(UI_LABELS.SELECT_SIGN.en, UI_LABELS.SELECT_SIGN.tib)}</option>
                          {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {a}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</label>
                        {userData.birthDate && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter pulse">{t(UI_LABELS.AUTOMATIC.en, UI_LABELS.AUTOMATIC.tib)}</span>}
                      </div>
                      <div className="relative">
                        <select
                          value={userData.birthElement || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthElement: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
                        >
                          <option value="">{t(UI_LABELS.SELECT_ELEMENT.en, UI_LABELS.SELECT_ELEMENT.tib)}</option>
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
                  {t(UI_LABELS.CONTINUE_DISCOVERY.en, UI_LABELS.CONTINUE_DISCOVERY.tib)}
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
                  <h2 className="text-2xl font-serif font-black text-stone-950">{t(UI_LABELS.ASTRO_SCIENCE.en, UI_LABELS.ASTRO_SCIENCE.tib)}</h2>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    {t(UI_LABELS.ASTRO_SCIENCE_DESC.en, UI_LABELS.ASTRO_SCIENCE_DESC.tib)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-turquoise/10 flex items-center justify-center text-turquoise">
                      <Compass size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{t(UI_LABELS.ATMOSPHERIC_ALMANAC.en, UI_LABELS.ATMOSPHERIC_ALMANAC.tib)}</h4>
                      <p className="text-[11px] text-stone-500 italic">{t(UI_LABELS.ATMOSPHERIC_ALMANAC_DESC.en, UI_LABELS.ATMOSPHERIC_ALMANAC_DESC.tib)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center text-saffron">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{t(UI_LABELS.PERSONAL_RESONANCE.en, UI_LABELS.PERSONAL_RESONANCE.tib)}</h4>
                      <p className="text-[11px] text-stone-500 italic">{t(UI_LABELS.PERSONAL_RESONANCE_DESC.en, UI_LABELS.PERSONAL_RESONANCE_DESC.tib)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="w-full bg-stone-950 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {t(UI_LABELS.SACRED_PLANNING.en, UI_LABELS.SACRED_PLANNING.tib)}
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
                  <h2 className="text-2xl font-serif font-black text-stone-950">{t(UI_LABELS.DAILY_DISCIPLINE.en, UI_LABELS.DAILY_DISCIPLINE.tib)}</h2>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    {t(UI_LABELS.DAILY_DISCIPLINE_DESC.en, UI_LABELS.DAILY_DISCIPLINE_DESC.tib)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{t(UI_LABELS.DUCHEN_FESTIVALS.en, UI_LABELS.DUCHEN_FESTIVALS.tib)}</h4>
                      <p className="text-[11px] text-stone-500 italic">{t(UI_LABELS.DUCHEN_FESTIVALS_DESC.en, UI_LABELS.DUCHEN_FESTIVALS_DESC.tib)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <StickyNote size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{t(UI_LABELS.PRACTITIONER_LOGS.en, UI_LABELS.PRACTITIONER_LOGS.tib)}</h4>
                      <p className="text-[11px] text-stone-500 italic">{t(UI_LABELS.PRACTITIONER_LOGS_DESC.en, UI_LABELS.PRACTITIONER_LOGS_DESC.tib)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setUserData(prev => ({ ...prev, onboardingComplete: true }))}
                  className="w-full bg-saffron text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-saffron/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {t(UI_LABELS.ENTER_SANCTUARY.en, UI_LABELS.ENTER_SANCTUARY.tib)}
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

      {/* Prayer Flags Strip — 5 sacred elements: sky, air, fire, water, earth */}
      <PrayerFlagsStrip />

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
            "px-6 py-4 sticky top-[5px] z-40 bg-bg-warm",
            !showHeader && "pointer-events-none"
          )}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between">
            {/* User Profile Header */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 group active:scale-95 transition-transform"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm transition-all",
                userData.gender === 'Female'
                  ? "bg-lotus border-lotus/20"
                  : "bg-stone-900 border-stone-800 group-hover:border-saffron"
              )}>
                {userData.name
                  ? <span className={cn("font-black text-sm leading-none", userData.gender === 'Female' ? "text-white" : "text-saffron")}>{userData.name.charAt(0).toUpperCase()}</span>
                  : <User size={18} className={userData.gender === 'Female' ? "text-white" : "text-saffron"} />
                }
              </div>
              {/* Name + Sign */}
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-serif font-bold text-stone-900 leading-none truncate group-hover:text-saffron">
                  {userData.name || t(UI_LABELS.PRACTITIONER.en, UI_LABELS.PRACTITIONER.tib)}
                </span>
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mt-1 truncate">
                  {ANIMAL_ICONS[userData.birthAnimal || tibCurrent.animal]}{' '}
                  {t(userData.birthAnimal || tibCurrent.animal, TIBETAN_ANIMALS[userData.birthAnimal || tibCurrent.animal])}
                  {' · '}
                  {t(userData.birthElement || tibCurrent.element, TIBETAN_ELEMENTS[userData.birthElement || tibCurrent.element])}
                </span>
              </div>
            </button>
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
              key={`home-${userData.language}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-lg mx-auto pb-32 pt-8"
            >

              {/* Home Sub-Tabs */}
              <div className="px-6 mb-6">
                <div className="flex bg-stone-100/50 p-1 rounded-2xl backdrop-blur-sm">
                  {[
                    { id: 'guidance', label: t(UI_LABELS.DAY.en, UI_LABELS.DAY.tib), icon: <Sun size={14} /> },
                    { id: 'astro', label: t(UI_LABELS.ASTRO.en, UI_LABELS.ASTRO.tib), icon: <Compass size={14} /> },
                    { id: 'days', label: t(UI_LABELS.SACRED.en, UI_LABELS.SACRED.tib), icon: <Bell size={14} /> }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setHomeTab(sub.id as HomeTab)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        homeTab === sub.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                      )}
                    >
                      {sub.icon}
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 space-y-8">
                {homeTab === 'guidance' && (
                  <motion.div
                    key="guidance"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    {/* Alignment Onboarding Hint */}
                    {!userData.birthDate && !userData.tibetanBirthYear && (
                      <motion.button
                        onClick={() => setActiveTab('profile')}
                        className="p-6 rounded-[32px] bg-stone-900 text-white relative overflow-hidden group active:scale-[0.98] transition-all text-left block w-full shadow-2xl shadow-stone-900/20"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/20 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-saffron flex items-center justify-center text-white shrink-0 shadow-lg shadow-saffron/20">
                            <Sparkles size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-serif font-black">{t(UI_LABELS.UNLOCK_ALIGNMENT.en, UI_LABELS.UNLOCK_ALIGNMENT.tib)}</h4>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1 opacity-80 leading-relaxed">
                              {t(UI_LABELS.UNLOCK_ALIGNMENT_DESC.en, UI_LABELS.UNLOCK_ALIGNMENT_DESC.tib)}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )}

                    <div id={UI_IDS.HOME.TODAY_CARD} className="relative rounded-3xl bg-stone-900 p-6 text-white overflow-hidden shadow-lg">
                      {/* Dharma Wheel watermark */}
                      <DharmaWheel className="absolute -right-10 -bottom-10 w-52 h-52 text-white/[0.055] pointer-events-none" />
                      <div className="relative space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1">{t(UI_LABELS.PHUGPA_TRADITION.en, UI_LABELS.PHUGPA_TRADITION.tib)}</p>
                            <h1 className="text-3xl font-serif font-black tracking-tight leading-tight">
                              {t(format(new Date(), 'EEEE'), TIBETAN_WEEKDAYS[format(new Date(), 'EEEE')])}, <br />
                              <span className="text-stone-400 font-light">{n(format(new Date(), 'MMM d'))}</span>
                            </h1>
                          </div>
                          <div className="text-right flex flex-col items-end gap-3">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-stone-500">
                              {t(UI_LABELS.RABJUNG.en, UI_LABELS.RABJUNG.tib)} {toTibetanNumerals(tibCurrent.rabjung)}
                            </span>
                            <button 
                              onClick={() => {
                                const symbol = tibCurrent.lunarSymbol ? MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol] : null;
                                const text = `${t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib)} - ${format(new Date(), 'EEEE, MMM d')}\n${t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)}: ${toTibetanNumerals(tibCurrent.day)}\n${t(UI_LABELS.CELESTIAL_SIGN.en, UI_LABELS.CELESTIAL_SIGN.tib)}: ${ANIMAL_ICONS[tibCurrent.animal]} ${t(tibCurrent.element, TIBETAN_ELEMENTS[tibCurrent.element])} ${t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])}\n${t(UI_LABELS.INDICATOR.en, UI_LABELS.INDICATOR.tib)}: ${symbol ? t(tibCurrent.lunarSymbol || '', symbol.tib) : ''}`;
                                if (navigator.share) {
                                  navigator.share({ title: 'Tibetan Sacred Day', text }).catch(() => {});
                                } else {
                                  navigator.clipboard.writeText(text);
                                }
                              }}
                              className="p-2 bg-white/5 rounded-xl text-stone-500 hover:text-saffron transition-colors"
                            >
                              <Share size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex gap-8">
                          <div className="space-y-0.5">
                            <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest flex items-center gap-1.5">
                              {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)}
                              {(tibCurrent.day === 15 || tibCurrent.day === 30) && (
                                <MoonPhase day={tibCurrent.day} size={8} isDark />
                              )}
                            </p>
                            <p className="text-lg font-serif font-bold text-saffron">{toTibetanNumerals(tibCurrent.day)}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.CELESTIAL_SIGN.en, UI_LABELS.CELESTIAL_SIGN.tib)}</p>
                            <p className="text-lg font-serif font-bold">
                              {ANIMAL_ICONS[tibCurrent.animal]} {t(tibCurrent.element, TIBETAN_ELEMENTS[tibCurrent.element])} {t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.INDICATOR.en, UI_LABELS.INDICATOR.tib)}</p>
                            <p className="text-lg font-serif font-bold text-saffron flex items-center gap-2">
                              {tibCurrent.lunarSymbol ? (
                                <>
                                  <span>{MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol]?.icon}</span>
                                  <span>{t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol]?.tib)}</span>
                                  {tibCurrent.isHandDay && <span className="text-[10px] text-stone-500 font-bold">({t(UI_LABELS.HAND_DAY.en, UI_LABELS.HAND_DAY.tib)})</span>}
                                  {tibCurrent.isYenKongDay && <span className="text-[10px] text-stone-500 font-bold">({t(UI_LABELS.YEN_KONG.en, UI_LABELS.YEN_KONG.tib)})</span>}
                                </>
                              ) : (
                                <span>{toTibetanNumerals(tibCurrent.mewa)} {t(UI_LABELS.MEWA.en, UI_LABELS.MEWA.tib)}</span>
                              )}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">{t(UI_LABELS.COMBINATION.en, UI_LABELS.COMBINATION.tib)}</p>
                            <p className="text-lg font-serif font-bold text-turquoise">
                              {tibCurrent.lunarSymbol ? (
                                t(tibCurrent.combination, COMBINATIONS[tibCurrent.combination]?.tib || tibCurrent.combination)
                              ) : (
                                t(
                                  `${tibCurrent.planetElement}-${tibCurrent.mansionElement} (${tibCurrent.combination})`,
                                  COMBINATIONS[`${tibCurrent.planetElement}-${tibCurrent.mansionElement}`]?.tib || tibCurrent.combination
                                )
                              )}
                            </p>
                          </div>
                        </div>

                        {userData.birthAnimal && (
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-stone-500">{t(UI_LABELS.PERSONAL_RESONANCE.en, UI_LABELS.PERSONAL_RESONANCE.tib)}</span>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                getElementalHarmony(userData.birthElement, tibCurrent.element) === 'life' ? "bg-turquoise/20 text-turquoise" :
                                  getElementalHarmony(userData.birthElement, tibCurrent.element) === 'enemy' ? "bg-red-500/20 text-red-100" : "bg-white/10 text-stone-400"
                              )}>
                                {getElementalHarmony(userData.birthElement, tibCurrent.element)} energy
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                                getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'trine' ? "bg-saffron/20 text-saffron" :
                                  getAnimalAffinity(userData.birthAnimal, tibCurrent.animal) === 'conflict' ? "bg-red-500/20 text-red-100" : "bg-white/10 text-stone-400"
                              )}>
                                {getAnimalAffinity(userData.birthAnimal, tibCurrent.animal)} affinity
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Daily Symbolic (Simplified Text Bar) */}
                    {tibCurrent.lunarSymbol && MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol] && (
                      <div className="flex items-center gap-3 py-3 border-t border-stone-100 mt-2">
                        <span className="text-2xl shrink-0">{MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] leading-relaxed text-stone-500 italic">
                            <span className="font-black text-stone-900 not-italic uppercase tracking-widest mr-2">
                              {t(tibCurrent.lunarSymbol, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].en)}:
                            </span>
                            {t(MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].description, MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].descriptionTib)}
                            {MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbidden.length > 0 && (
                              <span className="ml-2 text-red-500 font-black uppercase tracking-tighter not-italic">
                                — {t('Avoid', 'འཛེམས་བྱ།')} {t(MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbidden.join(', '), MENTSKHANG_SYMBOLS[tibCurrent.lunarSymbol].forbiddenTib.join(', '))}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Daily Wisdom (Static Text) */}
                    <div className="py-2 px-1">
                      <p className="text-[10px] leading-relaxed text-stone-500 italic">
                        {t('As the', 'དེ་རིང་')} <span className="text-saffron not-italic font-bold">{t(tibCurrent.element, TIBETAN_ELEMENTS[tibCurrent.element])}</span> {t('energy flows through the', 'ནུས་པ་དང་')} {ANIMAL_ICONS[tibCurrent.animal]} {t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])} {t('day — align your practice with presence and clarity.', 'ཉིན་མོར་རང་རེའི་ཉམས་ལེན་ལ་བརྩོན་པར་བྱ།')}
                      </p>
                    </div>

                    {/* Dashboard Grid */}


                    {/* Special Observance Notice - Only shows on sacred days */}
                    {(tibCurrent.day === 8 || tibCurrent.day === 10 || tibCurrent.day === 15 || tibCurrent.day === 25 || tibCurrent.day === 30) && (
                      <div className="p-5 rounded-[32px] bg-saffron/5 border border-saffron/10 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center text-saffron">
                            <Bell size={20} className="group-hover:animate-ring" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-saffron uppercase tracking-widest">{t(UI_LABELS.SPECIAL_OBSERVANCE.en, UI_LABELS.SPECIAL_OBSERVANCE.tib)}</p>
                            <h4 className="text-sm font-serif font-black text-stone-900">
                              {t(MONTHLY_OBSERVANCES.find(o => o.day === tibCurrent.day)?.name || 'Sacred Day', MONTHLY_OBSERVANCES.find(o => o.day === tibCurrent.day)?.nameTib || 'དུས་བཟང་།')}
                            </h4>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedDate(new Date());
                            setActiveTab('calendar');
                          }}
                          className="p-3 rounded-xl bg-stone-900 text-white hover:bg-saffron transition-colors"
                        >
                          <CalendarIcon size={16} />
                        </button>
                      </div>
                    )}




                    {/* Personal Journal Section */}
                    {Object.keys(userData.notes).length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.PERSONAL_JOURNAL.en, UI_LABELS.PERSONAL_JOURNAL.tib)}</h3>
                          <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest">{Object.keys(userData.notes).length} {t(UI_LABELS.ENTRIES.en, UI_LABELS.ENTRIES.tib)}</span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(userData.notes)
                            .sort((a, b) => b[0].localeCompare(a[0])) // Recent first
                            .map(([dateStr, note]) => (
                              <button
                                key={dateStr}
                                onClick={() => {
                                  setSelectedDate(parseISO(dateStr));
                                  setActiveTab('calendar');
                                }}
                                className="w-full bg-white p-5 rounded-[32px] border border-stone-100 flex items-center gap-5 text-left active:scale-[0.98] transition-all group"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex flex-col items-center justify-center text-stone-400 font-bold group-hover:bg-saffron/10 group-hover:text-saffron transition-colors">
                                  <span className="text-[9px] uppercase tracking-tighter leading-none">{format(parseISO(dateStr), 'MMM')}</span>
                                  <span className="text-lg leading-tight mt-0.5">{format(parseISO(dateStr), 'd')}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] text-stone-400 font-black uppercase tracking-widest mb-1">
                                    {t(format(parseISO(dateStr), 'EEEE'), TIBETAN_WEEKDAYS[format(parseISO(dateStr), 'EEEE')] || format(parseISO(dateStr), 'EEEE'))}
                                  </p>
                                  <p className="text-sm text-stone-700 line-clamp-2 leading-relaxed font-serif italic">
                                    "{note}"
                                  </p>
                                </div>
                                <ChevronRight size={16} className="text-stone-200 group-hover:text-saffron transition-colors" />
                              </button>
                            ))}
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}

                {homeTab === 'days' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <header className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-serif font-black text-stone-950">{t(UI_LABELS.GRAND.en, UI_LABELS.GRAND.tib)} <br /> <span className="text-stone-400 font-light italic">{t(UI_LABELS.GRAND_DUCHEN.en, UI_LABELS.GRAND_DUCHEN.tib)}</span></h1>
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
                          className="w-full bg-stone-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-stone-800 placeholder:text-stone-300 focus:ring-2 focus:ring-saffron/20 transition-all"
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
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.IMPORTANT_DATES.en, UI_LABELS.IMPORTANT_DATES.tib)}</h3>
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
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.TRADITIONAL_CALENDAR.en, UI_LABELS.TRADITIONAL_CALENDAR.tib)}</h3>
                        <div className="space-y-3">
                          {sortedFestivals
                            .filter(f => 
                              f.name.toLowerCase().includes(festivalSearch.toLowerCase()) || 
                              (f.nameTib && f.nameTib.includes(festivalSearch))
                            )
                            .map((f, i) => {
                            const dbEntry = Object.entries(DATABASE_2026).find(([_, d]) => d.tibMonth === f.month && d.tibDay === f.day);
                            const westernDate = dbEntry?.[1].westernDate;
                            const isPast = dbEntry?.[0] ? startOfDay(new Date(dbEntry[0])) < startOfDay(new Date()) : false;
                            const isTodayFestival = dbEntry?.[0] ? isSameDay(new Date(dbEntry[0]), new Date()) : false;

                            return (
                              <div key={i} className={cn(
                                "bg-white p-5 rounded-3xl flex items-center gap-5 border border-stone-50 transition-all",
                                isPast && "opacity-40 grayscale-[0.5]",
                                isTodayFestival && "ring-2 ring-saffron bg-saffron/5 border-saffron/20"
                              )}>
                                <div className={cn(
                                  "w-12 h-12 shrink-0 rounded-2xl flex flex-col items-center justify-center text-white font-bold",
                                  isTodayFestival ? "bg-saffron" : "bg-stone-900"
                                )}>
                                  <span className="text-[9px] opacity-70">ཟླ་{toTibetanNumerals(f.month)}</span>
                                  <span className="text-sm leading-none mt-0.5">ཚེས་{toTibetanNumerals(f.day)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className={cn(
                                    "text-[10px] font-black uppercase tracking-widest mb-0.5",
                                    isTodayFestival ? "text-saffron-700" : "text-saffron"
                                  )}>
                                    {westernDate || 'TBA'} {isTodayFestival && '• TODAY'}
                                  </div>
                                  <h4 className="text-sm font-bold text-stone-900 truncate">{t(f.name, f.nameTib || f.name)}</h4>
                                  <p className="text-[11px] text-stone-400 line-clamp-1 italic">{t(f.description, f.descriptionTib || f.description)}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const text = `${t(f.name, f.nameTib || f.name)} - ${westernDate || ''} (Tibetan Month ${f.month}, Day ${f.day})`;
                                    navigator.clipboard.writeText(text);
                                    // Could add a toast here
                                  }}
                                  className="p-2 text-stone-300 hover:text-saffron active:scale-90 transition-all"
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4 pb-20">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.MONTHLY_OBSERVANCES_LABEL.en, UI_LABELS.MONTHLY_OBSERVANCES_LABEL.tib)}</h3>
                        <div className="space-y-3">
                          {MONTHLY_OBSERVANCES
                            .filter(f => 
                              f.name.toLowerCase().includes(festivalSearch.toLowerCase()) || 
                              (f.nameTib && f.nameTib.includes(festivalSearch))
                            )
                            .map((f, i) => (
                            <div key={i} className="bg-white/40 p-5 rounded-3xl flex items-center gap-5 border border-stone-50/50">
                              <div className="w-12 h-12 shrink-0 rounded-2xl bg-stone-400 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                                <span>ཟླ་རེར།</span>
                                <span className="text-lg leading-none mt-0.5">ཚེས་{toTibetanNumerals(f.day)}</span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-stone-700 truncate">{t(f.name, f.nameTib || f.name)}</h4>
                                <p className="text-[11px] text-stone-400 line-clamp-1 italic">{t(f.description, f.descriptionTib || f.description)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {festivalSearch && sortedFestivals.filter(f => f.name.toLowerCase().includes(festivalSearch.toLowerCase())).length === 0 && (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                            <Search size={32} />
                          </div>
                          <p className="text-sm font-serif italic text-stone-400">{t(UI_LABELS.NO_MATCHING_FESTIVALS.en, UI_LABELS.NO_MATCHING_FESTIVALS.tib)}</p>
                        </div>
                      )}
                  </motion.div>
                )}
                {homeTab === 'astro' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Dimensional Analysis Card (Today's Alignment) */}
                    <div className="bg-stone-950 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-stone-950/40">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-turquoise/20 rounded-full blur-3xl -mr-20 -mt-20" />

                      <div className="relative space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">{t(UI_LABELS.TODAYS_ALIGNMENT.en, UI_LABELS.TODAYS_ALIGNMENT.tib)}</h2>
                          <div className="px-3 py-1 rounded-full bg-white/10 text-[9px] font-extrabold uppercase tracking-widest text-turquoise">
                            Rabjung #{toTibetanNumerals(tibCurrent.rabjung)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4 border-r border-white/5 pr-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</p>
                              <p className="text-3xl font-serif font-black text-turquoise italic">{t(tibCurrent.element, TIBETAN_ELEMENTS[tibCurrent.element])}</p>
                            </div>
                            <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                              {t('Fundamental energy flow for this current lunar day.', 'དེ་རིང་གི་རྩ་བའི་ནུས་པ་འབབ་སྟངས་ཡིན།')}
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</p>
                              <p className="text-3xl font-serif font-black text-saffron italic">
                                {ANIMAL_ICONS[tibCurrent.animal]} {t(tibCurrent.animal, TIBETAN_ANIMALS[tibCurrent.animal])}
                              </p>
                            </div>
                            <p className="text-[10px] text-stone-400 font-medium leading-relaxed">
                              {t('Influences social interactions and external success.', 'སྤྱི་ཚོགས་འབྲེལ་ལམ་དང་བྱ་བ་ལམ་འགྲོ་ལ་ཕན།')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personalized Horoscope */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Horoscope', 'རང་རེའི་བླ་རྟགས།')}</h3>
                      </div>

                      <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 relative overflow-hidden group">
                        <div className="space-y-4">
                          <p className="text-xs text-stone-700 leading-relaxed italic">
                            {(() => {
                              const harmony = getElementalHarmony(userData.birthElement, tibCurrent.element);
                              const rule = HOROSCOPE_RULES[harmony] || HOROSCOPE_RULES['neutral'];
                              return t(
                                `${rule.title}: ${rule.text} ${rule.advice}`,
                                `${rule.titleTib}། ${rule.textTib} ${rule.adviceTib}`
                              );
                            })()}
                          </p>

                          <div className="flex items-center gap-2 pt-2 grayscale opacity-50">
                            <div className="w-1 h-1 rounded-full bg-stone-400" />
                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">
                              {t(userData.birthElement || "Unset", TIBETAN_ELEMENTS[userData.birthElement || ""] || "Unset")} {userData.birthAnimal ? `${ANIMAL_ICONS[userData.birthAnimal]} ${t(userData.birthAnimal, TIBETAN_ANIMALS[userData.birthAnimal])}` : "Sign"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Daily Tibetan Almanac (Lo-tho) */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.DAILY_ALMANAC.en, UI_LABELS.DAILY_ALMANAC.tib)}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-[32px] p-6 border border-stone-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white text-xs font-serif italic">
                              {PARKHA_ICONS[tibCurrent.parkha]}
                            </div>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.TRIGRAM.en, UI_LABELS.TRIGRAM.tib)}</p>
                          </div>
                          <div>
                            <p className="text-xl font-serif font-black text-stone-900">{tibCurrent.parkha}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                               <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[7px] font-black uppercase rounded">{t('Check Compatibility', 'མཐུན་འཕྲོད་ལྟ་བ།')}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 italic mt-1 leading-relaxed line-clamp-2">
                              {PARKHA_CHARACTERISTICS[tibCurrent.parkha] && t(PARKHA_CHARACTERISTICS[tibCurrent.parkha].en, PARKHA_CHARACTERISTICS[tibCurrent.parkha].tib)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-[32px] p-6 border border-stone-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-saffron flex items-center justify-center text-white text-xs font-serif italic">
                              {MEWA_ICONS[tibCurrent.mewa]}
                            </div>
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.MAGIC_SQUARE.en, UI_LABELS.MAGIC_SQUARE.tib)}</p>
                          </div>
                          <div>
                            <p className="text-xl font-serif font-black text-stone-900">{toTibetanNumerals(tibCurrent.mewa)}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                               <span className="px-1.5 py-0.5 bg-saffron/10 text-saffron text-[7px] font-black uppercase rounded">{t('Best for: New Deeds', 'བྱ་བ་གསར་པ་ལ་བཟང་།')}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 italic mt-2 leading-relaxed line-clamp-2">
                              {MEWA_CHARACTERISTICS[tibCurrent.mewa] && t(MEWA_CHARACTERISTICS[tibCurrent.mewa].en, MEWA_CHARACTERISTICS[tibCurrent.mewa].tib)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {userData.birthAnimal && (
                        <div className="p-5 bg-stone-900 rounded-[30px] border border-stone-800 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                              <Star size={18} className="text-saffron" />
                            </div>
                            <div>
                              <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{t(UI_LABELS.DAILY_DESTINY.en, UI_LABELS.DAILY_DESTINY.tib)}</h4>
                              <p className="text-xs font-serif font-bold text-white leading-none mt-1">
                                {(() => {
                                  const rule = HOROSCOPE_RULES[getElementalHarmony(userData.birthElement, tibCurrent.element)];
                                  return rule ? t(rule.title, rule.titleTib) : t("Neutral Flow", "དཀྱུས་མའི་གནས་བབས།");
                                })()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-stone-600 uppercase tracking-widest">{t(UI_LABELS.AFFINITY.en, UI_LABELS.AFFINITY.tib)}</p>
                            <p className="text-[10px] font-bold text-turquoise uppercase tracking-wider">{getAnimalAffinity(userData.birthAnimal, tibCurrent.animal)}</p>
                          </div>
                        </div>
                      )}
                    </section>


                    {/* Annual Resonance Section */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[8px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.ANNUAL_ESSENCE.en, UI_LABELS.ANNUAL_ESSENCE.tib)}</h3>
                        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest italic">{t(tibCurrent.yearName, tibCurrent.yearName)} {t('Year', 'ལོ།')}</span>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100/50">

                        <div className="min-w-0">
                          <h4 className="text-sm font-serif font-black text-stone-950 truncate">
                            {ANIMAL_ICONS[tibCurrent.animal]} {tibCurrent.yearName}
                          </h4>
                          <p className="text-[10px] text-stone-500 italic line-clamp-2 mt-1">
                            {ANIMAL_CHARACTERISTICS[tibCurrent.animal] && t(ANIMAL_CHARACTERISTICS[tibCurrent.animal].en, ANIMAL_CHARACTERISTICS[tibCurrent.animal].tib)}
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Celestial Identity (Personal Essence) */}
                    {userData.birthAnimal && userData.birthElement && (
                      <div className="bg-stone-900 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-stone-900/40 mt-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/20 rounded-full blur-3xl -mr-10 -mt-10" />
                        <div className="relative space-y-4">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-saffron" />
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">{t(UI_LABELS.CELESTIAL_IDENTITY.en, UI_LABELS.CELESTIAL_IDENTITY.tib)}</h3>
                          </div>
                          <div className="space-y-4">
                            <p className="text-sm font-serif font-bold italic leading-relaxed text-stone-100">
                              {t(
                                `"As a ${userData.birthElement} ${userData.birthAnimal}, you embody a rare synergy of ${userData.birthElement.toLowerCase()} and ${userData.birthAnimal.toLowerCase()} energies."`,
                                `"${TIBETAN_ELEMENTS[userData.birthElement]} ${TIBETAN_ANIMALS[userData.birthAnimal]}ཡིན་པའི་ཆ་ནས། ཁྱེད་ལ་${TIBETAN_ELEMENTS[userData.birthElement]}དང་${TIBETAN_ANIMALS[userData.birthAnimal]}གཉིས་ཀྱི་ནུས་པ་ཁྱད་པར་ཅན་ཞིག་ཡོད།"`
                              )}
                            </p>
                            <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
                              {userData.birthAnimal && ANIMAL_CHARACTERISTICS[userData.birthAnimal] && t(ANIMAL_CHARACTERISTICS[userData.birthAnimal].en, ANIMAL_CHARACTERISTICS[userData.birthAnimal].tib)}
                              {' '}
                              {userData.birthElement && ELEMENT_CHARACTERISTICS[userData.birthElement] && t(ELEMENT_CHARACTERISTICS[userData.birthElement].en, ELEMENT_CHARACTERISTICS[userData.birthElement].tib)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key={`calendar-${userData.language}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 max-w-lg mx-auto pb-32"
            >
              <header className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[8px] font-black text-saffron uppercase tracking-widest leading-none mb-1">
                    Tib. Year {toTibetanNumerals(tibSelected.year)} • {tibSelected.yearName}
                  </h2>
                  <h2 className="text-2xl font-serif font-black text-stone-950">
                    {calendarView === 'month' ? n(format(currentDate, 'MMMM yyyy')) : t(UI_LABELS.ANNUAL_CYCLE.en, UI_LABELS.ANNUAL_CYCLE.tib)}
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
                    {t('Week', 'བདུན་ཕྲག')}
                  </button>
                  <button
                    onClick={() => setCalendarView('month')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      calendarView === 'month' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                    )}
                  >
                    {t('Month', 'ཟླ་བ།')}
                  </button>
                  <button
                    onClick={() => setCalendarView('year')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      calendarView === 'year' ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                    )}
                  >
                    {t('Year', 'ལོ་འཁོར།')}
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

                          const dayOfWeek = format(date, 'EEEE');
                          const isLaDay = powerDays?.la === dayOfWeek;
                          const isSokDay = powerDays?.sok === dayOfWeek;
                          const isEnemyDay = powerDays?.enemy === dayOfWeek;

                          return (
                            <motion.div
                              key={dateKey}
                              ref={isToday ? todayRef : null}
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
                                    <p className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", isSelected ? "text-stone-400" : "text-stone-300")}>
                                      {t(UI_LABELS.LUNAR_DAY.en, UI_LABELS.LUNAR_DAY.tib)} {toTibetanNumerals(tib.day)}
                                      {tib.day === 15 && <span className="text-yellow-500 text-xs">🌕</span>}
                                      {tib.day === 30 && <span className="text-stone-400 text-xs">🌑</span>}
                                      <span className="mx-1 opacity-20">•</span>
                                      <span className={cn("text-[8px] font-black", isSelected ? "text-turquoise" : "text-turquoise")}>
                                        {tib.lunarSymbol ? (
                                          <span className="flex items-center gap-1">
                                            {MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.icon} {t(tib.lunarSymbol, MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.tib)}
                                          </span>
                                        ) : (
                                          t(`${tib.planetElement}-${tib.mansionElement}`, COMBINATIONS[`${tib.planetElement}-${tib.mansionElement}`]?.tib || tib.combination)
                                        )}
                                      </span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <h4 className="text-sm font-serif font-bold">
                                        {allEvents.length > 0 ? allEvents[0].name : (isToday ? t(UI_LABELS.PRESENT_MOMENT.en, UI_LABELS.PRESENT_MOMENT.tib) : t(UI_LABELS.CLEAR_SKY.en, UI_LABELS.CLEAR_SKY.tib))}
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {sticker?.emoji && <span className="text-lg">{sticker.emoji}</span>}
                                  
                                  {/* Personal Power Day Indicators */}
                                  <div className="flex items-center gap-1">
                                    {isLaDay && (
                                      <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-[7px] font-black text-green-700 uppercase">L</span>
                                      </div>
                                    )}
                                    {isSokDay && (
                                      <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-[7px] font-black text-blue-700 uppercase">S</span>
                                      </div>
                                    )}
                                    {isEnemyDay && (
                                      <div className="flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[7px] font-black text-red-700 uppercase">E</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Day Element & Animal Indicator */}
                                  <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-tighter",
                                    isSelected ? "bg-white/10 border-white/20 text-white" : "bg-stone-50 border-stone-100 text-stone-400"
                                  )}>
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      tib.element === 'Fire' ? 'bg-red-500' : 
                                      tib.element === 'Water' ? 'bg-blue-500' :
                                      tib.element === 'Earth' ? 'bg-amber-600' :
                                      tib.element === 'Iron' ? 'bg-stone-400' : 'bg-green-500'
                                    )} />
                                    <span>{ANIMAL_ICONS[tib.animal]} {tib.animal.slice(0, 3)}</span>
                                  </div>

                                  {note && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-turquoise" : "bg-turquoise/40")} />}
                                  {allEvents.length > 1 && (
                                    <div className="px-2 py-1 bg-saffron/10 text-saffron rounded-full text-[8px] font-black uppercase">
                                      +{allEvents.length - 1}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {note && (
                                <p className={cn(
                                  "text-[11px] font-medium mt-3 px-1 leading-relaxed line-clamp-1 border-l-2 pl-3 break-all",
                                  isSelected ? "text-stone-400 border-white/20" : "text-stone-400 border-stone-100"
                                )}>
                                  {note}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Legend Section */}
                      <div className="mt-8 px-2 space-y-6 pb-12 border-t border-stone-50 pt-8">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Alignment', 'རང་གི་རྟགས།')}</h4>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
                              <span className="text-[10px] text-stone-500 font-black uppercase tracking-tight">{t('Soul Day (La-Day)', 'བླ་གཟའ།')}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                              <span className="text-[10px] text-stone-500 font-black uppercase tracking-tight">{t('Vitality Day (Sok)', 'སྲོག་གཟའ།')}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                              <span className="text-[10px] text-stone-500 font-black uppercase tracking-tight">{t('Conflict Day', 'གཤེད་གཟའ།')}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-saffron shadow-sm" />
                              <span className="text-[10px] text-stone-500 font-black uppercase tracking-tight">{t('Sacred Festival', 'དུས་ཆེན།')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Personal Alignment Legend', 'རང་གི་སྐར་རྩིས་མཚོན་རྟགས།')}</h4>
                          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-[9px] text-stone-500 font-bold uppercase">L: La (Soul)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              <span className="text-[9px] text-stone-500 font-bold uppercase">S: Sok (Vitality)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              <span className="text-[9px] text-stone-500 font-bold uppercase">E: Enemy (Conflict)</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{t('Day Elements', 'ཉིན་རེའི་འབྱུང་བ།')}</h4>
                          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-[10px] text-stone-500 font-bold uppercase">{t('Fire', 'མེ།')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-[10px] text-stone-500 font-bold uppercase">{t('Water', 'ཆུ།')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-600" />
                              <span className="text-[10px] text-stone-500 font-bold uppercase">{t('Earth', 'ས།')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-stone-400" />
                              <span className="text-[10px] text-stone-500 font-bold uppercase">{t('Iron/Wind', 'ལྕགས་རླུང་།')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-[10px] text-stone-500 font-bold uppercase">{t('Wood', 'ཤིང་།')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Jump to Today FAB */}
                  <AnimatePresence>
                    {showJumpToday && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={scrollToToday}
                        className="fixed bottom-32 right-6 p-4 bg-stone-900 text-white rounded-2xl shadow-2xl z-50 flex items-center gap-3 active:scale-95 transition-transform"
                      >
                        <div className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('Today', 'དེ་རིང་།')}</span>
                      </motion.button>
                    )}
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
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('Lunar Month', 'བོད་ཟླ།')} {toTibetanNumerals(tibSelected.month)}</span>
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
                                )}>{n(format(date, 'd'))}</span>

                                <div className="flex items-center gap-1">
                                  <span className={cn("text-[7px] font-black uppercase flex items-center gap-0.5", isSelected ? "text-stone-800" : "text-stone-300")}>
                                    {toTibetanNumerals(tib.day)}
                                    {tib.isDoubleDay && "⁺"}
                                    {tib.day === 15 && <span>🌕</span>}
                                    {tib.day === 30 && <span>🌑</span>}
                                    {tib.lunarSymbol && (
                                      <span className="ml-0.5 opacity-80" title={tib.lunarSymbol}>
                                        {MENTSKHANG_SYMBOLS[tib.lunarSymbol]?.icon}
                                      </span>
                                    )}
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
                  {(() => {
                    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
                    const selectedSticker = userData.stickers?.[selectedDateKey];
                    const selectedNote = userData.notes[selectedDateKey];

                    return (
                      <>
                        <div className="mt-6 border-t border-stone-100 pt-6 space-y-4">
                          <div className="flex items-center justify-between pb-2">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[20px] bg-stone-950 flex items-center justify-center text-white text-xl font-serif font-black shadow-lg shadow-stone-200">
                                {n(format(selectedDate, 'd'))}
                              </div>
                              <div>
                                <h3 className="text-xl font-serif font-black text-stone-900 leading-tight">
                                  {format(selectedDate, 'EEEE')}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                                    {t('Lunar Day', 'བོད་ཚེས།')} {toTibetanNumerals(tibSelected.day)}
                                  </p>
                                  <span className="w-1 h-1 rounded-full bg-stone-200" />
                                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest flex items-center gap-1">
                                    {ANIMAL_ICONS[tibSelected.animal]} {t(tibSelected.animal, TIBETAN_ANIMALS[tibSelected.animal])}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsNoteSheetOpen(true)}
                              className="p-3 bg-stone-50 rounded-2xl text-stone-300 hover:text-stone-900 hover:bg-stone-100 transition-all active:scale-90"
                            >
                              <Pencil size={18} />
                            </button>
                          </div>

                          {/* Day Alignment & Specifications */}
                          <div className="space-y-6 pt-2">
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.DAY_SPECIFICATIONS.en, UI_LABELS.DAY_SPECIFICATIONS.tib)}</h4>
                              <div className="space-y-2.5">
                                {/* Moon Phases */}
                                {tibSelected.day === 15 && <StatusItem icon={<MoonPhase day={15} size={22} />} label={t(UI_LABELS.FULL_MOON.en, UI_LABELS.FULL_MOON.tib)} detail={t(UI_LABELS.LUNAR_DAY_15.en, UI_LABELS.LUNAR_DAY_15.tib)} color="text-stone-900" />}
                                {tibSelected.day === 30 && <StatusItem icon={<MoonPhase day={30} size={22} />} label={t(UI_LABELS.NEW_MOON.en, UI_LABELS.NEW_MOON.tib)} detail={t(UI_LABELS.LUNAR_DAY_30.en, UI_LABELS.LUNAR_DAY_30.tib)} color="text-stone-900" />}

                                {/* Personal Harmony Item */}
                                {userData.birthAnimal && (
                                  <div className="flex items-center justify-between p-3 bg-stone-50/50 rounded-2xl border border-stone-100/50 group">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                        <Sparkles size={18} />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">{t(UI_LABELS.SACRED_ALIGNMENT.en, UI_LABELS.SACRED_ALIGNMENT.tib)}</p>
                                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide leading-none">{t(UI_LABELS.BIRTH_CHART_RESONANCE.en, UI_LABELS.BIRTH_CHART_RESONANCE.tib)}</p>
                                      </div>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-full bg-white border border-stone-100 flex items-center gap-2">
                                      <Compass size={10} className="text-stone-400" />
                                      <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">
                                        {getElementalHarmony(userData.birthElement, tibSelected.element) === 'life' ? t(UI_LABELS.LIFE_FORCE_ALIGNMENT.en, UI_LABELS.LIFE_FORCE_ALIGNMENT.tib) :
                                         getElementalHarmony(userData.birthElement, tibSelected.element) === 'son' ? t(UI_LABELS.PROSPERITY_ALIGNMENT.en, UI_LABELS.PROSPERITY_ALIGNMENT.tib) :
                                         getElementalHarmony(userData.birthElement, tibSelected.element) === 'enemy' ? t(UI_LABELS.OBSTACLE_ALIGNMENT.en, UI_LABELS.OBSTACLE_ALIGNMENT.tib) :
                                         t(UI_LABELS.NEUTRAL_ALIGNMENT.en, UI_LABELS.NEUTRAL_ALIGNMENT.tib)}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Mentskhang Symbol Indicator */}
                                {tibSelected.lunarSymbol && (
                                  <div className="flex items-start gap-4 p-5 bg-saffron/[0.03] rounded-3xl border border-saffron/10 group">
                                    <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0">
                                      {MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.icon}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-serif font-black text-stone-900">
                                          {t(tibSelected.lunarSymbol, MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.tib)} ({MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.en})
                                        </h4>
                                        {tibSelected.isHandDay && <span className="px-1.5 py-0.5 bg-stone-900 text-white text-[7px] font-black uppercase rounded">{t(UI_LABELS.HAND.en, UI_LABELS.HAND.tib)}</span>}
                                        {tibSelected.isYenKongDay && <span className="px-1.5 py-0.5 bg-stone-900 text-white text-[7px] font-black uppercase rounded">{t(UI_LABELS.YEN_KONG.en, UI_LABELS.YEN_KONG.tib)}</span>}
                                      </div>
                                      <p className="text-[10px] text-stone-500 italic leading-relaxed">
                                        {t(MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.description, MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.descriptionTib)}
                                      </p>
                                      {MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol]?.forbidden && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                          {t(MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol].forbidden, MENTSKHANG_SYMBOLS[tibSelected.lunarSymbol].forbiddenTib).map((f, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-black uppercase tracking-tighter rounded-full border border-red-100/50">
                                              {userData.language === 'Tibetan' ? f : `No ${f}`}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Doubled/Skipped */}
                                {tibSelected.isDoubleDay && <StatusItem icon={<span className="text-xl font-black text-saffron">⁺</span>} label={t(UI_LABELS.DOUBLE_DAY.en, UI_LABELS.DOUBLE_DAY.tib)} detail={t(UI_LABELS.DOUBLE_DAY_DESC.en, UI_LABELS.DOUBLE_DAY_DESC.tib)} />}
                                {tibSelected.isSkippedDay && <StatusItem icon={<span className="text-xl font-black text-red-500">⁻</span>} label={t(UI_LABELS.SKIPPED_DAY.en, UI_LABELS.SKIPPED_DAY.tib)} detail={t(UI_LABELS.SKIPPED_DAY_DESC.en, UI_LABELS.SKIPPED_DAY_DESC.tib)} />}

                                {/* Festivals */}
                                {FESTIVALS.filter(f => f.month === tibSelected.month && f.day === tibSelected.day).map(f => (
                                  <StatusItem key={f.name} icon="🏮" label={t(f.name, f.nameTib)} detail={t(f.description, f.descriptionTib)} color="text-tibetan-red" />
                                ))}

                                {/* Generic Placeholder if empty */}
                                {tibSelected.day !== 15 && tibSelected.day !== 30 && !tibSelected.isDoubleDay && !tibSelected.isSkippedDay && FESTIVALS.filter(f => f.month === tibSelected.month && f.day === tibSelected.day).length === 0 && !userData.birthAnimal && (
                                  <div className="py-4 text-[10px] text-stone-300 font-medium italic text-center border-2 border-dashed border-stone-50 rounded-3xl">{t(UI_LABELS.NO_CELESTIAL_MARKERS.en, UI_LABELS.NO_CELESTIAL_MARKERS.tib)}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Display existing note/reminder/custom festival if any */}
                          {(selectedNote || currentReminder || customFestivalToday) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-4"
                            >
                              {customFestivalToday && (
                                <div className="bg-amber-50 p-4 rounded-2xl space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-saffron uppercase tracking-widest">{t(UI_LABELS.CUSTOM_EVENT.en, UI_LABELS.CUSTOM_EVENT.tib)}</span>
                                    <CalendarIcon size={12} className="text-saffron" />
                                  </div>
                                  <h4 className="text-sm font-bold text-stone-900 break-words">{customFestivalToday.name}</h4>
                                  {customFestivalToday.description && (
                                    <p className="text-[11px] text-stone-500 italic whitespace-pre-wrap break-words">{customFestivalToday.description}</p>
                                  )}
                                </div>
                              )}
                              {currentReminder && (
                                <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-2xl">
                                  <Clock size={16} className="text-saffron" />
                                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">{t(UI_LABELS.REMIND_ME_TODAY.en, UI_LABELS.REMIND_ME_TODAY.tib)}</span>
                                </div>
                              )}
                              {selectedNote && (
                                <div className="bg-stone-50 p-4 rounded-2xl space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.MY_NOTES.en, UI_LABELS.MY_NOTES.tib)}</span>
                                    <StickyNote size={12} className="text-stone-300" />
                                  </div>
                                  <p className="text-xs font-medium text-stone-600 leading-relaxed whitespace-pre-wrap break-words">{selectedNote}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </>
                    );
                  })()}



                  <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.TRIGRAM_PARKHA.en, UI_LABELS.TRIGRAM_PARKHA.tib)}</p>
                      <p className="text-xs font-bold text-stone-900">{PARKHA_ICONS[tibSelected.parkha]} {tibSelected.parkha}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.MAGIC_SQ_MEWA.en, UI_LABELS.MAGIC_SQ_MEWA.tib)}</p>
                      <p className="text-xs font-bold text-stone-900">{MEWA_ICONS[tibSelected.mewa]} {tibSelected.mewa}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.YEAR_SIGNATURE.en, UI_LABELS.YEAR_SIGNATURE.tib)}</p>
                      <p className="text-xs font-bold text-amber-800 italic">{tibSelected.yearName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.LUNAR_CYCLE.en, UI_LABELS.LUNAR_CYCLE.tib)}</p>
                      <p className="text-xs font-bold text-stone-800">{t(UI_LABELS.MONTH_LABEL.en, UI_LABELS.MONTH_LABEL.tib)} {n(tibSelected.month)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.DAY_CONJUNCTION.en, UI_LABELS.DAY_CONJUNCTION.tib)}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-turquoise">
                          {t(tibSelected.combination, COMBINATIONS[`${tibSelected.planetElement}-${tibSelected.mansionElement}`]?.tib || tibSelected.combination)}
                        </span>
                        <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">
                          ({tibSelected.planetElement}-{tibSelected.mansionElement})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{t(UI_LABELS.FOCUS.en, UI_LABELS.FOCUS.tib)}</p>
                      <p className="text-[10px] font-medium text-stone-500 italic">
                        {(() => {
                          const combined = `${tibSelected.planetElement}-${tibSelected.mansionElement}`;
                          if (combined === 'Earth-Water') return t(UI_LABELS.AUSPICIOUS_BUILDING.en, UI_LABELS.AUSPICIOUS_BUILDING.tib);
                          if (combined === 'Earth-Fire') return t(UI_LABELS.CAUTION_FRICTION.en, UI_LABELS.CAUTION_FRICTION.tib);
                          if (combined === 'Water-Water') return t(UI_LABELS.FORTUNATE_HEALING.en, UI_LABELS.FORTUNATE_HEALING.tib);
                          return t(UI_LABELS.BALANCED_ROUTINE.en, UI_LABELS.BALANCED_ROUTINE.tib);
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Moon Legend Indicator */}
                  <div className="flex items-center justify-center gap-6 pt-10 pb-12 opacity-30">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-xs">🌕</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-stone-500">{t(UI_LABELS.FULL_MOON.en, UI_LABELS.FULL_MOON.tib)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 text-xs">🌑</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-stone-500">{t(UI_LABELS.NEW_MOON.en, UI_LABELS.NEW_MOON.tib)}</span>
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
                        <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{t(UI_LABELS.ANNUAL_ESSENCE.en, UI_LABELS.ANNUAL_ESSENCE.tib)}</h3>
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
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.LUNAR_PATH.en, UI_LABELS.LUNAR_PATH.tib)}</h3>
                    <div className="bg-white rounded-[32px] overflow-hidden divide-y divide-stone-50">
                      {Array.from({ length: 12 }).map((_, monthIdx) => {
                        const m = monthIdx + 1;
                        const monthFestivals = FESTIVALS.filter(f => f.month === m);
                        return (
                          <div key={m} className="p-6 flex items-start gap-5 hover:bg-stone-50 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex flex-col items-center justify-center text-saffron shrink-0">
                              <span className="text-[8px] font-black uppercase tracking-tighter">{t(UI_LABELS.MONTH.en, UI_LABELS.MONTH.tib)}</span>
                              <span className="text-lg font-serif font-black leading-none">{toTibetanNumerals(m)}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between pt-1">
                                <p className="text-xs font-black text-stone-900 uppercase tracking-widest">
                                  {m === 1 ? t(UI_LABELS.LOSAR_CYCLE.en, UI_LABELS.LOSAR_CYCLE.tib) : m === 4 ? t(UI_LABELS.SAGA_DAWA.en, UI_LABELS.SAGA_DAWA.tib) : `${t(UI_LABELS.LUNAR_CYCLE.en, UI_LABELS.LUNAR_CYCLE.tib)} ${toTibetanNumerals(m)}`}
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
                                      <span className="text-[11px] font-bold text-stone-600">{t(UI_LABELS.DAY_LABEL.en, UI_LABELS.DAY_LABEL.tib)} {toTibetanNumerals(f.day)}: {f.name}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-stone-400 italic">{t(UI_LABELS.BALANCED_PERIOD.en, UI_LABELS.BALANCED_PERIOD.tib)}</p>
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
                      {t(UI_LABELS.CALENDAR_QUOTE.en, UI_LABELS.CALENDAR_QUOTE.tib)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key={`profile-${userData.language}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-6 py-10 max-w-lg mx-auto pb-32 space-y-8"
            >
              {/* Minimal Social Profile Header */}
              <header className="flex flex-col items-center text-center space-y-4 relative py-4">
                {/* Endless Knot (Palbu) — symbol of interdependence */}
                <EndlessKnot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 text-stone-300/50 pointer-events-none" />
                <button
                  onClick={() => setIsProfileSheetOpen(true)}
                  className="relative group/avatar active:scale-95 transition-transform z-10"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-stone-100 border-4 border-white shadow-xl transition-all",
                    userData.gender === 'Female'
                      ? "bg-lotus group-hover:border-lotus/50 shadow-lotus/20"
                      : "bg-stone-900 group-hover:border-saffron"
                  )}>
                    <User size={32} className={userData.gender === 'Female' ? "text-white" : "text-saffron"} />
                  </div>
                  <div className="absolute -right-1 -bottom-1 w-7 h-7 bg-saffron rounded-full flex items-center justify-center text-white border-4 border-bg-warm shadow-lg group-hover/avatar:scale-110 transition-transform">
                    <Pencil size={12} strokeWidth={3} />
                  </div>
                </button>
                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-2xl font-serif font-black text-stone-950 tracking-tight">
                      {userData.name ? userData.name : t(UI_LABELS.PRACTITIONER.en, UI_LABELS.PRACTITIONER.tib)}
                    </h1>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {userData.birthAnimal && (
                      <span className="px-2 py-0.5 rounded-full bg-saffron/10 text-saffron text-[8px] font-black uppercase tracking-widest border border-saffron/20">
                        {ANIMAL_ICONS[userData.birthAnimal]} {t(userData.birthAnimal, TIBETAN_ANIMALS[userData.birthAnimal])}
                      </span>
                    )}
                    {userData.birthElement && (
                      <span className="px-2 py-0.5 rounded-full bg-turquoise/10 text-turquoise text-[8px] font-black uppercase tracking-widest border border-turquoise/20">
                        {t(userData.birthElement, TIBETAN_ELEMENTS[userData.birthElement])}
                      </span>
                    )}
                  </div>
                </div>
              </header>

              {/* Profile Info - Seamless List Style */}
              <section className="space-y-6 pt-4 border-t border-stone-100">
                <div className="space-y-5">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <User size={16} className="text-stone-300 group-hover:text-saffron transition-colors" />
                      <div>
                        <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{t(UI_LABELS.GENDER_ORIENTATION.en, UI_LABELS.GENDER_ORIENTATION.tib)}</p>
                        <p className="text-xs font-bold text-stone-800">
                          {userData.gender ? t(userData.gender === 'Male' ? UI_LABELS.MALE.en : UI_LABELS.FEMALE.en, userData.gender === 'Male' ? UI_LABELS.MALE.tib : UI_LABELS.FEMALE.tib) : t(UI_LABELS.NOT_SPECIFIED.en, UI_LABELS.NOT_SPECIFIED.tib)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <CalendarIcon size={16} className="text-stone-300 group-hover:text-saffron transition-colors" />
                      <div>
                        <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{t(UI_LABELS.BIRTH_DATE_LABEL.en, UI_LABELS.BIRTH_DATE_LABEL.tib)}</p>
                        <p className="text-xs font-bold text-stone-800">
                          {userData.birthDateSystem === 'Tibetan'
                            ? (userData.tibetanBirthYear
                              ? `${n(userData.tibetanBirthYear)}-${n(userData.tibetanBirthMonth || 1)}-${n(userData.tibetanBirthDay || 1)} (${t(UI_LABELS.TIBETAN_YEAR_LABEL.en, UI_LABELS.TIBETAN_YEAR_LABEL.tib)} ${n(userData.tibetanBirthYear > 1000 ? userData.tibetanBirthYear + 127 : userData.tibetanBirthYear)})`
                              : t(UI_LABELS.ESTABLISH_ALIGNMENT.en, UI_LABELS.ESTABLISH_ALIGNMENT.tib))
                            : (userData.birthDate
                              ? `${n(format(parseISO(userData.birthDate), 'MMMM do, yyyy'))} (${t(UI_LABELS.TIBETAN_YEAR_LABEL.en, UI_LABELS.TIBETAN_YEAR_LABEL.tib)} ${n(getTibetanDate(new Date(userData.birthDate)).year)})`
                              : t(UI_LABELS.ESTABLISH_ALIGNMENT.en, UI_LABELS.ESTABLISH_ALIGNMENT.tib))}
                        </p>
                        {convertedGregorian && (
                          <p className="text-[9px] text-saffron font-bold mt-1.5 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-saffron/10">
                            {t(`${UI_LABELS.INTERNATIONAL_FORMAT_HINT.en} ${format(convertedGregorian, 'MMMM do, yyyy')}`,
                              `${UI_LABELS.INTERNATIONAL_FORMAT_HINT.tib} ${n(format(convertedGregorian, 'yyyy-MM-dd'))} རེད།`)}
                          </p>
                        )}
                        {userData.birthDateSystem === 'International' || !userData.birthDateSystem ? (
                          userData.birthDate && (
                            <p className="text-[9px] text-saffron font-bold mt-1.5 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-saffron/10">
                              {(() => {
                                try {
                                  const dateObj = new Date(userData.birthDate);
                                  if (isNaN(dateObj.getTime())) return null;
                                  const tib = getTibetanDate(dateObj);
                                  return t(`${UI_LABELS.TIBETAN_CALENDAR_HINT.en} ${n(tib.year)}-${n(tib.month)}-${n(tib.day)}`,
                                    `${UI_LABELS.TIBETAN_CALENDAR_HINT.tib} བོད་ལོ་ ${n(tib.year)} ཟླ་བ་ ${n(tib.month)} ཚེས་ ${n(tib.day)} རེད།`);
                                } catch (e) { return null; }
                              })()}
                            </p>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <p className="w-4 text-center text-stone-300 group-hover:text-saffron transition-colors text-lg font-serif">
                        {userData.birthAnimal ? ANIMAL_ICONS[userData.birthAnimal] : '🐾'}
                      </p>
                      <div>
                        <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</p>
                        <p className="text-xs font-bold text-stone-800">
                          {userData.birthAnimal ? t(userData.birthAnimal, TIBETAN_ANIMALS[userData.birthAnimal]) : t(UI_LABELS.UNCALCULATED.en, UI_LABELS.UNCALCULATED.tib)}
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
                        <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</p>
                        <p className="text-xs font-bold text-stone-800">
                          {userData.birthElement ? t(userData.birthElement, TIBETAN_ELEMENTS[userData.birthElement]) : t(UI_LABELS.UNCALCULATED.en, UI_LABELS.UNCALCULATED.tib)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Yearly Horoscope & Power Days */}
              {userData.birthAnimal && userData.birthElement && (
                <section className="space-y-6">
                  {/* Dhun-Zur Alert */}
                  {yearlyHoroscope?.isDhunZur && (
                    <div className="p-5 rounded-3xl bg-red-50 border border-red-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                        <Info size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-900">{t(UI_LABELS.DHUN_ZUR_CONFLICT.en, UI_LABELS.DHUN_ZUR_CONFLICT.tib)}</h4>
                        <p className="text-[10px] text-red-600 leading-relaxed mt-1">
                          {t(UI_LABELS.DHUN_ZUR_DESC.en, UI_LABELS.DHUN_ZUR_DESC.tib)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* The Four Vitalities (Scores) */}
                  <div className="p-6 rounded-[32px] bg-stone-900 text-white space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">{t(UI_LABELS.YEARLY_ENERGY_SCORES.en, UI_LABELS.YEARLY_ENERGY_SCORES.tib)}</h3>
                      <span className="text-[10px] font-bold text-saffron uppercase tracking-widest">{toTibetanNumerals(2026)} {t(UI_LABELS.FIRE_HORSE_YEAR.en, UI_LABELS.FIRE_HORSE_YEAR.tib)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(yearlyHoroscope?.scores || {}).map(([key, value]) => {
                        const scoreMap: Record<string, { label: string, tib: string, color: string, percent: number }> = {
                          'mother': { label: UI_LABELS.EXCELLENT.en, tib: UI_LABELS.EXCELLENT.tib, color: 'bg-green-500', percent: 100 },
                          'son': { label: UI_LABELS.GOOD.en, tib: UI_LABELS.GOOD.tib, color: 'bg-emerald-400', percent: 75 },
                          'same': { label: UI_LABELS.STABLE.en, tib: UI_LABELS.STABLE.tib, color: 'bg-blue-400', percent: 60 },
                          'neutral': { label: UI_LABELS.NEUTRAL.en, tib: UI_LABELS.NEUTRAL.tib, color: 'bg-stone-500', percent: 40 },
                          'enemy': { label: UI_LABELS.CHALLENGING.en, tib: UI_LABELS.CHALLENGING.tib, color: 'bg-red-400', percent: 20 }
                        };
                        const s = scoreMap[value as string] || scoreMap.neutral;
                        const labels: Record<string, { en: string, tib: string }> = {
                          vitality: { en: UI_LABELS.VITALITY_SOK.en, tib: UI_LABELS.VITALITY_SOK.tib },
                          body: { en: UI_LABELS.BODY_LU.en, tib: UI_LABELS.BODY_LU.tib },
                          power: { en: UI_LABELS.POWER_WANG.en, tib: UI_LABELS.POWER_WANG.tib },
                          luck: { en: UI_LABELS.LUCK_LUNGTA.en, tib: UI_LABELS.LUCK_LUNGTA.tib }
                        };

                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between px-0.5">
                              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">{t(labels[key].en, labels[key].tib)}</p>
                              <p className={cn("text-[8px] font-black uppercase", s.color.replace('bg-', 'text-'))}>{t(s.label, s.tib)}</p>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.percent}%` }}
                                className={cn("h-full rounded-full shadow-sm", s.color)} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Power Days */}
                  <div className="grid grid-cols-1 gap-3">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.WEEKLY_POWER_DAYS.en, UI_LABELS.WEEKLY_POWER_DAYS.tib)}</h3>
                    <div className="bg-white rounded-3xl border border-stone-100 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">{t(UI_LABELS.SOUL_DAY.en, UI_LABELS.SOUL_DAY.tib)}</p>
                            <p className="text-xs font-bold text-stone-800">{t(powerDays?.la || '', powerDays?.laTib || '')}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase">{t(UI_LABELS.BEST.en, UI_LABELS.BEST.tib)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Star size={16} />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">{t(UI_LABELS.VITALITY_DAY.en, UI_LABELS.VITALITY_DAY.tib)}</p>
                            <p className="text-xs font-bold text-stone-800">{t(powerDays?.sok || '', powerDays?.sokTib || '')}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase">{t(UI_LABELS.STRONG.en, UI_LABELS.STRONG.tib)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                            <X size={16} />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">{t(UI_LABELS.CONFLICT_DAY.en, UI_LABELS.CONFLICT_DAY.tib)}</p>
                            <p className="text-xs font-bold text-stone-800">{t(powerDays?.enemy || '', powerDays?.enemyTib || '')}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase">{t(UI_LABELS.AVOID.en, UI_LABELS.AVOID.tib)}</span>
                      </div>
                    </div>
                  </div>

                </section>
              )}

              <div className="pt-8 text-center opacity-40">
                <p className="text-[9px] text-stone-400 font-medium italic max-w-[180px] mx-auto leading-relaxed">
                  {t(UI_LABELS.HONOUR_PATH.en, UI_LABELS.HONOUR_PATH.tib)}
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
                    <h2 className="text-xl font-serif font-black text-stone-950">{t(UI_LABELS.UPDATE_PROFILE.en, UI_LABELS.UPDATE_PROFILE.tib)}</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">{t(UI_LABELS.SACRED_ALIGNMENT_UPDATE.en, UI_LABELS.SACRED_ALIGNMENT_UPDATE.tib)}</p>
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
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.DHARMA_NAME.en, UI_LABELS.DHARMA_NAME.tib)}</label>
                      <input
                        type="text"
                        placeholder={t('Enter name', 'མིང་བྲིས།')}
                        value={userData.name || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.GENDER.en, UI_LABELS.GENDER.tib)}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Male', 'Female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setUserData(prev => ({ ...prev, gender: g as any }))}
                            className={cn(
                              "p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2",
                              userData.gender === g
                                ? "bg-stone-900 text-white border-stone-800 shadow-lg scale-[1.02]"
                                : "bg-white text-stone-500 border-stone-100 shadow-sm"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              userData.gender === g ? "bg-saffron" : "bg-stone-200"
                            )} />
                            {g === 'Male' ? t(UI_LABELS.MALE.en, UI_LABELS.MALE.tib) : t(UI_LABELS.FEMALE.en, UI_LABELS.FEMALE.tib)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.BIRTH_SYSTEM.en, UI_LABELS.BIRTH_SYSTEM.tib)}</label>
                        <div className="flex bg-white rounded-full p-1 border border-stone-100 shadow-sm">
                          {['International', 'Tibetan'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setUserData(prev => ({ ...prev, birthDateSystem: s as any }))}
                              className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                (userData.birthDateSystem || 'International') === s ? "bg-stone-900 text-white shadow-md" : "text-stone-400"
                              )}
                            >
                              {s === 'International' ? t(UI_LABELS.INTERNATIONAL.en, UI_LABELS.INTERNATIONAL.tib) : t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase px-1">
                          {t(UI_LABELS.BIRTH_DATE_LABEL.en, UI_LABELS.BIRTH_DATE_LABEL.tib)}
                        </label>
                        {(userData.birthDateSystem || 'International') === 'Tibetan' ? (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5 relative">
                              <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.BIRTH_YEAR_AD.en, UI_LABELS.BIRTH_YEAR_AD.tib)}</label>
                              <input
                                type="number"
                                placeholder="e.g., 1987"
                                value={userData.tibetanBirthYear || ''}
                                onChange={(e) => handleTibetanYearChange(parseInt(e.target.value))}
                                className="w-full bg-white rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.MONTH_LABEL.en, UI_LABELS.MONTH_LABEL.tib)}</label>
                              <select
                                value={userData.tibetanBirthMonth || 1}
                                onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthMonth: parseInt(e.target.value) }))}
                                className="w-full bg-white rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm appearance-none"
                              >
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[7px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.LUNAR_DAY_LABEL.en, UI_LABELS.LUNAR_DAY_LABEL.tib)}</label>
                              <select
                                value={userData.tibetanBirthDay || 1}
                                onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthDay: parseInt(e.target.value) }))}
                                className="w-full bg-white rounded-2xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm appearance-none"
                              >
                                {Array.from({ length: 30 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={userData.birthDate || ''}
                            onChange={(e) => handleBirthDateChange(e.target.value)}
                            className="w-full bg-stone-50 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</label>
                          {userData.birthDate && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">{t(UI_LABELS.SYSTEM_CALCULATED.en, UI_LABELS.SYSTEM_CALCULATED.tib)}</span>}
                        </div>
                        <div className="relative">
                          <select
                            value={userData.birthAnimal || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthAnimal: e.target.value }));
                            }}
                            className="w-full bg-white rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm px-4"
                          >
                            <option value="">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</option>
                            {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {t(a, TIBETAN_ANIMALS[a])}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[9px] font-black text-stone-400 uppercase">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</label>
                          {userData.birthDate && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">{t(UI_LABELS.SYSTEM_CALCULATED.en, UI_LABELS.SYSTEM_CALCULATED.tib)}</span>}
                        </div>
                        <div className="relative">
                          <select
                            value={userData.birthElement || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthElement: e.target.value }));
                            }}
                            className="w-full bg-white rounded-2xl p-4 text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20 border-none shadow-sm px-4"
                          >
                            <option value="">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</option>
                            {ELEMENTS.map(e => <option key={e} value={e}>{t(e, TIBETAN_ELEMENTS[e])}</option>)}
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
                  {t(UI_LABELS.CONFIRM_SYNC.en, UI_LABELS.CONFIRM_SYNC.tib)}
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
                  <h2 className="text-lg font-serif font-black text-stone-950 leading-tight">{t(UI_LABELS.SETTINGS.en, UI_LABELS.SETTINGS.tib)}</h2>
                  <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest leading-none">{t(UI_LABELS.SYSTEM_ALIGNMENT.en, UI_LABELS.SYSTEM_ALIGNMENT.tib)}</p>
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
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.INTERFACE.en, UI_LABELS.INTERFACE.tib)}</h3>
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 shadow-sm">
                        <Sun size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-stone-700">{t(UI_LABELS.LIGHT_MODE.en, UI_LABELS.LIGHT_MODE.tib)}</span>
                    </div>
                    <div className="w-10 h-5 bg-saffron rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                <div id={UI_IDS.SETTINGS.LANGUAGE_SELECTOR} className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-4">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.SELECT_LANGUAGE.en, UI_LABELS.SELECT_LANGUAGE.tib)}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setUserData(prev => ({ ...prev, language: 'English' }))}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                        userData.language !== 'Tibetan' ? "bg-stone-900 text-white border-stone-800 shadow-md" : "bg-stone-50/50 text-stone-600 border-stone-100/30"
                      )}
                    >
                      <span className="text-[11px] font-bold">{t('English', 'དབྱིན་ཡིག')}</span>
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
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.TRADITIONAL_METHOD.en, UI_LABELS.TRADITIONAL_METHOD.tib)}</h3>
                  <div className="flex items-center justify-between p-3 bg-stone-50/50 rounded-2xl border border-stone-100/30">
                    <span className="text-[11px] font-bold text-stone-900">{t(UI_LABELS.PHUGPA_ANCHOR_SYSTEM.en, UI_LABELS.PHUGPA_ANCHOR_SYSTEM.tib)}</span>
                    <Check size={12} className="text-saffron" />
                  </div>
                  <p className="text-[8px] text-stone-400 font-medium italic px-1 leading-relaxed">{t(UI_LABELS.MODERN_CALCULATIONS.en, UI_LABELS.MODERN_CALCULATIONS.tib)}</p>
                </div>

                <div className="p-4 bg-white/60 rounded-[28px] border border-white/40 space-y-3">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.SYNC_ALIGNMENT.en, UI_LABELS.SYNC_ALIGNMENT.tib)}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExportData}
                      className="flex flex-col items-center gap-1.5 p-4 bg-stone-50/50 rounded-2xl border border-stone-100/30 hover:border-saffron/20 group transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-400 group-hover:text-saffron shadow-sm transition-colors">
                        <Compass size={16} />
                      </div>
                      <span className="text-[9px] font-black text-stone-900 uppercase tracking-tight">{t(UI_LABELS.EXPORT_PROFILE.en, UI_LABELS.EXPORT_PROFILE.tib)}</span>
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
                      <span className="text-[9px] font-black text-stone-900 uppercase tracking-tight">{t(UI_LABELS.RESTORE_DATA.en, UI_LABELS.RESTORE_DATA.tib)}</span>
                    </label>
                  </div>
                  <p className="text-[8px] text-stone-400 italic text-center">{t(UI_LABELS.BACKUP_HINT.en, UI_LABELS.BACKUP_HINT.tib)}</p>
                </div>

                <div className="p-4 bg-stone-50/30 rounded-[28px] border border-stone-100/50 space-y-3">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.DANGER_ZONE.en, UI_LABELS.DANGER_ZONE.tib)}</h3>
                  <button
                    onClick={() => setIsPrivacySheetOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-2xl text-stone-600 border border-stone-100/50 hover:bg-stone-50 transition-colors mb-2"
                  >
                    <span className="text-[11px] font-bold">{t(UI_LABELS.PRIVACY_POLICY.en, UI_LABELS.PRIVACY_POLICY.tib)}</span>
                    <Info size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t(UI_LABELS.CLEAR_CACHE_WARNING.en, UI_LABELS.CLEAR_CACHE_WARNING.tib))) {
                        setUserData({ notes: {}, reminders: {} });
                        localStorage.removeItem('men_tsee_khang_user_data');
                        window.location.reload();
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-2xl text-red-500 border border-red-100/50 hover:bg-red-50/50 transition-colors"
                  >
                    <span className="text-[11px] font-bold">{t(UI_LABELS.CLEAR_CACHE.en, UI_LABELS.CLEAR_CACHE.tib)}</span>
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
                    <h2 className="text-xl font-serif font-black text-stone-950">{t(UI_LABELS.PRIVACY_POLICY.en, UI_LABELS.PRIVACY_POLICY.tib)}</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t(UI_LABELS.DIGITAL_SANCTUARY_GUARDS.en, UI_LABELS.DIGITAL_SANCTUARY_GUARDS.tib)}</p>
                  </div>
                </div>
                <button onClick={() => setIsPrivacySheetOpen(false)} className="p-3 bg-stone-100 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 text-stone-600 text-sm leading-relaxed pb-8">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">{t(UI_LABELS.LOCAL_SANCTUARY.en, UI_LABELS.LOCAL_SANCTUARY.tib)}</h4>
                  <p>{t(UI_LABELS.LOCAL_SANCTUARY_DESC.en, UI_LABELS.LOCAL_SANCTUARY_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">{t(UI_LABELS.DATA_SOVEREIGNTY.en, UI_LABELS.DATA_SOVEREIGNTY.tib)}</h4>
                  <p>{t(UI_LABELS.DATA_SOVEREIGNTY_DESC.en, UI_LABELS.DATA_SOVEREIGNTY_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">{t(UI_LABELS.THIRD_PARTY_SERVICES.en, UI_LABELS.THIRD_PARTY_SERVICES.tib)}</h4>
                  <p>{t(UI_LABELS.THIRD_PARTY_SERVICES_DESC.en, UI_LABELS.THIRD_PARTY_SERVICES_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-stone-950 uppercase tracking-widest">{t(UI_LABELS.CONTACT.en, UI_LABELS.CONTACT.tib)}</h4>
                  <p>{t(UI_LABELS.CONTACT_DESC.en, UI_LABELS.CONTACT_DESC.tib)}</p>
                </section>

                <div className="pt-6 border-t border-stone-100">
                  <p className="text-[10px] text-stone-400 italic">{t(UI_LABELS.EFFECTIVE_ALIGNMENT_DATE.en, UI_LABELS.EFFECTIVE_ALIGNMENT_DATE.tib)}</p>
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
                    <h2 className="text-xl font-serif font-black text-stone-950">{t(UI_LABELS.EVENT_SEARCH.en, UI_LABELS.EVENT_SEARCH.tib)}</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{t(UI_LABELS.FIND_ALIGNMENTS.en, UI_LABELS.FIND_ALIGNMENTS.tib)}</p>
                  </div>
                </div>
                <button onClick={() => setIsSearchSheetOpen(false)} className="p-3 bg-stone-100 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.START_DATE.en, UI_LABELS.START_DATE.tib)}</label>
                  <input
                    type="date"
                    value={searchRange.start}
                    onChange={(e) => setSearchRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-4 bg-white/50 rounded-2xl text-xs font-bold border border-transparent focus:border-stone-200 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.END_DATE.en, UI_LABELS.END_DATE.tib)}</label>
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
                    {toTibetanNumerals(searchResults.length)} {t(UI_LABELS.EVENTS_FOUND.en, UI_LABELS.EVENTS_FOUND.tib)}
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-sm font-medium text-stone-400 font-serif italic">{t(UI_LABELS.NO_ALIGNMENTS.en, UI_LABELS.NO_ALIGNMENTS.tib)}</p>
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
                            <span className="text-[10px] font-black uppercase leading-none">{n(format(result.date, 'MMM'))}</span>
                            <span className="text-lg font-black font-serif leading-none mt-0.5">{n(format(result.date, 'd'))}</span>
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
                    <h2 className="text-xl font-serif font-black text-stone-950">{t(UI_LABELS.ADD_CUSTOM_EVENT.en, UI_LABELS.ADD_CUSTOM_EVENT.tib)}</h2>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">Mark a significant moment</p>
                  </div>
                </div>
                <button onClick={() => setIsFestivalSheetOpen(false)} className="p-3 bg-stone-50 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.EVENT_NAME.en, UI_LABELS.EVENT_NAME.tib)}</label>
                  <input
                    type="text"
                    placeholder="e.g., Birthday, Special Prayer"
                    value={newFestival.name}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.DATE.en, UI_LABELS.DATE.tib)}</label>
                  <input
                    type="date"
                    value={newFestival.date}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-stone-50 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.SHORT_DESCRIPTION.en, UI_LABELS.SHORT_DESCRIPTION.tib)}</label>
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
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-saffron flex items-center justify-center text-white">
                    <StickyNote size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-black text-stone-950">{t(UI_LABELS.ADD_DETAILS.en, UI_LABELS.ADD_DETAILS.tib)}</h2>
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
                    <p className="text-sm font-bold text-stone-900">{t(UI_LABELS.PUSH_NOTIFICATION.en, UI_LABELS.PUSH_NOTIFICATION.tib)}</p>
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">Remind me on this date</p>
                  </div>
                </div>
                {currentReminder && <Check size={20} className="text-saffron" />}
              </button>

              {/* Note Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">{t(UI_LABELS.PERSONAL_NOTES.en, UI_LABELS.PERSONAL_NOTES.tib)}</label>
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
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={t(UI_LABELS.HOME.en, UI_LABELS.HOME.tib)} />
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={22} />} label={t(UI_LABELS.PLAN.en, UI_LABELS.PLAN.tib)} />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22} />} label={t(UI_LABELS.PROFILE.en, UI_LABELS.PROFILE.tib)} />
      </nav>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .animate-spin-slow { animation: spin 40s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        textarea:focus { box-shadow: none; }
        @keyframes prayer-wave { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .prayer-flag-wave { animation: prayer-wave 4s ease-in-out infinite; }
        @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-ticker { animation: ticker-scroll 26s linear infinite; }
        .tibetan-diamond-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 1 L27 14 L14 27 L1 14 Z' fill='none' stroke='rgba(217%2C119%2C6%2C0.07)' stroke-width='0.5'/%3E%3Cpath d='M14 8 L20 14 L14 20 L8 14 Z' fill='none' stroke='rgba(217%2C119%2C6%2C0.05)' stroke-width='0.5'/%3E%3C/svg%3E");
          background-size: 28px 28px;
        }
      `}</style>
    </div>
  );
}

// ── Tibetan Design Elements ────────────────────────────────────────────────

/** 8-spoke Dharma Wheel (Dharmachakra) — sacred wheel of Buddhist law */
function DharmaWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
      {/* Inner hub ring */}
      <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="1.5" />
      {/* Center hub */}
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      {/* 8 spokes + rim knobs */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * (Math.PI / 180);
        return (
          <g key={i}>
            <line x1="50" y1="50" x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)}
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="2.5" fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}


/** Prayer Flags Strip — 5 colours representing sky, air, fire, water, earth */
function PrayerFlagsStrip() {
  const flags = [
    '#1B5EAE', // blue  — sky / wind (རླུང་རྟ)
    '#DEDAD4', // white — air / clouds
    '#B83028', // red   — fire
    '#3A7D44', // green — water
    '#D97706', // yellow/saffron — earth
  ];
  return (
    <div className="fixed top-0 inset-x-0 z-[55] flex h-[5px] pointer-events-none overflow-hidden">
      {flags.map((c, i) => (
        <div
          key={i}
          className="flex-1 prayer-flag-wave"
          style={{ backgroundColor: c, animationDelay: `${i * 0.55}s` }}
        />
      ))}
    </div>
  );
}

/** Endless Knot (དཔལ་བེའུ / Palbu) — symbol of interdependence and infinite wisdom */
function EndlessKnot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer diamond */}
      <path d="M40 5 L75 40 L40 75 L5 40 Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Inner diamond */}
      <path d="M40 20 L60 40 L40 60 L20 40 Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cardinal cross strands */}
      <line x1="40" y1="5" x2="40" y2="75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Diagonal cross */}
      <line x1="17" y1="17" x2="63" y2="63" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" />
      <line x1="63" y1="17" x2="17" y2="63" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" />
      {/* Cardinal loop circles */}
      <circle cx="40" cy="5" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="75" cy="40" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="40" cy="75" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="5" cy="40" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      {/* Corner loop circles */}
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="63" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="17" cy="63" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="63" cy="63" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Centre medallion */}
      <circle cx="40" cy="40" r="7" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" />
    </svg>
  );
}

// ── Components ──────────────────────────────────────────────────────────────

function MoonPhase({ day, size = 18, isDark = false }: { day: number, size?: number, isDark?: boolean }) {
  // 15 = Full Moon (White with black outline)
  // 30 = New Moon (Complete black)
  if (day === 15) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10.5" fill="white" stroke={isDark ? "currentColor" : "black"} strokeWidth="2.5" />
      </svg>
    );
  }
  if (day === 30) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill={isDark ? "currentColor" : "black"} />
      </svg>
    );
  }

  // Generic moon for other days
  return <Moon size={size} className={isDark ? "opacity-30" : "text-stone-300"} />;
}

function StatusItem({ icon, label, detail, color }: { icon: React.ReactNode, label: string, detail: string, color?: string }) {
  return (
    <div className="flex items-start gap-4 p-2 bg-white/40 rounded-2xl border border-white/60 group">
      <div className={cn("w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-[11px] font-black text-stone-900 uppercase tracking-wide">{label}</h5>
        <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 font-medium leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

// ── Navigation ───────────────────────────────────────────────────────────────

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


