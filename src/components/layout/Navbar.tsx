'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, Clock, MapPin, Menu, X, Flame, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  settings?: {
    name?: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    isOpen?: boolean;
    openingHours?: string;
    currency?: string;
  };
}

export default function Navbar({ settings }: NavbarProps) {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = settings?.phone || '01100880308';
  const whatsapp = settings?.whatsappNumber || '201100880308';
  const address = settings?.address || 'الكورنيش الغربي - داخل نادي النيل - سوهاج';
  const isOpen = settings?.isOpen ?? true;
  const currency = settings?.currency || 'ج.م';

  return (
    <>
      {/* Top Banner with Restaurant Status and Hours */}
      <div className="bg-[#1c120a] border-b border-[#382414] text-xs text-[#d6c7b2] py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={isOpen ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                {isOpen ? 'المطعم يستقبل الطلبات الآن' : 'المطعم مغلق حالياً'}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[#9e8b75]">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              {settings?.openingHours || 'يومياً: 11:30 ص - 02:00 ص'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:flex items-center gap-1 text-[#9e8b75]">
              <MapPin className="w-3.5 h-3.5 text-[#d97706]" />
              {address}
            </span>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن منيو مطعم واحة النيل')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب المطعم</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#160e08]/95 backdrop-blur-md border-b border-[#382414] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9a3412] via-[#b45309] to-[#f59e0b] p-0.5 shadow-lg shadow-amber-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#1c120a] rounded-[14px] flex items-center justify-center text-amber-500">
                <Flame className="w-6 h-6 text-amber-500 stroke-[2.2]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-[#fbf7ee] tracking-tight group-hover:text-amber-400 transition-colors">
                {settings?.name || 'مطعم واحة النيل'}
              </span>
              <span className="text-xs text-[#d97706] font-medium tracking-wide">
                أصل المذاق اليمني والولائم الأصيلة
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[#d6c7b2]">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              الرئيسية
            </Link>
            <Link href="/menu" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>قائمة المنيو</span>
              <span className="bg-amber-900/60 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-700/50">
                طازج
              </span>
            </Link>
            <Link href="/#about" className="hover:text-amber-400 transition-colors">
              عن المطعم
            </Link>
            <Link href="/#branches" className="hover:text-amber-400 transition-colors">
              معلومات الفرع والتوصيل
            </Link>
            <Link href="/admin" className="text-xs text-[#8a755f] hover:text-amber-300 transition-colors">
              لوحة الإدارة
            </Link>
          </nav>

          {/* Actions: Phone & Cart */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${phone}`}
              className="hidden sm:flex items-center gap-2 bg-[#25170d] hover:bg-[#321f12] text-[#fbf7ee] px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#4a301b] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span dir="ltr">{phone}</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-95 transition-all"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">السلة</span>
              {subtotal > 0 && (
                <span className="hidden md:inline font-extrabold border-r border-[#140d07]/20 pr-2">
                  {subtotal.toFixed(0)} {currency}
                </span>
              )}
              {totalItems > 0 && (
                <span className="bg-[#140d07] text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#25170d] border border-[#382414] text-[#d6c7b2] hover:text-white"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1c120a] border-b border-[#382414] px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#fbf7ee] font-medium py-2 border-b border-[#2d1c10]"
            >
              الرئيسية
            </Link>
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-amber-400 font-semibold py-2 border-b border-[#2d1c10]"
            >
              قائمة الطعام (المنيو كامل)
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#fbf7ee] font-medium py-2 border-b border-[#2d1c10]"
            >
              عن مطعم واحة النيل
            </Link>
            <Link
              href="/#branches"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#fbf7ee] font-medium py-2 border-b border-[#2d1c10]"
            >
              التوصيل وساعات العمل
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#9e8b75] text-xs py-2"
            >
              لوحة تحكم الإدارة
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-2 bg-[#2a1a0f] text-[#fbf7ee] py-2.5 rounded-xl text-sm font-semibold border border-[#4a301b]"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                <span>اتصل بالمطعم: {phone}</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-950/80 text-emerald-400 py-2.5 rounded-xl text-sm font-semibold border border-emerald-800/40"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>طلب عبر واتساب</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
