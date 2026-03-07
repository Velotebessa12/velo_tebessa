import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";
import { generateOrderInvoiceHTML } from "@/lib/generateOrderInvoiceHtml"; 

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
            addOns: true,
          },
        },
        deliveryPerson: true,
      },
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const html = generateOrderInvoiceHTML(order);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf: any = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}