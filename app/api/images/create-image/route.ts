import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
  throw new Error("Invalid file");
}

const url = await uploadToCloudinary(file);

    const image  = await prisma.image.create({
        data : {
            url : url
        }
    })

    return NextResponse.json({ image , url});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
