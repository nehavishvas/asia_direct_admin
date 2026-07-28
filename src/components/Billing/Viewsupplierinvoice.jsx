import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../../Assests/logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── helpers ────────────────────────────────────────────────────────────────

const getVatPercent = (vatTyp) => {
  if (!vatTyp) return 0;
  if (!isNaN(vatTyp) && !isNaN(parseFloat(vatTyp))) return parseFloat(vatTyp);
  const match = String(vatTyp).match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : 0;
};

const getVatLabel = (val) => {
  if (!val) return "";
  if (String(val) === "15") return "Standard Rate(15.00%)";
  if (String(val) === "100") return "Customs VAT(100.00%)";
  if (String(val) === "0") return "Zero Rate";
  return val;
};

const VAT_OPTIONS = [
  { value: "", label: "No Vat" },
  { value: "Standard Rate(15.00%)", label: "Standard Rate(15.00%)" },
  { value: "Standard Rate (Capital Goods) (15.00%)", label: "Standard Rate (Capital Goods) (15.00%)" },
  { value: "Zero Rate", label: "Zero Rate" },
  { value: "Zero Rate Exports(0.00%)", label: "Zero Rate Exports(0.00%)" },
  { value: "Exempt and Non-Suppliers(0.00%)", label: "Exempt and Non-Suppliers(0.00%)" },
  { value: "Export of Second Hands Goods(15.00%)", label: "Export of Second Hands Goods(15.00%)" },
  { value: "Change in Use(15.00%)", label: "Change in Use(15.00%)" },
  { value: "Customs VAT(100.00%)", label: "Customs VAT(100.00%)" },
  { value: "Goods and Services Imported(100.00%)", label: "Goods and Services Imported(100.00%)" },
  { value: "Capital Goods and Imported(100.00%)", label: "Capital Goods and Imported(100.00%)" },
  { value: "VAT Adjustment (100.00%)", label: "VAT Adjustment (100.00%)" },
  { value: "Domestic Reverse Charge (15.00%)", label: "Domestic Reverse Charge (15.00%)" },
  { value: "Manual VAT", label: "Manual VAT" },
  { value: "Manual VAT (Capital Goods)", label: "Manual VAT (Capital Goods)" },
];

const safeNumber = (val) => { const n = Number(val); return isNaN(n) ? 0 : n; };
const fmt = (v) => safeNumber(v).toFixed(2);

// ─── component ──────────────────────────────────────────────────────────────

export default function Viewsupplierinvoice({ hiddenPrintItem, onPrintComplete }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [freight, setFreight] = useState({
    customer_invoice_no: "",
    invoice_for_country: "",
    due_date: "",
    final_base_currency: "Select",
    chargable_rate: "",
    company_id: "",
    company_address: null,
  });

  const [getdata, setGetdata] = useState({});

  const [originDropdown, setOriginDropdown] = useState([]);
  const [freightDropdown, setFreightDropdown] = useState([]);
  const [transitDropdown, setTransitDropdown] = useState([]);
  const [destinationDropdown, setDestinationDropdown] = useState([]);
  const [adminDropdown, setAdminDropdown] = useState([]);
  const [customsDropdown, setCustomsDropdown] = useState([]);

  const [originRows, setOriginRows] = useState([]);
  const [freightRows, setFreightRows] = useState([]);
  const [transitRows, setTransitRows] = useState([]);
  const [destinationRows, setDestinationRows] = useState([]);
  const [adminRows, setAdminRows] = useState([]);
  const [customsRows, setCustomsRows] = useState([]);

  const viewItem = hiddenPrintItem || location.state?.item;
  const supplierShipmentInvoiceId =
    viewItem?.supplier_shipment_invoice_id ||
    viewItem?.supplier_invoice_id ||
    (typeof viewItem === "object" ? null : viewItem);
  const shipmentId = viewItem?.shipment_id;

  useEffect(() => { fetchDropdowns(); }, []);

  useEffect(() => {
    if (supplierShipmentInvoiceId && shipmentId) fetchInvoiceData();
  }, [supplierShipmentInvoiceId, shipmentId]);

  // ── data fetching ──────────────────────────────────────────────────────────

  const fetchDropdowns = async () => {
    const chargeTypes = [
      { type: "Origin Charges", setter: setOriginDropdown },
      { type: "Freight Charges", setter: setFreightDropdown },
      { type: "Transit Charges", setter: setTransitDropdown },
      { type: "Destination Charges", setter: setDestinationDropdown },
      { type: "Admin Charges", setter: setAdminDropdown },
      { type: "Customs Charges", setter: setCustomsDropdown },
    ];
    for (const item of chargeTypes) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}getAdminFrieghtComponentList`,
          { params: { type: item.type } }
        );
        if (res.data?.success) item.setter(res.data.data || []);
      } catch (e) { console.error(`Dropdown error (${item.type}):`, e); }
    }
  };

  const fetchInvoiceData = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetSupplierShipmentInvoiceById`,
        {
          supplier_shipment_invoice_id: parseInt(supplierShipmentInvoiceId),
          shipment_id: parseInt(shipmentId),
        }
      );
      if (res.data?.success && res.data.data) {
        const inv = res.data.data;
        setFreight({
          reference_no: inv.reference_no || "",
          customer_invoice_no: inv.customer_invoice_no || "",
          invoice_for_country: inv.invoice_for_country || "",
          due_date: inv.due_date ? inv.due_date.split("T")[0] : "",
          final_base_currency: inv.final_base_currency || "Select",
          chargable_rate: inv.chargeable || "",
          company_id: inv.company_id || "",
          company_address: inv.company_address || null,
          created_at: inv.created_at || "",
        });

        if (inv.shipment_id) apidataget(inv.shipment_id, inv);

        const items = inv.components || [];
        if (items.length > 0) {
          const mapped = items.map((c) => ({
            id: c.id || Date.now() + Math.random(),
            db_id: c.id,
            admin_frieght_component_id: c.admin_frieght_component_id || "",
            description: c.description || c.component_description || "",
            qty: c.qty ?? "",
            currency: c.currency || "Select",
            cost: c.cost ?? "",
            unitType: c.unit_type === "L/S" ? "1" : c.unit_type === "W/M" ? "2" : "Select",
            gp_percent: c.gp_percent ?? "",
            sales_price: c.sales_price ?? "",
            roe: c.roe ?? "",
            vatTyp: c.vat_type != null ? getVatLabel(c.vat_type) : "",
            vat: c.vat ?? "",
            discPercent: c.disc_percent ?? "",
            comment: c.comment || "",
            name: c.name || c.section_name || "",
          }));
          const bySection = (n) =>
            mapped.filter((c) => c.name.toLowerCase().includes(n.toLowerCase()));
          setOriginRows(bySection("Origin Charges"));
          setFreightRows(bySection("Freight Charges"));
          setTransitRows(bySection("Transit Charges"));
          setDestinationRows(bySection("Destination Charges"));
          setAdminRows(bySection("Admin Charges"));
          setCustomsRows(bySection("Customs Charges"));
        } else {
          initializeDefaultRows();
        }
      } else {
        initializeDefaultRows();
      }
    } catch (e) {
      console.error("Error loading invoice:", e);
      initializeDefaultRows();
    }
  };

  const initializeDefaultRows = () => {
    setOriginRows([]);
    setFreightRows([]);
    setTransitRows([]);
    setDestinationRows([]);
    setAdminRows([]);
    setCustomsRows([]);
  };

  const apidataget = async (sid, initialInvoiceData = null) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetShipmentDetails`,
        { shipment_id: sid }
      );
      if (res.data?.shipment) {
        const s = { ...res.data.shipment };
        s.client_name =
          s.client_name ||
          initialInvoiceData?.client_name ||
          res.data.details?.[0]?.client_name || "";
        s.address_1 =
          s.address_1 ||
          initialInvoiceData?.address_1 ||
          res.data.details?.[0]?.address_1 || "";
        setGetdata(s);
      }
    } catch (e) { console.error("Error loading shipment:", e); }
  };

  // ── calculations ───────────────────────────────────────────────────────────

  const resolveRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return 0;
    if (String(unitType) === "1") return 1;
    const rate = parseFloat(freight.chargable_rate);
    return isNaN(rate) ? 0 : rate;
  };

  const calculateRowData = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const cost = parseFloat(row.cost) || 0;
    const unit = resolveRowUnit(row.unitType);
    const tCost = (row.unitType && row.unitType !== "Select") ? cost * unit * qty : 0;
    const gpPercent = parseFloat(row.gp_percent) || 0;
    let salesPrice = tCost;
    if (gpPercent > 0 && gpPercent < 100) salesPrice = tCost / (1 - gpPercent / 100);
    const roe = parseFloat(row.roe) || 0;
    const finalAmt = salesPrice * roe;
    const discPercent = parseFloat(row.discPercent) || 0;
    const vatPercent = getVatPercent(row.vatTyp);
    const disc = (finalAmt * discPercent) / 100;
    const exclusive = finalAmt - disc;
    let vat = (exclusive * vatPercent) / 100;
    if (row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") {
      vat = parseFloat(row.vat) || 0;
    }
    const inclusive = exclusive + vat;
    return { unit, tCost, salesPrice, finalAmt, disc, exclusive, vat, inclusive };
  };

  const withCalc = (rows) => rows.map((row) => ({ row, calc: calculateRowData(row) }));

  const originRowsData = withCalc(originRows);
  const freightRowsData = withCalc(freightRows);
  const transitRowsData = withCalc(transitRows);
  const destinationRowsData = withCalc(destinationRows);
  const adminRowsData = withCalc(adminRows);
  const customsRowsData = withCalc(customsRows);

  const sum = (arr, key) => arr.reduce((s, i) => s + i.calc[key], 0);

  const totalChageswithOutExchange = sum(originRowsData, "tCost");
  const totalChangeRoeOrigin = sum(originRowsData, "finalAmt");
  const totalChageswithOutExchangeinsurance = sum(freightRowsData, "tCost");
  const totalChangeRoeOriginaftercalcuinsurance = sum(freightRowsData, "finalAmt");
  const totalChageswithOuTransit = sum(transitRowsData, "tCost");
  const transitRoe = sum(transitRowsData, "finalAmt");
  const totalChaDestinationTransit = sum(destinationRowsData, "tCost");
  const totalChaDestinationTransitRoe = sum(destinationRowsData, "finalAmt");
  const totaAdminransit = sum(adminRowsData, "tCost");
  const totalAdminnsitRoe = sum(adminRowsData, "finalAmt");
  const customsTotalTCost = sum(customsRowsData, "tCost");
  const customsTotalFinalAmt = sum(customsRowsData, "finalAmt");

  const sumofall =
    totaAdminransit + totalChaDestinationTransit + totalChageswithOuTransit +
    totalChageswithOutExchangeinsurance + totalChageswithOutExchange;

  const sumofRoe =
    totalAdminnsitRoe + totalChaDestinationTransitRoe + transitRoe +
    totalChangeRoeOriginaftercalcuinsurance + totalChangeRoeOrigin;

  const totalVatInclusive =
    [...originRowsData, ...freightRowsData, ...transitRowsData,
    ...destinationRowsData, ...adminRowsData, ...customsRowsData]
      .reduce((s, i) => s + i.calc.inclusive, 0);

  // ── helpers ────────────────────────────────────────────────────────────────

  const shipmentValue = (...keys) => {
    for (const key of keys) {
      const v = getdata?.[key] ?? freight?.[key];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
  };

  const shipmentDate = (...keys) => {
    const v = shipmentValue(...keys);
    if (!v || v === "0000-00-00") return "";
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB");
  };

  // ── PDF helpers (same pattern as Downloadestimate.jsx) ─────────────────────

  const loadImageAsDataUrl = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Could not load logo for PDF:", err);
      return null;
    }
  };

  // Bold label left, plain value right-aligned within width
  const drawLabelValueRow = (doc, x, y, width, label, value) => {
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const valStr = String(value ?? "");
    const labelStr = String(label ?? "");
    doc.setFont("helvetica", "normal");
    const valW = valStr ? doc.getTextWidth(valStr) : 0;
    const maxLabelW = width - valW - 3;
    doc.setFont("helvetica", "bold");
    const truncated = doc.splitTextToSize(labelStr, maxLabelW > 0 ? maxLabelW : width)[0] ?? "";
    doc.text(truncated, x, y);
    doc.setFont("helvetica", "normal");
    if (valStr) doc.text(valStr, x + width, y, { align: "right" });
  };

  // Navy filled bar with centred white bold text
  const drawSectionBar = (doc, x, y, width, height, text) => {
    doc.setFillColor(27, 34, 69);
    doc.rect(x, y, width, height, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text, x + width / 2, y + height / 2 + 1.2, { align: "center" });
    doc.setTextColor(20, 20, 20);
  };

  // ── PDF export (jsPDF + autoTable, A4 landscape) ───────────────────────────

  const downloadPDF1 = async () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();   // 297 mm
      const pageHeight = doc.internal.pageSize.getHeight();  // 210 mm
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const colSplitX = margin + contentWidth / 2;

      // ── 1. LOGO + COMPANY INFO ───────────────────────────────────────────────
      let cursorY = margin;

      // Logo (loaded as base64 the same way as Downloadestimate.jsx)
      const logoDataUrl = await loadImageAsDataUrl(logo);
      if (logoDataUrl) {
        try {
          const imgFmt = (logoDataUrl.split(";")[0].split("/")[1] || "PNG").toUpperCase();
          doc.addImage(logoDataUrl, imgFmt, margin, cursorY, 38, 17);
        } catch (err) {
          console.error("Could not embed logo:", err);
        }
      }
      const companyX = margin + 150;
      const addr = freight.company_address;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text("Asia Direct - Africa", companyX, cursorY + 5);
      doc.setDrawColor(200, 40, 40);
      doc.setLineWidth(0.6);
      doc.line(companyX, cursorY + 6.5, companyX + 38, cursorY + 6.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      let infoY = cursorY + 11;
      const companyLines = [
        addr?.company_name || "",
        addr?.address_line || "",
      ].filter(Boolean);
      companyLines.forEach((line) => { doc.text(line, companyX, infoY); infoY += 3.6; });

      doc.setFont("helvetica", "bold");
      doc.text("Registration No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(addr?.company_registration_no || "", companyX + 28, infoY);
      infoY += 3.6;
      doc.setFont("helvetica", "bold");
      doc.text("VAT No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(addr?.tax_vat_no || "", companyX + 14, infoY);
      infoY += 3.6;
      doc.setFont("helvetica", "bold");
      doc.text("Importers code:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(addr?.postal_code || "", companyX + 24, infoY);

      cursorY = margin + 28;

      // ── 2. "SUPPLIER SHIPMENT INVOICE" title bar ────────────────────────────
      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, cursorY, contentWidth, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("SUPPLIER SHIPMENT INVOICE", pageWidth / 2, cursorY + 4.8, { align: "center" });
      cursorY += 7;
      // ── 3. TWO-COLUMN INFO BOX ───────────────────────────────────────────────
      const rowH = 4.5;
      const barH = 5.5;
      const pad = 3;
      const lPad = 3;
      const lW = contentWidth / 2 - lPad * 2;
      const rW = contentWidth / 2 - lPad * 2;
      const drawRow = (doc, x, rowTop, width, label, value) => {
        const baseline = rowTop + rowH * 0.68;
        drawLabelValueRow(doc, x, baseline, width, label, value);
      };

      const boxTop = cursorY;

      // ── LEFT COLUMN ──────────────────────────────────────────────────────────
      let ly = boxTop + pad;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(String(getdata?.client_name || ""), margin + lPad, ly + 2.5);
      ly += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(String(getdata?.address_1 || ""), margin + lPad, ly + 2.5, { maxWidth: lW });
      ly += 5;

      drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Shipment Details ISO Commodity");
      ly += barH;

      const leftFields = [
        ["Waybill", getdata?.waybill || ""],
        ["Carrier", getdata?.carrier || ""],
        ["Vessel", getdata?.vessel || ""],
        ["ETD", shipmentDate("ETD")],
        ["ATD", shipmentDate("ATD")],
        ["Chargeable", freight.chargable_rate || ""],
        ["Status", getdata?.status || ""],
        ["Origin Agent", getdata?.origin_agent || ""],
        ["Freight", getdata?.freight || ""],
        ["Final Base Currency", freight.final_base_currency || ""],
      ];
      leftFields.forEach(([label, value]) => {
        drawRow(doc, margin + lPad, ly, lW, label, value);
        ly += rowH;
      });
      ly += pad;

      // ── RIGHT COLUMN ─────────────────────────────────────────────────────────
      let ry = boxTop + pad - 0.7;
      const rightColX = colSplitX + lPad;

      const invoiceFields = [
        ["Invoice For", freight.invoice_for_country || ""],
        ["Invoice No.", freight.customer_invoice_no || ""],
        ["Reference", freight.reference_no || ""],
        ["Quote Date", shipmentDate("created_at", "date")],
        ["Due Date", freight.due_date || ""],
      ];
      invoiceFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });

      drawSectionBar(doc, colSplitX, ry, contentWidth / 2, barH, "Shipment Details");
      ry += barH + 2;

      const shipmentFields = [
        ["Port Of Loading", getdata?.port_of_loading || ""],
        ["Port Of Discharge", getdata?.port_of_discharge || ""],
        ["Destination Agent", getdata?.destination_agent || ""],
        ["Container", getdata?.container || ""],
        ["Load", getdata?.load || ""],
        ["Release Type", getdata?.release_type || ""],
        ["Origin Country Name", getdata?.origin_country_name || ""],
        ["Destination Country Name", getdata?.destination_country_name || ""],
      ];
      shipmentFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });
      ry += pad;

      // ── BORDERS drawn after content so heights are exact ─────────────────────
      const leftBoxH = ly - boxTop;
      const rightBoxH = ry - boxTop;
      const outerBoxH = Math.max(leftBoxH, rightBoxH);

      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, boxTop, contentWidth, outerBoxH);
      doc.line(colSplitX, boxTop, colSplitX, boxTop + outerBoxH);
      if (leftBoxH < outerBoxH)
        doc.line(margin, boxTop + leftBoxH, colSplitX, boxTop + leftBoxH);
      if (rightBoxH < outerBoxH)
        doc.line(colSplitX, boxTop + rightBoxH, margin + contentWidth, boxTop + rightBoxH);

      cursorY = boxTop + outerBoxH + 4;

      // ── 4. "SHIPMENT ESTIMATE" label ────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text("SHIPMENT ESTIMATE", margin, cursorY);
      cursorY += 3;

      // ── 5. CHARGES TABLE (autoTable – same style as Downloadestimate.jsx) ────

      const getPercentageOnly = (value) => {
        if (!value) return "";
        if (!isNaN(value) && !isNaN(parseFloat(value)))
          return parseFloat(value).toFixed(2);
        const match = String(value).match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]).toFixed(2) : "";
      };

      const formatValuePDF = (val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num === 0) return "-";
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      };

      const sectionStyle = { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] };
      const totalStyle = { fillColor: [250, 250, 250], fontStyle: "bold", textColor: [20, 20, 20] };
      const styledCell = (content, styles) => ({ content: content ?? "", styles });

      const buildSectionRows = (title, rowsData, totals) => {
        if (!rowsData || rowsData.length === 0) return [];
        const rows = [];

        // Section header row
        rows.push([{ content: title, colSpan: 17, styles: sectionStyle }]);

        rowsData.forEach(({ row, calc }) => {
          const uom = row.unitType === "1" ? "L/S" : row.unitType === "2" ? "W/M" : "";
          const unitVal = row.unitType === "1" ? "1" : (freight.chargable_rate || "");
          const vatPctStr = getPercentageOnly(row.vatTyp) ? `${getPercentageOnly(row.vatTyp)}%` : "";
          const vatDisplay = (row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")
            ? String(row.vat ?? "")
            : fmt(calc.vat);

          rows.push([
            row.description || "",
            row.qty !== "" ? String(row.qty) : "",
            row.currency && row.currency !== "Select" ? row.currency : "",
            row.cost !== "" ? String(row.cost) : "",
            uom,
            unitVal,
            fmt(calc.tCost),
            row.gp_percent !== "" ? String(row.gp_percent) : "",
            fmt(calc.salesPrice),
            row.roe !== "" ? String(row.roe) : "",
            isNaN(calc.finalAmt) ? "-" : calc.finalAmt.toFixed(2),
            vatPctStr,
            row.discPercent ? String(row.discPercent) : "",
            formatValuePDF(calc.disc),
            formatValuePDF(calc.exclusive),
            vatDisplay,
            fmt(calc.inclusive),
          ]);

          // Comment row beneath the item row (only when a comment exists)
          if (row.comment && String(row.comment).trim() !== "") {
            rows.push([
              {
                content: `Comment: ${row.comment}`,
                colSpan: 17,
                styles: {
                  fontStyle: "italic",
                  textColor: [90, 90, 90],
                  cellWidth: "auto",
                  overflow: "linebreak",
                  halign: "left",
                },
              },
            ]);
          }
        });

        // Section total row
        rows.push([
          { content: `Total - ${title}`, colSpan: 6, styles: { ...totalStyle, halign: "left" } },
          styledCell(fmt(totals.tCost), { ...totalStyle, halign: "right" }),
          styledCell("", totalStyle),
          styledCell("", totalStyle),
          styledCell(fmt(totals.finalAmt), { ...totalStyle, halign: "right" }),
          styledCell("", totalStyle),
          styledCell("", totalStyle),
          styledCell("", totalStyle),
          styledCell("", totalStyle),
          styledCell(formatValuePDF(totals.disc), { ...totalStyle, halign: "right" }),
          styledCell(formatValuePDF(totals.exclusive), { ...totalStyle, halign: "right" }),
          styledCell(formatValuePDF(totals.vat), { ...totalStyle, halign: "right" }),
        ]);

        return rows;
      };

      const tableBody = [
        ...buildSectionRows("Origin Charges", originRowsData, { tCost: totalChageswithOutExchange, finalAmt: totalChangeRoeOrigin, disc: originRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: originRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: originRowsData.reduce((s, i) => s + i.calc.vat, 0) }),
        ...buildSectionRows("Freight Charges", freightRowsData, { tCost: totalChageswithOutExchangeinsurance, finalAmt: totalChangeRoeOriginaftercalcuinsurance, disc: freightRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: freightRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: freightRowsData.reduce((s, i) => s + i.calc.vat, 0) }),
        ...buildSectionRows("Transit Charges", transitRowsData, { tCost: totalChageswithOuTransit, finalAmt: transitRoe, disc: transitRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: transitRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: transitRowsData.reduce((s, i) => s + i.calc.vat, 0) }),
        ...buildSectionRows("Destination Charges", destinationRowsData, { tCost: totalChaDestinationTransit, finalAmt: totalChaDestinationTransitRoe, disc: destinationRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: destinationRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: destinationRowsData.reduce((s, i) => s + i.calc.vat, 0) }),
        ...buildSectionRows("Admin Charges", adminRowsData, { tCost: totaAdminransit, finalAmt: totalAdminnsitRoe, disc: adminRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: adminRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: adminRowsData.reduce((s, i) => s + i.calc.vat, 0) }),
        ...buildSectionRows("Customs Charges", customsRowsData, { tCost: customsTotalTCost, finalAmt: customsTotalFinalAmt, disc: customsRowsData.reduce((s, i) => s + i.calc.disc, 0), exclusive: customsRowsData.reduce((s, i) => s + i.calc.exclusive, 0), vat: customsRowsData.reduce((s, i) => s + i.calc.vat, 0) }),

        // Grand total
        [
          { content: "GRAND TOTAL", colSpan: 10, styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] } },
          { content: fmt(sumofRoe), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right", textColor: [20, 20, 20] } },
          { content: "", styles: { fillColor: [226, 232, 240] } },
          { content: "", styles: { fillColor: [226, 232, 240] } },
          { content: formatValuePDF([...originRowsData, ...freightRowsData, ...transitRowsData, ...destinationRowsData, ...adminRowsData, ...customsRowsData].reduce((s, i) => s + i.calc.disc, 0)), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
          { content: formatValuePDF([...originRowsData, ...freightRowsData, ...transitRowsData, ...destinationRowsData, ...adminRowsData, ...customsRowsData].reduce((s, i) => s + i.calc.exclusive, 0)), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
          { content: formatValuePDF([...originRowsData, ...freightRowsData, ...transitRowsData, ...destinationRowsData, ...adminRowsData, ...customsRowsData].reduce((s, i) => s + i.calc.vat, 0)), styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right" } },
        ],
      ];

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin, top: margin, bottom: 14 },
        head: [[
          "Description", "QTY", "Currency", "Cost", "Unit Type", "Unit",
          "T/ Cost", "GP%", "Sales/ P", "ROE", "Final Amount",
          "VAT Type", "Disc %", "Discount", "Exclusive", "VAT", "VAT Incl",
        ]],
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: 1.6,
          valign: "middle",
          lineColor: [28, 28, 28],
          lineWidth: 0.1,
          textColor: [20, 20, 20],
        },
        headStyles: {
          fillColor: [27, 34, 69],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
          lineColor: [255, 255, 255],
        },

        rowPageBreak: "avoid",
        showHead: "everyPage",
        didDrawPage: (data) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - margin,
            pageHeight - 6,
            { align: "right" }
          );
        },
      });

      doc.save("SupplierInvoice.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  // ── auto-print support ─────────────────────────────────────────────────────

  const isPrintingRef = useRef(false);
  useEffect(() => {
    if (
      getdata && Object.keys(getdata).length > 0 &&
      (location.state?.autoPrint || hiddenPrintItem) &&
      !isPrintingRef.current
    ) {
      isPrintingRef.current = true;
      setTimeout(async () => {
        await downloadPDF1();
        if (onPrintComplete) onPrintComplete();
      }, 1500);
    }
  }, [getdata, location.state, hiddenPrintItem]);

  // ── navigation ─────────────────────────────────────────────────────────────

  const handleclicknav = () => navigate(-1);

  // ── render helpers ─────────────────────────────────────────────────────────

  const resolveRowUnitDisplay = (row) =>
    row.unitType === "1" ? "1" : freight.chargable_rate || "";

  const renderRowsForSection = (rowsData, dropdownOptions, sectionTitle, totalTCost, totalFinalAmt) => {
    if (!rowsData || rowsData.length === 0) return null;
    return (
      <>
      <tr className="estimate-section-row">
        <td colSpan={17}><strong>{sectionTitle}</strong></td>
      </tr>
      {rowsData.map(({ row, calc }) => (
        <React.Fragment key={row.id}>
          <tr>
            <td>
              <select className="supplier_form" value={row.admin_frieght_component_id || ""} disabled>
                <option value="">Select</option>
                <option value="Note">Note</option>
                {dropdownOptions.map((item) => (
                  <option key={item.admin_frieght_component_id} value={item.admin_frieght_component_id}>
                    {item.code ? `${item.code} - ${item.description}` : item.description}
                  </option>
                ))}
              </select>
            </td>
            <td><input className="supplier_form" type="text" disabled value={row.qty || ""} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td>
              <select className="select_supplier" disabled value={row.currency || "Select"} style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                <option value="Select">Select</option>
                <option value="RAND">RAND</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EURO">EURO</option>
              </select>
            </td>
            <td><input className="supplier_form" type="text" disabled value={row.cost || ""} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td>
              <select className="select_supplier" disabled value={row.unitType || "Select"} style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}>
                <option value="Select">Select</option>
                <option value="1">L/S</option>
                <option value="2">W/M</option>
              </select>
            </td>
            <td><input className="supplier_form" type="text" disabled value={resolveRowUnitDisplay(row)} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td><input className="supplier_form" type="text" disabled value={fmt(calc.tCost)} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td><input className="supplier_form" type="text" disabled value={row.gp_percent || ""} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td><input className="supplier_form" type="text" disabled value={fmt(calc.salesPrice)} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td><input className="supplier_form" disabled value={row.roe || ""} placeholder="1.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td><input className="supplier_form" disabled value={fmt(calc.finalAmt)} placeholder="0.00" style={{ marginBottom: 0, fontSize: 13, border: "0px" }} /></td>
            <td>
              <select disabled value={row.vatTyp || ""}>
                {VAT_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </td>
            <td><input type="text" placeholder="0.00" disabled className="supplier_form" value={row.discPercent || ""} /></td>
            <td><input type="text" placeholder="0.00" disabled value={fmt(calc.disc)} className="supplier_form" /></td>
            <td><input type="text" placeholder="0.00" disabled value={fmt(calc.exclusive)} className="supplier_form" /></td>
            <td>
              <input
                type="text" placeholder="0.00" disabled className="supplier_form"
                value={
                  row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)"
                    ? row.vat ?? ""
                    : fmt(calc.vat)
                }
              />
            </td>
            <td><input type="text" placeholder="0.00" disabled value={fmt(calc.inclusive)} className="supplier_form" /></td>
          </tr>
          {row.comment && String(row.comment).trim() !== "" && (
            <tr>
              <td colSpan={17} style={{ width: "100%" }}>
                <div
                  className="supplier_form"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    padding: "4px 6px",
                  }}
                >
                  {`Comment: ${row.comment}`}
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
      <tr>
        <td colSpan={6}><strong>Total - {sectionTitle}</strong></td>
        <td colSpan={4}>{fmt(totalTCost)}</td>
        <td>{fmt(totalFinalAmt)}</td>
        <td colSpan={6}></td>
      </tr>
    </>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="wpWrapper"
        style={
          hiddenPrintItem
            ? { position: "absolute", top: "-9999px", left: "-9999px", width: "max-content", minWidth: "1200px", zIndex: -1000 }
            : {}
        }
      >
        <div className="container-fluid">
          {!hiddenPrintItem && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <ArrowBackIcon onClick={handleclicknav} style={{ cursor: "pointer" }} />
                <h4 className="freight_hd mb-0">View Supplier Shipment Invoice</h4>
              </div>
              <div className="d-flex gap-3 align-items-center blueText">
                <i onClick={downloadPDF1} className="fa fa-download" style={{ cursor: "pointer" }} aria-hidden="true" />
              </div>
            </div>
          )}

          <section style={{ margin: 0, padding: 0 }}>
            <div style={{ width: "100%", padding: "10px", outline: "auto", height: "auto", background: "#fff" }} className="pdf-page">
              {/* ── logo / company header ── */}
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", paddingBottom: "10px" }}>
                      <img style={{ height: 55 }} src={logo} alt="logo" />
                    </td>
                    <td style={{ width: "50%", color: "#000", paddingBottom: "10px", textAlign: "left" }}>
                      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: "unset", borderBottom: "1px solid #cb191e", display: "inline-block" }}>
                        Asia Direct - Africa
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: "unset", lineHeight: "1.5", marginTop: 10 }}>
                        {freight.company_address?.company_name || ""}<br />
                        {freight.company_address?.address_line || ""}
                      </p>
                      <p style={{ fontSize: 13 }}>
                        <span><b>Registration No.:-</b> {freight.company_address?.company_registration_no || ""}</span><br />
                        <span><b>VAT No.:-</b> {freight.company_address?.tax_vat_no || ""}</span><br />
                        <span><b>Importers code:-</b></span>{freight.company_address?.postal_code || ""}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ── invoice header block ── */}
              <table style={{ border: "1px solid #1b2245", padding: "10px 20px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ background: "#1b2245", textAlign: "center", color: "white", padding: "5px 0px", fontSize: 13, fontWeight: 700 }}>
                      SUPPLIER SHIPMENT INVOICE
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "50%", borderRight: "2px solid #1a2142", verticalAlign: "top" }}>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 13, padding: "5px" }}>
                              <strong>{getdata?.client_name}<br />{getdata?.address_1}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ background: "#1b2245", width: "100%", color: "white", fontSize: 13, textAlign: "center", padding: 2 }}>
                        <tbody><tr><td>Shipment Details ISO Commodity</td></tr></tbody>
                      </table>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0px 10px" }}>
                              {[
                                ["Waybill", getdata?.waybill],
                                ["Carrier", getdata?.carrier],
                                ["Vessel", getdata?.vessel],
                                ["ETD", shipmentDate("ETD")],
                                ["ATD", shipmentDate("ATD")],
                                ["Chargeable", freight.chargable_rate],
                                ["Status", getdata?.status],
                                ["Origin Agent", getdata?.origin_agent],
                                ["Freight", getdata?.freight],
                                ["Final Base Currency", freight.final_base_currency],
                              ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                  <p style={{ fontSize: 13, marginBottom: "unset" }}><strong>{label}</strong></p>
                                  <p style={{ fontSize: 13, marginBottom: "unset" }}>{value || ""}</p>
                                </div>
                              ))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td style={{ width: "50%", verticalAlign: "top" }}>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ width: 170, padding: "0px 10px", fontSize: 13 }}><strong>Invoice For</strong></td>
                            <td style={{ fontSize: 13, paddingRight: 10, textAlign: "right" }}>
                              <select name="invoice_for_country" value={freight.invoice_for_country || ""} disabled style={{ width: "50%", padding: "2px", border: "1px solid #ccc" }}>
                                <option value="">Select Country</option>
                                <option value="South Africa">South Africa</option>
                                <option value="Zambia">Zambia</option>
                                <option value="Zimbabwe">Zimbabwe</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Invoice No.</strong></td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              <input type="text" name="customer_invoice_no" value={freight.customer_invoice_no || ""} disabled style={{ width: "50%", padding: "2px", border: "1px solid #ccc" }} />
                            </td>
                          </tr>
                          <tr>
                            <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Reference</strong></td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{freight.reference_no || ""}</td>
                          </tr>
                          <tr>
                            <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Quote Date</strong></td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{shipmentDate("created_at", "date")}</td>
                          </tr>
                          <tr>
                            <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Due Date</strong></td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              <input type="date" name="due_date" value={freight.due_date || ""} disabled style={{ width: "50%", padding: "2px", border: "1px solid #ccc" }} />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ background: "#1b2245", width: "100%", color: "white", fontSize: 13, textAlign: "center", margin: "5px 0px", padding: 2 }}>
                        <tbody><tr><td>Shipment Details</td></tr></tbody>
                      </table>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0px 10px" }}>
                              {[
                                ["Port Of Loading", getdata?.port_of_loading],
                                ["Port Of Discharge", getdata?.port_of_discharge],
                                ["Destination Agent", getdata?.destination_agent],
                                ["Container", getdata?.container],
                                ["Load", getdata?.load],
                                ["Release Type", getdata?.release_type],
                                ["Origin Country Name", getdata?.origin_country_name],
                                ["Destination Country Name", getdata?.destination_country_name],
                              ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                  <p style={{ fontSize: 13, marginBottom: "unset" }}><strong>{label}</strong></p>
                                  <p style={{ fontSize: 13, marginBottom: "unset" }}>{value || ""}</p>
                                </div>
                              ))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ── estimate banner ── */}
              <table style={{ background: "#1b2245", width: "100%", color: "white", fontSize: 13, textAlign: "center", margin: "5px 0px", padding: 2 }}>
                <tbody><tr><td>SHIPMENT ESTIMATE</td></tr></tbody>
              </table>

              {/* ── cost table ── */}
              <div className="table-responsive">
                <table className="cost-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Description</th><th>QTY</th><th>Currency</th><th>Cost</th>
                      <th>Unit type</th><th>Unit</th><th>T/ Cost</th><th>GP%</th>
                      <th>Sales/ P</th><th>ROE</th><th>Final Amount</th><th>VAT Type</th>
                      <th>Disc %</th><th>Discount</th><th>Exclusive</th><th>VAT</th>
                      <th>VAT Incl</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRowsForSection(originRowsData, originDropdown, "Origin Charges", totalChageswithOutExchange, totalChangeRoeOrigin)}
                    {renderRowsForSection(freightRowsData, freightDropdown, "Freight Charges", totalChageswithOutExchangeinsurance, totalChangeRoeOriginaftercalcuinsurance)}
                    {renderRowsForSection(transitRowsData, transitDropdown, "Transit Charges", totalChageswithOuTransit, transitRoe)}
                    {renderRowsForSection(destinationRowsData, destinationDropdown, "Destination Charges", totalChaDestinationTransit, totalChaDestinationTransitRoe)}
                    {renderRowsForSection(adminRowsData, adminDropdown, "Admin Charges", totaAdminransit, totalAdminnsitRoe)}
                    {renderRowsForSection(customsRowsData, customsDropdown, "Customs Charges", customsTotalTCost, customsTotalFinalAmt)}
                    <tr>
                      <td colSpan={6}><strong>Total - Charge</strong></td>
                      <td colSpan={4}>{fmt(sumofall)}</td>
                      <td>{fmt(sumofRoe)}</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td>{fmt(totalVatInclusive)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
