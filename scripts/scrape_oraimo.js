const fs = require('fs');

async function checkPage() {
  const url = 'https://priceoye.pk/search?q=oraimo&page=4';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/page4.html', html, 'utf8');
  console.log('Saved page4.html, length:', html.length);
}

checkPage().catch(console.error);
