'use client';

import React, { useState, useEffect, memo } from 'react';
import { Clock } from 'lucide-react';

const DEADLINE_KEY = 'hamzastore_flash_sale_deadline';

function getOrSetFixedDeadline(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem(DEADLINE_KEY);
    const now = Date.now();
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > now) {
        return parsed;
      }
    }
    // Set fixed deadline: next PKT midnight (persisted across all loads)
    const nowPkt = new Date();
    nowPkt.setHours(24, 0, 0, 0);
    const newDeadline = nowPkt.getTime();
    localStorage.setItem(DEADLINE_KEY, newDeadline.toString());
    return newDeadline;
  } catch {
    return Date.now() + 14 * 3600 * 1000;
  }
}

function calculateTimeLeft(deadline: number) {
  const diffMs = Math.max(0, deadline - Date.now());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

/**
 * Isolated Countdown Timer
 * Synchronized with a fixed deadline persisted across page loads in localStorage.
 * Guaranteed no erratic jumps or fake resets.
 */
export const FlashSaleCountdown = memo(function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const deadline = getOrSetFixedDeadline();
    setTimeLeft(calculateTimeLeft(deadline));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#136ab5] text-white text-xs font-bold shadow-md shadow-[#136ab5]/20 border border-[#48afff]/40">
        <Clock className="w-3.5 h-3.5 text-white" />
        <span className="text-sky-200 text-[11px]">Daily Flash Deals</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#136ab5] text-white text-xs font-bold shadow-md shadow-[#136ab5]/25 border border-[#48afff]/50 hover:scale-105 transition-all duration-200 cursor-default">
      <Clock className="w-3.5 h-3.5 text-[#48afff] animate-spin" style={{ animationDuration: '6s' }} />
      <span className="text-sky-100 text-[11px]">Deals Expire In:</span>
      <span className="font-mono text-white font-extrabold tracking-wider bg-black/20 px-2 py-0.5 rounded-lg border border-white/20">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
});
