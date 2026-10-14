'use client';

import React, { useState, useMemo } from 'react';
import { BRANDS, RAM_OPTIONS, STORAGE_OPTIONS, formatPKR, PAKISTAN_CITIES, SMARTPHONES } from '@/data/smartphones';
import { FilterState } from '@/types';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Phone,
  MessageSquare,
  PackageCheck,
  Percent,
  Clock,
  Sparkles,
  Zap,
  Check,
  Send,
  HelpCircle,
  Truck,
  Building,
  CreditCard,
  Smartphone as PhoneIcon,
} from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
}

export function FilterSidebar({
  filters,
  setFilters,
  totalCount,
  filteredCount,
}: FilterSidebarProps) {
  // Brand search input
  const [brandSearch, setBrandSearch] = useState('');

  // Sidebar Quick Order Assistance Form State
  const [assistName, setAssistName] = useState('');
  const [assistPhone, setAssistPhone] = useState('');
  const [assistCity, setAssistCity] = useState(PAKISTAN_CITIES[0] || 'Karachi');
  const [assistSubmitted, setAssistSubmitted] = useState(false);

  // Compute live counts for all brands
  const brandModelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SMARTPHONES.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, []);

  const pricePresets = [
    { label: 'All Prices', min: 0, max: 700000 },
    { label: 'Under 25K', min: 0, max: 25000 },
    { label: '25K - 50K', min: 25000, max: 50000 },
    { label: '50K - 100K', min: 50000, max: 100000 },
    { label: '100K - 200K', min: 100000, max: 200000 },
    { label: '200K+ Flagships', min: 200000, max: 700000 },
  ];

  const handleBrandToggle = (brand: string) => {
    setFilters((prev) => {
      const exists = prev.selectedBrands.includes(brand);
      return {
        ...prev,
        selectedBrands: exists
          ? prev.selectedBrands.filter((b) => b !== brand)
          : [...prev.selectedBrands, brand],
      };
    });
  };

  const handleRamToggle = (ram: string) => {
    setFilters((prev) => {
      const exists = prev.selectedRam.includes(ram);
      return {
        ...prev,
        selectedRam: exists
          ? prev.selectedRam.filter((r) => r !== ram)
          : [...prev.selectedRam, ram],
      };
    });
  };

  const handleStorageToggle = (storage: string) => {
    setFilters((prev) => {
      const exists = prev.selectedStorage.includes(storage);
      return {
        ...prev,
        selectedStorage: exists
          ? prev.selectedStorage.filter((s) => s !== storage)
          : [...prev.selectedStorage, storage],
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedBrands: [],
      priceRange: [0, 700000],
      selectedRam: [],
      selectedStorage: [],
      ptaApprovedOnly: false,
      inStockOnly: false,
      sortBy: 'popularity',
    });
  };

  const handleAssistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assistName.trim() && assistPhone.trim()) {
      setAssistSubmitted(true);
      setTimeout(() => {
        setAssistName('');
        setAssistPhone('');
      }, 4000);
    }
  };

  // Filtered brands by user typing
  const displayedBrands = BRANDS.filter((b) => b !== 'All Brands').filter((brand) =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Check if button phones (Nokia & Itel) are exclusively selected
  const isKeypadSelected =
    filters.selectedBrands.length === 2 &&
    filters.selectedBrands.includes('Nokia') &&
    filters.selectedBrands.includes('Itel');

  return (
    <aside className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-6">
      {/* 1. Header & Active Counter */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200/70 text-cyan-700 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">
              Filter Catalog
            </h2>
            <div className="text-[11px] text-slate-500 font-medium">
              {filteredCount} of {totalCount} Mobiles
            </div>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="group text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-180 transition-transform duration-500" />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. Phone Category Quick Select Chips (Smartphones vs Keypad Phones) */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
          Mobile Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                selectedBrands: [],
              }));
            }}
            className={`btn-press py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              filters.selectedBrands.length === 0
                ? 'bg-slate-950 text-white shadow-md ring-2 ring-cyan-500/50'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-950'
            }`}
          >
            All Mobiles
          </button>
          <button
            type="button"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                selectedBrands: ['Nokia', 'Itel'],
              }));
            }}
            className={`btn-press py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              isKeypadSelected
                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/70 hover:shadow-xs'
            }`}
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            <span>Keypad (22)</span>
          </button>
        </div>
      </div>

      {/* 3. PTA & In-Stock Verification Switches */}
      <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <label className="flex items-center justify-between cursor-pointer group p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-115 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950">
              100% PTA Approved Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.ptaApprovedOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                ptaApprovedOnly: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-cyan-600 rounded cursor-pointer transition-transform active:scale-90"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 group-hover:scale-115 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950">
              In Stock Only (Ready to Ship)
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                inStockOnly: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-cyan-600 rounded cursor-pointer transition-transform active:scale-90"
          />
        </label>
      </div>

      {/* 4. Price Range Filter with Sliders & Preset Pills */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Price Range (PKR)
          </label>
          <span className="text-xs font-black text-cyan-700">
            {formatPKR(filters.priceRange[0])} - {formatPKR(filters.priceRange[1])}
          </span>
        </div>

        {/* Min/Max Manual Input Boxes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">MIN PRICE</span>
            <input
              type="number"
              min={0}
              max={filters.priceRange[1]}
              step={1000}
              value={filters.priceRange[0]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [Math.max(0, Number(e.target.value)), prev.priceRange[1]],
                }))
              }
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">MAX PRICE</span>
            <input
              type="number"
              min={filters.priceRange[0]}
              max={700000}
              step={1000}
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], Math.min(700000, Number(e.target.value))],
                }))
              }
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Quick Price Preset Chips with Tactile Bounce */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pricePresets.map((preset) => {
            const isSelected =
              filters.priceRange[0] === preset.min && filters.priceRange[1] === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: [preset.min, preset.max],
                  }))
                }
                className={`btn-press text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-sm ring-2 ring-cyan-400'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 hover:border-cyan-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Brand Filter with Search & Live Model Counts */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Mobile Brands ({BRANDS.length - 1})
          </h3>
          {filters.selectedBrands.length > 0 && (
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 animate-in zoom-in-50">
              {filters.selectedBrands.length} selected
            </span>
          )}
        </div>

        {/* Brand Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brand (Samsung, Apple, Nokia...)"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        {/* Brand List with Hover Slide */}
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          {displayedBrands.map((brand) => {
            const isChecked = filters.selectedBrands.includes(brand);
            const count = brandModelCounts[brand] || 0;
            return (
              <label
                key={brand}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? 'bg-cyan-50 text-cyan-900 font-bold border border-cyan-200 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
                  />
                  <span>{brand}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. RAM Filter with Tactile Chips */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
          RAM Memory
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RAM_OPTIONS.map((ram) => {
            const isSelected = filters.selectedRam.includes(ram);
            return (
              <button
                key={ram}
                type="button"
                onClick={() => handleRamToggle(ram)}
                className={`btn-press text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                }`}
              >
                {ram}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Storage Filter with Tactile Chips */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
          Internal Storage
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map((storage) => {
            const isSelected = filters.selectedStorage.includes(storage);
            return (
              <button
                key={storage}
                type="button"
                onClick={() => handleStorageToggle(storage)}
                className={`btn-press text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                }`}
              >
                {storage}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Quick Order Assistance Callback Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 text-white space-y-3 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
              <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Need Buying Help?</h4>
              <p className="text-[10px] text-slate-400">Request a free phone expert callback</p>
            </div>
          </div>

          {assistSubmitted ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold animate-in fade-in duration-200">
              ✓ Callback requested! We will call you within 15 minutes.
            </div>
          ) : (
            <form onSubmit={handleAssistSubmit} className="space-y-2">
              <input
                type="text"
                required
                value={assistName}
                onChange={(e) => setAssistName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <input
                type="tel"
                required
                value={assistPhone}
                onChange={(e) => setAssistPhone(e.target.value)}
                placeholder="Phone (0300-1234567)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <select
                value={assistCity}
                onChange={(e) => setAssistCity(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="btn-shimmer btn-press w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-cyan-500/25"
              >
                Request Free Callback
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
