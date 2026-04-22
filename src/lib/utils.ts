import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standardizes common HTML ID attributes for Tibetan language.
 * Use for styling and script targeting.
 */
export const cn_id = (id: string, className?: string) => {
  return cn(id, className);
};

export const UI_IDS = {
  HOME: {
    TODAY_TAB_BUTTON: "today-tab-button",
    ASTRO_TAB_BUTTON: "astro-tab-button",
    SACRED_TAB_BUTTON: "sacred-tab-button",
    TODAY_CARD: "today-card-container",
    ALMANAC_SECTION: "almanac-section",
    HOROSCOPE_SECTION: "horoscope-section",
    CALENDAR_VIEW: "calendar-view-container",
    PROFILE_VIEW: "profile-view-container",
  },
  SETTINGS: {
    LANGUAGE_SELECTOR: "language-selector-section",
    INTERACE_SECTION: "interface-settings",
    DATA_SYNC_SECTION: "data-sync-settings",
    DANGER_ZONE: "danger-zone-settings",
  }
};

/**
 * Converts Western numerals to Tibetan numerals.
 */
export function toTibetanNumerals(num: number | string | undefined): string {
  if (num === undefined || num === null) return '';
  const digits: Record<string, string> = {
    '0': '༠', '1': '༡', '2': '༢', '3': '༣', '4': '༤',
    '5': '༥', '6': '༦', '7': '༧', '8': '༨', '9': '༩'
  };
  return num.toString().split('').map(char => digits[char] || char).join('');
}
