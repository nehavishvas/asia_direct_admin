import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  extractQuoteDataFromRoot,
  getVisibleColumns,
  rowHasValues,
  isEmptyPdfCellText,
  getColumnAlign,
  formatCellDisplayValue,
} from "./pdfQuoteLayout";

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const NAVY = [27, 34, 69]; // #1b2245
const RED = [203, 25, 30]; // #cb191e
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const BORDER = [0, 0, 0];
const LIGHT_HEAD = [236, 239, 245];
const COMMENT_COLOR = BLACK;

const MARGIN = 24;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const loadImageAsDataUrl = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB");
};

const val = (v) => (v === null || v === undefined || v === "" ? "" : String(v));

// Reduces a VAT label like "Standard Rate (15.00 %)" or "Customs VAT(100.00%)"
// down to just "15.00 %". Labels with no numeric percentage (e.g. "Manual VAT",
// "No Vat") are left untouched since there is no value to extract.
const extractVatPercentOnly = (text) => {
  if (text === null || text === undefined) return text;
  const str = String(text);
  const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) {
    return `${parseFloat(match[1]).toFixed(2)} %`;
  }
  return str;
};

// Finds the "Vat %" column in the extracted quote data and rewrites every
// row/total/grand-total cell in that column to just the numeric percentage.
const applyVatPercentOnlyToQuoteData = (quoteData) => {
  if (!quoteData?.headers) return quoteData;

  const vatColIdx = quoteData.headers.findIndex(
    (h) => (h ?? "").replace(/\s+/g, " ").trim().toLowerCase() === "vat %",
  );
  if (vatColIdx === -1) return quoteData;

  const fixRow = (row) => {
    if (!row) return row;
    const updated = [...row];
    updated[vatColIdx] = extractVatPercentOnly(row[vatColIdx]);
    return updated;
  };

  return {
    ...quoteData,
    sections: quoteData.sections.map((section) => ({
      ...section,
      rows: section.rows.map(fixRow),
      total: section.total ? fixRow(section.total) : section.total,
    })),
    grandTotal: quoteData.grandTotal ? fixRow(quoteData.grandTotal) : quoteData.grandTotal,
  };
};

// ---------------------------------------------------------------------------
// Header drawing (logo, company block, freight estimate bar, info grid)
// ---------------------------------------------------------------------------
const drawSectionBar = (doc, x, y, width, title) => {
  const h = 16;
  doc.setFillColor(...NAVY);
  doc.rect(x, y, width, h, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(title, x + width / 2, y + h / 2 + 3.2, { align: "center" });
  doc.setTextColor(...BLACK);
  return y + h;
};

const drawKV = (doc, x, y, width, label, value, opts = {}) => {
  const rowH = opts.rowH || 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(label, x + 4, y + rowH - 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const text = val(value) || "-";
  doc.text(text, x + width - 4, y + rowH - 4.5, { align: "right" });
  return y + rowH;
};

const drawInfoBox = (doc, { x, y, width, height, rows }) => {
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.75);
  doc.rect(x, y, width, height);
  let cursorY = y;
  rows.forEach((row) => {
    if (row.type === "bar") {
      cursorY = drawSectionBar(doc, x, cursorY, width, row.title);
    } else if (row.type === "kv") {
      cursorY = drawKV(doc, x, cursorY, width, row.label, row.value, row.opts);
    } else if (row.type === "text") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(val(row.value), width - 8);
      doc.text(lines, x + 4, cursorY + 10);
      cursorY += 10 + lines.length * 10 + 4;
    } else if (row.type === "gap") {
      cursorY += row.height || 4;
    }
  });
  return cursorY;
};

/**
 * Build the "meta" object the export function needs from the live component
 * state. Call this from ShippingEstimate.jsx right before exporting.
 */
export const buildEstimateMeta = ({ freight = {}, getdata = {}, logoSrc }) => ({
  logoSrc,
  company: {
    name: "Asia Direct - Africa",
    companyName: freight?.company_address?.company_name || "",
    address: freight?.company_address?.address_line || "",
    registrationNo: freight?.company_address?.company_registration_no || "",
    vatNo: freight?.company_address?.tax_vat_no || "",
    importersCode: freight?.company_address?.postal_code || "",
  },
  client: {
    name: getdata?.client_name || "",
    address: getdata?.address_1 || "",
  },
  cargo: {
    commodity: getdata?.product_desc,
    hazardous:
      getdata?.hazardous?.toLowerCase?.() === "no" ? "No" : getdata?.hazard_type,
    packages: getdata?.no_of_packages,
    packageType: getdata?.package_type,
    grossWeight: getdata?.weight,
    dimensions: getdata?.dimension,
    volumetric: getdata?.volumetric_weight,
    chargeable: getdata?.chargable_rate,
  },
  rateOfExchange: {
    baseCurrency: freight?.final_base_currency,
    paymentTerms: freight?.payment_terms,
  },
  invoice: {
    invoiceFor: freight?.invoice_for_country,
    clientRef: freight?.customer_invoice_no,
    reference: freight?.reference_no,
    quoteDate: getdata?.date ? fmtDate(getdata.date) : "-",
    quoteValidity: freight?.quote_validity,
  },
  routing: {
    countryOfOrigin: getdata?.collection_from_name,
    placeOfReceipt: getdata?.port_of_loading,
    portOfLoading: getdata?.port_of_loading,
    portOfDischarge: getdata?.post_of_discharge,
    placeOfDelivery: getdata?.delivery_to_name,
    incoterm: getdata?.incoterm,
    modeOfTransport: getdata?.freight,
    freightNo: getdata?.freight_number,
  },
  freightDetails: {
    loadType: getdata?.fcl_lcl,
    transitPriority: getdata?.type,
    insurance: getdata?.insurance,
  },
});

const drawHeader = (doc, meta, pageWidth) => {
  let y = MARGIN;
  const contentW = pageWidth - MARGIN * 2;

  // Logo + company block --------------------------------------------------
  if (meta.logoImage?.dataUrl) {
    const targetH = 32;
    const ratio = meta.logoImage.width / meta.logoImage.height;
    const targetW = Math.min(120, targetH * ratio);
    doc.addImage(meta.logoImage.dataUrl, "PNG", MARGIN, y, targetW, targetH);
  }

  const rightX = MARGIN + contentW / 2;
  const rightW = contentW / 2;
  let ry = y + 2;
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(meta.company.name, rightX, ry + 8);
  doc.setDrawColor(...RED);
  const nameWidth = doc.getTextWidth(meta.company.name);
  doc.line(rightX, ry + 10.5, rightX + nameWidth, ry + 10.5);
  doc.setTextColor(...BLACK);
  ry += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const addrLines = [meta.company.companyName, meta.company.address].filter(Boolean);
  addrLines.forEach((line) => {
    doc.text(line, rightX, ry);
    ry += 10;
  });
  ry += 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.text("Registration No.:-", rightX, ry);
  doc.setFont("helvetica", "normal");
  doc.text(val(meta.company.registrationNo), rightX + doc.getTextWidth("Registration No.:- ") + 2, ry);
  ry += 10;
  doc.setFont("helvetica", "bold");
  doc.text("VAT No.:-", rightX, ry);
  doc.setFont("helvetica", "normal");
  doc.text(val(meta.company.vatNo), rightX + doc.getTextWidth("VAT No.:- ") + 2, ry);
  ry += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Importers code:-", rightX, ry);
  doc.setFont("helvetica", "normal");
  doc.text(val(meta.company.importersCode), rightX + doc.getTextWidth("Importers code:- ") + 2, ry);
  ry += 10;

  y = Math.max(y + 40, ry) + 6;

  // FREIGHT ESTIMATE title bar ---------------------------------------------
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1);
  doc.rect(MARGIN, y, contentW, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FREIGHT ESTIMATE", MARGIN + contentW / 2, y + 13.5, { align: "center" });
  y += 20;

  // Two-column info grid ----------------------------------------------------
  const colW = contentW / 2;
  const leftX = MARGIN;
  const rightColX = MARGIN + colW;

  const leftRows = [
    {
      type: "text",
      value: `${meta.client.name}${meta.client.address ? "\n" + meta.client.address : ""}`,
    },
    { type: "gap", height: 3 },
    { type: "bar", title: "Cargo Details ISO Commodity" },
    { type: "kv", label: "Commodity", value: meta.cargo.commodity },
    { type: "kv", label: "Hazardous", value: meta.cargo.hazardous },
    { type: "kv", label: "No. of Packages", value: meta.cargo.packages },
    { type: "kv", label: "Package Type", value: meta.cargo.packageType },
    { type: "kv", label: "Gross Weight (kgs)", value: meta.cargo.grossWeight },
    { type: "kv", label: "Dimensions (M3)", value: meta.cargo.dimensions },
    { type: "kv", label: "Volumetric (kgs)", value: meta.cargo.volumetric },
    { type: "kv", label: "Chargeable", value: meta.cargo.chargeable },
    { type: "gap", height: 3 },
    { type: "bar", title: "Rate of Exchange" },
    { type: "kv", label: "Base Currency", value: meta.rateOfExchange.baseCurrency },
    { type: "kv", label: "Payment Terms", value: meta.rateOfExchange.paymentTerms },
  ];

  const rightRows = [
    { type: "gap", height: 4 },
    { type: "kv", label: "Invoice For", value: meta.invoice.invoiceFor },
    { type: "kv", label: "Client Ref", value: meta.invoice.clientRef },
    { type: "kv", label: "Reference", value: meta.invoice.reference },
    { type: "kv", label: "Quote Date", value: meta.invoice.quoteDate },
    { type: "kv", label: "Quote Validity", value: meta.invoice.quoteValidity },
    { type: "gap", height: 3 },
    { type: "bar", title: "Routing Details" },
    { type: "kv", label: "Country of Origin", value: meta.routing.countryOfOrigin },
    { type: "kv", label: "Place of Receipt", value: meta.routing.placeOfReceipt },
    { type: "kv", label: "Port of Loading", value: meta.routing.portOfLoading },
    { type: "kv", label: "Port of Discharge", value: meta.routing.portOfDischarge },
    { type: "kv", label: "Place of Delivery", value: meta.routing.placeOfDelivery },
    { type: "kv", label: "Incoterm", value: meta.routing.incoterm },
    { type: "kv", label: "Mode of Transport", value: meta.routing.modeOfTransport },
    { type: "gap", height: 3 },
    { type: "bar", title: "Freight details" },
    { type: "kv", label: "Freight No", value: meta.routing.freightNo },

    { type: "kv", label: "Load type", value: meta.freightDetails.loadType },
    { type: "kv", label: "Transit Priority", value: meta.freightDetails.transitPriority },
    { type: "kv", label: "Insurance", value: meta.freightDetails.insurance },
  ];

  // Pre-measure so both boxes share one outer border height
  const measure = (rows, width) => {
    let h = 0;
    rows.forEach((row) => {
      if (row.type === "bar") h += 16;
      else if (row.type === "kv") h += row.opts?.rowH || 14;
      else if (row.type === "gap") h += row.height || 4;
      else if (row.type === "text") {
        const clone = new jsPDF({ orientation: "l", unit: "pt", format: "a4" });
        clone.setFont("helvetica", "bold");
        clone.setFontSize(9);
        const lines = clone.splitTextToSize(val(row.value), width - 8);
        h += 10 + lines.length * 10 + 4;
      }
    });
    return h;
  };

  const boxHeight = Math.max(measure(leftRows, colW), measure(rightRows, colW));

  drawInfoBox(doc, { x: leftX, y, width: colW, height: boxHeight, rows: leftRows });
  drawInfoBox(doc, { x: rightColX, y, width: colW, height: boxHeight, rows: rightRows });

  return y + boxHeight + 10;
};

// ---------------------------------------------------------------------------
// Quote table (jspdf-autotable)
// ---------------------------------------------------------------------------
const TOTAL_BORDER = { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 };

const buildTotalRowCells = (totalValues, visibleColumns, headers, label) => {
  const firstDataIdx = visibleColumns.findIndex(
    (headerIdx, vi) => vi > 0 && !isEmptyPdfCellText(totalValues[headerIdx]),
  );
  const span = firstDataIdx === -1 ? visibleColumns.length : firstDataIdx;

  const cells = [
    {
      content: label,
      colSpan: Math.max(span, 1),
      styles: {
        halign: "left",
        fontStyle: "bold",
        fillColor: LIGHT_HEAD,
        lineWidth: TOTAL_BORDER,
      },
    },
  ];

  for (let vi = Math.max(span, 1); vi < visibleColumns.length; vi += 1) {
    const headerIdx = visibleColumns[vi];
    const text = formatCellDisplayValue(totalValues[headerIdx], headers[headerIdx]);
    cells.push({
      content: text,
      styles: {
        fontStyle: "bold",
        halign: getColumnAlign(headers[headerIdx]),
        fillColor: LIGHT_HEAD,
        lineWidth: TOTAL_BORDER,
      },
    });
  }

  return cells;
};

// Raw "Total - X" label as it appears in the source table, Title Case
// (not upper-cased), matching the target layout.
const sectionTotalLabel = (section) =>
  (section.total?.[0] || `Total - ${section.title}`).replace(/\s+/g, " ").trim();

const drawQuoteTable = (doc, data, startY, pageWidth) => {
  const contentW = pageWidth - MARGIN * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text("QUOTE INFORMATION", MARGIN, startY + 8);
  const tableStartY = startY + 16;

  const sectionsWithValues = data.sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) => rowHasValues(row, data.headers)),
    }))
    .filter(
      (section) =>
        section.rows.length > 0 ||
        (section.total && rowHasValues(section.total, data.headers)),
    );

  if (!sectionsWithValues.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No charge rows with values to display.", MARGIN, tableStartY + 14);
    return;
  }

  const allVisibleColumns = getVisibleColumns(data.headers, sectionsWithValues, data.grandTotal);

  // "Comment" is pulled out of the grid and rendered as its own compact,
  // full-width row directly under the data row it belongs to, instead of
  // eating into horizontal space as a regular column.
  const commentIdx = data.headers.findIndex(
    (h) => (h ?? "").replace(/\s+/g, " ").trim().toLowerCase() === "comment",
  );
  const visibleColumns = allVisibleColumns.filter((idx) => idx !== commentIdx);

  const head = [visibleColumns.map((idx) => data.headers[idx])];

  const pushCommentRow = (row) => {
    if (commentIdx === -1) return;
    const raw = row[commentIdx];
    if (isEmptyPdfCellText(raw)) return;
    const text = String(raw ?? "").replace(/\s+/g, " ").trim();
    body.push([
      {
        content: `Comment: ${text}`,
        colSpan: visibleColumns.length,
        styles: {
          fontStyle: "italic",

          textColor: COMMENT_COLOR,
          fillColor: WHITE,
          halign: "left",
          cellPadding: { top: 1.5, bottom: 2.5, left: 6, right: 6 },
          lineWidth: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
        },
      },
    ]);
  };

  const body = [];
  sectionsWithValues.forEach((section) => {
    body.push([
      {
        content: section.title,
        colSpan: visibleColumns.length,
        styles: { fillColor: LIGHT_HEAD, textColor: BLACK, halign: "left", fontStyle: "bold" },
      },
    ]);

    section.rows.forEach((row) => {
      body.push(
        visibleColumns.map((headerIdx) => ({
          content: formatCellDisplayValue(row[headerIdx], data.headers[headerIdx]),
          styles: {
            halign: getColumnAlign(data.headers[headerIdx]),
            lineWidth: 0.5,
          },
        })),
      );
      pushCommentRow(row);
    });

    if (section.total && rowHasValues(section.total, data.headers)) {
      body.push(
        buildTotalRowCells(
          section.total,
          visibleColumns,
          data.headers,
          sectionTotalLabel(section),
        ),
      );
    }
  });

  if (data.grandTotal && rowHasValues(data.grandTotal, data.headers)) {
    body.push([
      {
        content: "QUOTE TOTAL ESTIMATION",
        colSpan: visibleColumns.length,
        styles: { fillColor: WHITE, textColor: BLACK, halign: "center", fontStyle: "bold" },
      },
    ]);
    body.push(
      buildTotalRowCells(
        data.grandTotal,
        visibleColumns,
        data.headers,
        "TOTAL CHARGE",
      ),
    );
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: contentW,
    head,
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      lineColor: BORDER,
      lineWidth: 0.5,
      textColor: BLACK,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontStyle: "bold",
      halign: "center",
      lineWidth: 0.5,
      lineColor: BORDER,
    },
    columnStyles: visibleColumns.reduce((acc, headerIdx, vi) => {
      acc[vi] = { halign: getColumnAlign(data.headers[headerIdx]) };
      return acc;
    }, {}),
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.row.raw.length === 1) {
        // full-width section title row already styled via cell styles above
      }
    },
  });
};

// ---------------------------------------------------------------------------
// Page numbers ("Page 1 of 2") footer, stamped after all content is drawn
// so the total page count is known.
// ---------------------------------------------------------------------------
const drawPageNumbers = (doc, pageWidth, pageHeight) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BLACK);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - MARGIN,
      pageHeight - 12,
      { align: "right" },
    );
  }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const exportEstimateAutoTablePdf = async (
  element,
  meta,
  filename = "shipping-estimate.pdf",
) => {
  if (!element) {
    throw new Error("PDF content is not ready.");
  }

  const rawQuoteData = extractQuoteDataFromRoot(element);
  if (!rawQuoteData) {
    throw new Error("Could not find the quote table to export.");
  }
  const quoteData = applyVatPercentOnlyToQuoteData(rawQuoteData);

  const logoImage = await loadImageAsDataUrl(meta?.logoSrc);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const tableStartY = drawHeader(doc, { ...meta, logoImage }, pageWidth);
  drawQuoteTable(doc, quoteData, tableStartY, pageWidth);

  const pageHeight = doc.internal.pageSize.getHeight();
  drawPageNumbers(doc, pageWidth, pageHeight);

  doc.save(filename);
};
