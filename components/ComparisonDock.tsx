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
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-neutral-950/95 dark:bg-white/95 text-white dark:text-neutral-950 backdrop-blur-xl rounded-3xl p-3 px-5 shadow-2xl border border-neutral-800 dark:border-neutral-200 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">
              Compare Phones ({comparingPhones.length}/3)
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-600 hidden sm:block">
              Side-by-side hardware & PTA comparison
            </div>
          </div>
        </div>

        {/* Selected Thumbnails */}
        <div className="flex items-center gap-2">
          {comparingPhones.map((phone) => (
            <div
              key={phone.id}
              className="relative w-10 h-10 rounded-xl bg-neutral-900 dark:bg-neutral-100 p-1 border border-neutral-800 dark:border-neutral-300 flex items-center justify-center"
            >
              <PhoneImageWithFallback
                src={phone.colors[0]?.image}
                alt={phone.name}
                brand={phone.brand}
                className="w-full h-full"
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

          {/* Add more placeholder slots */}
          {Array.from({ length: 3 - comparingPhones.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-10 h-10 rounded-xl border border-dashed border-neutral-700 dark:border-neutral-300 hidden sm:flex items-center justify-center text-[10px] text-neutral-500 font-bold"
            >
              +{i + 1}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black hidden sm:block"
          >
            Clear
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 btn-press btn-shimmer cursor-pointer"
          >
            <span>Compare Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Comparison Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Side-by-Side Matrix
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                    Smartphone Comparison
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Comparing verified hardware specs, PTA approval, and official Pakistani prices.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close comparison modal"
                className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Comparison Matrix */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {comparingPhones.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    No Phones Selected for Comparison
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Click the &quot;Compare&quot; button on any phone card to compare up to 3 smartphones side-by-side!
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-2 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors"
                  >
                    Browse Smartphones
                  </button>
                </div>
              ) : (
                <>
                  {/* Top Overview Cards */}
                  <div
                    className="grid gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800"
                    style={{
                      gridTemplateColumns: `repeat(${comparingPhones.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {comparingPhones.map((phone) => (
                      <div
                        key={phone.id}
                        className="flex flex-col items-center text-center p-4 bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-800"
                      >
                        <Link
                          href={`/product/${phone.slug}`}
                          onClick={() => setModalOpen(false)}
                          className="relative w-28 h-36 mb-3 hover:scale-105 transition-transform"
                        >
                          <PhoneImageWithFallback
                            src={phone.colors[0]?.image}
                            alt={phone.name}
                            brand={phone.brand}
                            className="w-full h-full"
                          />
                        </Link>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {phone.brand}
                        </span>
                        <Link
                          href={`/product/${phone.slug}`}
                          onClick={() => setModalOpen(false)}
                        >
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1 mt-0.5 hover:text-blue-600">
                            {phone.name}
                          </h3>
                        </Link>
                        <div className="text-base font-black text-neutral-950 dark:text-white mt-1">
                      {formatPKR(phone.basePricePKR)}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      PTA Approved
                    </span>

                    {onSelectForCart && (
                      <button
                        onClick={() => {
                          onSelectForCart(phone);
                          setModalOpen(false);
                        }}
                        className="w-full mt-3 py-1.5 px-3 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
                      >
                        Buy This Model
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Spec Rows Comparison */}
              <div className="space-y-4 pt-6 text-xs">
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
                    <div className="font-bold text-[11px] uppercase tracking-wider text-neutral-400">
                      {row.category}
                    </div>
                    <div
                      className="grid gap-4 bg-neutral-50 dark:bg-neutral-950/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80"
                      style={{
                        gridTemplateColumns: `repeat(${comparingPhones.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {comparingPhones.map((phone) => (
                        <div
                          key={phone.id}
                          className="font-medium text-neutral-800 dark:text-neutral-200 break-words leading-relaxed"
                        >
                          {row.getter(phone)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

