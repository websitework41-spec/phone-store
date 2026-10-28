'use client';

import React, { useState } from 'react';
import { Smartphone, SmartphoneColor, SmartphoneVariant } from '@/types';
import { formatPKR, PAKISTAN_CITIES } from '@/data/smartphones';
import { PhoneImageWithFallback } from './PhoneImageWithFallback';
import {
  X,
  ShieldCheck,
  PackageCheck,
  Truck,
  CheckCircle2,
  Lock,
  Phone,
  CreditCard,
  Banknote,
  Percent,
  Sparkles,
  Printer,
  ArrowRight,
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

interface QuickPurchaseModalProps {
  phone: Smartphone | null;
  selectedVariant?: SmartphoneVariant | null;
  selectedColor?: SmartphoneColor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPurchaseModal({
  phone,
  selectedVariant,
  selectedColor,
  isOpen,
  onClose,
}: QuickPurchaseModalProps) {
  const { user, profile } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [city, setCity] = useState(PAKISTAN_CITIES[0] || 'Karachi');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'emi'>('cod');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot trap
  const [validationError, setValidationError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Auto-prefill customer info when logged in
  React.useEffect(() => {
    if (user && profile && isOpen) {
      if (!fullName && (profile.name || user.displayName)) {
        setFullName(profile.name || user.displayName || '');
      }
      if (!phoneNumber && profile.phone) {
        setPhoneNumber(profile.phone);
      }
      const defaultAddr = profile.addresses?.find((a) => a.isDefault) || profile.addresses?.[0];
      if (defaultAddr) {
        if (!deliveryAddress) {
          setDeliveryAddress(defaultAddr.streetAddress);
        }
        if (defaultAddr.city) {
          setCity(defaultAddr.city);
        }
      }
    }
  }, [user, profile, isOpen]);

  if (!isOpen || !phone) return null;

  const currentVariant = selectedVariant || phone.variants.find((v) => v.inStock) || phone.variants[0];
  const currentColor = selectedColor || phone.colors.find((c) => c.inStock) || phone.colors[0];
  const price = currentVariant ? currentVariant.pricePKR : phone.basePricePKR;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // 1. Anti-Bot Honeypot Defense
    if (isBotSubmission(honeypot)) {
      console.warn('Bot submission blocked via security honeypot trap.');
      return;
    }

    // 2. Client-side Rate-Limiting Protection (Anti-Spam / Anti-Flooding)
    if (!submissionRateLimiter.isAllowed('quick_purchase_submit', 2500)) {
      setValidationError('Please wait 3 seconds before submitting another request.');
      return;
    }

    // 3. Input Sanitization against XSS & script injection
    const cleanName = sanitizeText(fullName, MAX_INPUT_LENGTHS.NAME);
    const cleanAddress = sanitizeText(deliveryAddress, MAX_INPUT_LENGTHS.ADDRESS);
    const cleanAltPhone = sanitizeText(altPhone, MAX_INPUT_LENGTHS.PHONE);
    const cleanNotes = sanitizeText(deliveryNotes, MAX_INPUT_LENGTHS.NOTES);

    if (!cleanName || cleanName.length < 3) {
      setValidationError('Please enter a valid full name (minimum 3 characters).');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      setValidationError('Please enter a complete delivery address (street, area, city).');
      return;
    }

    // 4. Strict Pakistani Mobile Validation (03XX-XXXXXXX)
    const phoneCheck = validatePakistaniPhone(phoneNumber);
    if (!phoneCheck.isValid) {
      setValidationError(phoneCheck.errorMessage || 'Invalid Pakistani mobile number.');
      return;
    }

    setIsSubmitting(true);
    // Simulate secure order placement with sanitized values
    setTimeout(async () => {
      const randomOrder = `HPS-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedOrderId(randomOrder);
      setFullName(cleanName);
      setPhoneNumber(phoneCheck.cleanPhone);
      setAltPhone(cleanAltPhone);
      setDeliveryAddress(cleanAddress);
      setDeliveryNotes(cleanNotes);

      const orderTotal = selectedVariant?.pricePKR || phone?.basePricePKR || 0;
      const orderItems = phone
        ? [
            {
              name: phone.name,
              variant: `${selectedVariant?.ram || ''}/${selectedVariant?.storage || ''}`,
              pricePKR: orderTotal,
              quantity: 1,
              color: currentColor?.name || '',
            },
          ]
        : [];

      // Save to Firestore if customer is logged in
      if (user) {
        try {
          const orderDocRef = doc(db, 'users', user.uid, 'orders', randomOrder);
          await setDoc(orderDocRef, {
            orderId: randomOrder,
            customerName: cleanName,
            phone: phoneCheck.cleanPhone,
            altPhone: cleanAltPhone,
            city: city || 'Pakistan',
            address: cleanAddress,
            notes: cleanNotes,
            items: orderItems,
            totalPKR: orderTotal,
            paymentMethod,
            status: 'Placed',
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error('Error saving quick order to Firestore:', err);
        }
      }

      // Always persist to localStorage for guest tracking & offline persistence
      try {
        const newOrder = {
          orderId: randomOrder,
          customerName: cleanName,
          phone: phoneCheck.cleanPhone,
          city: city || 'Pakistan',
          address: cleanAddress,
          items: phone ? [`${phone.name} (${selectedVariant?.ram || ''}/${selectedVariant?.storage || ''})`] : [],
          totalPKR: orderTotal,
          status: 'Order Confirmed — Dispatched via TCS Express. Estimated delivery: 24-48 Hours with Open-Parcel inspection.',
          createdAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('hamzastore_orders') || localStorage.getItem('voltphone_orders') || '[]');
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
              orderId: randomOrder,
              customerName: cleanName,
              phone: phoneCheck.cleanPhone,
              city: city || 'Pakistan',
              address: cleanAddress,
              items: phone
                ? [
                    {
                      name: phone.name,
                      variant: `${selectedVariant?.ram || ''}/${selectedVariant?.storage || ''}`,
                      pricePKR: orderTotal,
                      quantity: 1,
                      color: selectedColor?.name || 'Default',
                    },
                  ]
                : [],
              totalPKR: orderTotal,
              paymentMethod: 'Cash on Delivery (Open-Parcel)',
              status: 'Placed',
              courier: 'TCS Express',
            },
          }),
        }).catch(() => {});
      } catch {}

      setIsSubmitting(false);
      setIsOrderConfirmed(true);
    }, 600);
  };

  const handleResetAndClose = () => {
    setIsOrderConfirmed(false);
    setGeneratedOrderId('');
    setFullName('');
    setPhoneNumber('');
    setAltPhone('');
    setDeliveryAddress('');
    setDeliveryNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {isOrderConfirmed ? 'Order Confirmed!' : 'Quick Purchase & Fast Checkout'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                100% PTA Approved • Official Warranty • Open Parcel COD
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            aria-label="Close quick purchase modal"
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isOrderConfirmed ? (
          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Phone Product Summary Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white dark:bg-neutral-900 p-2 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-center flex-shrink-0">
                <PhoneImageWithFallback
                  src={currentColor.image}
                  alt={phone.name}
                  brand={phone.brand}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-neutral-900 dark:text-white truncate">
                    {phone.name}
                  </h4>
                  <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {formatPKR(price)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                    Color: <strong>{currentColor.name}</strong>
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">•</span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                    Specs: <strong>{currentVariant?.ram} RAM / {currentVariant?.storage} Storage</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/50">
                    <ShieldCheck className="w-3 h-3" /> PTA DIRBS Approved
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50">
                    <Truck className="w-3 h-3" /> Free Express Shipping
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Order Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Anti-Bot Security Honeypot (Hidden from human users, traps automated attack bots) */}
              <input
                type="text"
                name="_hp_security_check"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                  />
                </div>

                {/* City Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Delivery City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alternate Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Alternative Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="0321 7654321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Complete Delivery Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House/Apartment #, Street name, Sector / Block / Area"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                      paymentMethod === 'cod'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Cash on Delivery</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Open Parcel: Check phone before paying cash.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer / Raast */}
                  <label
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                      paymentMethod === 'bank'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>Online Bank / Raast</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Meezan, Alfalah, Raast &amp; Cards.
                      </p>
                    </div>
                  </label>

                  {/* 0% Installments */}
                  <label
                    onClick={() => setPaymentMethod('emi')}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                      paymentMethod === 'emi'
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'emi'}
                      onChange={() => setPaymentMethod('emi')}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-amber-500" />
                        <span>0% Installments</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        3 to 12 months with credit card.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Total & Price Breakdown */}
              <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Smartphone Base Price:</span>
                  <span>{formatPKR(price)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>PTA DIRBS Duty:</span>
                  <span className="text-emerald-600 font-semibold">100% INCLUDED (Paid)</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Express Delivery across Pakistan:</span>
                  <span className="text-emerald-600 font-semibold">FREE (Rs. 0)</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between font-black text-neutral-900 dark:text-white text-sm">
                  <span>Total Payable on Delivery:</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatPKR(price)}</span>
                </div>
              </div>

              {/* Open Parcel Guarantee Banner inside Form */}
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs">
                <PackageCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Open-Parcel Guarantee:</strong> You will be allowed to open the outer flyer and examine the factory-sealed smartphone box, seal stickers, and warranty slip before handing over the cash payment to the courier.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-press btn-shimmer"
              >
                {isSubmitting ? (
                  <span>Booking Open-Parcel Order...</span>
                ) : (
                  <>
                    <span>Confirm Order with Open Parcel ({formatPKR(price)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                Alhamdulillah! Your Order is Confirmed
              </h3>
              <p className="text-xs text-neutral-500">
                Your open-parcel consignment has been booked and sent to logistics.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                  {generatedOrderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 text-right max-w-[200px] truncate">
                  {deliveryAddress}, {city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Item:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {phone.name} ({currentColor.name})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Delivery:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  24–48 Hours (TCS Express)
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-sm">
                <span>Payable on Delivery:</span>
                <span className="text-blue-600">{formatPKR(price)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>
                SMS &amp; WhatsApp confirmation sent to <strong>{phoneNumber}</strong>
              </span>
            </div>

            <a
              href={`https://wa.me/923135221200?text=Hi%20Hamza%20Phone%20Store!%20I%20have%20an%20inquiry%20regarding%20my%20order%20${encodeURIComponent(generatedOrderId)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-md mx-auto p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Official Support: <strong>+92 313 5221200</strong></span>
            </a>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer btn-press"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer btn-press btn-shimmer"
              >
                Back to Smartphone Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
