import puppeteer from "puppeteer-core";
import _chromium from "@sparticuz/chromium-min"; // Swapped to -min
import { prisma } from "@/lib/prisma";
import { generateOrderInvoiceHTML } from "@/lib/generateOrderInvoiceHtml";

// Force TypeScript to stop checking chromium properties
const chromium = _chromium as any;

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
// Crucial: Vercel needs extra time to download the browser in production
export const maxDuration = 30; 

const getLocalPath = () => {
  if (process.platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/google-chrome";
};

export async function GET(req: Request, context: Context) {
  let browser: any = null;

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
    const isLocal = process.env.NODE_ENV === "development";

    const launchConfig: any = {
      args: isLocal ? [] : chromium.args,
      defaultViewport: chromium.defaultViewport,
      // In production, we pull the browser from a stable remote source
      executablePath: isLocal 
        ? getLocalPath() 
        : await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'),
      headless: isLocal ? true : chromium.headless,
    };

    browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();

    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
    });

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="order-${id}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("ORDER PDF ERROR:", error);
    return new Response(`Internal server error: ${error.message}`, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}