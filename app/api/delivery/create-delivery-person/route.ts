import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    
    const { name , phoneNumber , email , password , permissions} = await req.json()
  

    const deliveryPerson = await prisma.user.create({
        data : {
            name,
            phoneNumber,
            email,
            password,
            role : "DELIVERY",
            permissions
        }
        });

    return NextResponse.json({ deliveryPerson });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
