'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SMARTPHONES, BRANDS, formatPKR } from '@/data/smartphones';
import { Smartphone, FilterState, CartItem, SmartphoneVariant, SmartphoneColor } from '@/types';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FilterSidebar } from '@/components/FilterSidebar';
import { PhoneCard } from '@/components/PhoneCard';
import { ComparisonDock } from '@/components/ComparisonDock';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickPurchaseModal } from '@/components/QuickPurchaseModal';
import { Footer } from '@/components/Footer';
import { FlashSaleCountdown } from '@/components/FlashSaleCountdown';
import { sanitizeText } from '@/lib/security';
import {
  CatalogBannerS24Ultra,
  CatalogBannerDualCards,
  CatalogBannerBankEMI,
  CatalogBannerOpenParcel,
} from '@/components/PromotionalBanners';
import {
  ShieldCheck,
  PackageCheck,
  Award,
  Filter,
  CheckCircle,
  Truck,
  PhoneCall,
  Mail,
  X,
  CreditCard,
  Banknote,
  Building,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Flame,
  Zap,
  Sparkles,
  Smartphone as PhoneIcon,
  Clock,
  MessageSquare,
} from 'lucide-react';

export default function Home() {
  // Master Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedBrands: [],
    priceRange: [0, 700000],
    selectedRam: [],
    selectedStorage: [],
    ptaApprovedOnly: false,
    inStockOnly: false,
    sortBy: 'popularity',
  });

  // Global compare & cart states
  const [comparingPhones, setComparingPhones] = useState<Smartphone[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<string | null>(null);

  // Quick Purchase Form Modal state
  const [quickBuyPhone, setQuickBuyPhone] = useState<Smartphone | null>(null);
  const [quickBuyVariant, setQuickBuyVariant] = useState<SmartphoneVariant | null>(null);
  const [quickBuyColor, setQuickBuyColor] = useState<SmartphoneColor | null>(null);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Read URL query params securely on client load with input sanitization (?brand=Samsung, ?search=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const brandParam = sanitizeText(params.get('brand') || '', 40);
      const searchParam = sanitizeText(params.get('search') || '', 100);
      if (brandParam && BRANDS.includes(brandParam)) {
        setFilters((prev) => ({
          ...prev,
          selectedBrands: brandParam === 'All Brands' ? [] : [brandParam],
        }));
      }
      if (searchParam) {
        setFilters((prev) => ({
          ...prev,
          searchQuery: searchParam,
        }));
      }
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [
    filters.searchQuery,
    filters.selectedBrands,
    filters.priceRange,
    filters.selectedRam,
    filters.selectedStorage,
    filters.ptaApprovedOnly,
    filters.inStockOnly,
    filters.sortBy,
  ]);

  // Flash deals calculation (top 4 discount items)
  const flashSalePhones = useMemo(() => {
    return [...SMARTPHONES]
      .filter((p) => p.inStock && p.discountPercent >= 20)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 4);
  }, []);

  // Filter & Sort Logic
  const filteredPhones = useMemo(() => {
    return SMARTPHONES.filter((phone) => {
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = phone.name.toLowerCase().includes(q);
        const matchesBrand = phone.brand.toLowerCase().includes(q);
        const matchesChip = phone.specs.chipsetBrand?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesChip) return false;
      }

      // Brand
      if (filters.selectedBrands.length > 0) {
        if (!filters.selectedBrands.includes(phone.brand)) return false;
      }

      // Price Range
      if (
        phone.basePricePKR < filters.priceRange[0] ||
        phone.basePricePKR > filters.priceRange[1]
      ) {
        return false;
      }

      // PTA Approved Only
      if (filters.ptaApprovedOnly && phone.specs.ptaStatus !== 'PTA Approved') {
        return false;
      }

      // In Stock Only
      if (filters.inStockOnly && !phone.inStock) {
        return false;
      }

      // RAM
      if (filters.selectedRam.length > 0) {
        const hasMatchingRam = phone.variants.some((v) =>
          filters.selectedRam.some((ram) => v.ram.includes(ram))
        );
        if (!hasMatchingRam) return false;
      }

      // Storage
      if (filters.selectedStorage.length > 0) {
        const hasMatchingStorage = phone.variants.some((v) =>
          filters.selectedStorage.some((st) => v.storage.includes(st))
        );
        if (!hasMatchingStorage) return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize in-stock phones: Available phones show up first on the front page,
      // and unavailable phones are moved back to later pages.
      if (a.inStock !== b.inStock) {
        return a.inStock ? -1 : 1;
      }
      if (filters.sortBy === 'price-asc') return a.basePricePKR - b.basePricePKR;
      if (filters.sortBy === 'price-desc') return b.basePricePKR - a.basePricePKR;
      if (filters.sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      // Default: popularity
      return b.reviewCount - a.reviewCount;
    });
  }, [filters]);

  // Currently displayed slice
  const displayedPhones = filteredPhones.slice(0, visibleCount);
  const inStockCount = useMemo(() => filteredPhones.filter((p) => p.inStock).length, [filteredPhones]);

  // Cart operations (Memoized with useCallback for 60fps rendering performance)
  const handleAddToCart = useCallback((
    phone: Smartphone,
    variant: SmartphoneVariant,
    color: SmartphoneColor
  ) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.phone.id === phone.id &&
          item.selectedVariant.id === variant.id &&
          item.selectedColor.name === color.name
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          phone,
          selectedColor: color,
          selectedVariant: variant,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const handleQuickBuy = useCallback((
    phone: Smartphone,
    variant: SmartphoneVariant,
    color: SmartphoneColor
  ) => {
    setQuickBuyPhone(phone);
    setQuickBuyVariant(variant);
    setQuickBuyColor(color);
    setIsQuickBuyOpen(true);
  }, []);

  // Compare operations (Memoized)
  const handleToggleCompare = useCallback((phone: Smartphone) => {
    setComparingPhones((prev) => {
      const exists = prev.find((p) => p.id === phone.id);
      if (exists) {
        return prev.filter((p) => p.id !== phone.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 mobiles at a time.');
        return prev;
      }
      return [...prev, phone];
    });
  }, []);

  const handleSelectBrand = useCallback((brand: string) => {
    if (brand === 'All Brands') {
      setFilters((prev) => ({ ...prev, selectedBrands: [] }));
    } else {
      setFilters((prev) => ({ ...prev, selectedBrands: [brand] }));
    }
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleClearFilter = (key: string, val?: string) => {
    if (key === 'brand' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedBrands: prev.selectedBrands.filter((b) => b !== val),
      }));
    } else if (key === 'search') {
      setFilters((prev) => ({ ...prev, searchQuery: '' }));
    } else if (key === 'ram' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedRam: prev.selectedRam.filter((r) => r !== val),
      }));
    } else if (key === 'storage' && val) {
      setFilters((prev) => ({
        ...prev,
        selectedStorage: prev.selectedStorage.filter((s) => s !== val),
      }));
    } else if (key === 'pta') {
      setFilters((prev) => ({ ...prev, ptaApprovedOnly: false }));
    } else if (key === 'inStock') {
      setFilters((prev) => ({ ...prev, inStockOnly: false }));
    } else if (key === 'price') {
      setFilters((prev) => ({ ...prev, priceRange: [0, 700000] }));
    }
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedBrands.length > 0 ||
    filters.selectedRam.length > 0 ||
    filters.selectedStorage.length > 0 ||
    filters.ptaApprovedOnly ||
    filters.inStockOnly ||
    filters.priceRange[1] < 700000;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Google Stitch Kinetic Navbar */}
      <Navbar
        compareCount={comparingPhones.length}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectBrand={handleSelectBrand}
        onSearch={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        activeBrand={
          filters.selectedBrands.length === 1
            ? filters.selectedBrands[0]
            : 'All Brands'
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Hero Banner Showcase */}
        <HeroBanner
          onQuickFilter={handleSelectBrand}
          onOpenEMIModal={() => setActivePolicyModal('installments')}
        />

        {/* Google Stitch Flash Deals Bar with Live Countdown Timer */}
        <section className="mt-8 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Subtle decorative glowing background accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 animate-soft-bounce">
                <Flame className="w-5 h-5 fill-rose-500 stroke-rose-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight font-sans">
                    Flash Deals &amp; Price Drops
                  </h3>
                  <span className="relative flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    Live Now
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified distributor prices with maximum savings across Pakistan.
                </p>
              </div>
            </div>

            {/* Live Countdown Pill (Isolated component prevents full-page re-renders) */}
            <FlashSaleCountdown />
          </div>

          {/* Flash Deal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {flashSalePhones.map((phone) => (
              <PhoneCard
                key={phone.id}
                phone={phone}
                isComparing={comparingPhones.some((p) => p.id === phone.id)}
                onToggleCompare={handleToggleCompare}
                onAddToCart={handleAddToCart}
                onQuickBuy={handleQuickBuy}
              />
            ))}
          </div>
        </section>

        {/* Main Catalog Section */}
        <section id="catalog" className="pt-10">
          {/* Section Header & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
                  Mobile Phones Catalog
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {filteredPhones.length} Verified Mobiles
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {inStockCount} In Stock &amp; Ready to Order
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PTA DIRBS approved phones with brand warranties, 0% EMI installments, and Open-Parcel COD.
              </p>
            </div>

            {/* Controls: Mobile Filters Trigger & Sort By */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-slate-950 text-white cursor-pointer shadow-sm"
              >
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Filters ({filters.selectedBrands.length + (filters.ptaApprovedOnly ? 1 : 0)})</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                  Sort By:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as FilterState['sortBy'],
                    }))
                  }
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 py-3.5 border-b border-slate-200">
              <span className="text-xs text-slate-400 font-bold mr-1">Active:</span>

              {filters.searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Search: &quot;{filters.searchQuery}&quot;
                  <button onClick={() => handleClearFilter('search')} className="hover:text-cyan-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.selectedBrands.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  {b}
                  <button onClick={() => handleClearFilter('brand', b)} className="hover:text-rose-600 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.priceRange[1] < 700000 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  Up to {formatPKR(filters.priceRange[1])}
                  <button onClick={() => handleClearFilter('price')} className="hover:text-rose-600 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.selectedRam.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  RAM: {r}
                  <button onClick={() => handleClearFilter('ram', r)} className="hover:text-rose-600 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.selectedStorage.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  Storage: {s}
                  <button onClick={() => handleClearFilter('storage', s)} className="hover:text-rose-600 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.ptaApprovedOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PTA Approved Only
                  <button onClick={() => handleClearFilter('pta')} className="hover:text-emerald-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  In Stock Only
                  <button onClick={() => handleClearFilter('inStock')} className="hover:text-cyan-950 p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    selectedBrands: [],
                    priceRange: [0, 700000],
                    selectedRam: [],
                    selectedStorage: [],
                    ptaApprovedOnly: false,
                    inStockOnly: false,
                    sortBy: 'popularity',
                  })
                }
                className="text-xs text-rose-600 hover:underline font-bold ml-auto cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog Layout: Sidebar + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            {/* Filter Sidebar */}
            <div
              className={`lg:col-span-3 ${
                isMobileFiltersOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                totalCount={SMARTPHONES.length}
                filteredCount={filteredPhones.length}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-9">
              {filteredPhones.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {displayedPhones.map((phone, index) => (
                      <React.Fragment key={phone.id}>
                        {/* Section Divider when list transitions to out-of-stock items */}
                        {!phone.inStock && (index === 0 || displayedPhones[index - 1]?.inStock) && (
                          <div className="col-span-full my-6 p-4 sm:p-5 rounded-3xl bg-slate-100 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 text-base font-bold shadow-xs">
                                📦
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-950">
                                  Currently Out-of-Stock Models (Archive &amp; Next Batch)
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  The models below are temporarily out of stock. All in-stock models are prioritized above.
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-[11px] font-bold border border-slate-200">
                              Subsequent Pages
                            </span>
                          </div>
                        )}
                        <PhoneCard
                          phone={phone}
                          isComparing={comparingPhones.some((p) => p.id === phone.id)}
                          onToggleCompare={handleToggleCompare}
                          onAddToCart={handleAddToCart}
                          onQuickBuy={handleQuickBuy}
                        />
                        {/* Banner 1: S24 Ultra & Galaxy AI Spotlight */}
                        {index === 5 && (
                          <CatalogBannerS24Ultra onSelectBrand={handleSelectBrand} />
                        )}
                        {/* Banner 2: Dual Split Promo Cards (Budget Kings & Keypad Classics) */}
                        {index === 11 && (
                          <CatalogBannerDualCards onSelectBrand={handleSelectBrand} />
                        )}
                        {/* Banner 3: 0% Markup Bank EMI Installments */}
                        {index === 17 && (
                          <CatalogBannerBankEMI
                            onOpenEMIModal={() => setActivePolicyModal('installments')}
                          />
                        )}
                        {/* Banner 4: Open-Parcel Cash on Delivery Guarantee */}
                        {index === 23 && (
                          <CatalogBannerOpenParcel />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Fallback guarantee banner for short lists */}
                  {displayedPhones.length < 6 && (
                    <div className="mt-6">
                      <CatalogBannerOpenParcel />
                    </div>
                  )}

                  {/* Load More Pagination Bar */}
                  {filteredPhones.length > visibleCount && (
                    <div className="mt-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Front page: {Math.min(displayedPhones.length, inStockCount)} Available In-Stock Mobiles
                        </span>
                        <span>
                          Showing <strong className="text-slate-950 font-bold">{displayedPhones.length}</strong> of{' '}
                          <strong className="text-slate-950 font-bold">{filteredPhones.length}</strong> mobile phones
                        </span>
                      </div>
                      <div className="w-full max-w-xs mx-auto bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full transition-all duration-300"
                          style={{
                            width: `${(displayedPhones.length / filteredPhones.length) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 24)}
                          className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-cyan-500/20 cursor-pointer btn-press btn-shimmer"
                        >
                          Load Next 24 Mobiles (Page {Math.floor(displayedPhones.length / 24) + 1})
                        </button>
                        <button
                          onClick={() => setVisibleCount(filteredPhones.length)}
                          className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold cursor-pointer border border-slate-200 btn-press"
                        >
                          View All ({filteredPhones.length})
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 animate-soft-bounce">
                    <Filter className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">
                    No mobile phones match these criteria
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Try adjusting your price slider or resetting brand and RAM filters.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        searchQuery: '',
                        selectedBrands: [],
                        priceRange: [0, 700000],
                        selectedRam: [],
                        selectedStorage: [],
                        ptaApprovedOnly: false,
                        inStockOnly: false,
                        sortBy: 'popularity',
                      })
                    }
                    className="mt-4 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-colors cursor-pointer btn-press"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Buy from VoltPhone Section */}
        <section className="mt-16 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
              Why Pakistani Buyers Choose VoltPhone PK
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Online mobile shopping in Pakistan requires rock-solid confidence. Here is how we protect your money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => setActivePolicyModal('open-parcel')}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 cursor-pointer card-hover-fx group"
            >
              <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <PackageCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center justify-between font-sans">
                <span className="group-hover:text-cyan-700 transition-colors">Open-Parcel Delivery</span>
                <ArrowRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When the rider arrives at your doorstep, inspect the factory seals, serial number, and box condition before paying cash. 100% scam-free.
              </p>
            </div>

            <div
              onClick={() => setActivePolicyModal('pta-guide')}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 cursor-pointer card-hover-fx group"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center justify-between font-sans">
                <span className="group-hover:text-emerald-700 transition-colors">100% Official PTA Tax Paid</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every mobile is registered with Pakistan Telecommunication Authority (DIRBS) with full customs duties cleared for lifetime SIM validity.
              </p>
            </div>

            <div
              onClick={() => setActivePolicyModal('warranty')}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 cursor-pointer card-hover-fx group"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center justify-between font-sans">
                <span className="group-hover:text-indigo-700 transition-colors">Authorized Brand Warranty</span>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official service center support across Karachi, Lahore, Islamabad, Faisalabad, and Multan (Samsung, Apple Mercantile, Carlcare, Airlink).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Comparison Drawer */}
      <ComparisonDock
        comparingPhones={comparingPhones}
        isOpenModal={isCompareModalOpen}
        onToggleModal={setIsCompareModalOpen}
        onRemovePhone={(id) =>
          setComparingPhones((prev) => prev.filter((p) => p.id !== id))
        }
        onClearAll={() => setComparingPhones([])}
        onSelectForCart={(phone) => {
          handleAddToCart(phone, phone.variants[0], phone.colors[0]);
        }}
      />

      {/* Slide-over Cart & Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(idx, newQty) =>
          setCartItems((prev) => {
            if (newQty <= 0) return prev.filter((_, i) => i !== idx);
            return prev.map((item, i) =>
              i === idx ? { ...item, quantity: newQty } : item
            );
          })
        }
        onRemoveItem={(idx) =>
          setCartItems((prev) => prev.filter((_, i) => i !== idx))
        }
        onClearCart={() => setCartItems([])}
      />

      {/* Quick Purchase One-Click Order Modal */}
      <QuickPurchaseModal
        phone={quickBuyPhone}
        selectedVariant={quickBuyVariant}
        selectedColor={quickBuyColor}
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />

      {/* Footer */}
      <Footer />

      {/* Interactive Trust & Policies Informational Modal */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {activePolicyModal === 'open-parcel' && <PackageCheck className="w-5 h-5 text-cyan-600" />}
                {activePolicyModal === 'pta-guide' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                {activePolicyModal === 'warranty' && <Award className="w-5 h-5 text-indigo-600" />}
                {activePolicyModal === 'cod-terms' && <Truck className="w-5 h-5 text-amber-600" />}
                {activePolicyModal === 'installments' && <CreditCard className="w-5 h-5 text-purple-600" />}
                <h3 className="font-bold text-slate-950 text-base font-sans">
                  {activePolicyModal === 'open-parcel' && 'Open-Parcel Delivery Policy'}
                  {activePolicyModal === 'pta-guide' && 'PTA DIRBS Verification Guide'}
                  {activePolicyModal === 'warranty' && 'Official 1-Year Brand Warranty'}
                  {activePolicyModal === 'cod-terms' && 'Cash on Delivery (COD) Terms'}
                  {activePolicyModal === 'installments' && '0% Markup Installment Plans'}
                </h3>
              </div>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              {activePolicyModal === 'open-parcel' && (
                <>
                  <p className="font-bold text-slate-900">
                    Inspect before you pay! Zero risk, zero courier fraud.
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Rider brings the package to your doorstep.</li>
                    <li>Rider opens the flyer in front of you.</li>
                    <li>Verify the handset model, color, and box seal condition.</li>
                    <li>Pay cash or scan QR code only after you are 100% satisfied.</li>
                  </ol>
                  <p className="text-[11px] text-slate-400">
                    If anything is damaged or incorrect, hand it right back to the courier at zero cost to you.
                  </p>
                </>
              )}

              {activePolicyModal === 'pta-guide' && (
                <>
                  <p className="font-bold text-slate-900">
                    Every mobile phone in our 222-model catalog is 100% customs-duty cleared and PTA DIRBS approved.
                  </p>
                  <div className="bg-slate-100 p-3 rounded-2xl space-y-1 font-mono text-[11px] text-slate-800">
                    <div>1. Dial *#06# on the phone keypad to view IMEI</div>
                    <div>2. Send 15-digit IMEI via SMS to 8484</div>
                    <div>3. Or visit https://dirbs.pta.gov.pk</div>
                  </div>
                  <p>
                    Your status will read: <span className="font-bold text-emerald-700">&quot;IMEI is Compliant (PTA Approved)&quot;</span>. Never worry about sudden SIM blockage.
                  </p>
                </>
              )}

              {activePolicyModal === 'warranty' && (
                <>
                  <p className="font-bold text-slate-900">
                    Authorized brand service center network across Pakistan:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Samsung:</strong> Official Samsung Care Centers nationwide.</li>
                    <li><strong>Apple:</strong> Mercantile &amp; FutureTech Authorized Centers.</li>
                    <li><strong>Xiaomi / Poco / Redmi:</strong> Airlink &amp; Smart Zone service hubs.</li>
                    <li><strong>Tecno &amp; Infinix:</strong> Carlcare service network.</li>
                    <li><strong>Vivo &amp; Oppo:</strong> Official Brand Centers in all major cities.</li>
                    <li><strong>Nokia &amp; Itel:</strong> HMD Global and authorized nationwide centers.</li>
                  </ul>
                  <p className="text-[11px] text-slate-400">
                    Your VoltPhone invoice serves as your valid proof of purchase for all warranty claims.
                  </p>
                </>
              )}

              {activePolicyModal === 'installments' && (
                <>
                  <p className="font-bold text-slate-900">
                    0% Markup Installment Plans (Easy Monthly Installments):
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Available on credit cards of: <strong>Bank Alfalah, Meezan Bank, Faysal Bank, and Silkbank</strong>.</li>
                    <li>Select 3, 6, or 12-month tenure during checkout.</li>
                    <li>Zero hidden fees, 100% Shariah-compliant markup arrangements.</li>
                  </ul>
                </>
              )}
            </div>

            <button
              onClick={() => setActivePolicyModal(null)}
              className="w-full py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-cyan-600 transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
      {/* Floating Live WhatsApp & Helpline Support Assistant */}
      <aside aria-label="Quick WhatsApp Helpline" className="fixed bottom-6 right-6 z-40 flex items-center">
        <a
          href="https://wa.me/923135221200?text=Hi%20VoltPhone%20PK!%20I%20am%20looking%20for%20a%20smartphone%20with%20Open-Parcel%20COD"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 btn-press card-hover-fx group cursor-pointer border border-emerald-400/40"
          title="Direct WhatsApp Helpline: +92 313 5221200 - Real Mobile Specialists (Mon-Sat 9AM-10PM)"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <MessageSquare className="w-4 h-4 fill-white/20 group-hover:scale-115 transition-transform duration-200" />
          <span className="font-sans tracking-tight">WhatsApp (+92 313 5221200)</span>
        </a>
      </aside>
    </div>
  );
}
