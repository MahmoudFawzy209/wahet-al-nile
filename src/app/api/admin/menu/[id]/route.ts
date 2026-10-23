import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بتنفيذ هذه العملية' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const { name, basePrice, isAvailable, isFeatured, description } = body;

    const dataToUpdate: any = {};
    if (typeof isAvailable === 'boolean') dataToUpdate.isAvailable = isAvailable;
    if (typeof isFeatured === 'boolean') dataToUpdate.isFeatured = isFeatured;
    if (basePrice !== undefined) dataToUpdate.basePrice = parseFloat(basePrice);
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('Update menu item error:', err);
    return NextResponse.json(
      { error: 'فشل تحديث بيانات الصنف' },
      { status: 500 }
    );
  }
}
