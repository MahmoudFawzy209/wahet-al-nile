import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from './prisma';

const SECRET = process.env.ADMIN_JWT_SECRET || 'nile_oasis_default_secret_key_2026_xyz';
const COOKIE_NAME = 'nile_oasis_admin_token';

// Simple signed token: base64(payload).signature
export function createToken(payload: { userId: string; username: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64');
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(data);
  const signature = hmac.digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(data);
    const expectedSig = hmac.digest('base64url');
    if (expectedSig !== signature) return null;

    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    if (decoded.exp && decoded.exp < Date.now()) return null;
    return { userId: decoded.userId, username: decoded.username };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  if (!verified) return null;

  // Check if admin user still exists in DB
  const user = await prisma.adminUser.findUnique({
    where: { id: verified.userId },
    select: { id: true, username: true, name: true, email: true },
  });

  return user;
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600, // 7 days
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
