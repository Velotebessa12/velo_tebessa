import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "ID",
    "Type",
    "Parent ID",
    "Name (ar)",
    "Description (ar)",
    "Name (fr)",
    "Description (fr)",
    "Name (en)",
    "Description (en)",
    "Buying price",
    "Regular price",
    "Promo price",
    "Regular price text",
    "Promo price text",
    "Stock",
    "Minimum stock",
    "Images",
    "Category ID",
    "Is active",
    "YouTube URLs",
    "Similar Product IDs",
    "Created at",
  ];

  const csv = [headers.join(",")].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-model.csv"`,
    },
  });
}