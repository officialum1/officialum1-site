const fs = require('fs');
const content = fs.readFileSync('app/admin/inventory/page.tsx', 'utf8');

let braces = 0;
let parens = 0;
let lineNum = 1;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '\n') lineNum++;

    if (braces < 0) {
        console.log(`Extra closing brace at line ${lineNum}`);
        break;
    }
    if (parens < 0) {
        console.log(`Extra closing parenthesis at line ${lineNum}`);
        break;
    }
}

console.log(`Final counts: braces=${braces}, parens=${parens}`);
