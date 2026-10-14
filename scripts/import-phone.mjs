#!/usr/bin/env node

/**
 * VoltMobiles Smart Phone Importer
 * Usage:
 *   node scripts/import-phone.mjs "Xiaomi" "Poco X6 Pro 5G" --price 104999 --specs "Dimensity 8300 Ultra, 64MP OIS, 5000mAh, 67W"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../data/smartphones.json');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
📱 VoltMobiles Smart Importer Pipeline
--------------------------------------
Usage:
  node scripts/import-phone.mjs "<Brand>" "<Model Name>" [options]

Options:
  --price <PKR>         Discounted Base price in PKR (default: 89999)
  --original <PKR>      Original retail price in PKR (default: price + 10%)
  --storage <size>      Default storage (default: 256GB)
  --ram <size>          Default RAM (default: 8GB)
  --screen <desc>       Display description
  --processor <desc>    Processor description
  --camera <desc>       Camera description
  --battery <desc>      Battery description

Example:
  node scripts/import-phone.mjs "Xiaomi" "Poco X6 Pro 5G" --price 104999 --storage "256GB" --ram "12GB"
`);
  process.exit(0);
}

const brand = args[0];
const name = args[1];

function getArgValue(flag, defaultVal) {
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultVal;
}

const basePrice = parseInt(getArgValue('--price', '89999'), 10);
const originalPrice = parseInt(getArgValue('--original', String(Math.round(basePrice * 1.1))), 10);
const discountPercent = Math.round(((originalPrice - basePrice) / originalPrice) * 100);
const storage = getArgValue('--storage', '256GB');
const ram = getArgValue('--ram', '8GB');

const slug = `${brand}-${name}`
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const id = slug;

const newPhone = {
  id,
  slug,
  name: `${brand} ${name}`,
  brand,
  tagline: `Official ${brand} smartphone with 1-Year Brand Warranty & PTA Approval`,
  basePricePKR: basePrice,
  originalPricePKR: originalPrice,
  discountPercent,
  rating: 4.8,
  reviewCount: Math.floor(20 + Math.random() * 80),
  inStock: true,
  isNew: true,
  isTrending: true,
  isBestSeller: false,
  colors: [
    {
      name: 'Phantom Black',
      hex: '#212124',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Glacier Silver',
      hex: '#d6d7dc',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    },
  ],
  variants: [
    {
      id: `${id}-${ram}-${storage}`.toLowerCase(),
      ram,
      storage,
      pricePKR: basePrice,
      originalPricePKR: originalPrice,
      inStock: true,
    },
    {
      id: `${id}-${ram}-512gb`.toLowerCase(),
      ram,
      storage: '512GB',
      pricePKR: Math.round(basePrice * 1.15),
      originalPricePKR: Math.round(originalPrice * 1.15),
      inStock: true,
    },
  ],
  keyHighlights: {
    display: getArgValue('--screen', '6.67" 120Hz FHD+ AMOLED'),
    processor: getArgValue('--processor', 'High-Performance 4nm Octa-core'),
    camera: getArgValue('--camera', '50MP OIS Ultra-Clear Triple Camera'),
    battery: getArgValue('--battery', '5000 mAh All-day Battery'),
    charging: '67W Turbo Charge (in box charger)',
  },
  specs: {
    screen: getArgValue('--screen', '6.67" 120Hz CrystalRes AMOLED, HDR10+, Gorilla Glass'),
    refreshRate: '120Hz',
    displayType: 'AMOLED',
    processor: getArgValue('--processor', 'High-Performance Octa-core Chipset'),
    chipsetBrand: brand === 'Apple' ? 'Apple' : brand === 'Samsung' ? 'Qualcomm' : 'MediaTek',
    mainCamera: getArgValue('--camera', '50 MP (wide, OIS) + 8 MP (ultrawide) + 2 MP (macro)'),
    selfieCamera: '16 MP, f/2.4, HDR',
    battery: '5000 mAh Li-Po non-removable',
    charging: '67W Turbo Charging',
    os: 'Android 14',
    network: '5G, Dual SIM (Nano-SIM, dual stand-by)',
    security: 'In-display Fingerprint, AI Face Unlock',
    weight: '198 g',
    waterResistance: 'IP54 splash resistant',
    ptaStatus: 'PTA Approved',
    warranty: `1 Year Official ${brand} Pakistan Warranty`,
  },
};

const rawData = fs.readFileSync(catalogPath, 'utf8');
const catalog = JSON.parse(rawData);

// Check if duplicate
const existingIndex = catalog.findIndex((p) => p.slug === slug);
if (existingIndex !== -1) {
  console.log(`⚠️  Phone "${newPhone.name}" already exists in catalog. Updating entry...`);
  catalog[existingIndex] = newPhone;
} else {
  catalog.unshift(newPhone);
  console.log(`✅ Added "${newPhone.name}" to smartphone catalog!`);
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`✨ Total smartphones in catalog: ${catalog.length}`);
console.log(`🔗 Slug: /product/${newPhone.slug}`);
console.log(`💰 Price: Rs. ${basePrice.toLocaleString('en-PK')}`);

