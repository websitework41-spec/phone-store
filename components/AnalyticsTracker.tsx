'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const VISITOR_ID_KEY = 'hamzastore_visitor_id';

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'VIS-000000';
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `VIS-${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function detectDevice(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Mobile (Android)';
  if (/iPad|iPhone|iPod/.test(ua)) return 'Mobile (iOS)';
  if (/Windows/i.test(ua)) return 'Desktop (Windows)';
  if (/Macintosh/i.test(ua)) return 'Desktop (macOS)';
  if (/Linux/i.test(ua)) return 'Desktop (Linux)';
  return 'Desktop';
}

interface ProductPayload {
  phoneId: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  pricePKR: number;
}

export function emitAnalyticsEvent(
  event: 'page_view' | 'heartbeat' | 'product_view' | 'cart_add' | 'checkout_start' | 'purchase',
  product?: ProductPayload,
  orderId?: string
) {
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateVisitorId();
  const device = detectDevice();
  const path = window.location.pathname;

  let customerName = undefined;
  let phone = undefined;
  let city = undefined;

  try {
    const rawProfile = localStorage.getItem('hamzastore_profile');
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      customerName = parsed.name;
      phone = parsed.phone;
      if (parsed.addresses?.[0]?.city) city = parsed.addresses[0].city;
    }
  } catch {}

  const payload = {
    visitorId,
    event,
    path,
    device,
    city: city || 'Pakistan',
    customerName,
    phone,
    product,
    orderId,
  };

  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function trackProductView(product: ProductPayload) {
  emitAnalyticsEvent('product_view', product);
}

export function trackCartAdd(product: ProductPayload) {
  emitAnalyticsEvent('cart_add', product);
}

export function trackCheckoutStart(product?: ProductPayload) {
  emitAnalyticsEvent('checkout_start', product);
}

export function trackPurchase(orderId: string) {
  emitAnalyticsEvent('purchase', undefined, orderId);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // Send page view beacon on pathname change
  useEffect(() => {
    emitAnalyticsEvent('page_view');
  }, [pathname]);

  // Periodic heartbeat every 25 seconds while tab is active
  useEffect(() => {
    const sendHeartbeat = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        emitAnalyticsEvent('heartbeat');
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    heartbeatTimer.current = setInterval(sendHeartbeat, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen to custom window events for cross-component triggers
  useEffect(() => {
    const onProductView = (e: any) => {
      if (e.detail) trackProductView(e.detail);
    };
    const onCartAdd = (e: any) => {
      if (e.detail) trackCartAdd(e.detail);
    };
    const onPurchase = (e: any) => {
      if (e.detail?.orderId) trackPurchase(e.detail.orderId);
    };

    window.addEventListener('track_product_view', onProductView);
    window.addEventListener('track_cart_add', onCartAdd);
    window.addEventListener('track_purchase', onPurchase);

    return () => {
      window.removeEventListener('track_product_view', onProductView);
      window.removeEventListener('track_cart_add', onCartAdd);
      window.removeEventListener('track_purchase', onPurchase);
    };
  }, []);

  return null;
}
