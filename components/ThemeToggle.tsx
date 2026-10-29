'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'adaptive' | 'pill' | 'minimal';
}

export function ThemeToggle({
  className = '',
  variant = 'adaptive',
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR placeholder to prevent layout shifts & hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`w-7 h-7 sm:w-14 sm:h-7.5 rounded-full bg-white/20 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const renderPill = (extraClasses = '') => (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (Ctrl+Shift+D)' : 'Switch to Dark Mode (Ctrl+Shift+D)'}
      className={`group relative items-center justify-between w-14 h-7 sm:w-15 sm:h-7.5 p-0.5 sm:p-1 rounded-full cursor-pointer select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sky-300 active:scale-95 ${
        isDark
          ? 'bg-slate-900/90 border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
          : 'bg-white/30 hover:bg-white/40 border border-white/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]'
      } ${extraClasses}`}
    >
      {/* Sun Icon slot (Left) */}
      <span
        className={`flex items-center justify-center w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-300 z-10 ${
          !isDark ? 'text-amber-300 scale-100 opacity-100' : 'text-slate-500 scale-75 opacity-40 group-hover:opacity-75'
        }`}
      >
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
      </span>

      {/* Moon Icon slot (Right) */}
      <span
        className={`flex items-center justify-center w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-300 z-10 ${
          isDark ? 'text-cyan-300 scale-100 opacity-100' : 'text-white/60 scale-75 opacity-40 group-hover:opacity-75'
        }`}
      >
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.4]" />
      </span>

      {/* Sliding Thumb Knob with dynamic glow */}
      <span
        className={`absolute top-0.5 sm:top-1 w-6 h-6 sm:w-5.5 sm:h-5.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center pointer-events-none shadow-md ${
          isDark
            ? 'left-[calc(100%-1.65rem)] sm:left-[calc(100%-1.65rem)] bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.65)]'
            : 'left-0.5 sm:left-1 bg-white text-amber-500 shadow-[0_2px_8px_rgba(0,0,0,0.22)]'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white fill-white/20 animate-in fade-in zoom-in-75 duration-200" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40 animate-in fade-in zoom-in-75 duration-200" />
        )}
      </span>
    </button>
  );

  const renderMinimal = (extraClasses = '') => (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (Ctrl+Shift+D)' : 'Switch to Dark Mode (Ctrl+Shift+D)'}
      className={`btn-press relative items-center justify-center w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full transition-all duration-300 cursor-pointer shadow-xs border ${
        isDark
          ? 'bg-slate-900 text-cyan-300 border-slate-700/80 hover:bg-slate-800 hover:text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
          : 'bg-white hover:bg-slate-50 text-[#0b3c68] border-white/40 hover:shadow-md'
      } ${extraClasses}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 rotate-0 hover:rotate-45 transition-transform duration-300 stroke-[2.2]" />
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0b3c68] rotate-0 hover:-rotate-12 transition-transform duration-300 stroke-[2.2]" />
      )}
    </button>
  );

  if (variant === 'pill') {
    return renderPill(className);
  }

  if (variant === 'minimal') {
    return renderMinimal(className);
  }

  // Adaptive: Minimal icon button on compact mobile screens, full luxury sliding pill on sm+
  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      {renderMinimal('flex sm:hidden')}
      {renderPill('hidden sm:inline-flex')}
    </div>
  );
}
