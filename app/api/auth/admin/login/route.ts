import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();


    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

//     const isValid = await bcrypt.compare(password, user.password);
// console.log(isValid)
//     if (!isValid) {
//       return NextResponse.json(
//         { error: "Invalid credentials" },
//         { status: 401 },
//       );
//     }

    return NextResponse.json({
      message: "Login successful",
      user: user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
