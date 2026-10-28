'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Smartphone, SmartphoneColor, SmartphoneVariant } from '@/types';
import { BRANDS, PAKISTAN_CITIES, formatPKR } from '@/data/smartphones';
import { AdminOrder } from '@/app/api/admin/orders/route';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  ArrowUpDown,
  ExternalLink,
  Printer,
  Truck,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Tag,
  DollarSign,
  Download,
  AlertCircle,
} from 'lucide-react';

type AdminTab = 'dashboard' | 'products' | 'inventory' | 'orders' | 'customers' | 'settings';

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Smartphone[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Smartphone | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<Smartphone | null>(null);
  const [customRestockQty, setCustomRestockQty] = useState<number>(10);
  const [deleteConfirmationTarget, setDeleteConfirmationTarget] = useState<Smartphone | null>(null);
  const [viewingOrderReceipt, setViewingOrderReceipt] = useState<AdminOrder | null>(null);

  // Expanded inventory rows for color & variant drill-down
  const [expandedInventoryId, setExpandedInventoryId] = useState<string | null>(null);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch products and orders
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();

      if (prodData.success) {
        setProducts(prodData.products || []);
      }
      if (orderData.success) {
        setOrders(orderData.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading data from server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter !== 'All Brands' && p.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }
      if (stockFilter === 'inStock' && (!p.inStock || (p.stockQty ?? 0) <= 0)) {
        return false;
      }
      if (stockFilter === 'lowStock' && ((p.stockQty ?? 0) <= 0 || (p.stockQty ?? 0) > 5)) {
        return false;
      }
      if (stockFilter === 'outOfStock' && (p.inStock && (p.stockQty ?? 0) > 0)) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, brandFilter, stockFilter, productSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status.toLowerCase() !== orderStatusFilter.toLowerCase()) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Key Dashboard Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inStockCount = products.filter((p) => p.inStock && (p.stockQty ?? 0) > 0).length;
    const lowStockCount = products.filter((p) => (p.stockQty ?? 0) > 0 && (p.stockQty ?? 0) <= 5).length;
    const outOfStockCount = products.filter((p) => !p.inStock || (p.stockQty ?? 0) === 0).length;

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPKR || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Processing').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

    return {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
    };
  }, [products, orders]);

  // Quick Restock Handler
  const handleQuickRestock = async (phoneId: string, qty: number) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: phoneId, action: 'restock', restockQty: qty }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Restocked +${qty} units successfully!`);
        // Notify other windows/storefront
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('voltphone_products_updated'));
        }
        fetchData();
        setIsRestockModalOpen(false);
      } else {
        showToast(data.error || 'Failed to restock');
      }
    } catch {
      showToast('Network error during restock');
    }
  };

  // Toggle Stock Status
  const handleToggleStock = async (phone: Smartphone) => {
    const nextState = !phone.inStock;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: phone.id, action: 'toggle_stock', inStock: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(nextState ? `Marked "${phone.name}" as In Stock` : `Marked "${phone.name}" as Out of Stock`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('voltphone_products_updated'));
        }
        fetchData();
      }
    } catch {
      showToast('Failed to toggle stock');
    }
  };

  // Update specific color stock
  const handleUpdateColorStock = async (phoneId: string, colorName: string, stockQty: number, inStock: boolean) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: phoneId,
          action: 'update_color',
          colorName,
          colorStockQty: stockQty,
          colorInStock: inStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated stock for color "${colorName}"!`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('voltphone_products_updated'));
        }
        fetchData();
      }
    } catch {
      showToast('Failed to update color stock');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (phone: Smartphone) => {
    try {
      const res = await fetch(`/api/admin/products?id=${phone.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${phone.name}" deleted.`);
        setDeleteConfirmationTarget(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('voltphone_products_updated'));
        }
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete');
      }
    } catch {
      showToast('Network error deleting product');
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async (phone: Smartphone) => {
    const clone: Smartphone = JSON.parse(JSON.stringify(phone));
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    clone.id = `${phone.id}-copy-${randomSuffix}`;
    clone.slug = `${phone.slug}-copy-${randomSuffix}`;
    clone.name = `${phone.name} (Copy)`;
    clone.stockQty = 10;
    clone.inStock = true;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: clone }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Duplicated into "${clone.name}"!`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('voltphone_products_updated'));
        }
        fetchData();
      } else {
        showToast(data.error || 'Duplicate failed');
      }
    } catch {
      showToast('Error duplicating product');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string, courier?: string, trackingNumber?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, courier, trackingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${orderId} marked as ${status}`);
        fetchData();
      }
    } catch {
      showToast('Failed to update order status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-2xl font-medium text-sm flex items-center gap-2 animate-in slide-in-from-bottom duration-200 border border-cyan-400/30">
          <Sparkles className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Modern Shopify-style Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              VP
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                VoltPhone <span className="text-cyan-400">Admin</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Shopify-grade Store Ops
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'products'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 shrink-0" />
              <span>Products</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'inventory'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Inventory & Restock</span>
            </div>
            {stats.outOfStockCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {stats.outOfStockCount} Out
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'orders'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Orders</span>
            </div>
            {stats.pendingOrders > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {stats.pendingOrders} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'customers'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customers</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'settings'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* View Customer Storefront Link */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Live Storefront
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <div className="mt-3 flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400">
              HL
            </div>
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Hamza Latif</div>
              <div className="text-[10px] text-slate-500">Super Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white capitalize flex items-center gap-2">
              {activeTab === 'dashboard' && '📊 Executive Dashboard'}
              {activeTab === 'products' && '📦 Product Catalog Management'}
              {activeTab === 'inventory' && '🏷️ Inventory & Restock Hub'}
              {activeTab === 'orders' && '🛍️ Orders & Logistics Fulfillment'}
              {activeTab === 'customers' && '👥 Registered Customers & Buyers'}
              {activeTab === 'settings' && '⚙️ VoltPhone PK Configuration'}
            </h1>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 border border-slate-700/50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Quick Action: Add Product */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg shadow-cyan-600/20 transition-all border border-cyan-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-sm font-medium transition-all"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Customer View</span>
            </Link>
          </div>
        </header>

        {/* Tab Content View */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gross Revenue */}
                <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Gross Sales (PKR)</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">
                    {formatPKR(stats.totalRevenue)}
                  </div>
                  <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time COD & EMI total</span>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{stats.totalOrders}</div>
                  <div className="mt-1 text-xs text-amber-400 font-medium">
                    {stats.pendingOrders} Pending Fulfillment
                  </div>
                </div>

                {/* Total Catalog Products */}
                <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Catalog Items</span>
                    <Package className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">{stats.totalProducts}</div>
                  <div className="mt-1 text-xs text-emerald-400 font-medium">
                    {stats.inStockCount} In Stock ({Math.round((stats.inStockCount / (stats.totalProducts || 1)) * 100)}%)
                  </div>
                </div>

                {/* Stock Health */}
                <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Stock Attention</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-rose-400">{stats.outOfStockCount}</span>
                    <span className="text-xs text-slate-400">Out of Stock</span>
                    <span className="text-base font-bold text-amber-400 ml-2">/ {stats.lowStockCount}</span>
                    <span className="text-xs text-slate-400">Low</span>
                  </div>
                  <button
                    onClick={() => {
                      setStockFilter('outOfStock');
                      setActiveTab('inventory');
                    }}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    View Restock List <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Low Stock Urgent Alert Banner */}
              {stats.outOfStockCount > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-950 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {stats.outOfStockCount} Products are currently Sold Out!
                      </h3>
                      <p className="text-xs text-slate-400">
                        Customers cannot checkout out-of-stock items. Use 1-click restock to refill stock.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStockFilter('outOfStock');
                      setActiveTab('inventory');
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-600/30"
                  >
                    Manage Out-of-Stock Items
                  </button>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Recent Orders</h3>
                    <p className="text-xs text-slate-400">Live order fulfillment from Pakistani customers</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    View All Orders <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Customer & City</th>
                        <th className="px-5 py-3.5">Items</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.orderId} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">
                            #{order.orderId}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {order.city} • {order.phone}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300">
                            {Array.isArray(order.items)
                              ? order.items.length === 1
                                ? typeof order.items[0] === 'string'
                                  ? order.items[0]
                                  : order.items[0].name
                                : `${order.items.length} items`
                              : '1 item'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-emerald-400">
                            {formatPKR(order.totalPKR)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : order.status === 'Dispatched'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  : order.status === 'Processing'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => setViewingOrderReceipt(order)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] border border-slate-700/60"
                            >
                              Packing Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS (CATALOG CRUD) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Filters & Actions Bar */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search phone name, model, slug..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Brand select */}
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>

                  {/* Stock Filter Pills */}
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setStockFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        stockFilter === 'all'
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      onClick={() => setStockFilter('inStock')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        stockFilter === 'inStock'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      In Stock
                    </button>
                    <button
                      onClick={() => setStockFilter('lowStock')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        stockFilter === 'lowStock'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      onClick={() => setStockFilter('outOfStock')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        stockFilter === 'outOfStock'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Product</th>
                        <th className="px-5 py-3.5">Brand</th>
                        <th className="px-5 py-3.5">Price (PKR)</th>
                        <th className="px-5 py-3.5">Inventory</th>
                        <th className="px-5 py-3.5">Colors & Variants</th>
                        <th className="px-5 py-3.5">PTA Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map((phone) => {
                        const isLow = (phone.stockQty ?? 0) > 0 && (phone.stockQty ?? 0) <= 5;
                        const isOut = !phone.inStock || (phone.stockQty ?? 0) === 0;

                        return (
                          <tr key={phone.id} className="hover:bg-slate-900/60 transition-colors">
                            {/* Product Info */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                  {phone.colors?.[0]?.image ? (
                                    <img
                                      src={phone.colors[0].image}
                                      alt={phone.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm hover:text-cyan-400 transition-colors">
                                    <Link href={`/product/${phone.slug}`} target="_blank">
                                      {phone.name}
                                    </Link>
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-slate-500">{phone.slug}</span>
                                    {phone.isNew && (
                                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                                        NEW
                                      </span>
                                    )}
                                    {phone.isTrending && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                        TRENDING
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Brand */}
                            <td className="px-5 py-3.5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                                {phone.brand}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-white text-sm">
                                {formatPKR(phone.basePricePKR)}
                              </div>
                              {phone.originalPricePKR > phone.basePricePKR && (
                                <div className="text-[11px] text-slate-500 line-through">
                                  {formatPKR(phone.originalPricePKR)}
                                </div>
                              )}
                            </td>

                            {/* Stock Badge & Quick Toggle */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                    isOut
                                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                      : isLow
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isOut ? 'bg-rose-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`}
                                  ></span>
                                  {isOut ? 'Out of Stock' : `${phone.stockQty ?? 0} in stock`}
                                </span>
                                <button
                                  onClick={() => handleToggleStock(phone)}
                                  title="Toggle In/Out of Stock"
                                  className="text-[10px] text-slate-400 hover:text-white underline underline-offset-2 ml-1"
                                >
                                  {phone.inStock ? 'Mark Out' : 'Mark In'}
                                </button>
                              </div>
                            </td>

                            {/* Colors & Variants pill */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                {phone.colors?.slice(0, 4).map((c) => (
                                  <span
                                    key={c.name}
                                    title={c.name}
                                    style={{ backgroundColor: c.hex }}
                                    className="w-4 h-4 rounded-full border border-slate-700 inline-block shadow-sm"
                                  />
                                ))}
                                {phone.colors?.length > 4 && (
                                  <span className="text-[10px] text-slate-500">
                                    +{phone.colors.length - 4}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 ml-1">
                                  ({phone.variants?.length || 1} var)
                                </span>
                              </div>
                            </td>

                            {/* PTA Status */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  phone.specs?.ptaStatus === 'PTA Approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {phone.specs?.ptaStatus || 'PTA Approved'}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Restock Quick */}
                                <button
                                  onClick={() => {
                                    setRestockTarget(phone);
                                    setIsRestockModalOpen(true);
                                  }}
                                  title="Restock units"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setEditingProduct(phone);
                                    setIsProductModalOpen(true);
                                  }}
                                  title="Edit full product"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Duplicate */}
                                <button
                                  onClick={() => handleDuplicateProduct(phone)}
                                  title="Duplicate as new product"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all border border-slate-700/60"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDeleteConfirmationTarget(phone)}
                                  title="Delete product"
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY & RESTOCK (GRANULAR RESTOCK CENTER) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">Restock & Variant Stock Matrix</h3>
                  <p className="text-xs text-slate-400">
                    Adjust exact stock counts per phone, colorway, and RAM/Storage variant.
                  </p>
                </div>
                {/* Search & Stock Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search phones..."
                      className="bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <select
                    value={stockFilter}
                    onChange={(e: any) => setStockFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Items</option>
                    <option value="outOfStock">Out of Stock Only</option>
                    <option value="lowStock">Low Stock (&le; 5)</option>
                    <option value="inStock">In Stock Only</option>
                  </select>
                </div>
              </div>

              {/* Inventory Table with Accordion Drill-down */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Device</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Total Quantity</th>
                        <th className="px-5 py-3.5">Instant Restock Chips</th>
                        <th className="px-5 py-3.5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map((phone) => {
                        const isExpanded = expandedInventoryId === phone.id;
                        const isOut = !phone.inStock || (phone.stockQty ?? 0) === 0;
                        const isLow = (phone.stockQty ?? 0) > 0 && (phone.stockQty ?? 0) <= 5;

                        return (
                          <React.Fragment key={phone.id}>
                            <tr className="hover:bg-slate-900/60 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1">
                                    <img
                                      src={phone.colors?.[0]?.image}
                                      alt={phone.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-sm">{phone.name}</div>
                                    <div className="text-[11px] text-slate-400">
                                      {phone.brand} • Base: {formatPKR(phone.basePricePKR)}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <button
                                  onClick={() => handleToggleStock(phone)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-transform active:scale-95 flex items-center gap-1.5 ${
                                    isOut
                                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                      : isLow
                                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isOut ? 'bg-rose-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`}
                                  ></span>
                                  {phone.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                </button>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="font-bold text-base text-white">
                                  {phone.stockQty ?? 0}
                                </span>{' '}
                                <span className="text-[11px] text-slate-500">units</span>
                              </td>

                              {/* Instant Restock Chips */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleQuickRestock(phone.id, 5)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 text-[11px] font-semibold border border-slate-700/60 transition-all"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleQuickRestock(phone.id, 10)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 text-[11px] font-semibold border border-slate-700/60 transition-all"
                                  >
                                    +10
                                  </button>
                                  <button
                                    onClick={() => handleQuickRestock(phone.id, 25)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 text-[11px] font-semibold border border-slate-700/60 transition-all"
                                  >
                                    +25
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRestockTarget(phone);
                                      setIsRestockModalOpen(true);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition-all flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Custom
                                  </button>
                                </div>
                              </td>

                              {/* Drilldown Toggle */}
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() =>
                                    setExpandedInventoryId(isExpanded ? null : phone.id)
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-[11px] border border-slate-700/60 flex items-center gap-1 ml-auto"
                                >
                                  <span>Color/Var Stock</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Color & Variant Matrix */}
                            {isExpanded && (
                              <tr className="bg-slate-900/90 border-y border-slate-800">
                                <td colSpan={5} className="p-4 pl-12 space-y-4">
                                  {/* Colors stock editor */}
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                                      Color Stock Management
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                      {phone.colors?.map((col) => {
                                        const colStock =
                                          col.stockQty ??
                                          phone.colorStockMap?.[col.name]?.stockQty ??
                                          (col.inStock !== false ? 5 : 0);
                                        const colInStock =
                                          col.inStock !== false &&
                                          (phone.colorStockMap?.[col.name]?.inStock !== false);

                                        return (
                                          <div
                                            key={col.name}
                                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span
                                                style={{ backgroundColor: col.hex }}
                                                className="w-4 h-4 rounded-full border border-slate-700 shrink-0"
                                              />
                                              <div>
                                                <div className="font-semibold text-white text-xs">
                                                  {col.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                  {colInStock ? 'In Stock' : 'Out of Stock'}
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                min="0"
                                                defaultValue={colStock}
                                                onBlur={(e) => {
                                                  const newQty = parseInt(e.target.value) || 0;
                                                  handleUpdateColorStock(
                                                    phone.id,
                                                    col.name,
                                                    newQty,
                                                    newQty > 0
                                                  );
                                                }}
                                                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-cyan-500"
                                              />
                                              <button
                                                onClick={() =>
                                                  handleUpdateColorStock(
                                                    phone.id,
                                                    col.name,
                                                    colInStock ? 0 : 5,
                                                    !colInStock
                                                  )
                                                }
                                                className={`text-[10px] px-2 py-1 rounded-md font-bold ${
                                                  colInStock
                                                    ? 'bg-rose-500/20 text-rose-300'
                                                    : 'bg-emerald-500/20 text-emerald-300'
                                                }`}
                                              >
                                                {colInStock ? 'Zero' : 'Restock'}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Variants stock */}
                                  {phone.variants && phone.variants.length > 0 && (
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                                        RAM / Storage Variants
                                      </h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {phone.variants.map((v) => (
                                          <div
                                            key={v.id}
                                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                                          >
                                            <div>
                                              <div className="font-bold text-white text-xs">
                                                {v.ram} / {v.storage}
                                              </div>
                                              <div className="text-[11px] text-emerald-400 font-semibold">
                                                {formatPKR(v.pricePKR)}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                  v.inStock
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : 'bg-rose-500/20 text-rose-300'
                                                }`}
                                              >
                                                {v.inStock ? `${v.stockQty ?? 5} in stock` : 'Out of Stock'}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID, customer name, phone, city..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {['all', 'Placed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        orderStatusFilter.toLowerCase() === st.toLowerCase()
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Order</th>
                        <th className="px-5 py-3.5">Customer & City</th>
                        <th className="px-5 py-3.5">Items Purchased</th>
                        <th className="px-5 py-3.5">Total & Payment</th>
                        <th className="px-5 py-3.5">Fulfillment Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                            No orders found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.orderId} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-mono font-bold text-cyan-400 text-sm">
                                #{order.orderId}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="font-bold text-white text-sm">{order.customerName}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-cyan-400" />
                                <a
                                  href={`https://wa.me/92${order.phone.replace(/^0/, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline hover:text-cyan-400"
                                >
                                  {order.phone}
                                </a>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {order.city} • {order.address}
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="space-y-1">
                                {Array.isArray(order.items) &&
                                  order.items.map((item, idx) => {
                                    if (typeof item === 'string') {
                                      return (
                                        <div key={idx} className="text-slate-300 font-medium">
                                          • {item}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={idx} className="text-slate-200">
                                        <span className="font-semibold">{item.name}</span>{' '}
                                        <span className="text-slate-400 text-[11px]">
                                          ({item.variant || ''} {item.color ? `• ${item.color}` : ''})
                                        </span>{' '}
                                        <span className="text-cyan-400 font-bold">x{item.quantity}</span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="font-extrabold text-sm text-emerald-400">
                                {formatPKR(order.totalPKR)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {order.paymentMethod}
                              </div>
                            </td>

                            {/* Status Selector */}
                            <td className="px-5 py-3.5">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.orderId, e.target.value)
                                }
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold border focus:outline-none ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : order.status === 'Dispatched'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                    : order.status === 'Processing'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                }`}
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              {order.courier && (
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-cyan-400" />
                                  {order.courier} {order.trackingNumber ? `(${order.trackingNumber})` : ''}
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => setViewingOrderReceipt(order)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Slip</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                <h3 className="font-bold text-white text-base">Verified Buyers & Customers</h3>
                <p className="text-xs text-slate-400">
                  Customers who have placed orders through VoltPhone PK.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {orders.map((order, i) => (
                  <div
                    key={i}
                    className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                        {order.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{order.customerName}</div>
                        <div className="text-xs text-slate-400">{order.city}, Pakistan</div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500">Phone:</span> {order.phone}
                      </div>
                      <div>
                        <span className="text-slate-500">Address:</span> {order.address}
                      </div>
                      <div>
                        <span className="text-slate-500">Total Spent:</span>{' '}
                        <span className="text-emerald-400 font-bold">{formatPKR(order.totalPKR)}</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://wa.me/92${order.phone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-center text-xs border border-emerald-500/30"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${order.phone}`}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-center text-xs border border-slate-700"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-5">
                <h3 className="font-bold text-white text-base">Store Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      defaultValue="VoltPhone PK"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Customer Support WhatsApp
                    </label>
                    <input
                      type="text"
                      defaultValue="+92 300 1234567"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Default Courier Partner
                    </label>
                    <select
                      defaultValue="TCS Express"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="TCS Express">TCS Express (24-48h Open Parcel)</option>
                      <option value="Leopard Courier">Leopard Courier Services</option>
                      <option value="Call Courier">Call Courier Logistics</option>
                      <option value="Trax Logistics">Trax Express</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Open Parcel Inspection Policy
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Customer is strictly permitted to open and verify the brand-new sealed retail box in front of the rider before completing COD payment."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    onClick={() => showToast('Settings saved successfully!')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: ADD / EDIT PRODUCT DRAWER (SHOPIFY-GRADE) */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
            showToast(editingProduct ? 'Product updated successfully!' : 'New product added to catalog!');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('voltphone_products_updated'));
            }
            fetchData();
          }}
        />
      )}

      {/* MODAL 2: QUICK RESTOCK DIALOG */}
      {isRestockModalOpen && restockTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Restock Product
              </h3>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-bold text-white text-sm">{restockTarget.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Current Stock: <span className="font-bold text-cyan-400">{restockTarget.stockQty ?? 0}</span> units
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Quick Addition Chips:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickRestock(restockTarget.id, amt)}
                    className="py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600/30 text-white font-bold text-xs border border-slate-800 hover:border-emerald-500/40 transition-all"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Or enter custom quantity to add:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={customRestockQty}
                  onChange={(e) => setCustomRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleQuickRestock(restockTarget.id, customRestockQty)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition-all shadow-md shadow-emerald-600/20"
                >
                  Restock Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmationTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Delete Product?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">{deleteConfirmationTarget.name}</strong> from the catalog? This will remove it from the customer storefront immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmationTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmationTarget)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PACKING SLIP / INVOICE VIEW */}
      {viewingOrderReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6 relative print:p-0">
            <button
              onClick={() => setViewingOrderReceipt(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="border-b border-slate-200 pb-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">VoltPhone PK</h2>
                <p className="text-xs text-slate-500">Official Mobile Marketplace & Logistics</p>
                <p className="text-xs text-slate-500">PTA-Approved Direct Dispatch Delivery Note</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-cyan-700">
                  #{viewingOrderReceipt.orderId}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(viewingOrderReceipt.createdAt).toLocaleDateString()}
                </div>
                <div className="text-[11px] font-bold text-emerald-700 uppercase mt-1">
                  OPEN PARCEL VERIFIED
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Deliver To Customer:
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {viewingOrderReceipt.customerName}
                </div>
                <div className="text-slate-600">{viewingOrderReceipt.phone}</div>
                <div className="text-slate-600 mt-1">
                  {viewingOrderReceipt.address}, {viewingOrderReceipt.city}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Shipping & Courier:
                </div>
                <div className="font-bold text-slate-900">
                  {viewingOrderReceipt.courier || 'TCS Express'}
                </div>
                <div className="text-slate-600">
                  Payment: {viewingOrderReceipt.paymentMethod}
                </div>
                <div className="text-slate-600 font-semibold mt-1">
                  COD Amount to Collect: {formatPKR(viewingOrderReceipt.totalPKR)}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5">Variant / Color</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Array.isArray(viewingOrderReceipt.items) &&
                    viewingOrderReceipt.items.map((it: any, idx: number) => {
                      if (typeof it === 'string') {
                        return (
                          <tr key={idx}>
                            <td colSpan={3} className="p-2.5 font-medium">
                              {it}
                            </td>
                            <td className="p-2.5 text-right font-bold">
                              {formatPKR(viewingOrderReceipt.totalPKR)}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-900">{it.name}</td>
                          <td className="p-2.5 text-slate-600">
                            {it.variant || ''} {it.color ? `(${it.color})` : ''}
                          </td>
                          <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatPKR(it.pricePKR * it.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Total and Open Parcel Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
              ⚠️ Courier Instruction: Customer is allowed to open the parcel and verify box seal before paying COD. Official 1-Year brand warranty applies.
            </div>

            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                Print Packing Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: FULL SHOPIFY-STYLE PRODUCT FORM DRAWER / MODAL
// -------------------------------------------------------------
interface ProductFormModalProps {
  product: Smartphone | null;
  onClose: () => void;
  onSaved: () => void;
}

function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || 'Samsung');
  const [tagline, setTagline] = useState(
    product?.tagline || 'Official Brand Smartphone with 1-Year Warranty & PTA Approval'
  );
  const [basePricePKR, setBasePricePKR] = useState(product?.basePricePKR || 49999);
  const [originalPricePKR, setOriginalPricePKR] = useState(
    product?.originalPricePKR || 59999
  );
  const [stockQty, setStockQty] = useState(product?.stockQty ?? 10);
  const [inStock, setInStock] = useState(product?.inStock !== false);
  const [isNew, setIsNew] = useState(product?.isNew || false);
  const [isTrending, setIsTrending] = useState(product?.isTrending || false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller || false);

  // Colors
  const [colors, setColors] = useState<SmartphoneColor[]>(
    product?.colors && product.colors.length > 0
      ? product.colors
      : [
          {
            name: 'Phantom Black',
            hex: '#1e293b',
            image: 'https://images.priceoye.pk/samsung-galaxy-s22-ultra-pakistan-priceoye-w11tk-500x500.webp',
            inStock: true,
            stockQty: 5,
          },
        ]
  );

  // Variants (RAM / Storage)
  const [variants, setVariants] = useState<SmartphoneVariant[]>(
    product?.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: 'var-1',
            ram: '8GB',
            storage: '128GB',
            pricePKR: product?.basePricePKR || 49999,
            originalPricePKR: product?.originalPricePKR || 59999,
            inStock: true,
            stockQty: 10,
          },
        ]
  );

  // Specifications
  const [screen, setScreen] = useState(product?.specs?.screen || '6.7 inches AMOLED 120Hz');
  const [refreshRate, setRefreshRate] = useState(product?.specs?.refreshRate || '120Hz');
  const [processor, setProcessor] = useState(product?.specs?.processor || 'Octa-Core High Performance');
  const [battery, setBattery] = useState(product?.specs?.battery || '5000 mAh');
  const [charging, setCharging] = useState(product?.specs?.charging || '45W Fast Charging');
  const [mainCamera, setMainCamera] = useState(product?.specs?.mainCamera || '50 MP + 8 MP + 2 MP');
  const [selfieCamera, setSelfieCamera] = useState(product?.specs?.selfieCamera || '16 MP');
  const [os, setOs] = useState(product?.specs?.os || 'Android 14');
  const [ptaStatus, setPtaStatus] = useState<'PTA Approved' | 'Non-PTA'>(
    product?.specs?.ptaStatus || 'PTA Approved'
  );
  const [warranty, setWarranty] = useState(
    product?.specs?.warranty || '1 Year Official Pakistan Brand Warranty'
  );

  // Add Color Row
  const handleAddColor = () => {
    setColors([
      ...colors,
      {
        name: 'New Color',
        hex: '#0284c7',
        image: 'https://images.priceoye.pk/samsung-galaxy-s22-ultra-pakistan-priceoye-lilj8-500x500.webp',
        inStock: true,
        stockQty: 5,
      },
    ]);
  };

  // Remove Color Row
  const handleRemoveColor = (idx: number) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((_, i) => i !== idx));
  };

  // Add Variant Row
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        ram: '8GB',
        storage: '256GB',
        pricePKR: basePricePKR + 10000,
        originalPricePKR: originalPricePKR + 10000,
        inStock: true,
        stockQty: 5,
      },
    ]);
  };

  // Remove Variant Row
  const handleRemoveVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a product title.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const discountPercent =
      originalPricePKR > basePricePKR
        ? Math.round(((originalPricePKR - basePricePKR) / originalPricePKR) * 100)
        : 0;

    const payload: Smartphone = {
      id: product?.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      slug: product?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      brand,
      tagline,
      basePricePKR: Number(basePricePKR),
      originalPricePKR: Number(originalPricePKR),
      discountPercent,
      rating: product?.rating || 4.8,
      reviewCount: product?.reviewCount || 42,
      inStock,
      stockQty: Number(stockQty),
      isNew,
      isTrending,
      isBestSeller,
      colors,
      variants,
      specs: {
        screen,
        refreshRate,
        displayType: screen,
        processor,
        chipsetBrand: processor.includes('Snapdragon') ? 'Qualcomm Snapdragon' : 'MediaTek',
        mainCamera,
        selfieCamera,
        battery,
        charging,
        os,
        network: '5G / 4G LTE',
        security: 'In-Display Fingerprint / Face Unlock',
        weight: '198 g',
        waterResistance: 'IP68 Water/Dust Resistant',
        ptaStatus,
        warranty,
      },
      keyHighlights: {
        display: screen,
        camera: mainCamera,
        battery,
        processor,
        charging,
      },
    };

    try {
      const url = '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: payload }),
      });

      const data = await res.json();
      if (data.success) {
        onSaved();
      } else {
        setFormError(data.error || 'Failed to save product');
      }
    } catch {
      setFormError('Network error saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              {isEditing ? `Edit Product: ${product?.name}` : 'Add New Smartphone to Catalog'}
            </h2>
            <p className="text-xs text-slate-400">
              Complete Shopify-grade product form with specs, colors, and variant stock.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              Basic Information & Brand
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand *</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {BRANDS.filter((b) => b !== 'All Brands').map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Tagline / Short Description
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Official Pakistan Brand Warranty & PTA Approved"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Master Inventory */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selling Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={basePricePKR}
                  onChange={(e) => setBasePricePKR(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Original / Cut-off Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={originalPricePKR}
                  onChange={(e) => setOriginalPricePKR(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Master Stock (Units) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQty}
                  onChange={(e) => {
                    const q = parseInt(e.target.value) || 0;
                    setStockQty(q);
                    setInStock(q > 0);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Badges / Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>In Stock (Purchasable)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>&quot;New Arrival&quot; Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>&quot;Trending&quot; Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>&quot;Best Seller&quot; Badge</span>
              </label>
            </div>
          </div>

          {/* Section 3: Colors & Media */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Colorways & Photos ({colors.length})
              </h3>
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-bold flex items-center gap-1 border border-cyan-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Color
              </button>
            </div>

            <div className="space-y-3">
              {colors.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400">Color Name</label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const newCols = [...colors];
                        newCols[idx].name = e.target.value;
                        setColors(newCols);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400">Hex Code</label>
                      <input
                        type="text"
                        value={c.hex}
                        onChange={(e) => {
                          const newCols = [...colors];
                          newCols[idx].hex = e.target.value;
                          setColors(newCols);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <input
                      type="color"
                      value={c.hex.startsWith('#') ? c.hex : '#1e293b'}
                      onChange={(e) => {
                        const newCols = [...colors];
                        newCols[idx].hex = e.target.value;
                        setColors(newCols);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 mt-3"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-slate-400">Image WebP URL</label>
                    <input
                      type="url"
                      value={c.image}
                      onChange={(e) => {
                        const newCols = [...colors];
                        newCols[idx].image = e.target.value;
                        setColors(newCols);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Color Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={c.stockQty ?? 5}
                      onChange={(e) => {
                        const newCols = [...colors];
                        newCols[idx].stockQty = parseInt(e.target.value) || 0;
                        setColors(newCols);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 mt-3"
                      title="Remove Color"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: RAM / Storage Variants */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                RAM & Storage Variants ({variants.length})
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-bold flex items-center gap-1 border border-purple-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">RAM</label>
                    <input
                      type="text"
                      value={v.ram}
                      onChange={(e) => {
                        const newVars = [...variants];
                        newVars[idx].ram = e.target.value;
                        setVariants(newVars);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Storage</label>
                    <input
                      type="text"
                      value={v.storage}
                      onChange={(e) => {
                        const newVars = [...variants];
                        newVars[idx].storage = e.target.value;
                        setVariants(newVars);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400">Price (PKR)</label>
                    <input
                      type="number"
                      value={v.pricePKR}
                      onChange={(e) => {
                        const newVars = [...variants];
                        newVars[idx].pricePKR = parseInt(e.target.value) || 0;
                        setVariants(newVars);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={v.stockQty ?? 5}
                      onChange={(e) => {
                        const newVars = [...variants];
                        newVars[idx].stockQty = parseInt(e.target.value) || 0;
                        setVariants(newVars);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400">Status</label>
                    <select
                      value={v.inStock ? 'yes' : 'no'}
                      onChange={(e) => {
                        const newVars = [...variants];
                        newVars[idx].inStock = e.target.value === 'yes';
                        setVariants(newVars);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="yes">In Stock</option>
                      <option value="no">Out of Stock</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 mt-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Technical Specs */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              Technical Specifications & PTA
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Display / Screen
                </label>
                <input
                  type="text"
                  value={screen}
                  onChange={(e) => setScreen(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Refresh Rate
                </label>
                <input
                  type="text"
                  value={refreshRate}
                  onChange={(e) => setRefreshRate(e.target.value)}
                  placeholder="120Hz / 60Hz"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Processor</label>
                <input
                  type="text"
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Battery Capacity
                </label>
                <input
                  type="text"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Charging Speed
                </label>
                <input
                  type="text"
                  value={charging}
                  onChange={(e) => setCharging(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Main Camera
                </label>
                <input
                  type="text"
                  value={mainCamera}
                  onChange={(e) => setMainCamera(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selfie Camera
                </label>
                <input
                  type="text"
                  value={selfieCamera}
                  onChange={(e) => setSelfieCamera(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PTA DIRBS Status
                </label>
                <select
                  value={ptaStatus}
                  onChange={(e: any) => setPtaStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="PTA Approved">PTA Approved</option>
                  <option value="Non-PTA">Non-PTA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Warranty</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
