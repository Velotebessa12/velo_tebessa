import { getTranslations } from "./getTranslations";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:          "En attente",
  PREPARING:        "En préparation",
  SHIPPED:          "Expédiée",
  IN_TRANSIT:       "En transit",
  AT_OFFICE:        "Au bureau",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED:        "Livrée",
  CANCELED:         "Annulée",
  RETURNED:         "Retournée",
};

const ORDER_STATUS_CLASSES: Record<string, string> = {
  PENDING:          "status-pending",
  PREPARING:        "status-preparing",
  SHIPPED:          "status-shipped",
  IN_TRANSIT:       "status-transit",
  AT_OFFICE:        "status-office",
  OUT_FOR_DELIVERY: "status-out",
  DELIVERED:        "status-delivered",
  CANCELED:         "status-canceled",
  RETURNED:         "status-returned",
};

export const generateOrderInvoiceHTML = (order: any) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Commande #${order.id?.slice(0, 8).toUpperCase() ?? ""}</title>
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

    .order-label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #0d9488;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .order-id {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #111;
    }

    .order-date {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .status-pending   { background: #fef3c7; color: #b45309; }
    .status-preparing { background: #dbeafe; color: #1d4ed8; }
    .status-shipped   { background: #ede9fe; color: #6d28d9; }
    .status-transit   { background: #e0f2fe; color: #0369a1; }
    .status-office    { background: #f3e8ff; color: #7e22ce; }
    .status-out       { background: #fff7ed; color: #c2410c; }
    .status-delivered { background: #d1fae5; color: #065f46; }
    .status-canceled  { background: #fee2e2; color: #991b1b; }
    .status-returned  { background: #f1f5f9; color: #475569; }

    /* Client section */
    .client-section {
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      gap: 32px;
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

    /* Delivery info grid */
    .delivery-section {
      margin-bottom: 28px;
      padding: 14px 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .delivery-field { display: flex; flex-direction: column; gap: 2px; }

    .delivery-field-label {
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #9ca3af;
      font-weight: 600;
    }

    .delivery-field-value {
      font-size: 13px;
      color: #1f2937;
      font-weight: 500;
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
    tbody td:last-child { text-align: right; }

    tbody td {
      padding: 11px 12px;
      font-size: 14px;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }

    tbody tr:last-child td { border-bottom: none; }

    .qty        { color: #6b7280; font-size: 13px; }
    .unit-price { color: #6b7280; font-size: 13px; }
    .line-total { font-weight: 600; }

    .variant-tag {
      display: inline-block;
      margin-top: 3px;
      font-size: 11px;
      color: #6d28d9;
      background: #ede9fe;
      padding: 1px 7px;
      border-radius: 4px;
      font-weight: 500;
    }

    /* Add-ons sub-rows */
    .addon-row td {
      padding: 4px 12px 4px 28px;
      font-size: 12px;
      color: #6b7280;
      background: #fafafa;
      border-bottom: 1px solid #f3f4f6;
    }

    .addon-row td:last-child { text-align: right; }

    .addon-name::before {
      content: "↳ ";
      color: #d1d5db;
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
      margin-bottom: 20px;
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

  <!-- Header -->
  <div class="top-bar">
    <div>
      <div class="order-label">Bon de commande</div>
      <div class="order-id">#${order.id?.slice(0, 8).toUpperCase() ?? "—"}</div>
      ${order.createdAt ? `<div class="order-date">${new Date(order.createdAt).toLocaleDateString("fr-DZ", { year: "numeric", month: "long", day: "numeric" })}</div>` : ""}
    </div>
    <div style="text-align:right; padding-top: 4px;">
      <span class="status-badge ${ORDER_STATUS_CLASSES[order.status] ?? "status-pending"}">
        ${ORDER_STATUS_LABELS[order.status] ?? order.status}
      </span>
      ${order.trackingId ? `<div style="margin-top:8px; font-size:11px; color:#6b7280;">Tracking : <strong>${order.trackingId}</strong></div>` : ""}
      ${order.station_code ? `<div style="margin-top:4px; font-size:11px; color:#6b7280;">Code station : <strong>${order.station_code}</strong></div>` : ""}
    </div>
  </div>

  <!-- Client info -->
  <div class="client-section">
    <div>
      <div class="section-label">Client</div>
      <div class="client-name">${order.fullName}</div>
      <div class="client-meta">${order.phoneNumber}</div>
    </div>
    <div>
      <div class="section-label">Adresse de livraison</div>
      <div class="client-name">${order.wilaya}${order.commune ? ` — ${order.commune}` : ""}</div>
      ${order.detailedAddress ? `<div class="client-meta">${order.detailedAddress}</div>` : ""}
    </div>
  </div>

  <!-- Delivery details -->
  ${order.shippingCompany || order.deliveryMethod || order.deliveryPerson ? `
  <div class="delivery-section">
    ${order.deliveryMethod ? `
    <div class="delivery-field">
      <span class="delivery-field-label">Mode de livraison</span>
      <span class="delivery-field-value">
        ${order.deliveryMethod === "HOME_DELIVERY" ? "Livraison à domicile" :
          order.deliveryMethod === "PICKUP"        ? "Retrait en agence"   :
          order.deliveryMethod}
      </span>
    </div>` : ""}
    ${order.shippingCompany ? `
    <div class="delivery-field">
      <span class="delivery-field-label">Transporteur</span>
      <span class="delivery-field-value">${order.shippingCompany}</span>
    </div>` : ""}
    ${order.deliveryPerson ? `
    <div class="delivery-field">
      <span class="delivery-field-label">Livreur</span>
      <span class="delivery-field-value">${order.deliveryPerson.fullName ?? order.deliveryPerson.name ?? "—"}</span>
    </div>` : ""}
    ${order.deliveredAt ? `
    <div class="delivery-field">
      <span class="delivery-field-label">Livré le</span>
      <span class="delivery-field-value">${new Date(order.deliveredAt).toLocaleDateString("fr-DZ")}</span>
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
      ${order.items.map((item: any) => {
        const productName = getTranslations(item.product?.translations, "fr", "name")
          ?? item.product?.translations?.[0]?.name
          ?? "—";

        const rows: string[] = [];

        // Main item row
        rows.push(`
        <tr>
          <td>
            <div>${productName}</div>
            ${item.variantName ? `<span class="variant-tag">${item.variantName}</span>` : ""}
          </td>
          <td class="qty">${item.quantity}</td>
          <td class="unit-price">${Number(item.unitPrice).toLocaleString("fr-DZ")} DA</td>
          <td class="line-total">${Number(item.total).toLocaleString("fr-DZ")} DA</td>
        </tr>`);

        // Add-on sub-rows
        if (item.addOns?.length) {
          item.addOns.forEach((addon: any) => {
            rows.push(`
            <tr class="addon-row">
              <td><span class="addon-name">${addon.name}</span></td>
              <td>${addon.quantity}</td>
              <td>${Number(addon.unitPrice).toLocaleString("fr-DZ")} DA</td>
              <td>${Number(addon.total).toLocaleString("fr-DZ")} DA</td>
            </tr>`);
          });
        }

        return rows.join("");
      }).join("")}
    </tbody>
  </table>

  <!-- Summary -->
  <div class="summary-wrap">
    <div class="summary">
      <div class="summary-row">
        <span>Sous-total</span>
        <span>${Number(order.subtotal).toLocaleString("fr-DZ")} DA</span>
      </div>
      ${order.shippingPrice > 0 ? `
      <div class="summary-row">
        <span>Livraison</span>
        <span>${Number(order.shippingPrice).toLocaleString("fr-DZ")} DA</span>
      </div>` : ""}
      ${order.discountTotal > 0 ? `
      <div class="summary-row">
        <span>Remise</span>
        <span>− ${Number(order.discountTotal).toLocaleString("fr-DZ")} DA</span>
      </div>` : ""}
      <div class="summary-row total">
        <span>Total</span>
        <span>${Number(order.total).toLocaleString("fr-DZ")} DA</span>
      </div>
    </div>
  </div>

  <!-- Notes -->
  ${order.orderNote ? `
  <div class="notes-section">
    <p><strong>Note commande :</strong> ${order.orderNote}</p>
  </div>` : ""}

  ${order.deliveryNote ? `
  <div class="notes-section">
    <p><strong>Note livraison :</strong> ${order.deliveryNote}</p>
  </div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <p>Merci pour votre confiance.</p>
    <span class="footer-note">
      ${order.deliveryMethod === "HOME_DELIVERY" ? "Livraison à domicile" :
        order.deliveryMethod === "PICKUP"        ? "Retrait en agence"   :
        "Paiement à la livraison"}
    </span>
  </div>

</body>
</html>
`;