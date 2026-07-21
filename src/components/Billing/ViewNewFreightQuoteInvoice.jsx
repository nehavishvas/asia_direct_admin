import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../../Assests/logo.png";
import { exportEstimatePdf } from "../../utils/pdfExportUtils";
import { FaDownload } from "react-icons/fa";

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

// const DEFAULT_TERMS_AND_CONDITIONS = {
//   intro:
//     "All business is undertaken subject to our General Trading Conditions, a copy of which is available on request. (E&OE) Errors and Omissions Excepted.",
//   items: [
//     {
//       label: "Insurance",
//       text: "All goods are shipped at the customer's risk. If insurance is required, it must be arranged and paid for by the customer.",
//     },
//     {
//       label: "Weight and Dimensions",
//       text: "Changes in the actual weight, dimensions of the goods from the initial quote may affect the final pricing at billing. The customer will be notified of any price adjustments.",
//     },
//     {
//       label: "Misdeclaration of Goods",
//       text: "Any misdeclaration of goods will result in additional charges and potential legal consequences. Misdeclaration may include cargo description, costs, hazardous e.t.c.",
//     },
//     {
//       label: "Customs Duties & VAT",
//       text: "The customer is responsible for all customs duties and VAT applicable to their shipment.",
//     },
//     {
//       label: "Customs Stops & Inspections",
//       text: "Any costs incurred due to customs stops and inspections will be billed to the customer.",
//     },
//     {
//       label: "Late Collection & Storage Fees",
//       text: "Goods not collected within the agreed timeframe will incur storage fees. These fees are payable by the customer.",
//     },
//     {
//       label: "Late Payment of Invoices",
//       text: "Late payment of invoices will attract interest charges as per the company's policy.",
//     },
//     {
//       label: "Abandoned Cargo",
//       text: "Cargo not collected within 28 days will be regarded abandoned, the customer will be liable for any disposal costs and associated fees.",
//     },
//   ],
// };

export default function ViewNewFreightQuoteInvoice({ hiddenPrintItem, onPrintComplete }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [freight, setFreight] = useState({
    reference_no: "",
    customer_invoice_no: "",
    invoice_for_country: "",
    due_date: "",
    final_base_currency: "",
    chargable_rate: "",
    company_id: "",
    company_address: null,
    bank_details: null,
    created_at: "",
  });

  const [getdata, setGetdata] = useState({});
  // const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS_AND_CONDITIONS);


  // Dropdown Options state
  const [originDropdown, setOriginDropdown] = useState([]);
  const [freightDropdown, setFreightDropdown] = useState([]);
  const [transitDropdown, setTransitDropdown] = useState([]);
  const [destinationDropdown, setDestinationDropdown] = useState([]);
  const [adminDropdown, setAdminDropdown] = useState([]);
  const [customsDropdown, setCustomsDropdown] = useState([]);

  // Dynamic Rows state
  const [originRows, setOriginRows] = useState([]);
  const [freightRows, setFreightRows] = useState([]);
  const [transitRows, setTransitRows] = useState([]);
  const [destinationRows, setDestinationRows] = useState([]);
  const [adminRows, setAdminRows] = useState([]);
  const [customsRows, setCustomsRows] = useState([]);

  const viewItem = hiddenPrintItem || location.state?.item;
  const quoteInvoiceId =  viewItem?.quote_invoice_id || (typeof viewItem === "object" ? null : viewItem);
  const freightId = viewItem?.freight_id;

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (quoteInvoiceId) {
      fetchInvoiceData();
    }
  }, [quoteInvoiceId, freightId]);

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
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}getAdminFrieghtComponentList`,
          { params: { type: item.type } }
        );
        if (response.data && response.data.success) {
          item.setter(response.data.data || []);
        }
      } catch (error) {
        console.error(`Error fetching dropdown for ${item.type}:`, error);
      }
    }
  };

  const fetchInvoiceData = async () => {
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
              cost: c.cost !== null && c.cost !== undefined ? c.cost : "",
              unitType: c.unit_type || "Select",
              gp_percent: c.gp_percent !== null && c.gp_percent !== undefined ? c.gp_percent : "",
              sales_price: c.sales_price !== null && c.sales_price !== undefined ? c.sales_price : "",
              roe: c.roe !== null && c.roe !== undefined ? c.roe : "",
              vatTyp: c.vat_type !== null && c.vat_type !== undefined ? getVatLabel(c.vat_type) : "",
              vat: c.vat !== null && c.vat !== undefined ? c.vat : "",
              discPercent: c.disc_percent !== null && c.disc_percent !== undefined ? c.disc_percent : "",
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
          } else {
            initializeDefaultRows();
          }
        }
      } else {
        initializeDefaultRows();
      }
    } catch (error) {
      console.error("Error loading freight quote invoice details:", error);
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

  const handleclicknav = () => {
    navigate(-1);
  };

  const downloadPDF1 = async () => {
    const element = pdfRef.current;
    if (!element) return;
    try {
      await exportEstimatePdf(element, "CustomerInvoice.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const downloadPDF = () => {
    const allComponents = [];

    const mapRowToComponent = (row, calc) => ({
      ...(row.db_id && { id: row.db_id }),
      admin_frieght_component_id: row.admin_frieght_component_id || null,
      description: row.description || "",
      qty: cleanParseFloat(row.qty),
      currency: row.currency || "",
      cost: cleanParseFloat(row.cost),
      unit_type: row.unitType || "",
      unit: cleanParseFloat(calc.unit),
      total_cost: cleanParseFloat(calc.tCost),
      gp_percent: cleanParseFloat(row.gp_percent),
      sales_price: cleanParseFloat(calc.salesPrice),
      roe: cleanParseFloat(row.roe),
      final_amount: cleanParseFloat(calc.finalAmt),
      vat_type: row.vatTyp || "",
      disc_percent: cleanParseFloat(row.discPercent),
      discount: cleanParseFloat(calc.disc),
      exclusive: cleanParseFloat(calc.exclusive),
      vat: cleanParseFloat(calc.vat),
      vat_incl: cleanParseFloat(calc.inclusive),
      comment: row.comment || ""
    });

    originRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Origin Charges" });
      }
    });
    freightRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Freight Charges" });
      }
    });
    transitRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Transit Charges" });
      }
    });
    destinationRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Destination Charges" });
      }
    });
    adminRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Admin Charges" });
      }
    });
    customsRowsData.forEach(({ row, calc }) => {
      if (row.description) {
        allComponents.push({ ...mapRowToComponent(row, calc), name: "Customs Charges" });
      }
    });

    const currentFreightState = {
      ...freight,
      components: allComponents
    };

    navigate("/Admin/DownloadNewFreightQuoteInvoice", { state: { data: getdata, freight: currentFreightState } });
  };

  const isPrintingRef = useRef(false);

  useEffect(() => {
    if (getdata && Object.keys(getdata).length > 0 && (location.state?.autoPrint || hiddenPrintItem) && !isPrintingRef.current) {
      isPrintingRef.current = true;
      setTimeout(async () => {
        await downloadPDF1();
        if (onPrintComplete) {
          onPrintComplete();
        }
      }, 1500);
    }
  }, [getdata, location.state, hiddenPrintItem]);

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

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const formatMoney = (value) => safeNumber(value).toFixed(2);

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
  const totalChageswithOutExchange = originRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChangeRoeOrigin = originRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const freightRowsData = freightRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChageswithOutExchangeinsurance = freightRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChangeRoeOriginaftercalcuinsurance = freightRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const transitRowsData = transitRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChageswithOuTransit = transitRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const transitRoe = transitRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const destinationRowsData = destinationRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totalChaDestinationTransit = destinationRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChaDestinationTransitRoe = destinationRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const adminRowsData = adminRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const totaAdminransit = adminRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalAdminnsitRoe = adminRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const customsRowsData = customsRows.map((row) => ({
    row,
    calc: calculateRowData(row),
  }));
  const customsTotalTCost = customsRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const customsTotalFinalAmt = customsRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const sumofall =
    totaAdminransit +
    totalChaDestinationTransit +
    totalChageswithOuTransit +
    totalChageswithOutExchangeinsurance +
    totalChageswithOutExchange;

  const sumofRoe =
    totalAdminnsitRoe +
    totalChaDestinationTransitRoe +
    transitRoe +
    totalChangeRoeOriginaftercalcuinsurance +
    totalChangeRoeOrigin;

  const totalVatInclusive =
    originRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    freightRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    transitRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    destinationRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    adminRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    customsRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const renderRowsForSection = (rowsData, dropdownOptions, sectionTitle, totalTCost, totalFinalAmt) => {
    return (
      <>
        <tr className="estimate-section-row">
          <td colSpan={19}>
            <strong>
              {sectionTitle}
            </strong>
          </td>
        </tr>
        {rowsData.map(({ row, calc }) => (
          <tr key={row.id}>
            <td>
              <select
                className="supplier_form"
                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                disabled
              >
                <option value="">Select</option>
                <option value="Note">Note</option>
                {dropdownOptions.map((item) => (
                  <option
                    key={item.admin_frieght_component_id}
                    value={item.admin_frieght_component_id}
                  >
                    {item.code ? `${item.code} - ${item.description}` : item.description}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
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
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  paddingLeft: 5,
                  border: 0,
                }}
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
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
                type="text"
                className="supplier_form"
                disabled
                value={formatValue(row.cost, 2)}
                placeholder="0.00"
              />
            </td>
            <td>
              <select
                className="select_supplier"
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  paddingLeft: 5,
                  border: 0,
                }}
                disabled
                value={row.unitType || "Select"}
              >
                <option value="Select">Select</option>
                <option value="L/S">L/S</option>
                <option value="W/M">W/M</option>
              </select>
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
                type="text"
                className="supplier_form"
                disabled
                value={formatValue(calc.unit, 2)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
                disabled
                type="text"
                className="supplier_form"
                value={formatValue(calc.tCost)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
                type="text"
                className="supplier_form"
                disabled
                value={row.gp_percent || ""}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  fontWeight: 400,
                  border: "0px",
                  verticalAlign: "middle",
                }}
                disabled
                type="text"
                className="supplier_form"
                value={formatValue(calc.salesPrice)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  border: "0px",
                  verticalAlign: "middle",
                }}
                disabled
                value={formatValue(row.roe, 4)}
                className="supplier_form"
                placeholder="1.00"
              />
            </td>
            <td>
              <input
                style={{
                  marginBottom: 0,
                  fontSize: 13,
                  color: "black",
                  border: "0px",
                  verticalAlign: "middle",
                }}
                disabled
                value={formatValue(calc.finalAmt, 2)}
                placeholder="0.00"
                className="supplier_form"
              />
            </td>
            <td>
              <select
                disabled
                value={row.vatTyp || ""}
              >
                {VAT_OPTIONS.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
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
                value={formatValue(calc.disc)}
                className="supplier_form"
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
                value={
                  row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)"
                    ? formatValue(row.vat, 2)
                    : formatValue(calc.vat)
                }
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
            <td colSpan={2}>
              <input
                type="text"
                placeholder="Comment"
                disabled
                value={row.comment || ""}
                className="supplier_form"
              />
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={6}>
            <strong>Total - {sectionTitle}</strong>
          </td>
          <td colSpan={4}> {formatValue(totalTCost)} </td>
          <td> {formatValue(totalFinalAmt, 2)} </td>
          <td colSpan={8}></td>
        </tr>
      </>
    );
  };

  return (
    <>
      <div
        className="wpWrapper "
        style={
          hiddenPrintItem
            ? {
              position: "absolute",
              top: "-9999px",
              left: "-9999px",
              width: "max-content",
              minWidth: "1200px",
              zIndex: -1000,
            }
            : {}
        }
      >
        <div className="container-fluid">
          {!hiddenPrintItem && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <ArrowBackIcon onClick={handleclicknav} style={{ cursor: "pointer" }} />
                <h4 className="freight_hd mb-0">View Freight Invoice</h4>
              </div>
              <div className="d-flex gap-3 align-items-center blueText">
                <FaDownload onClick={downloadPDF1} style={{ cursor: "pointer" }} />
                <i className="fa fa-address-card ms-2" onClick={downloadPDF} style={{ cursor: "pointer" }} title="Customer Download"></i>
              </div>
            </div>
          )}

          <section ref={pdfRef} style={{ margin: 0, padding: 0 }}>
            <div
              style={{
                width: "100%",
                padding: "10px",
                outline: "auto",
                height: "auto",
                background: "#fff",
              }}
              className="pdf-page"
            >
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: "50%", paddingBottom: "10px" }}>
                      <div>
                        <img style={{ height: 55 }} src={logo} alt="logo" />
                      </div>
                    </td>
                    <td style={{ width: "50%", color: "#000", paddingBottom: "10px", textAlign: "left" }}>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          marginBottom: "unset",
                          borderBottom: "1px solid #cb191e",
                          display: "inline-block",
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
                          marginTop: 10,
                        }}
                      >
                        {freight.company_address?.company_name || ""}<br />
                        {freight.company_address?.address_line || ""}
                      </p>
                      <p style={{ fontSize: 13 }}>
                        <span><b>Registration No.:-</b> {freight.company_address?.company_registration_no || ""}</span> <br />
                        <span><b>VAT No.:-</b> {freight.company_address?.tax_vat_no || ""}</span> <br />
                        <span><b>Importers code:-</b></span>{freight.company_address?.postal_code || ""}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                style={{
                  border: "1px solid #1b2245",
                  padding: "10px 20px",
                  width: "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        background: "#1b2245",
                        textAlign: "center",
                        color: "white",
                        padding: "5px 0px",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      FREIGHT INVOICE
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                style={{
                  border: "1px solid #1b2245",
                  borderTop: "unset",
                  width: "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "50%",
                        borderRight: "1px solid #1a2142",
                        height: "100%",
                        verticalAlign: "top",
                      }}
                    >
                      <table>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                fontSize: 13,
                                padding: "5px 10px"
                              }}
                            >
                              <strong>
                                {getdata?.client_name || "-"}
                                <br />
                                {getdata?.address_1 || "-"}
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
                          padding: 2,
                        }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 13 }}>
                              Shipment Details ISO Commodity
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "10px" }}>
                              <div className="d-flex justify-content-between my-1">
                                <strong>No. of Packages</strong>
                                <span>{getdata?.no_of_packages || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Package Type</strong>
                                <span>{getdata?.package_type || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Weight</strong>
                                <span>{getdata?.weight || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>M3</strong>
                                <span>{getdata?.m3 || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Volumetric (kgs)</strong>
                                <span>{getdata?.volumetric_weight || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Chargeable</strong>
                                <span>{freight.chargable_rate || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Commodity</strong>
                                <span>{getdata?.commodity || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Hazardous</strong>
                                <span>{getdata?.hazardous || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Incoterm</strong>
                                <span>{getdata?.incoterm || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Freight</strong>
                                <span>{getdata?.freight || "-"}</span>
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
                              colSpan={2}
                            >
                              Rate of Exchange
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "10px" }} colSpan={2}>
                              <div className="d-flex justify-content-between">
                                <strong>Final Base Currency</strong>
                                <span>{freight.final_base_currency || "-"}</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td
                      style={{
                        width: "50%",
                        height: "100%",
                        verticalAlign: "top",
                      }}
                    >
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{
                              width: 170,
                              padding: "0px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Invoice For</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingRight: 10, textAlign: "right" }}>
                              {freight.invoice_for_country || "-"}
                            </td>
                          </tr>
                          {/* <tr>
                            <td style={{
                              width: 170,
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Due Date</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              {shipmentDate("due_date") || "-"}
                            </td>
                          </tr> */}
                          <tr>
                            <td style={{
                              width: 170,
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Invoice No.</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              {freight.customer_invoice_no || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{
                              width: 170,
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Reference</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              {freight.reference_no || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{
                              width: 170,
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Quote Date</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              {shipmentDate("quote_invoice_date", "date") || "-"}
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
                              Shipment Details
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0px 10px" }}>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Country of Origin</strong>
                                <span>{getdata?.country_of_origin || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Place of Receipt</strong>
                                <span>{getdata?.place_of_receipt || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Port of Loading</strong>
                                <span>{getdata?.port_of_loading || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Port of Discharge</strong>
                                <span>{getdata?.port_of_discharge || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Place of Delivery</strong>
                                <span>{getdata?.place_of_delivery || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Freight Collect Accepted</strong>
                                <span>{getdata?.freight_collect_accepted || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Date</strong>
                                <span>{shipmentDate("created_at") || "-"}</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

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
                          borderTop: "unset",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            paddingLeft: 5,
                          }}
                        >
                          SHIPMENT ESTIMATE
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
                      <th>Currency</th>
                      <th>Cost</th>
                      <th>Unit type</th>
                      <th>Unit</th>
                      <th>T/ Cost</th>
                      <th>GP%</th>
                      <th>Sales/ P</th>
                      <th>ROE</th>
                      <th>Total</th>
                      <th>Vat %</th>
                      <th>Disc %</th>
                      <th>Discount</th>
                      <th>Exclusive</th>
                      <th>VAT</th>
                      <th>Total</th>
                      <th colSpan={2}>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRowsForSection(originRowsData, originDropdown, "Origin Charges")}
                    {renderRowsForSection(freightRowsData, freightDropdown, "Freight Charges")}
                    {renderRowsForSection(transitRowsData, transitDropdown, "Transit Charges")}
                    {renderRowsForSection(destinationRowsData, destinationDropdown, "Destination Charges")}
                    {renderRowsForSection(adminRowsData, adminDropdown, "Admin Charges")}
                    {renderRowsForSection(customsRowsData, customsDropdown, "Customs Charges")}

                    <tr>
                      <td colSpan={6}>
                        <strong>Total - Charge</strong>
                      </td>
                      <td colSpan={4}> {formatValue(sumofall)} </td>
                      <td> {formatValue(sumofRoe, 2)} </td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td> {formatValue(totalVatInclusive)} </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms and Conditions & Banking Details */}
              {/* <table
                style={{
                  width: "100%",
                  marginTop: "20px",
                  borderCollapse: "collapse",
                }}
              >
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
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            paddingLeft: 5,
                          }}
                        >
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
              </table> */}

              {/* <div style={{ marginTop: 16, breakInside: "avoid", pageBreakInside: "avoid" }}>
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
              </div> */}
            </div>
          </section>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
