'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SMARTPHONES, formatPKR, BRANDS } from '@/data/smartphones';
import { PhoneImageWithFallback } from './PhoneImageWithFallback';
import {
  Smartphone,
  Search,
  ShoppingCart,
  Layers,
  ShieldCheck,
  PackageCheck,
  X,
  ArrowRight,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  CreditCard,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { sanitizeText } from '@/lib/security';

interface NavbarProps {
  compareCount?: number;
  cartCount?: number;
  onOpenCompare?: () => void;
  onOpenCart?: () => void;
  onSelectBrand?: (brand: string) => void;
  activeBrand?: string;
  onSearch?: (query: string) => void;
}

export function Navbar({
  compareCount = 0,
  cartCount = 0,
  onOpenCompare,
  onOpenCart,
  onSelectBrand,
  activeBrand = 'All Brands',
  onSearch,
}: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackPhoneOrOrder, setTrackPhoneOrOrder] = useState('');
  const [trackResult, setTrackResult] = useState<string | null>(null);
  const [trackError, setTrackError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Dynamic Brand Counts from catalog
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Brands': SMARTPHONES.length };
    SMARTPHONES.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, []);

  // Search filtering
  const searchResults = searchQuery.trim()
    ? SMARTPHONES.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.specs.chipsetBrand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBrandClick = (brand: string) => {
    if (onSelectBrand) {
      onSelectBrand(brand);
    } else {
      router.push(`/?brand=${encodeURIComponent(brand)}#catalog`);
    }
  };

  const handleCompareClick = () => {
    if (onOpenCompare) {
      onOpenCompare();
    } else {
      router.push('/#catalog');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const cleanQuery = sanitizeText(customQuery || searchQuery, 80);
    if (cleanQuery) {
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      if (onSearch) {
        onSearch(cleanQuery);
      } else {
        router.push(`/?search=${encodeURIComponent(cleanQuery)}#catalog`);
      }
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrack = sanitizeText(trackPhoneOrOrder, 50).trim();
    if (!cleanTrack) return;

    let matchedOrder: { orderId: string; customerName: string; status: string } | null = null;
    try {
      const stored = localStorage.getItem('voltphone_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        if (Array.isArray(orders)) {
          matchedOrder = orders.find(
            (o: any) =>
              o.orderId?.toLowerCase() === cleanTrack.toLowerCase() ||
              (o.phone && cleanTrack.replace(/\D/g, '') && o.phone.replace(/\D/g, '') === cleanTrack.replace(/\D/g, ''))
          );
        }
      }
    } catch {
      // ignore
    }

    if (!matchedOrder && (cleanTrack.toUpperCase() === 'VPK-786110' || cleanTrack === '03001234567')) {
      matchedOrder = {
        orderId: 'VPK-786110',
        customerName: 'Muhammad Ali',
        status: 'Dispatched via TCS Express. In transit to destination (Lahore). Expected delivery today with Open-Parcel inspection.',
      };
    }

    if (matchedOrder) {
      setTrackError(false);
      setTrackResult(
        `Tracking ID Verified: ${matchedOrder.orderId} (${matchedOrder.customerName}). Status: ${matchedOrder.status}`
      );
    } else {
      setTrackError(true);
      setTrackResult(
        `No order found with Tracking ID "${cleanTrack}". Please verify your order number (e.g. VPK-786110) or contact our WhatsApp helpline at +92 313 5221200.`
      );
    }
  };

  const trendingTags = [
    'S24 Ultra',
    'iPhone 16',
    'Nokia 105',
    'Redmi 14C',
    'Infinix Hot 50',
    '0% EMI Deals',
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        {/* 1. Google Stitch Kinetic Top Utility Ticker with Pulse */}
        <div className="bg-slate-950 text-slate-200 text-[11px] sm:text-xs py-2 px-4 font-medium border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="flex items-center gap-1.5 font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" /> 100% PTA Approved
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Open-Parcel Delivery (Inspect Before Cash Payment)</span>
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="hidden lg:inline text-cyan-300/90 font-medium">
                ⚡ 0% Markup EMI on Credit Cards &amp; EasyPaisa
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 text-[11px] whitespace-nowrap">
              <button
                onClick={() => setIsTrackOrderOpen(true)}
                className="hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Track Order</span>
              </button>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <a
                href="tel:+923135221200"
                className="hover:text-white flex items-center gap-1 transition-all hidden sm:flex hover:scale-105"
                title="Direct Phone Helpline"
              >
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>+92 313 5221200</span>
              </a>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <a
                href="https://wa.me/923135221200?text=Hi%20VoltPhone%20PK!%20I%20have%20an%20inquiry%20regarding%20mobile%20phones."
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-300 flex items-center gap-1.5 transition-all font-bold text-emerald-400 hover:scale-105 active:scale-95"
                title="Chat with Us on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp: +92 313 5221200</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* VoltPhone Brand Logo with Interactive Glow & Hover Tilt */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 group-hover:scale-110 group-hover:rotate-6 group-hover:border-cyan-400 group-hover:shadow-cyan-400/30 transition-all duration-300">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-cyan-400 stroke-cyan-400 group-hover:animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 font-sans group-hover:text-cyan-700 transition-colors">
                    VOLT<span className="text-cyan-600">PHONE</span>
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 group-hover:scale-105 transition-transform">
                    PK
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 -mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>222 Verified Mobiles In-Stock</span>
                </div>
              </div>
            </Link>

            {/* Desktop Search Bar with Halo Focus Ring */}
            <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder={`Search 222 mobiles (e.g. S24 Ultra, iPhone 16, Nokia 105, 0% EMI)...`}
                  className="w-full pl-11 pr-10 py-2.5 rounded-full text-xs sm:text-sm bg-slate-100/90 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    aria-label="Clear search"
                    title="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:scale-115 active:scale-95 transition-all p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Desktop Autocomplete Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {searchQuery.trim() ? (
                    <>
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4 font-semibold bg-slate-50">
                        <span>Phones matching &quot;{searchQuery}&quot;</span>
                        <span className="text-cyan-700 font-bold">{searchResults.length} results</span>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-84 overflow-y-auto">
                          {searchResults.map((phone) => (
                            <Link
                              key={phone.id}
                              href={`/product/${phone.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3.5 p-3 px-4 hover:bg-cyan-50/60 hover:translate-x-1 transition-all duration-200 group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center flex-shrink-0 border border-slate-200/80 group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                                {phone.colors?.[0]?.image ? (
                                  <PhoneImageWithFallback
                                    src={phone.colors[0].image}
                                    alt={phone.name}
                                    brand={phone.brand}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Smartphone className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-cyan-700 transition-colors">
                                    {phone.name}
                                  </h4>
                                  <span className="text-xs font-extrabold text-slate-950 whitespace-nowrap">
                                    {formatPKR(phone.basePricePKR)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <span className="text-[11px] text-slate-500 truncate">
                                    {phone.variants?.[0]?.ram || ''} {phone.variants?.[0]?.storage || ''} • {phone.specs.processor}
                                  </span>
                                  {phone.inStock ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleSearchSubmit()}
                            className="w-full p-3 text-center text-xs font-bold text-cyan-700 hover:bg-cyan-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-slate-100"
                          >
                            <span>View all results for &quot;{searchQuery}&quot;</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                          <p className="font-bold text-slate-800 text-sm">
                            No phones matching &quot;{searchQuery}&quot;
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Search by brand (e.g. Samsung, Apple, Nokia, Xiaomi) or model (e.g. S24, 105).
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                        <span>Trending Mobile Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSearchQuery(tag);
                              handleSearchSubmit(undefined, tag);
                            }}
                            className="btn-press px-3 py-1.5 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 border border-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Action Navigation Buttons with Tactile Bounce */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Toggle Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Compare Button */}
              <button
                type="button"
                onClick={handleCompareClick}
                aria-label="Compare phones side-by-side"
                className="btn-press relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-white border border-slate-200 hover:border-cyan-400 hover:text-cyan-700 text-slate-800 transition-all cursor-pointer text-xs font-bold shadow-xs hover:shadow-md"
                title="Compare phones side-by-side"
              >
                <Layers className="w-4 h-4 text-cyan-600" />
                <span className="hidden sm:inline">Compare</span>
                {compareCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-black flex items-center justify-center animate-heartbeat shadow-xs">
                    {compareCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={onOpenCart}
                aria-label="View shopping cart"
                className="btn-shimmer btn-press relative flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white transition-all shadow-md shadow-slate-950/20 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer text-xs font-bold"
                title="View your cart"
              >
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-sm animate-heartbeat">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Drawer */}
          {isMobileSearchOpen && (
            <div ref={mobileSearchRef} className="md:hidden pb-3 pt-1 border-t border-slate-100 animate-in fade-in duration-200">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Search 222 phones..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    title="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Mobile Search Results */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {searchResults.map((phone) => (
                    <Link
                      key={phone.id}
                      href={`/product/${phone.slug}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsMobileSearchOpen(false);
                      }}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 text-xs active:bg-cyan-50"
                    >
                      <div className="truncate font-bold text-slate-900">{phone.name}</div>
                      <div className="font-extrabold text-cyan-700">{formatPKR(phone.basePricePKR)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Horizontal Brand & Quick-Category Navigation Bar with Pill Bounce */}
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none border-t border-slate-100">
            {BRANDS.map((brand) => {
              const isActive = activeBrand === brand;
              const count = brandCounts[brand] || 0;
              return (
                <button
                  key={brand}
                  onClick={() => handleBrandClick(brand)}
                  className={`btn-press px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-md ring-2 ring-cyan-500/60 scale-102'
                      : 'bg-slate-100 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/60 hover:border-cyan-300 hover:shadow-xs'
                  }`}
                >
                  <span>{brand}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Track Order Modal */}
      {isTrackOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
                  <Truck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-slate-950 font-sans">
                  Track Smartphone Delivery
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsTrackOrderOpen(false);
                  setTrackResult(null);
                  setTrackError(false);
                }}
                aria-label="Close tracking popup"
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-950 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your Pakistani mobile number or Order ID to view real-time courier dispatch status with Open-Parcel inspection.
            </p>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={trackPhoneOrOrder}
                onChange={(e) => setTrackPhoneOrOrder(e.target.value)}
                placeholder="e.g. 03001234567 or VPK-786110"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="btn-shimmer btn-press w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                Search Courier Status
              </button>
            </form>

            {trackResult && (
              <div
                className={`p-3.5 rounded-2xl text-xs space-y-1 animate-in fade-in duration-150 ${
                  trackError
                    ? 'bg-rose-50 border border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                }`}
              >
                <div
                  className={`font-bold flex items-center gap-1.5 ${
                    trackError ? 'text-rose-800' : 'text-emerald-800'
                  }`}
                >
                  {trackError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>{trackError ? 'Order Not Found' : 'Dispatch Verified'}</span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed ${
                    trackError ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {trackResult}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
