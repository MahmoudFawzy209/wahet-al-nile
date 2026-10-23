'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  LogOut,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Eye,
  Search,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: {
    id: string;
    username: string;
    name: string;
  };
  initialSettings: any;
  initialOrders: any[];
  initialCategories: any[];
}

export default function AdminDashboardClient({
  adminUser,
  initialSettings,
  initialOrders,
  initialCategories,
}: AdminDashboardProps) {
  const router = useRouter();

  // Active Tab: 'overview' | 'orders' | 'menu' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'settings'>('overview');

  // State
  const [orders, setOrders] = useState(initialOrders);
  const [categories, setCategories] = useState(initialCategories);
  const [settings, setSettings] = useState(initialSettings);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: settings?.name || '',
    phone: settings?.phone || '',
    whatsappNumber: settings?.whatsappNumber || '',
    address: settings?.address || '',
    openingHours: settings?.openingHours || '',
    deliveryFee: settings?.deliveryFee || 35,
    minOrderAmount: settings?.minOrderAmount || 100,
    isOpen: settings?.isOpen ?? true,
    closedMessage: settings?.closedMessage || '',
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Payment Status
  const handleTogglePaymentStatus = async (orderId: string, currentStatus: string) => {
    const paymentStatus = currentStatus === 'COLLECTED' ? 'PENDING' : 'COLLECTED';
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, paymentStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Item Availability
  const handleToggleAvailability = async (itemId: string, current: boolean) => {
    const isAvailable = !current;
    try {
      const res = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.map((it: any) =>
              it.id === itemId ? { ...it, isAvailable } : it
            ),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Calculated Metrics
  const newOrdersCount = orders.filter((o) => o.status === 'NEW').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'COLLECTED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus =
      orderStatusFilter === 'ALL' ? true : o.status === orderStatusFilter;
    const matchSearch =
      orderSearch.trim() === ''
        ? true
        : o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
          o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
          o.customerPhone.includes(orderSearch);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="bg-blue-950 text-blue-300 border border-blue-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">جديد</span>;
      case 'CONFIRMED':
        return <span className="bg-amber-950 text-amber-300 border border-amber-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">تم التأكيد</span>;
      case 'PREPARING':
        return <span className="bg-orange-950 text-orange-300 border border-orange-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">قيد التحضير</span>;
      case 'READY_FOR_PICKUP':
        return <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">جاهز للاستلام</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-purple-950 text-purple-300 border border-purple-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">خرج للتوصيل</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">مكتمل</span>;
      case 'CANCELLED':
        return <span className="bg-red-950 text-red-300 border border-red-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">ملغي</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 text-[11px] px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#100a06] text-[#fbf7ee] flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-[#191009] border-b border-[#331f11] h-18 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a3412] to-[#f59e0b] flex items-center justify-center text-[#140d07]">
            <Flame className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#fbf7ee]">
              لوحة تحكم واحة النيل
            </h1>
            <span className="text-[11px] text-[#8c7964]">
              المسؤول: {adminUser.name} ({adminUser.username})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-[#25170d] hover:bg-[#321f12] text-[#d6c7b2] border border-[#3e2716] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <span>معاينة الموقع</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#29190e] pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#b45309] text-[#140d07] shadow-lg'
                : 'bg-[#1a1008] text-[#a89580] hover:text-white border border-[#331f11]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#b45309] text-[#140d07] shadow-lg'
                : 'bg-[#1a1008] text-[#a89580] hover:text-white border border-[#331f11]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إدارة الطلبات ({orders.length})</span>
            {newOrdersCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#b45309] text-[#140d07] shadow-lg'
                : 'bg-[#1a1008] text-[#a89580] hover:text-white border border-[#331f11]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>إدارة المنيو والأصناف</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#b45309] text-[#140d07] shadow-lg'
                : 'bg-[#1a1008] text-[#a89580] hover:text-white border border-[#331f11]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المطعم</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-2xl">
                <span className="text-xs text-[#8c7964] block font-medium">الطلبات الجديدة</span>
                <span className="text-3xl font-black text-blue-400 mt-2 block">{newOrdersCount}</span>
                <span className="text-[11px] text-[#a89580] mt-1 block">تحتاج إلى تأكيد ومراجعة</span>
              </div>

              <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-2xl">
                <span className="text-xs text-[#8c7964] block font-medium">قيد التحضير والتجهيز</span>
                <span className="text-3xl font-black text-amber-400 mt-2 block">{preparingCount}</span>
                <span className="text-[11px] text-[#a89580] mt-1 block">في المطبخ أو قيد التوصيل</span>
              </div>

              <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-2xl">
                <span className="text-xs text-[#8c7964] block font-medium">الطلبات المكتملة</span>
                <span className="text-3xl font-black text-emerald-400 mt-2 block">{completedCount}</span>
                <span className="text-[11px] text-[#a89580] mt-1 block">تم تسليمها للعملاء</span>
              </div>

              <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-2xl">
                <span className="text-xs text-[#8c7964] block font-medium">إجمالي المبيعات المحصلة</span>
                <span className="text-3xl font-black text-amber-400 mt-2 block">{totalRevenue.toFixed(0)} ج.م</span>
                <span className="text-[11px] text-[#a89580] mt-1 block">مبالغ مسجلة بالدفع النقدي</span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-[#1c120a] border border-[#382414] p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#fbf7ee]">
                  أحدث الطلبات الواردة
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  عرض كافة الطلبات
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#2e1d10] text-[#8c7964]">
                      <th className="py-3 px-2">رقم الطلب</th>
                      <th className="py-3 px-2">العميل</th>
                      <th className="py-3 px-2">الهاتف</th>
                      <th className="py-3 px-2">الإجمالي</th>
                      <th className="py-3 px-2">الحالة</th>
                      <th className="py-3 px-2">التحصيل</th>
                      <th className="py-3 px-2">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24170d]">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#25170d]/50">
                        <td className="py-3 px-2 font-bold text-amber-400">{ord.orderNumber}</td>
                        <td className="py-3 px-2 font-medium">{ord.customerName}</td>
                        <td className="py-3 px-2" dir="ltr">{ord.customerPhone}</td>
                        <td className="py-3 px-2 font-black">{ord.totalAmount} ج.م</td>
                        <td className="py-3 px-2">{getStatusBadge(ord.status)}</td>
                        <td className="py-3 px-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.paymentStatus === 'COLLECTED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {ord.paymentStatus === 'COLLECTED' ? 'تم التحصيل' : 'معلق'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="bg-[#2d1c10] hover:bg-[#3d2616] text-[#d6c7b2] px-3 py-1 rounded-lg text-[11px] font-bold"
                          >
                            التفاصيل
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

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-3xl space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7964]" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="ابحث برقم الطلب (WN-...)، أو اسم العميل، أو رقم الهاتف..."
                  className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl pr-11 pl-4 py-3 text-xs text-[#fbf7ee] outline-none"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['ALL', 'NEW', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === st
                        ? 'bg-amber-500 text-[#140d07]'
                        : 'bg-[#25170d] text-[#8c7964] hover:text-white border border-[#382414]'
                    }`}
                  >
                    {st === 'ALL' ? 'كافة الحالات' : getStatusBadge(st)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#1c120a] border border-[#382414] rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#170e07] border-b border-[#2e1d10] text-[#8c7964]">
                    <tr>
                      <th className="py-4 px-4">رقم الطلب</th>
                      <th className="py-4 px-4">الوقت</th>
                      <th className="py-4 px-4">اسم العميل</th>
                      <th className="py-4 px-4">الهاتف</th>
                      <th className="py-4 px-4">النوع</th>
                      <th className="py-4 px-4">الإجمالي</th>
                      <th className="py-4 px-4">حالة الطلب</th>
                      <th className="py-4 px-4">التحصيل</th>
                      <th className="py-4 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24170d]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#705e4c]">
                          لا توجد طلبات تطابق معايير البحث
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#25170d]/60 transition-colors">
                          <td className="py-3.5 px-4 font-black text-amber-400">{ord.orderNumber}</td>
                          <td className="py-3.5 px-4 text-[#8c7964]">
                            {new Date(ord.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#fbf7ee]">{ord.customerName}</td>
                          <td className="py-3.5 px-4" dir="ltr">{ord.customerPhone}</td>
                          <td className="py-3.5 px-4 text-[#a89580]">
                            {ord.fulfillmentType === 'DELIVERY' ? 'توصيل' : 'استلام'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-[#fbf7ee]">{ord.totalAmount} ج.م</td>
                          <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePaymentStatus(ord.id, ord.paymentStatus)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                ord.paymentStatus === 'COLLECTED'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
                                  : 'bg-amber-950 text-amber-400 border-amber-700 hover:bg-amber-900'
                              }`}
                            >
                              {ord.paymentStatus === 'COLLECTED' ? '✓ محصل' : 'معلق'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="bg-[#2d1c10] hover:bg-[#3d2616] text-amber-400 border border-[#422915] px-3 py-1.5 rounded-xl font-bold transition-colors"
                            >
                              إدارة وتفاصيل
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

        {/* TAB 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-[#1c120a] border border-[#382414] p-6 rounded-3xl">
              <h3 className="font-extrabold text-base text-[#fbf7ee] mb-1">
                إدارة قائمة الأطباق وحالة التوفر
              </h3>
              <p className="text-xs text-[#8c7964]">
                يمكنك بنقرة زر واحدة إيقاف توفر أي طبق إذا نفدت الكمية بالمطعم دون الحاجة لحذفه.
              </p>
            </div>

            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-[#1c120a] border border-[#382414] rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#2d1c10] pb-3">
                    <h4 className="font-black text-lg text-amber-400 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span>{cat.name}</span>
                    </h4>
                    <span className="text-xs text-[#8c7964]">{cat.items.length} أصناف</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cat.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="bg-[#140d07] border border-[#2e1d10] p-4 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#25170d]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/hero-yemeni-feast.jpg';
                            }}
                          />
                          <div>
                            <h5 className="font-bold text-sm text-[#fbf7ee] line-clamp-1">{item.name}</h5>
                            <span className="text-xs font-black text-amber-400 block mt-0.5">
                              {item.basePrice} ج.م
                            </span>
                          </div>
                        </div>

                        {/* Availability toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              item.isAvailable
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                                : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                            }`}
                          >
                            {item.isAvailable ? 'متوفر ✓' : 'غير متوفر ✗'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RESTAURANT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-[#1c120a] border border-[#382414] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-xl text-[#fbf7ee]">
                إعدادات المطعم العامة
              </h3>
              <p className="text-xs text-[#8c7964] mt-1">
                تعديل الاسم وساعات العمل وحالة استقبال الطلبات ورسوم التوصيل.
              </p>
            </div>

            {settingsSuccess && (
              <div className="bg-emerald-950 border border-emerald-700 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم حفظ إعدادات المطعم بنجاح وتحديثها في الموقع!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Restaurant Open Toggle */}
              <div className="bg-[#140d07] border border-[#382414] p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#fbf7ee] block">حالة استقبال الطلبات بالموقع:</span>
                  <span className="text-[#8c7964] text-[11px]">
                    {settingsForm.isOpen ? 'الموقع مفتوح ويستقبل الطلبات فورياً' : 'الموقع مغلق مؤقتاً'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, isOpen: !settingsForm.isOpen })}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    settingsForm.isOpen
                      ? 'bg-emerald-500 text-[#140d07]'
                      : 'bg-red-900 text-red-200'
                  }`}
                >
                  {settingsForm.isOpen ? 'مفتوح (نشط)' : 'مغلق مؤقتاً'}
                </button>
              </div>

              {!settingsForm.isOpen && (
                <div className="space-y-1">
                  <label className="font-bold text-[#bda790]">رسالة الإغلاق المؤقت التي تظهر للعملاء:</label>
                  <input
                    type="text"
                    value={settingsForm.closedMessage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, closedMessage: e.target.value })}
                    className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[#bda790]">اسم المطعم:</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#bda790]">رقم الهاتف الرئيسي:</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    dir="ltr"
                    className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none text-right"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#bda790]">رقم الواتساب (بدون + وبالمفتاح الدولي):</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    dir="ltr"
                    className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#bda790]">العنوان الرسمي للفرع:</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#bda790]">ساعات العمل اليومية:</label>
                <input
                  type="text"
                  value={settingsForm.openingHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                  className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#bda790]">رسوم التوصيل الافتراضية (ج.م):</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                    className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#bda790]">الحد الأدنى لقيمة الطلب (ج.م):</label>
                  <input
                    type="number"
                    value={settingsForm.minOrderAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-[#140d07] border border-[#382414] rounded-xl px-4 py-2.5 text-[#fbf7ee] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3.5 bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] font-black rounded-xl shadow-lg transition-all"
                >
                  {isSavingSettings ? 'جاري الحفظ...' : 'حفظ التعديلات في قاعدة البيانات'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1c120a] border border-[#382414] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d1c10] pb-3">
              <div>
                <span className="text-xs text-[#8c7964] block">تفاصيل الطلب رقم</span>
                <h3 className="font-black text-xl text-amber-400">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[#25170d] text-[#a89580] hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Status change actions */}
            <div className="bg-[#140d07] border border-[#2d1c10] p-4 rounded-2xl space-y-3 text-xs">
              <label className="font-bold text-[#bda790] block">تغيير حالة الطلب:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'NEW', label: 'جديد' },
                  { key: 'CONFIRMED', label: 'تم التأكيد' },
                  { key: 'PREPARING', label: 'قيد التحضير' },
                  { key: 'READY_FOR_PICKUP', label: 'جاهز للاستلام' },
                  { key: 'OUT_FOR_DELIVERY', label: 'خرج للتوصيل' },
                  { key: 'COMPLETED', label: 'مكتمل' },
                  { key: 'CANCELLED', label: 'ملغي' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, s.key)}
                    className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                      selectedOrder.status === s.key
                        ? 'bg-amber-500 text-[#140d07]'
                        : 'bg-[#20140c] text-[#a89580] hover:text-white border border-[#382414]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Payment collected toggle */}
              <div className="pt-2 border-t border-[#24150b] flex items-center justify-between">
                <span>حالة تحصيل المبلغ نقدًا:</span>
                <button
                  onClick={() => handleTogglePaymentStatus(selectedOrder.id, selectedOrder.paymentStatus)}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    selectedOrder.paymentStatus === 'COLLECTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {selectedOrder.paymentStatus === 'COLLECTED' ? '✓ تم استلام النقد' : 'معلق لم يُحصل بعد'}
                </button>
              </div>
            </div>

            {/* Customer info */}
            <div className="space-y-2 text-xs bg-[#24170d] p-4 rounded-2xl border border-[#382414]">
              <div className="flex justify-between">
                <span className="text-[#8c7964]">العميل:</span>
                <span className="font-bold text-[#fbf7ee]">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c7964]">الهاتف:</span>
                <span className="font-bold text-[#fbf7ee]" dir="ltr">{selectedOrder.customerPhone}</span>
              </div>
              {selectedOrder.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-[#8c7964]">العنوان:</span>
                  <span className="font-bold text-[#fbf7ee]">{selectedOrder.deliveryAddress}</span>
                </div>
              )}
              {selectedOrder.customerNotes && (
                <div className="pt-1 text-amber-300">
                  <strong>ملاحظة العميل:</strong> {selectedOrder.customerNotes}
                </div>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {selectedOrder.items?.map((it: any) => (
                <div key={it.id} className="bg-[#140d07] p-2.5 rounded-xl border border-[#2d1c10] flex justify-between">
                  <div>
                    <span className="font-bold">{it.itemName} × {it.quantity}</span>
                    {it.variantName && <span className="text-amber-400 text-[11px] block">({it.variantName})</span>}
                  </div>
                  <span className="font-black text-amber-400">{it.totalPrice} ج.م</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between text-base font-black text-amber-400 pt-2 border-t border-[#2d1c10]">
              <span>إجمالي الطلب:</span>
              <span>{selectedOrder.totalAmount} ج.م</span>
            </div>

            {/* Quick WhatsApp Action */}
            <a
              href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `مرحباً ${selectedOrder.customerName}، معك مطعم واحة النيل بخصوص طلبك رقم ${selectedOrder.orderNumber}. حالياً الطلب: ${selectedOrder.status}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مراسلة العميل عبر واتساب</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
