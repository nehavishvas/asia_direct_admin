import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDownloadForOffline } from "react-icons/md";
import logo from "../../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  { value: "Manual VAT (Capital Goods)", label: "Manual VAT (Capital Goods)" }
];

const cleanParseFloat = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatValue = (val, dec = 2, isPercent = false) => {
  if (val === null || val === undefined || val === "") {
    return isPercent ? "0.00 %" : "0.00";
  }
  const cleanVal = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(cleanVal);
  if (isNaN(num)) {
    return val;
  }
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
  return isPercent ? `${formatted} %` : formatted;
};

const getVatPercent = (vatTyp) => {
  if (!vatTyp) return 0;
  if (!isNaN(vatTyp) && !isNaN(parseFloat(vatTyp))) {
    return parseFloat(vatTyp);
  }
  const match = String(vatTyp).match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
};

const getVatLabel = (val) => {
  if (!val) return "";
  if (String(val) === "15") return "Standard Rate(15.00%)";
  if (String(val) === "100") return "Customs VAT(100.00%)";
  if (String(val) === "0") return "Zero Rate";
  return val;
};

const DEFAULT_TERMS_AND_CONDITIONS = {
  intro:
    "All business is undertaken subject to our General Trading Conditions, a copy of which is available on request. (E&OE) Errors and Omissions Excepted.",
  items: [
    {
      label: "Insurance",
      text: "All goods are shipped at the customer's risk. If insurance is required, it must be arranged and paid for by the customer.",
    },
    {
      label: "Weight and Dimensions",
      text: "Changes in the actual weight, dimensions of the goods from the initial quote may affect the final pricing at billing. The customer will be notified of any price adjustments.",
    },
    {
      label: "Misdeclaration of Goods",
      text: "Any misdeclaration of goods will result in additional charges and potential legal consequences. Misdeclaration may include cargo description, costs, hazardous e.t.c.",
    },
    {
      label: "Customs Duties & VAT",
      text: "The customer is responsible for all customs duties and VAT applicable to their shipment.",
    },
    {
      label: "Customs Stops & Inspections",
      text: "Any costs incurred due to customs stops and inspections will be billed to the customer.",
    },
    {
      label: "Late Collection & Storage Fees",
      text: "Goods not collected within the agreed timeframe will incur storage fees. These fees are payable by the customer.",
    },
    {
      label: "Late Payment of Invoices",
      text: "Late payment of invoices will attract interest charges as per the company's policy.",
    },
    {
      label: "Abandoned Cargo",
      text: "Cargo not collected within 28 days will be regarded abandoned, the customer will be liable for any disposal costs and associated fees.",
    },
  ],
};

export default function DownloadNewFreightQuoteInvoice() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [freight, setFreight] = useState(location?.state?.freight || {});
  const [getdata, setGetdata] = useState(location?.state?.data || {});
  const [termsAndConditions] = useState(DEFAULT_TERMS_AND_CONDITIONS);

  const [originRows, setOriginRows] = useState([]);
  const [freightRows, setFreightRows] = useState([]);
  const [transitRows, setTransitRows] = useState([]);
  const [destinationRows, setDestinationRows] = useState([]);
  const [adminRows, setAdminRows] = useState([]);
  const [customsRows, setCustomsRows] = useState([]);

  const quoteInvoiceId = location?.state?.data?.quote_invoice_id || localStorage.getItem("quote_invoice_id");
  const freightId = location?.state?.data?.freight_id || getdata?.freight_id || localStorage.getItem("freightid");

  useEffect(() => {
    if (location?.state?.data?.quote_invoice_id) {
      localStorage.setItem("quote_invoice_id", location.state.data.quote_invoice_id);
    }
    if (location?.state?.data?.freight_id) {
      localStorage.setItem("freightid", location.state.data.freight_id);
    }
  }, [location?.state]);

  useEffect(() => {
    if (location?.state?.freight) {
      const f = location.state.freight;
      setFreight(f);
      setGetdata(location.state.data || {});

      if (f.components && f.components.length > 0) {
        const mappedComponents = f.components.map((c) => ({
          id: c.id || Date.now() + Math.random(),
          db_id: c.id,
          admin_frieght_component_id: c.admin_frieght_component_id || "",
          description: c.description || c.component_description || "",
          qty: c.qty !== null && c.qty !== undefined ? c.qty : "",
          currency: c.currency || "Select",
          cost: c.cost !== null && c.cost !== undefined ? formatValue(c.cost, 2) : "",
          unitType: c.unit_type || "Select",
          gp_percent: c.gp_percent !== null && c.gp_percent !== undefined ? c.gp_percent : "",
          sales_price: c.sales_price !== null && c.sales_price !== undefined ? formatValue(c.sales_price, 2) : "",
          roe: c.roe !== null && c.roe !== undefined ? formatValue(c.roe, 4) : "",
          vatTyp: c.vat_type !== null && c.vat_type !== undefined ? getVatLabel(c.vat_type) : "",
          vat: c.vat !== null && c.vat !== undefined ? formatValue(c.vat, 2) : "",
          discPercent: c.disc_percent !== null && c.disc_percent !== undefined ? formatValue(c.disc_percent, 2, true) : "",
          comment: c.comment || "",
          name: c.name || c.section_name || ""
        }));

        const filterBySection = (name) => {
          return mappedComponents.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
        };

        setOriginRows(filterBySection("Origin Charges"));
        setFreightRows(filterBySection("Freight Charges"));
        setTransitRows(filterBySection("Transit Charges"));
        setDestinationRows(filterBySection("Destination Charges"));
        setAdminRows(filterBySection("Admin Charges"));
        setCustomsRows(filterBySection("Customs Charges"));
      }
      setLoading(false);
    } else {
      fetchInvoiceData();
    }
  }, [location?.state]);

  const fetchInvoiceData = async () => {
    if (!quoteInvoiceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetNewFreightQuoteInvoiceById`,
        {
          quote_invoice_id: parseInt(quoteInvoiceId),
          freight_id: (freightId && parseInt(freightId) !== 0) ? parseInt(freightId) : null
        }
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const invoiceData = Array.isArray(rawData)
          ? (rawData.find((item) => String(item.id || item.freight_quote_estimate_id || item.quote_invoice_id) === String(quoteInvoiceId)) || rawData[0])
          : rawData;
        if (invoiceData) {
          setFreight({
            reference_no: invoiceData.reference_no || "",
            customer_invoice_no: invoiceData.customer_invoice_no || "",
            invoice_for_country: invoiceData.invoice_for_country || "",
            due_date: invoiceData.due_date || invoiceData.date ? (invoiceData.due_date || invoiceData.date).split("T")[0] : "",
            final_base_currency: invoiceData.final_base_currency || "Select",
            chargable_rate: invoiceData.chargeable || "",
            company_id: invoiceData.company_id || "",
            company_address: invoiceData.company_address || null,
            bank_details: invoiceData.bank_details || null,
            created_at: invoiceData.created_at || "",
          });

          if (invoiceData.freight_id && parseInt(invoiceData.freight_id) !== 0) {
            apidataget(invoiceData.freight_id, invoiceData);
          } else {
            setGetdata(invoiceData);
          }

          const items = invoiceData.components || [];
          if (items.length > 0) {
            const mappedComponents = items.map((c) => ({
              id: c.id || Date.now() + Math.random(),
              db_id: c.id,
              admin_frieght_component_id: c.admin_frieght_component_id || "",
              description: c.description || c.component_description || "",
              qty: c.qty !== null && c.qty !== undefined ? c.qty : "",
              currency: c.currency || "Select",
              cost: c.cost !== null && c.cost !== undefined ? formatValue(c.cost, 2) : "",
              unitType: c.unit_type || "Select",
              gp_percent: c.gp_percent !== null && c.gp_percent !== undefined ? c.gp_percent : "",
              sales_price: c.sales_price !== null && c.sales_price !== undefined ? formatValue(c.sales_price, 2) : "",
              roe: c.roe !== null && c.roe !== undefined ? formatValue(c.roe, 4) : "",
              vatTyp: c.vat_type !== null && c.vat_type !== undefined ? getVatLabel(c.vat_type) : "",
              vat: c.vat !== null && c.vat !== undefined ? formatValue(c.vat, 2) : "",
              discPercent: c.disc_percent !== null && c.disc_percent !== undefined ? formatValue(c.disc_percent, 2, true) : "",
              comment: c.comment || "",
              name: c.name || c.section_name || ""
            }));

            const filterBySection = (name) => {
              return mappedComponents.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
            };

            setOriginRows(filterBySection("Origin Charges"));
            setFreightRows(filterBySection("Freight Charges"));
            setTransitRows(filterBySection("Transit Charges"));
            setDestinationRows(filterBySection("Destination Charges"));
            setAdminRows(filterBySection("Admin Charges"));
            setCustomsRows(filterBySection("Customs Charges"));
          }
        }
      }
    } catch (error) {
      console.error("Error loading freight quote invoice details:", error);
    } finally {
      setLoading(false);
    }
  };

  const apidataget = async (freightIdVal, initialInvoiceData = null) => {
    const payload = {
      freight_id: freightIdVal,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload
      );
      if (response.data && response.data.data && response.data.data[0]) {
        const freightObj = { ...response.data.data[0] };
        setGetdata(freightObj);
      } else {
        setGetdata(initialInvoiceData || {});
      }
    } catch (error) {
      console.error("Error loading freight details:", error);
      setGetdata(initialInvoiceData || {});
    }
  };

  const shipmentValue = (...keys) => {
    for (const key of keys) {
      const value = getdata?.[key] ?? freight?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  };

  const shipmentDate = (...keys) => {
    const value = shipmentValue(...keys);
    if (!value || value === "0000-00-00") return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB");
  };

  const resolveRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return 0;
    if (unitType === "L/S") return 1;
    if (unitType === "PCS") return cleanParseFloat(getdata?.no_of_packages) || 1;
    if (unitType === "CBM") return cleanParseFloat(getdata?.m3) || 1;
    if (unitType === "W/M") {
      const rate = cleanParseFloat(freight.chargable_rate);
      return rate;
    }
    return 1;
  };

  const calculateRowData = (row) => {
    const qty = cleanParseFloat(row.qty) || 0;
    const cost = cleanParseFloat(row.cost) || 0;
    const unit = resolveRowUnit(row.unitType);
    const tCost = (row.unitType && row.unitType !== "Select") ? cost * unit * qty : 0;
    const gpPercent = cleanParseFloat(row.gp_percent) || 0;
    let salesPrice = tCost;
    if (gpPercent > 0 && gpPercent < 100) {
      salesPrice = tCost / (1 - gpPercent / 100);
    }
    const roe = cleanParseFloat(row.roe) || 0;
    const finalAmt = salesPrice * roe;

    const discPercent = cleanParseFloat(row.discPercent) || 0;
    const vatPercent = getVatPercent(row.vatTyp);

    const disc = (finalAmt * discPercent) / 100;
    const exclusive = finalAmt - disc;
    let vat = (exclusive * vatPercent) / 100;
    if (row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") {
      vat = cleanParseFloat(row.vat) || 0;
    }
    const inclusive = exclusive + vat;

    return {
      unit,
      tCost,
      salesPrice,
      finalAmt,
      disc,
      exclusive,
      vat,
      inclusive,
    };
  };

  const originRowsData = originRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeOrigin = originRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalOriginDiscount = originRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalOriginExclusive = originRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalOriginVat = originRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalOriginInclusive = originRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const freightRowsData = freightRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeFreight = freightRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalFreightDiscount = freightRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalFreightExclusive = freightRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalFreightVat = freightRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalFreightInclusive = freightRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const transitRowsData = transitRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeTransit = transitRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalTransitDiscount = transitRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalTransitExclusive = transitRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalTransitVat = transitRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalTransitInclusive = transitRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const destinationRowsData = destinationRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeDestination = destinationRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalDestinationDiscount = destinationRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalDestinationExclusive = destinationRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalDestinationVat = destinationRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalDestinationInclusive = destinationRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const adminRowsData = adminRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeAdmin = adminRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalAdminDiscount = adminRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalAdminExclusive = adminRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalAdminVat = adminRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalAdminInclusive = adminRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const customsRowsData = customsRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChangeRoeCustoms = customsRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);
  const totalCustomsDiscount = customsRowsData.reduce((sum, item) => sum + item.calc.disc, 0);
  const totalCustomsExclusive = customsRowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
  const totalCustomsVat = customsRowsData.reduce((sum, item) => sum + item.calc.vat, 0);
  const totalCustomsInclusive = customsRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const grandTotalFinalAmt = totalChangeRoeOrigin + totalChangeRoeFreight + totalChangeRoeTransit + totalChangeRoeDestination + totalChangeRoeAdmin + totalChangeRoeCustoms;
  const grandTotalDiscount = totalOriginDiscount + totalFreightDiscount + totalTransitDiscount + totalDestinationDiscount + totalAdminDiscount + totalCustomsDiscount;
  const grandTotalExclusive = totalOriginExclusive + totalFreightExclusive + totalTransitExclusive + totalDestinationExclusive + totalAdminExclusive + totalCustomsExclusive;
  const grandTotalVat = totalOriginVat + totalFreightVat + totalTransitVat + totalDestinationVat + totalAdminVat + totalCustomsVat;

  const sumofall =
    originRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    freightRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    transitRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    destinationRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    adminRowsData.reduce((sum, item) => sum + item.calc.tCost, 0) +
    customsRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);

  const sumofRoe = grandTotalFinalAmt;
  const totalVatInclusive = grandTotalExclusive + grandTotalVat;

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

  const drawLabelValueRow = (doc, x, y, width, label, value) => {
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    const valStr = String(value ?? "");
    const labelStr = String(label ?? "");
    doc.setFont("helvetica", "normal");
    const valW = valStr ? doc.getTextWidth(valStr) : 0;
    const maxLabelW = width - valW - 3;
    doc.setFont("helvetica", "bold");
    const truncatedLabel = doc.splitTextToSize(labelStr, maxLabelW > 0 ? maxLabelW : width)[0] ?? "";
    doc.text(truncatedLabel, x, y);
    doc.setFont("helvetica", "normal");
    if (valStr) {
      doc.text(valStr, x + width, y, { align: "right" });
    }
  };

  const drawSectionBar = (doc, x, y, width, height, text) => {
    doc.setFillColor(27, 34, 69);
    doc.rect(x, y, width, height, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(text, x + width / 2, y + height / 2 + 1.2, { align: "center" });
    doc.setTextColor(20, 20, 20);
  };

  const buildSectionRows = (title, rowsData, totals) => {
    if (!rowsData || rowsData.length === 0) return [];

    const sectionStyle = { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20] };
    const totalStyle = { fillColor: [250, 250, 250], fontStyle: "bold", textColor: [20, 20, 20] };
    const styledCell = (content, styles) => ({ content: content ?? "", styles });

    const rows = [];

    rows.push([{ content: title, colSpan: 11, styles: sectionStyle }]);

    rowsData.forEach(({ row, calc }) => {
      const vatDisplay = formatValue(getVatPercent(row.vatTyp), 2, true);
      rows.push([
        row.description || "",
        row.qty || "",
        row.unitType && row.unitType !== "Select" ? row.unitType : "",
        row.unitType === "W/M" ? formatValue(calc.unit, 3) : formatValue(calc.unit, 2),
        formatValue(calc.salesPrice, 2),
        row.currency && row.currency !== "Select" ? row.currency : "",
        formatValue(row.roe, 4),
        vatDisplay,
        formatValue(row.discPercent, 2, true),
        formatValue(calc.exclusive),
        formatValue(calc.inclusive),
      ]);

      if (row.comment) {
        rows.push([
          {
            content: `Comment: ${row.comment}`,
            colSpan: 11,
            styles: { fontStyle: "italic", textColor: [100, 100, 100], cellPadding: 2 }
          }
        ]);
      }
    });

    rows.push([
      { content: `Total - ${title}`, colSpan: 7, styles: { ...totalStyle, halign: "left" } },
      styledCell("", totalStyle),
      styledCell("", totalStyle),
      styledCell(formatValue(totals.exclusive), totalStyle),
      styledCell(formatValue(totals.inclusive), totalStyle),
    ]);

    return rows;
  };

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 7;
      const contentWidth = pageWidth - margin * 2;
      const colSplitX = margin + contentWidth / 2;

      let cursorY = margin;
      const logoDataUrl = await loadImageAsDataUrl(logo);
      if (logoDataUrl) {
        try {
          const fmt = (logoDataUrl.split(";")[0].split("/")[1] || "PNG").toUpperCase();
          doc.addImage(logoDataUrl, fmt, margin, cursorY, 38, 17);
        } catch (err) {
          console.error("Could not embed logo image:", err);
        }
      }

      const companyX = margin + 120;
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
      const companyLines = [
        "Asia Direct - Africa (Pty) Ltd",
        "Unit 4, Gleneagles Office Park, 39 Koorsboom Ave, Glen Marais",
      ];
      let infoY = cursorY + 11;
      const maxWidth = 70;
      companyLines.forEach((line) => {
        doc.text(line, companyX, infoY, { maxWidth: maxWidth });
        const lineCount = doc.splitTextToSize(line, maxWidth).length;
        infoY += lineCount * 3.6;
      });

      doc.setFont("helvetica", "bold");
      doc.text("Registration No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(String(freight?.company_address?.company_registration_no || ""), companyX + 25, infoY);
      infoY += 3.6;

      doc.setFont("helvetica", "bold");
      doc.text("VAT No.:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(String(freight?.company_address?.tax_vat_no || ""), companyX + 14, infoY);
      infoY += 3.6;

      doc.setFont("helvetica", "bold");
      doc.text("Importers code:- ", companyX, infoY);
      doc.setFont("helvetica", "normal");
      doc.text(String(freight?.company_address?.postal_code || ""), companyX + 24, infoY);

      cursorY = margin + 30.5;

      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, cursorY, contentWidth, 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("FREIGHT INVOICE", pageWidth / 2, cursorY + 4.8, { align: "center" });
      cursorY += 7;

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
      let ly = boxTop + pad;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(String(getdata?.client_name || ""), margin + lPad, ly + 2.5);
      ly += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const addressLineHeight = 4;
      const addressLines = doc.splitTextToSize(String(getdata?.address_1 || ""), lW);
      addressLines.forEach((line, idx) => {
        doc.text(line, margin + lPad, ly + 2.5 + idx * addressLineHeight);
      });
      ly += addressLines.length * addressLineHeight + 1;

      drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Cargo Details ISO Commodity");
      ly += barH;

      const leftFields = [
        ["Commodity", getdata?.product_desc || getdata?.commodity || ""],
        ["Hazardous", getdata.hazardous?.toLowerCase() === "no" ? "No" : (getdata.hazard_type || getdata.hazardous || "")],
        ["No. of Packages", getdata?.no_of_packages || ""],
        ["Package Type", getdata?.package_type || ""],
        ["Gross Weight (kgs)", getdata?.weight || ""],
        ["Dimensions (M3)", getdata?.dimension || ""],
        ["Volumetric (kgs)", getdata?.volumetric_weight || ""],
        ["Chargeable", freight?.chargable_rate ? formatValue(freight?.chargable_rate, 3) : ""],
      ];
      leftFields.forEach(([label, value]) => {
        drawRow(doc, margin + lPad, ly, lW, label, value);
        ly += rowH;
      });

      drawSectionBar(doc, margin, ly, contentWidth / 2, barH, "Rate of Exchange");
      ly += barH + 2;

      drawRow(doc, margin + lPad, ly, lW, "Base Currency", freight?.final_base_currency || "");
      ly += rowH;
      drawRow(doc, margin + lPad, ly, lW, "Payment Terms", freight?.payment_terms || "");
      ly += rowH + pad;

      let ry = boxTop + pad - 0.7;
      const rightColX = colSplitX + lPad;

      const invoiceFields = [
        ["Invoice For", freight?.invoice_for_country || ""],
        ["Client Ref", freight?.customer_invoice_no || ""],
        ["Reference", freight?.reference_no || ""],
        ["Quote Date", shipmentDate("quote_invoice_date", "date")],
        ["Quote Validity", freight?.quote_validity || ""],
      ];
      invoiceFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });

      drawSectionBar(doc, colSplitX, ry + 2, contentWidth / 2, barH, "Routing Details");
      ry += barH + 4;

      const routingFields = [
        ["Country of Origin", getdata?.collection_from_country || getdata?.collection_from_name || ""],
        ["Place of Receipt", getdata?.port_of_loading || ""],
        ["Port of Loading", getdata?.port_of_loading || ""],
        ["Port of Discharge", getdata?.post_of_discharge || getdata?.port_of_discharge || ""],
        ["Place of Delivery", getdata?.delivery_to_name || getdata?.place_of_delivery || ""],
        ["Incoterm", getdata?.incoterm || ""],
        ["Mode of Transport", getdata?.freight || getdata?.mode_of_transport || ""],
        ["Freight No", getdata?.freight_number || ""],
      ];
      routingFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });

      drawSectionBar(doc, colSplitX, ry + 2, contentWidth / 2, barH, "Freight details");
      ry += barH + 4;

      const freightDetailsFields = [
        ["Load type", getdata?.fcl_lcl || ""],
        ["Transit Priority", getdata?.type || ""],
        ["Insurance", getdata?.insurance || ""],
      ];
      freightDetailsFields.forEach(([label, value]) => {
        drawRow(doc, rightColX, ry, rW, label, value);
        ry += rowH;
      });
      ry += pad;

      const leftBoxH = ly - boxTop;
      const rightBoxH = ry - boxTop;
      const outerBoxH = Math.max(leftBoxH, rightBoxH);

      doc.setDrawColor(27, 34, 69);
      doc.setLineWidth(0.5);
      doc.rect(margin, boxTop, contentWidth, outerBoxH);
      doc.line(colSplitX, boxTop, colSplitX, boxTop + outerBoxH);

      cursorY = boxTop + outerBoxH + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text("QUOTE INFORMATION", margin, cursorY);
      cursorY += 3;

      const tableBody = [
        ...buildSectionRows("Origin Charges", originRowsData, {
          finalAmt: totalChangeRoeOrigin, disc: totalOriginDiscount, exclusive: totalOriginExclusive, vat: totalOriginVat, inclusive: totalOriginInclusive,
        }),
        ...buildSectionRows("Freight Charges", freightRowsData, {
          finalAmt: totalChangeRoeFreight, disc: totalFreightDiscount, exclusive: totalFreightExclusive, vat: totalFreightVat, inclusive: totalFreightInclusive,
        }),
        ...buildSectionRows("Transit Charges", transitRowsData, {
          finalAmt: totalChangeRoeTransit, disc: totalTransitDiscount, exclusive: totalTransitExclusive, vat: totalTransitVat, inclusive: totalTransitInclusive,
        }),
        ...buildSectionRows("Destination Charges", destinationRowsData, {
          finalAmt: totalChangeRoeDestination, disc: totalDestinationDiscount, exclusive: totalDestinationExclusive, vat: totalDestinationVat, inclusive: totalDestinationInclusive,
        }),
        ...buildSectionRows("Admin Charges", adminRowsData, {
          finalAmt: totalChangeRoeAdmin, disc: totalAdminDiscount, exclusive: totalAdminExclusive, vat: totalAdminVat, inclusive: totalAdminInclusive,
        }),
        ...buildSectionRows("Customs Charges", customsRowsData, {
          finalAmt: totalChangeRoeCustoms, disc: totalCustomsDiscount, exclusive: totalCustomsExclusive, vat: totalCustomsVat, inclusive: totalCustomsInclusive,
        }),
        [
          { content: "GRAND TOTAL", colSpan: 9, styles: { fillColor: [240, 242, 245], fontStyle: "bold", halign: "left", textColor: [20, 20, 20], valign: "top" } },
          {
            content: `Subtotal:\nDiscount:\nExclusive:\nVAT:\nGrand Total:`,
            colSpan: 1,
            styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "left", textColor: [20, 20, 20], cellPadding: 2, lineWidth: 0 }
          },
          {
            content: `${formatValue(grandTotalFinalAmt)}\n${grandTotalDiscount > 0 ? `-${formatValue(grandTotalDiscount)}` : "0.00"}\n${formatValue(grandTotalExclusive)}\n${formatValue(grandTotalVat)}\n${formatValue(totalVatInclusive)}`,
            colSpan: 1,
            styles: { fillColor: [226, 232, 240], fontStyle: "bold", halign: "right", textColor: [20, 20, 20], cellPadding: 2, lineWidth: 0 }
          }
        ],
      ];

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin, top: margin, bottom: 14 },
        head: [["Description", "QTY", "UOM", "Unit", "Sales/ P", "Curr", "Exch Rate", "Vat %", "Disc %", "Exclusive", "Total"]],
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
        columnStyles: {
          9: { halign: "right" },
          10: { halign: "right" },
        },
        rowPageBreak: "avoid",
        showHead: "everyPage",
        didDrawCell: (data) => {
          if (data.row.raw && data.row.raw[0] && data.row.raw[0].content === "GRAND TOTAL") {
            const { x, y, width, height } = data.cell;
            doc.setDrawColor(28, 28, 28);
            doc.setLineWidth(0.1);
            if (data.column.index === 9) {
              doc.line(x, y, x + width, y);
              doc.line(x, y + height, x + width, y + height);
              doc.line(x, y, x, y + height);
            } else if (data.column.index === 10) {
              doc.line(x, y, x + width, y);
              doc.line(x, y + height, x + width, y + height);
              doc.line(x + width, y, x + width, y + height);
            }
          }
        },
      });

      const bottomLimit = pageHeight - 15;
      const boxWidth = pageWidth - margin * 2;
      const innerWidth = boxWidth - 6;
      const lineHeight = 3.6;

      const ensureSpace = (y, neededHeight) => {
        if (y + neededHeight > bottomLimit) {
          doc.addPage();
          return margin;
        }
        return y;
      };

      const layoutBoldLeadParagraph = (boldLead, text, maxWidth) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        const leadWidth = doc.getTextWidth(`${boldLead} `);
        doc.setFont("helvetica", "normal");
        const words = String(text ?? "").split(" ");
        let firstLine = "";
        let i = 0;
        const firstLineMaxWidth = maxWidth - leadWidth;
        while (i < words.length) {
          const candidate = firstLine ? `${firstLine} ${words[i]}` : words[i];
          if (!firstLine || doc.getTextWidth(candidate) <= firstLineMaxWidth) {
            firstLine = candidate;
            i++;
          } else break;
        }
        const restLines = i < words.length ? doc.splitTextToSize(words.slice(i).join(" "), maxWidth) : [];
        return { leadWidth, firstLine, restLines, height: (1 + restLines.length) * lineHeight };
      };

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const introWrapped = doc.splitTextToSize(termsAndConditions.intro, innerWidth);
      const introHeight = introWrapped.length * lineHeight;

      const itemLayouts = termsAndConditions.items.map((item, index) => ({
        boldLead: `${index + 1}. ${item.label}:`,
        layout: layoutBoldLeadParagraph(`${index + 1}. ${item.label}:`, item.text, innerWidth),
      }));
      const itemsHeight = itemLayouts.reduce((sum, { layout }) => sum + layout.height + 1.5, 0);

      const headerH = 7;
      const topPad = 4;
      const bottomPad = 3;
      const contentHeight = topPad + introHeight + 2 + itemsHeight + bottomPad;
      const boxHeight = headerH + contentHeight;

      let termsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : cursorY + 20;
      termsY = ensureSpace(termsY, boxHeight);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(margin, termsY, boxWidth, headerH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text("TERMS & CONDITIONS", margin + 3, termsY + headerH / 2 + 1.3);

      doc.rect(margin, termsY + headerH, boxWidth, contentHeight);

      let ty = termsY + headerH + topPad;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      introWrapped.forEach((line) => {
        doc.text(line, margin + 3, ty);
        ty += lineHeight;
      });
      ty += 2;

      itemLayouts.forEach(({ boldLead, layout }) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(20, 20, 20);
        doc.text(`${boldLead} `, margin + 3, ty);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(layout.firstLine, margin + 3 + layout.leadWidth, ty);
        let innerTy = ty + lineHeight;
        layout.restLines.forEach((line) => {
          doc.text(line, margin + 3, innerTy);
          innerTy += lineHeight;
        });
        ty += layout.height + 1.5;
      });

      let bankingStartY = termsY + boxHeight + 10;
      const bankingFields = [
        ["Account Name", freight?.bank_details?.account_name || ""],
        ["Bank Name", freight?.bank_details?.bank_name || ""],
        ["Branch Code", freight?.bank_details?.branch_code || ""],
        ["Account Number", freight?.bank_details?.account_no || ""],
        ["Swift Code", freight?.bank_details?.swift_code || ""],
      ];

      const noteText = freight?.bank_details?.note || "";
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      const noteLines = noteText ? doc.splitTextToSize(noteText, 80) : [];
      const bankingBlockH = 5 + bankingFields.length * 4.2 + 2 + (noteLines.length > 0 ? (noteLines.length * 3.5 + 2) : 0);

      bankingStartY = ensureSpace(bankingStartY, bankingBlockH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text("Banking Details", margin, bankingStartY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      bankingFields.forEach(([label, value], index) => {
        const fieldY = bankingStartY + 5 + index * 4.2;
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin + 2, fieldY);
        doc.setFont("helvetica", "normal");
        if (value) {
          doc.text(String(value), margin + 32, fieldY);
        }
      });

      if (noteLines.length > 0) {
        doc.setFont("helvetica", "italic");
        noteLines.forEach((line, index) => {
          doc.text(line, margin + 2, bankingStartY + 5 + bankingFields.length * 4.2 + 2 + index * 3.5);
        });
      }

      doc.save(`CustomerInvoice-${freight?.customer_invoice_no || "unnamed"}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleclicknav = () => {
    window.history.back();
  };

  const renderRowsForSection = (rowsData, sectionTitle) => {
    if (!rowsData || rowsData.length === 0) return null;
    const totalSectionExclusive = rowsData.reduce((sum, item) => sum + item.calc.exclusive, 0);
    const totalSectionInclusive = rowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);
    return (
      <>
        <tr className="estimate-section-row" style={{ backgroundColor: "#f0f2f5" }}>
          <td colSpan={11}>
            <strong>{sectionTitle}</strong>
          </td>
        </tr>
        {rowsData.map(({ row, calc }) => (
          <React.Fragment key={row.id}>
            <tr>
              <td>{row.description || ""}</td>
              <td>
                <input
                  style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                  type="text"
                  className="supplier_form"
                  disabled
                  value={row.qty || ""}
                  placeholder="0.00"
                />
              </td>
              <td>
                <select
                  className="select_supplier"
                  style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                  disabled
                  value={row.unitType || "Select"}
                >
                  <option value="Select">Select</option>
                  <option value="L/S">L/S</option>
                  <option value="W/M">W/M</option>
                  <option value="PCS">PCS</option>
                  <option value="CBM">CBM</option>
                </select>
              </td>
              <td>
                <input
                  style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                  type="text"
                  className="supplier_form"
                  disabled
                  value={row.unitType === "W/M" ? formatValue(calc.unit, 3) : formatValue(calc.unit, 2)}
                  placeholder="0.00"
                />
              </td>
              <td>
                <input
                  style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                  type="text"
                  className="supplier_form"
                  disabled
                  value={formatValue(calc.salesPrice, 2)}
                  placeholder="0.00"
                />
              </td>
              <td>
                <select
                  className="select_supplier"
                  style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                  disabled
                  value={row.currency || "Select"}
                >
                  <option value="Select">Select</option>
                  <option value="RAND">RAND</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EURO">EURO</option>
                </select>
              </td>
              <td>
                <input
                  style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                  disabled
                  value={formatValue(row.roe, 4)}
                  className="supplier_form"
                  placeholder="1.00"
                />
              </td>
              <td>
                <select
                  disabled
                  value={row.vatTyp || ""}
                  className="select_supplier"
                  style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                >
                  {VAT_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="0.00%"
                  disabled
                  className="supplier_form"
                  value={formatValue(row.discPercent, 2, true)}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="0.00"
                  disabled
                  value={formatValue(calc.exclusive)}
                  className="supplier_form"
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="0.00"
                  disabled
                  value={formatValue(calc.inclusive)}
                  className="supplier_form"
                />
              </td>
            </tr>
            {row.comment && (
              <tr className="comment-row">
                <td colSpan={11} style={{ textAlign: "left", fontSize: "12px", color: "#6c757d", fontStyle: "italic", padding: "4px 8px 4px 15px", borderTop: "none" }}>
                  Comment: {row.comment}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
        <tr style={{ fontWeight: "bold", backgroundColor: "#fafafa" }}>
          <td colSpan={7}>Total - {sectionTitle}</td>
          <td></td>
          <td></td>
          <td> {formatValue(totalSectionExclusive)} </td>
          <td> {formatValue(totalSectionInclusive)} </td>
        </tr>
      </>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h4>Loading Invoice details...</h4>
      </div>
    );
  }

  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <ArrowBackIcon onClick={handleclicknav} style={{ cursor: "pointer" }} />
              <h4 className="freight_hd mt-0 ms-3">Customer Invoice Download View</h4>
            </div>
            <MdDownloadForOffline
              onClick={downloadPDF}
              className="fs-2"
              style={{ color: "#1b2245", cursor: "pointer" }}
            />
          </div>

          <section ref={pdfRef} style={{ margin: 0, padding: 0 }}>
            <div
              style={{
                width: "100%",
                padding: "20px",
                outline: "auto",
                height: "auto",
                background: "#fff"
              }}
              className="pdf-page"
            >
              <div style={{ display: "block" }}>
                <table style={{ width: "100%", marginBottom: "20px" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "50%" }}>
                        <div>
                          <img style={{ height: 55 }} src={logo} alt="logo" />
                        </div>
                      </td>
                      <td style={{ width: "50%", color: "#000" }}>
                        <p
                          style={{
                            fontSize: 20,
                            fontWeight: 600,
                            marginBottom: "unset",
                            borderBottom: "1px solid #cb191e",
                            display: "inline-block",
                            paddingBottom: 5,
                          }}
                        >
                          Asia Direct - Africa
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: "unset",
                            lineHeight: "1.5",
                            marginTop: 2,
                          }}
                        >
                          {freight?.company_address?.company_name || ""}<br />
                          {freight?.company_address?.address_line || ""}
                        </p>
                        <p>
                          <span><b>Registration No.:-</b> {freight?.company_address?.company_registration_no || ""}</span><br />
                          <span><b>VAT No.:-</b> {freight?.company_address?.tax_vat_no || ""}</span><br />
                          <span><b>Importers code:-</b> {freight?.company_address?.postal_code || ""}</span>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table
                  style={{
                    border: "2px solid #1b2245",
                    padding: "10px 20px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          width: "100%",
                        }}
                      >
                        FREIGHT INVOICE
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    border: "2px solid #1b2245",
                    borderTop: "unset",
                    width: "100%",
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      width: "50%",
                      borderRight: "2px solid #1a2142",
                      boxSizing: "border-box",
                    }}
                  >
                    <table>
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 13, padding: "0px 6px" }}>
                            <strong>
                              {getdata?.client_name}
                              <br />
                              {getdata?.address_1}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      style={{
                        background: "#1b2245",
                        width: "100%",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        margin: "5px 0px",
                        padding: 2,
                      }}
                    >
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 13 }}>
                            Cargo Details ISO Commodity
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "0px 6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Commodity</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.product_desc || getdata?.commodity || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Hazardous</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata.hazardous?.toLowerCase() === "no" ? "No" : (getdata.hazard_type || getdata.hazardous || "-")}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>No. of Packages</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.no_of_packages || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Package Type</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>{getdata?.package_type || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Gross Weight (kgs)</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.weight || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Dimensions (M3)</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.dimension || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Volumetric (kgs)</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.volumetric_weight || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Chargeable</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{freight?.chargable_rate ? formatValue(freight?.chargable_rate, 3) : "-"}</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              background: "#1b2245",
                              color: "white",
                              fontSize: 13,
                              textAlign: "center",
                              padding: 2,
                            }}
                          >
                            Rate of Exchange
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "0px 6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Base Currency</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{freight?.final_base_currency || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Payment Terms</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{freight?.payment_terms || "-"}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ width: "50%", boxSizing: "border-box" }}>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: 170, padding: "0px 10px", fontSize: 13 }}><strong>Invoice For</strong></td>
                          <td style={{ fontSize: 13, paddingRight: 10, textAlign: "right" }}>{freight?.invoice_for_country || "-"}</td>
                        </tr>
                        <tr>
                          <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Client Ref</strong></td>
                          <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{freight?.customer_invoice_no || "-"}</td>
                        </tr>
                        <tr>
                          <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Reference</strong></td>
                          <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{freight?.reference_no || "-"}</td>
                        </tr>
                        <tr>
                          <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Quote Date</strong></td>
                          <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{shipmentDate("quote_invoice_date", "date") || "-"}</td>
                        </tr>
                        <tr>
                          <td style={{ width: 170, padding: "5px 10px 0px 10px", fontSize: 13 }}><strong>Quote Validity</strong></td>
                          <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>{freight?.quote_validity || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      style={{
                        background: "#1b2245",
                        width: "100%",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        margin: "5px 0px",
                        padding: 2,
                      }}
                    >
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 13 }}>Routing Details</td>
                        </tr>
                      </tbody>
                    </table>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "0px 6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Country of Origin</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.collection_from_country || getdata?.collection_from_name || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Place of Receipt</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.port_of_loading || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Port of Loading</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.port_of_loading || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Port of Discharge</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.post_of_discharge || getdata?.port_of_discharge || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Place of Delivery</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.delivery_to_name || getdata?.place_of_delivery || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Incoterm</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.incoterm || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Mode of Transport</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.freight || getdata?.mode_of_transport || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Freight No</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.freight_number || "-"}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      style={{
                        background: "#1b2245",
                        width: "100%",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        margin: "5px 0px",
                        padding: 2,
                      }}
                    >
                      <tbody>
                        <tr>
                          <td style={{ fontSize: 13 }}>Freight details</td>
                        </tr>
                      </tbody>
                    </table>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "0px 6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Load type</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>{getdata?.fcl_lcl || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Transit Priority</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>{getdata?.type || "-"}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}><strong>Insurance</strong></p>
                              <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>{getdata?.insurance || "-"}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0, borderRight: "1px solid black" }}>
                        <div
                          style={{
                            border: "1px solid black",
                            width: "33%",
                            borderBottom: "0px solid transparent",
                            height: 22,
                            borderTop: "unset"
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: "uppercase", paddingLeft: 5 }}>
                            SHIPMENT INVOICE
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="table-responsive">
                  <table className="cost-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>QTY</th>
                        <th>UOM</th>
                        <th>Unit</th>
                        <th>Sales/ P</th>
                        <th>Curr</th>
                        <th>Exch rate</th>
                        <th>Vat %</th>
                        <th>Disc %</th>
                        <th>Exclusive</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderRowsForSection(originRowsData, "Origin Charges")}
                      {renderRowsForSection(freightRowsData, "Freight Charges")}
                      {renderRowsForSection(transitRowsData, "Transit Charges")}
                      {renderRowsForSection(destinationRowsData, "Destination Charges")}
                      {renderRowsForSection(adminRowsData, "Admin Charges")}
                      {renderRowsForSection(customsRowsData, "Customs Charges")}

                      {/* Grand Total Row */}
                      <tr style={{ fontWeight: "bold", backgroundColor: "#e2e8f0", borderTop: "2px solid #475569" }}>
                        <td colSpan={9} style={{ textAlign: "left", fontWeight: "bold", verticalAlign: "top", paddingTop: "12px", color: "black" }}>
                          GRAND TOTAL
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top", color: "black", textAlign: "left", borderRight: "none" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                            <span style={{ fontWeight: "normal" }}>Subtotal:</span>
                            <span style={{ fontWeight: "normal" }}>Discount:</span>
                            <span style={{ fontWeight: "normal" }}>Exclusive:</span>
                            <span style={{ fontWeight: "normal" }}>Vat:</span>
                            <hr style={{ margin: "4px 0", borderTop: "1px solid #475569" }} />
                            <span style={{ fontWeight: "bold" }}>Grand Total:</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px", verticalAlign: "top", color: "black", textAlign: "right" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                            <span style={{ fontWeight: "normal" }}>{formatValue(grandTotalFinalAmt)}</span>
                            <span style={{ fontWeight: "normal" }}>-{formatValue(grandTotalDiscount)}</span>
                            <span style={{ fontWeight: "normal" }}>{formatValue(grandTotalExclusive)}</span>
                            <span style={{ fontWeight: "normal" }}>{formatValue(grandTotalVat)}</span>
                            <hr style={{ margin: "4px 0", borderTop: "1px solid #475569" }} />
                            <span style={{ fontWeight: "bold" }}>{formatValue(totalVatInclusive)}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Terms and Conditions & Banking Details */}
                <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td>
                        <div
                          style={{
                            border: "1px solid black",
                            width: "33%",
                            borderBottom: "0px solid transparent",
                            height: 22,
                            borderTop: "unset",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: "uppercase", paddingLeft: 5 }}>
                            TERMS & CONDITIONS
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid black", padding: "10px 12px", verticalAlign: "top" }}>
                        <div style={{ fontSize: 12, color: "#333", lineHeight: 1.6 }}>
                          <div style={{ marginBottom: 6 }}>{termsAndConditions.intro}</div>
                          {termsAndConditions.items.map((item, index) => (
                            <div key={index} style={{ marginBottom: 4 }}>
                              {index + 1}. <strong>{item.label}</strong>: {item.text}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ marginTop: 16, breakInside: "avoid", pageBreakInside: "avoid" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Banking Details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, maxWidth: 700 }}>
                    {[
                      ["Account Name", freight?.bank_details?.account_name],
                      ["Bank Name", freight?.bank_details?.bank_name],
                      ["Branch Code", freight?.bank_details?.branch_code],
                      ["Account Number", freight?.bank_details?.account_no],
                      ["Swift Code", freight?.bank_details?.swift_code],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
                        <div style={{ borderBottom: "1px solid #ccc", height: 18, fontSize: 12, fontWeight: 500 }}>
                          {value || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                  {freight?.bank_details?.note && (
                    <div style={{ marginTop: 12, fontSize: 12, color: "#666", whiteSpace: "pre-line", fontStyle: "italic", lineHeight: 1.5 }}>
                      {freight?.bank_details?.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
    </>
  );
}