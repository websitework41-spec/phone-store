const fs = require('fs');

const html = fs.readFileSync('scripts/page4.html', 'utf8');

// Look for product card patterns or data in priceoye
// PriceOye often embeds product card divs with class "product-box" or similar, or json-ld, or window state
console.log('Contains product-box?', html.includes('product-box'));
console.log('Contains product-card?', html.includes('product-card'));
console.log('Contains oraimo?', html.toLowerCase().includes('oraimo'));

// Let's inspect some occurrences of "oraimo"
const regex = /<div[^>]*class="[^"]*product-box[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
const matches = [...html.matchAll(/<div[^>]*class="[^"]*productBox[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];
console.log('productBox matches:', matches.length);

// Let's find links to products: href="https://priceoye.pk/..."
const productHrefMatches = [...html.matchAll(/href="(https:\/\/priceoye\.pk\/(?:wireless-earbuds|power-banks|chargers|smart-watches|trimmers-shaver|bluetooth-speakers|charging-cables|tablets)\/[^"]+)"/g)];
console.log('Product category links:', productHrefMatches.length);
const uniqueLinks = [...new Set(productHrefMatches.map(m => m[1]))];
console.log('Unique product category links:', uniqueLinks.length);
console.log('First 20 links:', uniqueLinks.slice(0, 20));
