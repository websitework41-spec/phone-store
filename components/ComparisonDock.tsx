'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Smartphone } from '@/types';
import { formatPKR } from '@/data/smartphones';
import { PhoneImageWithFallback } from './PhoneImageWithFallback';
import {
  Layers,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  Zap,
  Sparkles,
  Award,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';

interface ComparisonDockProps {
  comparingPhones: Smartphone[];
  onRemovePhone: (phoneId: string) => void;
  onClearAll: () => void;
  onSelectForCart?: (phone: Smartphone) => void;
  isOpenModal?: boolean;
  onToggleModal?: (open: boolean) => void;
}

export function ComparisonDock({
  comparingPhones,
  onRemovePhone,
  onClearAll,
  onSelectForCart,
  isOpenModal: externalIsOpenModal,
  onToggleModal,
}: ComparisonDockProps) {
  const [internalIsOpenModal, setInternalIsOpenModal] = useState(false);

  const isModalOpen =
    externalIsOpenModal !== undefined
      ? externalIsOpenModal
      : internalIsOpenModal;

  const setModalOpen = (open: boolean) => {
    if (onToggleModal) {
      onToggleModal(open);
    } else {
      setInternalIsOpenModal(open);
    }
  };

  if (comparingPhones.length === 0 && !isModalOpen) return null;

  return (
    <>
      {/* Floating Bottom Dock */}
      <div className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-slate-950/95 text-white backdrop-blur-xl rounded-3xl p-3 px-4 sm:px-5 shadow-2xl border border-white/15 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0b3c68] text-white flex items-center justify-center shrink-0 border border-white/20">
            <Layers className="w-4 h-4 text-[#48afff]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">
              Compare ({comparingPhones.length}/3)
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block truncate">
              Side-by-side hardware comparison
            </div>
          </div>
        </div>

        {/* Selected Thumbnails */}
        <div className="flex items-center gap-1.5 shrink-0">
          {comparingPhones.map((phone) => (
            <div
              key={phone.id}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-white/40 shadow-xs flex items-center justify-center"
            >
              <PhoneImageWithFallback
                src={phone.colors[0]?.image}
                alt={phone.name}
                brand={phone.brand}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => onRemovePhone(phone.id)}
                aria-label={`Remove ${phone.name} from comparison`}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:scale-110 transition-transform cursor-pointer"
                title="Remove"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {Array.from({ length: 3 - comparingPhones.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-dashed border-slate-700 hidden sm:flex items-center justify-center text-[10px] text-slate-500 font-bold"
            >
              +{i + 1}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-slate-400 hover:text-white hidden sm:block cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-[#0b3c68] hover:bg-[#48afff] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 btn-press cursor-pointer border border-white/20"
          >
            <span>Compare</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Comparison Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-50 text-[#0b3c68] border border-sky-100 uppercase tracking-wide">
                    Side-by-Side Matrix
                  </span>
                  <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                    Smartphone Comparison
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparing verified hardware specs, PTA approval, and official Pakistani prices.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close comparison modal"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Comparison Matrix (with smooth horizontal scrolling on mobile!) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              {comparingPhones.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-sky-50 flex items-center justify-center text-[#0b3c68]">
                    <Layers className="w-6 h-6 text-[#48afff]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No Phones Selected for Comparison
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click the &quot;Compare&quot; button on any smartphone card to compare up to 3 phones side-by-side!
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#0b3c68] text-white text-xs font-bold hover:bg-[#48afff] transition-colors"
                  >
                    Browse Smartphones
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto pb-4">
                  {/* Mobile swipe helper */}
                  {comparingPhones.length > 1 && (
                    <div className="sm:hidden text-center mb-2.5">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        👈 Swipe sideways to compare all models 👉
                      </span>
                    </div>
                  )}

                  <div className={comparingPhones.length > 1 ? 'min-w-[540px] sm:min-w-0' : 'min-w-0'}>
                    {/* Top Overview Cards */}
                    <div
                      className="grid gap-3 sm:gap-4 pb-6 border-b border-slate-100"
                      style={{
                        gridTemplateColumns: `repeat(${comparingPhones.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {comparingPhones.map((phone) => (
                        <div
                          key={phone.id}
                          className="flex flex-col items-center text-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs"
                        >
                          <Link
                            href={`/product/${phone.slug}`}
                            onClick={() => setModalOpen(false)}
                            className="relative w-24 sm:w-28 h-32 sm:h-36 mb-2 hover:scale-105 transition-transform flex items-center justify-center"
                          >
                            <PhoneImageWithFallback
                              src={phone.colors[0]?.image}
                              alt={phone.name}
                              brand={phone.brand}
                              className="w-full h-full object-contain"
                            />
                          </Link>
                          <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase">
                            {phone.brand}
                          </span>
                          <Link
                            href={`/product/${phone.slug}`}
                            onClick={() => setModalOpen(false)}
                          >
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 mt-0.5 hover:text-[#0b3c68]">
                              {phone.name}
                            </h3>
                          </Link>
                          <div className="text-sm sm:text-base font-black text-[#0b3c68] mt-1">
                            {formatPKR(phone.basePricePKR)}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            PTA Approved
                          </span>

                          {onSelectForCart && (
                            <button
                              onClick={() => {
                                onSelectForCart(phone);
                                setModalOpen(false);
                              }}
                              className="mt-3 w-full py-2 px-3 rounded-xl bg-[#0b3c68] hover:bg-[#072847] text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 btn-press cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Select to Buy</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Spec Rows Comparison */}
                    <div className="space-y-3.5 pt-5 text-xs">
                      {[
                        {
                          category: 'Display & Refresh Rate',
                          getter: (p: Smartphone) => p.specs.screen,
                        },
                        {
                          category: 'Chipset / Processor',
                          getter: (p: Smartphone) => p.specs.processor,
                        },
                        {
                          category: 'Main Rear Camera',
                          getter: (p: Smartphone) => p.specs.mainCamera,
                        },
                        {
                          category: 'Selfie Camera',
                          getter: (p: Smartphone) => p.specs.selfieCamera,
                        },
                        {
                          category: 'Battery & Fast Charging',
                          getter: (p: Smartphone) =>
                            `${p.specs.battery} • ${p.specs.charging}`,
                        },
                        {
                          category: 'Operating System',
                          getter: (p: Smartphone) => p.specs.os,
                        },
                        {
                          category: 'Water & Dust Resistance',
                          getter: (p: Smartphone) =>
                            p.specs.waterResistance || 'Standard Splash Proof',
                        },
                        {
                          category: 'Warranty in Pakistan',
                          getter: (p: Smartphone) => p.specs.warranty,
                        },
                      ].map((row) => (
                        <div key={row.category} className="space-y-1">
                          <div className="font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">
                            {row.category}
                          </div>
                          <div
                            className="grid gap-3 sm:gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200"
                            style={{
                              gridTemplateColumns: `repeat(${comparingPhones.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {comparingPhones.map((phone) => (
                              <div
                                key={phone.id}
                                className="font-medium text-slate-800 break-words leading-relaxed text-xs"
                              >
                                {row.getter(phone)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
