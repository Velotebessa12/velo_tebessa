import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
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

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf : any = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=order-${id}.pdf`,
      },
    });
  } catch (error) {
    console.error("ORDER PDF ERROR:", error);
    return new Response("Internal server error", { status: 500 });
  }
}