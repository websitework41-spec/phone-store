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
  ShoppingBag,
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
      setValidationError('Please remove out of stock items from your cart before proceeding.');
      return;
    }

    // 3. Input Sanitization
    const cleanName = sanitizeText(customerName, MAX_INPUT_LENGTHS.NAME);
    const cleanAddress = sanitizeText(customerAddress, MAX_INPUT_LENGTHS.ADDRESS);

    if (!cleanName || cleanName.length < 3) {
      setValidationError('Please enter a valid full name (minimum 3 characters).');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      setValidationError('Please enter a complete delivery address (street, area, city).');
      return;
    }

    // 4. Mobile Phone Validation (03XX-XXXXXXX)
    const phoneCheck = validatePakistaniPhone(customerPhone);
    if (!phoneCheck.isValid) {
      setValidationError(phoneCheck.errorMessage || 'Please enter a valid Pakistani mobile number.');
      return;
    }

    const randomOrderId = `HPS-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(randomOrderId);

    // Save to Firestore if user is authenticated
    if (user) {
      try {
        const orderDocRef = doc(db, 'users', user.uid, 'orders', randomOrderId);
        await setDoc(orderDocRef, {
          orderId: randomOrderId,
          customerName: cleanName,
          phone: phoneCheck.cleanPhone,
          address: cleanAddress,
          city: selectedCity,
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

    // Persist to local storage for guest tracking
    try {
      const newOrder = {
        orderId: randomOrderId,
        customerName: cleanName,
        phone: phoneCheck.cleanPhone,
        address: cleanAddress,
        city: selectedCity,
        items: items.map(
          (i) =>
            `${i.phone.name} (${i.selectedVariant.ram}/${i.selectedVariant.storage}) x${i.quantity}`
        ),
        totalPKR: subtotalPKR,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (Open-Parcel)' : paymentMethod,
        status:
          'Order Confirmed — Dispatched via TCS Express. Estimated delivery: 24-48 Hours with Open-Parcel inspection.',
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(
        localStorage.getItem('hamzastore_orders') ||
          localStorage.getItem('voltphone_orders') ||
          '[]'
      );
      localStorage.setItem('hamzastore_orders', JSON.stringify([newOrder, ...existing]));
    } catch {
      // ignore
    }

    // Sync to admin orders backend
    try {
      fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            orderId: randomOrderId,
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
            courier: 'TCS Express',
          },
        }),
      }).catch(() => {});
    } catch {}

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Container: pl-0 on mobile so drawer fills 100% of mobile width without wasted left margin */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0b3c68] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#0b3c68]" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {orderSuccess
                    ? 'Order Confirmed!'
                    : isCheckoutStep
                    ? 'Express Checkout (COD)'
                    : `Your Cart (${items.length})`}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  100% PTA Approved • Open-Parcel Inspection
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart drawer"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Screen */}
          {orderSuccess ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-9 h-9 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  Mubarak! Order Placed
                </h3>
                <p className="text-xs text-slate-500 max-w-xs font-medium">
                  Your smartphone order is confirmed with <strong>Open-Parcel Verification</strong>. Inspect before paying cash!
                </p>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracking Code:</span>
                  <span className="font-mono font-bold text-[#0b3c68]">
                    {confirmedOrderId || 'HPS-786110'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-slate-900">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-bold text-slate-900">{selectedCity}, Pakistan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="font-bold text-emerald-700 uppercase">
                    {paymentMethod === 'cod' ? 'Cash on Delivery (Open Parcel)' : paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Total Amount:</span>
                  <span className="text-[#0b3c68] font-black">{formatPKR(subtotalPKR)}</span>
                </div>
              </div>

              <a
                href="https://wa.me/923135221200?text=Hi%20Hamza%20Phone%20Store!%20I%20just%20placed%20an%20order%20and%20need%20tracking%20details."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Helpline: <strong>+92 313 5221200</strong></span>
              </a>

              <button
                onClick={handleResetOrder}
                className="w-full py-3.5 rounded-2xl bg-[#0b3c68] text-white text-xs sm:text-sm font-black hover:bg-[#48afff] transition-colors shadow-md"
              >
                Back to Smartphone Catalog
              </button>
            </div>
          ) : isCheckoutStep ? (
            /* Checkout Form */
            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-[#0b3c68] flex items-start gap-2">
                <PackageCheck className="w-4 h-4 text-[#0b3c68] flex-shrink-0 mt-0.5" />
                <span className="font-medium text-[11px] leading-relaxed">
                  <strong>Open-Parcel Guarantee:</strong> The TCS rider will let you open and inspect the sealed box before you pay COD cash!
                </span>
              </div>

              {/* Responsive Inputs: text-base on mobile prevents iOS zoom */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Hamza Latif"
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery City (Pakistan) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 font-medium transition-all cursor-pointer"
                >
                  {PAKISTAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complete Street Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House #, Street, Sector / Area / Landmark"
                  className="w-full px-3.5 py-2 rounded-xl text-base sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 font-medium transition-all resize-none"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#0b3c68] bg-blue-50/70 ring-2 ring-[#48afff]/40'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-extrabold text-slate-900">
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Inspect open parcel first, pay cash to courier
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="cart_payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#0b3c68]"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-[#0b3c68] bg-blue-50/70 ring-2 ring-[#48afff]/40'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-extrabold text-slate-900">
                          Bank Transfer / Raast
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Instant IBFT (Meezan, HBL, Bank Alfalah)
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="cart_payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="accent-[#0b3c68]"
                    />
                  </label>
                </div>
              </div>

              {/* Order Submit */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Total Payable:</span>
                  <span className="text-base font-black text-[#0b3c68]">
                    {formatPKR(subtotalPKR)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutStep(false)}
                    className="py-3 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 btn-press cursor-pointer"
                  >
                    Edit Cart
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-3 rounded-xl bg-[#0b3c68] hover:bg-[#072847] text-white text-xs font-black shadow-md btn-press cursor-pointer"
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
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Truck className="w-8 h-8 text-[#0b3c68]" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Explore 222+ PTA-approved smartphones with 0% EMI and Open-Parcel delivery.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-[#0b3c68] text-white text-xs font-bold hover:bg-[#48afff] transition-colors cursor-pointer"
                  >
                    Browse Smartphones
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const isItemOutOfStock =
                      !item.phone.inStock ||
                      item.selectedColor.inStock === false ||
                      item.selectedVariant.inStock === false;
                    return (
                      <div key={`${item.phone.id}-${index}`} className="py-3.5 flex gap-3 items-center">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 relative">
                          <PhoneImageWithFallback
                            src={item.selectedColor.image}
                            alt={item.phone.name}
                            brand={item.phone.brand}
                            className="w-full h-full object-contain"
                          />
                          {isItemOutOfStock && (
                            <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 rounded shadow">
                              OOS
                            </span>
                          )}
                        </div>

                        {/* Info & Quantity */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                {item.phone.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(index)}
                                aria-label={`Remove ${item.phone.name} from cart`}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 -mr-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.selectedColor.name} • {item.selectedVariant.ram} / {item.selectedVariant.storage}
                            </div>
                            {isItemOutOfStock && (
                              <div className="text-[10px] text-rose-600 font-bold mt-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                                ⚠️ Out of Stock — remove to checkout
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs sm:text-sm font-black text-[#0b3c68]">
                              {formatPKR(item.selectedVariant.pricePKR)}
                            </div>

                            {/* Touch-Friendly Quantity Buttons (Enlarged for comfortable mobile tapping) */}
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                aria-label={`Decrease quantity of ${item.phone.name}`}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 text-xs font-bold active:scale-90 transition-transform cursor-pointer shadow-2xs hover:bg-slate-50"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black px-2 text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                aria-label={`Increase quantity of ${item.phone.name}`}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 text-xs font-bold active:scale-90 transition-transform cursor-pointer shadow-2xs hover:bg-slate-50"
                              >
                                <Plus className="w-3.5 h-3.5" />
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
                <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3 bg-slate-50/80 shrink-0">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-slate-900 font-bold">{formatPKR(subtotalPKR)}</span>
                    </div>
                    {totalSavingsPKR > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Total Savings</span>
                        <span>-{formatPKR(totalSavingsPKR)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Shipping across Pakistan</span>
                      <span className="text-emerald-700 font-bold uppercase">Free (Rs. 0)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-base text-[#0b3c68] font-black">
                        {formatPKR(subtotalPKR)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 pb-1">
                    <button
                      onClick={() => setIsCheckoutStep(true)}
                      disabled={hasOutOfStockItems}
                      className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                        hasOutOfStockItems
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                          : 'bg-[#0b3c68] hover:bg-[#072847] text-white shadow-lg shadow-[#0b3c68]/20 btn-press cursor-pointer'
                      }`}
                    >
                      <span>Proceed to Checkout (Open-Parcel COD)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
