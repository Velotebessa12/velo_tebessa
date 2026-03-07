import { getTranslations } from "./getTranslations";



export const generateInvoiceHTML = (invoice: any) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Facture ${invoice.invoiceNumber ?? ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #111;
      background: #fff;
      padding: 56px 64px;
      font-size: 14px;
      line-height: 1.6;
    }

    /* Top bar */
    .top-bar {
      border-top: 3px solid #0d9488;
      margin-bottom: 40px;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .company-name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #111;
    }

    .supplier-contact {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }

    .invoice-label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #0d9488;
      font-weight: 600;
      text-align: right;
    }

    .invoice-number {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      margin-top: 2px;
      text-align: right;
    }

    .invoice-date {
      font-size: 12px;
      color: #6b7280;
      text-align: right;
      margin-top: 2px;
    }

    .invoice-status {
      display: inline-block;
      margin-top: 6px;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .status-PENDING    { background: #fef3c7; color: #b45309; }
    .status-RECEIVED   { background: #d1fae5; color: #065f46; }
    .status-CANCELLED  { background: #fee2e2; color: #991b1b; }

    /* Order info section */
    .order-section {
      margin-bottom: 28px;
      padding: 14px 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
    }

    .order-field { display: flex; flex-direction: column; gap: 2px; }
    .order-field-label {
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #9ca3af;
      font-weight: 600;
    }
    .order-field-value { font-size: 13px; color: #1f2937; font-weight: 500; }

    /* Client section */
    .client-section {
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .section-label {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #0d9488;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .client-name {
      font-size: 16px;
      font-weight: 600;
      color: #111;
    }

    .client-meta {
      font-size: 13px;
      color: #4b5563;
      margin-top: 2px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }

    thead th {
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      color: #6b7280;
      padding: 8px 12px;
      border-bottom: 2px solid #111;
      text-align: left;
    }

    thead th:last-child,
    tbody td:last-child {
      text-align: right;
    }

    tbody td {
      padding: 11px 12px;
      font-size: 14px;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }

    tbody tr:last-child td { border-bottom: none; }

    .qty        { color: #6b7280; font-size: 13px; }
    .unit-price { color: #6b7280; font-size: 13px; }
    .line-total { font-weight: 600; }

    .product-variant {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* Summary */
    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 48px;
    }

    .summary { width: 280px; }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #4b5563;
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-row:last-child { border-bottom: none; }

    .summary-row.total {
      padding-top: 10px;
      margin-top: 4px;
      border-top: 2px solid #111;
      border-bottom: none;
    }

    .summary-row.total span:first-child {
      font-size: 14px;
      font-weight: 700;
      color: #111;
    }

    .summary-row.total span:last-child {
      font-size: 18px;
      font-weight: 700;
      color: #0d9488;
    }

    /* Notes */
    .notes-section {
      margin-bottom: 32px;
      padding: 12px 16px;
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      border-radius: 4px;
    }

    .notes-section p {
      font-size: 12px;
      color: #78350f;
      line-height: 1.5;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer p { font-size: 12px; color: #9ca3af; }

    .footer-note {
      font-size: 11px;
      color: #0d9488;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    @media print {
      body { padding: 32px 40px; }
    }
  </style>
</head>
<body>

  <!-- Header: supplier as "company", invoice meta top-right -->
  <div class="top-bar">
    <div>
      <div class="company-name">${invoice.supplierName}</div>
      ${invoice.contact ? `<div class="supplier-contact">${invoice.contact}</div>` : ""}
    </div>
    <div>
      <div class="invoice-label">Facture fournisseur</div>
      ${invoice.invoiceNumber ? `<div class="invoice-number">#${invoice.invoiceNumber}</div>` : ""}
      ${invoice.createdAt ? `<div class="invoice-date">${new Date(invoice.createdAt).toLocaleDateString("fr-DZ")}</div>` : ""}
      <div style="text-align:right">
        <span class="invoice-status status-${invoice.status ?? "PENDING"}">
          ${{ PENDING: "En attente", RECEIVED: "Reçue", CANCELLED: "Annulée" }[invoice.status as string] ?? invoice.status}
        </span>
      </div>
    </div>
  </div>

  <!-- Order / delivery info (only if linked to an order) -->
  ${invoice.order ? `
  <div class="order-section">
    <div class="order-field">
      <span class="order-field-label">Client</span>
      <span class="order-field-value">${invoice.order.fullName}</span>
    </div>
    <div class="order-field">
      <span class="order-field-label">Téléphone</span>
      <span class="order-field-value">${invoice.order.phoneNumber}</span>
    </div>
    <div class="order-field">
      <span class="order-field-label">Wilaya / Commune</span>
      <span class="order-field-value">${invoice.order.wilaya}${invoice.order.commune ? ` — ${invoice.order.commune}` : ""}</span>
    </div>
    ${invoice.order.detailedAddress ? `
    <div class="order-field">
      <span class="order-field-label">Adresse</span>
      <span class="order-field-value">${invoice.order.detailedAddress}</span>
    </div>` : ""}
    ${invoice.order.shippingCompany ? `
    <div class="order-field">
      <span class="order-field-label">Transporteur</span>
      <span class="order-field-value">${invoice.order.shippingCompany}</span>
    </div>` : ""}
    ${invoice.order.trackingId ? `
    <div class="order-field">
      <span class="order-field-label">Tracking</span>
      <span class="order-field-value">${invoice.order.trackingId}</span>
    </div>` : ""}
  </div>
  ` : ""}

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>Qté</th>
        <th>Prix unitaire</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map((item: any) => {
        const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      
        return `
        <tr>
          <td>
            <div>${getTranslations(item.product.translations , "en" , "name")}</div>
            ${item.variant ? `
            <div class="product-variant">
              ${[item.variant.color, item.variant.attribute].filter(Boolean).join(" · ")}
            </div>` : ""}
          </td>
          <td class="qty">${item.quantity}</td>
          <td class="unit-price">${Number(item.unitPrice).toLocaleString("fr-DZ")} DA</td>
          <td class="line-total">${lineTotal.toLocaleString("fr-DZ")} DA</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <!-- Totals summary -->
  <div class="summary-wrap">
    <div class="summary">
      ${invoice.order?.subtotal != null ? `
      <div class="summary-row">
        <span>Sous-total</span>
        <span>${Number(invoice.order.subtotal).toLocaleString("fr-DZ")} DA</span>
      </div>` : ""}
      ${invoice.order?.shippingPrice != null && invoice.order.shippingPrice > 0 ? `
      <div class="summary-row">
        <span>Livraison</span>
        <span>${Number(invoice.order.shippingPrice).toLocaleString("fr-DZ")} DA</span>
      </div>` : ""}
      ${invoice.order?.discountTotal != null && invoice.order.discountTotal > 0 ? `
      <div class="summary-row">
        <span>Remise</span>
        <span>− ${Number(invoice.order.discountTotal).toLocaleString("fr-DZ")} DA</span>
      </div>` : ""}
      <div class="summary-row total">
        <span>Total</span>
        <span>${Number(invoice.totalAmount).toLocaleString("fr-DZ")} DA</span>
      </div>
    </div>
  </div>

  <!-- Notes -->
  ${invoice.notes ? `
  <div class="notes-section">
    <p><strong>Notes :</strong> ${invoice.notes}</p>
  </div>` : ""}

  ${invoice.order?.orderNote ? `
  <div class="notes-section">
    <p><strong>Note commande :</strong> ${invoice.order.orderNote}</p>
  </div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <p>Merci pour votre confiance.</p>
    <span class="footer-note">
      ${invoice.order?.deliveryMethod === "HOME_DELIVERY" ? "Livraison à domicile" : 
        invoice.order?.deliveryMethod === "PICKUP" ? "Retrait en agence" : 
        "Paiement à la livraison"}
    </span>
  </div>

</body>
</html>
`;