const fs = require('fs');

const page4 = JSON.parse(fs.readFileSync('scripts/page4_products.json', 'utf8'));
const page5 = JSON.parse(fs.readFileSync('scripts/page5_products.json', 'utf8'));

// Take all 24 from page 4, plus chargers and power banks from page 5
// Specifically, let's include the chargers and power banks from page 5:
const selected = [
  ...page4, // 24 items
  page5[3], // Oraimo USB Charger E65S Micro-USB
  page5[4], // Oraimo USB Charger E65S Lightning
  page5[5], // Oraimo USB Charger E65S Type-C
  page5[11], // Oraimo Tank 2 Usb Charger E36S
  page5[1], // Oraimo Toast 10 Lite Power Bank
  page5[2], // Oraimo Traveler 3 Byte Power Bank
].filter(Boolean);

console.log('Selected total products:', selected.length);

const transformed = selected.map((item, idx) => {
  const p = item._source;
  const rawTitle = p.product_title || p.product_title_match;
  const slug = p.product_slug;
  const lowestPrice = parseInt(p.lowest_price || p.expected_price || 999, 10);
  const retailPrice = parseInt(p.retail_price || p.highest_price || Math.round(lowestPrice * 1.3), 10);
  const discountPercent = retailPrice > lowestPrice 
    ? Math.round(((retailPrice - lowestPrice) / retailPrice) * 100) 
    : 15;

  // Determine Category accurately
  const catName = (p.product_category_name || '').toLowerCase();
  const titleLower = rawTitle.toLowerCase();
  let category = 'wireless-earbuds';

  if (catName.includes('charger') || titleLower.includes('charger') || titleLower.includes('adapter')) {
    category = 'wall-chargers';
  } else if (catName.includes('cable') || titleLower.includes('cable')) {
    category = 'charging-cables';
  } else if (catName.includes('power bank') || titleLower.includes('power bank') || titleLower.includes('powerbank')) {
    category = 'power-banks';
  } else if (catName.includes('watch') || catName.includes('band') || titleLower.includes('watch') || titleLower.includes('band')) {
    category = 'smart-watches';
  } else if (catName.includes('speaker') || titleLower.includes('speaker')) {
    category = 'bluetooth-speakers';
  } else if (catName.includes('trimmer') || catName.includes('shaver') || titleLower.includes('trimmer')) {
    category = 'trimmers-shaver';
  } else if (catName.includes('earbud') || catName.includes('headphone') || catName.includes('neckband') || catName.includes('earphone')) {
    category = 'wireless-earbuds';
  }

  // Parse Image
  let imgObj = {};
  try {
    imgObj = typeof p.product_image === 'string' ? JSON.parse(p.product_image) : p.product_image;
  } catch {}
  const firstImg = imgObj['0'] || (imgObj.colors && Object.values(imgObj.colors)[0]?.['0']);
  let image = '';
  if (firstImg) {
    const base = firstImg.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    image = `https://images.priceoye.pk/${base}-500x500.webp`;
  } else {
    image = `/images/categories/${category}.webp`;
  }

  // Colors
  const rawColors = Array.isArray(p.color) && p.color.length > 0 ? p.color : ['black'];
  const colors = rawColors.map(c => {
    const name = c.charAt(0).toUpperCase() + c.slice(1);
    const hex = name.toLowerCase() === 'white' ? '#f8fafc' : name.toLowerCase() === 'blue' ? '#2563eb' : '#18181b';
    return {
      name,
      hex,
      image,
      inStock: true,
      stockQty: 10
    };
  });

  const colorStockMap = {};
  colors.forEach(c => {
    colorStockMap[c.name] = { inStock: true, stockQty: 10 };
  });

  // Specs & highlights
  let batterySpec = 'Rechargeable Battery Cell';
  let processorSpec = 'Oraimo Intelligent Controller';
  let chargingSpec = 'Fast Charging Supported';
  let screenSpec = 'LED Status Indicator';
  let tagline = `Official Oraimo ${p.product_category_name || 'Accessory'} with Brand Warranty`;

  if (category === 'charging-cables') {
    batterySpec = 'High-Durability Pure Copper Wire Core';
    processorSpec = 'Oraimo Smart Current Regulation Chip';
    chargingSpec = 'Fast Charging & High-Speed Data Sync (480 Mbps)';
    screenSpec = 'Reinforced Tangle-Free Braided Jacket';
    tagline = 'High-Speed Fast Charging & Heavy-Duty Data Cable';
  } else if (category === 'wall-chargers') {
    batterySpec = 'Universal Wall AC Input (100-240V ~ 50/60Hz)';
    processorSpec = 'Oraimo Multi-Protect Smart Power IC';
    chargingSpec = 'Ultra-Fast Safe Multi-Device Power Delivery';
    screenSpec = 'Compact Ergonomic Flame-Retardant Casing';
    tagline = 'High-Speed Multi-Protection Fast Wall Charger';
  } else if (category === 'power-banks') {
    batterySpec = titleLower.includes('27000') || titleLower.includes('27600') ? '27,000mAh High-Density Battery' : titleLower.includes('20000') ? '20,000mAh High-Capacity Battery' : '10,000mAh Compact Battery';
    processorSpec = 'Oraimo AniFast Smart Voltage Regulation';
    chargingSpec = 'Two-Way Fast Charge with Dual USB Outputs';
    screenSpec = 'Multi-Segment LED Battery Level Indicator';
    tagline = 'Massive Battery Backup with AniFast Smart Charging';
  } else if (category === 'smart-watches') {
    batterySpec = 'Up to 7 Days Battery Life on Normal Use';
    processorSpec = 'High-Precision Health & Biometric Sensor';
    chargingSpec = 'Magnetic Fast Charging Cable';
    screenSpec = titleLower.includes('band') ? '0.96-inch Vivid Color Display' : '1.39-inch HD Full Touch Color Screen';
    tagline = 'Heart Rate, Sleep Monitoring & Smart Fitness Tracker';
  } else if (category === 'wireless-earbuds') {
    batterySpec = 'Up to 30 Hours Extended Playtime with Case';
    processorSpec = 'Bluetooth V5.3 Low-Latency Audio Driver';
    chargingSpec = 'Type-C AniFast Rapid Charge';
    screenSpec = 'Capacitive Smart Touch Controls';
    tagline = 'Heavy Bass Sound, Clear Voice Calls & Long Playtime';
  } else if (category === 'bluetooth-speakers') {
    batterySpec = 'Rechargeable Li-ion Battery (up to 8 Hours Playtime)';
    processorSpec = 'Mega Sound Driver with Deep Bass';
    chargingSpec = 'Type-C USB Charging';
    screenSpec = 'Rugged Water-Resistant Design';
    tagline = 'Portable Rich Sound & Deep Punchy Bass';
  }

  return {
    id: slug,
    slug,
    name: rawTitle,
    brand: 'Oraimo',
    category,
    tagline,
    basePricePKR: lowestPrice,
    originalPricePKR: retailPrice,
    discountPercent,
    rating: p.rating_stars ? parseFloat(p.rating_stars) : 4.8,
    reviewCount: p.total_reviews ? parseInt(p.total_reviews, 10) : Math.floor(Math.random() * 30) + 12,
    inStock: true,
    stockQty: 25,
    isTrending: idx < 6,
    isBestSeller: idx % 3 === 0,
    colors,
    variants: [
      {
        id: `${slug}-std`,
        storage: category === 'power-banks' ? batterySpec.split(' ')[0] : 'Standard',
        ram: category === 'charging-cables' ? '1m' : 'Official',
        pricePKR: lowestPrice,
        originalPricePKR: retailPrice,
        inStock: true,
        stockQty: 25,
        costPricePKR: Math.round(lowestPrice * 0.8),
      }
    ],
    colorStockMap,
    keyHighlights: {
      display: screenSpec,
      processor: processorSpec,
      camera: 'Official Oraimo Pakistan Warranty',
      battery: batterySpec,
      charging: chargingSpec,
    },
    specs: {
      screen: screenSpec,
      refreshRate: 'AniFast High Efficiency',
      displayType: 'Durable Premium Polymer Build',
      processor: processorSpec,
      chipsetBrand: 'Oraimo Technology',
      mainCamera: 'Official Quality Certified',
      selfieCamera: 'Built-in Mic & Voice Enhancement',
      battery: batterySpec,
      charging: chargingSpec,
      os: 'Universal Compatibility (Android, iOS & USB Devices)',
      network: category === 'charging-cables' ? 'High-Speed Copper Bus' : 'Bluetooth / Fast Sync',
      security: 'Overvoltage & Short Circuit Surge Protection',
      weight: category === 'power-banks' ? '380 g' : category === 'charging-cables' ? '35 g' : '150 g',
      waterResistance: category === 'wireless-earbuds' ? 'IPX4 Water & Sweat Resistant' : 'Splash Resistant',
      ptaStatus: 'PTA Approved',
      warranty: '1 Year Official Oraimo Pakistan Warranty',
    },
    costPricePKR: Math.round(lowestPrice * 0.8),
  };
});

console.log('Transformed products count:', transformed.length);
fs.writeFileSync('scripts/oraimo_transformed.json', JSON.stringify(transformed, null, 2));

const summary = {};
transformed.forEach(t => {
  summary[t.category] = (summary[t.category] || 0) + 1;
});
console.log('Category breakdown:', summary);
