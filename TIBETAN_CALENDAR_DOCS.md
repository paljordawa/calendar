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

## 6. Personal Alignment & Data Usage
Your personal profile data (Birth Date and Gender) is the key to calculating your **Sacred Resonance**. This data is processed strictly on your local device to generate the following insights:

### A. Birth Animal & Element
Your birth year is mapped to the 60-year Rabjung cycle to determine your core **Life Force Element** and **Zodiac Sign**. These are the foundations for all personal alignments.

### B. Personal Power Days
Each zodiac sign has a unique relationship with the seven planetary days (Monday–Sunday). The app calculates your:
- **Soul Day (La-Day)**: Your strongest day for spiritual practice and important decisions.
- **Vitality Day (Sok-Day)**: A day of physical and mental rejuvenation.
- **Conflict Day (Enemy Day)**: A day where energy is challenging; caution is advised for major activities.

### C. Yearly Horoscope & Dhun-Zur
The app compares your Birth Animal to the current Year Animal.
- **Dhun-Zur (Opposition)**: If your sign is exactly six years apart from the current year (180° opposition), you are in a "Year Conflict" period. The app flags this and provides guidance for protective practices.

### D. Elemental Energy Scores
We perform a 4-point elemental analysis comparing your birth year to the current year:
1. **Vitality (Sok)**: Your inner life-force strength.
2. **Body (Lu)**: Physical health and immunity.
3. **Power (Wang)**: Your ability to achieve goals and influence surroundings.
4. **Luck (Lungta)**: General fortune and success.

These scores use the **Jung-Wa** relationship logic (Mother-Son-Enemy) to determine if the year's energy supports or challenges your internal constitution.

## 8. Future Predictions & Mathematical Certainty
The Tibetan calendar is not just a historical record; it is a highly predictable mathematical system. Using the Phugpa anchors, the application can forecast future astrological states with high precision.

### A. Predicting Major Yearly Markers
Because the **60-year Rabjung cycle** and the **Synodic Lunar Month** (29.53 days) follow fixed periods, we can calculate future years decades in advance:
- **Losar (New Year)**: Predicted by identifying the first new moon after the sun enters the constellation of Aries (relative to Phugpa solar anchors).
- **Intercalary Months**: We can predict "Double Months" by identifying years where the lunar and solar cycles drift by more than 30 days.

### B. Predicting the 10 Daily Symbols (Zhung-Tsi)
The 10 symbols (*Dron, Tsong, Bhu, Mhag, Nyen, Khar, Bhag, Dhur, Shid, Chi*) are calculated using a strict modulo-10 formula:
**Symbol Index = (Planet_Index + Lunar_Mansion_Index) % 10**

Since both the planet (weekday) and the moon's position in the 27 mansions follow predictable orbits, these guidance markers are mathematically determined forever.

### C. Forecast for Upcoming Years (Predicted)
| Event | 2027 (Fire Sheep - 2154) | 2028 (Earth Monkey - 2155) |
| :--- | :--- | :--- |
| **Losar (New Year)** | February 7, 2027 | January 26, 2028 |
| **Saga Dawa Duchen** | June 19, 2027 | June 8, 2028 |
| **Chokhor Duchen** | August 6, 2027 | July 26, 2028 |
| **Lhabab Duchen** | November 20, 2027 | November 9, 2028 |

> [!IMPORTANT]
> While these dates are mathematically accurate, practitioners should always consult the **Official Men-Tsee-Khang Lo-tho** released each year for any council-mandated ritual adjustments.

## 9. Sources & Resources
The accuracy of this calendar is maintained through the following primary sources:

- **Official Authority**: [Men-Tsee-Khang](https://www.mentseekhang.org) (Tibetan Medical & Astro-Science Institute). We reference the official annual paper *Lo-tho* for ground-truth alignment.
- **Reference Database (2026)**: *Tibetan Elemental Calendar and Lunar Observances Database-2026.csv*. This raw data source is used to calibrate the 2026 calendar period, ensuring exact alignment with official Men-Tsee-Khang daily indicators and ritual observances.
- **Mathematical Engine**: [@hnw/date-tibetan](https://github.com/hnw/date-tibetan) – A specialized library implementing the complex Phugpa Lunisolar algorithms.
- **Translational Support**: [Lotsawa House](https://www.lotsawahouse.org) – Used for traditional terminology, ritual descriptions, and prayer alignments.
- **Astronomical Tables**: The *Kala-chakra Tantra* (Wheel of Time) tables as interpreted by the Phugpa lineage.

## 10. Error Mitigation & Future Updates
To maintain 100% accuracy for future years, the application follows a **'Manual Over Mathematics'** principle. If you notice a discrepancy between the app and the official Men-Tsee-Khang (MTK) paper almanac, follow this protocol:

### A. How to Handle Future Years
For every new Tibetan year, it is recommended to provide a new reference CSV (e.g., ...-2027.csv). 
1. **Provide a New File**: Do not overwrite the old files. Create a new CSV for the upcoming year.
2. **Integration Process**:
   - The CSV is converted into a structured TypeScript file (e.g., src/lib/database2027.ts).
   - This database is then added to the getTibetanDate function's lookup logic.
   - **Why?** This ensures the app doesn't just 'guess' the math; it uses the exact ritual placements decided by the MTK council.

### B. Correcting Specific Errors
If a single day's data is found to be incorrect:
- **Database Priority**: The app checks the hardcoded DATABASE_XXXX objects **before** performing any mathematical calculations. 
- **The Fix**: You can manually update the values (symbols, elements, or observances) directly in the src/lib/databaseXXXX.ts files. The app will immediately reflect these changes, overriding the internal mathematical engine.

### C. Future-Proofing
The current mathematical library (@hnw/date-tibetan) is accurate for 99% of dates. However, the 1% difference usually comes from specific MTK 'Council Decisions' regarding double or skipped days. By providing the official CSV each year, you eliminate this 1% margin of error.

## 11. Special Astrological Markers
To provide a truly complete Men-Tsee-Khang experience, the application tracks several 'Hidden' markers used by practitioners and physicians:

### A. Hand Days (Lag-Pa)
- **Significance**: These are specifically calculated days considered ideal for medical treatments, surgeries, and the preparation of medicinal formulas in the Sowa Rigpa tradition.
- **Visual**: Indicated by the 🤚 icon in the Astro and Calendar views.

### B. Yen Kong & Black Days
- **Yen Kong**: A specific astrological configuration that signals obstacles or 'empty' energy. It is advised to avoid starting new major projects on these days.
- **Black Days (Nyin-Ngan)**: These are traditionally difficult days where caution is paramount. The app flags these to help users adjust their expectations and maintain mindfulness.

### C. Naga Days (Lu-Day)
- **Significance**: Days when the Naga (water spirits) are active. These are considered highly auspicious for specific environmental and water-related rituals, and for making offerings to protect local ecology.

### D. Pulse Change Transitions
In accordance with Men-Tsee-Khang medical principles, the app tracks the four major seasonal pulse transitions:
- **Wood-Liver Pulse**: Spring transition.
- **Fire-Heart Pulse**: Summer transition.
- **Metal-Lungs Pulse**: Autumn transition.
- **Water-Kidney Pulse**: Winter transition.
- **Earth-Spleen Pulse**: Inter-seasonal 'gap' periods.

These transitions are vital for practitioners of Tibetan Medicine to adjust diagnostic techniques and dietary recommendations.

## 12. Reference Table: Traditional Terms & Symbols

### A. The 12 Zodiac Animals (Lok-Khor)
| English | Tibetan | Symbol |
| :--- | :--- | :--- |
| Rat | བྱི་བ། (Byi-ba) | 🐁 |
| Ox | གླང་། (Glang) | 🐂 |
| Tiger | སྟག (Stag) | 🐅 |
| Rabbit | ཡོས། (Yos) | 🐇 |
| Dragon | འབྲུག (vBrug) | 🐉 |
| Snake | སྦྲུལ། (Sbrul) | 🐍 |
| Horse | རྟ། (Rta) | 🐎 |
| Sheep | ལུག (Lug) | 🐑 |
| Monkey | སྤྲེལ། (Sprel) | 🐒 |
| Bird | བྱ། (Bya) | 🐓 |
| Dog | ཁྱི། (Khyi) | 🐕 |
| Pig | ཕག (Phag) | 🐖 |

### B. The 5 Elements (Jung-Wa)
| English | Tibetan | Symbol |
| :--- | :--- | :--- |
| Wood | ཤིང་། (Shing) | 🌳 |
| Fire | མེ། (Me) | 🔥 |
| Earth | ས། (Sa) | ⛰️ |
| Iron / Metal | ལྕགས། (Lcags) | ⚔️ |
| Water | ཆུ། (Chu) | 💧 |

### C. The 10 Daily Symbols (Zhung-Tsi)
| English | Tibetan | Symbol |
| :--- | :--- | :--- |
| Village | གྲོང་། (Dron) | 🏡 |
| Commerce | ཚོང་། (Tsong) | 💰 |
| Child | བུ། (Bhu) | 👶 |
| Battle | དམག (Mhag) | ⚔️ |
| Danger | གཉན། (Nyen) | ⚠️ |
| Mansion | མཁར། (Khar) | 🏰 |
| Couple | བག་ (Bhag) | 💑 |
| Cemetery | དུར། (Dhur) | 🛌 |
| Funeral | གཤིད། (Shid) | 🚩 |
| Life | གསོན། (Chi) | 🔺 |

### D. Special Markers
| English | Tibetan | Symbol |
| :--- | :--- | :--- |
| Hand Day | ལག་པ། (Lag-pa) | 🤚 |
| Naga Day | ཀླུ་གཟའ། (Lu-Zha) | 🐉 |
| Merit Today | དགེ་རྩ། (Gewa) | ✨ |
| Wind Horse | རླུང་རྟ། (Lungta) | 🐴 |
