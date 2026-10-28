'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, CheckCircle2, PackageCheck, Zap } from 'lucide-react';
import { PAKISTAN_CITIES } from '@/data/smartphones';

interface DeliveryEstimatorCountdownProps {
  className?: string;
  defaultCity?: string;
}

export function DeliveryEstimatorCountdown({
  className = '',
  defaultCity = 'Lahore',
}: DeliveryEstimatorCountdownProps) {
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isSameDay: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isSameDay: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateCountdown = () => {
      // Calculate Pakistan Time (UTC + 5)
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const pktTime = new Date(utcTime + 5 * 3600000);

      // Daily dispatch cutoff: 4:00 PM (16:00:00) PKT
      const cutoff = new Date(pktTime);
      cutoff.setHours(16, 0, 0, 0);

      let isSameDay = true;
      let diffMs = cutoff.getTime() - pktTime.getTime();

      // If past 4:00 PM PKT today, count down to tomorrow's 4:00 PM cutoff
      if (diffMs <= 0) {
        isSameDay = false;
        cutoff.setDate(cutoff.getDate() + 1);
        diffMs = cutoff.getTime() - pktTime.getTime();
      }

      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, isSameDay });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute estimated delivery date based on selected city & cutoff
  const getDeliveryEstimate = () => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const pktTime = new Date(utcTime + 5 * 3600000);

    const isAfterCutoff = pktTime.getHours() >= 16;
    const dispatchOffsetDays = isAfterCutoff ? 1 : 0;

    // Fast transit tier cities (Major hubs)
    const tier1Cities = ['Lahore', 'Islamabad', 'Rawalpindi'];
    const tier2Cities = ['Karachi', 'Faisalabad', 'Multan', 'Gujranwala', 'Peshawar', 'Sialkot'];

    let transitDaysMin = 2;
    let transitDaysMax = 3;

    if (tier1Cities.includes(selectedCity)) {
      transitDaysMin = 1;
      transitDaysMax = 2;
    } else if (tier2Cities.includes(selectedCity)) {
      transitDaysMin = 1;
      transitDaysMax = 2;
    } else {
      transitDaysMin = 2;
      transitDaysMax = 3;
    }

    const minDate = new Date(pktTime);
    minDate.setDate(minDate.getDate() + dispatchOffsetDays + transitDaysMin);

    const maxDate = new Date(pktTime);
    maxDate.setDate(maxDate.getDate() + dispatchOffsetDays + transitDaysMax);

    const formatDay = (d: Date) =>
      d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

    return {
      minStr: formatDay(minDate),
      maxStr: formatDay(maxDate),
      transitTime:
        transitDaysMin === 1 ? '24 Hours (Next Day)' : `${transitDaysMin * 24}-${transitDaysMax * 24} Hours`,
    };
  };

  const estimate = getDeliveryEstimate();

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div
      className={`rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-blue-50/40 p-4 space-y-3 shadow-xs ${className}`}
    >
      {/* Ticking Countdown Bar */}
      <div className="flex items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-sky-100/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0b3c68] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-4 h-4 animate-pulse text-sky-300" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{timeLeft.isSameDay ? 'Order for Today’s Dispatch!' : 'Next Morning Dispatch Batch'}</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                TCS Express
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {timeLeft.isSameDay
                ? 'Order before 4:00 PM PKT for same-day warehouse dispatch:'
                : 'Order before 4:00 PM PKT tomorrow:'}
            </p>
          </div>
        </div>

        {/* Digital Countdown Timer */}
        {mounted && (
          <div className="flex items-center gap-1 text-slate-900 shrink-0 font-mono">
            <div className="bg-[#0b3c68] text-white px-2 py-1 rounded-lg text-xs font-black shadow-2xs">
              {pad(timeLeft.hours)}
              <span className="text-[9px] block text-sky-200 font-normal">hrs</span>
            </div>
            <span className="font-black text-slate-400">:</span>
            <div className="bg-[#0b3c68] text-white px-2 py-1 rounded-lg text-xs font-black shadow-2xs">
              {pad(timeLeft.minutes)}
              <span className="text-[9px] block text-sky-200 font-normal">min</span>
            </div>
            <span className="font-black text-slate-400">:</span>
            <div className="bg-[#0b3c68] text-white px-2 py-1 rounded-lg text-xs font-black shadow-2xs">
              {pad(timeLeft.seconds)}
              <span className="text-[9px] block text-sky-200 font-normal">sec</span>
            </div>
          </div>
        )}
      </div>

      {/* City Delivery Estimator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0b3c68] shrink-0" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Delivering to: </span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="font-bold text-slate-900 bg-transparent underline decoration-[#0b3c68] decoration-2 underline-offset-2 cursor-pointer focus:outline-none"
            >
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right sm:text-right">
          <div className="text-xs font-black text-emerald-800 flex items-center sm:justify-end gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Expected by <strong>{estimate.minStr}</strong> – <strong>{estimate.maxStr}</strong>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Transit: {estimate.transitTime} • Free Express Shipping (Rs. 0)
          </div>
        </div>
      </div>

      {/* Open Parcel Guarantee Banner */}
      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center gap-2 text-amber-900 text-[11px] font-medium">
        <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Open-Parcel Protection:</strong> Inspect box seal, IMEI, &amp; warranty card before paying cash to rider!
        </span>
      </div>
    </div>
  );
}
