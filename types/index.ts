export interface SmartphoneColor {
  name: string;
  hex: string;
  image: string;
  inStock?: boolean;
  stockQty?: number;
}

export interface SmartphoneVariant {
  id: string;
  storage: string;
  ram: string;
  pricePKR: number;
  originalPricePKR: number;
  inStock: boolean;
  stockQty?: number;
}

export interface SmartphoneSpecs {
  screen: string;
  refreshRate: string;
  displayType: string;
  processor: string;
  chipsetBrand: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  charging: string;
  os: string;
  network: string;
  security: string;
  weight: string;
  waterResistance?: string;
  ptaStatus: 'PTA Approved' | 'Non-PTA';
  warranty: string;
}

export interface Smartphone {
  id: string;
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  basePricePKR: number;
  originalPricePKR: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQty?: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  colors: SmartphoneColor[];
  variants: SmartphoneVariant[];
  colorStockMap?: Record<string, { inStock: boolean; stockQty: number }>;
  specs: SmartphoneSpecs;
  keyHighlights: {
    display: string;
    camera: string;
    battery: string;
    processor: string;
    charging: string;
  };
}

export interface FilterState {
  searchQuery: string;
  selectedBrands: string[];
  priceRange: [number, number];
  selectedRam: string[];
  selectedStorage: string[];
  ptaApprovedOnly: boolean;
  inStockOnly: boolean;
  sortBy: 'popularity' | 'price-asc' | 'price-desc' | 'discount' | 'rating';
  specFilter?: string;
}

export interface CartItem {
  phone: Smartphone;
  selectedColor: SmartphoneColor;
  selectedVariant: SmartphoneVariant;
  quantity: number;
}
