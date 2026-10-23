import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import {
  Flame,
  ShoppingBag,
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

export default async function HomePage() {
  // 1. Fetch settings
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: 'settings_singleton' },
  });

  // 2. Fetch featured items
  const featuredItems = await prisma.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    take: 6,
    include: {
      category: true,
      variants: { where: { isAvailable: true } },
    },
  });

  // 3. Fetch categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  // 4. Fetch delivery zones
  const deliveryZones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
  });

  const currency = settings?.currency || 'ج.م';
  const whatsapp = settings?.whatsappNumber || '201100880308';
  const phone = settings?.phone || '01100880308';

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

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-[#2d1c10]">
          {/* Subtle warm glow background */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text side */}
              <div className="lg:col-span-7 space-y-6 text-right">
                <div className="inline-flex items-center gap-2 bg-[#25170d] border border-amber-800/50 px-4 py-2 rounded-full text-xs font-bold text-amber-400">
                  <Flame className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                  <span>طهي تراثي على الحطب والفرن التقليدي وبراميل المندي</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#fbf7ee] tracking-tight leading-[1.2]">
                  أصالة المذاق اليمني <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-400 via-amber-300 to-[#f59e0b]">
                    ودفء الضيافة الحقيقية
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-[#bda790] max-w-2xl leading-relaxed">
                  نرحب بكم في <strong>مطعم واحة النيل</strong>، وجهتكم الأولى لأعرق المأكولات والمطبوخات اليمنية. نقدم لكم ولائم المندي البلدي، الحنيذ التهامي المغلف بأوراق المرخ، الزربيان العدني، والسلتة الصنعانية الفوارة.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href="/menu"
                    className="flex items-center gap-2.5 bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] hover:from-[#d97706] hover:to-[#f59e0b] text-[#140d07] px-7 py-4 rounded-2xl font-black text-base shadow-xl shadow-amber-950/50 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                    <span>استعرض المنيو واطلب الآن</span>
                  </Link>

                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أرغب بطلب وجبة من مطعم واحة النيل')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-[#1f130a] hover:bg-[#2c1a0f] text-emerald-400 border border-emerald-800/60 px-6 py-4 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>الطلب السريع عبر واتساب</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#29190e] text-xs">
                  <div>
                    <span className="block font-black text-lg text-amber-400">100%</span>
                    <span className="text-[#8c7964]">لحوم بلدية طازجة</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-amber-400">30-45 د</span>
                    <span className="text-[#8c7964]">مدة التجهيز والتوصيل</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-amber-400">نقدًا</span>
                    <span className="text-[#8c7964]">الدفع عند الاستلام</span>
                  </div>
                </div>
              </div>

              {/* Visual Side */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#b45309] to-[#d97706] opacity-30 blur-xl" />
                  <div className="relative rounded-3xl overflow-hidden border-2 border-[#4a301b] shadow-2xl bg-[#1c120a]">
                    <img
                      src="/images/hero-yemeni-feast.jpg"
                      alt="ولائم المندي والحنيذ اليمني - مطعم واحة النيل"
                      className="w-full h-80 sm:h-96 object-cover"
                    />
                    <div className="p-5 bg-gradient-to-t from-[#160e08] via-[#1c120a] to-transparent">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-amber-500 block">الطبق الأكثر طلباً</span>
                          <h3 className="font-black text-base text-[#fbf7ee]">مندي لحم بلدي واحة النيل</h3>
                        </div>
                        <span className="font-extrabold text-amber-400 text-lg">
                          380 {currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Highlight Card */}
                  <div className="absolute -bottom-6 -right-6 bg-[#24170d]/95 backdrop-blur-md border border-amber-700/50 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-[#140d07]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#a89580] block">خبز التنور اليمني</span>
                      <span className="text-xs font-black text-[#fbf7ee]">ملوح ساخن يخبز فورياً</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED DISHES SECTION */}
        <section className="py-20 border-b border-[#2d1c10] bg-[#170f08]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-2">
                  <Flame className="w-4 h-4" />
                  <span>أطباق نالت إعجاب الآلاف</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#fbf7ee]">
                  أطباق واحة النيل المميزة
                </h2>
                <p className="text-sm text-[#a89580] mt-1">
                  مختارات من أشهى أطباق المندي والحنيذ والسلتة المحضرة يومياً
                </p>
              </div>

              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>مشاهدة المنيو كاملاً</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((dish) => {
                const hasVariants = dish.variants && dish.variants.length > 0;
                const minPrice = hasVariants
                  ? Math.min(...dish.variants.map((v) => v.price))
                  : dish.basePrice;

                return (
                  <div
                    key={dish.id}
                    className="bg-[#1c120a] hover:bg-[#23170e] border border-[#382414] hover:border-amber-700/60 rounded-3xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-[#120a05]">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c120a] via-transparent to-transparent" />
                      {dish.servingSize && (
                        <span className="absolute bottom-3 right-3 bg-[#140d07]/90 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-900/60">
                          {dish.servingSize}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-amber-500/80 font-bold block mb-1">
                          {dish.category?.name}
                        </span>
                        <h3 className="font-extrabold text-lg text-[#fbf7ee] group-hover:text-amber-400 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-[#a89580] mt-1.5 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#2d1c10] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#8c7964] block">
                            {hasVariants ? 'يبدأ من' : 'السعر'}
                          </span>
                          <span className="text-lg font-black text-amber-400">
                            {minPrice} {currency}
                          </span>
                        </div>

                        <Link
                          href={`/menu?category=${dish.category?.slug}`}
                          className="bg-[#b45309] hover:bg-[#d97706] text-[#140d07] px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
                        >
                          طلب الطبق
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-20 border-b border-[#2d1c10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-2">
                تصفح حسب رغبتك
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#fbf7ee]">
                أقسام وتصنيفات المنيو
              </h2>
              <p className="text-sm text-[#a89580] mt-2">
                اختر القسم الذي تفضله للاطلاع على كافة خيارات الأطباق والولائم العائلية
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.slug}`}
                  className="group bg-[#1c120a] hover:bg-[#26180e] border border-[#382414] hover:border-amber-600/70 p-6 rounded-3xl transition-all shadow-md flex items-start gap-4 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-950 to-[#b45309] flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-[#fbf7ee] group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-amber-500/80 font-bold bg-[#140d07] px-2 py-0.5 rounded-full border border-[#382414]">
                        {cat._count.items} أصناف
                      </span>
                    </div>
                    <p className="text-xs text-[#a89580] mt-2 line-clamp-2 leading-relaxed">
                      {cat.description || 'أشهى المأكولات اليمنية الطازجة على الأصول.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT & AUTHENTICITY SECTION */}
        <section id="about" className="py-20 border-b border-[#2d1c10] bg-[#160e08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-2">
                  قصة واحة النيل
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#fbf7ee] leading-tight">
                  أكثر من مجرد مطعم.. <br />
                  <span className="text-amber-400">رحلة في قلب التراث الحضرمي والصنعاني</span>
                </h2>

                <p className="text-sm text-[#a89580] mt-4 leading-relaxed">
                  تأسس <strong>مطعم واحة النيل</strong> ليكون الجسر الذي يربط محبي الأكل العربي واليمني الأصيل بعبق الماضي. لا نستخدم سوى بهارات طبيعية مطحونة على الطريقة اليدوية، وأرز بسمتي هندي عنبر ممتاز طويل الحبة، مع لحوم بلدية مختارة بعناية.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-[#1f130a] border border-[#382414] p-4 rounded-2xl">
                    <h4 className="font-bold text-amber-400 text-sm mb-1">براميل المندي التقليدية</h4>
                    <p className="text-xs text-[#8c7964]">
                      طهي تحت الأرض على الفحم الطبيعي وحطب السمر لضمان النكهة الدخانية الأصلية.
                    </p>
                  </div>
                  <div className="bg-[#1f130a] border border-[#382414] p-4 rounded-2xl">
                    <h4 className="font-bold text-amber-400 text-sm mb-1">المقالي الحجرية (المدرة)</h4>
                    <p className="text-xs text-[#8c7964]">
                      السلتة والفحسة في أواني صخرية أصلية تحفظ الغليان حتى لقمة الخبز الأخيرة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery & Hours Info Box */}
              <div id="branches" className="bg-[#1f130a] border-2 border-amber-800/40 p-8 rounded-3xl space-y-6">
                <h3 className="font-black text-xl text-[#fbf7ee] border-b border-[#382414] pb-4">
                  معلومات الفرع وخدمة التوصيل
                </h3>

                <ul className="space-y-4 text-xs sm:text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#fbf7ee]">عنوان المطعم:</strong>
                      <span className="text-[#a89580]">
                        {settings?.address || 'الكورنيش الغربي - داخل نادي النيل - أول نفق الشهيد اللواء نبيل فراج - سوهاج'}
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#fbf7ee]">ساعات العمل واستقبال الطلبات:</strong>
                      <span className="text-[#a89580]">
                        {settings?.openingHours || 'يومياً من 11:30 صباحاً حتى 02:00 بعد منتصف الليل'}
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#fbf7ee]">رقم الهاتف والطلبات:</strong>
                      <span className="text-[#a89580]" dir="ltr">
                        {phone}
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#fbf7ee]">مناطق التوصيل الرئيسية:</strong>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {deliveryZones.map((z) => (
                          <span
                            key={z.id}
                            className="bg-[#140d07] text-[#d6c7b2] text-[11px] px-2.5 py-1 rounded-lg border border-[#382414]"
                          >
                            {z.name} ({z.fee} {currency})
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                </ul>

                <div className="pt-4 border-t border-[#382414]">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('السلام عليكم، أريد طلب وجبة من مطعم واحة النيل')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>مراسلة واتساب المطعم مباشرة</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}
