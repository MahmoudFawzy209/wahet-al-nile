import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'لوحة تحكم الإدارة | مطعم واحة النيل',
  description: 'لوحة تحكم صاحب المطعم لمتابعة الطلبات وتعديل المنيو وإعدادات الفرع.',
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  // 1. Fetch settings
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: 'settings_singleton' },
  });

  // 2. Fetch all orders with items
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { addOns: true },
      },
    },
  });

  // 3. Fetch categories with items
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
        include: { variants: true, addOns: { include: { addOn: true } } },
      },
    },
  });

  return (
    <AdminDashboardClient
      adminUser={session}
      initialSettings={settings}
      initialOrders={orders}
      initialCategories={categories}
    />
  );
}
