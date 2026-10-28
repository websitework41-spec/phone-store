'use client';

import React, { useState, memo } from 'react';
import { Smartphone as PhoneIcon } from 'lucide-react';
import { sanitizeText } from '@/lib/security';

interface PhoneImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  brand?: string;
  priority?: boolean;
}

export const PhoneImageWithFallback = memo(function PhoneImageWithFallback({
  src,
  alt,
  className = '',
  brand = '',
  priority = false,
}: PhoneImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const safeAlt = sanitizeText(alt, 100);
  const safeBrand = sanitizeText(brand, 40);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-white rounded-2xl p-4 text-slate-400 ${className}`}
        aria-label={safeAlt}
      >
        <div className="relative w-20 h-32 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-between p-2 shadow-inner bg-slate-50">
          <div className="w-6 h-1 bg-slate-300 rounded-full" />
          <PhoneIcon className="w-7 h-7 text-slate-400 stroke-[1.5]" />
          <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
            {safeBrand || 'PHONE'}
          </span>
        </div>
        <span className="mt-2 text-[11px] font-medium text-slate-400 text-center line-clamp-1 max-w-[160px]">
          {safeAlt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={safeAlt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 will-change-transform"
        onError={() => setHasError(true)}
      />
    </div>
  );
});
