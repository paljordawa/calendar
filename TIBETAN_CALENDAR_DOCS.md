# Tibetan Calendar & Astronomical Logic (Phugpa Tradition)

This document explains the mathematical and astrological foundations used in the **Men-Tsee-Khang** (Tibetan Medical & Astro-Science Institute) style calendar integrated into this application.

## 1. The Phugpa Tradition
The **Phugpa lineage** (Phug-Lugs) is the primary system of Tibetan astronomy and calendar calculation. Created in the 15th century by Phugpa Lhundrup Gyatso, it is the official system used by the Government of Tibet and the Men-Tsee-Khang.

## 2. Structure of the Calendar
The Tibetan calendar is **Lunisolar**, meaning it tracks both the phases of the moon and the position of the sun.

### A. The 60-Year Rabjung Cycle
Instead of centuries, Tibetans use 60-year cycles called *Rabjung*. Each year is defined by a combination of:
- **12 Animals**: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Sheep, Monkey, Bird, Dog, Pig.
- **5 Elements**: Wood, Fire, Earth, Iron (Metal), Water.
- **Gender**: Alternating Male and Female years.

*Example: 2024 is the year of the **Wood Male Dragon** (Rabjung 17, Year 38).*

### B. Lunar Months (Dawa)
A Tibetan year usually has 12 months. However, because the lunar cycle is shorter than the solar year, an **intercalary month (Leap Month)** is added approximately every 3 years to keep the calendar aligned with the seasons.

### C. Lunar Days (Tshe)
A month consists of 30 lunar days (Tshe 1 to Tshe 30). Because the moon's speed varies, the Tibetan system uses "True" lunar days:
- **Skipped Days (Tshe-cho)**: If a lunar day passes very quickly, the date number is skipped (e.g., jumping from the 3rd to the 5th).
- **Doubled Days (Tshe-nyis)**: If a lunar day lasts longer than a solar day, the date repeats (e.g., two 10ths in a row).

## 3. Astrological Indicators
The calendar calculates three primary daily indicators used in **Sowa Rigpa** (Tibetan Medicine) and personal guidance.

### A. Parkha (The 8 Trigrams)
Represented by the symbols from the I Ching, these cycle daily and represent the "winds" of energy:
- **Li** (Fire), **Khon** (Earth), **Dwa** (Iron), **Khen** (Sky), **Kham** (Water), **Gin** (Mountain), **Zon** (Wind), **Zin** (Wood).

### B. Mewa (The 9 Magic Square Numbers)
The Mewa represents the "Karmic Square." Each of the 9 numbers (1 through 9) has a color and specific energy (e.g., 1-White, 2-Black, 5-Yellow). They cycle daily and yearly.

### C. Elemental Harmony
The app calculates the relationship between your **Birth Element** and the **Day's Element** using the "Mother-Son-Enemy" logic:
- **Mother (Life)**: Supporting and nourishing energy.
- **Son (Prosperity)**: Creative and outward-flowing energy.
- **Friend (Same)**: Stable and balanced energy.
- **Enemy (Obstacle)**: Challenging energy that requires caution.

## 4. Mathematical Implementation
The application uses the **Kala-Chakra (Wheel of Time)** astronomical formulas. 
- **Julian Day (JD)** is used as the universal anchor point.
- **Synodic Month**: Calculated at approximately 29.530588 days.
- **Anomaly of Moon/Sun**: The variations in speed that result in skipped and doubled days are calculated using the tables defined in the Phugpa mathematics.

## 5. Usage in Sowa Rigpa
Practitioners of Tibetan Medicine use these calculations to:
1. Determine the best time for surgery (avoiding sensitive days).
2. Choosing times for picking medicinal plants.
3. Advising patients on spiritual or lifestyle adjustments during difficult astrological periods.
