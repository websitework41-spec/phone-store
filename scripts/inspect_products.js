const fs = require('fs');

const html = fs.readFileSync('scripts/page4.html', 'utf8');
const lines = html.split('\n');

for (let i = 2700; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('oraimo') && !lines[i].includes('form method')) {
    console.log(`[Line ${i}]:`, lines[i].trim().slice(0, 160));
  }
}
