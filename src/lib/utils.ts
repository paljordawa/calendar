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
