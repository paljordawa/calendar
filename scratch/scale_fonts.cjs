const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newContent = content.replace(/text-\[([\d.]+)px\]/g, (match, p1) => {
    const size = parseFloat(p1);
    const newSize = size + 1.5;
    return `text-[${newSize}px]`;
});

const finalContent = newContent
    .replace(/\btext-xs\b/g, 'text-[13.5px]')
    .replace(/\btext-sm\b/g, 'text-[15.5px]')
    .replace(/\btext-base\b/g, 'text-[17.5px]')
    .replace(/\btext-lg\b/g, 'text-[19.5px]')
    .replace(/\btext-xl\b/g, 'text-[21.5px]')
    .replace(/\btext-2xl\b/g, 'text-[25.5px]')
    .replace(/\btext-3xl\b/g, 'text-[32px]');

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('Fonts scaled successfully');
