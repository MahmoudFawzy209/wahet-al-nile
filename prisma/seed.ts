import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nile Oasis Restaurant database...');

  // 1. Initial Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123456', salt);

  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      email: 'admin@nile-oasis.com',
      passwordHash,
      name: 'مدير مطعم واحة النيل'
    }
  });
  console.log('Admin user initialized:', admin.username);

  // 2. Restaurant Settings Singleton
  await prisma.restaurantSettings.upsert({
    where: { id: 'settings_singleton' },
    update: {},
    create: {
      id: 'settings_singleton',
      name: 'مطعم واحة النيل',
      tagline: 'أصالة المذاق اليمني ودفء الضيافة الأصيلة',
      description: 'نقدم لكم أشهى المأكولات والمطبوخات اليمنية العريقة المحضرة على الحطب والفرن التقليدي بأجود أنواع اللحوم الطازجة والبهارات الحضرمية الفاخرة.',
      phone: '01100880308',
      whatsappNumber: '201100880308',
      address: 'الكورنيش الغربي - داخل نادي النيل - أول نفق الشهيد اللواء نبيل فراج - سوهاج',
      openingHours: 'يومياً من الساعة 11:30 صباحاً حتى 02:00 بعد منتصف الليل',
      currency: 'ج.م',
      deliveryFee: 25.0,
      minOrderAmount: 100.0,
      estimatedPrepTime: '30 - 45 دقيقة',
      isOpen: true,
      closedMessage: 'نعتذر منكم، المطعم مغلق حالياً ونستقبل طلباتكم يومياً في أوقات العمل الرسمية من 11:30 ص إلى 02:00 ص.'
    }
  });

  // 3. Delivery Zones
  const zones = [
    { name: 'سوهاج المدينة (شرق وغرب والكورنيش)', fee: 20.0, estimatedTime: '20 - 35 دقيقة' },
    { name: 'مركز أخميم وحي الكوثر', fee: 30.0, estimatedTime: '30 - 45 دقيقة' },
    { name: 'مركز المراغة وساقلتة', fee: 40.0, estimatedTime: '40 - 55 دقيقة' },
    { name: 'مركز المنشأة وجرجا', fee: 50.0, estimatedTime: '45 - 60 دقيقة' },
    { name: 'مركز طهطا وجهينة وطما', fee: 55.0, estimatedTime: '50 - 70 دقيقة' },
    { name: 'مركز البلينا ودار السلام', fee: 65.0, estimatedTime: '60 - 80 دقيقة' }
  ];

  for (const zone of zones) {
    const existing = await prisma.deliveryZone.findFirst({ where: { name: zone.name } });
    if (!existing) {
      await prisma.deliveryZone.create({ data: zone });
    }
  }

  // 4. Common Add-Ons
  const addOnsData = [
    { name: 'سحاوق يمني بالجبن البلدي', price: 25.0 },
    { name: 'مرق لحم يمني متبل بالأعشاب', price: 20.0 },
    { name: 'أرز مندي بشاور زعفراني إضافي', price: 45.0 },
    { name: 'سلطة حارة عدنية طازجة', price: 15.0 },
    { name: 'طحينة بيضاء بلسمسم المحمص', price: 15.0 },
    { name: 'خبز ملوح يمني طازج (تنور)', price: 20.0 },
    { name: 'دقوس طماطم بالكزبرة والثوم', price: 15.0 }
  ];

  const createdAddOns: Record<string, string> = {};
  for (const item of addOnsData) {
    const existing = await prisma.addOn.findFirst({ where: { name: item.name } });
    if (existing) {
      createdAddOns[item.name] = existing.id;
    } else {
      const created = await prisma.addOn.create({ data: item });
      createdAddOns[item.name] = created.id;
    }
  }

  // 5. Categories and Menu Items
  const menuData = [
    {
      category: 'المندي والكبسات',
      slug: 'mandi-kabsa',
      description: 'أطباق المندي التقليدية المطهوة في براميل المندي على نار هادئة حتى تمام النضج والنكهة المدخنة.',
      displayOrder: 1,
      items: [
        {
          name: 'مندي لحم بلدي واحة النيل',
          slug: 'mandi-meat-nile-oasis',
          description: 'لحم تيس بلدي فاخر متبل بالبهارات الحضرمية مطهو ببطء على حطب السمر، يُقدم فوق أرز المندي طويل الحبة مع المكسرات والزبيب.',
          basePrice: 380.0,
          imageUrl: '/images/dishes/mandi-meat.jpg',
          isFeatured: true,
          servingSize: 'نفر مشبع لشخص',
          displayOrder: 1,
          variants: [
            { name: 'نفر لحم مندي (شخص)', price: 380.0 },
            { name: 'نفرين لحم مندي (شخصين)', price: 740.0 },
            { name: 'ربع تيس مندي (3-4 أشخاص)', price: 1850.0 },
            { name: 'نصف تيس مندي مع صينية ولائم (6-8 أشخاص)', price: 3600.0 }
          ],
          addOnNames: ['سحاوق يمني بالجبن البلدي', 'مرق لحم يمني متبل بالأعشاب', 'خبز ملوح يمني طازج (تنور)']
        },
        {
          name: 'مندي دجاج مدخن على الأصول',
          slug: 'mandi-chicken-smoked',
          description: 'دجاج طازج متبل بالزعفران وماء الورد والبهارات اليمنية، مطهو حتى يذوب اللحم بنكهة تدخين عميقة فوق أرز البسمتي الذهبي.',
          basePrice: 195.0,
          imageUrl: '/images/dishes/mandi-chicken.jpg',
          isFeatured: true,
          servingSize: 'حبة دجاج كاملة أو نصف حبة',
          displayOrder: 2,
          variants: [
            { name: 'نصف حبة دجاج مندي مع الأرز', price: 110.0 },
            { name: 'حبة دجاج مندي كاملة مع الأرز والمكسرات', price: 195.0 }
          ],
          addOnNames: ['سحاوق يمني بالجبن البلدي', 'طحينة بيضاء بلسمسم المحمص', 'دقوس طماطم بالكزبرة والثوم']
        },
        {
          name: 'زربيان عدني بلحم الضأن',
          slug: 'zurbian-meat-adnani',
          description: 'الزربيان العدني الأصيل بلحم الغنم والبطاطا المتبلة بالزبادي والزعفران والهيل، من أقدم وأعرق أطباق مدينة عدن.',
          basePrice: 390.0,
          imageUrl: '/images/dishes/zurbian-meat.jpg',
          isFeatured: false,
          servingSize: 'شخص واحد مع الإضافات',
          displayOrder: 3,
          variants: [
            { name: 'نفر زربيان لحم', price: 390.0 },
            { name: 'نفرين زربيان لحم عائلي', price: 760.0 }
          ],
          addOnNames: ['سحاوق يمني بالجبن البلدي', 'مرق لحم يمني متبل بالأعشاب']
        }
      ]
    },
    {
      category: 'الحنيذ والمظبي',
      slug: 'haneeth-madhbi',
      description: 'أطباق حنيذ تهامة وأطباق المظبي المشوية على أحجار الجرانيت المتقدة.',
      displayOrder: 2,
      items: [
        {
          name: 'حنيذ لحم تهامي في التنور',
          slug: 'haneeth-meat-tihami',
          description: 'لحم ضأن طازج مغلف بأوراق شجر المرخ العطري ومطهو داخل التنور لساعات حتى يصبح شديد الطراوة وذا نكهة لا تُنسى.',
          basePrice: 410.0,
          imageUrl: '/images/dishes/haneeth-meat.jpg',
          isFeatured: true,
          servingSize: 'نفر لحم طري جداً',
          displayOrder: 1,
          variants: [
            { name: 'نفر حنيذ لحم فاخر', price: 410.0 },
            { name: 'نفرين حنيذ لحم مع أرز بشاور', price: 790.0 },
            { name: 'كتف حنيذ كامل بالعسل والبهار', price: 1650.0 }
          ],
          addOnNames: ['مرق لحم يمني متبل بالأعشاب', 'سحاوق يمني بالجبن البلدي', 'خبز ملوح يمني طازج (تنور)']
        },
        {
          name: 'مظبي دجاج على حجر المرو',
          slug: 'madhbi-chicken-stone',
          description: 'دجاج متبل بملح البحر والبهارات البسيطة، مشوي على أحجار الصوان الملتهبة ليمنحه قرمشة خارجية وطراوة داخلية لا تضاهى.',
          basePrice: 200.0,
          imageUrl: '/images/dishes/madhbi-chicken.jpg',
          isFeatured: true,
          servingSize: 'حبة كاملة أو نصف حبة',
          displayOrder: 2,
          variants: [
            { name: 'نصف حبة مظبي دجاج على الحجر', price: 115.0 },
            { name: 'حبة مظبي دجاج كاملة مع الأرز', price: 200.0 }
          ],
          addOnNames: ['طحينة بيضاء بلسمسم المحمص', 'سلطة حارة عدنية طازجة']
        }
      ]
    },
    {
      category: 'الطاسة والسلتة والفحسة',
      slug: 'tasa-saltah-fahsa',
      description: 'أطباق المقالي الحجرية اليمنية (المدرة) التي تُقدم وهي تفور وتغلي على مائدتك.',
      displayOrder: 3,
      items: [
        {
          name: 'سلتة صنعانية باللحم المفروم والحلية',
          slug: 'saltah-sanaani',
          description: 'طبق اليمن الوطني الأول؛ خضار ومرق غني يعلوه خليط الحلبة المخفوقة (الحلبة اليمانية) يُقدم في مقلى حجري فوار مع خبز الملوح.',
          basePrice: 175.0,
          imageUrl: '/images/dishes/saltah.jpg',
          isFeatured: true,
          servingSize: 'طاسة فوارة مع رغيف ملوح كبير',
          displayOrder: 1,
          variants: [],
          addOnNames: ['خبز ملوح يمني طازج (تنور)', 'سحاوق يمني بالجبن البلدي']
        },
        {
          name: 'فحسة لحم بقري مدعوس بالمرق',
          slug: 'fahsa-meat-sanaani',
          description: 'قطع لحم طرية مهروسة ومطبوخة في مرق اللحم الكثيف والتوابل الحارة ومغطاة برغوة الحلبة الخضراء، تُقدم تغلي حتى آخر لقمة.',
          basePrice: 240.0,
          imageUrl: '/images/dishes/fahsa.jpg',
          isFeatured: true,
          servingSize: 'مقلى حجري كبير لشخصين',
          displayOrder: 2,
          variants: [
            { name: 'فحسة لحم عادي', price: 240.0 },
            { name: 'فحسة لحم مدبل (كمية لحم مضاعفة)', price: 340.0 }
          ],
          addOnNames: ['خبز ملوح يمني طازج (تنور)', 'سحاوق يمني بالجبن البلدي', 'مرق لحم يمني متبل بالأعشاب']
        },
        {
          name: 'طاسة جملية باللحم والخضار',
          slug: 'tasa-jamaliya-meat',
          description: 'لحم بلدي مقطع مكعبات صغيرة ومقلقل مع البصل والطماطم والفلفل الأخضر والبهار اليمني المسبك في طاسة ساخنة جداً.',
          basePrice: 290.0,
          imageUrl: '/images/dishes/tasa-meat.jpg',
          isFeatured: true,
          servingSize: 'طاسة لشخص إلى شخصين',
          displayOrder: 3,
          variants: [],
          addOnNames: ['خبز ملوح يمني طازج (تنور)', 'طحينة بيضاء بلسمسم المحمص']
        }
      ]
    },
    {
      category: 'المقبلات والشوربات',
      slug: 'appetizers-soups',
      description: 'المطعميات والمقبلات اليمنية الطازجة والشوربات المغذية.',
      displayOrder: 4,
      items: [
        {
          name: 'شوربة لحم يمنية أصيلة بالمواسير',
          slug: 'yemeni-meat-soup',
          description: 'شوربة لحم غنية بالنخاع والبهارات اليمانية والليمون الأسود والكزبرة الطازجة، بلسم للجسم ومفتحة للشهية.',
          basePrice: 65.0,
          imageUrl: '/images/dishes/soup-meat.jpg',
          isFeatured: false,
          servingSize: 'وعاء شوربة لشخص',
          displayOrder: 1,
          variants: [],
          addOnNames: []
        },
        {
          name: 'شفوت يمني باللحوح واللبن الرائب',
          slug: 'shafout-yemeni',
          description: 'خبز اللحوح اليمني الهش المشرب باللبن الرائب المنعنع بالثوم والكزبرة والفلفل الأخضر، مع الرمان والحبات السوداء.',
          basePrice: 85.0,
          imageUrl: '/images/dishes/shafout.jpg',
          isFeatured: false,
          servingSize: 'طبق مقبلات بارد',
          displayOrder: 2,
          variants: [],
          addOnNames: []
        },
        {
          name: 'خبز ملوح دبل بالزبدة وحبة البركة',
          slug: 'malawah-bread-giant',
          description: 'رغيف ملوح يماني مقرمش ومورق بالزبدة البقرية، يُخبز مباشرة في تنور الطين ويُقدم ساخناً مقرمشاً.',
          basePrice: 30.0,
          imageUrl: '/images/dishes/malawah.jpg',
          isFeatured: false,
          servingSize: 'رغيف كبير جداً',
          displayOrder: 3,
          variants: [],
          addOnNames: []
        }
      ]
    },
    {
      category: 'الحلويات والمشروبات',
      slug: 'desserts-drinks',
      description: 'أشهر الحلويات اليمنية بالعسل الدوعني والسمن والمشروبات الطبيعية.',
      displayOrder: 5,
      items: [
        {
          name: 'عريكة ملكية بالقشطة والعسل والمكسرات',
          slug: 'areeka-royal-yemeni',
          description: 'تمر معجون مع البر اليمني والسمن البلدي، مغطى بطبقة وفيرة من القشطة الطازجة والجبن الشيدر والعسل والكاجو واللوز.',
          basePrice: 140.0,
          imageUrl: '/images/dishes/areeka.jpg',
          isFeatured: true,
          servingSize: 'طبق تحلية غني يكفي شخصين',
          displayOrder: 1,
          variants: [
            { name: 'عريكة عادية بالعسل والسمن', price: 95.0 },
            { name: 'عريكة ملكية دبل قشطة ومكسرات', price: 140.0 }
          ],
          addOnNames: []
        },
        {
          name: 'معصوب ملكي بالموز والقشطة',
          slug: 'masoub-royal',
          description: 'فطير بر مخبوز ومفروم مع الموز الطازج والسمن البلدي، يُتوج بالقشطة والعسل وحبات اللوز المقرمش.',
          basePrice: 125.0,
          imageUrl: '/images/dishes/masoub.jpg',
          isFeatured: false,
          servingSize: 'طبق حلا دافئ لشخصين',
          displayOrder: 2,
          variants: [],
          addOnNames: []
        },
        {
          name: 'شاي عدني بالحليب والهيل والقرنفل',
          slug: 'aden-tea-milk',
          description: 'الشاي العدني الشهير المطهو على نار هادئة بالحليب المبخر وحبات الهيل الزكية والقرنفل والزعفران.',
          basePrice: 40.0,
          imageUrl: '/images/dishes/aden-tea.jpg',
          isFeatured: false,
          servingSize: 'كوب شاي ساخن',
          displayOrder: 3,
          variants: [],
          addOnNames: []
        }
      ]
    }
  ];

  for (const catData of menuData) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.category,
        description: catData.description,
        displayOrder: catData.displayOrder
      },
      create: {
        name: catData.category,
        slug: catData.slug,
        description: catData.description,
        displayOrder: catData.displayOrder
      }
    });

    for (const item of catData.items) {
      const menuItem = await prisma.menuItem.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          description: item.description,
          basePrice: item.basePrice,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          servingSize: item.servingSize,
          displayOrder: item.displayOrder,
          categoryId: category.id
        },
        create: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          basePrice: item.basePrice,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          servingSize: item.servingSize,
          displayOrder: item.displayOrder,
          categoryId: category.id
        }
      });

      // Variants
      if (item.variants && item.variants.length > 0) {
        await prisma.menuItemVariant.deleteMany({ where: { menuItemId: menuItem.id } });
        for (let i = 0; i < item.variants.length; i++) {
          const v = item.variants[i];
          await prisma.menuItemVariant.create({
            data: {
              menuItemId: menuItem.id,
              name: v.name,
              price: v.price,
              displayOrder: i
            }
          });
        }
      }

      // Add-ons linking
      if (item.addOnNames && item.addOnNames.length > 0) {
        for (const addOnName of item.addOnNames) {
          const addOnId = createdAddOns[addOnName];
          if (addOnId) {
            await prisma.menuItemAddOn.upsert({
              where: {
                menuItemId_addOnId: {
                  menuItemId: menuItem.id,
                  addOnId
                }
              },
              update: {},
              create: {
                menuItemId: menuItem.id,
                addOnId
              }
            });
          }
        }
      }
    }
  }

  // 6. Create a Sample Test Order to verify Admin Dashboard functionality
  const existingOrder = await prisma.order.findUnique({ where: { orderNumber: 'WN-1001' } });
  if (!existingOrder) {
    const sampleItem = await prisma.menuItem.findFirst({ where: { slug: 'mandi-meat-nile-oasis' } });
    if (sampleItem) {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'WN-1001',
          customerName: 'أحمد صالح المهدي',
          customerPhone: '01098765432',
          fulfillmentType: 'DELIVERY',
          deliveryAddress: 'عمارة 14 - شارع مصدق - الدور الرابع - شقة 8',
          deliveryZone: 'الدقي والعجوزة والمهندسين',
          customerNotes: 'يرجى تزويد الشطة والسحاوق، وطرق الباب بهدوء لوجود أطفال.',
          status: 'NEW',
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          subtotal: 425.0,
          deliveryFee: 30.0,
          totalAmount: 455.0,
          items: {
            create: [
              {
                menuItemId: sampleItem.id,
                itemName: sampleItem.name,
                variantName: 'نفر لحم مندي (شخص)',
                unitPrice: 380.0,
                quantity: 1,
                totalPrice: 380.0,
                itemNotes: 'اللحم يكون محمر زيادة لو تكرمتم',
                addOns: {
                  create: [
                    { addOnName: 'سحاوق يمني بالجبن البلدي', price: 25.0 },
                    { addOnName: 'مرق لحم يمني متبل بالأعشاب', price: 20.0 }
                  ]
                }
              }
            ]
          }
        }
      });
      console.log('Sample test order created:', order.orderNumber);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
