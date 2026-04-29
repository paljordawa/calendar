import fs from 'fs';
import path from 'path';

const csvPath = 'src/assets/Tibetan Elemental Calendar and Lunar Observances Database-2026.csv';
const dbPath = 'src/lib/database2026.ts';

function parseCSV() {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    const database: Record<string, any> = {};

    let currentYear = 2026;
    let seenJanuary = false;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser that handles quotes
        const row: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        row.push(currentValue.trim());

        if (row.length < 6) continue;

        const westernDateRaw = row[0]; // e.g. "Feb 18"
        const tibMonth = parseInt(row[1]);
        const tibDay = parseInt(row[2]) || 0; // Handle empty day number
        const tibWeekday = row[3];
        const elementsRaw = row[4];
        const symbolsRaw = row[5];
        const eventsRaw = row[6] || "";

        if (westernDateRaw.startsWith('Jan') && !seenJanuary && i > 300) {
            seenJanuary = true;
            currentYear = 2027;
        }

        // Parse date
        const [monthName, dayNum] = westernDateRaw.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = months.indexOf(monthName);
        if (monthIndex === -1) continue;
        
        const isoDate = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

        // Parse symbols
        const symbolParts = symbolsRaw.split('/').map(s => s.trim());
        const mainSymbol = symbolParts[0];
        const isHand = symbolsRaw.toLowerCase().includes('hand');
        const isYenKong = symbolsRaw.toLowerCase().includes('yen kong');

        // Parse elements (map ² to -Element)
        let elements = elementsRaw;
        const squareMatch = elements.match(/([a-zA-Z]+)²/);
        if (squareMatch) {
            const base = squareMatch[1];
            elements = elements.replace(`${base}²`, `${base}-${base}`);
        }

        // Parse observances
        const observances = eventsRaw.replace(/^"|"$/g, '').split(',').map(o => o.trim()).filter(o => o);

        database[isoDate] = {
            westernDate: westernDateRaw,
            tibMonth,
            tibDay,
            tibWeekday,
            elements,
            symbol: mainSymbol,
            isHand,
            isYenKong,
            observances
        };
    }

    const output = `export interface MentskhangData {
  westernDate: string;
  tibMonth: number;
  tibDay: number;
  tibWeekday: string;
  elements: string;
  symbol: string;
  isHand: boolean;
  isYenKong: boolean;
  observances: string[];
}

export const DATABASE_2026: Record<string, MentskhangData> = ${JSON.stringify(database, null, 2)};
`;

    fs.writeFileSync(dbPath, output);
    console.log(`Successfully updated ${dbPath} with ${Object.keys(database).length} entries.`);
}

parseCSV();
