'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, SmartphoneColor, SmartphoneVariant, Coupon } from '@/types';
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
  ArrowRight,
  MessageSquare,
  Check,
  Tag,
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
import { trackPurchase } from './AnalyticsTracker';

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

  // Promo Code / Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Auto-prefill customer info when logged in
  useEffect(() => {
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
  const finalPrice = Math.max(0, price - discountAmount);

  // Recalculate discount if device price changes
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minOrderAmount && price < appliedCoupon.minOrderAmount) {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(`Coupon removed: minimum order of Rs. ${appliedCoupon.minOrderAmount.toLocaleString()} required.`);
        setCouponSuccess('');
      } else {
        let newDisc = 0;
        if (appliedCoupon.discountType === 'fixed') {
          newDisc = appliedCoupon.discountValue;
        } else if (appliedCoupon.discountType === 'percentage') {
          const raw = Math.round((price * appliedCoupon.discountValue) / 100);
          newDisc = appliedCoupon.maxDiscountAmount ? Math.min(appliedCoupon.maxDiscountAmount, raw) : raw;
        }
        setDiscountAmount(Math.min(newDisc, price));
      }
    }
  }, [price, appliedCoupon]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      setCouponError('Please enter a promo code.');
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code, orderTotal: price }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponSuccess(`Coupon "${data.coupon.code}" applied! Saved Rs. ${data.discountAmount.toLocaleString()}`);
        setCouponCodeInput(data.coupon.code);
      } else {
        setCouponError(data.error || 'Invalid promo code.');
      }
    } catch {
      setCouponError('Unable to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponSuccess('');
    setCouponError('');
    setCouponCodeInput('');
  };

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
            totalPKR: finalPrice,
            couponCode: appliedCoupon?.code || '',
            discountPKR: discountAmount,
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
          totalPKR: finalPrice,
          couponCode: appliedCoupon?.code || '',
          discountPKR: discountAmount,
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
              totalPKR: finalPrice,
              couponCode: appliedCoupon?.code || '',
              discountPKR: discountAmount,
              paymentMethod: 'Cash on Delivery (Open-Parcel)',
              status: 'Placed',
              courier: 'TCS Express',
            },
          }),
        }).catch(() => {});

        // Redeem coupon usage counter
        if (appliedCoupon) {
          fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'redeem', code: appliedCoupon.code }),
          }).catch(() => {});
        }
      } catch {}

      trackPurchase(randomOrder);
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
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-slate-300 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Modal Top Header (Sticky) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0b3c68] flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4 text-[#0b3c68]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {isOrderConfirmed ? 'Order Confirmed!' : 'Quick Buy (Cash on Delivery)'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                100% PTA Approved • Open-Parcel Inspection Before Payment
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            aria-label="Close quick purchase modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {!isOrderConfirmed ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Phone Product Summary Card (Compact & Responsive on Mobile) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-white p-1.5 border border-slate-200 flex items-center justify-center shrink-0">
                <PhoneImageWithFallback
                  src={currentColor.image}
                  alt={phone.name}
                  brand={phone.brand}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {phone.brand}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {phone.name}
                    </h4>
                  </div>
                  <span className="text-sm sm:text-base font-black text-[#0b3c68] whitespace-nowrap">
                    {formatPKR(price)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-slate-600">
                  <span>Color: <strong className="text-slate-900">{currentColor.name}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Config: <strong className="text-slate-900">{currentVariant?.ram} / {currentVariant?.storage}</strong></span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> PTA Approved
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0b3c68] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    <Truck className="w-3 h-3 text-[#48afff]" /> Free Shipping
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Order Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Anti-Bot Security Honeypot */}
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
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Responsive Inputs: text-base on mobile to completely prevent iOS auto-zoom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>

                {/* Mobile Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>

                {/* City Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Delivery City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 transition-all font-medium"
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
                  <label className="text-xs font-bold text-slate-700">
                    Alternative Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="0321 7654321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Complete Street Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House / Apartment #, Street name, Sector / Mohalla / Area"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#48afff] focus:bg-white text-slate-900 transition-all font-medium resize-none"
                />
              </div>

              {/* Payment Method Selection (Clean, Compact Mobile-Friendly Pills) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-blue-50/70 border-[#0b3c68] ring-2 ring-[#48afff]/40 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quick_payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#0b3c68]"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cash on Delivery</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Open-Parcel COD</p>
                    </div>
                  </label>

                  {/* Bank Transfer / Raast */}
                  <label
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'bg-blue-50/70 border-[#0b3c68] ring-2 ring-[#48afff]/40 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quick_payment"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="accent-[#0b3c68]"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Online Bank / Raast</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Instant IBFT</p>
                    </div>
                  </label>

                  {/* 0% Installments */}
                  <label
                    onClick={() => setPaymentMethod('emi')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'emi'
                        ? 'bg-blue-50/70 border-[#0b3c68] ring-2 ring-[#48afff]/40 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quick_payment"
                      checked={paymentMethod === 'emi'}
                      onChange={() => setPaymentMethod('emi')}
                      className="accent-[#0b3c68]"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-[#f47708]" />
                        <span>0% Installments</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">3-12 mo Credit Card</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Open Parcel Guarantee Banner */}
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
                <PackageCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Open-Parcel Guarantee:</strong> You are fully authorized to open the flyer and inspect the smartphone box, seals, and warranty card before paying cash to the TCS rider!
                </p>
              </div>

              {/* Promo Code Widget */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#0b3c68]" />
                    Have a Promo / Coupon Code?
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-emerald-800 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] text-emerald-700 ml-1.5">
                          (-{formatPKR(discountAmount)})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline ml-2 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter Promo Code (e.g. WELCOME1000)"
                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48afff] text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplyingCoupon || !couponCodeInput.trim()}
                        className="px-3.5 py-1.5 bg-[#0b3c68] hover:bg-[#072847] disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-black rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('WELCOME1000')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#0b3c68] border border-sky-100 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        WELCOME1000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('HAMZA500')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#0b3c68] border border-sky-100 hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        HAMZA500
                      </button>
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] font-medium text-rose-600">{couponError}</p>
                )}
                {couponSuccess && !appliedCoupon && (
                  <p className="text-[11px] font-medium text-emerald-600">{couponSuccess}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Device Price:</span>
                  <span className="font-bold">{formatPKR(price)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      Promo Discount ({appliedCoupon?.code}):
                    </span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>PTA DIRBS Customs Tax:</span>
                  <span className="text-emerald-700 font-bold">100% INCLUDED (Paid)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Nationwide Express Shipping:</span>
                  <span className="text-emerald-700 font-bold">FREE (Rs. 0)</span>
                </div>
              </div>

              {/* Sticky Submit Footer on Mobile so button is NEVER hidden */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-2 border-t border-slate-100 -mx-4 sm:-mx-6 px-4 sm:px-6 shadow-md mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Total Payable on Delivery:</span>
                  <span className="text-base font-black text-[#0b3c68]">{formatPKR(finalPrice)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-[#0b3c68] hover:bg-[#072847] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#0b3c68]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-press"
                >
                  {isSubmitting ? (
                    <span>Booking Open-Parcel Consignment...</span>
                  ) : (
                    <>
                      <span>Confirm Order with Open Parcel ({formatPKR(finalPrice)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Alhamdulillah! Order Confirmed
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Your open-parcel consignment has been booked and dispatched via TCS Express.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking Code:</span>
                <span className="font-mono font-bold text-[#0b3c68] text-sm">
                  {generatedOrderId || 'HPS-786110'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-slate-900">{city}, Pakistan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {paymentMethod === 'cod' ? 'Cash on Delivery (Open Parcel)' : paymentMethod}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span className="font-medium">Promo Discount ({appliedCoupon?.code}):</span>
                  <span className="font-bold">-{formatPKR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span>Total Amount:</span>
                <span className="text-[#0b3c68] font-black">{formatPKR(finalPrice)}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/923135221200?text=Hi%20Hamza%20Phone%20Store!%20I%20just%20placed%20order%20${generatedOrderId}%20for%20${encodeURIComponent(
                phone.name
              )}.%20Please%20share%20tracking%20update.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Get WhatsApp Dispatch Updates: +92 313 5221200</span>
            </a>

            <button
              onClick={handleResetAndClose}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#0b3c68] text-white text-xs sm:text-sm font-black hover:bg-[#48afff] transition-colors shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
