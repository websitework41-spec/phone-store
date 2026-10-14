'use client';

import React, { useState, useEffect, memo } from 'react';
import { Clock } from 'lucide-react';

/**
 * Isolated Countdown Timer
 * Prevents root Home page and phone grid from re-rendering every 1000ms.
 */
export const FlashSaleCountdown = memo(function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-bold shadow-md shadow-slate-950/20 border border-slate-800 hover:scale-105 transition-all duration-200 cursor-default">
      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
      <span className="text-slate-400 text-[11px]">Deals Expire In:</span>
      <span className="font-mono text-cyan-300 font-extrabold tracking-wider">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
});
