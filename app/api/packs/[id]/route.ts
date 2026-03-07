import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

/* =========================
   GET /api/packs/:id
   ========================= */
export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const pack = await prisma.pack.findUnique({
      where: { id },
    });

    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({pack});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH /api/packs/:id
   ========================= */
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    const pack = await prisma.pack.findUnique({
      where: { id },
    });

    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    const updatedPack = await prisma.pack.update({
      where: { id },
      data: data,
    //   include: {
    //     orders: true, // adjust if your relation name is different
    //   },
    });

    return NextResponse.json(updatedPack);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE /api/packs/:id
   ========================= */
// export async function DELETE(req: Request, context: Context) {
//   try {
//     const { id } = await context.params;

//     // Optional safety check: prevent deletion if pack has orders
//     const orderCount = await prisma.order.count({
//       where: { packId: id },
//     });

//     if (orderCount > 0) {
//       return NextResponse.json(
//         {
//           error:
//             "This pack cannot be deleted because it has associated orders.",
//         },
//         { status: 409 }
//       );
//     }

//     await prisma.pack.delete({
//       where: { id },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Pack deleted successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }