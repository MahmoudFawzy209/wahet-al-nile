import React from 'react';
import Link from 'next/link';
import { Flame, Phone, MessageCircle, MapPin, Clock, ShieldCheck, Truck, Banknote } from 'lucide-react';

interface FooterProps {
  settings?: {
    name?: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    openingHours?: string;
  };
}

export default function Footer({ settings }: FooterProps) {
  const phone = settings?.phone || '01100880308';
  const whatsapp = settings?.whatsappNumber || '201100880308';
  const address = settings?.address || 'الكورنيش الغربي - داخل نادي النيل - أول نفق الشهيد اللواء نبيل فراج - سوهاج';
  const openingHours = settings?.openingHours || 'يومياً: 11:30 صباحاً حتى 02:00 بعد منتصف الليل';

  return (
    <footer className="bg-[#0f0905] border-t border-[#2d1c10] text-[#a89580] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-[#24150b]">
          <div className="flex items-center gap-4 bg-[#1a1008] p-4 rounded-2xl border border-[#382414]">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#fbf7ee] text-sm">طهي يمني تقليدي</h4>
              <p className="text-xs text-[#8c7964]">على الحطب والفرن الحجري وبراميل المندي</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#1a1008] p-4 rounded-2xl border border-[#382414]">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#fbf7ee] text-sm">توصيل حار وسريع</h4>
              <p className="text-xs text-[#8c7964]">تصلك الوجبة ساخنة ومحكمة الغلق كأنك بالمطعم</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#1a1008] p-4 rounded-2xl border border-[#382414]">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-500 shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#fbf7ee] text-sm">الدفع نقدًا عند الاستلام</h4>
              <p className="text-xs text-[#8c7964]">ادفع بأمان عند استلام طلبك ومراجعته</p>
            </div>
          </div>
        </div>

        {/* Links & Contact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a3412] to-[#f59e0b] flex items-center justify-center text-[#140d07] font-black">
                <Flame className="w-5 h-5 text-[#140d07] stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-[#fbf7ee]">
                {settings?.name || 'مطعم واحة النيل'}
              </span>
            </div>
            <p className="text-xs text-[#8f7b66] leading-relaxed">
              وجهتكم الأولى للمأكولات والمطبوخات اليمنية الأصيلة. نعتز بتقديم ولائم المندي، الحنيذ، الزربيان، واللحوم البلدية الطازجة بأصالة لا تُضاهى.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أريد طلب وجبة من مطعم واحة النيل')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/50 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة واتساب مباشرة</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#fbf7ee] mb-4 border-r-2 border-amber-500 pr-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-amber-400 transition-colors">
                  قائمة المنيو والأسعار
                </Link>
              </li>
              <li>
                <Link href="/menu?category=mandi-kabsa" className="hover:text-amber-400 transition-colors">
                  أطباق المندي والكبسات
                </Link>
              </li>
              <li>
                <Link href="/menu?category=haneeth-madhbi" className="hover:text-amber-400 transition-colors">
                  الحنيذ والمظبي التهامي
                </Link>
              </li>
              <li>
                <Link href="/menu?category=tasa-saltah-fahsa" className="hover:text-amber-400 transition-colors">
                  السلتة والفحسة الصنعانية
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors text-[#705e4c]">
                  دخول إدارة المطعم
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-[#fbf7ee] mb-4 border-r-2 border-amber-500 pr-2">
              التواصل والفرع
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-amber-400" dir="ltr">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span dir="ltr">+{whatsapp}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Delivery Note */}
          <div>
            <h4 className="text-sm font-bold text-[#fbf7ee] mb-4 border-r-2 border-amber-500 pr-2">
              خدمة التوصيل
            </h4>
            <p className="text-xs text-[#8f7b66] leading-relaxed mb-3">
              نوصل لكافة أحياء سوهاج المدينة (شرق وغرب النيل والكورنيش) وكافة مراكز محافظة سوهاج: أخميم، الكوثر، المراغة، ساقلتة، المنشأة، جرجا، طهطا، جهينة، طما، والبلينا.
            </p>
            <div className="bg-[#170e07] border border-[#2d1c10] p-3 rounded-xl text-[11px] text-[#bda790]">
              <span className="font-bold text-amber-400 block mb-1">طريقة الدفع:</span>
              نقدًا عند الاستلام (Cash on Delivery) بعد استلام وفحص وجبتك.
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#1f1309] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705e4c]">
          <p>© {new Date().getFullYear()} مطعم واحة النيل للمأكولات اليمنية. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            <span>صُنع بشغف لإحياء التراث والمطبخ اليمني الأصيل 🇾🇪 🇪🇬</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
