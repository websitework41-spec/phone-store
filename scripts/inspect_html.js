const fs = require('fs');

const html = fs.readFileSync('scripts/page4.html', 'utf8');

// Find sections containing oraimo
const lines = html.split('\n');
const matchingLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('oraimo')) {
    matchingLines.push({ line: i, content: lines[i].trim() });
  }
}
console.log('Total oraimo lines:', matchingLines.length);
console.log('First 10 matches:');
matchingLines.slice(0, 10).forEach(m => console.log(`[Line ${m.line}]:`, m.content.slice(0, 150)));
