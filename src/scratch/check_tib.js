import { CalendarTibetan } from '@hnw/date-tibetan';
const date = new Date(2026, 3, 1); // April 1, 2026
const tib = new CalendarTibetan().fromDate(date);
console.log(JSON.stringify(tib, null, 2));
