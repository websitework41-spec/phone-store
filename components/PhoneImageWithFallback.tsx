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
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl p-6 text-neutral-400 ${className}`}
        aria-label={safeAlt}
      >
        <div className="relative w-24 h-40 border-4 border-neutral-300 dark:border-neutral-700 rounded-2xl flex flex-col items-center justify-between p-2 shadow-inner">
          <div className="w-8 h-1 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
          <PhoneIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
          <span className="text-[9px] font-semibold tracking-wider uppercase text-neutral-500">
            {safeBrand || 'PHONE'}
          </span>
        </div>
        <span className="mt-3 text-xs font-medium text-neutral-500 text-center line-clamp-1 max-w-[180px]">
          {safeAlt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={safeAlt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain transition-transform duration-300 will-change-transform group-hover:scale-110"
        onError={() => setHasError(true)}
      />
    </div>
  );
});
