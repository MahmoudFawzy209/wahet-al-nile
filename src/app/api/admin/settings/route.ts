import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بتنفيذ هذه العملية' }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      tagline,
      phone,
      whatsappNumber,
      address,
      openingHours,
      deliveryFee,
      minOrderAmount,
      isOpen,
      closedMessage,
    } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (tagline) dataToUpdate.tagline = tagline;
    if (phone) dataToUpdate.phone = phone;
    if (whatsappNumber) dataToUpdate.whatsappNumber = whatsappNumber;
    if (address) dataToUpdate.address = address;
    if (openingHours) dataToUpdate.openingHours = openingHours;
    if (typeof isOpen === 'boolean') dataToUpdate.isOpen = isOpen;
    if (closedMessage) dataToUpdate.closedMessage = closedMessage;
    if (deliveryFee !== undefined) dataToUpdate.deliveryFee = parseFloat(deliveryFee);
    if (minOrderAmount !== undefined) dataToUpdate.minOrderAmount = parseFloat(minOrderAmount);

    const updated = await prisma.restaurantSettings.upsert({
      where: { id: 'settings_singleton' },
      update: dataToUpdate,
      create: {
        id: 'settings_singleton',
        ...dataToUpdate,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return NextResponse.json(
      { error: 'فشل حفظ إعدادات المطعم' },
      { status: 500 }
    );
  }
}
