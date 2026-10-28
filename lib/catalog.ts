import { Smartphone } from '@/types';
import { SMARTPHONES } from '@/data/smartphones';

const DELETED_KEY = 'hamzastore_deleted_ids';
const CUSTOM_KEY = 'hamzastore_custom_products';
const SYNC_KEY = 'hamzastore_catalog_version';
const LEGACY_DELETED_KEY = 'voltphone_deleted_ids';
const LEGACY_CUSTOM_KEY = 'voltphone_custom_products';

/**
 * Returns an array of phone IDs or slugs that have been marked deleted by the admin.
 */
export function getLocalDeletedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY) || localStorage.getItem(LEGACY_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Returns array of phones created or updated locally in the admin panel.
 */
export function getLocalCustomProducts(): Smartphone[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_KEY) || localStorage.getItem(LEGACY_CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Filters and merges catalog data in real time:
 * - Removes any deleted product IDs/slugs.
 * - Applies any added/edited product updates from admin.
 */
export function getActiveCatalog(baseList: Smartphone[] = SMARTPHONES): Smartphone[] {
  if (typeof window === 'undefined') return baseList;

  const deleted = getLocalDeletedIds();
  const custom = getLocalCustomProducts();

  // Create a map of custom/updated phones
  const customMap = new Map<string, Smartphone>();
  custom.forEach((p) => {
    if (p.id) customMap.set(p.id, p);
    if (p.slug) customMap.set(p.slug, p);
  });

  // Apply updates to existing base list
  let result = baseList.map((p) => {
    const updated = customMap.get(p.id) || (p.slug ? customMap.get(p.slug) : undefined);
    return updated ? updated : p;
  });

  // Prepend any newly added custom phones that are not yet in the base list
  custom.forEach((p) => {
    const exists = result.some((item) => item.id === p.id || (p.slug && item.slug === p.slug));
    if (!exists) {
      result.unshift(p);
    }
  });

  // Filter out any deleted products
  if (deleted.length > 0) {
    const deletedSet = new Set(deleted.map((d) => d.toLowerCase()));
    result = result.filter(
      (p) => !deletedSet.has(p.id?.toLowerCase()) && !deletedSet.has(p.slug?.toLowerCase())
    );
  }

  return result;
}

/**
 * Permanently marks a product as deleted in client storage and notifies all open tabs.
 */
export function markProductDeletedLocally(phoneId: string, slug?: string) {
  if (typeof window === 'undefined') return;

  const deleted = getLocalDeletedIds();
  if (phoneId && !deleted.includes(phoneId)) deleted.push(phoneId);
  if (slug && !deleted.includes(slug)) deleted.push(slug);

  localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));

  // Also remove from custom products
  const custom = getLocalCustomProducts().filter(
    (p) => p.id !== phoneId && (!slug || p.slug !== slug)
  );
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));

  // Dispatch sync event for immediate reactive state updates
  localStorage.setItem(SYNC_KEY, Date.now().toString());
  window.dispatchEvent(new Event('hamzastore_products_updated'));
  window.dispatchEvent(new Event('voltphone_products_updated'));
}

/**
 * Saves or updates a product in client storage and notifies all open tabs.
 */
export function saveProductLocally(product: Smartphone) {
  if (typeof window === 'undefined') return;

  // Ensure it's not marked as deleted
  const deleted = getLocalDeletedIds().filter(
    (id) => id.toLowerCase() !== product.id?.toLowerCase() && id.toLowerCase() !== product.slug?.toLowerCase()
  );
  localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));

  // Upsert in custom products
  const custom = getLocalCustomProducts().filter(
    (p) => p.id !== product.id && p.slug !== product.slug
  );
  custom.unshift(product);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));

  // Dispatch sync
  localStorage.setItem(SYNC_KEY, Date.now().toString());
  window.dispatchEvent(new Event('hamzastore_products_updated'));
  window.dispatchEvent(new Event('voltphone_products_updated'));
}
