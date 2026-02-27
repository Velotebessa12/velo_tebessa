import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      password,
      phoneNumber,
      name,
      wilaya,
      adress,
    } = body;


    console.log(password , phoneNumber , name , wilaya , adress)

    // Basic validation
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists with this phone number
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this phone number" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        name,
        wilaya,
        adress,
      },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        role: true,
        wilaya : true,
      },
    });

    // Generate JWT token (AUTO LOGIN AFTER REGISTER)
    const token = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );

    // Set token cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
