// lib/generateInvoice.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type InvoiceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type InvoiceData = {
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  total: number;
};

export async function generateInvoicePDF(data: InvoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  /* =======================
     HEADER
  ======================= */
  page.drawText("Velo Tebessa", {
    x: 40,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.3),
  });

  page.drawText("Facture", {
    x: 450,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.3),
  });

  y -= 30;

  page.drawText(`N° Commande: ${data.invoiceNumber}`, {
    x: 450,
    y,
    size: 10,
    font,
  });

  page.drawText(`Date: ${data.date}`, {
    x: 450,
    y: y - 15,
    size: 10,
    font,
  });

  /* =======================
     CLIENT INFO
  ======================= */
  y -= 70;

  page.drawRectangle({
    x: 40,
    y: y - 90,
    width: 515,
    height: 90,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("INFORMATIONS CLIENT", {
    x: 50,
    y: y - 20,
    size: 12,
    font: boldFont,
    color: rgb(0.1, 0.6, 0.3),
  });

  const clientLines = [
    `Nom: ${data.customer.name}`,
    `Téléphone: ${data.customer.phone}`,
    `Wilaya: ${data.customer.wilaya}`,
    `Commune: ${data.customer.commune}`,
    `Adresse: ${data.customer.address}`,
  ];

  clientLines.forEach((line, i) => {
    page.drawText(line, {
      x: 50,
      y: y - 40 - i * 14,
      size: 10,
      font,
    });
  });

  /* =======================
     TABLE HEADER
  ======================= */
  y -= 130;

  page.drawRectangle({
    x: 40,
    y: y - 25,
    width: 515,
    height: 25,
    color: rgb(0.1, 0.6, 0.3),
  });

  const headers = ["Produit", "Quantité", "Prix", "Total"];
  const headerX = [50, 300, 380, 470];

  headers.forEach((h, i) => {
    page.drawText(h, {
      x: headerX[i],
      y: y - 18,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
  });

  /* =======================
     ITEMS
  ======================= */
  y -= 40;

  data.items.forEach((item) => {
    page.drawText(item.name, { x: 50, y, size: 10, font });
    page.drawText(String(item.quantity), { x: 310, y, size: 10, font });
    page.drawText(`${item.unitPrice} DA`, { x: 380, y, size: 10, font });
    page.drawText(`${item.total} DA`, { x: 470, y, size: 10, font });
    y -= 20;
  });

  /* =======================
     TOTALS
  ======================= */
  y -= 20;

  const totals = [
    [`Sous-total:`, `${data.subtotal} DA`],
    [`Livraison:`, `${data.shipping} DA`],
    [`Total Général:`, `${data.total} DA`],
  ];

  totals.forEach(([label, value], i) => {
    page.drawText(label, {
      x: 350,
      y: y - i * 18,
      size: i === 2 ? 12 : 10,
      font: i === 2 ? boldFont : font,
    });

    page.drawText(value, {
      x: 470,
      y: y - i * 18,
      size: i === 2 ? 12 : 10,
      font: i === 2 ? boldFont : font,
      color: i === 2 ? rgb(0.1, 0.6, 0.3) : rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}