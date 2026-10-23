'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

interface CheckoutClientProps {
  deliveryZones: DeliveryZone[];
  settings?: {
    name?: string;
    phone?: string;
    whatsappNumber?: string;
    deliveryFee?: number;
    minOrderAmount?: number;
    currency?: string;
  };
}

export default function CheckoutClient({
  deliveryZones,
  settings,
}: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const currency = settings?.currency || 'ج.م';
  const defaultDeliveryFee = settings?.deliveryFee || 35;
  const minOrder = settings?.minOrderAmount || 100;

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    deliveryZones.length > 0 ? deliveryZones[0].id : ''
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delivery fee calculation
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const currentDeliveryFee =
    fulfillmentType === 'DELIVERY'
      ? selectedZone
        ? selectedZone.fee
        : defaultDeliveryFee
      : 0;

  const totalAmount = subtotal + currentDeliveryFee;
  const isMinOrderMet = subtotal >= minOrder;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('سلة مشترياتك فارغة!');
      return;
    }

    if (!isMinOrderMet) {
      setErrorMessage(`الحد الأدنى لقيمة الطلب هو ${minOrder} ${currency}`);
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('يرجى إدخال اسم العميل بشكل صحيح');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف صالح للتواصل');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setErrorMessage('يرجى كتابة عنوان التوصيل بالتفصيل (المنطقة، الشارع، العمارة، الشقة)');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        fulfillmentType,
        deliveryZoneId: fulfillmentType === 'DELIVERY' ? selectedZoneId : undefined,
        deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        customerNotes: customerNotes.trim() || undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          variantId: i.variantId,
          quantity: i.quantity,
          notes: i.notes,
          addOnIds: (i.addOns || []).map((a) => a.id),
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل إنشاء الطلب');
      }

      // Success: clear cart and navigate to order success
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ غير متوقع، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="bg-[#1c120a] border border-[#382414] p-8 rounded-3xl space-y-4">
          <ShoppingBag className="w-16 h-16 mx-auto text-[#614b38]" />
          <h2 className="text-2xl font-black text-[#fbf7ee]">السلة فارغة حالياً</h2>
          <p className="text-sm text-[#a89580]">
            لم تقم بإضافة أي أطباق بعد إلى سلة مشترياتك. استعرض المنيو واختر ما تشتهيه.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#b45309] hover:bg-[#d97706] text-[#140d07] px-6 py-3 rounded-xl font-bold text-sm"
            >
              <span>الانتقال إلى المنيو</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="bg-red-950/80 border border-red-700/80 p-4 rounded-2xl flex items-center gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form (Inputs) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Fulfillment Type Toggle */}
          <div className="bg-[#1c120a] border border-[#382414] p-5 rounded-3xl space-y-3">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              طريقة الاستلام:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                  fulfillmentType === 'DELIVERY'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-[#140d07] border-[#382414] text-[#a89580] hover:border-amber-800/60'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>توصيل إلى منزلك</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`py-3.5 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
                  fulfillmentType === 'PICKUP'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-[#140d07] border-[#382414] text-[#a89580] hover:border-amber-800/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>استلام من الفرع</span>
              </button>
            </div>
          </div>

          {/* Customer Personal Info */}
          <div className="bg-[#1c120a] border border-[#382414] p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-base text-[#fbf7ee] border-b border-[#2d1c10] pb-3">
              بيانات العميل
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#bda790]">
                  الاسم بالكامل <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثلاً: محمد فوزي"
                  className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[#fbf7ee] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#bda790]">
                  رقم الهاتف (للتواصل والتوصيل) <span className="text-amber-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[#fbf7ee] outline-none text-right"
                />
              </div>
            </div>

            {/* Delivery Details (only shown if DELIVERY is selected) */}
            {fulfillmentType === 'DELIVERY' && (
              <div className="space-y-4 pt-4 border-t border-[#29190e]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#bda790]">
                    منطقة ونطاق التوصيل <span className="text-amber-500">*</span>
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[#fbf7ee] outline-none"
                  >
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id} className="bg-[#140d07]">
                        {zone.name} (رسوم التوصيل: {zone.fee} {currency} - {zone.estimatedTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#bda790]">
                    عنوان التوصيل بالتفصيل <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، رقم الطابق، رقم الشقة، علامة مميزة..."
                    className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[#fbf7ee] outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Customer Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#bda790]">
                ملاحظات إضافية على الطلب (اختياري)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="أي طلبات خاصة بإعداد الطعام أو التوصيل..."
                className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-[#fbf7ee] outline-none resize-none"
              />
            </div>
          </div>

          {/* Payment Method Banner */}
          <div className="bg-[#1e140b] border-2 border-amber-600/40 p-5 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 flex items-center justify-center text-amber-400 shrink-0 border border-amber-700/50">
              <Banknote className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-[#fbf7ee] text-sm flex items-center gap-2">
                <span>طريقة الدفع: النقد عند الاستلام (Cash on Delivery)</span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800">
                  مؤكد
                </span>
              </h4>
              <p className="text-xs text-[#a89580] mt-0.5">
                لا يلزم إدخال أي بطاقة دفع؛ تدفع نقدًا لمندوب التوصيل بعد استلام طلبك ومراجعته.
              </p>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 bg-[#1c120a] border border-[#382414] p-6 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-lg text-[#fbf7ee] border-b border-[#2d1c10] pb-3 flex items-center justify-between">
            <span>ملخص الطلب</span>
            <span className="text-xs text-amber-500 font-bold">{items.length} أصناف</span>
          </h3>

          {/* Items breakdown */}
          <div className="space-y-3 max-h-64 overflow-y-auto pl-1">
            {items.map((item) => {
              const addOnsSum = (item.addOns || []).reduce((s, a) => s + a.price, 0);
              const lineTotal = (item.unitPrice + addOnsSum) * item.quantity;
              return (
                <div key={item.id} className="text-xs flex items-start justify-between gap-3 pb-2.5 border-b border-[#24150b]">
                  <div>
                    <span className="font-bold text-[#fbf7ee] block">
                      {item.name} × {item.quantity}
                    </span>
                    {item.variantName && (
                      <span className="text-amber-400/90 text-[11px] block">{item.variantName}</span>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="text-[#8c7964] text-[10px] block">
                        إضافات: {item.addOns.map((a) => a.name).join('، ')}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-amber-400 shrink-0">
                    {lineTotal.toFixed(0)} {currency}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Calculation rows */}
          <div className="space-y-2.5 text-xs pt-2 border-t border-[#29190e]">
            <div className="flex justify-between text-[#a89580]">
              <span>إجمالي الأصناف:</span>
              <span className="font-bold text-[#fbf7ee]">{subtotal.toFixed(0)} {currency}</span>
            </div>

            <div className="flex justify-between text-[#a89580]">
              <span>رسوم التوصيل:</span>
              <span className="font-bold text-[#fbf7ee]">
                {fulfillmentType === 'DELIVERY' ? `${currentDeliveryFee} ${currency}` : 'مجاناً (استلام من المطعم)'}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-amber-400 pt-3 border-t border-[#2d1c10]">
              <span>الإجمالي النهائي للدفع:</span>
              <span>{totalAmount.toFixed(0)} {currency}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isMinOrderMet}
            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              isSubmitting || !isMinOrderMet
                ? 'bg-[#2d1c10] text-[#6b5542] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تأكيد وحفظ الطلب...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>تأكيد الطلب الآن ({totalAmount.toFixed(0)} {currency})</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-[#705e4c] text-center">
            بالنقر على تأكيد الطلب، فإنك توافق على سياسة التوصيل ودفع المبلغ نقدًا عند الاستلام.
          </p>
        </div>
      </div>
    </form>
  );
}
