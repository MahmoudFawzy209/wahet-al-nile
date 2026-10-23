const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRestaurantInfo() {
  console.log('Updating restaurant settings and delivery zones...');

  const newAddress = 'الكورنيش الغربي - داخل نادي النيل - أول نفق الشهيد اللواء نبيل فراج - سوهاج';
  const newPhone = '01100880308';
  const newWhatsapp = '201100880308';

  // 1. Update RestaurantSettings
  await prisma.restaurantSettings.upsert({
    where: { id: 'settings_singleton' },
    update: {
      address: newAddress,
      phone: newPhone,
      whatsappNumber: newWhatsapp,
    },
    create: {
      id: 'settings_singleton',
      name: 'مطعم واحة النيل',
      address: newAddress,
      phone: newPhone,
      whatsappNumber: newWhatsapp,
    }
  });
  console.log('✓ RestaurantSettings updated');

  // 2. Replace Delivery Zones with Sohag City and all Sohag Centers
  await prisma.deliveryZone.deleteMany({});

  const sohagZones = [
    { name: 'سوهاج المدينة (شرق وغرب والكورنيش)', fee: 20.0, estimatedTime: '20 - 35 دقيقة' },
    { name: 'مركز أخميم وحي الكوثر', fee: 30.0, estimatedTime: '30 - 45 دقيقة' },
    { name: 'مركز المراغة وساقلتة', fee: 40.0, estimatedTime: '40 - 55 دقيقة' },
    { name: 'مركز المنشأة وجرجا', fee: 50.0, estimatedTime: '45 - 60 دقيقة' },
    { name: 'مركز طهطا وجهينة وطما', fee: 55.0, estimatedTime: '50 - 70 دقيقة' },
    { name: 'مركز البلينا ودار السلام', fee: 65.0, estimatedTime: '60 - 80 دقيقة' }
  ];

  for (const zone of sohagZones) {
    await prisma.deliveryZone.create({
      data: {
        name: zone.name,
        fee: zone.fee,
        estimatedTime: zone.estimatedTime,
        isActive: true,
      }
    });
  }
  console.log('✓ Sohag delivery zones added successfully');

  await prisma.$disconnect();
  console.log('All updates finished successfully!');
}

updateRestaurantInfo().catch(console.error);
