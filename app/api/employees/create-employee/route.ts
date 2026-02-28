import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
  try {
    
    const { name , phoneNumber , email , password , role , permissions} = await req.json()
  

  
    const employee = await prisma.user.create({
        data : {
            name,
            phoneNumber,
            email,
            password : password,
            role,
            permissions 
        }
        });

    return NextResponse.json({ employee });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
