'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100a06] flex items-center justify-center p-4 text-[#fbf7ee]">
      <div className="w-full max-w-md bg-[#1c120a] border border-[#382414] rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9a3412] to-[#f59e0b] flex items-center justify-center text-[#140d07] mx-auto shadow-lg shadow-amber-950/60 mb-3">
            <Flame className="w-8 h-8 text-[#140d07] stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-[#fbf7ee]">
            لوحة إدارة واحة النيل
          </h1>
          <p className="text-xs text-[#a89580]">
            بوابة تسجيل الدخول الخاصة بمسؤول وصاحب المطعم
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-700/80 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#bda790]">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#735e4d]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl pr-10 pl-4 py-3 text-sm text-[#fbf7ee] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#bda790]">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#735e4d]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#140d07] border border-[#382414] focus:border-amber-500 rounded-xl pr-10 pl-4 py-3 text-sm text-[#fbf7ee] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <span>تسجيل الدخول إلى النظام</span>
              )}
            </button>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div className="bg-[#140d07] border border-[#2d1c10] p-3 rounded-xl text-[11px] text-[#8c7964] space-y-1">
          <span className="font-bold text-amber-500 block">بيانات المشرف الافتراضية للتجربة:</span>
          <div>المستخدم: <code className="text-[#fbf7ee]">admin</code></div>
          <div>كلمة السر: <code className="text-[#fbf7ee]">admin123456</code></div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#8c7964] hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>العودة لموقع المطعم الرئيسي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
