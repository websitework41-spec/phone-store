import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Coupon } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const couponsFilePath = path.join(process.cwd(), 'data', 'coupons.json');

function getCouponsFromDisk(): Coupon[] {
  try {
    if (fs.existsSync(couponsFilePath)) {
      const data = fs.readFileSync(couponsFilePath, 'utf-8');
      return JSON.parse(data) as Coupon[];
    }
  } catch (err) {
    console.error('Error reading coupons.json:', err);
  }
  return [];
}

function saveCouponsToDisk(coupons: Coupon[]): boolean {
  try {
    fs.writeFileSync(couponsFilePath, JSON.stringify(coupons, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing coupons.json:', err);
    return false;
  }
}

// GET - Retrieve coupons
export async function GET(request: Request) {
  try {
    const coupons = getCouponsFromDisk();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const result = activeOnly ? coupons.filter((c) => c.isActive) : coupons;

    return NextResponse.json(
      {
        success: true,
        coupons: result,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch coupons' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST - Validate or manage coupons
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const coupons = getCouponsFromDisk();

    // 1. Customer Cart / Checkout Validation
    if (action === 'validate') {
      const { code, orderTotal = 0 } = body;
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Please enter a coupon code.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const cleanCode = code.trim().toUpperCase();
      const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

      if (!coupon) {
        return NextResponse.json(
          { success: false, error: `Coupon code "${code}" is invalid or does not exist.` },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          { success: false, error: `Coupon "${coupon.code}" is currently disabled.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, error: `Coupon "${coupon.code}" expired on ${new Date(coupon.expiresAt).toLocaleDateString()}.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, error: `Coupon "${coupon.code}" has reached its maximum redemptions.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Coupon "${coupon.code}" requires a minimum order amount of Rs. ${coupon.minOrderAmount.toLocaleString()}.`,
          },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'percentage') {
        const rawDiscount = Math.round((orderTotal * coupon.discountValue) / 100);
        discountAmount = coupon.maxDiscountAmount
          ? Math.min(coupon.maxDiscountAmount, rawDiscount)
          : rawDiscount;
      }

      // Discount cannot exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);
      const finalTotal = Math.max(0, orderTotal - discountAmount);

      return NextResponse.json(
        {
          success: true,
          coupon,
          discountAmount,
          finalTotal,
          message: `Coupon "${coupon.code}" applied successfully! You saved Rs. ${discountAmount.toLocaleString()}`,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Increment usage when order is placed
    if (action === 'redeem') {
      const { code } = body;
      if (code) {
        const cleanCode = code.trim().toUpperCase();
        const index = coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);
        if (index !== -1) {
          coupons[index].timesUsed = (coupons[index].timesUsed || 0) + 1;
          saveCouponsToDisk(coupons);
        }
      }
      return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
    }

    // 3. Admin: Create new coupon
    if (action === 'create') {
      const { coupon } = body;
      if (!coupon || !coupon.code || !coupon.discountValue) {
        return NextResponse.json(
          { success: false, error: 'Coupon code and discount value are required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const cleanCode = coupon.code.trim().toUpperCase();
      if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
        return NextResponse.json(
          { success: false, error: `Coupon code "${cleanCode}" already exists.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const newCoupon: Coupon = {
        id: `coup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: cleanCode,
        discountType: coupon.discountType || 'fixed',
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : undefined,
        expiresAt: coupon.expiresAt || undefined,
        usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
        timesUsed: 0,
        isActive: coupon.isActive !== false,
        description: coupon.description || '',
        createdAt: new Date().toISOString(),
      };

      coupons.unshift(newCoupon);
      saveCouponsToDisk(coupons);

      return NextResponse.json(
        { success: true, message: 'Coupon created successfully!', coupon: newCoupon },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 4. Admin: Update coupon
    if (action === 'update') {
      const { coupon } = body;
      if (!coupon || !coupon.id) {
        return NextResponse.json(
          { success: false, error: 'Coupon ID is required for updating.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const index = coupons.findIndex((c) => c.id === coupon.id);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Coupon not found.' },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      coupons[index] = {
        ...coupons[index],
        ...coupon,
        code: coupon.code ? coupon.code.trim().toUpperCase() : coupons[index].code,
      };

      saveCouponsToDisk(coupons);

      return NextResponse.json(
        { success: true, message: 'Coupon updated successfully!', coupon: coupons[index] },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // 5. Admin: Delete coupon
    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Coupon ID is required.' },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const filtered = coupons.filter((c) => c.id !== id);
      saveCouponsToDisk(filtered);

      return NextResponse.json(
        { success: true, message: 'Coupon deleted successfully!' },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action.' },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Coupon operation failed.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
