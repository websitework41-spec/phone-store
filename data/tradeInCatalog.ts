export interface TradeInModel {
  brand: string;
  model: string;
  baseValuationPKR: number; // Valuation for 128GB in Mint condition
  availableStorage: string[];
}

export const TRADE_IN_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi / Redmi',
  'Infinix',
  'Tecno',
  'Realme',
  'Vivo',
  'Oppo',
  'OnePlus',
  'Google Pixel',
];

export const TRADE_IN_MODELS: Record<string, TradeInModel[]> = {
  Apple: [
    { brand: 'Apple', model: 'iPhone 15 Pro Max', baseValuationPKR: 310000, availableStorage: ['256GB', '512GB', '1TB'] },
    { brand: 'Apple', model: 'iPhone 15 Pro', baseValuationPKR: 260000, availableStorage: ['128GB', '256GB', '512GB'] },
    { brand: 'Apple', model: 'iPhone 15', baseValuationPKR: 195000, availableStorage: ['128GB', '256GB', '512GB'] },
    { brand: 'Apple', model: 'iPhone 14 Pro Max', baseValuationPKR: 245000, availableStorage: ['128GB', '256GB', '512GB'] },
    { brand: 'Apple', model: 'iPhone 14 Pro', baseValuationPKR: 205000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 14', baseValuationPKR: 155000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 13 Pro Max', baseValuationPKR: 185000, availableStorage: ['128GB', '256GB', '512GB'] },
    { brand: 'Apple', model: 'iPhone 13 Pro', baseValuationPKR: 155000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 13', baseValuationPKR: 125000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 12 Pro Max', baseValuationPKR: 135000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 12', baseValuationPKR: 95000, availableStorage: ['64GB', '128GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 11 Pro Max', baseValuationPKR: 105000, availableStorage: ['64GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone 11', baseValuationPKR: 68000, availableStorage: ['64GB', '128GB'] },
    { brand: 'Apple', model: 'iPhone XS Max', baseValuationPKR: 52000, availableStorage: ['64GB', '256GB'] },
    { brand: 'Apple', model: 'iPhone X / XR', baseValuationPKR: 42000, availableStorage: ['64GB', '128GB'] },
  ],
  Samsung: [
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', baseValuationPKR: 280000, availableStorage: ['256GB', '512GB'] },
    { brand: 'Samsung', model: 'Galaxy S24 / S24+', baseValuationPKR: 185000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy S23 Ultra', baseValuationPKR: 215000, availableStorage: ['256GB', '512GB'] },
    { brand: 'Samsung', model: 'Galaxy S23 / S23 FE', baseValuationPKR: 135000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy S22 Ultra', baseValuationPKR: 155000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy S22', baseValuationPKR: 95000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy S21 Ultra', baseValuationPKR: 110000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy S21 FE / S21', baseValuationPKR: 70000, availableStorage: ['128GB'] },
    { brand: 'Samsung', model: 'Galaxy S20 / Note 20 Ultra', baseValuationPKR: 65000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy A54 / A55', baseValuationPKR: 75000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Samsung', model: 'Galaxy A34 / A35', baseValuationPKR: 55000, availableStorage: ['128GB'] },
    { brand: 'Samsung', model: 'Galaxy A14 / A15 / A24', baseValuationPKR: 35000, availableStorage: ['64GB', '128GB'] },
  ],
  'Xiaomi / Redmi': [
    { brand: 'Xiaomi / Redmi', model: 'Xiaomi 13T / 13T Pro', baseValuationPKR: 115000, availableStorage: ['256GB', '512GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Redmi Note 13 Pro+ / Pro', baseValuationPKR: 65000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Redmi Note 13 / 13 4G', baseValuationPKR: 38000, availableStorage: ['128GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Redmi Note 12 Pro / 12', baseValuationPKR: 35000, availableStorage: ['128GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Poco X6 Pro / F5', baseValuationPKR: 75000, availableStorage: ['256GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Poco X5 / X3 Pro', baseValuationPKR: 35000, availableStorage: ['128GB'] },
    { brand: 'Xiaomi / Redmi', model: 'Redmi 12 / 13C', baseValuationPKR: 26000, availableStorage: ['64GB', '128GB'] },
  ],
  Infinix: [
    { brand: 'Infinix', model: 'Infinix Zero 30 5G / Ultra', baseValuationPKR: 58000, availableStorage: ['256GB'] },
    { brand: 'Infinix', model: 'Infinix Note 40 Pro / 40', baseValuationPKR: 48000, availableStorage: ['256GB'] },
    { brand: 'Infinix', model: 'Infinix Note 30 Pro / 30', baseValuationPKR: 36000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Infinix', model: 'Infinix Hot 40 Pro / 40', baseValuationPKR: 30000, availableStorage: ['128GB'] },
    { brand: 'Infinix', model: 'Infinix Hot 30 / Smart 8', baseValuationPKR: 22000, availableStorage: ['64GB', '128GB'] },
  ],
  Tecno: [
    { brand: 'Tecno', model: 'Tecno Camon 30 Premier / Pro', baseValuationPKR: 65000, availableStorage: ['256GB', '512GB'] },
    { brand: 'Tecno', model: 'Tecno Camon 20 Pro / 20', baseValuationPKR: 38000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Tecno', model: 'Tecno Spark 20 Pro+ / 20', baseValuationPKR: 32000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Tecno', model: 'Tecno Pova 5 / 6 Pro', baseValuationPKR: 38000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Tecno', model: 'Tecno Pop 8 / Spark Go', baseValuationPKR: 19000, availableStorage: ['64GB'] },
  ],
  Realme: [
    { brand: 'Realme', model: 'Realme 12 Pro+ / 12', baseValuationPKR: 75000, availableStorage: ['256GB', '512GB'] },
    { brand: 'Realme', model: 'Realme 11 Pro / 11', baseValuationPKR: 52000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Realme', model: 'Realme C67 / C55', baseValuationPKR: 32000, availableStorage: ['128GB'] },
    { brand: 'Realme', model: 'Realme C53 / C51', baseValuationPKR: 24000, availableStorage: ['64GB', '128GB'] },
  ],
  Vivo: [
    { brand: 'Vivo', model: 'Vivo V30 / V30e', baseValuationPKR: 85000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Vivo', model: 'Vivo V29 / V29e', baseValuationPKR: 65000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Vivo', model: 'Vivo Y100 / Y27', baseValuationPKR: 38000, availableStorage: ['128GB'] },
    { brand: 'Vivo', model: 'Vivo Y17s / Y02t', baseValuationPKR: 24000, availableStorage: ['64GB', '128GB'] },
  ],
  Oppo: [
    { brand: 'Oppo', model: 'Oppo Reno 11 / 11F', baseValuationPKR: 78000, availableStorage: ['256GB'] },
    { brand: 'Oppo', model: 'Oppo Reno 10 / 8T', baseValuationPKR: 55000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Oppo', model: 'Oppo A78 / A58', baseValuationPKR: 36000, availableStorage: ['128GB'] },
    { brand: 'Oppo', model: 'Oppo A38 / A18', baseValuationPKR: 25000, availableStorage: ['64GB', '128GB'] },
  ],
  OnePlus: [
    { brand: 'OnePlus', model: 'OnePlus 12 / 12R', baseValuationPKR: 165000, availableStorage: ['256GB', '512GB'] },
    { brand: 'OnePlus', model: 'OnePlus 11 / 11R', baseValuationPKR: 115000, availableStorage: ['128GB', '256GB'] },
    { brand: 'OnePlus', model: 'OnePlus 10 Pro / 9 Pro', baseValuationPKR: 75000, availableStorage: ['128GB', '256GB'] },
    { brand: 'OnePlus', model: 'OnePlus 8T / 8', baseValuationPKR: 45000, availableStorage: ['128GB'] },
  ],
  'Google Pixel': [
    { brand: 'Google Pixel', model: 'Pixel 8 Pro / 8', baseValuationPKR: 155000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Google Pixel', model: 'Pixel 7 Pro / 7 / 7a', baseValuationPKR: 95000, availableStorage: ['128GB', '256GB'] },
    { brand: 'Google Pixel', model: 'Pixel 6 Pro / 6 / 6a', baseValuationPKR: 58000, availableStorage: ['128GB'] },
    { brand: 'Google Pixel', model: 'Pixel 5 / 4 XL', baseValuationPKR: 35000, availableStorage: ['128GB'] },
  ],
};

export const CONDITIONS = [
  {
    id: 'mint',
    label: 'Mint / Flawless (10/10)',
    description: 'Original box + accessories, no scratches or dents, 100% functional.',
    multiplier: 1.0,
  },
  {
    id: 'good',
    label: 'Good Condition (8-9/10)',
    description: 'Minor micro-scratches on back/edges, screen clean, battery healthy.',
    multiplier: 0.85,
  },
  {
    id: 'fair',
    label: 'Fair Condition (6-7/10)',
    description: 'Visible scratches or minor edge dents, screen working without cracks.',
    multiplier: 0.68,
  },
  {
    id: 'broken',
    label: 'Cracked Glass / Back Damaged',
    description: 'Cracked outer glass or back panel, but motherboard & touch operate.',
    multiplier: 0.45,
  },
];
