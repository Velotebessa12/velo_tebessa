import { prisma } from "@/lib/prisma";
import { generateInvoiceHTML } from "@/lib/generateInvoiceHtml";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(req: Request, context: Context) {
  try {
    const { id } = await context.params;
    

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: {
        include : {
          product : {
            include : {
              translations : true
            }
          }
        }
      }},
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    const html = generateInvoiceHTML(invoice);

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
      },
    });

  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}