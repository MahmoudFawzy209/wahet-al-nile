import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Validation Schema
const CreateOrderSchema = z.object({
  customerName: z.string().min(2, 'الاسم يجب ألا يقل عن حرفين'),
  customerPhone: z.string().min(8, 'يرجى إدخال رقم هاتف صحيح'),
  fulfillmentType: z.enum(['DELIVERY', 'PICKUP']),
  deliveryAddress: z.string().optional(),
  deliveryZoneId: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
        addOnIds: z.array(z.string()).default([]),
      })
    )
    .min(1, 'يجب أن تحتوي السلة على صنف واحد على الأقل'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'بيانات الطلب غير صالحة',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      fulfillmentType,
      deliveryAddress,
      deliveryZoneId,
      customerNotes,
      items: rawItems,
    } = parsed.data;

    // Check delivery address if delivery
    if (fulfillmentType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return NextResponse.json(
        { error: 'يرجى إدخال عنوان تفصيلي للتوصيل' },
        { status: 400 }
      );
    }

    // 1. Fetch settings for minimum order and general fee
    const settings = await prisma.restaurantSettings.findUnique({
      where: { id: 'settings_singleton' },
    });

    if (settings && !settings.isOpen) {
      return NextResponse.json(
        { error: settings.closedMessage || 'المطعم مغلق حالياً عن استقبال الطلبات' },
        { status: 400 }
      );
    }

    // 2. Fetch items from DB to verify prices and availability (Server-side price verification)
    const menuItemIds = rawItems.map((i) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: {
        variants: true,
        addOns: { include: { addOn: true } },
      },
    });

    const itemMap = new Map(dbMenuItems.map((i) => [i.id, i]));

    let calculatedSubtotal = 0;
    interface ValidatedOrderItem {
      menuItemId: string;
      itemName: string;
      variantName?: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      itemNotes: string | null;
      addOns: { addOnName: string; price: number }[];
    }
    const validatedOrderItems: ValidatedOrderItem[] = [];

    for (const rawItem of rawItems) {
      const dbItem = itemMap.get(rawItem.menuItemId);
      if (!dbItem) {
        return NextResponse.json(
          { error: `الطبق المطلوب غير موجود في قائمة الطعام` },
          { status: 400 }
        );
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json(
          { error: `نعتذر، الطبق "${dbItem.name}" غير متوفر حالياً` },
          { status: 400 }
        );
      }

      // Check variant price
      let unitPrice = dbItem.basePrice;
      let variantName: string | undefined = undefined;

      if (rawItem.variantId) {
        const variant = dbItem.variants.find((v) => v.id === rawItem.variantId);
        if (variant) {
          unitPrice = variant.price;
          variantName = variant.name;
        }
      }

      // Check addons
      const validatedAddOns: { addOnName: string; price: number }[] = [];
      let itemAddOnsTotal = 0;

      if (rawItem.addOnIds && rawItem.addOnIds.length > 0) {
        for (const addOnId of rawItem.addOnIds) {
          const match = dbItem.addOns.find((a) => a.addOnId === addOnId);
          if (match && match.addOn.isAvailable) {
            validatedAddOns.push({
              addOnName: match.addOn.name,
              price: match.addOn.price,
            });
            itemAddOnsTotal += match.addOn.price;
          }
        }
      }

      const lineTotal = (unitPrice + itemAddOnsTotal) * rawItem.quantity;
      calculatedSubtotal += lineTotal;

      validatedOrderItems.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        variantName,
        unitPrice,
        quantity: rawItem.quantity,
        totalPrice: lineTotal,
        itemNotes: rawItem.notes || null,
        addOns: validatedAddOns,
      });
    }

    // Minimum order check
    const minOrder = settings?.minOrderAmount || 100;
    if (calculatedSubtotal < minOrder) {
      return NextResponse.json(
        { error: `الحد الأدنى لقيمة الطلب هو ${minOrder} ج.م` },
        { status: 400 }
      );
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    let zoneName: string | null = null;

    if (fulfillmentType === 'DELIVERY') {
      if (deliveryZoneId) {
        const zone = await prisma.deliveryZone.findUnique({
          where: { id: deliveryZoneId },
        });
        if (zone) {
          deliveryFee = zone.fee;
          zoneName = zone.name;
        } else {
          deliveryFee = settings?.deliveryFee || 35;
        }
      } else {
        deliveryFee = settings?.deliveryFee || 35;
      }
    }

    const totalAmount = calculatedSubtotal + deliveryFee;

    // Generate unique order number (e.g. WN-72941)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `WN-${randomSuffix}`;

    // Create Order with Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          fulfillmentType,
          deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress : null,
          deliveryZone: zoneName,
          customerNotes: customerNotes || null,
          status: 'NEW',
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          subtotal: calculatedSubtotal,
          deliveryFee,
          totalAmount,
          items: {
            create: validatedOrderItems.map((item) => ({
              menuItemId: item.menuItemId,
              itemName: item.itemName,
              variantName: item.variantName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              itemNotes: item.itemNotes,
              addOns: {
                create: item.addOns.map((a: { addOnName: string; price: number }) => ({
                  addOnName: a.addOnName,
                  price: a.price,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: { addOns: true },
          },
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      totalAmount: newOrder.totalAmount,
      fulfillmentType: newOrder.fulfillmentType,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
