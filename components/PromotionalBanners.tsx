'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  PackageCheck,
  Sparkles,
  Zap,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Award,
  ChevronRight,
  Smartphone,
  Percent,
} from 'lucide-react';
import { PhoneImageWithFallback } from './PhoneImageWithFallback';
import { formatPKR } from '@/data/smartphones';

interface BannerProps {
  onSelectBrand?: (brand: string) => void;
  onFilterCategory?: (filterKey: string, value: any) => void;
  onOpenEMIModal?: () => void;
}

/**
 * Banner 1: Samsung Galaxy S24 Ultra & Galaxy AI Launch Spotlight
 */
export function CatalogBannerS24Ultra({ onSelectBrand }: BannerProps) {
  return (
    <div className="group col-span-full my-6 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border border-slate-800 shadow-xl hover:shadow-2xl hover:border-cyan-400/80 hover:-translate-y-1.5 transition-all duration-500 relative">
      {/* Decorative Glow with Scale on Hover */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
        {/* Left Information Column */}
        <div className="md:col-span-7 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Flagship Spotlight
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% PTA Approved
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
              <PackageCheck className="w-3.5 h-3.5" /> Open Parcel COD
            </span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Samsung Galaxy S24 Ultra{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                • Galaxy AI
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Titanium frame, 200MP AI Quad-Telephoto zoom, Snapdragon 8 Gen 3 for Galaxy, and 7 years of Android OS updates. Matched with nationwide official retail pricing.
            </p>
          </div>

          {/* Pricing Highlight Pill */}
          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">
              {formatPKR(316999)}
            </div>
            <div className="text-sm line-through text-slate-400">
              {formatPKR(469999)}
            </div>
            <div className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Save Rs. 153,000 (33% OFF)
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/product/samsung-galaxy-s24-ultra"
              className="btn-shimmer btn-press inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-400/40 cursor-pointer"
            >
              <span>View S24 Ultra Specs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => onSelectBrand && onSelectBrand('Samsung')}
              className="btn-press inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-cyan-400/60 transition-all cursor-pointer shadow-xs"
            >
              <span>All 25 Samsung Phones</span>
            </button>
          </div>
        </div>

        {/* Right Phone Visual Column with Hover Zoom */}
        <div className="md:col-span-5 flex items-center justify-center relative">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 group/img">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-xl group-hover:scale-120 transition-transform duration-700" />
            <PhoneImageWithFallback
              src="https://images.priceoye.pk/samsung-galaxy-s24-ultra-pakistan-priceoye-d4s6b-500x500.webp"
              alt="Samsung Galaxy S24 Ultra"
              brand="Samsung"
              className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl group-hover/img:scale-115 group-hover/img:rotate-1 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner 2: Dual Promotional Cards (Budget Kings & Keypad Champions)
 */
export function CatalogBannerDualCards({ onSelectBrand, onFilterCategory }: BannerProps) {
  return (
    <div className="col-span-full my-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {/* Card 1: Budget Kings */}
      <div className="group rounded-3xl p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/90 shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600 animate-pulse" />
              Budget Superstars
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-200/50 px-2.5 py-0.5 rounded-full">
              Under 35,000 PKR
            </span>
          </div>

          <div>
            <h4 className="text-xl font-extrabold text-slate-950 font-sans group-hover:text-amber-900 transition-colors">
              Redmi 10C &amp; Infinix Hot 60
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              120Hz smooth displays, 50MP AI high-res cameras, and massive 5000mAh batteries. Genuine Pakistani distributor warranty.
            </p>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Starting at</span>
            <span className="text-xl font-black text-amber-700">Rs. 23,999</span>
          </div>
        </div>

        <div className="pt-4 mt-2 flex items-center justify-between border-t border-amber-200/60">
          <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
            Open Parcel Included
          </span>
          <button
            onClick={() => {
              if (onFilterCategory) {
                onFilterCategory('priceRange', [0, 35000]);
              } else if (onSelectBrand) {
                onSelectBrand('Xiaomi');
              }
            }}
            className="btn-press inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-lg"
          >
            <span>View Budget Phones</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Card 2: Nokia & Itel Keypad Legend */}
      <div className="group rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden text-white flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-black uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              Keypad Classics
            </span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
              22 Verified Models
            </span>
          </div>

          <div>
            <h4 className="text-xl font-extrabold text-white font-sans group-hover:text-cyan-300 transition-colors">
              Nokia 105, 110 &amp; Itel Keypad Phones
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Super long 1-week battery backup, loud wireless FM radio, big speaker, and PTA tax cleared for lifetime uninterrupted SIM calling.
            </p>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Starting from</span>
            <span className="text-xl font-black text-cyan-400">Rs. 2,999</span>
          </div>
        </div>

        <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% PTA Approved
          </span>
          <button
            onClick={() => onSelectBrand && onSelectBrand('Nokia')}
            className="btn-shimmer btn-press inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-cyan-500/25 hover:shadow-cyan-400/40"
          >
            <span>View All Keypad Phones</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner 3: 0% Markup Bank EMI Installments
 */
export function CatalogBannerBankEMI({ onOpenEMIModal }: BannerProps) {
  return (
    <div className="group col-span-full my-6 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white border border-cyan-900/60 shadow-xl hover:shadow-2xl hover:border-cyan-400/80 hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" /> 0% Markup Financing
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Buy Any Flagship Smartphone on Easy Monthly Installments
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Zero markup (interest-free) plans up to 12 months with Meezan Bank, Bank Alfalah, HBL, Standard Chartered, and Silk Bank credit cards.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Hidden Charges</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Bank Approval</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center space-y-3">
          {onOpenEMIModal && (
            <button
              onClick={onOpenEMIModal}
              className="btn-shimmer btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer"
            >
              <span>Calculate Your Monthly EMI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <span className="text-[11px] text-slate-400">
            Also accepts EasyPaisa &amp; JazzCash installments
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner 4: Open-Parcel Inspection Guarantee
 */
export function CatalogBannerOpenParcel() {
  return (
    <div className="group col-span-full my-6 rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-115 group-hover:rotate-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <PackageCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
              100% Risk-Free Buying
            </span>
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-950 font-sans group-hover:text-emerald-800 transition-colors">
              Open-Parcel Cash on Delivery Guarantee
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              When the rider arrives at your doorstep in Karachi, Lahore, Islamabad, or any city in Pakistan, open the flyer, inspect the authentic phone box, and check the seal before handing over cash.
            </p>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col md:items-end justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Zero Advance Deposit Required</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Available on all 222 listed mobile phones
          </span>
        </div>
      </div>
    </div>
  );
}
