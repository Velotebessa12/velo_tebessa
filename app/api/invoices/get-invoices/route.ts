import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET (req : NextRequest){
    try {
        
      const invoices = await prisma.invoice.findMany({
  include: {
    items: {
      include: {
        product: true
      }
    },
    order: true
  }
});
     


        return NextResponse.json({ invoices })
    } catch (error) {
        return NextResponse.json({error : "Internal error"}, {status : 500})
    }
}