import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createToken, setAdminCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: username.trim() }, { email: username.trim() }],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const token = createToken({ userId: admin.id, username: admin.username });
    await setAdminCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: admin.id, username: admin.username, name: admin.name },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
