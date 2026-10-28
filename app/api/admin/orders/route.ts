import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export interface AdminOrder {
  orderId: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: Array<{
    name: string;
    variant?: string;
    pricePKR: number;
    quantity: number;
    color?: string;
    image?: string;
  }> | string[];
  totalPKR: number;
  paymentMethod: string;
  status: string;
  courier?: string;
  trackingNumber?: string;
  createdAt: string;
}

function getOrdersFromDisk(): AdminOrder[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      return JSON.parse(data) as AdminOrder[];
    }
  } catch (err) {
    console.error('Error reading orders.json:', err);
  }
  return [];
}

function saveOrdersToDisk(orders: AdminOrder[]): boolean {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing orders.json:', err);
    return false;
  }
}

// GET - Retrieve all orders with optional filter
export async function GET(request: Request) {
  try {
    const orders = getOrdersFromDisk();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    let filtered = orders;

    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    if (query) {
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.phone.includes(query) ||
          o.city.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      orders: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Record a new customer order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderData: Partial<AdminOrder> = body.order;

    if (!orderData || !orderData.customerName || !orderData.phone || !orderData.totalPKR) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, and total are required.' },
        { status: 400 }
      );
    }

    const orders = getOrdersFromDisk();
    const newOrder: AdminOrder = {
      orderId: orderData.orderId || `VPK-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: orderData.customerName,
      phone: orderData.phone,
      city: orderData.city || 'Pakistan',
      address: orderData.address || '',
      items: orderData.items || [],
      totalPKR: Number(orderData.totalPKR),
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery (Open-Parcel)',
      status: orderData.status || 'Placed',
      courier: orderData.courier || 'TCS Express',
      trackingNumber: orderData.trackingNumber || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
    };

    // Prepend new order
    orders.unshift(newOrder);
    saveOrdersToDisk(orders);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record order' },
      { status: 500 }
    );
  }
}

// PATCH - Update status or tracking number
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, courier, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const orders = getOrdersFromDisk();
    const index = orders.findIndex((o) => o.orderId === orderId);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status) orders[index].status = status;
    if (courier !== undefined) orders[index].courier = courier;
    if (trackingNumber !== undefined) orders[index].trackingNumber = trackingNumber;

    saveOrdersToDisk(orders);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: orders[index],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
