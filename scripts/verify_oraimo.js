const catalog = require('../data/smartphones.json');

const results = catalog.filter(p => p.brand.toLowerCase() === 'oraimo');
console.log('Oraimo items found:', results.length);
['charging-cables', 'wall-chargers', 'wireless-earbuds', 'power-banks', 'smart-watches', 'bluetooth-speakers'].forEach(cat => {
  const inCat = results.filter(p => p.category === cat);
  console.log(`- ${cat}: ${inCat.length} products (sample: ${inCat[0]?.name})`);
});
