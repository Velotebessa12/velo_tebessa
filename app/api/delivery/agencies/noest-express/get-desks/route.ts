import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wilayaName = searchParams.get("wilaya_mame");

    if (!wilayaName) {
      return NextResponse.json(
        { error: "wilayaName is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      "https://app.noest-dz.com/api/public/desks",
      {
        headers: {
          Authorization: `Bearer ${process.env.NOEST_APIKEY}`,
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

    // ✅ desks is an OBJECT → convert to array
    const desksArray = Object.values(data);

    // ✅ normalize wilaya name
    const normalizedWilaya = wilayaName.trim().toLowerCase();

    // ✅ filter by wilaya name (startsWith)
    const filteredDesks = desksArray.filter((desk: any) =>
      typeof desk.name === "string" &&
      desk.name.toLowerCase().startsWith(normalizedWilaya)
    );

    return NextResponse.json({
      success: true,
      wilayaName,
      count: filteredDesks.length,
      desks: filteredDesks,
    });

  } catch (error) {
    console.error("NOEST GET DESKS ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
