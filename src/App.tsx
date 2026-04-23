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
  Share,
  Zap
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
import { DharmaWheel, EndlessKnot, PrayerFlagsStrip } from './components/shared/Symbols';
import { NavButton } from './components/ui/NavButton';
import { StatusItem } from './components/shared/StatusItem';
import { MoonPhase } from './components/shared/MoonPhase';
import { TodayCard } from './components/home/TodayCard';
import { AstroTab } from './components/home/AstroTab';
import { SacredTab } from './components/home/SacredTab';
import { WeekView } from './components/calendar/WeekView';
import { MonthView } from './components/calendar/MonthView';
import { YearView } from './components/calendar/YearView';
import { DayDetailCard } from './components/calendar/DayDetailCard';
import { TodayTab } from './components/home/TodayTab';
import { getElementalHarmony, getAnimalAffinity } from './lib/horoscope';

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



const MONTHS_TIB = ['མཆུ་ཟླ།', 'དབོ་ཟླ།', 'ནག་པ་ཟླ་བ།', 'ས་ག་ཟླ་བ།', 'སྣྲོན་ཟླ་བ།', 'ཆུ་སྟོད་ཟླ་བ།', 'གྲོ་བཞིན་ཟླ་བ།', 'ཁྲུམས་སྟོད་ཟླ་བ།', 'ཐ་སྐར་ཟླ་བ།', 'སྨིན་དྲུག་ཟླ་བ།', 'མགོ་ཟླ་བ།', 'རྒྱལ་ཟླ་བ།'];

const HOME_TABS: HomeTab[] = ['guidance', 'astro', 'days'];
const CALENDAR_VIEWS: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];

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
  const [scrollY, setScrollY] = useState(0);
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

  const handleHomeSwipe = (event: any, info: any) => {
    const threshold = 50;
    const currentIndex = HOME_TABS.indexOf(homeTab);
    if (info.offset.x < -threshold && currentIndex < HOME_TABS.length - 1) {
      setHomeTab(HOME_TABS[currentIndex + 1]);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      setHomeTab(HOME_TABS[currentIndex - 1]);
    }
  };

  const handleCalendarSwipe = (event: any, info: any) => {
    const threshold = 50;
    const currentIndex = CALENDAR_VIEWS.indexOf(calendarView);
    if (info.offset.x < -threshold && currentIndex < CALENDAR_VIEWS.length - 1) {
      setCalendarView(CALENDAR_VIEWS[currentIndex + 1]);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      setCalendarView(CALENDAR_VIEWS[currentIndex - 1]);
    }
  };

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
      setScrollY(window.scrollY);
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
  const tibView = useMemo(() => getTibetanDate(currentDate), [currentDate]);
  const tibCurrent = useMemo(() => getTibetanDate(new Date()), []);

  const t = useCallback((en: any, tib: any) => {
    const val = userData.language === 'Tibetan' ? (tib || en) : (en || tib);
    return val || '';
  }, [userData.language]);

  const n = useCallback((val: string | number | undefined) => {
    if (val === undefined || val === null) return '';
    return userData.language === 'Tibetan' ? toTibetanNumerals(val) : val.toString();
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
    setScrollY(currentScrollY);

    // Hide header on scroll down, show on scroll up
    // threshold of 80px to prevent jitter at the very top
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      if (showHeader) setShowHeader(false);
    } else {
      if (!showHeader) setShowHeader(true);
    }

    setShowJumpToday(currentScrollY > 400);
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
                  <h1 className="text-[32px] font-serif font-black text-stone-950">{t(UI_LABELS.WELCOME.en, UI_LABELS.WELCOME.tib)}</h1>
                  <p className="text-[13.5px] text-stone-400 font-bold uppercase tracking-widest mt-1">{t(UI_LABELS.SINO_TIBETAN_GUIDANCE.en, UI_LABELS.SINO_TIBETAN_GUIDANCE.tib)}</p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-6">
                <div className="space-y-4">
                  <h2 className="text-[11.5px] font-black text-stone-400 uppercase tracking-widest text-center px-1">{t(UI_LABELS.SELECT_LANGUAGE.en, UI_LABELS.SELECT_LANGUAGE.tib)}</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setUserData(prev => ({ ...prev, language: 'English' }));
                        setOnboardingStep(2);
                      }}
                      className="w-full p-6 bg-white border border-stone-100 rounded-3xl flex items-center justify-between hover:border-saffron/50 transition-all group shadow-sm"
                    >
                      <span className="font-serif text-[21.5px] font-bold text-stone-900">{t('English', 'དབྱིན་ཡིག')}</span>
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
                        <span className="font-serif text-[21.5px] font-bold text-stone-900 block leading-tight">བོད་ཡིག</span>
                        <span className="text-[9.5px] font-bold text-stone-300 uppercase tracking-tighter">{t('Tibetan', 'བོད་ཡིག')}</span>
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
                  <h2 className="text-[25.5px] font-serif font-black text-stone-950">{t(UI_LABELS.PRACTITIONER_DETAILS.en, UI_LABELS.PRACTITIONER_DETAILS.tib)}</h2>
                  <p className="text-[11.5px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">{t(UI_LABELS.FOUNDATIONAL_HINT.en, UI_LABELS.FOUNDATIONAL_HINT.tib)}</p>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.DHARMA_NAME.en, UI_LABELS.DHARMA_NAME.tib)}</label>
                    <input
                      type="text"
                      placeholder="e.g. Tenzin"
                      value={userData.name || ''}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[13.5px] font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10.5px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.GENDER.en, UI_LABELS.GENDER.tib)}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setUserData(prev => ({ ...prev, gender: g as any }))}
                          className={cn(
                            "p-4 rounded-2xl border text-[13.5px] font-bold transition-all flex items-center justify-center gap-2",
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
                      <label className="text-[10.5px] font-black text-stone-400 uppercase">{t(UI_LABELS.BIRTH_SYSTEM.en, UI_LABELS.BIRTH_SYSTEM.tib)}</label>
                      <div className="flex bg-white rounded-full p-1 border border-stone-100 shadow-sm">
                        {['International', 'Tibetan'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setUserData(prev => ({ ...prev, birthDateSystem: s as any }))}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9.5px] font-black uppercase tracking-widest transition-all",
                              (userData.birthDateSystem || 'International') === s ? "bg-stone-900 text-white shadow-md" : "text-stone-400"
                            )}
                          >
                             {s === 'International' ? t(UI_LABELS.INTERNATIONAL.en, UI_LABELS.INTERNATIONAL.tib) : t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black text-stone-400 uppercase px-1">
                        {(userData.birthDateSystem || 'International') === 'Tibetan' ? t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib) + ' ' + t(UI_LABELS.DAY_LABEL.en, UI_LABELS.DAY_LABEL.tib) : t(UI_LABELS.BIRTH_DATE_GREGORIAN.en, UI_LABELS.BIRTH_DATE_GREGORIAN.tib)}
                      </label>
                      {(userData.birthDateSystem || 'International') === 'Tibetan' ? (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 relative">
                            <label className="text-[8.5px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.BIRTH_YEAR_AD.en, UI_LABELS.BIRTH_YEAR_AD.tib)}</label>
                            <input
                              type="number"
                              placeholder="e.g., 1987"
                              value={userData.tibetanBirthYear || ''}
                              onChange={(e) => handleTibetanYearChange(parseInt(e.target.value))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-saffron/20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.MONTH_LABEL.en, UI_LABELS.MONTH_LABEL.tib)}</label>
                            <select
                              value={userData.tibetanBirthMonth || 1}
                              onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthMonth: parseInt(e.target.value) }))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 appearance-none"
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-black text-stone-400 uppercase px-1">{t(UI_LABELS.LUNAR_DAY_LABEL.en, UI_LABELS.LUNAR_DAY_LABEL.tib)}</label>
                            <select
                              value={userData.tibetanBirthDay || 1}
                              onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthDay: parseInt(e.target.value) }))}
                              className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-saffron/20 appearance-none"
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
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[13.5px] font-bold focus:ring-2 focus:ring-saffron/20 outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10.5px] font-black text-stone-400 uppercase">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</label>
                        {userData.birthDate && <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-tighter pulse">{t(UI_LABELS.AUTOMATIC.en, UI_LABELS.AUTOMATIC.tib)}</span>}
                      </div>
                      <div className="relative">
                        <select
                          value={userData.birthAnimal || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthAnimal: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[13.5px] font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
                        >
                          <option value="">{t(UI_LABELS.SELECT_SIGN.en, UI_LABELS.SELECT_SIGN.tib)}</option>
                          {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {a}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10.5px] font-black text-stone-400 uppercase">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</label>
                        {userData.birthDate && <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-tighter pulse">{t(UI_LABELS.AUTOMATIC.en, UI_LABELS.AUTOMATIC.tib)}</span>}
                      </div>
                      <div className="relative">
                        <select
                          value={userData.birthElement || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, birthElement: e.target.value }))}
                          className="w-full bg-white border border-stone-100 shadow-sm rounded-2xl p-4 text-[13.5px] font-bold appearance-none outline-none focus:ring-2 focus:ring-saffron/20"
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
                  className="w-full bg-stone-950 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-[13.5px] shadow-xl shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                  <h2 className="text-[25.5px] font-serif font-black text-stone-950">{t(UI_LABELS.ASTRO_SCIENCE.en, UI_LABELS.ASTRO_SCIENCE.tib)}</h2>
                  <p className="text-[13.5px] text-stone-500 font-medium leading-relaxed">
                    {t(UI_LABELS.ASTRO_SCIENCE_DESC.en, UI_LABELS.ASTRO_SCIENCE_DESC.tib)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-turquoise/10 flex items-center justify-center text-turquoise">
                      <Compass size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15.5px] font-bold text-stone-900">{t(UI_LABELS.ATMOSPHERIC_ALMANAC.en, UI_LABELS.ATMOSPHERIC_ALMANAC.tib)}</h4>
                      <p className="text-[12.5px] text-stone-500 italic">{t(UI_LABELS.ATMOSPHERIC_ALMANAC_DESC.en, UI_LABELS.ATMOSPHERIC_ALMANAC_DESC.tib)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center text-saffron">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15.5px] font-bold text-stone-900">{t(UI_LABELS.PERSONAL_RESONANCE.en, UI_LABELS.PERSONAL_RESONANCE.tib)}</h4>
                      <p className="text-[12.5px] text-stone-500 italic">{t(UI_LABELS.PERSONAL_RESONANCE_DESC.en, UI_LABELS.PERSONAL_RESONANCE_DESC.tib)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="w-full bg-stone-950 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-[13.5px] shadow-xl shadow-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                  <h2 className="text-[25.5px] font-serif font-black text-stone-950">{t(UI_LABELS.DAILY_DISCIPLINE.en, UI_LABELS.DAILY_DISCIPLINE.tib)}</h2>
                  <p className="text-[13.5px] text-stone-500 font-medium leading-relaxed">
                    {t(UI_LABELS.DAILY_DISCIPLINE_DESC.en, UI_LABELS.DAILY_DISCIPLINE_DESC.tib)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15.5px] font-bold text-stone-900">{t(UI_LABELS.DUCHEN_FESTIVALS.en, UI_LABELS.DUCHEN_FESTIVALS.tib)}</h4>
                      <p className="text-[12.5px] text-stone-500 italic">{t(UI_LABELS.DUCHEN_FESTIVALS_DESC.en, UI_LABELS.DUCHEN_FESTIVALS_DESC.tib)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <StickyNote size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15.5px] font-bold text-stone-900">{t(UI_LABELS.PRACTITIONER_LOGS.en, UI_LABELS.PRACTITIONER_LOGS.tib)}</h4>
                      <p className="text-[12.5px] text-stone-500 italic">{t(UI_LABELS.PRACTITIONER_LOGS_DESC.en, UI_LABELS.PRACTITIONER_LOGS_DESC.tib)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setUserData(prev => ({ ...prev, onboardingComplete: true }))}
                  className="w-full bg-saffron text-white p-5 rounded-3xl font-black uppercase tracking-widest text-[13.5px] shadow-xl shadow-saffron/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: showHeader ? 0 : -100,
            opacity: showHeader ? 1 : 0
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={cn(
            "fixed top-0 inset-x-0 z-[50]",
            scrollY > 20 ? "glass py-3 border-b border-white/5" : "bg-transparent py-6"
          )}
        >
          <div className="max-w-lg mx-auto px-6 flex items-center justify-between">

            {/* Profile Identity */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 group active:scale-95 transition-transform"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl glass border border-white/10 flex items-center justify-center text-[20px] shadow-lg group-hover:border-gold/30 transition-colors">
                  {userData.birthAnimal ? ANIMAL_ICONS[userData.birthAnimal] : '🧘'}
                </div>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gold rounded-full border-2 border-midnight glow" />
              </div>

              {/* Name + Animal / Element */}
              <div className="flex flex-col text-left">
                <span className="text-[15px] font-serif font-black text-white leading-none tracking-tight">
                  {userData.name ? userData.name : t(UI_LABELS.PRACTITIONER.en, UI_LABELS.PRACTITIONER.tib)}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold/60 mt-0.5 leading-none">
                  {userData.birthAnimal && userData.birthElement
                    ? `${t(userData.birthAnimal, TIBETAN_ANIMALS[userData.birthAnimal])} · ${t(userData.birthElement, TIBETAN_ELEMENTS[userData.birthElement])}`
                    : t(UI_LABELS.PHUGPA_TRADITION?.en, UI_LABELS.PHUGPA_TRADITION?.tib)}
                </span>
              </div>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchSheetOpen(true)}
                className="p-2.5 bg-white/5 rounded-2xl text-stone-400 hover:text-gold transition-colors"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => setIsSettingsSheetOpen(true)}
                className="p-2.5 bg-white/5 rounded-2xl text-stone-400 hover:text-gold transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence mode="popLayout">
          {activeTab === 'home' && (
            <motion.div
              key={`home-${userData.language}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-lg mx-auto pb-32 pt-28"
            >
              {/* Modern Native Segmented Control */}
              <div className="px-6 mb-8">
                <div className="relative flex bg-stone-900/50 p-1 rounded-2xl backdrop-blur-md border border-white/5">
                  <motion.div 
                    layoutId="segmented-pill"
                    className="absolute inset-1 bg-white/10 rounded-xl shadow-sm z-0"
                    initial={false}
                    animate={{ 
                      x: homeTab === 'guidance' ? 0 : homeTab === 'astro' ? '100%' : '200%' 
                    }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    style={{ width: 'calc(33.33% - 8px)' }}
                  />
                  {[
                    { id: 'guidance', label: t(UI_LABELS.DAY.en, UI_LABELS.DAY.tib), icon: <Sun size={14} /> },
                    { id: 'astro', label: t(UI_LABELS.ASTRO.en, UI_LABELS.ASTRO.tib), icon: <Compass size={14} /> },
                    { id: 'days', label: t(UI_LABELS.SACRED.en, UI_LABELS.SACRED.tib), icon: <Bell size={14} /> }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setHomeTab(sub.id as HomeTab)}
                      className={cn(
                        "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11.5px] font-black uppercase tracking-widest transition-colors duration-300",
                        homeTab === sub.id ? "text-white" : "text-stone-500"
                      )}
                    >
                      {sub.icon}
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.div 
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleHomeSwipe}
                className="px-6 space-y-8 touch-pan-y"
              >
                {homeTab === 'guidance' && (
                  <TodayTab 
                    tibCurrent={tibCurrent}
                    userData={userData}
                    t={t}
                    n={n}
                    toTibetanNumerals={toTibetanNumerals}
                    setActiveTab={setActiveTab}
                    setSelectedDate={setSelectedDate}
                    UI_LABELS={UI_LABELS}
                    TIBETAN_WEEKDAYS={TIBETAN_WEEKDAYS}
                    TIBETAN_ELEMENTS={TIBETAN_ELEMENTS}
                    TIBETAN_ANIMALS={TIBETAN_ANIMALS}
                    ANIMAL_ICONS={ANIMAL_ICONS}
                    MONTHLY_OBSERVANCES={MONTHLY_OBSERVANCES}
                    yearlyHoroscope={yearlyHoroscope}
                  />
                )}

                {homeTab === 'astro' && (
                  <AstroTab 
                    userData={userData}
                    yearlyHoroscope={yearlyHoroscope}
                    powerDays={powerDays}
                    t={t}
                    toTibetanNumerals={toTibetanNumerals}
                    setActiveTab={setActiveTab}
                    UI_LABELS={UI_LABELS}
                  />
                )}

                {homeTab === 'days' && (
                  <SacredTab 
                    userData={userData}
                    setUserData={setUserData}
                    sortedFestivals={sortedFestivals}
                    festivalSearch={festivalSearch}
                    setFestivalSearch={setFestivalSearch}
                    setIsFestivalSheetOpen={setIsFestivalSheetOpen}
                    t={t}
                    UI_LABELS={UI_LABELS}
                    setSelectedDate={setSelectedDate}
                    setIsNoteSheetOpen={setIsNoteSheetOpen}
                    setActiveTab={setActiveTab}
                  />
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key={`calendar-${userData.language}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-lg mx-auto pb-32 pt-28"
            >
              {/* Modern Calendar Header */}
              <header className="px-6 flex flex-col gap-6 mb-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-[10px] font-black text-gold uppercase tracking-widest leading-none">
                      {t('Tib. Year', 'བོད་ལོ།')} {n(tibSelected?.year)} • {tibSelected?.yearName}
                    </h2>
                    <h2 className="text-[32px] font-serif font-black tracking-tight text-white">
                      {calendarView === 'month' 
                        ? n(format(currentDate, 'MMMM yyyy')) 
                        : calendarView === 'week' 
                          ? t(UI_LABELS.WEEK_VIEW?.en || 'Week View', UI_LABELS.WEEK_VIEW?.tib || 'བདུན་ཕྲག་གི་བགྲོད་པ།')
                          : t(UI_LABELS.ANNUAL_CYCLE?.en || 'Annual Cycle', UI_LABELS.ANNUAL_CYCLE?.tib || 'ལོ་འཁོར་མོ་འཁོར།')}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform"><ChevronLeft size={20} /></button>
                    <button onClick={handleNextMonth} className="p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform"><ChevronRight size={20} /></button>
                  </div>
                </div>

                <div className="relative flex bg-stone-900/50 p-1 rounded-2xl backdrop-blur-md border border-white/5">
                  <motion.div 
                    layoutId="calendar-pill"
                    className="absolute inset-1 bg-white/10 rounded-xl shadow-sm z-0"
                    initial={false}
                    animate={{ 
                      x: calendarView === 'week' ? 0 : calendarView === 'month' ? '100%' : '200%' 
                    }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    style={{ width: 'calc(33.33% - 8px)' }}
                  />
                  {[
                    { id: 'week', label: t('Week', 'བདུན་ཕྲག') },
                    { id: 'month', label: t('Month', 'ཟླ་བ།') },
                    { id: 'year', label: t('Year', 'ལོ་འཁོར།') }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setCalendarView(v.id as 'week' | 'month' | 'year')}
                      className={cn(
                        "relative z-10 flex-1 py-3 rounded-xl text-[11.5px] font-black uppercase tracking-widest transition-colors duration-300",
                        calendarView === v.id ? "text-white" : "text-stone-500"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </header>

              <motion.div 
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleCalendarSwipe}
                className="flex-1 flex flex-col space-y-6 touch-pan-y"
              >
                {calendarView === 'week' && (
                  <div className="px-6 space-y-6">
                    <WeekView 
                      weekDays={weekDays}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      getTibetanDate={getTibetanDate}
                      getElementalHarmony={getElementalHarmony}
                      getAnimalAffinity={getAnimalAffinity}
                      userData={userData}
                      t={t}
                      n={n}
                    />

                    {/* Jump to Today FAB */}
                    <AnimatePresence>
                      {showJumpToday && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 20 }}
                          onClick={scrollToToday}
                          className="fixed bottom-32 right-6 p-4 bg-gold text-midnight rounded-2xl shadow-2xl z-50 flex items-center gap-3 active:scale-95 transition-transform"
                        >
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span className="text-[11.5px] font-black uppercase tracking-widest">{t('Today', 'དེ་རིང་།')}</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {calendarView === 'month' && (
                  <div className="px-6 space-y-6 pb-24">
                    <MonthView 
                      currentDate={currentDate}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      monthDays={monthDays}
                      direction={direction}
                      handlePrevMonth={handlePrevMonth}
                      handleNextMonth={handleNextMonth}
                      getTibetanDate={getTibetanDate}
                      isDateToday={isDateToday}
                      t={t}
                      n={n}
                      userData={userData}
                    />

                    <DayDetailCard 
                      selectedDate={selectedDate}
                      tibSelected={tibSelected}
                      userData={userData}
                      setIsNoteSheetOpen={setIsNoteSheetOpen}
                      getElementalHarmony={getElementalHarmony}
                      t={t}
                      n={n}
                    />
                  </div>
                )}

                {calendarView === 'year' && (
                  <div className="px-6 space-y-6 pb-24">
                    <YearView 
                      tibCurrent={tibView}
                      t={t}
                      n={n}
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key={`profile-${userData.language}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-6 py-10 max-w-lg mx-auto pb-32 space-y-8 pt-28"
            >
              {/* Celestial Profile Header */}
              <header className="flex flex-col items-center justify-center gap-6 mb-10 pt-4 relative">
                <EndlessKnot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-white/5 pointer-events-none" />
                
                <button
                  onClick={() => setIsProfileSheetOpen(true)}
                  className="relative group active:scale-95 transition-transform z-10"
                >
                  <div className="w-28 h-28 rounded-[40px] glass flex items-center justify-center text-[48px] shadow-2xl border border-white/10 glow group-hover:border-gold/30 transition-colors">
                    {userData.birthAnimal ? ANIMAL_ICONS[userData.birthAnimal] : '🧘'}
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-gold rounded-2xl flex items-center justify-center text-midnight border-4 border-midnight shadow-xl glow">
                    <Pencil size={16} strokeWidth={3} />
                  </div>
                </button>

                <div className="text-center space-y-2 relative z-10">
                  <h1 className="text-[32px] font-serif font-black text-white tracking-tight">
                    {userData.name ? userData.name : t(UI_LABELS.PRACTITIONER.en, UI_LABELS.PRACTITIONER.tib)}
                  </h1>
                  <div className="flex items-center justify-center gap-3">
                    {userData.birthAnimal && (
                      <span className="px-4 py-1.5 rounded-full bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest border border-gold/20 glow">
                        {t(userData.birthAnimal, TIBETAN_ANIMALS[userData.birthAnimal])}
                      </span>
                    )}
                    {userData.birthElement && (
                      <span className="px-4 py-1.5 rounded-full bg-white/5 text-stone-400 text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {t(userData.birthElement, TIBETAN_ELEMENTS[userData.birthElement])}
                      </span>
                    )}
                  </div>
                </div>
              </header>

              {/* Profile Info - Celestial Grid */}
              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-stone-700" />
                      <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none">{t(UI_LABELS.GENDER_ORIENTATION.en, UI_LABELS.GENDER_ORIENTATION.tib)}</p>
                    </div>
                    <p className="text-[16px] font-serif font-black text-white">
                      {userData.gender ? t(userData.gender === 'Male' ? UI_LABELS.MALE.en : UI_LABELS.FEMALE.en, userData.gender === 'Male' ? UI_LABELS.MALE.tib : UI_LABELS.FEMALE.tib) : t(UI_LABELS.NOT_SPECIFIED.en, UI_LABELS.NOT_SPECIFIED.tib)}
                    </p>
                  </div>

                  <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className="text-stone-700" />
                      <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</p>
                    </div>
                    <p className="text-[16px] font-serif font-black text-turquoise">
                      {userData.birthElement ? t(userData.birthElement, TIBETAN_ELEMENTS[userData.birthElement]) : t(UI_LABELS.UNCALCULATED.en, UI_LABELS.UNCALCULATED.tib)}
                    </p>
                  </div>
                </div>

                <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={16} className="text-stone-700" />
                    <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none">{t(UI_LABELS.BIRTH_DATE_LABEL.en, UI_LABELS.BIRTH_DATE_LABEL.tib)}</p>
                  </div>
                  <p className="text-[18px] font-serif font-black text-white">
                    {userData.birthDateSystem === 'Tibetan'
                      ? (userData.tibetanBirthYear
                        ? `${n(userData.tibetanBirthYear)}-${n(userData.tibetanBirthMonth || 1)}-${n(userData.tibetanBirthDay || 1)}`
                        : t(UI_LABELS.ESTABLISH_ALIGNMENT.en, UI_LABELS.ESTABLISH_ALIGNMENT.tib))
                      : (userData.birthDate
                        ? format(parseISO(userData.birthDate), 'MMMM do, yyyy')
                        : t(UI_LABELS.ESTABLISH_ALIGNMENT.en, UI_LABELS.ESTABLISH_ALIGNMENT.tib))}
                  </p>
                  {convertedGregorian && (
                    <div className="bg-gold/5 p-3 rounded-2xl border border-gold/10">
                      <p className="text-[11px] text-gold font-bold">
                        {t(`${UI_LABELS.INTERNATIONAL_FORMAT_HINT.en} ${format(convertedGregorian, 'MMMM do, yyyy')}`,
                          `${UI_LABELS.INTERNATIONAL_FORMAT_HINT.tib} ${n(format(convertedGregorian, 'yyyy-MM-dd'))} རེད།`)}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Yearly Horoscope & Power Days */}
              {userData.birthAnimal && userData.birthElement && (
                <section className="space-y-6">
                  {/* Dhun-Zur Alert */}
                  {yearlyHoroscope?.isDhunZur && (
                    <div className="p-5 rounded-3xl bg-red-900/10 border border-red-900/20 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-red-900/20 flex items-center justify-center text-red-500 shrink-0">
                        <Info size={20} />
                      </div>
                      <div>
                        <h4 className="text-[15.5px] font-bold text-red-200">{t(UI_LABELS.DHUN_ZUR_CONFLICT.en, UI_LABELS.DHUN_ZUR_CONFLICT.tib)}</h4>
                        <p className="text-[11.5px] text-red-400 leading-relaxed mt-1">
                          {t(UI_LABELS.DHUN_ZUR_DESC.en, UI_LABELS.DHUN_ZUR_DESC.tib)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* The Four Vitalities (Scores) */}
                  <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 text-stone-200 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13.5px] font-black uppercase tracking-widest text-stone-500">{t(UI_LABELS.YEARLY_ENERGY_SCORES.en, UI_LABELS.YEARLY_ENERGY_SCORES.tib)}</h3>
                      <span className="text-[11.5px] font-bold text-gold uppercase tracking-widest">{toTibetanNumerals(2026)} {t(UI_LABELS.FIRE_HORSE_YEAR.en, UI_LABELS.FIRE_HORSE_YEAR.tib)}</span>
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
                              <p className="text-[10.5px] font-bold text-stone-500 uppercase tracking-tight">{t(labels[key].en, labels[key].tib)}</p>
                              <p className={cn("text-[9.5px] font-black uppercase", s.color.replace('bg-', 'text-'))}>{t(s.label, s.tib)}</p>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.percent}%` }}
                                className={cn("h-full glow shadow-sm", s.color)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Power Days */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.WEEKLY_POWER_DAYS.en, UI_LABELS.WEEKLY_POWER_DAYS.tib)}</h3>
                    <div className="glass rounded-[32px] border border-white/5 overflow-hidden shadow-xl">
                      <div className="divide-y divide-white/5">
                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center glow shadow-emerald-500/20">
                              <Sparkles size={18} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none mb-1.5">{t(UI_LABELS.SOUL_DAY.en, UI_LABELS.SOUL_DAY.tib)}</p>
                              <p className="text-[17px] font-serif font-black text-white">{t(powerDays?.la || '', powerDays?.laTib || '')}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase border border-emerald-400/20">{t(UI_LABELS.BEST.en, UI_LABELS.BEST.tib)}</span>
                        </div>

                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center glow shadow-blue-500/20">
                              <Star size={18} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none mb-1.5">{t(UI_LABELS.VITALITY_DAY.en, UI_LABELS.VITALITY_DAY.tib)}</p>
                              <p className="text-[17px] font-serif font-black text-white">{t(powerDays?.sok || '', powerDays?.sokTib || '')}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase border border-blue-400/20">{t(UI_LABELS.STRONG.en, UI_LABELS.STRONG.tib)}</span>
                        </div>

                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-red-400/10 text-red-400 flex items-center justify-center glow shadow-red-500/20">
                              <X size={18} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest leading-none mb-1.5">{t(UI_LABELS.CONFLICT_DAY.en, UI_LABELS.CONFLICT_DAY.tib)}</p>
                              <p className="text-[17px] font-serif font-black text-white">{t(powerDays?.enemy || '', powerDays?.enemyTib || '')}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-full uppercase border border-red-400/20">{t(UI_LABELS.AVOID.en, UI_LABELS.AVOID.tib)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="pt-8 text-center opacity-40">
                <p className="text-[10.5px] text-stone-500 font-medium italic max-w-[180px] mx-auto leading-relaxed">
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
              className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 glass rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe overflow-y-auto max-h-[90vh] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-midnight glow">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-serif font-black text-white">{t(UI_LABELS.UPDATE_PROFILE.en, UI_LABELS.UPDATE_PROFILE.tib)}</h2>
                    <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">{t(UI_LABELS.SACRED_ALIGNMENT_UPDATE.en, UI_LABELS.SACRED_ALIGNMENT_UPDATE.tib)}</p>
                  </div>
                </div>
                <button onClick={() => setIsProfileSheetOpen(false)} className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <section className="space-y-4">
                  <div className="bg-white/5 rounded-[32px] p-6 space-y-6 border border-white/5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-1">{t(UI_LABELS.DHARMA_NAME.en, UI_LABELS.DHARMA_NAME.tib)}</label>
                      <input
                        type="text"
                        placeholder={t('Enter name', 'མིང་བྲིས།')}
                        value={userData.name || ''}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 rounded-2xl p-4 text-[15px] font-medium outline-none focus:ring-2 focus:ring-gold/20 border border-white/10 text-white shadow-inner"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest px-1">{t(UI_LABELS.GENDER.en, UI_LABELS.GENDER.tib)}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Male', 'Female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setUserData(prev => ({ ...prev, gender: g as any }))}
                            className={cn(
                              "p-4 rounded-2xl border text-[13.5px] font-bold transition-all flex items-center justify-center gap-2",
                              userData.gender === g
                                ? "bg-white text-midnight border-white shadow-lg scale-[1.02]"
                                : "bg-white/5 text-stone-500 border-white/10 shadow-sm"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              userData.gender === g ? "bg-gold" : "bg-stone-500"
                            )} />
                            {g === 'Male' ? t(UI_LABELS.MALE.en, UI_LABELS.MALE.tib) : t(UI_LABELS.FEMALE.en, UI_LABELS.FEMALE.tib)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10.5px] font-black text-stone-500 uppercase">{t(UI_LABELS.BIRTH_SYSTEM.en, UI_LABELS.BIRTH_SYSTEM.tib)}</label>
                        <div className="flex bg-midnight rounded-full p-1 border border-white/10 shadow-sm">
                          {['International', 'Tibetan'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setUserData(prev => ({ ...prev, birthDateSystem: s as any }))}
                              className={cn(
                                "px-3 py-1 rounded-full text-[9.5px] font-black uppercase tracking-widest transition-all",
                                (userData.birthDateSystem || 'International') === s ? "bg-white text-midnight shadow-md" : "text-stone-500"
                              )}
                            >
                              {s === 'International' ? t(UI_LABELS.INTERNATIONAL.en, UI_LABELS.INTERNATIONAL.tib) : t(UI_LABELS.TIBETAN_CALENDAR.en, UI_LABELS.TIBETAN_CALENDAR.tib)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10.5px] font-black text-stone-500 uppercase px-1">
                          {t(UI_LABELS.BIRTH_DATE_LABEL.en, UI_LABELS.BIRTH_DATE_LABEL.tib)}
                        </label>
                        {(userData.birthDateSystem || 'International') === 'Tibetan' ? (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5 relative">
                              <label className="text-[8.5px] font-black text-stone-500 uppercase px-1">{t(UI_LABELS.BIRTH_YEAR_AD.en, UI_LABELS.BIRTH_YEAR_AD.tib)}</label>
                              <input
                                type="number"
                                placeholder="e.g., 1987"
                                value={userData.tibetanBirthYear || ''}
                                onChange={(e) => handleTibetanYearChange(parseInt(e.target.value))}
                                className="w-full bg-midnight rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8.5px] font-black text-stone-500 uppercase px-1">{t(UI_LABELS.MONTH_LABEL.en, UI_LABELS.MONTH_LABEL.tib)}</label>
                              <select
                                value={userData.tibetanBirthMonth || 1}
                                onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthMonth: parseInt(e.target.value) }))}
                                className="w-full bg-midnight rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm appearance-none"
                              >
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>{toTibetanNumerals(i + 1)}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8.5px] font-black text-stone-500 uppercase px-1">{t(UI_LABELS.LUNAR_DAY_LABEL.en, UI_LABELS.LUNAR_DAY_LABEL.tib)}</label>
                              <select
                                value={userData.tibetanBirthDay || 1}
                                onChange={(e) => setUserData(prev => ({ ...prev, tibetanBirthDay: parseInt(e.target.value) }))}
                                className="w-full bg-midnight rounded-2xl p-4 text-[12.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm appearance-none"
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
                            className="w-full bg-midnight rounded-2xl p-4 text-[13.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10.5px] font-black text-stone-500 uppercase">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</label>
                          {userData.birthDate && <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-tighter">{t(UI_LABELS.SYSTEM_CALCULATED.en, UI_LABELS.SYSTEM_CALCULATED.tib)}</span>}
                        </div>
                        <div className="relative">
                          <select
                            value={userData.birthAnimal || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthAnimal: e.target.value }));
                            }}
                            className="w-full bg-midnight rounded-2xl p-4 text-[13.5px] font-bold appearance-none outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm px-4"
                          >
                            <option value="">{t(UI_LABELS.ANIMAL_SIGN.en, UI_LABELS.ANIMAL_SIGN.tib)}</option>
                            {ANIMALS.map(a => <option key={a} value={a}>{ANIMAL_ICONS[a]} {t(a, TIBETAN_ANIMALS[a])}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10.5px] font-black text-stone-500 uppercase">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</label>
                          {userData.birthDate && <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-tighter">{t(UI_LABELS.SYSTEM_CALCULATED.en, UI_LABELS.SYSTEM_CALCULATED.tib)}</span>}
                        </div>
                        <div className="relative">
                          <select
                            value={userData.birthElement || ''}
                            onChange={(e) => {
                              setUserData(prev => ({ ...prev, birthElement: e.target.value }));
                            }}
                            className="w-full bg-midnight rounded-2xl p-4 text-[13.5px] font-bold appearance-none outline-none focus:ring-2 focus:ring-gold/20 border-white/10 text-white shadow-sm px-4"
                          >
                            <option value="">{t(UI_LABELS.PRIMARY_ELEMENT.en, UI_LABELS.PRIMARY_ELEMENT.tib)}</option>
                            {ELEMENTS.map(e => <option key={e} value={e}>{t(e, TIBETAN_ELEMENTS[e])}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                </section>

                <button
                  onClick={() => setIsProfileSheetOpen(false)}
                  className="w-full bg-gold text-midnight p-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-[13.5px] active:scale-[0.98] transition-all"
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
            className="fixed inset-0 glass z-[101] flex flex-col pt-safe px-6 pb-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-between py-8 px-1 flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-midnight glow">
                  <Settings size={22} />
                </div>
                <div>
                  <h2 className="text-[24px] font-serif font-black text-white leading-tight">{t(UI_LABELS.SETTINGS.en, UI_LABELS.SETTINGS.tib)}</h2>
                  <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">{t(UI_LABELS.SYSTEM_ALIGNMENT.en, UI_LABELS.SYSTEM_ALIGNMENT.tib)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsSheetOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-stone-500 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-12">
              <div className="space-y-6">

                <div id={UI_IDS.SETTINGS.LANGUAGE_SELECTOR} className="p-6 glass rounded-[32px] border border-white/5 space-y-4 shadow-xl">
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.SELECT_LANGUAGE.en, UI_LABELS.SELECT_LANGUAGE.tib)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUserData(prev => ({ ...prev, language: 'English' }))}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        userData.language !== 'Tibetan' ? "bg-gold text-midnight border-gold glow" : "bg-white/5 text-stone-400 border-white/5"
                      )}
                    >
                      <span className="text-[14px] font-bold">{t('English', 'དབྱིན་ཡིག')}</span>
                      {userData.language !== 'Tibetan' && <Check size={14} className="text-midnight" />}
                    </button>
                    <button
                      onClick={() => setUserData(prev => ({ ...prev, language: 'Tibetan' }))}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        userData.language === 'Tibetan' ? "bg-gold text-midnight border-gold glow" : "bg-white/5 text-stone-400 border-white/5"
                      )}
                    >
                      <span className="text-[14px] font-bold">བོད་ཡིག</span>
                      {userData.language === 'Tibetan' && <Check size={14} className="text-midnight" />}
                    </button>
                  </div>
                </div>

                <div className="p-6 glass rounded-[32px] border border-white/5 space-y-4 shadow-xl">
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.TRADITIONAL_METHOD.en, UI_LABELS.TRADITIONAL_METHOD.tib)}</h3>
                  <div className="flex items-center justify-between p-4 bg-gold/10 rounded-2xl border border-gold/20 glow">
                    <span className="text-[14px] font-bold text-white">{t(UI_LABELS.PHUGPA_ANCHOR_SYSTEM.en, UI_LABELS.PHUGPA_ANCHOR_SYSTEM.tib)}</span>
                    <Check size={14} className="text-gold" />
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium italic px-1 leading-relaxed">{t(UI_LABELS.MODERN_CALCULATIONS.en, UI_LABELS.MODERN_CALCULATIONS.tib)}</p>
                </div>

                <div className="p-6 glass rounded-[32px] border border-white/5 space-y-4 shadow-xl">
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.SYNC_ALIGNMENT.en, UI_LABELS.SYNC_ALIGNMENT.tib)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleExportData}
                      className="flex flex-col items-center gap-2 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-gold/30 hover:bg-white/10 group transition-all glow"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-stone-400 group-hover:text-gold transition-colors">
                        <Compass size={18} />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{t(UI_LABELS.EXPORT_PROFILE.en, UI_LABELS.EXPORT_PROFILE.tib)}</span>
                    </button>
                    <label className="flex flex-col items-center gap-2 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-gold/30 hover:bg-white/10 group transition-all cursor-pointer glow">
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImportData(file);
                        }}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-stone-400 group-hover:text-gold transition-colors">
                        <Loader2 size={18} />
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">{t(UI_LABELS.RESTORE_DATA.en, UI_LABELS.RESTORE_DATA.tib)}</span>
                    </label>
                  </div>
                  <p className="text-[10px] text-stone-500 italic text-center opacity-60">{t(UI_LABELS.BACKUP_HINT.en, UI_LABELS.BACKUP_HINT.tib)}</p>
                </div>

                <div className="p-6 glass rounded-[32px] border border-white/5 space-y-4 shadow-xl">
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.DANGER_ZONE.en, UI_LABELS.DANGER_ZONE.tib)}</h3>
                  <button
                    onClick={() => setIsPrivacySheetOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-red-400/5 rounded-2xl text-red-400 border border-red-400/10 hover:bg-red-400/10 transition-colors"
                  >
                    <span className="text-[12.5px] font-bold">{t(UI_LABELS.PRIVACY_POLICY.en, UI_LABELS.PRIVACY_POLICY.tib)}</span>
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
                    className="w-full flex items-center justify-between p-3 bg-white/5 rounded-2xl text-red-500 border border-red-900/20 hover:bg-red-900/20 transition-colors"
                  >
                    <span className="text-[12.5px] font-bold">{t(UI_LABELS.CLEAR_CACHE.en, UI_LABELS.CLEAR_CACHE.tib)}</span>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="py-2 text-center">
                  <p className="text-[10.5px] text-stone-500 font-black uppercase tracking-widest opacity-30">Phugpa Edition v1.2.0</p>
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
              className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-midnight rounded-t-[40px] z-[201] p-8 space-y-8 max-w-lg mx-auto pb-safe flex flex-col h-[70vh]"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto flex-shrink-0" />

              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-midnight">
                    <Info size={24} />
                  </div>
                  <div>
                    <h2 className="text-[21.5px] font-serif font-black text-white">{t(UI_LABELS.PRIVACY_POLICY.en, UI_LABELS.PRIVACY_POLICY.tib)}</h2>
                    <p className="text-[11.5px] text-stone-500 font-bold uppercase tracking-widest">{t(UI_LABELS.DIGITAL_SANCTUARY_GUARDS.en, UI_LABELS.DIGITAL_SANCTUARY_GUARDS.tib)}</p>
                  </div>
                </div>
                <button onClick={() => setIsPrivacySheetOpen(false)} className="p-3 bg-white/5 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 text-stone-400 text-[15.5px] leading-relaxed pb-8">
                <section className="space-y-3">
                  <h4 className="text-[11.5px] font-black text-white uppercase tracking-widest">{t(UI_LABELS.LOCAL_SANCTUARY.en, UI_LABELS.LOCAL_SANCTUARY.tib)}</h4>
                  <p>{t(UI_LABELS.LOCAL_SANCTUARY_DESC.en, UI_LABELS.LOCAL_SANCTUARY_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[11.5px] font-black text-white uppercase tracking-widest">{t(UI_LABELS.DATA_SOVEREIGNTY.en, UI_LABELS.DATA_SOVEREIGNTY.tib)}</h4>
                  <p>{t(UI_LABELS.DATA_SOVEREIGNTY_DESC.en, UI_LABELS.DATA_SOVEREIGNTY_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[11.5px] font-black text-white uppercase tracking-widest">{t(UI_LABELS.THIRD_PARTY_SERVICES.en, UI_LABELS.THIRD_PARTY_SERVICES.tib)}</h4>
                  <p>{t(UI_LABELS.THIRD_PARTY_SERVICES_DESC.en, UI_LABELS.THIRD_PARTY_SERVICES_DESC.tib)}</p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-[11.5px] font-black text-white uppercase tracking-widest">{t(UI_LABELS.CONTACT.en, UI_LABELS.CONTACT.tib)}</h4>
                  <p>{t(UI_LABELS.CONTACT_DESC.en, UI_LABELS.CONTACT_DESC.tib)}</p>
                </section>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-[11.5px] text-stone-600 italic">{t(UI_LABELS.EFFECTIVE_ALIGNMENT_DATE.en, UI_LABELS.EFFECTIVE_ALIGNMENT_DATE.tib)}</p>
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
              className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 glass rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe flex flex-col h-[85vh] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto flex-shrink-0" />

              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-midnight glow">
                    <Search size={24} />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-serif font-black text-white">{t(UI_LABELS.EVENT_SEARCH.en, UI_LABELS.EVENT_SEARCH.tib)}</h2>
                    <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">{t(UI_LABELS.FIND_ALIGNMENTS.en, UI_LABELS.FIND_ALIGNMENTS.tib)}</p>
                  </div>
                </div>
                <button onClick={() => setIsSearchSheetOpen(false)} className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.START_DATE.en, UI_LABELS.START_DATE.tib)}</label>
                  <input
                    type="date"
                    value={searchRange.start}
                    onChange={(e) => setSearchRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-4 bg-white/5 rounded-2xl text-[14px] font-medium border border-white/5 focus:ring-2 focus:ring-gold/20 outline-none transition-all text-white shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.END_DATE.en, UI_LABELS.END_DATE.tib)}</label>
                  <input
                    type="date"
                    value={searchRange.end}
                    onChange={(e) => setSearchRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full p-4 bg-white/5 rounded-2xl text-[14px] font-medium border border-white/5 focus:ring-2 focus:ring-gold/20 outline-none transition-all text-white shadow-inner"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
                    {toTibetanNumerals(searchResults.length)} {t(UI_LABELS.EVENTS_FOUND.en, UI_LABELS.EVENTS_FOUND.tib)}
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto text-stone-800 border border-white/5">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-[17px] font-medium text-stone-500 font-serif italic">{t(UI_LABELS.NO_ALIGNMENTS.en, UI_LABELS.NO_ALIGNMENT.tib)}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((result, i) => (
                      <motion.button
                        key={i}
                        className="bg-white/5 p-5 rounded-[24px] group hover:bg-white/10 transition-all duration-300"
                        onClick={() => {
                          setSelectedDate(result.date);
                          setCurrentDate(result.date);
                          setIsSearchSheetOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0",
                            result.isCustom ? "bg-gold/10 text-gold" : "bg-white text-midnight"
                          )}>
                            <span className="text-[11.5px] font-black uppercase leading-none">{n(format(result.date, 'MMM'))}</span>
                            <span className="text-[19.5px] font-black font-serif leading-none mt-0.5">{n(format(result.date, 'd'))}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-[15.5px] font-black text-white truncate pr-2">{result.name}</h3>
                              {result.isCustom && <Star size={12} className="text-gold fill-gold mt-1" />}
                            </div>
                            <p className="text-[13.5px] text-stone-400 line-clamp-1 mt-1 font-medium">{result.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9.5px] font-bold text-stone-700 uppercase tracking-[0.2em]">
                                Tshe {getTibetanDate(result.date).day} · {getTibetanDate(result.date).animal}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
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
              className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 glass rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-midnight glow">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-serif font-black text-white">{t(UI_LABELS.ADD_CUSTOM_EVENT.en, UI_LABELS.ADD_CUSTOM_EVENT.tib)}</h2>
                    <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em]">{t(UI_LABELS.MARK_SIGNIFICANT_MOMENT?.en || 'Mark a significant moment', UI_LABELS.MARK_SIGNIFICANT_MOMENT?.tib || 'དུས་དྲན་གལ་ཆེན་རྟགས་རྒྱག་པ།')}</p>
                  </div>
                </div>
                <button onClick={() => setIsFestivalSheetOpen(false)} className="p-3 bg-white/5 rounded-full text-stone-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] px-1">{t(UI_LABELS.EVENT_NAME.en, UI_LABELS.EVENT_NAME.tib)}</label>
                  <input
                    type="text"
                    placeholder="e.g., Birthday, Special Prayer"
                    value={newFestival.name}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 rounded-2xl p-4 text-[15px] font-medium border border-white/5 focus:ring-2 focus:ring-gold/20 outline-none transition-all text-white shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-stone-500 uppercase px-1">{t(UI_LABELS.DATE.en, UI_LABELS.DATE.tib)}</label>
                  <input
                    type="date"
                    value={newFestival.date}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white/5 rounded-2xl p-4 text-[15.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-stone-500 uppercase px-1">{t(UI_LABELS.SHORT_DESCRIPTION.en, UI_LABELS.SHORT_DESCRIPTION.tib)}</label>
                  <textarea
                    placeholder="Adding context to this day..."
                    value={newFestival.description}
                    onChange={(e) => setNewFestival(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/5 rounded-2xl p-4 text-[15.5px] font-bold outline-none focus:ring-2 focus:ring-gold/20 resize-none text-white"
                  />
                </div>

                <button
                  onClick={addCustomFestival}
                  disabled={!newFestival.name || !newFestival.date}
                  className="w-full bg-white text-midnight p-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[13.5px] disabled:opacity-50 active:scale-[0.98] transition-all"
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
              className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              exit={{ y: '105%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-midnight rounded-t-[40px] z-[101] p-8 space-y-8 max-w-lg mx-auto pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-midnight">
                    <StickyNote size={24} />
                  </div>
                  <div>
                    <h2 className="text-[21.5px] font-serif font-black text-white">{t(UI_LABELS.ADD_DETAILS.en, UI_LABELS.ADD_DETAILS.tib)}</h2>
                    <p className="text-[11.5px] text-stone-500 font-bold uppercase tracking-widest">{format(selectedDate, 'MMMM do')}</p>
                  </div>
                </div>
                <button onClick={() => setIsNoteSheetOpen(false)} className="p-3 bg-white/5 rounded-full text-stone-400">
                  <X size={20} />
                </button>
              </div>

              {/* Reminder Toggle */}
              <button
                onClick={toggleReminder}
                className={cn(
                  "w-full p-6 rounded-3xl border flex items-center justify-between transition-all duration-300",
                  currentReminder ? "bg-gold/10 border-gold shadow-sm" : "bg-white/5 border-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", currentReminder ? "bg-gold text-midnight" : "bg-white/10 text-stone-500")}>
                    <Bell size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15.5px] font-bold text-white">{t(UI_LABELS.PUSH_NOTIFICATION.en, UI_LABELS.PUSH_NOTIFICATION.tib)}</p>
                    <p className="text-[11.5px] font-medium text-stone-500 uppercase tracking-widest">Remind me on this date</p>
                  </div>
                </div>
                {currentReminder && <Check size={20} className="text-gold" />}
              </button>

              {/* Note Input */}
              <div className="space-y-2">
                <label className="text-[11.5px] font-black text-stone-500 uppercase tracking-widest px-1">{t(UI_LABELS.PERSONAL_NOTES.en, UI_LABELS.PERSONAL_NOTES.tib)}</label>
                <textarea
                  value={currentNote}
                  onChange={(e) => handleSaveNote(e.target.value)}
                  placeholder="Enter your notes here..."
                  className="w-full h-40 bg-white/5 rounded-3xl p-6 text-[15.5px] font-medium focus:ring-2 focus:ring-gold/20 border-none outline-none resize-none placeholder:text-stone-700 text-white"
                />
              </div>

              {/* Custom Sticker & Label Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-0.5">
                    <label className="text-[11.5px] font-black text-stone-500 uppercase tracking-widest">Icon & Custom Label</label>
                    <p className="text-[9.5px] text-stone-700 font-bold uppercase tracking-widest">Personalize the calendar view</p>
                  </div>
                  {(currentSticker.emoji || currentSticker.label) && (
                    <button
                      onClick={() => handleSetSticker(undefined, undefined)}
                      className="text-[10.5px] font-black text-stone-500 uppercase bg-white/5 px-3 py-1 rounded-lg hover:text-red-400 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-2 bg-white/5 p-4 rounded-3xl">
                  {STICKERS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSetSticker(s, currentSticker.label)}
                      className={cn(
                        "aspect-square rounded-2xl flex items-center justify-center text-[21.5px] transition-all duration-300",
                        currentSticker.emoji === s
                          ? "bg-white/10 scale-110 shadow-md ring-2 ring-gold/20"
                          : "bg-white/5 hover:bg-white/10 text-stone-600 hover:text-white"
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
                    className="w-full bg-white/5 border-2 border-transparent focus:border-gold/20 rounded-2xl p-4 text-[11.5px] font-black tracking-widest outline-none transition-all placeholder:text-stone-700 uppercase text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9.5px] font-black text-stone-500 uppercase bg-white/5 px-2 py-1 rounded-md shadow-sm">
                    {(currentSticker.label || '').length}/12
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 pb-4">
                <button
                  onClick={handleDeleteNote}
                  className="p-4 bg-red-900/10 text-red-500 rounded-3xl hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={24} />
                </button>
                <button
                  onClick={() => setIsNoteSheetOpen(false)}
                  className="flex-1 p-6 bg-stone-900 text-white rounded-3xl font-bold uppercase text-[13.5px] tracking-widest active:scale-95 transition-transform"
                >
                  Finish Editing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Floating Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 h-28 pointer-events-none z-50 flex items-center justify-center px-6">
        <nav className="w-full max-w-md h-16 glass rounded-[32px] border border-white/40 shadow-native flex items-center justify-around px-2 pointer-events-auto">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home size={22} />} 
            label={t(UI_LABELS.HOME.en, UI_LABELS.HOME.tib)} 
          />
          <NavButton 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
            icon={<CalendarIcon size={22} />} 
            label={t(UI_LABELS.PLAN.en, UI_LABELS.PLAN.tib)} 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<User size={22} />} 
            label={t(UI_LABELS.PROFILE.en, UI_LABELS.PROFILE.tib)} 
          />
        </nav>
      </div>

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


// ── Components ──────────────────────────────────────────────────────────────



// ── Navigation ───────────────────────────────────────────────────────────────



