import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { MdDownloadForOffline } from "react-icons/md";
import { usePDF } from "react-to-pdf";
import logo from "../../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { RiFolderUserFill } from "react-icons/ri";
import { MdArrowOutward } from "react-icons/md";
import { useRef } from "react";
import { exportEstimatePdf } from "../../utils/pdfExportUtils";
import {
  exportEstimateAutoTablePdf,
  buildEstimateMeta,
} from "../../utils/pdfAutoTableExport";

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
  { value: "Standard Rate(15.00%)", label: "Standard Rate (15.00 %)" },
  { value: "Standard Rate (Capital Goods) (15.00%)", label: "Standard Rate (Capital Goods) (15.00 %)" },
  { value: "Zero Rate", label: "Zero Rate (0.00 %)" },
  { value: "Zero Rate Exports(0.00%)", label: "Zero Rate Exports (0.00 %)" },
  { value: "Exempt and Non-Suppliers(0.00%)", label: "Exempt and Non-Suppliers (0.00 %)" },
  { value: "Export of Second Hands Goods(15.00%)", label: "Export of Second Hands Goods (15.00 %)" },
  { value: "Change in Use(15.00%)", label: "Change in Use (15.00 %)" },
  { value: "Customs VAT(100.00%)", label: "Customs VAT (100.00 %)" },
  { value: "Goods and Services Imported(100.00%)", label: "Goods and Services Imported (100.00 %)" },
  { value: "Capital Goods and Imported(100.00%)", label: "Capital Goods and Imported (100.00 %)" },
  { value: "VAT Adjustment (100.00%)", label: "VAT Adjustment (100.00 %)" },
  { value: "Domestic Reverse Charge (15.00%)", label: "Domestic Reverse Charge (15.00 %)" },
  { value: "Manual VAT", label: "Manual VAT" },
  { value: "Manual VAT (Capital Goods)", label: "Manual VAT (Capital Goods)" }
];

const cleanParseFloat = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNumber = (value, dec = 2, isPercent = false) => {
  if (value === null || value === undefined || value === "") {
    return isPercent ? "0.00 %" : "0.00";
  }
  const cleanVal = String(value).replace(/,/g, '').replace(/%/g, '').trim();
  const num = parseFloat(cleanVal);
  if (isNaN(num)) {
    return value;
  }
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
  return isPercent ? `${formatted} %` : formatted;
};

export default function ShippingEstimate() {
  const [update, setUpdate] = useState([0]);
  const location = useLocation();
  const [freight, setFreight] = useState({});
  const [origin, setOrigin] = useState([0]);
  const [showData, setShowData] = useState(true);
  const [quotationID, setQuotationID] = useState("");
  const pdfRef = useRef();
  const isPdfGenerating = useRef(false);
  const isEstimateLoaded = useRef(false);
  const hasInitialized = useRef(false);
  const isFreightLoadedFromApi = useRef(false);
  const [client, setClient] = useState([]);
  const [suppluierquot, setSuppluierquot] = useState([]);
  const [supplierdata, setSupplierdata] = useState([]);
  const [getdata, setGetdata] = useState(location?.state?.data[0] || []);
  const [dat, setDat] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [selected, setSelected] = useState([]); // selected IDs
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Dynamic Rows for each section
  const [originRows, setOriginRows] = useState([]);
  const [freightRows, setFreightRows] = useState([]);
  const [transitRows, setTransitRows] = useState([]);
  const [destinationRows, setDestinationRows] = useState([]);
  const [adminRows, setAdminRows] = useState([]);
  const [customsRows, setCustomsRows] = useState([]);

  const [originDropdown, setOriginDropdown] = useState([]);
  const [freightDropdown, setFreightDropdown] = useState([]);
  const [transitDropdown, setTransitDropdown] = useState([]);
  const [destinationDropdown, setDestinationDropdown] = useState([]);
  const [adminDropdown, setAdminDropdown] = useState([]);
  const [customsDropdown, setCustomsDropdown] = useState([]);

  useEffect(() => {
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
          console.error(`Error fetching dynamic dropdown list for ${item.type}:`, error);
        }
      }
    };

    fetchDropdowns();
  }, []);

  const getdata122 = location?.state?.data[0];
  console.log(getdata122);
  useEffect(() => {
    getFreightDataById();
    getFreightQuoteEstimate();
  }, []);

  const user = JSON.parse(localStorage.getItem("data123"));
  const localFreigtId = localStorage.getItem("freightid");
  console.log("Stored:", localStorage.getItem("freightid"));

  const getFreightDataById = async () => {
    const payload = {
      freight_id: localFreigtId,
    };
    console.log(payload, "payload");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload,
      );
      if (response?.data?.data?.length > 0) {
        setGetdata(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching freight data by id:", error);
    }
  };

  const getFreightQuoteEstimate = async () => {
    const payload = {};
    if (getdata122?.freight_quote_estimate_id) {
      payload.freight_quote_estimate_id = parseInt(getdata122.freight_quote_estimate_id);
    }
    const fId = getdata122?.freight_id;
    if (fId) {
      payload.freight_id = parseInt(fId);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetFreightQuoteEstimateById`,
        payload
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const estimateData = Array.isArray(rawData) ? rawData[0] : rawData;
        isFreightLoadedFromApi.current = true;

        if (!estimateData) return;

        // Update freight metadata
        setFreight(prev => ({
          ...prev,
          ...estimateData,
          supplier_id: estimateData.supplier_id || prev?.supplier_id || "",
          customer_invoice_no: estimateData.customer_invoice_no || prev?.customer_invoice_no || "",
          invoice_for_country: estimateData.invoice_for_country || prev?.invoice_for_country || "",
          final_base_currency: estimateData.final_base_currency || prev?.final_base_currency || "Select",
          chargable_rate: estimateData.chargeable ?? prev?.chargable_rate ?? "",
          company_id: estimateData.company_id || estimateData.company_address?.id || prev?.company_id || "",
          company_country: estimateData.company_address?.country || prev?.company_country || "",
          quote_validity: estimateData.quote_validity || prev?.quote_validity || "",
          payment_terms: estimateData.payment_terms || prev?.payment_terms || "",
        }));

        if (estimateData.components && estimateData.components.length > 0) {
          isEstimateLoaded.current = true;
          const mappedComponents = estimateData.components.map(c => ({
            id: c.id,
            db_id: c.id,
            admin_frieght_component_id: c.admin_frieght_component_id,
            description: c.description || c.component_description || "",
            qty: c.qty !== null && c.qty !== undefined ? c.qty : "",
            currency: c.currency || "Select",
            cost: c.cost !== null && c.cost !== undefined ? c.cost : "",
            unitType: c.unit_type === "L/S" ? "1" : (c.unit_type === "W/M" ? "2" : "Select"),
            gp_percent: c.gp_percent !== null && c.gp_percent !== undefined ? c.gp_percent : "",
            sales_price: c.sales_price !== null && c.sales_price !== undefined ? c.sales_price : "",
            roe: c.roe !== null && c.roe !== undefined ? c.roe : "",
            vatTyp: c.vat_type !== null && c.vat_type !== undefined ? getVatLabel(c.vat_type) : "",
            vat: c.vat !== null && c.vat !== undefined ? c.vat : "",
            discPercent: c.disc_percent !== null && c.disc_percent !== undefined ? c.disc_percent : "",
            comment: c.comment || ""
          }));

          const origin = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Origin Charges";
          });
          const freightC = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Freight Charges";
          });
          const transit = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Transit Charges";
          });
          const dest = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Destination Charges";
          });
          const admin = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Admin Charges";
          });
          const customs = mappedComponents.filter(c => {
            const orig = estimateData.components.find(x => x.id === c.db_id);
            return orig && orig.name === "Customs Charges";
          });

          if (origin.length > 0) setOriginRows(origin);
          if (freightC.length > 0) setFreightRows(freightC);
          if (transit.length > 0) setTransitRows(transit);
          if (dest.length > 0) setDestinationRows(dest);
          if (admin.length > 0) setAdminRows(admin);
          if (customs.length > 0) setCustomsRows(customs);
        }
      }
    } catch (error) {
      console.error("Error fetching freight quote estimate by id:", error);
    }
  };

  const andlemodaloen = () => {
    setOpenmodal(true);
  };

  const handlechangecalc = (e) => {
    const { name, value } = e.target;
    setFreight((prevInputData) => ({
      ...prevInputData,
      [name]: value,
    }));
  };

  const handleInvoiceForChange = async (e) => {
    const selectedCountry = e.target.value;
    setFreight((prev) => ({
      ...prev,
      invoice_for_country: selectedCountry,
    }));

    if (!selectedCountry) {
      setFreight((prev) => ({
        ...prev,
        company_id: "",
        company_address: null,
      }));
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}company-addresses`,
        { params: { country: selectedCountry } }
      );
      if (response.data && response.data.success && response.data.data) {
        const addressList = response.data.data;
        const address = Array.isArray(addressList) ? addressList[0] : addressList;
        if (address) {
          setFreight((prev) => ({
            ...prev,
            company_id: address.id,
            company_address: address,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching company address for invoice_for:", error);
      toast.error("Failed to load company address details");
    }
  };

  const freight_amount = freight?.origin_pick_up_entey * freight?.origin_pick_up_Unit;
  const num1 = parseFloat(freight_amount || 0);
  const num2 = parseFloat(freight.freight_gp || 0);
  const num3 = num1 / (1 - num2 / 100);
  const finalval = isNaN(num3) ? 0 : num3.toFixed(2);
  const finalvalflo = parseFloat(finalval);
  console.log(freight_amount)
  console.log(num1)
  console.log(num2)
  console.log(num3)
  console.log(finalval)

  const isUnitTypeSelected = (unitType) =>
    Boolean(unitType && unitType !== "Select");

  const resolveChargeUnit = (unitType) => {
    if (!isUnitTypeSelected(unitType)) return 0;
    if (String(unitType) === "1") return 1;
    const rate = parseFloat(freight.chargable_rate);
    return Number.isNaN(rate) ? 0 : rate;
  };

  const displayChargeUnit = (unitType) => {
    if (!isUnitTypeSelected(unitType)) return "";
    if (String(unitType) === "1") return 1;
    return freight.chargable_rate ?? "";
  };

  const resolveRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return 0;
    if (String(unitType) === "1") return 1;
    const rate = cleanParseFloat(freight?.chargable_rate);
    return rate;
  };

  const displayRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return "";
    if (String(unitType) === "1") return "1.000";
    return formatNumber(freight?.chargable_rate, 3);
  };

  const calculateRowData = (row) => {
    const qty = cleanParseFloat(row?.qty);
    const cost = cleanParseFloat(row?.cost);
    const unit = resolveRowUnit(row?.unitType);
    const tCost = (row?.unitType && row?.unitType !== "Select") ? (cost * unit * qty) : 0;
    const gpPercent = cleanParseFloat(row?.gp_percent);
    let salesPrice = tCost;
    if (gpPercent > 0 && gpPercent < 100) {
      salesPrice = tCost / (1 - gpPercent / 100);
    }
    const roe = cleanParseFloat(row?.roe);
    const finalAmt = salesPrice * roe;

    const discPercent = cleanParseFloat(row?.discPercent);
    const vatPercent = getVatPercent(row?.vatTyp);

    const disc = (finalAmt * discPercent) / 100;
    const exclusive = finalAmt - disc;
    let vat = (exclusive * vatPercent) / 100;
    if (row?.vatTyp === "Manual VAT" || row?.vatTyp === "Manual VAT (Capital Goods)") {
      vat = cleanParseFloat(row?.vat);
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
      inclusive
    };
  };

  const updateRowField = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleBlur = (setter, id, field, value, dec = 2, isPercent = false) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: formatNumber(value, dec, isPercent) } : row
      )
    );
  };

  const handleFocus = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
            ...row,
            [field]: String(value || "")
              .replace(/,/g, "")
              .replace(/%/g, "")
              .trim(),
          }
          : row
      )
    );
  };

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const calculateInvoiceBreakup = (amount, discountPercent, vatPercent) => {
    const baseAmount = safeNumber(amount);
    const discountAmount = (baseAmount * safeNumber(discountPercent)) / 100;
    const exclusiveAmount = baseAmount - discountAmount;
    const parsedVat = getVatPercent(vatPercent);
    const vatAmount = (exclusiveAmount * parsedVat) / 100;
    const inclusiveAmount = exclusiveAmount + vatAmount;

    return {
      disc: discountAmount,
      exclusive: exclusiveAmount,
      vat: vatAmount,
      inclusive: inclusiveAmount,
    };
  };

  const formatMoney = (value) => formatNumber(value, 2);

  const renderRow = (row, calc, setter, dropdown, allRows) => {
    return (
      <tr key={row.id}>
        <td>
          <select
            className="supplier_form"
            value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
            onChange={(e) =>
              handleDropdownChange(setter, dropdown, row.id, e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="Note">Note</option>
            {dropdown.map((item) => {
              const isAlreadySelected = allRows.some(
                (r) => r.admin_frieght_component_id === item.admin_frieght_component_id && r.id !== row.id
              );
              return (
                <option
                  key={item.admin_frieght_component_id}
                  value={item.admin_frieght_component_id}
                  disabled={isAlreadySelected}
                >
                  {item.code ? `${item.code} - ${item.description}` : item.description}
                </option>
              );
            })}
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
            onChange={(e) => updateRowField(setter, row.id, "qty", e.target.value)}
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
            onChange={(e) => updateRowField(setter, row.id, "currency", e.target.value)}
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
            onKeyPress={handlepresss}
            onChange={(e) => updateRowField(setter, row.id, "cost", e.target.value)}
            onBlur={(e) => handleBlur(setter, row.id, "cost", e.target.value, 2)}
            onFocus={(e) => handleFocus(setter, row.id, "cost", row.cost || "")}
            value={row.cost || ""}
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
            onChange={(e) => updateRowField(setter, row.id, "unitType", e.target.value)}
            value={row.unitType || "Select"}
          >
            <option value="Select">Select</option>
            <option value="1">L/S</option>
            <option value="2">W/M</option>
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
            value={displayRowUnit(row.unitType)}
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
            value={formatNumber(calc.tCost, 2)}
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
            onChange={(e) => updateRowField(setter, row.id, "gp_percent", e.target.value)}
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
            value={formatNumber(calc.salesPrice, 2)}
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
            onChange={(e) => updateRowField(setter, row.id, "roe", e.target.value)}
            onBlur={(e) => handleBlur(setter, row.id, "roe", e.target.value, 4)}
            onFocus={(e) => handleFocus(setter, row.id, "roe", row.roe || "")}
            value={row.roe || ""}
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
            value={formatNumber(calc.finalAmt, 2)}
            placeholder="0.00"
            className="supplier_form"
          />
        </td>
        <td>
          <select
            onChange={(e) => updateRowField(setter, row.id, "vatTyp", e.target.value)}
            value={row.vatTyp || ""}
          >
            {VAT_OPTIONS.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="text"
            placeholder="0.00"
            onChange={(e) => updateRowField(setter, row.id, "discPercent", e.target.value)}
            onBlur={(e) => handleBlur(setter, row.id, "discPercent", e.target.value, 2, true)}
            onFocus={(e) => handleFocus(setter, row.id, "discPercent", row.discPercent || "")}
            className="supplier_form"
            value={row.discPercent || ""}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="0.00"
            disabled
            value={formatNumber(calc.disc, 2)}
            className="supplier_form"
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="0.00"
            disabled
            value={formatNumber(calc.exclusive, 2)}
            className="supplier_form"
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="0.00"
            disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
            value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : formatNumber(calc.vat, 2)}
            onChange={(e) => updateRowField(setter, row.id, "vat", e.target.value)}
            onBlur={(e) => handleBlur(setter, row.id, "vat", e.target.value, 2)}
            onFocus={(e) => handleFocus(setter, row.id, "vat", row.vat || "")}
            className="supplier_form"
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="0.00"
            disabled
            value={formatNumber(calc.inclusive, 2)}
            className="supplier_form"
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="Comment"
            onChange={(e) => updateRowField(setter, row.id, "comment", e.target.value)}
            value={row.comment || ""}
            className="supplier_form"
          />
        </td>
        <td>
          <i
            className="fa fa-trash text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => deleteRow(setter, row.id)}
          />
        </td>
      </tr>
    );
  };

  const originRowsData = originRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChageswithOutExchange = originRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChangeRoeOrigin = originRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const freightRowsData = freightRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChageswithOutExchangeinsurance = freightRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChangeRoeOriginaftercalcuinsurance = freightRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const transitRowsData = transitRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChageswithOuTransit = transitRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const transitRoe = transitRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const destinationRowsData = destinationRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totalChaDestinationTransit = destinationRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalChaDestinationTransitRoe = destinationRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const adminRowsData = adminRows.map(row => ({
    row,
    calc: calculateRowData(row)
  }));
  const totaAdminransit = adminRowsData.reduce((sum, item) => sum + item.calc.tCost, 0);
  const totalAdminnsitRoe = adminRowsData.reduce((sum, item) => sum + item.calc.finalAmt, 0);

  const customsRowsData = customsRows.map(row => ({
    row,
    calc: calculateRowData(row)
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

  const firstOrigin = originRows[0] || {};
  const firstOriginCalc = calculateRowData(firstOrigin);
  const firstFreight = freightRows[0] || {};
  const firstFreightCalc = calculateRowData(firstFreight);
  const firstTransit = transitRows[0] || {};
  const firstTransitCalc = calculateRowData(firstTransit);
  const firstDestination = destinationRows[0] || {};
  const firstDestinationCalc = calculateRowData(firstDestination);
  const firstAdmin = adminRows[0] || {};
  const firstAdminCalc = calculateRowData(firstAdmin);
  const firstCustoms = customsRows[0] || {};
  const firstCustomsCalc = calculateRowData(firstCustoms);

  const invoiceBreakups = {
    org_pickUp: calculateInvoiceBreakup(firstOriginCalc.finalAmt, firstOrigin.discPercent || 0, firstOrigin.vatTyp || ""),
    origin_fuelSur: calculateInvoiceBreakup(0, 0, ""),
    origin_cfs: calculateInvoiceBreakup(0, 0, ""),
    org_docFee: calculateInvoiceBreakup(0, 0, ""),
    org_forwFee: calculateInvoiceBreakup(0, 0, ""),
    org_clearance: calculateInvoiceBreakup(0, 0, ""),
    ocenfreight_charge: calculateInvoiceBreakup(firstFreightCalc.finalAmt, firstFreight.discPercent || 0, firstFreight.vatTyp || ""),
    insurance: calculateInvoiceBreakup(0, 0, ""),
    trans_clear_fees: calculateInvoiceBreakup(firstTransitCalc.finalAmt, firstTransit.discPercent || 0, firstTransit.vatTyp || ""),
    trans_THC_levy: calculateInvoiceBreakup(0, 0, ""),
    trans_unpack_charg: calculateInvoiceBreakup(0, 0, ""),
    trans_CFS_charg: calculateInvoiceBreakup(0, 0, ""),
    trans_admin_charg: calculateInvoiceBreakup(0, 0, ""),
    trans_portCargo: calculateInvoiceBreakup(0, 0, ""),
    trans_adv_loadHouse: calculateInvoiceBreakup(0, 0, ""),
    trans_doc_fee: calculateInvoiceBreakup(0, 0, ""),
    dest_clearing_fees: calculateInvoiceBreakup(firstDestinationCalc.finalAmt, firstDestination.discPercent || 0, firstDestination.vatTyp || ""),
    dest_THC_levy: calculateInvoiceBreakup(0, 0, ""),
    dest_unpack_chrg: calculateInvoiceBreakup(0, 0, ""),
    dest_fuel_Surchar: calculateInvoiceBreakup(0, 0, ""),
    dest_admin_chrg: calculateInvoiceBreakup(0, 0, ""),
    dest_portCargo: calculateInvoiceBreakup(0, 0, ""),
    dest_adv_loadHouse: calculateInvoiceBreakup(0, 0, ""),
    dest_CFS_charg: calculateInvoiceBreakup(0, 0, ""),
    dest_delivry_charge: calculateInvoiceBreakup(0, 0, ""),
    dest_fuel_surchrg: calculateInvoiceBreakup(0, 0, ""),
    admin_agencyFee: calculateInvoiceBreakup(firstAdminCalc.finalAmt, firstAdmin.discPercent || 0, firstAdmin.vatTyp || ""),
    admin_disbur_fee: calculateInvoiceBreakup(0, 0, ""),
    admin_doc_adminFees: calculateInvoiceBreakup(0, 0, ""),
    cust_duty: calculateInvoiceBreakup(firstCustomsCalc.finalAmt, firstCustoms.discPercent || 0, firstCustoms.vatTyp || ""),
    cust_vat: calculateInvoiceBreakup(0, 0, ""),
    adv_duty: calculateInvoiceBreakup(0, 0, ""),
    cust_penalty: calculateInvoiceBreakup(0, 0, ""),
    custProv_pay: calculateInvoiceBreakup(0, 0, ""),
    clearing_fee: calculateInvoiceBreakup(0, 0, ""),
    disbursement: calculateInvoiceBreakup(0, 0, ""),
    surcharge: calculateInvoiceBreakup(0, 0, ""),
  };

  const totalVatInclusive =
    originRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    freightRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    transitRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    destinationRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    adminRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    customsRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

  const estimateCalculate = async () => {
    try {
      const allComponents = [];

      const mapRowToComponent = (row, calc) => ({
        ...(row.db_id && { id: row.db_id }),
        admin_frieght_component_id: row.admin_frieght_component_id || null,
        description: row.description || "",
        qty: cleanParseFloat(row.qty),
        currency: row.currency || "",
        cost: cleanParseFloat(row.cost),
        unit_type: row.unitType === "1" ? "L/S" : (row.unitType === "2" ? "W/M" : ""),
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
          allComponents.push(mapRowToComponent(row, calc));
        }
      });
      freightRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc));
        }
      });
      transitRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc));
        }
      });
      destinationRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc));
        }
      });
      adminRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc));
        }
      });
      customsRowsData.forEach(({ row, calc }) => {
        if (row.description) {
          allComponents.push(mapRowToComponent(row, calc));
        }
      });

      const payload = {
        freight_id: parseInt(getdata.freight_id),
        client_id: parseInt(getdata.client_id || getdata.id || getdata.client_ref),
        client_name: getdata.client_name,
        supplier_id: parseInt(freight.supplier_id) || null,
        customer_invoice_no: freight.customer_invoice_no || "",
        invoice_for_country: freight.invoice_for_country || "",
        company_id: freight.company_id ? parseInt(freight.company_id) : null,
        quote_type: "ADMIN",
        date: getdata.date ? new Date(getdata.date).toISOString().split('T')[0] : getTodayDate(),
        final_base_currency: freight.final_base_currency || "Select",
        sumof_totalcost: parseFloat(sumofall) || 0,
        sumof_finalamount: parseFloat(sumofRoe) || 0,
        sumof_vatincl: parseFloat(totalVatInclusive) || 0,
        chargeable: parseFloat(freight.chargable_rate) || 0,
        components: allComponents,
        quote_validity: freight.quote_validity || "",
        payment_terms: freight.payment_terms || "",
      };

      console.log("[Add Invoice] add-freight-quotes-estimate payload:", payload);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}add-freight-quotes-estimate`,
        payload
      );
      if (response.data.success === true) {
        const fromPage = location?.state?.fromPage || "/Admin/managefreight";
        navigate(fromPage);
        if (response.data.ID) {
          setQuotationID(response.data.ID);
        }
        toast.success(response.data.message);
      } else {
        console.log("some thing went wrong");
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Full Error =>", error);
      console.log("Error Response =>", error.response);
      console.log("Error Data =>", error.response?.data);
      console.log("Error Message =>", error.message);
      console.log("Status Code =>", error.response?.status);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const supplier = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-suppler-selected`, {
        freight_id: getdata122?.id,
      })
      .then((response) => {
        // console.log(response);
        setClient(response.data.data);
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  };

  useEffect(() => {
    supplier();
    supplierSelected();
  }, []);

  const handlepresss = (e) => {
    if (e.charCode < 42 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  // ////////////////////////////////////////////////////supplier selected

  const supplierSelected = async () => {
    console.log(localFreigtId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-suppler-selected`,
        { freight_id: localFreigtId },
      );
      // console.log(response);
      if (response?.data?.data) {
        setSelected(response.data.data.map((item) => item.id));
        // setClient(response.data.data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.log("Something went wrong:", error);
    }
  };

  const dateformate = new Date(getdata?.date).toLocaleDateString("en-GB");
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    getsupplier();
  }, []);

  useEffect(() => {
    getdataapi();
    // getNewDataapi();
  }, []);

  const getsupplier = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setSupplierdata(response.data.data);
        setSuppluierquot(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const getdataapi = async () => {
    const data123456 = {
      quote_estimate_id: getdata122?.quote_estimate_id
        ? getdata122?.quote_estimate_id
        : getdata122?.quote_estimate_id,
      freight,
    };
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}get-shipestimate`, data123456)
      .then((response) => {
        console.log(response.data.data);
        if (isEstimateLoaded.current) return;
        isFreightLoadedFromApi.current = true;
        const rawData = response.data.data;
        const normalizedFreight = Array.isArray(rawData) ? (rawData[0] || {}) : (rawData || {});
        setFreight(normalizedFreight);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  // asiadirect pr fieight list mai add edit
  // const getNewDataapi = async () => {
  //   // console.log(getdata);
  //   const data123456 = {
  //     quote_estimate_id: getdata122?.quote_estimate_id
  //       ? getdata122?.quote_estimate_id
  //       : getdata122?.quote_estimate_id,
  //     freight_id: parseInt(localFreigtId),
  //   };
  //   // console.log(data123456);
  //   await axios
  //     .post(
  //       `${process.env.REACT_APP_BASE_URL}GetQuoteShipEstimateById`,
  //       data123456,
  //     )
  //     .then((response) => {
  //       console.log(response.data.data);
  //       if (isEstimateLoaded.current) return;
  //       isFreightLoadedFromApi.current = true;
  //       const rawData = response.data.data;
  //       const normalizedFreight = Array.isArray(rawData) ? (rawData[0] || {}) : (rawData || {});
  //       setFreight(normalizedFreight);
  //     })
  //     .catch((error) => {
  //       console.log(error.response.data);
  //     });
  // };

  const handleclicknav = () => {
    // navigate("/Admin/managefreight");
    window.history.back();
  };

  const closemodal = () => {
    setOpenmodal(false);
  };

  const getdata1 = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat(response.data.data);
      })
      .catch((error) => {
        console.log(error);
        test(error.response.data);
      });
  };

  useEffect(() => {
    getdata1();
  }, []);

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleAddSupplier = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one supplier.");
      return;
    }
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/freight/assign-Suppliers`,
      { freight_id: localFreigtId, supplier_ids: selected },
    );
    if (response.data.success) {
      toast.success(response.data.message);
      setOpenmodal(false);
    }
  };

  // const downloadPDF =  () => {
  //    setShowData(true);
  //      downloadPDF1();
  // };

  const downloadPDF = () => {
    setShowData(false); // PDF ke liye limited UI
    // downloadPDF1()
    const allComponents = [];

    const mapRowToComponent = (row, calc) => ({
      ...(row.db_id && { id: row.db_id }),
      admin_frieght_component_id: row.admin_frieght_component_id || null,
      description: row.description || "",
      qty: cleanParseFloat(row.qty),
      currency: row.currency || "",
      cost: cleanParseFloat(row.cost),
      unit_type: row.unitType === "1" ? "L/S" : (row.unitType === "2" ? "W/M" : ""),
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

    navigate("/Admin/Downloadestimate", { state: { data: getdata122, freight: currentFreightState } });
  };

  const downloadPDF1 = async () => {
    if (isPdfGenerating.current) return;

    const element = pdfRef.current;
    if (!element) {
      toast.error("PDF content is not ready. Please try again.");
      return;
    }

    isPdfGenerating.current = true;

    try {
      const meta = buildEstimateMeta({ freight, getdata, logoSrc: logo });
      await exportEstimateAutoTablePdf(element, meta, "shipping-estimate.pdf");
    } catch (e) {
      console.error("PDF generation failed", e);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      isPdfGenerating.current = false;
    }
  };

  // Dynamic states moved to top of component to prevent ReferenceError

  const loadedFreightIdRef = useRef(null);

  useEffect(() => {
    if (isEstimateLoaded.current) return;
    if (hasInitialized.current) return;
    if (!isFreightLoadedFromApi.current) return;

    // Set hasInitialized immediately to prevent subsequent updates to freight state (from inputs) from re-triggering this block
    hasInitialized.current = true;
    const currentId = freight?.freight_id || freight?.id || localFreigtId;
    if (currentId) {
      loadedFreightIdRef.current = currentId;
    }

    const f = (freight && typeof freight === "object" && !Array.isArray(freight)) ? freight : {};

    setOriginRows([
      {
        id: 1,
        description: f.origin_pick_up_description || "Origin Pick Up",
        qty: f.freight_charge_currencyQTY || "",
        currency: f.pickup_freight_currency || "Select",
        cost: f.origin_pick_up_cost || "",
        unitType: f.origin_pick_up_unitType || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.roe_origin_currencyorigin || "",
        vatTyp: getVatLabel(f.org_pickUp_vatTyp || ""),
        discPercent: f["org_pickUp_disc%"] || "",
        comment: f.origin_pick_up_comment || "",
      }
    ]);
    setFreightRows([
      {
        id: 2,
        description: f.freight_charge_description || "Freight Charges",
        qty: f.freight_charge_currency_unitTypeQTY || "",
        currency: f.freight_charge_currency || "Select",
        cost: f.freight_charge_currency_cost || "",
        unitType: f.freight_charge_currency_unitType || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.roe_freight_currency || "",
        vatTyp: getVatLabel(f.ocenfreight_charge_vatTyp || ""),
        discPercent: f["ocenfreight_charge_disc%"] || "",
        comment: f.freight_charge_comment || "",
      }
    ]);
    setTransitRows([
      {
        id: 3,
        description: f.Transit_currency_description || "Transit Charges",
        qty: f.Transit_currency_unitTpeQTY || "",
        currency: f.Transit_currency || "Select",
        cost: f.Transit_currency_Cost || "",
        unitType: f.Transit_currency_unitTpe || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.Transit_currency_roe || "",
        vatTyp: getVatLabel(f.trans_clear_fees_vatTyp || ""),
        discPercent: f["trans_clear_fees_disc%"] || "",
        comment: f.Transit_currency_comment || "",
      }
    ]);
    setDestinationRows([
      {
        id: 4,
        description: f.Destination_freight_currency_description || "Destination Charges",
        qty: f.Destination_freight_currency_unitTypeQTY || "",
        currency: f.Destination_freight_currency || "Select",
        cost: f.Destination_freight_currency_cost || "",
        unitType: f.Destination_freight_currency_unitType || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.Destination_freight_currency_Roe || "",
        vatTyp: getVatLabel(f.dest_clearing_fees_vatTyp || ""),
        discPercent: f["dest_clearing_fees_disc%"] || "",
        comment: f.Destination_freight_currency_comment || "",
      }
    ]);
    setAdminRows([
      {
        id: 5,
        description: f.Destination_AdminAgrncy_description || "Admin Charges",
        qty: f.Destination_AdminAgrncy_currency_unitQTY || "",
        currency: f.admin_currency_charge || "Select",
        cost: f.Destination_AdminAgrncy_currency_cost || "",
        unitType: f.Destination_AdminAgrncy_currency_unitType || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.Destination_AdminAgrncy_currency_roe || "",
        vatTyp: getVatLabel(f.admin_agencyFee_vatTyp || ""),
        discPercent: f["admin_agencyFee_disc%"] || "",
        comment: f.Destination_AdminAgrncy_comment || "",
      }
    ]);
    setCustomsRows([
      {
        id: 6,
        description: f.cust_duty_description || "Customs Charges",
        qty: f.cust_duty_qty || "",
        currency: f.cust_duty_curr || "Select",
        cost: f.cust_duty_cost || "",
        unitType: f.cust_duty_unitTyp || "Select",
        gp_percent: "",
        sales_price: "",
        roe: f.cust_duty_roe || "",
        vatTyp: getVatLabel(f.cust_duty_vatTyp || ""),
        discPercent: f["cust_duty_disc%"] || "",
        comment: f.cust_duty_comment || "",
      }
    ]);
  }, [freight]);

  const handleDropdownChange = (setter, dropdownData, id, selectedId) => {
    const component = dropdownData.find(item => String(item.admin_frieght_component_id) === String(selectedId));
    setter(prev => prev.map(row => {
      if (row.id === id) {
        return {
          ...row,
          admin_frieght_component_id: component ? component.admin_frieght_component_id : "",
          description: component ? component.description : (selectedId === "Note" ? "Note" : ""),
        };
      }
      return row;
    }));
  };

  useEffect(() => {
    if (originDropdown.length > 0 && originRows.length > 0) {
      setOriginRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = originDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [originDropdown, originRows.length]);

  useEffect(() => {
    if (freightDropdown.length > 0 && freightRows.length > 0) {
      setFreightRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = freightDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [freightDropdown, freightRows.length]);

  useEffect(() => {
    if (transitDropdown.length > 0 && transitRows.length > 0) {
      setTransitRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = transitDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [transitDropdown, transitRows.length]);

  useEffect(() => {
    if (destinationDropdown.length > 0 && destinationRows.length > 0) {
      setDestinationRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = destinationDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [destinationDropdown, destinationRows.length]);

  useEffect(() => {
    if (adminDropdown.length > 0 && adminRows.length > 0) {
      setAdminRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = adminDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [adminDropdown, adminRows.length]);

  useEffect(() => {
    if (customsDropdown.length > 0 && customsRows.length > 0) {
      setCustomsRows(prev => prev.map(row => {
        if (!row.admin_frieght_component_id && row.description && row.description !== "Note") {
          const comp = customsDropdown.find(d => d.description === row.description || d.code === row.description);
          if (comp) {
            return { ...row, admin_frieght_component_id: comp.admin_frieght_component_id };
          }
        }
        return row;
      }));
    }
  }, [customsDropdown, customsRows.length]);

  // Helper Functions
  const appendRow = (setter) => {
    setter(prev => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        qty: "",
        currency: "Select",
        cost: "",
        unitType: "Select",
        gp_percent: "",
        sales_price: "",
        roe: "",
        vatTyp: "",
        vat: "",
        discPercent: "",
        comment: ""
      }
    ]);
  };

  const deleteRow = (setter, id) => {
    setter(prevRows => prevRows.filter(row => row.id !== id));
  };

  const updateRowDescription = (setter, id, value) => {
    setter(prev => prev.map(row =>
      row.id === id ? { ...row, description: value } : row
    ));
  };

  return (
    <>
      <div>
        {openmodal && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h5>Select Supplier</h5>
                <button className="btn-close" onClick={() => closemodal()}>
                  <CloseIcon />
                </button>
              </div>
              <div className="custom-modal-body">
                <div style={{ margin: "18px" }}>
                  {/* Selected Box */}
                  <div
                    onClick={() => setOpen(!open)}
                    style={{
                      padding: "10px",
                      border: "1px solid black",
                      borderRadius: "5px",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {selected.length > 0
                      ? `${selected.length} selected`
                      : "Select Users"}
                  </div>

                  {/* Dropdown */}
                  {open && (
                    <div
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        marginTop: "5px",
                        padding: "10px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        background: "white",
                      }}
                    >
                      {dat.map((item) => (
                        <label
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => handleSelect(item.id)}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            <div style={{ fontSize: "12px", color: "gray" }}>
                              {item.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  <br />
                </div>
              </div>
              <div className="custom-modal-footer">
                <button className="btn btn-primary" onClick={handleAddSupplier}>
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="wpWrapper ">
          <div className="container-fluid">
            <div className=" ">
              <div className=" ">
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="d-flex">
                        <ArrowBackIcon
                          onClick={handleclicknav}
                          style={{ cursor: "pointer" }}
                        />
                        <h4 className="freight_hd mb-0">Admin Estimate Form</h4>
                      </div>
                      <div className="d-flex gap-3 align-items-center blueText">
                        <i onClick={() => downloadPDF1()} class="fa fa-download" aria-hidden="true"></i>
                        <i class="fa fa-address-card" onClick={() => downloadPDF()}></i>
                        <button onClick={andlemodaloen} className="blueBtn">
                          Assign Supplier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <section ref={pdfRef} style={{ margin: 0, padding: 0 }}>
                  <div
                    style={{
                      width: "100%",
                      padding: "10px",
                      outline: "auto",
                      height: "auto",
                    }}
                    className="pdf-page"
                  >
                    <p>
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
                                <img
                                  style={{ height: 55 }}
                                  src={logo}
                                  alt="hellow"
                                />
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
                                {freight?.company_address?.company_name || ""}<br />
                                {freight?.company_address?.address_line || ""}
                              </p>
                              <p>
                                <span><b>Registration No.:-</b> {freight?.company_address?.company_registration_no || ""}</span> <br />
                                <span><b>VAT No.:-</b> {freight?.company_address?.tax_vat_no || ""}</span> <br />
                                <span><b>Importers code:-</b></span>{freight?.company_address?.postal_code || ""}
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
                              style={{
                                textAlign: "center",
                                fontSize: 13,
                                fontWeight: 600,
                                width: "100%",
                              }}
                            >
                              FREIGHT ESTIMATE
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
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Commodity</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.product_desc}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Hazardous</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata.hazardous?.toLowerCase() === "no"
                                            ? "No"
                                            : getdata.hazard_type}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>No. of Packages</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.no_of_packages}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Package Type</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>
                                          {getdata?.package_type}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Gross Weight (kgs)</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.weight}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Dimensions (M3)</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.dimension}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Volumetric (kgs)</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.volumetric_weight}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Chargeable</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <input
                                            type="text"
                                            onKeyPress={handlepresss}
                                            name="chargable_rate"
                                            value={freight.chargable_rate}
                                            onChange={handlechangecalc}
                                          />
                                        </p>
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
                                    <td style={{ fontSize: 13 }}>
                                      Rate of Exchange
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <td>
                                      <div style={{ display: "flex", justifyContent: "space-between", padding: 6 }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset" }}>
                                          <strong>Base Currency</strong>
                                        </p>
                                        <select
                                          className="select_supplier border"
                                          style={{
                                            margin: 0,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            paddingLeft: 5,
                                            width: "40%",
                                            border: "2px",
                                          }}
                                          onChange={handlechangecalc}
                                          name="final_base_currency"
                                          value={freight?.final_base_currency}
                                        >
                                          <option>Select</option>
                                          <option value="RAND">RAND</option>
                                          <option value="USD">USD</option>
                                          <option value="INR">INR</option>
                                          <option value="EURO">EURO</option>
                                        </select>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <div style={{ display: "flex", justifyContent: "space-between", padding: 6 }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset" }}>
                                          <strong>Payment Terms</strong>
                                        </p>
                                        <input
                                          type="text"
                                          name="payment_terms"
                                          value={freight?.payment_terms || ""}
                                          onChange={handlechangecalc}
                                          style={{
                                            margin: 0,
                                            fontSize: 13,
                                            paddingLeft: 5,
                                            width: "40%",
                                            border: "1px solid #ccc",
                                          }}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                              <table style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <td style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 6px",
                                      fontSize: 13,
                                    }}><strong>
                                        Invoice For
                                      </strong></td>
                                    <td style={{ paddingBottom: 3, fontSize: 13, textAlign: "right", paddingRight: "6px" }}>
                                      <select
                                        name="invoice_for_country"
                                        value={freight.invoice_for_country || ""}
                                        onChange={handleInvoiceForChange}
                                        style={{ width: "180px", padding: "2px" }}
                                      >
                                        <option value="">Select Country</option>
                                        <option value="South Africa">South Africa</option>
                                        <option value="Zambia">Zambia</option>
                                        <option value="Zimbabwe">Zimbabwe</option>
                                      </select>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 6px",
                                      fontSize: 13,
                                    }}><strong>
                                        Client Ref
                                      </strong></td>
                                    <td style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}>
                                      <input
                                        type="text"
                                        name="customer_invoice_no"
                                        value={freight.customer_invoice_no || ""}
                                        onChange={handlechangecalc}
                                        style={{ width: "180px", padding: "2px" }}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        width: 170,
                                        display: "block",
                                        padding: "0px 6px",
                                        fontSize: 13,
                                      }}
                                    >
                                      <strong>Reference</strong>
                                    </td>
                                    <td style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}>
                                      {freight?.reference_no}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        padding: "0px 6px 6px 6px",
                                        width: 170,
                                        display: "block",
                                        fontSize: 13,
                                      }}
                                    >
                                      <strong>Quote Date</strong>
                                    </td>
                                    <td style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}>
                                      {getdata?.date
                                        ? new Date(getdata.date).toLocaleDateString("en-GB")
                                        : "-"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        padding: "0px 6px 6px 6px",
                                        width: 170,
                                        display: "block",
                                        fontSize: 13,
                                      }}
                                    >
                                      <strong>Quote Validity</strong>
                                    </td>
                                    <td style={{ fontSize: 13, textAlign: "right", paddingBottom: "3px", paddingRight: "6px" }}>
                                      <input
                                        type="text"
                                        name="quote_validity"
                                        value={freight.quote_validity || ""}
                                        onChange={handlechangecalc}
                                        style={{ width: "180px", padding: "2px" }}
                                      />
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
                                      Routing Details
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "0px 6px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Country of Origin</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.collection_from_name}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Place of Receipt</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.port_of_loading}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Port of Loading</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.port_of_loading}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Port of Discharge</strong>
                                        </p>
                                        <p className="text-dark" style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.post_of_discharge}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Place of Delivery</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.delivery_to_name}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Incoterm</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.incoterm}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Mode of Transport</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.freight}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Freight No</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.freight_number}
                                        </p>
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
                                    <td style={{ fontSize: 13 }}>
                                      Freight details
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table style={{ width: "100%" }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "0px 6px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Load type</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          {getdata?.fcl_lcl}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Transit Priority</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>
                                          {getdata?.type}
                                        </p>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2 }}>
                                          <strong>Insurance</strong>
                                        </p>
                                        <p style={{ fontSize: 13, marginBottom: "unset", marginTop: 2, textTransform: "capitalize" }}>
                                          {getdata?.insurance}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </p>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td
                            style={{ padding: 0, borderRight: "1px solid black" }}
                          >
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
                                QUOTE INFORMATION
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="table-responsive">
                      <table class="cost-table">
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
                            <th>Final Amount</th>
                            <th>Vat %</th>
                            <th>Disc % </th>
                            <th>Discount </th>
                            <th>Exclusive </th>
                            <th>VAT </th>
                            <th>Total </th>
                            <th colSpan={2}>Comment </th>
                          </tr>
                        </thead>

                        <tbody>
                          {/* origin charges */}
                          <tr className="estimate-section-row">
                            <td colSpan={19}>
                              <strong>Origin Charges <i class="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setOriginRows)}></i></strong>
                            </td>
                          </tr>
                          {originRowsData.map(({ row, calc }) => renderRow(row, calc, setOriginRows, originDropdown, originRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong>Total - Origin Charges </strong>
                            </td>
                            <td colSpan={4}>
                              {" "}
                              {formatNumber(totalChageswithOutExchange, 2)}{" "}
                            </td>
                            <td> {formatNumber(totalChangeRoeOrigin, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          {/* freight charges */}
                          <tr className="estimate-section-row" >
                            <td colSpan={19}>
                              <strong>Freight Charges  <i class="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setFreightRows)}></i></strong>
                            </td>
                          </tr>
                          {freightRowsData.map(({ row, calc }) => renderRow(row, calc, setFreightRows, freightDropdown, freightRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Freight Charges</strong>
                            </td>
                            <td colSpan={4}>
                              {" "}
                              {formatNumber(totalChageswithOutExchangeinsurance, 2)}{" "}
                            </td>
                            <td>
                              {" "}
                              {formatNumber(totalChangeRoeOriginaftercalcuinsurance, 2)}{" "}
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>

                          {/* transit charges */}
                          <tr className="estimate-section-row">
                            <td colSpan={19}>
                              <strong>Transit Charges</strong>
                              <i className="fa fa-plus appendIcon ms-2" style={{ cursor: "pointer" }}
                                onClick={() => appendRow(setTransitRows)}></i>
                            </td>
                          </tr>
                          {transitRowsData.map(({ row, calc }) => renderRow(row, calc, setTransitRows, transitDropdown, transitRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Transit Charges</strong>
                            </td>
                            <td colSpan={4}>
                              {" "}
                              {formatNumber(totalChageswithOuTransit, 2)}{" "}
                            </td>
                            <td> {formatNumber(transitRoe, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          {/* Destination Charges */}
                          <tr className="estimate-section-row" >
                            <td colSpan={19}>
                              <strong>Destination Charges <i className="fa fa-plus appendIcon ms-2" style={{ cursor: "pointer" }}
                                onClick={() => appendRow(setDestinationRows)}></i>
                              </strong>
                            </td>
                          </tr>
                          {destinationRowsData.map(({ row, calc }) => renderRow(row, calc, setDestinationRows, destinationDropdown, destinationRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Destination Charges </strong>
                            </td>
                            <td colSpan={4}>
                              {" "}
                              {formatNumber(totalChaDestinationTransit, 2)}{" "}
                            </td>
                            <td> {formatNumber(totalChaDestinationTransitRoe, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr className="estimate-section-row">
                            <td colSpan={19}>
                              <strong>Admin Charges <i className="fa fa-plus ms-2 appendIcon" style={{ cursor: "pointer" }}
                                onClick={() => appendRow(setAdminRows)}></i></strong>
                            </td>
                          </tr>
                          {adminRowsData.map(({ row, calc }) => renderRow(row, calc, setAdminRows, adminDropdown, adminRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Admin Charges</strong>
                            </td>
                            <td colSpan={4}> {formatNumber(totaAdminransit, 2)} </td>
                            <td> {formatNumber(totalAdminnsitRoe, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr className="estimate-section-row">
                            <td colSpan={19}>
                              <strong>Customs Charges <i className="fa fa-plus ms-2" style={{ cursor: "pointer" }}
                                onClick={() => appendRow(setCustomsRows)}></i></strong>
                            </td>
                          </tr>
                          {customsRowsData.map(({ row, calc }) => renderRow(row, calc, setCustomsRows, customsDropdown, customsRows))}

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Customs Charges</strong>
                            </td>
                            <td colSpan={4}> {formatNumber(customsTotalTCost, 2)} </td>
                            <td> {formatNumber(customsTotalFinalAmt, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>

                          <tr>
                            <td colSpan={6}>
                              <strong> Total - Charge</strong>
                            </td>
                            <td colSpan={4}> {formatNumber(sumofall, 2)} </td>
                            <td> {formatNumber(sumofRoe, 2)} </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td> {formatNumber(totalVatInclusive, 2)} </td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="text-center mt-3">
                      <button className="ship_btn" onClick={estimateCalculate}>
                        Get Quote
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
