import { CalendarTibetan } from '@hnw/date-tibetan';
const date = new Date(2026, 3, 22); // April 22, 2026
const tib = new CalendarTibetan().fromDate(date);
console.log(JSON.stringify(tib, null, 2));
console.log("Keys:", Object.keys(tib));
