'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  PackageCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Smartphone,
  MessageSquare,
  Star,
  Award,
  ChevronRight,
  MapPin,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import {
  sanitizeText,
  validateEmailOrPhone,
  isBotSubmission,
  submissionRateLimiter,
  MAX_INPUT_LENGTHS,
} from '@/lib/security';

export function Footer() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Honeypot bot protection
    if (isBotSubmission(honeypot)) return;

    // Rate limiting (max 1 submission per 2s)
    if (!submissionRateLimiter.isAllowed('footer_newsletter', 2000)) return;

    const cleanInput = sanitizeText(emailOrPhone, MAX_INPUT_LENGTHS.EMAIL);
    if (!cleanInput || !validateEmailOrPhone(cleanInput)) {
      setErrorMsg('Please enter a valid Pakistani WhatsApp number (e.g. 03001234567) or email.');
      return;
    }

    setIsSubscribed(true);
    setTimeout(() => {
      setEmailOrPhone('');
      setErrorMsg('');
    }, 4500);
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#0b1329] via-[#090e1d] to-[#050811] text-slate-200 border-t border-slate-800/80 transition-colors duration-200">
      {/* 1. Value Proposition Pillars (Pakistani E-Commerce Trust Assurances) */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Pillar 1: Open Parcel */}
            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-700/60 hover:border-[#48afff]/60 hover:shadow-[0_8px_24px_rgba(72,175,255,0.12)] card-hover-fx group cursor-default transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#48afff]/15 border border-[#48afff]/40 text-[#48afff] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <PackageCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans group-hover:text-[#48afff] transition-colors">
                  <span>Open-Parcel Delivery</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full tracking-wider shrink-0">
                    Safe
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                  Open the flyer and inspect the sealed phone box before handing cash to the courier rider.
                </p>
              </div>
            </div>

            {/* Pillar 2: 100% PTA Approved */}
            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-700/60 hover:border-emerald-500/60 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] card-hover-fx group cursor-default transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans group-hover:text-emerald-400 transition-colors">
                  <span>100% PTA Approved</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#48afff]/20 text-[#48afff] border border-[#48afff]/50 rounded-full tracking-wider shrink-0">
                    DIRBS
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                  All 222 listed smartphones and keypad phones are customs tax cleared with lifetime SIM validity.
                </p>
              </div>
            </div>

            {/* Pillar 3: Official Brand Warranty */}
            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-700/60 hover:border-indigo-400/60 hover:shadow-[0_8px_24px_rgba(99,102,241,0.12)] card-hover-fx group cursor-default transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans group-hover:text-indigo-400 transition-colors">
                  <span>1-Year Brand Warranty</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full tracking-wider shrink-0">
                    Official
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                  Direct official claims at Samsung, Mercantile, Xiaomi, Carlcare &amp; Airlink centers nationwide.
                </p>
              </div>
            </div>

            {/* Pillar 4: Express Shipping */}
            <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-700/60 hover:border-amber-400/60 hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)] card-hover-fx group cursor-default transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans group-hover:text-amber-400 transition-colors">
                  <span>Free Express Shipping</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full tracking-wider shrink-0">
                    24-48h
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                  Insured courier dispatch across 150+ Pakistani cities with live SMS and tracking updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Newsletter & WhatsApp Price Alert Subscription */}
      <div className="border-b border-slate-800/80 bg-slate-900/30 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d2242] to-slate-900 border border-sky-500/30 shadow-[0_12px_40px_rgba(6,182,212,0.12)] flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-xs font-bold text-sky-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Price Drop &amp; Restock Radar</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-sans tracking-tight">
                Never Miss a Smartphone Price Drop
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Get real-time WhatsApp or email alerts when high-demand models (Samsung S24 Ultra, iPhone 16 Pro, Redmi 14C) drop in price or come back in stock.
              </p>
            </div>

            <div className="w-full lg:w-auto flex-shrink-0">
              {isSubscribed ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-bold shadow-lg animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Subscribed! You will receive instant WhatsApp price drop &amp; stock alerts.</span>
                </div>
              ) : (
                <div className="space-y-2.5 w-full max-w-md mx-auto lg:mx-0">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
                    {/* Security honeypot trap */}
                    <input
                      type="text"
                      name="_hp_newsletter"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="sr-only opacity-0 absolute -z-10 pointer-events-none h-0 w-0"
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="Enter WhatsApp # (e.g. 0300...) or Email"
                      className="w-full sm:w-80 px-4 py-3 rounded-full bg-slate-950/90 border border-slate-700 text-white placeholder:text-slate-400 text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:border-[#48afff] font-medium shadow-inner transition-all"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#48afff] to-[#1e88e5] hover:from-[#35a5ff] hover:to-[#1976d2] text-white text-xs font-black shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer btn-press btn-shimmer"
                    >
                      <span>Get Alerts</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="flex items-center justify-center lg:justify-start gap-2 text-[11px] text-slate-400">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>No spam. 1-click unsubscribe anytime. 100% private.</span>
                  </div>

                  {errorMsg && (
                    <div className="text-[11px] text-rose-300 font-semibold px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/80 animate-in fade-in">
                      ⚠️ {errorMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 text-xs">
          {/* Column 1: Brand & About */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b3c68] to-[#136ab5] border border-sky-400/30 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-sky-300 stroke-sky-300" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-1">
                  <span>HAMZA</span>
                  <span className="text-[#48afff]">PHONE STORE</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#f88b2a] text-white shadow-xs">
                    PK
                  </span>
                </span>
                <p className="text-[10px] text-sky-300/80 font-bold tracking-wide -mt-0.5">
                  Pakistan&apos;s #1 PTA-Approved Marketplace
                </p>
              </div>
            </Link>

            {/* Rating badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-amber-300 text-xs font-bold shadow-xs">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-white font-black">4.9 / 5</span>
              <span className="text-slate-400 text-[11px]">(12,400+ Orders)</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-normal">
              Pakistan&apos;s official PTA-Approved smartphone and button phone destination. 222 verified models featuring DIRBS customs compliance, transparent price tracking, and risk-free Open-Parcel Cash on Delivery.
            </p>

            <div className="pt-1 space-y-2.5 text-slate-300">
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-200">100% PTA DIRBS Approved with Lifetime SIMs</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-200">256-Bit SSL Encrypted &amp; Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-200">Registered NTN &amp; SECP Compliant Business</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Mobile Brands */}
          <div className="space-y-3.5">
            <div>
              <h5 className="font-extrabold text-white uppercase tracking-wider text-xs font-sans">
                Top Mobile Brands
              </h5>
              <div className="w-8 h-0.5 bg-[#48afff] rounded-full mt-1.5" />
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/?brand=Samsung#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Samsung Galaxy</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">25</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Apple#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Apple iPhone Series</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">7</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Xiaomi#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Xiaomi, Redmi &amp; Poco</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">18</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Infinix#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Infinix Note &amp; Hot</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">9</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Tecno#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Tecno Camon &amp; Spark</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">11</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Vivo#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Vivo V &amp; Y Series</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">11</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Nokia#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Nokia Keypad Mobiles</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">16</span>
                </Link>
              </li>
              <li>
                <Link href="/?brand=Itel#catalog" className="group flex items-center justify-between hover:text-[#48afff] transition-all py-0.5">
                  <span className="group-hover:translate-x-1 transition-transform">Itel Button Phones</span>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">6</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop by Budget */}
          <div className="space-y-3.5">
            <div>
              <h5 className="font-extrabold text-white uppercase tracking-wider text-xs font-sans">
                Shop By Budget
              </h5>
              <div className="w-8 h-0.5 bg-[#48afff] rounded-full mt-1.5" />
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/?maxPrice=25000#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Phones Under Rs. 25,000</span>
                </Link>
              </li>
              <li>
                <Link href="/?maxPrice=40000#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Phones Under Rs. 40,000</span>
                </Link>
              </li>
              <li>
                <Link href="/?maxPrice=60000#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Phones Under Rs. 60,000</span>
                </Link>
              </li>
              <li>
                <Link href="/?maxPrice=100000#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Phones Under Rs. 100,000</span>
                </Link>
              </li>
              <li>
                <Link href="/?minPrice=150000#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Flagship Mobiles (150K+)</span>
                </Link>
              </li>
              <li>
                <Link href="/?search=5G#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Best 5G Gaming Phones</span>
                </Link>
              </li>
              <li>
                <Link href="/?spec=120hz-amoled#catalog" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>120Hz AMOLED Displays</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Protection */}
          <div className="space-y-3.5">
            <div>
              <h5 className="font-extrabold text-white uppercase tracking-wider text-xs font-sans">
                Customer Assurances
              </h5>
              <div className="w-8 h-0.5 bg-[#48afff] rounded-full mt-1.5" />
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/policies#open-parcel" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Open-Parcel Delivery Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#pta-guide" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>PTA DIRBS Verification Guide</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#installments" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>0% Markup EMI Installments</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#warranty" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>1-Year Brand Warranty Centers</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#cod-terms" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Cash on Delivery (COD) Rules</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#replacement-guarantee" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>7-Day Replacement Guarantee</span>
                </Link>
              </li>
              <li>
                <Link href="/policies#privacy-security" className="group flex items-center gap-1.5 hover:text-[#48afff] transition-all py-0.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#48afff] group-hover:translate-x-0.5 transition-all" />
                  <span>Privacy Policy &amp; Security</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold hover:bg-sky-500/25 hover:text-white transition-all text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#48afff]" />
                  <span>Store Admin &amp; Stock Hub</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Support & Contact */}
          <div className="space-y-3.5">
            <div>
              <h5 className="font-extrabold text-white uppercase tracking-wider text-xs font-sans">
                Helpline &amp; Hubs
              </h5>
              <div className="w-8 h-0.5 bg-[#48afff] rounded-full mt-1.5" />
            </div>

            <div className="space-y-2.5">
              {/* Phone Helpline button */}
              <a
                href="tel:+923135221200"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-[#48afff] text-white font-bold transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#48afff]/15 border border-[#48afff]/30 flex items-center justify-center text-[#48afff] group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Toll-Free Helpline</div>
                  <div className="text-xs font-bold text-white tracking-wide">+92 313 5221200</div>
                </div>
              </a>

              {/* WhatsApp Support button */}
              <a
                href="https://wa.me/923135221200?text=Hi%20Hamza%20Phone%20Store!%20I%20have%20an%20inquiry%20regarding%20mobile%20phones."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 hover:border-emerald-500 text-white font-bold transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-300 uppercase font-semibold">Live WhatsApp Chat</div>
                  <div className="text-xs font-bold text-emerald-200 tracking-wide">+92 313 5221200</div>
                </div>
              </a>

              {/* Support Email */}
              <div className="flex items-center gap-2.5 text-slate-300 text-xs px-1">
                <Mail className="w-4 h-4 text-[#48afff] flex-shrink-0" />
                <span className="font-medium text-slate-200">support@hamzaphonestore.pk</span>
              </div>

              {/* Operating Hours */}
              <div className="flex items-center gap-2.5 text-slate-300 text-xs px-1">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Mon – Sat: 9:00 AM – 10:00 PM</span>
              </div>

              {/* Fulfillment Hubs */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] leading-relaxed">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Physical Fulfillment Hubs:</span>
                </div>
                <div className="pl-5 space-y-1 text-slate-300">
                  <div>• Gulberg III, Lahore, Punjab</div>
                  <div>• Shahrah-e-Faisal, Karachi, Sindh</div>
                  <div>• Blue Area, Islamabad, ICT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Payment Partners & Courier Partners Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-300">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="font-extrabold text-white mr-1 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#48afff]" />
              <span>Payment Methods:</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-[#48afff] transition-all cursor-default shadow-xs">
              💵 Cash on Delivery (COD)
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-[#48afff] transition-all cursor-default shadow-xs">
              🏦 Meezan Bank
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-[#48afff] transition-all cursor-default shadow-xs">
              🏦 Bank Alfalah
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-[#48afff] transition-all cursor-default shadow-xs">
              ⚡ EasyPaisa / JazzCash
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-[#48afff] transition-all cursor-default shadow-xs">
              🔗 Raast / 1Link
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
            <span className="font-extrabold text-white mr-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Express Couriers:</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-emerald-400 transition-all cursor-default shadow-xs">
              🚚 TCS Express
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-emerald-400 transition-all cursor-default shadow-xs">
              🐆 Leopards
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-emerald-400 transition-all cursor-default shadow-xs">
              📦 Trax
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-white font-medium hover:border-emerald-400 transition-all cursor-default shadow-xs">
              ✉️ PostEx
            </span>
          </div>
        </div>

        {/* 5. Bottom Legal, NTN & Copyright Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center md:text-left">
          <div className="space-y-1">
            <div className="text-slate-300 font-medium">
              {`© ${new Date().getFullYear()} Hamza Phone Store (Pvt) Ltd. All Rights Reserved.`}
            </div>
            <div className="text-[11px] text-slate-400">
              Registered Pakistani E-Commerce Marketplace • SECP NTN Verified • 100% PTA DIRBS Compliant.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <Link href="/policies#privacy-security" className="hover:text-[#48afff] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/policies#cod-terms" className="hover:text-[#48afff] transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/policies#replacement-guarantee" className="hover:text-[#48afff] transition-colors">
              Refund &amp; Replacement
            </Link>
            <span>•</span>
            <Link href="/policies#pta-guide" className="text-emerald-400 font-bold hover:underline">
              PTA DIRBS Check
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
