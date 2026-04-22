const fs = require('fs');
const content = fs.readFileSync('c:/Users/paljo/OneDrive/Desktop/app/calendar/src/assets/Tibetan Elemental Calendar and Lunar Observances Database-2025.csv', 'utf8');
const lines = content.split('\n');
const events = new Set();
lines.forEach((line, i) => {
  if (i === 0) return;
  const parts = line.split(',');
  if (parts.length > 5) {
    const eventPart = parts.slice(5).join(',').replace(/"/g, '').trim();
    if (eventPart) {
      eventPart.split(',').forEach(e => events.add(e.trim()));
    }
  }
});
console.log(Array.from(events).sort());
