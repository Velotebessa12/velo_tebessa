// /api/delivery/agencies/noest-express/create-order
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderId,
      reference,
      client,
      phone,
      phone_2,
      adresse = "Client will pick up at agency",
      wilaya_id,
      commune,
      montant,
      produit,
      type_id,
      poids,
      stop_desk,
      remarque,
      can_open,
      station_code
    } = body;


    console.log(body)
    const res = await fetch(
      "https://app.noest-dz.com/api/public/create/order",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOEST_APIKEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_guid: process.env.NOEST_USER_GUID,

          reference,
          client,
          phone,
          phone_2,
          adresse,
          wilaya_id,
          commune,
          montant,
          produit,
          type_id,
          poids,
          stop_desk,
          remarque,
          can_open,
          station_code
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: res.status }
      );
    }

    console.log(data)

// not completed yet
     await prisma.order.update({
      where : {
        id : orderId
      },
    data : {
      status : "SHIPPED",
      trackingId : data.tracking
    }});



    return NextResponse.json({
      success: true,
      noestResponse: data,
    });

  } catch (error) {
    console.error("NOEST API ERROR:", error);

    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
