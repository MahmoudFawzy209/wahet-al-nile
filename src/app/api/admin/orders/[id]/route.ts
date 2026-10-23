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

    const { status, paymentStatus } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Update order error:', err);
    return NextResponse.json(
      { error: 'فشل تحديث حالة الطلب' },
      { status: 500 }
    );
  }
}
