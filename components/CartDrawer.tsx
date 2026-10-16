'use client';

import React, { useState, useEffect } from 'react';
import { CartItem } from '@/types';
import { formatPKR, PAKISTAN_CITIES } from '@/data/smartphones';
import { PhoneImageWithFallback } from './PhoneImageWithFallback';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  PackageCheck,
  CheckCircle,
  Truck,
  ArrowRight,
  CreditCard,
  Banknote,
  Building,
  MessageSquare,
} from 'lucide-react';

import {
  sanitizeText,
  validatePakistaniPhone,
  isBotSubmission,
  submissionRateLimiter,
  MAX_INPUT_LENGTHS,
} from '@/lib/security';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const { user, profile } = useAuth();
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'card'>('cod');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot
  const [validationError, setValidationError] = useState('');

  // Auto-prefill customer info when logged in
  useEffect(() => {
    if (user && profile) {
      if (!customerName && (profile.name || user.displayName)) {
        setCustomerName(profile.name || user.displayName || '');
      }
      if (!customerPhone && profile.phone) {
        setCustomerPhone(profile.phone);
      }
      const defaultAddr = profile.addresses?.find((a) => a.isDefault) || profile.addresses?.[0];
      if (defaultAddr) {
        if (!customerAddress) {
          setCustomerAddress(defaultAddr.streetAddress);
        }
        if (defaultAddr.city) {
          setSelectedCity(defaultAddr.city);
        }
      }
    }
  }, [user, profile, isCheckoutStep]);

  if (!isOpen) return null;

  const subtotalPKR = items.reduce(
    (sum, item) => sum + item.selectedVariant.pricePKR * item.quantity,
    0
  );
  const totalSavingsPKR = items.reduce(
    (sum, item) =>
      sum +
      (item.selectedVariant.originalPricePKR - item.selectedVariant.pricePKR) *
        item.quantity,
    0
  );

  const hasOutOfStockItems = items.some(
    (i) => !i.phone.inStock || i.selectedColor.inStock === false || i.selectedVariant.inStock === false
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // 1. Anti-Bot Honeypot Defense
    if (isBotSubmission(honeypot)) {
      console.warn('Bot submission blocked via security honeypot trap.');
      return;
    }

    // 2. Client-side Rate-Limiting Protection (Anti-Spam)
    if (!submissionRateLimiter.isAllowed('cart_checkout_submit', 2500)) {
      setValidationError('Please wait 3 seconds before submitting another request.');
      return;
    }

    if (hasOutOfStockItems) {
      setValidationError('Cannot place order: Some items in your cart are currently out of stock. Please remove them to proceed.');
      return;
    }

    // 3. Input Sanitization against XSS & script injection
    const cleanName = sanitizeText(customerName, MAX_INPUT_LENGTHS.NAME);
    const cleanAddress = sanitizeText(customerAddress, MAX_INPUT_LENGTHS.ADDRESS);

    if (!cleanName || cleanName.length < 3) {
      setValidationError('Please enter a valid recipient full name (minimum 3 characters).');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      setValidationError('Please enter a complete street address (house/flat #, street, area).');
      return;
    }

    // 4. Pakistani Cellular Phone Validation
    const phoneCheck = validatePakistaniPhone(customerPhone);
    if (!phoneCheck.isValid) {
      setValidationError(phoneCheck.errorMessage || 'Invalid Pakistani mobile number.');
      return;
    }

    setCustomerName(cleanName);
    setCustomerPhone(phoneCheck.cleanPhone);
    setCustomerAddress(cleanAddress);

    const orderId = `VPK-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(orderId);

    const orderItemsSummary = items.map(
      (i) => `${i.phone.name} (${i.selectedVariant.ram}/${i.selectedVariant.storage})`
    );

    // Save to Firestore if customer is logged in
    if (user) {
      try {
        const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
        await setDoc(orderDocRef, {
          orderId,
          customerName: cleanName,
          phone: phoneCheck.cleanPhone,
          city: selectedCity,
          address: cleanAddress,
          items: items.map((i) => ({
            name: i.phone.name,
            variant: `${i.selectedVariant.ram}/${i.selectedVariant.storage}`,
            pricePKR: i.selectedVariant.pricePKR,
            quantity: i.quantity,
            color: i.selectedColor.name,
          })),
          totalPKR: subtotalPKR,
          paymentMethod,
          status: 'Placed',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error saving order to Firestore:', err);
      }
    }

    // Always persist to localStorage for guest tracking & offline persistence
    try {
      const newOrder = {
        orderId,
        customerName: cleanName,
        phone: phoneCheck.cleanPhone,
        city: selectedCity,
        address: cleanAddress,
        items: orderItemsSummary,
        totalPKR: subtotalPKR,
        status: 'Order Confirmed — Dispatched via TCS Express. Estimated delivery: 24-48 Hours with Open-Parcel inspection.',
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('voltphone_orders') || '[]');
      localStorage.setItem('voltphone_orders', JSON.stringify([newOrder, ...existing]));
    } catch {
      // ignore
    }

    setOrderSuccess(true);
  };

  const handleResetOrder = () => {
    setOrderSuccess(false);
    setIsCheckoutStep(false);
    setConfirmedOrderId('');
    setValidationError('');
    setHoneypot('');
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {orderSuccess
                  ? 'Order Confirmed!'
                  : isCheckoutStep
                  ? 'Express Pakistani Checkout'
                  : `Your Cart (${items.length})`}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart drawer"
              className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Screen */}
          {orderSuccess ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 stroke-[2.2]" />
              </div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                Mubarak! Order Placed
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-xs">
                Your smartphone order has been dispatched with{' '}
                <strong className="text-neutral-800 dark:text-neutral-200">
                  Open-Parcel Verification
                </strong>
                . You can open and inspect the sealed box before paying the courier!
              </p>

              <div className="w-full bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-left mt-6 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tracking Code:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {confirmedOrderId || 'VPK-786110'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Recipient:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Destination:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {selectedCity}, Pakistan
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Mode:</span>
                  <span className="font-semibold text-emerald-600 uppercase">
                    {paymentMethod === 'cod' ? 'Cash on Delivery (Open Parcel)' : paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold">
                  <span>Total Payable:</span>
                  <span className="text-neutral-950 dark:text-white">
                    {formatPKR(subtotalPKR)}
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/923135221200?text=Hi%20VoltPhone%20PK!%20I%20just%20placed%20an%20order%20and%20need%20tracking%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Helpline: <strong>+92 313 5221200</strong></span>
              </a>

              <button
                onClick={handleResetOrder}
                className="w-full mt-3 py-3 rounded-2xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:bg-blue-600 transition-colors shadow-md"
              >
                Back to Smartphone Catalog
              </button>
            </div>
          ) : isCheckoutStep ? (
            /* Checkout Form */
            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Anti-Bot Security Honeypot (Hidden from human users, traps automated attack bots) */}
              <input
                type="text"
                name="_hp_cart_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="sr-only opacity-0 absolute -z-10 pointer-events-none h-0 w-0"
                aria-hidden="true"
              />

              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <PackageCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Open Parcel Guarantee:</strong> Our rider will let you inspect the PTA seal and handset condition before paying COD!
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Hamza Latif"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Delivery City (Pakistan) *
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {PAKISTAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Complete Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House #, Street, Sector / Area / Landmark"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Inspect open parcel first, pay cash to courier
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-blue-600"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white">
                          Bank Transfer / Raast
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Instant IBFT (Meezan, HBL, Bank Alfalah)
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="accent-blue-600"
                    />
                  </label>
                </div>
              </div>

              {/* Order Submit */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Payable on Delivery:</span>
                  <span className="text-base text-neutral-950 dark:text-white">
                    {formatPKR(subtotalPKR)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutStep(false)}
                    className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 btn-press cursor-pointer"
                  >
                    Edit Cart
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md btn-press btn-shimmer cursor-pointer"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Items List */
            <>
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                  <Truck className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-blue-600" />
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Explore our curated collection of 222 verified PTA smartphones.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    Browse Smartphones
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items.map((item, index) => {
                    const isItemOutOfStock = !item.phone.inStock || item.selectedColor.inStock === false || item.selectedVariant.inStock === false;
                    return (
                      <div key={`${item.phone.id}-${index}`} className="py-3 flex gap-3">
                        <div className="w-16 h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center justify-center flex-shrink-0 relative">
                          <PhoneImageWithFallback
                            src={item.selectedColor.image}
                            alt={item.phone.name}
                            brand={item.phone.brand}
                            className="w-full h-full"
                          />
                          {isItemOutOfStock && (
                            <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded shadow">
                              OOS
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                                {item.phone.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(index)}
                                aria-label={`Remove ${item.phone.name} from cart`}
                                className="text-neutral-400 hover:text-rose-600 cursor-pointer p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {item.selectedColor.name} • {item.selectedVariant.ram} / {item.selectedVariant.storage}
                            </div>
                            {isItemOutOfStock ? (
                              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200/50 inline-block">
                                ⚠️ Out of Stock - Remove to checkout
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                PTA Approved • Official Warranty
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs font-extrabold text-neutral-950 dark:text-white">
                              {formatPKR(item.selectedVariant.pricePKR)}
                            </div>

                            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.phone.name}`}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-xs active:scale-80 transition-transform cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1.5">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.phone.name}`}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 text-xs active:scale-80 transition-transform cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cart Footer Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/60 dark:bg-neutral-950/40">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>{formatPKR(subtotalPKR)}</span>
                    </div>
                    {totalSavingsPKR > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Total Savings</span>
                        <span>-{formatPKR(totalSavingsPKR)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-500">
                      <span>Shipping across Pakistan</span>
                      <span className="text-emerald-600 font-semibold uppercase">
                        Free
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-neutral-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <span>Total (PKR)</span>
                      <span>{formatPKR(subtotalPKR)}</span>
                    </div>
                  </div>

                  {hasOutOfStockItems && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
                      ⚠️ Out of stock items detected. Please remove them before checkout.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!hasOutOfStockItems) {
                        setIsCheckoutStep(true);
                      }
                    }}
                    disabled={hasOutOfStockItems}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      !hasOutOfStockItems
                        ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white cursor-pointer btn-press btn-shimmer'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-neutral-700 shadow-none'
                    }`}
                  >
                    <span>{hasOutOfStockItems ? 'Cannot Checkout (Out of Stock items)' : 'Proceed to Pakistani Checkout'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

