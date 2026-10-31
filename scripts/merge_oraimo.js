const fs = require('fs');
const path = require('path');

const smartphonesPath = path.join(__dirname, '..', 'data', 'smartphones.json');
const currentProducts = JSON.parse(fs.readFileSync(smartphonesPath, 'utf8'));
const oraimoProducts = JSON.parse(fs.readFileSync(path.join(__dirname, 'oraimo_transformed.json'), 'utf8'));

console.log('Current catalog count:', currentProducts.length);
console.log('Oraimo products to add:', oraimoProducts.length);

const existingIds = new Set(currentProducts.map(p => p.id?.toLowerCase()));
const existingSlugs = new Set(currentProducts.map(p => p.slug?.toLowerCase()));

let addedCount = 0;
const merged = [...currentProducts];

oraimoProducts.forEach(op => {
  if (!existingIds.has(op.id.toLowerCase()) && !existingSlugs.has(op.slug.toLowerCase())) {
    merged.push(op);
    existingIds.add(op.id.toLowerCase());
    existingSlugs.add(op.slug.toLowerCase());
    addedCount++;
  } else {
    // Update existing if already present
    const idx = merged.findIndex(p => p.id.toLowerCase() === op.id.toLowerCase() || p.slug.toLowerCase() === op.slug.toLowerCase());
    if (idx !== -1) {
      merged[idx] = op;
    }
  }
});

fs.writeFileSync(smartphonesPath, JSON.stringify(merged, null, 2), 'utf8');
console.log(`Successfully updated smartphones.json! Total items now: ${merged.length} (${addedCount} new Oraimo products added)`);

// Check breakdown of Oraimo products
const oraimoInCatalog = merged.filter(p => p.brand.toLowerCase() === 'oraimo');
console.log('Total Oraimo products in catalog:', oraimoInCatalog.length);
const oraimoCategories = {};
oraimoInCatalog.forEach(p => {
  oraimoCategories[p.category] = (oraimoCategories[p.category] || 0) + 1;
});
console.log('Oraimo by category:', oraimoCategories);
