const { CalendarTibetan } = require('@hnw/date-tibetan');

const date = new Date(2024, 1, 10); // Feb 10, 2024 (Losar)
const tib = CalendarTibetan.fromDate(date);
console.log('Tibetan Year:', tib.year);
console.log('Tibetan Month:', tib.month);
console.log('Tibetan Day:', tib.day);
console.log('Is Leap Month:', tib.leapMonth);

const date2 = new Date(2024, 1, 11);
const tib2 = CalendarTibetan.fromDate(date2);
console.log('Next Day Tshe:', tib2.day);
