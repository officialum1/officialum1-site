const fs = require('fs');
const content = fs.readFileSync('app/admin/inventory/page.tsx', 'utf8');

let inTag = false;
let inExpression = 0;
let lineNum = 1;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '<') inTag = true;
    if (char === '>') inTag = false;

    if (!inTag) {
        if (char === '{') inExpression++;
        if (char === '}') {
            if (inExpression > 0) {
                inExpression--;
            } else {
                console.log(`Potential stray '}' at line ${lineNum}: ...${content.substring(i - 10, i + 10)}...`);
            }
        }
    }

    if (char === '\n') lineNum++;
}
