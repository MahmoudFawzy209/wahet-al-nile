'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  settings?: {
    whatsappNumber?: string;
    currency?: string;
    minOrderAmount?: number;
  };
}

export default function CartDrawer({ settings }: CartDrawerProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const currency = settings?.currency || 'ج.م';
  const minOrder = settings?.minOrderAmount || 100;
  const whatsapp = settings?.whatsappNumber || '201023456789';

  const isMinOrderMet = subtotal >= minOrder;
  const remainingForMin = minOrder - subtotal;

  if (!isCartOpen) return null;

  // Build formatted WhatsApp message with cart content
  const buildWhatsAppMessage = () => {
    let msg = `*طلب جديد من موقع مطعم واحة النيل* 🇾🇪\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}*`;
      if (item.variantName) msg += ` (${item.variantName})`;
      msg += ` × ${item.quantity} = ${(item.unitPrice * item.quantity).toFixed(0)} ${currency}\n`;
      if (item.addOns && item.addOns.length > 0) {
        msg += `   الإضافات: ${item.addOns.map((a) => `${a.name} (+${a.price} ${currency})`).join(', ')}\n`;
      }
      if (item.notes) {
        msg += `   ملاحظة: ${item.notes}\n`;
      }
    });
    msg += `\n*إجمالي المأكولات التقديري:* ${subtotal.toFixed(0)} ${currency}`;
    msg += `\nطريقة الدفع: نقدًا عند الاستلام`;
    msg += `\n\nيرجى تأكيد الطلب وتحديد عنوان التوصيل ووقت التجهيز.`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0">
        <div className="w-screen max-w-md bg-[#180f08] border-r border-[#382414] shadow-2xl flex flex-col text-[#fbf7ee]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#2d1c10] flex items-center justify-between bg-[#1f130a]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#fbf7ee]">سلة طلباتك</h3>
                <span className="text-xs text-[#a89580]">{totalItems} أصناف مضافة</span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl bg-[#2a1a0f] hover:bg-[#382314] text-[#a89580] hover:text-white transition-colors"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8f7b66]">
                <div className="w-20 h-20 rounded-full bg-[#24170d] flex items-center justify-center text-[#5c4a38] mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h4 className="text-lg font-bold text-[#fbf7ee] mb-1">السلة فارغة حالياً</h4>
                <p className="text-xs text-[#a89580] max-w-xs mb-6">
                  استعرض قائمة طعام مطعم واحة النيل واختر أشهى أطباق المندي والحنيذ اليمني.
                </p>
                <Link
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#b45309] hover:bg-[#d97706] text-[#140d07] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-950/50"
                >
                  استعراض المنيو الآن
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const addOnsSum = (item.addOns || []).reduce((s, a) => s + a.price, 0);
                const itemTotal = (item.unitPrice + addOnsSum) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-[#1f130a] border border-[#382414] p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all hover:border-amber-900/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-[#fbf7ee] leading-snug">
                          {item.name}
                        </h4>
                        {item.variantName && (
                          <span className="inline-block bg-amber-950/80 text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-800/40 mt-1">
                            {item.variantName}
                          </span>
                        )}

                        {/* Addons preview */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {item.addOns.map((a) => (
                              <div key={a.id} className="text-[11px] text-[#a89580] flex items-center gap-1">
                                <span className="text-amber-500">+</span>
                                <span>{a.name}</span>
                                <span className="text-amber-400/80">({a.price} {currency})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-[11px] text-amber-300/80 italic mt-1 bg-[#28180d] p-1.5 rounded-lg border border-[#422915]">
                            ملاحظة: {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Item Total Price */}
                      <div className="text-left shrink-0 font-black text-amber-400 text-sm">
                        {itemTotal.toFixed(0)} {currency}
                      </div>
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#29190e]">
                      <div className="flex items-center gap-2 bg-[#2a1a0f] p-1 rounded-xl border border-[#422915]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-[#382314] hover:bg-[#4a2e1b] flex items-center justify-center text-[#fbf7ee] transition-colors"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-[#fbf7ee]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-[#b45309] hover:bg-[#d97706] flex items-center justify-center text-[#140d07] font-bold transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#8c745f] hover:text-red-400 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs"
                        aria-label="حذف الصنف"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[11px]">حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Calculations and Checkout */}
          {items.length > 0 && (
            <div className="p-4 bg-[#1b1007] border-t border-[#2d1c10] space-y-3">
              {/* Min Order Warning */}
              {!isMinOrderMet && (
                <div className="bg-amber-950/60 border border-amber-800/60 p-2.5 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    الحد الأدنى للطلب هو {minOrder} {currency}. أضف أصنافاً بقيمة{' '}
                    <strong>{remainingForMin.toFixed(0)} {currency}</strong> للمتابعة.
                  </span>
                </div>
              )}

              {/* Subtotal row */}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-[#a89580]">إجمالي الأصناف:</span>
                <span className="font-extrabold text-lg text-amber-400">
                  {subtotal.toFixed(0)} {currency}
                </span>
              </div>
              <div className="text-[11px] text-[#8c7964]">
                * رسوم التوصيل تُحسب في الخطوة التالية بناءً على منطقتك.
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isMinOrderMet
                    ? 'bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] hover:scale-[1.01]'
                    : 'bg-[#2d1b0f] text-[#6b5542] pointer-events-none'
                }`}
              >
                <span>متابعة لإتمام الطلب (الدفع عند الاستلام)</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* WhatsApp Alternative Action */}
              <a
                href={`https://wa.me/${whatsapp}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الطلب مباشرة إلى واتساب المطعم</span>
              </a>

              {/* Clear Cart */}
              <div className="text-center pt-1">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-[#705e4c] hover:text-red-400 transition-colors"
                >
                  تفريغ السلة بالكامل
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
