import fs from 'fs';
import path from 'path';
import { VisitorSession, AnalyticsStats, ProductViewEvent } from '@/types';

const analyticsFilePath = path.join(process.cwd(), 'data', 'analytics.json');

// Helper to get today's date string YYYY-MM-DD
export function getTodayDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Helper to get month string YYYY-MM
export function getMonthString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function getAnalyticsSessions(): VisitorSession[] {
  try {
    if (fs.existsSync(analyticsFilePath)) {
      const data = fs.readFileSync(analyticsFilePath, 'utf-8');
      return JSON.parse(data) as VisitorSession[];
    }
  } catch (err) {
    console.error('Error reading analytics.json:', err);
  }
  return [];
}

export function saveAnalyticsSessions(sessions: VisitorSession[]): boolean {
  try {
    // Keep max 500 recent sessions to prevent unbounded growth
    const trimmed = sessions.slice(0, 500);
    fs.writeFileSync(analyticsFilePath, JSON.stringify(trimmed, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing analytics.json:', err);
    return false;
  }
}

export interface RecordEventPayload {
  visitorId: string;
  event: 'page_view' | 'heartbeat' | 'product_view' | 'cart_add' | 'checkout_start' | 'purchase';
  path: string;
  city?: string;
  device?: string;
  customerName?: string;
  phone?: string;
  product?: {
    phoneId: string;
    name: string;
    brand: string;
    slug: string;
    image: string;
    pricePKR: number;
  };
  orderId?: string;
}

export function recordVisitorEvent(payload: RecordEventPayload): VisitorSession {
  const sessions = getAnalyticsSessions();
  const now = new Date().toISOString();

  let session = sessions.find((s) => s.visitorId === payload.visitorId);

  if (!session) {
    session = {
      visitorId: payload.visitorId,
      customerName: payload.customerName,
      phone: payload.phone,
      city: payload.city || 'Lahore',
      device: payload.device || 'Mobile (Android)',
      firstSeen: now,
      lastSeen: now,
      isOnline: true,
      pageViewsCount: 1,
      currentPath: payload.path,
      hasPurchased: payload.event === 'purchase',
      orderIds: payload.orderId ? [payload.orderId] : [],
      viewedProducts: [],
    };
    sessions.unshift(session);
  } else {
    session.lastSeen = now;
    session.isOnline = true;
    session.currentPath = payload.path;
    if (payload.event === 'page_view') {
      session.pageViewsCount = (session.pageViewsCount || 0) + 1;
    }
    if (payload.city && payload.city !== 'Unknown') session.city = payload.city;
    if (payload.device) session.device = payload.device;
    if (payload.customerName) session.customerName = payload.customerName;
    if (payload.phone) session.phone = payload.phone;

    if (payload.event === 'purchase') {
      session.hasPurchased = true;
      if (payload.orderId && !session.orderIds?.includes(payload.orderId)) {
        session.orderIds = [...(session.orderIds || []), payload.orderId];
      }
    }
  }

  // Handle product interaction
  if (payload.product && payload.product.phoneId) {
    if (!session.viewedProducts) session.viewedProducts = [];

    const existingProductIndex = session.viewedProducts.findIndex(
      (p) => p.phoneId === payload.product!.phoneId || p.slug === payload.product!.slug
    );

    let action: ProductViewEvent['action'] = 'viewed';
    if (payload.event === 'cart_add') action = 'added_to_cart';
    if (payload.event === 'checkout_start') action = 'initiated_checkout';

    const productEvent: ProductViewEvent = {
      phoneId: payload.product.phoneId,
      name: payload.product.name,
      brand: payload.product.brand,
      slug: payload.product.slug,
      image: payload.product.image,
      pricePKR: payload.product.pricePKR,
      viewedAt: now,
      action: action,
    };

    if (existingProductIndex >= 0) {
      // Update action if higher intent
      const prevAction = session.viewedProducts[existingProductIndex].action;
      if (
        action === 'initiated_checkout' ||
        (action === 'added_to_cart' && prevAction !== 'initiated_checkout')
      ) {
        productEvent.action = action;
      } else {
        productEvent.action = prevAction || action;
      }
      session.viewedProducts[existingProductIndex] = productEvent;
    } else {
      session.viewedProducts.unshift(productEvent);
    }
  }

  saveAnalyticsSessions(sessions);
  return session;
}

export function computeAnalyticsStats(): AnalyticsStats {
  const sessions = getAnalyticsSessions();
  const now = Date.now();
  const THREE_MINUTES = 3 * 60 * 1000;
  const todayStr = getTodayDateString();
  const monthStr = getMonthString();

  let activeNow = 0;
  const todayVisitorsSet = new Set<string>();
  const monthVisitorsSet = new Set<string>();
  let todayPageViews = 0;
  let monthPageViews = 0;

  const unpurchasedVisitors: VisitorSession[] = [];
  const productAggMap = new Map<
    string,
    {
      phoneId: string;
      name: string;
      brand: string;
      slug: string;
      image: string;
      pricePKR: number;
      unpurchasedViewsCount: number;
      addedToCartCount: number;
    }
  >();

  sessions.forEach((s) => {
    const lastSeenTime = new Date(s.lastSeen).getTime();
    const isOnline = now - lastSeenTime <= THREE_MINUTES;
    s.isOnline = isOnline;

    if (isOnline) {
      activeNow++;
    }

    const lastSeenDate = s.lastSeen ? s.lastSeen.split('T')[0] : '';
    const firstSeenDate = s.firstSeen ? s.firstSeen.split('T')[0] : '';
    const lastSeenMonth = s.lastSeen ? s.lastSeen.slice(0, 7) : '';
    const firstSeenMonth = s.firstSeen ? s.firstSeen.slice(0, 7) : '';

    if (lastSeenDate === todayStr || firstSeenDate === todayStr) {
      todayVisitorsSet.add(s.visitorId);
      todayPageViews += s.pageViewsCount || 1;
    }

    if (lastSeenMonth === monthStr || firstSeenMonth === monthStr) {
      monthVisitorsSet.add(s.visitorId);
      monthPageViews += s.pageViewsCount || 1;
    }

    // Check if visitor viewed products but did NOT purchase
    if (!s.hasPurchased && Array.isArray(s.viewedProducts) && s.viewedProducts.length > 0) {
      unpurchasedVisitors.push(s);

      s.viewedProducts.forEach((p) => {
        const key = p.phoneId || p.slug;
        const existing = productAggMap.get(key) || {
          phoneId: p.phoneId,
          name: p.name,
          brand: p.brand,
          slug: p.slug,
          image: p.image,
          pricePKR: p.pricePKR,
          unpurchasedViewsCount: 0,
          addedToCartCount: 0,
        };
        existing.unpurchasedViewsCount++;
        if (p.action === 'added_to_cart' || p.action === 'initiated_checkout') {
          existing.addedToCartCount++;
        }
        productAggMap.set(key, existing);
      });
    }
  });

  // Sort unpurchased visitors by most recent activity
  unpurchasedVisitors.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  // Sort top unpurchased products by view count descending
  const topUnpurchasedProducts = Array.from(productAggMap.values())
    .sort((a, b) => b.unpurchasedViewsCount - a.unpurchasedViewsCount)
    .slice(0, 6);

  return {
    activeNow,
    todayVisitors: todayVisitorsSet.size,
    monthVisitors: monthVisitorsSet.size,
    todayPageViews,
    monthPageViews,
    unpurchasedLeadsCount: unpurchasedVisitors.length,
    unpurchasedVisitors,
    topUnpurchasedProducts,
  };
}
