import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  ShoppingBag,
  ArrowRight,
  FileText,
} from 'lucide-react';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  // 1. Fetch order from DB
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: { addOns: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // 2. Fetch settings
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: 'settings_singleton' },
  });

  const currency = settings?.currency || 'ج.م';
  const whatsapp = settings?.whatsappNumber || '201023456789';

  // Format WhatsApp message with order details
  const whatsappMsg = encodeURIComponent(
    `السلام عليكم، أنا العميل ${order.customerName}.\nقمت بعمل طلب رقم (*${order.orderNumber}*) من موقعكم.\nإجمالي المبلغ: ${order.totalAmount} ${currency}.\nيرجى تأكيد استلام الطلب وموافاتي بوقت التوصيل التقريبي. شكراً لكم!`
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#140d07] text-[#fbf7ee]">
      <Navbar settings={settings || undefined} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Receipt Card */}
        <div className="bg-[#1c120a] border-2 border-amber-800/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8">
          
          {/* Header Status */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="inline-block bg-amber-950/70 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-800/50">
              طلب محفوظ وجاري مراجعته
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-[#fbf7ee]">
              تم إرسال واستلام طلبك بنجاح!
            </h1>

            <p className="text-xs sm:text-sm text-[#a89580] max-w-md mx-auto leading-relaxed">
              شكراً لاختيارك <strong>مطعم واحة النيل</strong>. تم حفظ طلبك برقم فريد، وسيتواصل معك فريقنا خلال دقائق لتأكيد وقت التحضير والتوصيل.
            </p>
          </div>

          {/* Order Details Header Box */}
          <div className="bg-[#140d07] border border-[#382414] p-5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[11px] text-[#8c7964] block">رقم الطلب</span>
              <span className="font-black text-amber-400 text-base sm:text-lg">
                {order.orderNumber}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8c7964] block">تاريخ الطلب</span>
              <span className="font-bold text-[#fbf7ee] text-xs sm:text-sm">
                {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8c7964] block">طريقة الاستلام</span>
              <span className="font-bold text-amber-300 text-xs sm:text-sm">
                {order.fulfillmentType === 'DELIVERY' ? 'توصيل للمنزل 🛵' : 'استلام من الفرع 🏃'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8c7964] block">طريقة الدفع</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                نقدًا عند الاستلام
              </span>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="space-y-3 text-xs bg-[#22150b] p-4 rounded-2xl border border-[#382414]">
            <div className="flex justify-between items-center pb-2 border-b border-[#2d1c10]">
              <span className="text-[#8c7964]">اسم العميل:</span>
              <span className="font-bold text-[#fbf7ee]">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#2d1c10]">
              <span className="text-[#8c7964]">رقم الهاتف:</span>
              <span className="font-bold text-[#fbf7ee]" dir="ltr">
                {order.customerPhone}
              </span>
            </div>

            {order.fulfillmentType === 'DELIVERY' && (
              <>
                {order.deliveryZone && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#2d1c10]">
                    <span className="text-[#8c7964]">نطاق التوصيل:</span>
                    <span className="font-bold text-amber-400">{order.deliveryZone}</span>
                  </div>
                )}
                <div className="flex justify-between items-start pt-1">
                  <span className="text-[#8c7964] shrink-0">عنوان التوصيل:</span>
                  <span className="font-bold text-[#fbf7ee] text-left pr-4">
                    {order.deliveryAddress}
                  </span>
                </div>
              </>
            )}

            {order.customerNotes && (
              <div className="pt-2 border-t border-[#2d1c10] text-[#d6c7b2]">
                <strong className="text-amber-500">ملاحظاتك:</strong> {order.customerNotes}
              </div>
            )}
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-[#fbf7ee] flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>تفاصيل الأصناف المطلوبة</span>
            </h3>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#140d07] border border-[#2d1c10] p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#fbf7ee]">
                      {item.itemName} × {item.quantity}
                    </span>
                    {item.variantName && (
                      <span className="text-amber-400 text-[11px] block">
                        ({item.variantName})
                      </span>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="text-[#8c7964] text-[10px] block">
                        إضافات: {item.addOns.map((a) => a.addOnName).join('، ')}
                      </span>
                    )}
                    {item.itemNotes && (
                      <span className="text-amber-300/80 text-[10px] block italic">
                        ملاحظة: {item.itemNotes}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-amber-400 text-sm">
                    {item.totalPrice} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-[#140d07] p-4 rounded-2xl border border-[#382414] space-y-2 text-xs">
            <div className="flex justify-between text-[#8c7964]">
              <span>إجمالي الأصناف:</span>
              <span className="font-bold text-[#fbf7ee]">{order.subtotal} {currency}</span>
            </div>
            <div className="flex justify-between text-[#8c7964]">
              <span>رسوم التوصيل:</span>
              <span className="font-bold text-[#fbf7ee]">
                {order.fulfillmentType === 'DELIVERY' ? `${order.deliveryFee} ${currency}` : 'مجاناً (استلام من الفرع)'}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-amber-400 pt-3 border-t border-[#29190e]">
              <span>المبلغ المستحق نقدًا عند الاستلام:</span>
              <span>{order.totalAmount} {currency}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>متابعة وتأكيد الطلب مع المطعم عبر واتساب</span>
            </a>

            <div className="flex items-center gap-3">
              <Link
                href="/menu"
                className="flex-1 py-3 bg-[#24170d] hover:bg-[#321f12] text-[#fbf7ee] border border-[#382414] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>طلب أطباق أخرى</span>
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 bg-[#170e07] hover:bg-[#24170d] text-[#a89580] border border-[#2d1c10] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}
