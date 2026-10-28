'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SMARTPHONES, getPhoneBySlug, formatPKR } from '@/data/smartphones';
import { Smartphone, SmartphoneColor, SmartphoneVariant, CartItem } from '@/types';
import { PhoneImageWithFallback } from '@/components/PhoneImageWithFallback';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickPurchaseModal } from '@/components/QuickPurchaseModal';
import { ComparisonDock } from '@/components/ComparisonDock';
import { Footer } from '@/components/Footer';
import { sanitizeText } from '@/lib/security';
import {
  ShieldCheck,
  PackageCheck,
  Award,
  Truck,
  Star,
  Check,
  Layers,
  ShoppingCart,
  Zap,
  ArrowLeft,
  Calendar,
  CreditCard,
  Cpu,
  Battery,
  Camera,
  CheckCircle2,
  MessageSquare,
  Phone,
} from 'lucide-react';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawSlug = (params?.slug as string) || '';
  const slug = sanitizeText(rawSlug, 100);
  const [phone, setPhone] = useState<Smartphone>(() => getPhoneBySlug(slug) || SMARTPHONES[0]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const found = data.products.find((p: Smartphone) => p.slug === slug || p.id === slug);
          if (found) {
            setPhone(found);
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  // Find first in-stock color & variant if available
  const initialColor = phone?.colors.find((c) => {
    if (c.inStock === false) return false;
    if (phone.colorStockMap && phone.colorStockMap[c.name] && !phone.colorStockMap[c.name].inStock) return false;
    return true;
  }) || phone?.colors.find((c) => c.inStock !== false) || phone?.colors[0];

  const initialVariant = phone?.variants.find((v) => v.inStock) || phone?.variants[0];

  // States
  const [selectedColor, setSelectedColor] = useState<SmartphoneColor>(
    initialColor
  );
  const [selectedVariant, setSelectedVariant] = useState<SmartphoneVariant>(
    initialVariant
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [comparingPhones, setComparingPhones] = useState<Smartphone[]>([]);
  const [selectedTenure, setSelectedTenure] = useState<number>(6); // installment months
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

  const isInitialMount = useRef(true);

  // Synchronize cart with localStorage on mount & listen to storage/sync events
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voltphone_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(parsed);
        }
      }
    } catch {
      // ignore
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'voltphone_cart' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Persist cart to localStorage on updates (survives reloads and page changes)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem('voltphone_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    if (phone) {
      const inStockC = phone.colors.find((c) => {
        if (c.inStock === false) return false;
        if (phone.colorStockMap && phone.colorStockMap[c.name] && !phone.colorStockMap[c.name].inStock) return false;
        return true;
      }) || phone.colors.find((c) => c.inStock !== false) || phone.colors[0];
      const inStockV = phone.variants.find((v) => v.inStock) || phone.variants[0];
      setSelectedColor(inStockC);
      setSelectedVariant(inStockV);
    }
  }, [phone?.id]);

  if (!phone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold">Smartphone Not Found</h1>
        <p className="text-neutral-500 text-xs mt-2">
          The requested device model does not exist in our catalog.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isColorInStock = selectedColor?.inStock ?? phone.inStock;
  const isVariantInStock = selectedVariant?.inStock ?? phone.inStock;
  const isPhoneInStock = phone.inStock;
  const isSelectionInStock = Boolean(isPhoneInStock && isColorInStock && isVariantInStock);
  const currentStockQty = selectedColor?.stockQty || selectedVariant?.stockQty || phone.stockQty || 0;

  const currentPrice = selectedVariant?.pricePKR || phone.basePricePKR;
  const currentOriginalPrice =
    selectedVariant?.originalPricePKR || phone.originalPricePKR;
  const savings = currentOriginalPrice - currentPrice;
  const monthlyInstallment = Math.round(currentPrice / selectedTenure);

  const handleAddToCart = () => {
    if (!isSelectionInStock) {
      alert(`${selectedColor.name} (${selectedVariant.ram}/${selectedVariant.storage}) is currently Out of Stock.`);
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.phone.id === phone.id &&
          i.selectedVariant.id === selectedVariant.id &&
          i.selectedColor.name === selectedColor.name
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          phone,
          selectedColor,
          selectedVariant,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleToggleCompare = (item: Smartphone) => {
    setComparingPhones((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.filter((p) => p.id !== item.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 smartphones at a time.');
        return prev;
      }
      return [...prev, item];
    });
  };

  const similarPhones = SMARTPHONES.filter(
    (p) => p.id !== phone.id && (p.brand === phone.brand || Math.abs(p.basePricePKR - phone.basePricePKR) < 60000)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <Navbar
        compareCount={comparingPhones.length}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        activeBrand={phone.brand}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Phones</span>
          </Link>
          <span>/</span>
          <Link
            href={`/?brand=${encodeURIComponent(phone.brand)}#catalog`}
            className="hover:text-blue-600 font-semibold transition-colors text-neutral-600 dark:text-neutral-400"
          >
            {phone.brand}
          </Link>
          <span>/</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
            {phone.name}
          </span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media & Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full h-96 sm:h-[450px] bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center justify-center">
              <PhoneImageWithFallback
                src={selectedColor.image}
                alt={`${phone.name} - ${selectedColor.name}`}
                brand={phone.brand}
                className="w-full h-full"
              />

              {phone.discountPercent > 0 && (
                <span className="absolute top-5 left-5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                  -{phone.discountPercent}% OFF
                </span>
              )}

              <button
                onClick={() => handleToggleCompare(phone)}
                className={`absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  comparingPhones.some((p) => p.id === phone.id)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {comparingPhones.some((p) => p.id === phone.id)
                    ? 'In Compare'
                    : 'Compare Spec'}
                </span>
              </button>
            </div>

            {/* Color Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {phone.colors.map((color) => {
                const isSelected = selectedColor.name === color.name;
                const isColInStock = color.inStock ?? true;
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`relative flex flex-col items-center p-2 rounded-2xl bg-white dark:bg-neutral-900 border transition-all ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                    } ${!isColInStock ? 'opacity-55' : ''}`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-700 mb-1.5 relative"
                      style={{ backgroundColor: color.hex }}
                    >
                      {!isColInStock && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-rose-500 font-bold">
                          ×
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">
                      {color.name}
                    </span>
                    {!isColInStock && (
                      <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                        Out of Stock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Info, Variants & Buy Box */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {phone.brand}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% PTA Approved (DIRBS Verified)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
                {phone.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {phone.tagline}
              </p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span>{phone.rating}</span>
                </div>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-xs text-neutral-500">
                  {phone.reviewCount} Verified Customer Reviews
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                {isSelectionInStock ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentStockQty > 0 && currentStockQty <= 10
                      ? `In Stock (Only ${currentStockQty} units left)`
                      : 'In Stock & Ready for Dispatch'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Out of Stock ({selectedColor.name})
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-neutral-950 dark:text-white">
                  {formatPKR(currentPrice)}
                </span>
                {currentOriginalPrice > currentPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPKR(currentOriginalPrice)}
                  </span>
                )}
              </div>

              {savings > 0 && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {`⚡ VoltPhone Special: You save ${formatPKR(savings)} with Free Shipping!`}
                </div>
              )}
            </div>

            {/* Variant / Storage Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
                <span>Select RAM & Storage Variant</span>
                <span className="text-neutral-900 dark:text-white normal-case font-semibold">
                  {selectedVariant.ram} / {selectedVariant.storage}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {phone.variants.map((variant) => {
                  const isSelected = selectedVariant.id === variant.id;
                  const isVarInStock = variant.inStock ?? true;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 bg-white dark:bg-neutral-900'
                      } ${!isVarInStock ? 'opacity-55' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-900 dark:text-white">
                          {variant.ram} / {variant.storage}
                        </span>
                        {!isVarInStock && (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                            OOS
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        {formatPKR(variant.pricePKR)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Installment Breakdown Box */}
            <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>0% Markup Monthly Installment</span>
                </div>
                <span className="text-xs font-black text-blue-600">
                  {formatPKR(monthlyInstallment)} / mo
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[3, 6, 12].map((tenure) => (
                  <button
                    key={tenure}
                    onClick={() => setSelectedTenure(tenure)}
                    className={`flex-1 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      selectedTenure === tenure
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {tenure} Months
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-500">
                Available with Bank Alfalah, Faysal Bank, Silkbank, and Meezan cards.
              </p>
            </div>

            {/* Stock Alert Warning if Out of Stock */}
            {!isSelectionInStock && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <span className="text-base">⚠️</span>
                <div>
                  <div className="font-bold">Currently Unavailable to Order:</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    {!isPhoneInStock
                      ? 'This phone model is completely out of stock across all colors.'
                      : !isColorInStock
                      ? `The ${selectedColor.name} color is sold out. Please choose an in-stock color.`
                      : 'This storage/RAM configuration is sold out. Please select another variant.'}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!isSelectionInStock}
                className={`py-3.5 px-4 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 ${
                  isSelectionInStock
                    ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-neutral-700 shadow-none'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isSelectionInStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => {
                  if (isSelectionInStock) {
                    setIsQuickBuyOpen(true);
                  }
                }}
                disabled={!isSelectionInStock}
                className={`py-3.5 px-4 rounded-2xl text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSelectionInStock
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-neutral-700 shadow-none'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isSelectionInStock ? 'Buy Now (COD)' : 'Unavailable'}</span>
              </button>
            </div>

            {/* Direct WhatsApp Instant Order Button */}
            <a
              href={`https://wa.me/923135221200?text=Hi%20VoltPhone%20PK!%20I%20want%20to%20order%20the%20${encodeURIComponent(phone.name)}%20(${encodeURIComponent(selectedColor.name)},%20${encodeURIComponent(selectedVariant.ram)}/${encodeURIComponent(selectedVariant.storage)})%20for%20${encodeURIComponent(formatPKR(currentPrice))}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer btn-press btn-shimmer"
            >
              <MessageSquare className="w-4 h-4 fill-white/20" />
              <span>Order via WhatsApp (+92 313 5221200)</span>
            </a>

            {/* 4 Trust Assurances */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Official PTA Approved</div>
                  <div className="text-[11px] text-neutral-500">100% custom duties paid</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <PackageCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Open-Parcel Delivery</div>
                  <div className="text-[11px] text-neutral-500">Inspect before paying COD</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">1-Year Warranty</div>
                  <div className="text-[11px] text-neutral-500">{phone.specs.warranty}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Express Shipping</div>
                  <div className="text-[11px] text-neutral-500">24-48h in major cities</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <section className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-neutral-950 dark:text-white">
                Technical Specifications
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verified hardware specifications for {phone.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Display & Screen', value: phone.specs.screen },
              {
                label: 'Display Technology',
                value: phone.specs.displayType || 'IPS LCD Capacitive Touchscreen',
              },
              { label: 'Refresh Rate', value: phone.specs.refreshRate },
              { label: 'Processor & Chipset', value: phone.specs.processor },
              { label: 'Primary Rear Camera', value: phone.specs.mainCamera },
              { label: 'Front Selfie Camera', value: phone.specs.selfieCamera },
              { label: 'Battery Capacity', value: phone.specs.battery },
              { label: 'Charging Speed', value: phone.specs.charging },
              { label: 'Operating System', value: phone.specs.os },
              { label: 'Network & Cellular', value: phone.specs.network },
              { label: 'Security & Biometrics', value: phone.specs.security },
              { label: 'Weight & Dimensions', value: phone.specs.weight },
              {
                label: 'Water & Dust Resistance',
                value: phone.specs.waterResistance || 'Everyday Durability',
              },
              { label: 'PTA Status in Pakistan', value: phone.specs.ptaStatus },
            ].map((spec) => (
              <div
                key={spec.label}
                className="flex items-start justify-between p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-xs gap-4"
              >
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[11px] min-w-[140px]">
                  {spec.label}
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 text-right">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Similar Recommended Phones */}
        {similarPhones.length > 0 && (
          <section className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-xl font-black text-neutral-950 dark:text-white">
              Similar Smartphones in Pakistan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarPhones.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div className="relative w-full h-44 mb-3">
                    <PhoneImageWithFallback
                      src={p.colors[0]?.image}
                      alt={p.name}
                      brand={p.brand}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase">
                      {p.brand}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {p.name}
                    </h4>
                    <div className="text-sm font-black mt-1">
                      {formatPKR(p.basePricePKR)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Enhanced Footer */}
      <Footer />

      {/* Comparison Dock and Cart Drawer */}
      <ComparisonDock
        comparingPhones={comparingPhones}
        isOpenModal={isCompareModalOpen}
        onToggleModal={setIsCompareModalOpen}
        onRemovePhone={(id) =>
          setComparingPhones((prev) => prev.filter((p) => p.id !== id))
        }
        onClearAll={() => setComparingPhones([])}
        onSelectForCart={(phoneToBuy) => {
          const inStockV = phoneToBuy.variants.find((v) => v.inStock) || phoneToBuy.variants[0];
          const inStockC = phoneToBuy.colors.find((c) => {
            if (c.inStock === false) return false;
            if (phoneToBuy.colorStockMap && phoneToBuy.colorStockMap[c.name] && !phoneToBuy.colorStockMap[c.name].inStock) return false;
            return true;
          }) || phoneToBuy.colors.find((c) => c.inStock !== false) || phoneToBuy.colors[0];

          setCartItems((prev) => {
            const existing = prev.find(
              (i) =>
                i.phone.id === phoneToBuy.id &&
                i.selectedVariant.id === inStockV.id &&
                i.selectedColor.name === inStockC.name
            );
            if (existing) {
              return prev.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + 1 } : i
              );
            }
            return [
              ...prev,
              {
                phone: phoneToBuy,
                selectedColor: inStockC,
                selectedVariant: inStockV,
                quantity: 1,
              },
            ];
          });
          setIsCartOpen(true);
        }}
      />

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

      {/* Quick Purchase Modal */}
      <QuickPurchaseModal
        phone={phone}
        selectedVariant={selectedVariant}
        selectedColor={selectedColor}
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />

      {/* Floating Live WhatsApp & Helpline Support Assistant */}
      <aside aria-label="Quick WhatsApp Helpline" className="fixed bottom-6 right-6 z-40 flex items-center">
        <a
          href={`https://wa.me/923135221200?text=Hi%20VoltPhone%20PK!%20I%20need%20assistance%20with%20${encodeURIComponent(phone.name)}.`}
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

