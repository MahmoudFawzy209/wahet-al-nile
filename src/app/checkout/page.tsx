import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'إتمام الطلب | مطعم واحة النيل للمأكولات اليمنية',
  description: 'أكمل بيانات طلبك وحدد عنوان التوصيل مع الدفع نقدًا عند الاستلام.',
};

export default async function CheckoutPage() {
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: 'settings_singleton' },
  });

  const deliveryZones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { fee: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#140d07] text-[#fbf7ee]">
      <Navbar settings={settings || undefined} />
      <CartDrawer
        settings={{
          whatsappNumber: settings?.whatsappNumber,
          currency: settings?.currency,
          minOrderAmount: settings?.minOrderAmount,
        }}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold mb-2">
            <span>سلة المشتريات</span>
            <span>/</span>
            <span className="text-[#a89580]">إتمام الطلب</span>
          </div>
          <h1 className="text-3xl font-black text-[#fbf7ee]">
            إتمام وتأكيد الطلب
          </h1>
          <p className="text-xs sm:text-sm text-[#a89580] mt-1">
            يرجى مراجعة الأصناف وإدخال معلومات التواصل لخدمتكم بأسرع وقت ممكن.
          </p>
        </div>

        <CheckoutClient
          deliveryZones={deliveryZones}
          settings={{
            name: settings?.name,
            phone: settings?.phone,
            whatsappNumber: settings?.whatsappNumber,
            deliveryFee: settings?.deliveryFee,
            minOrderAmount: settings?.minOrderAmount,
            currency: settings?.currency,
          }}
        />
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}
