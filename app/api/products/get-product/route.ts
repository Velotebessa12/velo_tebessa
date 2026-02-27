import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId");
   
if(!productId){
     return NextResponse.json({ error: "ProductId is required !" }, { status: 400 });
}
  

    const product = await prisma.product.findUnique({
      where : {id : productId},
      include : {
        category : true,
        translations : true,
        addonsAsMain : {
          include : {
            addonProduct : {
              include : {
                translations : true
              }
            },
          }
        },
        variants : true
      }
    });

    return NextResponse.json({ product });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
