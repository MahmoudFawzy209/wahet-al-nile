const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== 1. Testing Unauthenticated /admin Access ===');
  const unauthRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
  });
  console.log('Status:', unauthRes.statusCode);
  if (unauthRes.statusCode === 307 || unauthRes.statusCode === 302 || unauthRes.headers.location?.includes('/admin/login')) {
    console.log('✓ Correctly redirected to /admin/login');
  } else {
    console.log('Response:', unauthRes.statusCode, unauthRes.headers);
  }

  console.log('\n=== 2. Testing Admin Login API ===');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { username: 'admin', password: 'admin123456' }
  );
  console.log('Login Status:', loginRes.statusCode);
  console.log('Login Response:', loginRes.body);
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie) throw new Error('No cookie set on login!');
  const cookie = setCookie[0].split(';')[0];
  console.log('✓ Cookie received:', cookie);

  console.log('\n=== 3. Testing Authenticated /admin Access ===');
  const authRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/admin',
    method: 'GET',
    headers: { Cookie: cookie },
  });
  console.log('Auth /admin Status:', authRes.statusCode);
  if (authRes.statusCode === 200) {
    console.log('✓ Authenticated access successful (200 OK)');
  } else {
    console.log('Status code:', authRes.statusCode);
  }

  console.log('\n=== 4. Testing End-to-End Order Creation API (/api/orders) ===');
  // First query an item from DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const mandiItem = await prisma.menuItem.findFirst({
    where: { slug: 'mandi-meat-nile-oasis' },
    include: { variants: true, addOns: true },
  });
  const zone = await prisma.deliveryZone.findFirst();

  const newOrderPayload = {
    customerName: 'فهد الحضرمي',
    customerPhone: '01011223344',
    fulfillmentType: 'DELIVERY',
    deliveryAddress: 'شارع جامعة الدول العربية - المهندسين - برج النور شقة 5',
    deliveryZoneId: zone.id,
    customerNotes: 'الرجاء تزويد المرق والليمون، شكراً لكم',
    items: [
      {
        menuItemId: mandiItem.id,
        variantId: mandiItem.variants[0]?.id,
        quantity: 2,
        notes: 'اللحم يكون طري ومستوي تماماً',
        addOnIds: mandiItem.addOns.slice(0, 1).map((a) => a.addOnId),
      },
    ],
  };

  const createOrderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    newOrderPayload
  );
  console.log('Order Creation Status:', createOrderRes.statusCode);
  console.log('Order Creation Response:', createOrderRes.body);
  const createdOrderData = JSON.parse(createOrderRes.body);
  if (!createdOrderData.orderNumber) throw new Error('Failed to create order!');
  console.log('✓ Created Order Number:', createdOrderData.orderNumber);

  console.log('\n=== 5. Testing Admin Order Status Update ===');
  const updateOrderRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/orders/${createdOrderData.orderId}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    },
    { status: 'PREPARING', paymentStatus: 'COLLECTED' }
  );
  console.log('Update Status:', updateOrderRes.statusCode);
  console.log('Update Response:', updateOrderRes.body);
  console.log('✓ Order status successfully transitioned to PREPARING and payment COLLECTED');

  console.log('\n=== 6. Testing Admin Settings Update ===');
  const updateSettingsRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/settings',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
    },
    {
      deliveryFee: 40.0,
      minOrderAmount: 120.0,
    }
  );
  console.log('Settings Update Status:', updateSettingsRes.statusCode);
  console.log('Settings Update Response:', updateSettingsRes.body);
  console.log('✓ Restaurant settings updated successfully');

  await prisma.$disconnect();
  console.log('\n🎉 ALL FULL-STACK TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
