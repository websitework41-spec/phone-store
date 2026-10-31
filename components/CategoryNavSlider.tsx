'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

export const STORE_CATEGORIES: CategoryItem[] = [
  {
    id: 'mobiles',
    name: 'Mobiles',
    image: '/images/categories/mobiles.webp',
  },
  {
    id: 'wireless-earbuds',
    name: 'Wireless Earbuds',
    image: '/images/categories/wireless-earbuds.webp',
  },
  {
    id: 'smart-watches',
    name: 'Smart Watches',
    image: '/images/categories/smart-watches.webp',
  },
  {
    id: 'trimmers-shaver',
    name: 'Trimmers Shaver',
    image: '/images/categories/trimmers-shaver.webp',
  },
  {
    id: 'power-banks',
    name: 'Power Banks',
    image: '/images/categories/power-banks.webp',
  },
  {
    id: 'wall-chargers',
    name: 'Wall Chargers',
    image: '/images/categories/wall-chargers.webp',
  },
  {
    id: 'bluetooth-speakers',
    name: 'Bluetooth Speakers',
    image: '/images/categories/bluetooth-speakers.webp',
  },
  {
    id: 'tablets',
    name: 'Tablets',
    image: '/images/categories/tablets.webp',
  },
  {
    id: 'laptops',
    name: 'Laptops',
    image: '/images/categories/laptops.webp',
  },
];

interface CategoryNavSliderProps {
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export function CategoryNavSlider({
  selectedCategory,
  onSelectCategory,
}: CategoryNavSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateScrollState();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', updateScrollState, { passive: true });
    }
    window.addEventListener('resize', updateScrollState);
    return () => {
      if (current) {
        current.removeEventListener('scroll', updateScrollState);
      }
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleItemClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-t-2 border-[#136ab5] border-b border-slate-200/80 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative flex items-center py-2.5 sm:py-3.5">
        {/* Left Navigation Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Previous categories"
          className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer mr-1 sm:mr-2 z-10 ${
            canScrollLeft
              ? 'bg-[#e5e7eb] dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#d1d5db] active:scale-95 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Scrollable Categories List */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center justify-between sm:justify-start gap-4 sm:gap-8 lg:gap-11 overflow-x-auto scrollbar-none scroll-smooth px-1"
        >
          {STORE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleItemClick(category.id)}
                className={`group shrink-0 flex flex-col items-center justify-center text-center py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[76px] sm:min-w-[90px] relative ${
                  isSelected
                    ? 'text-[#136ab5] dark:text-[#48afff]'
                    : 'text-slate-800 dark:text-slate-200 hover:text-[#136ab5] dark:hover:text-[#48afff]'
                }`}
              >
                {/* Product / Category Icon / Image */}
                <div className="relative w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-110">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={52}
                    height={52}
                    className="w-auto h-10 sm:h-12 object-contain pointer-events-none drop-shadow-xs"
                    priority
                    unoptimized
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`text-[11px] sm:text-[12.5px] font-bold tracking-tight whitespace-nowrap transition-colors duration-150 ${
                    isSelected
                      ? 'text-[#136ab5] dark:text-[#48afff] font-extrabold'
                      : 'text-slate-900 dark:text-slate-100 group-hover:text-[#136ab5] dark:group-hover:text-[#48afff]'
                  }`}
                >
                  {category.name}
                </span>

                {/* Active Indicator Underline */}
                {isSelected && (
                  <span className="absolute -bottom-1.5 left-2 right-2 h-0.5 bg-[#136ab5] dark:bg-[#48afff] rounded-full animate-in fade-in zoom-in-75 duration-150" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Navigation Arrow */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Next categories"
          className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ml-1 sm:ml-2 z-10 ${
            canScrollRight
              ? 'bg-[#4b5563] hover:bg-[#374151] dark:bg-slate-700 dark:hover:bg-slate-600 text-white active:scale-95 shadow-sm'
              : 'bg-slate-200 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
