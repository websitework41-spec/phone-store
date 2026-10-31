const fs = require('fs');

const items = JSON.parse(fs.readFileSync('scripts/page4_products.json', 'utf8'));

console.log('Total items:', items.length);
items.forEach((item, idx) => {
  const p = item._source;
  console.log(`${idx + 1}. [${p.product_category_name}] ${p.product_title} - Rs. ${p.lowest_price || p.expected_price} (retail: Rs. ${p.retail_price || p.expected_price}) - slug: ${p.product_slug}`);
});
