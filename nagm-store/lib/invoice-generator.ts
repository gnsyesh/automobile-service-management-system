import { PDFDocument, rgb, StandardFonts, PDFString } from "pdf-lib";
import type { Order } from "@/types";

const NEGM_LOGO_PNG_BASE64 = "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";

const DEVELOPER_NAME = "G Naga Sai Yeshwanth Ratna";
const DEVELOPER_EMAIL = "gnsyesh123@gmail.com";

/**
 * Format monetary amount with standard Egyptian 2 decimal places and EGP currency.
 * Example: 1850 -> "1,850.00 EGP", -92.5 -> "-92.50 EGP"
 */
function formatEgp(val: number): string {
  const formatted = Math.abs(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (val < 0 ? "-" : "") + formatted + " EGP";
}

/**
 * Generates an on-demand, professional, standalone ONE-PAGE A4 commercial invoice PDF.
 * Never stored permanently in Firestore, Storage, R2, or disk. Discarded after download.
 */
export async function generateInvoicePdf(order: Order): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Exactly ONE A4 Page in Portrait mode: 595.28 x 841.89 points
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Standard safe typography
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Embed genuine Negm Store logo (supports both JPEG/JFIF and PNG headers)
  let logoImage: any = null;
  try {
    let logoBytes: Uint8Array;
    if (typeof Buffer !== "undefined") {
      const nodeBuf = Buffer.from(NEGM_LOGO_PNG_BASE64, "base64");
      logoBytes = new Uint8Array(nodeBuf.buffer, nodeBuf.byteOffset, nodeBuf.byteLength).slice();
    } else {
      const binaryString = atob(NEGM_LOGO_PNG_BASE64);
      logoBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        logoBytes[i] = binaryString.charCodeAt(i);
      }
    }

    if (logoBytes[0] === 0xff && logoBytes[1] === 0xd8) {
      logoImage = await pdfDoc.embedJpg(logoBytes);
    } else {
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
  } catch (err) {
    console.warn("Could not embed logo in invoice PDF:", err);
  }

  // Brand Palette
  const colorPrimary = rgb(139 / 255, 58 / 255, 46 / 255); // Negm Deep Crimson #8B3A2E
  const colorGold = rgb(184 / 255, 134 / 255, 11 / 255); // Dark Goldenrod #B8860B
  const colorDark = rgb(17 / 255, 24 / 255, 39 / 255); // Slate 900
  const colorMuted = rgb(100 / 255, 116 / 255, 139 / 255); // Slate 500
  const colorBorder = rgb(226 / 255, 232 / 255, 240 / 255); // Slate 200
  const colorTableHdr = rgb(248 / 255, 250 / 255, 252 / 255); // Slate 50
  const colorHighlight = rgb(254 / 255, 249 / 255, 195 / 255); // Soft Amber 100
  const colorGreen = rgb(16 / 255, 185 / 255, 129 / 255); // Emerald 500
  const colorRed = rgb(220 / 255, 38 / 255, 38 / 255); // Red 600

  // Derive Invoice State (Version 1: In Progress vs Version 2: Final / Completed)
  const isDelivered = order.status === "Delivered" || order.orderStatus === "Delivered";
  const isCancelled = order.status === "Cancelled" || order.orderStatus === "Cancelled";
  const isFailed = order.paymentStatus === "failed";
  const isPaid = order.paymentStatus === "paid";
  const isCod = order.paymentMethod === "cod";

  let invoiceStateLabel = "VERSION 1 - OFFICIAL ORDER INVOICE (IN PROGRESS)";
  let paymentStatusText = "Pending";
  let orderStatusText: string = order.status || order.orderStatus || "Processing";
  let deliveryStatusText = "Pending Fulfillment";
  let totalLabel = "GRAND TOTAL:";

  if (isCancelled) {
    invoiceStateLabel = "ORDER INVOICE - CANCELLED";
    paymentStatusText = "Cancelled";
    orderStatusText = "Cancelled";
    deliveryStatusText = "Cancelled";
    totalLabel = "TOTAL (CANCELLED):";
  } else if (isFailed) {
    invoiceStateLabel = "ORDER INVOICE - PAYMENT FAILED";
    paymentStatusText = "Failed";
    orderStatusText = "Pending Payment";
    deliveryStatusText = "On Hold";
    totalLabel = "TOTAL (PAYMENT FAILED):";
  } else if (isDelivered) {
    // VERSION 2 - FINAL / COMPLETED
    invoiceStateLabel = "VERSION 2 - COMMERCIAL INVOICE (FINAL / COMPLETED)";
    paymentStatusText = isPaid ? "Paid" : (isCod ? "Due on Delivery" : "Pending");
    orderStatusText = "Delivered";
    deliveryStatusText = "Delivered (Product Received)";
    totalLabel = isPaid ? "GRAND TOTAL PAID:" : (isCod ? "TOTAL DUE ON DELIVERY:" : "GRAND TOTAL:");
  } else {
    // VERSION 1 — BEFORE FINAL COMPLETION
    if (isCod) {
      paymentStatusText = isPaid ? "Paid" : "Due on Delivery";
      orderStatusText = order.status || order.orderStatus || "Processing";
      deliveryStatusText = "Warehouse Preparation & Dispatch";
      totalLabel = isPaid ? "GRAND TOTAL PAID:" : "TOTAL DUE ON DELIVERY:";
    } else {
      paymentStatusText = isPaid ? "Paid" : "Pending";
      const normalizedStatus = order.status || order.orderStatus || "";
      orderStatusText = isPaid
        ? (normalizedStatus && normalizedStatus !== "Processing" ? normalizedStatus : "In Transit")
        : "Pending Payment";
      deliveryStatusText = isPaid ? "In Transit to Customer" : "Awaiting Payment";
      totalLabel = isPaid ? "GRAND TOTAL PAID:" : "GRAND TOTAL:";
    }
  }

  const paymentMethodText =
    order.paymentMethod === "card"
      ? "Credit / Debit Card (Online)"
      : "Cash on Delivery (COD)";

  // ==========================================
  // 1. HEADER SECTION (Y: 800 - 720)
  // ==========================================
  if (logoImage) {
    // Elegant frame around logo
    page.drawRectangle({
      x: 39,
      y: height - 101,
      width: 60,
      height: 60,
      borderColor: colorBorder,
      borderWidth: 1,
    });
    page.drawImage(logoImage, {
      x: 40,
      y: height - 100,
      width: 58,
      height: 58,
    });
  }

  // Brand Info
  page.drawText("NEGM STORE", {
    x: 108,
    y: height - 60,
    size: 16,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText("Automobile Service Management & Genuine Auto Parts", {
    x: 108,
    y: height - 76,
    size: 8.5,
    font: fontRegular,
    color: colorDark,
  });

  // Invoice Title & Meta (Right Aligned)
  const headerTitle = "COMMERCIAL INVOICE";
  const headerWidth = fontBold.widthOfTextAtSize(headerTitle, 16);
  page.drawText(headerTitle, {
    x: width - 40 - headerWidth,
    y: height - 58,
    size: 16,
    font: fontBold,
    color: colorPrimary,
  });

  const invNumberText = `Invoice #: INV-${order.id}`;
  const invWidth = fontBold.widthOfTextAtSize(invNumberText, 8.5);
  page.drawText(invNumberText, {
    x: width - 40 - invWidth,
    y: height - 73,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  const orderDateText = `Order Date: ${order.orderDate || new Date().toLocaleDateString()}`;
  const dateWidth = fontRegular.widthOfTextAtSize(orderDateText, 8);
  page.drawText(orderDateText, {
    x: width - 40 - dateWidth,
    y: height - 85,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });

  const stateBadgeText = isDelivered
    ? "Status: COMPLETED"
    : isCancelled
    ? "Status: CANCELLED"
    : isFailed
    ? "Status: FAILED"
    : "Status: IN PROGRESS";
  const stateWidth = fontBold.widthOfTextAtSize(stateBadgeText, 8);
  page.drawText(stateBadgeText, {
    x: width - 40 - stateWidth,
    y: height - 97,
    size: 8,
    font: fontBold,
    color: isDelivered ? colorGreen : isCancelled || isFailed ? colorRed : colorGold,
  });

  // Top Divider
  page.drawLine({
    start: { x: 40, y: height - 110 },
    end: { x: width - 40, y: height - 110 },
    thickness: 1,
    color: colorBorder,
  });

  // Version Banner Bar
  page.drawRectangle({
    x: 40,
    y: height - 128,
    width: width - 80,
    height: 14,
    color: colorTableHdr,
  });

  page.drawText(invoiceStateLabel, {
    x: 46,
    y: height - 124,
    size: 7.5,
    font: fontBold,
    color: colorPrimary,
  });

  // ==========================================
  // 2. BILL TO & ORDER INFORMATION (Y: 700 - 635)
  // ==========================================
  const infoStartY = height - 146;

  // Left Column: Bill To
  page.drawText("BILL TO (CUSTOMER):", {
    x: 40,
    y: infoStartY,
    size: 8.5,
    font: fontBold,
    color: colorPrimary,
  });

  const customerName = order.shippingAddress?.fullName || order.customerDetails?.fullName || "Valued Customer";
  page.drawText(customerName, {
    x: 40,
    y: infoStartY - 14,
    size: 9.5,
    font: fontBold,
    color: colorDark,
  });

  const customerPhone = order.shippingAddress?.phone || order.customerDetails?.phone || "N/A";
  page.drawText(`Phone: ${customerPhone}`, {
    x: 40,
    y: infoStartY - 27,
    size: 8,
    font: fontRegular,
    color: colorDark,
  });

  const address = order.shippingAddress;
  const bldgPart = address?.building ? `, Bldg ${address.building}` : "";
  const aptPart = address?.apartment ? `, Apt ${address.apartment}` : "";
  const streetPart = address?.street ? `${address.street}${bldgPart}${aptPart}` : "N/A";
  const cityPart = address ? `${address.city || ""}${address.governorate ? `, ${address.governorate}` : ""}` : "N/A";
  page.drawText(`Address: ${streetPart}`, {
    x: 40,
    y: infoStartY - 39,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });
  page.drawText(`City / Region: ${cityPart}`, {
    x: 40,
    y: infoStartY - 50,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });

  // Right Column: Order Delivery & Status
  const rightColX = 330;
  page.drawText("DELIVERY & STATUS:", {
    x: rightColX,
    y: infoStartY,
    size: 8.5,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText(`Order Status: ${orderStatusText}`, {
    x: rightColX,
    y: infoStartY - 14,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  page.drawText(`Delivery Status: ${deliveryStatusText}`, {
    x: rightColX,
    y: infoStartY - 28,
    size: 8,
    font: fontRegular,
    color: colorDark,
  });

  const estDelivery = order.estimatedDelivery || "To be confirmed";
  page.drawText(`Estimated Delivery: ${estDelivery}`, {
    x: rightColX,
    y: infoStartY - 42,
    size: 8,
    font: fontRegular,
    color: colorMuted,
  });

  // ==========================================
  // 3. ITEMS TABLE (Y: 620 to 450)
  // ==========================================
  const tableTopY = height - 215;
  const tableHeaderHeight = 20;

  // Header Background Box
  page.drawRectangle({
    x: 40,
    y: tableTopY - tableHeaderHeight,
    width: width - 80,
    height: tableHeaderHeight,
    color: colorPrimary,
  });

  // Table Headers (Clean layout with right-aligned price/amount)
  page.drawText("ITEM DESCRIPTION / SPARE PART", {
    x: 48,
    y: tableTopY - 14,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("BRAND", {
    x: 300,
    y: tableTopY - 14,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("QTY", {
    x: 380,
    y: tableTopY - 14,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const unitHdrText = "UNIT PRICE";
  const unitHdrWidth = fontBold.widthOfTextAtSize(unitHdrText, 8);
  page.drawText(unitHdrText, {
    x: 475 - unitHdrWidth,
    y: tableTopY - 14,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const amtHdrText = "AMOUNT";
  const amtHdrWidth = fontBold.widthOfTextAtSize(amtHdrText, 8);
  page.drawText(amtHdrText, {
    x: 548 - amtHdrWidth,
    y: tableTopY - 14,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Draw Items Rows
  let currentY = tableTopY - tableHeaderHeight;
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsCount = Math.max(items.length, 1);
  const maxTableHeight = 330;
  const rowHeight = Math.max(14, Math.min(22, Math.floor(maxTableHeight / itemsCount)));
  const itemFontSize = rowHeight < 17 ? 7 : 8;
  const itemTextYOffset = Math.max(4, Math.floor((rowHeight - itemFontSize) / 2));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowY = currentY - (i + 1) * rowHeight;
    const isEven = i % 2 === 0;

    if (isEven) {
      page.drawRectangle({
        x: 40,
        y: rowY,
        width: width - 80,
        height: rowHeight,
        color: rgb(250 / 255, 250 / 255, 250 / 255),
      });
    }

    // Row separator line
    page.drawLine({
      start: { x: 40, y: rowY },
      end: { x: width - 40, y: rowY },
      thickness: 0.5,
      color: colorBorder,
    });

    // Product Name (generous room, up to 48 chars)
    const rawName = item.product?.name || "Genuine Auto Part";
    const truncatedName = rawName.length > 50 ? `${rawName.slice(0, 48)}...` : rawName;
    page.drawText(truncatedName, {
      x: 48,
      y: rowY + itemTextYOffset,
      size: itemFontSize,
      font: fontBold,
      color: colorDark,
    });

    // Brand
    const brand = item.product?.brand || "OEM";
    page.drawText(brand.slice(0, 14), {
      x: 300,
      y: rowY + itemTextYOffset,
      size: itemFontSize,
      font: fontRegular,
      color: colorMuted,
    });

    // Quantity
    page.drawText(String(item.quantity), {
      x: 386,
      y: rowY + itemTextYOffset,
      size: itemFontSize,
      font: fontRegular,
      color: colorDark,
    });

    // Unit Price (historical line price from item.price or product.price)
    const unitPrice = Number((item as any).price ?? item.product?.price) || 0;
    const unitPriceText = formatEgp(unitPrice);
    const unitPriceWidth = fontRegular.widthOfTextAtSize(unitPriceText, itemFontSize);
    page.drawText(unitPriceText, {
      x: 475 - unitPriceWidth,
      y: rowY + itemTextYOffset,
      size: itemFontSize,
      font: fontRegular,
      color: colorDark,
    });

    // Line Total (Right-aligned to 548)
    const lineTotalText = formatEgp(unitPrice * item.quantity);
    const lineTotalWidth = fontBold.widthOfTextAtSize(lineTotalText, itemFontSize);
    page.drawText(lineTotalText, {
      x: 548 - lineTotalWidth,
      y: rowY + itemTextYOffset,
      size: itemFontSize,
      font: fontBold,
      color: colorDark,
    });
  }

  // End of items table line
  const tableBottomY = currentY - items.length * rowHeight;
  page.drawLine({
    start: { x: 40, y: tableBottomY },
    end: { x: width - 40, y: tableBottomY },
    thickness: 1,
    color: colorBorder,
  });

  // ==========================================
  // 4. FINANCIAL SUMMARY & PAYMENT SECTION (Y: below table)
  // ==========================================
  const summaryTopY = tableBottomY - 16;

  // Left Box: Payment Details & Authenticity Guarantee
  page.drawRectangle({
    x: 40,
    y: summaryTopY - 110,
    width: 245,
    height: 110,
    borderColor: colorBorder,
    borderWidth: 1,
    color: rgb(253 / 255, 254 / 255, 255 / 255),
  });

  page.drawText("PAYMENT METHOD & TERMS", {
    x: 50,
    y: summaryTopY - 16,
    size: 8.5,
    font: fontBold,
    color: colorPrimary,
  });

  page.drawText(`Payment Method: ${paymentMethodText}`, {
    x: 50,
    y: summaryTopY - 30,
    size: 8,
    font: fontRegular,
    color: colorDark,
  });

  page.drawText(`Payment Status: ${paymentStatusText}`, {
    x: 50,
    y: summaryTopY - 44,
    size: 8,
    font: fontBold,
    color: isPaid ? colorGreen : isFailed || isCancelled ? colorRed : colorGold,
  });

  const paymentNote = isPaid
    ? "Payment received and verified in full."
    : isCod
    ? "Cash collection due upon physical order delivery to courier."
    : isFailed
    ? "Payment attempt unsuccessful. Please retry."
    : "Electronic payment awaiting confirmation.";

  page.drawText(paymentNote, {
    x: 50,
    y: summaryTopY - 58,
    size: 7.5,
    font: fontOblique,
    color: colorMuted,
  });

  // Support and terms
  page.drawText("Customer Support & Inquiries", {
    x: 50,
    y: summaryTopY - 82,
    size: 7.5,
    font: fontBold,
    color: colorGold,
  });
  page.drawText("For inquiries or assistance, contact store support.", {
    x: 50,
    y: summaryTopY - 94,
    size: 7,
    font: fontRegular,
    color: colorMuted,
  });

  // Right Box: Financial Breakdown (Width: 250 pt, perfectly right-aligned)
  const sumLabelX = 305;
  const sumRightEdge = 548;

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shipping) || 0;
  const vat = Number(order.vat) || 0;
  const grandTotal = Number(order.total) || 0;

  // Subtotal
  page.drawText("Subtotal", {
    x: sumLabelX,
    y: summaryTopY - 14,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });
  const subtotalText = formatEgp(subtotal);
  const subtotalWidth = fontBold.widthOfTextAtSize(subtotalText, 8.5);
  page.drawText(subtotalText, {
    x: sumRightEdge - subtotalWidth,
    y: summaryTopY - 14,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  // Discount (if any)
  let nextRowY = summaryTopY - 28;
  if (discount > 0) {
    page.drawText("Promotional Discount", {
      x: sumLabelX,
      y: nextRowY,
      size: 8.5,
      font: fontRegular,
      color: colorGreen,
    });
    const discountText = formatEgp(-discount);
    const discountWidth = fontBold.widthOfTextAtSize(discountText, 8.5);
    page.drawText(discountText, {
      x: sumRightEdge - discountWidth,
      y: nextRowY,
      size: 8.5,
      font: fontBold,
      color: colorGreen,
    });
    nextRowY -= 14;
  }

  // Delivery & Shipping
  page.drawText("Delivery & Shipping", {
    x: sumLabelX,
    y: nextRowY,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });
  const shippingText = shipping === 0 ? "FREE" : formatEgp(shipping);
  const shippingWidth = fontBold.widthOfTextAtSize(shippingText, 8.5);
  page.drawText(shippingText, {
    x: sumRightEdge - shippingWidth,
    y: nextRowY,
    size: 8.5,
    font: fontBold,
    color: shipping === 0 ? colorGreen : colorDark,
  });
  nextRowY -= 14;

  // Egyptian VAT (14%)
  page.drawText("Egyptian VAT (14%)", {
    x: sumLabelX,
    y: nextRowY,
    size: 8.5,
    font: fontRegular,
    color: colorMuted,
  });
  const vatText = formatEgp(vat);
  const vatWidth = fontBold.widthOfTextAtSize(vatText, 8.5);
  page.drawText(vatText, {
    x: sumRightEdge - vatWidth,
    y: nextRowY,
    size: 8.5,
    font: fontBold,
    color: colorDark,
  });

  // Divider above Grand Total
  const totalDivY = nextRowY - 10;
  page.drawLine({
    start: { x: sumLabelX, y: totalDivY },
    end: { x: 555, y: totalDivY },
    thickness: 1,
    color: colorBorder,
  });

  // Grand Total Box (Comfortable padding: 14pt left, 14pt right, height: 34pt)
  const totalBoxX = 295;
  const totalBoxWidth = 260;
  const totalBoxHeight = 34;
  const totalBoxY = totalDivY - totalBoxHeight - 8;

  page.drawRectangle({
    x: totalBoxX,
    y: totalBoxY,
    width: totalBoxWidth,
    height: totalBoxHeight,
    color: colorHighlight,
    borderColor: colorGold,
    borderWidth: 1,
  });

  // Grand Total Label
  page.drawText(totalLabel, {
    x: totalBoxX + 14,
    y: totalBoxY + 11,
    size: 9,
    font: fontBold,
    color: colorPrimary,
  });

  // Grand Total Amount (Right-aligned with 14pt right padding so it never touches or crosses the border)
  const grandTotalText = formatEgp(grandTotal);
  const grandTotalWidth = fontBold.widthOfTextAtSize(grandTotalText, 11);
  page.drawText(grandTotalText, {
    x: totalBoxX + totalBoxWidth - 14 - grandTotalWidth,
    y: totalBoxY + 11,
    size: 11,
    font: fontBold,
    color: colorPrimary,
  });

  // ==========================================
  // 5. DEVELOPER ATTRIBUTION & EMAIL (BOTTOM OF SINGLE A4 PAGE)
  // ==========================================
  const bottomDividerY = 104;
  page.drawLine({
    start: { x: 40, y: bottomDividerY },
    end: { x: width - 40, y: bottomDividerY },
    thickness: 1,
    color: colorBorder,
  });

  // Left Side: Developer Name
  page.drawText("DESIGNED & DEVELOPED BY", {
    x: 40,
    y: 84,
    size: 7,
    font: fontBold,
    color: colorMuted,
  });

  page.drawText(DEVELOPER_NAME, {
    x: 40,
    y: 68,
    size: 10,
    font: fontBold,
    color: colorDark,
  });

  // Right Side: Action Button Card [ Contact Developer -> ]
  const btnX = 350;
  const btnY = 56;
  const btnWidth = 205;
  const btnHeight = 32;

  page.drawRectangle({
    x: btnX,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
    color: rgb(254 / 255, 243 / 255, 199 / 255), // Amber 100
    borderColor: colorGold,
    borderWidth: 1,
  });

  // Vector envelope icon
  const envX = btnX + 12;
  const envY = btnY + 11;
  page.drawRectangle({
    x: envX,
    y: envY,
    width: 14,
    height: 10,
    borderColor: colorPrimary,
    borderWidth: 0.9,
  });
  page.drawLine({
    start: { x: envX, y: envY + 10 },
    end: { x: envX + 7, y: envY + 5 },
    thickness: 0.9,
    color: colorPrimary,
  });
  page.drawLine({
    start: { x: envX + 14, y: envY + 10 },
    end: { x: envX + 7, y: envY + 5 },
    thickness: 0.9,
    color: colorPrimary,
  });

  page.drawText("Contact Developer ->", {
    x: envX + 22,
    y: btnY + 18,
    size: 8.5,
    font: fontBold,
    color: colorPrimary,
  });

  // Developer email appears ONLY ONCE in the invoice, inside this contact box
  page.drawText(DEVELOPER_EMAIL, {
    x: envX + 22,
    y: btnY + 7,
    size: 8,
    font: fontRegular,
    color: colorDark,
  });

  // Clickable URI Annotation for mailto:gnsyesh123@gmail.com
  try {
    const btnLinkAnnot = pdfDoc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [btnX, btnY, btnX + btnWidth, btnY + btnHeight],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(`mailto:${DEVELOPER_EMAIL}`),
      },
    });
    page.node.addAnnot(pdfDoc.context.register(btnLinkAnnot));
  } catch (annotErr) {
    console.warn("Could not register PDF hyperlink annotation:", annotErr);
  }

  // Legal / Document Notice (very bottom)
  page.drawText(
    "Negm Store Automobile Service Management System | Electronic Commercial Invoice | Generated on demand",
    {
      x: 40,
      y: 36,
      size: 6.5,
      font: fontRegular,
      color: colorMuted,
    }
  );

  // Return PDF bytes (discarded after sending, universal PDF 1.4 compatibility)
  return pdfDoc.save({ useObjectStreams: false });
}
