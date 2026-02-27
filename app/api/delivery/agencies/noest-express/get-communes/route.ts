import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get wilaya_id from query params
    const { searchParams } = new URL(req.url);
    const wilaya_id = searchParams.get("wilaya_id");

    if (!wilaya_id) {
      return NextResponse.json(
        { error: "wilaya_id is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://app.noest-dz.com/api/public/get/communes/${wilaya_id}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NOEST_APIKEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      communes: data,
    });

  } catch (error) {
    console.error("NOEST GET COMMUNES ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
