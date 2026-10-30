'use client';

import { useEffect } from 'react';

/**
 * Universal Click Interactivity Engine:
 * - Immediate tactile squish compression on pointerdown
 * - Elastic spring-pop rebound on click release
 * - Radiant shockwave pulse ring expanding outward
 * - High-contrast liquid ripple radiating from cursor coordinates
 * - Radial micro-sparkle particles for conversion CTA buttons
 * - Native hardware haptic feedback on mobile devices
 * - Keyboard (Enter / Space) tactile depression and rebound
 */
export function ButtonRipple() {
  useEffect(() => {
    let currentPressedEl: HTMLElement | null = null;

    function handlePointerDown(e: PointerEvent) {
      // Find closest button or button-like element
      const target = (e.target as HTMLElement | null)?.closest(
        'button, [role="button"], .btn-press, .btn-interactive, a.btn-press, input[type="button"], input[type="submit"]'
      ) as HTMLElement | null;

      if (!target) return;

      // Don't animate disabled buttons or exempted elements
      if (
        target.hasAttribute('disabled') ||
        target.getAttribute('aria-disabled') === 'true' ||
        target.classList.contains('disabled') ||
        target.classList.contains('cursor-not-allowed') ||
        target.classList.contains('brand-nav-pill') ||
        target.classList.contains('no-ripple') ||
        target.classList.contains('no-press') ||
        target.closest('.no-ripple')
      ) {
        return;
      }

      currentPressedEl = target;

      // 1. Mobile Hardware Haptic Pulse (Taptic feedback)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(18);
        } catch {
          // ignore
        }
      }

      // 2. Immediate tactile squish
      target.classList.add('btn-pressed');

      // 3. Shockwave ring expanding outward from the button border
      const shockwave = document.createElement('span');
      shockwave.className = 'btn-shockwave-ring';
      target.appendChild(shockwave);
      setTimeout(() => {
        try {
          shockwave.remove();
        } catch {}
      }, 520);

      // 4. Coordinates for high-contrast liquid ripple
      const rect = target.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 2;
      const radius = diameter / 2;
      const x = e.clientX - rect.left - radius;
      const y = e.clientY - rect.top - radius;

      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple-wave';
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Check background color for high-visibility contrast
      const computedBg = window.getComputedStyle(target).backgroundColor;
      const isDark = isDarkColor(computedBg);
      ripple.style.background = isDark
        ? 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 40%, rgba(6, 182, 212, 0.2) 60%, transparent 75%)'
        : 'radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, rgba(6, 182, 212, 0.35) 40%, rgba(14, 165, 233, 0.15) 60%, transparent 75%)';

      const computedPos = window.getComputedStyle(target).position;
      if (computedPos === 'static') {
        target.style.position = 'relative';
      }

      const hadOverflowHidden = target.classList.contains('overflow-hidden');
      if (!target.classList.contains('overflow-visible') && !hadOverflowHidden) {
        target.classList.add('overflow-hidden');
      }

      target.appendChild(ripple);

      setTimeout(() => {
        try {
          ripple.remove();
          if (!hadOverflowHidden) {
            target.classList.remove('overflow-hidden');
          }
        } catch {}
      }, 560);

      // 5. Spawn micro-burst particles for prominent CTA buttons
      const text = target.textContent?.toLowerCase() || '';
      const isPrimary =
        target.classList.contains('btn-shimmer') ||
        target.classList.contains('bg-cyan-500') ||
        target.classList.contains('bg-cyan-600') ||
        target.classList.contains('bg-blue-600') ||
        target.classList.contains('bg-slate-950') ||
        text.includes('buy') ||
        text.includes('cart') ||
        text.includes('order') ||
        text.includes('shop') ||
        text.includes('compare');

      if (isPrimary && e.clientX && e.clientY) {
        spawnBurstParticles(e.clientX, e.clientY);
      }
    }

    function handlePointerUp() {
      // Clean up all stray pressed elements in document to prevent any button staying stuck/squished
      document.querySelectorAll('.btn-pressed').forEach((p) => p.classList.remove('btn-pressed'));

      if (!currentPressedEl) return;
      const el = currentPressedEl;
      currentPressedEl = null;

      // Trigger elastic spring-pop rebound
      el.classList.remove('btn-spring-active');
      void el.offsetWidth; // Force DOM reflow to retrigger animation
      el.classList.add('btn-spring-active');

      setTimeout(() => {
        try {
          el.classList.remove('btn-spring-active');
        } catch {}
      }, 420);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const target = (e.target as HTMLElement | null)?.closest(
        'button, [role="button"]'
      ) as HTMLElement | null;
      if (!target || target.hasAttribute('disabled')) return;
      target.classList.add('btn-pressed');
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const target = (e.target as HTMLElement | null)?.closest(
        'button, [role="button"]'
      ) as HTMLElement | null;
      if (!target) return;
      target.classList.remove('btn-pressed');
      target.classList.remove('btn-spring-active');
      void target.offsetWidth;
      target.classList.add('btn-spring-active');
      setTimeout(() => {
        try {
          target.classList.remove('btn-spring-active');
        } catch {}
      }, 420);
    }

    function spawnBurstParticles(originX: number, originY: number) {
      const colors = ['#06b6d4', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
      const particleCount = 7;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'btn-click-particle';
        const size = Math.floor(Math.random() * 5) + 4; // 4px to 8px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${originX - size / 2}px`;
        particle.style.top = `${originY - size / 2}px`;
        particle.style.backgroundColor = colors[i % colors.length];

        // Random 360-degree angle and distance
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const distance = Math.floor(Math.random() * 26) + 24; // 24px - 50px
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);

        document.body.appendChild(particle);

        setTimeout(() => {
          try {
            particle.remove();
          } catch {}
        }, 500);
      }
    }

    function isDarkColor(colorStr: string): boolean {
      if (!colorStr || colorStr === 'transparent' || colorStr.includes('rgba(0, 0, 0, 0)')) {
        return false;
      }
      const match = colorStr.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0], 10);
        const g = parseInt(match[1], 10);
        const b = parseInt(match[2], 10);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance < 145;
      }
      return false;
    }

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    window.addEventListener('blur', handlePointerUp, { passive: true });
    document.addEventListener('visibilitychange', handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handlePointerUp);
      document.removeEventListener('visibilitychange', handlePointerUp);
    };
  }, []);

  return null;
}
