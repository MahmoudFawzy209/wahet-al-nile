import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import MenuClient from '@/components/menu/MenuClient';

export const metadata: Metadata = {
  title: 'قائمة الطعام والأسعار | مطعم واحة النيل للمأكولات اليمنية',
  description:
    'استعرض قائمة طعام مطعم واحة النيل: المندي، الحنيذ، الزربيان، السلتة والفحسة الصنعانية، والحلويات والمشروبات اليمنية مع الأسعار وإمكانية الطلب المباشر.',
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const categoryParam = resolvedParams?.category || 'all';

  // 1. Fetch settings
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: 'settings_singleton' },
  });

  // 2. Fetch categories with items and variants/addons
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          variants: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' },
          },
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      },
    },
  });

  // Format data cleanly
  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      basePrice: item.basePrice,
      imageUrl: item.imageUrl,
      servingSize: item.servingSize,
      isAvailable: item.isAvailable,
      variants: item.variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
      })),
      addOns: item.addOns.map((a) => ({
        id: a.addOn.id,
        name: a.addOn.name,
        price: a.addOn.price,
      })),
    })),
  }));

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold mb-2">
            <span>مطعم واحة النيل</span>
            <span>/</span>
            <span className="text-[#a89580]">قائمة الطعام الرسمية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#fbf7ee]">
            قائمة الطعام والمأكولات اليمنية
          </h1>
          <p className="text-sm text-[#a89580] mt-2 max-w-2xl leading-relaxed">
            مأكولات يمنية محضرة بعناية فائقة وتوابل طازجة مستوردة خصيصاً من اليمن، مطهوة على الأصول التقليدية. اختر طبقك المفضل واطلبه ليصلك طازجاً وساخناً.
          </p>
        </div>

        {/* Client Interactive Filter & Grid */}
        <MenuClient
          categories={formattedCategories}
          currency={settings?.currency || 'ج.م'}
          initialCategory={categoryParam}
        />
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}
