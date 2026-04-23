# TibetAstro: Technical Developer Guide
[https://calendar-opal-five.vercel.app/](https://calendar-opal-five.vercel.app/)

This README provides a deep technical dive into the architecture, logic, and calculation engines powering the TibetAstro Tibetan Calendar.

---

## 🏗️ System Architecture

The application is a high-performance React SPA designed for offline-first, mobile-native experiences.

### Component Structure
- **Orchestration**: `App.tsx` handles global state, routing, and the `tibView` (active viewing date) management.
- **View Layer**: Modular components (Home, Calendar, Profile) consuming memoized data derived from the core logic.
- **UI System**: Built with `framer-motion` for hardware-accelerated drag gestures and `lucide-react` for iconography.

---

## 🧠 Core Calculation Engines

### 1. The Date Engine (`src/lib/tibetanCalendar.ts`)
The heart of the app is the `getTibetanDate(date)` function. It uses a **Hybrid Priority Logic**:

1. **Database Lookup (Highest Priority)**: Before calculating, it checks if the date exists in a hardcoded database (e.g., `DATABASE_2026`). This ensures 100% alignment with official Men-Tsee-Khang council decisions (skipped/double days).
2. **Anchor-Based Math**: If no database entry exists, it calculates the date using **Julian Day (JD)** anchors.
   - **Formula**: `JD_Today - JD_LosarAnchor = TotalDaysPassed`
   - It then derives the lunar month and day based on the Phugpa synodic month of **29.530588 days**.

### 2. Sacred Insights Engine (`src/lib/sacredInsights.ts`)
This engine transforms raw dates into spiritual guidance.
- **`getMeritMultiplier`**: Uses a switch-case logic to identify Major Festivals (100k×), Full/New Moons (10k×), and Sacred Days (10×).
- **`getDailyGuidance`**: Implements a **Priority Headline System**:
  - `Level 1`: Religious Festivals (Saga Dawa, etc.)
  - `Level 2`: Monthly Observances (Guru Rinpoche, Dakini, etc.)
  - `Level 3`: Dangerous/Auspicious Elemental Combinations.
  - `Level 4`: Default Mentskhang Symbol descriptions.

### 3. Personal Resonance Engine (`src/lib/horoscope.ts`)
Calculates birth-chart alignments locally.
- **Elemental Logic**: Implements the **Jung-Wa** relationship matrix (Mother, Son, Friend, Enemy) in a recursive search to determine harmony scores for Vitality, Body, Power, and Luck.
- **Dhun-Zur Detection**: A modulo-12 check to see if the birth sign is 180° opposite to the current year.

---

## 📊 Data Strategy

### Men-Tsee-Khang Symbols
Data is stored in `src/constants.ts` within the `MENTSKHANG_SYMBOLS` dictionary.
- **O(1) Access**: Symbols are retrieved via their ID (e.g., `Dron`, `Chi`) from the daily database.
- **Forbidden Actions**: Each symbol contains a typed array of strings used to dynamically update the "Auspiciousness Stoplight" in the UI.

### Localization (`UI_LABELS`)
All user-facing strings are centralized in `src/constants.ts`.
- **Constraint**: Never hardcode English or Tibetan strings in JSX components. Always use `UI_LABELS.key_name`.

---

## 🛠️ Developer Workflow

### Adding a New Year
1. **Prepare CSV**: Obtain the official MTK CSV for the new year.
2. **Convert to TS**: Map the CSV rows to the `MentskhangData` interface.
3. **Link in Engine**: Update `src/lib/tibetanCalendar.ts` to import the new `DATABASE_202X` and add it to the `DATABASE_MAP` for lookups.

### Commands
- `pnpm dev`: Standard dev server with HMR.
- `pnpm build`: Optimizes assets and generates a flat distribution for deployment.
- `pnpm preview`: Local testing of the production bundle.

---

## 🚀 Deployment & Build System

### Target Platforms
- **Primary**: Web (Optimized for Mobile Safari & Chrome).
- **PWA (Progressive Web App)**: Configured for installation on home screens with standalone UI behavior.
- **Responsive Targets**: 360px (Small Mobile) to 1024px (Tablet). Desktop is supported but follows a "Mobile-Centered" layout.

### Build Pipeline
The project uses **Vite** for optimized production builds:
- **Tree Shaking**: Heavily utilizes tree-shaking for the `@hnw/date-tibetan` and `lucide-react` libraries to minimize bundle size.
- **Asset Optimization**: Fonts (`.woff`) and PDFs are handled via Vite's asset pipeline with content hashing for aggressive caching.
- **Build Command**: 
  ```bash
  pnpm build
  ```
  This generates a `dist/` folder containing minified assets, ready for any static hosting provider.

### Deployment (Vercel)
The application is continuously deployed via **Vercel**:
- **Live URL**: [calendar-opal-five.vercel.app](https://calendar-opal-five.vercel.app/)
- **Configuration**: Automatically handles SPA routing redirects and SSL certificates.
- **Branch Strategy**: `main` branch deployments are production-ready.

---

## 📜 Documentation Reference
For the traditional and historical foundations, refer to:
- [Tibetan Calendar Logic & Tradition](TIBETAN_CALENDAR_DOCS.md)

---
> [!NOTE]
> This project prioritizes **Accuracy Over Performance**. While mathematical approximations are faster, we always prefer hardcoded official databases to maintain the integrity of the Men-Tsee-Khang lineage.
