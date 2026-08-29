const fs = require('fs');
const content = fs.readFileSync('app/admin/inventory/page.tsx', 'utf8');
const lines = content.split('\n');
const targetLine = lines[1577]; // 1578 0-indexed
console.log('Line 1578:', targetLine);
console.log('Hex:', Buffer.from(targetLine).toString('hex'));
