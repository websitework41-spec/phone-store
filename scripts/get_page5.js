const fs = require('fs');

async function getPage5() {
  const url = 'https://priceoye.pk/search?q=oraimo&page=5';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const match = html.match(/let\s+paginationInstance\s*=\s*(\{[\s\S]*?\});/);
  if (match) {
    const data = JSON.parse(match[1]);
    console.log('Page 5 products count:', data.data ? data.data.length : 0);
    if (data.data) {
      data.data.forEach((item, idx) => {
        const p = item._source;
        console.log(`${idx + 1}. [${p.product_category_name}] ${p.product_title} - Rs. ${p.lowest_price || p.expected_price}`);
      });
      fs.writeFileSync('scripts/page5_products.json', JSON.stringify(data.data, null, 2));
    }
  }
}

getPage5().catch(console.error);
