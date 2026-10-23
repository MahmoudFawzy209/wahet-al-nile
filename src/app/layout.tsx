import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مطعم واحة النيل | المأكولات اليمنية الأصيلة - ولائم المندي والحنيذ',
  description:
    'مطعم واحة النيل للمأكولات والمطبوخات اليمنية العريقة. أشهى أطباق المندي، الحنيذ، الزربيان، الفحسة، والسلتة الصنعانية المطهوة على الحطب والتنور. اطلب الآن مع التوصيل السريع والدفع نقدًا عند الاستلام.',
  keywords: [
    'مطعم يمني',
    'واحة النيل',
    'مندي لحم',
    'حنيذ',
    'مظبي',
    'سلتة صنعانية',
    'فحسة',
    'زربيان',
    'أكل يمني الجيزة',
    'توصيل مطعم يمني',
  ],
  openGraph: {
    title: 'مطعم واحة النيل | أصالة المذاق اليمني',
    description: 'ولائم المندي والحنيذ اليمني الأصيل على أصوله. اطلب وجبتك الآن واستمتع بالنكهة الحضرمية والتهامية.',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-[#140d07] text-[#fbf7ee] font-sans antialiased selection:bg-[#d97706] selection:text-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
