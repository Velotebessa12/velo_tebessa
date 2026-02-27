import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "ID",
    "Type",
    "Parent",

    "Name (ar)",
    "Description (ar)",
    "Name (fr)",
    "Description (fr)",
    "Name (en)",
    "Description (en)",

    "Regular price",
    "Sale price",
    "Regular price text",
    "Promo price text",
    "Buying price",

    "Stock",
    "Low stock amount",
    "Stock status",

    "Categories",
    "Images",

    "Is active",
    "YouTube video",

    "Created at",
    "Updated at",
  ];

  const exampleRows = [
    // SIMPLE PRODUCT
    [
      "TMP-001",
      "simple",
      "",

      "قميص",
      "وصف المنتج",
      "T-shirt",
      "Description du produit",
      "T-shirt",
      "Product description",

      "2500",
      "1999",
      "",
      "Promo",
      "1200",

      "50",
      "5",
      "instock",

      "Clothing",
      "https://img1.jpg|https://img2.jpg",

      "1",
      "https://youtube.com/watch?v=xxxx",

      "",
      "",
    ].join(","),

    // VARIABLE PRODUCT (PARENT)
    [
      "TMP-002",
      "variable",
      "",

      "حذاء",
      "",
      "Chaussure",
      "",
      "Shoe",
      "",

      "",
      "",
      "",
      "",
      "",

      "",
      "",
      "",

      "Shoes",
      "https://shoe.jpg",

      "1",
      "",

      "",
      "",
    ].join(","),

    // VARIATION
    [
      "TMP-002-RED-42",
      "variation",
      "TMP-002",

      "",
      "",
      "",
      "",
      "",
      "",

      "3500",
      "2999",
      "",
      "42 / Red",
      "2000",

      "10",
      "2",
      "instock",

      "Shoes",
      "https://shoe-red.jpg",

      "1",
      "",

      "",
      "",
    ].join(","),
  ];

  const csv = [headers.join(","), ...exampleRows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-model.csv"`,
    },
  });
}