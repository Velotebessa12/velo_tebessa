import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";



// model CouponUsage {
//   id        String   @id @default(uuid())

//   // relations
//   couponId  String
//   coupon    Coupon   @relation(fields: [couponId], references: [id])

//   userId    String
//   user      User     @relation(fields: [userId], references: [id])

//   orderId   String   @unique
//   order     Order    @relation(fields: [orderId], references: [id])

//   // SNAPSHOT (this is the key change)
//   code            String
//   discountType    CouponType
//   discountValue   Float
//   discountAmount  Float

//   appliedAt DateTime @default(now())
// }

// not working because of variantId and variantName

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      subtotal,
      discountTotal,
      total,
      deliveryMethod,
      deliveryNote,
      shippingCompany,
      shippingPrice,
      detailedAddress,
      station_code,
      wilaya,
      commune,
      phoneNumber,
      fullName,
      items,

      couponId,          // ✅ optional
      discountAmount,    // ✅ optional (final applied amount)
    } = body;

      console.log(body)
    if (!total || !wilaya || !phoneNumber || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

   

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      /* ───────── 1️⃣ CHECK STOCK ───────── */

      for (const item of items) {
        // Main product
        const product : any = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.productId}`
          );
        }

        // Additions (also products)
        for (const addon of item.addons || []) {
          const addition : any = await tx.product.findUnique({
            where: { id: addon.addOnId },
          });

          if (!addition || addition.stock < addon.quantity) {
            throw new Error(
              `Insufficient stock for addition ${addon.addOnId}`
            );
          }
        }
      }


        let coupon: any = null;

if (couponId) {
  coupon = await tx.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  if (!coupon.isActive) {
    throw new Error("Coupon is not active");
  }
}
      /* ───────── 2️⃣ CREATE ORDER ───────── */

      const newOrder = await tx.order.create({
        data: {
          customerId,
          subtotal,
          discountTotal,
          total,
          status: "PENDING",

          deliveryMethod,
          detailedAddress,
          deliveryNote,
          station_code,
          wilaya,
          shippingCompany,
          commune,
          shippingPrice,
          phoneNumber,
          fullName,

          items: {
            create: items.map((item: any) => {
              const addonsTotal = (item.addons || []).reduce(
                (sum: number, addon: any) =>
                  sum + addon.unitPrice * addon.quantity,
                0
              );

              const itemTotal =
                (item.unitPrice + addonsTotal) * item.quantity;

              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: itemTotal,

                variantId : item.variantId,
                variantName : item.variantName,

                addOns: {
                  create: (item.addons || []).map((addon: any) => ({
                    addOnId: addon.addOnId,
                    name: addon.name,
                    unitPrice: addon.unitPrice,
                    quantity: addon.quantity,
                    total: addon.unitPrice * addon.quantity,
                  })),
                },
              };
            }),
          },
        },
      });

      if (coupon) {
  await tx.couponUsage.create({
    data: {
      couponId: coupon.id,
      userId: customerId,
      orderId: newOrder.id,

      // SNAPSHOT (important!)
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discountAmount,
    },
  });
}

      /* ───────── 3️⃣ DECREASE STOCK ───────── */

  

     for (const item of items) {
  /* ───────── VARIANT LOGIC ───────── */
  if (item.variantId && item.variant) {
    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
    });

    if (!variant || variant.stock < item.variant.quantity) {
      throw new Error(
        `Insufficient stock for variant ${item.variantName}`
      );
    }

    // ✅ decrease VARIANT stock using ordered quantity
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { decrement: item.variant.quantity },
      },
    });
  } else {
    /* ───────── PRODUCT-ONLY LOGIC ───────── */
    if (!item.quantity) {
      throw new Error("Invalid product quantity");
    }

    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
      },
    });
  }

  /* ───────── ADDONS (ALWAYS DECREASE) ───────── */
  for (const addon of item.addons || []) {
    await tx.product.update({
      where: { id: addon.addOnId },
      data: {
        stock: { decrement: addon.quantity },
      },
    });
  }
}

    


      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Create order error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}