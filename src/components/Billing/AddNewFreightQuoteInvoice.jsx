import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../../Assests/logo.png";
import { exportEstimatePdf } from "../../utils/pdfExportUtils";

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

const handleBlur = (setter, id, field, value, dec = 2, isPercent = false) => {
  setter((prev) =>
    prev.map((row) =>
      row.id === id ? { ...row, [field]: formatValue(value, dec, isPercent) } : row
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

const toLocalDateString = (dateVal) => {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getVatLabel = (val) => {
  if (!val) return "";
  if (String(val) === "15") return "Standard Rate(15.00%)";
  if (String(val) === "100") return "Customs VAT(100.00%)";
  if (String(val) === "0") return "Zero Rate";
  return val;
};

const getCountry = (country, company_address) => {
  if (country) return country;
  if (company_address?.country) return company_address.country;
  return "";
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

export default function AddNewFreightQuoteInvoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [freight, setFreight] = useState({
    customer_invoice_no: "",
    invoice_for_country: "",
    due_date: "",
    final_base_currency: "Select",
    chargable_rate: "",
    company_id: "",
    company_address: null,
    freight_quote_estimate_id: null,
    quote_validity: "",
    payment_terms: "",
  });

  const [getdata, setGetdata] = useState({});
  const [openmodal, setOpenmodal] = useState(false);
  const [openmodal1, setOpenmodal1] = useState(false);
  const [openmodal2, setOpenmodal2] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");

  const [selected, setSelected] = useState(""); 
  const [selectedSupplier, setSelectedSupplier] = useState(""); 

  const [dat, setDat] = useState([]); 
  const [dat1, setDat1] = useState([]); 

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

  const copyInvoiceData = location?.state?.copyInvoiceData;

  useEffect(() => {
    getFreights();
    getsuppliers();
    fetchDropdowns();

    if (copyInvoiceData) {
      const invoiceId = copyInvoiceData.freight_quote_estimate_id || copyInvoiceData.quote_invoice_id;
      const freightId = copyInvoiceData.freight_id;
      if (invoiceId && freightId) {
        loadQuoteInvoiceData(invoiceId, freightId);
      }
    }
  }, [copyInvoiceData]);

  const getFreights = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getFreightDropdown`)
      .then((response) => {
        setDat(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error loading freights dropdown:", error);
      });
  };

  const getsuppliers = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat1(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error loading suppliers:", error);
      });
  };

  const handleOpenOrderModal = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}getFreightOrderList`);
      if (response.data && response.data.success) {
        setOrderList(response.data.data || []);
        setOpenmodal2(true);
      } else {
        toast.error("Failed to load order list");
      }
    } catch (error) {
      console.error("Error fetching order list:", error);
      toast.error("Something went wrong while fetching orders");
    }
  };

  const handleSelectOrder = async (orderId) => {
    if (!orderId) return;
    setSelectedOrder(orderId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}OrderDetailsById`,
        { orderId: parseInt(orderId) }
      );
      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
        const orderInfo = response.data.data[0];
        if (orderInfo.freight_id && parseInt(orderInfo.freight_id) !== 0) {
          apidataget(orderInfo.freight_id);
        } else {
          setGetdata(orderInfo);
          setSelected(0);
          setFreight((prev) => ({
            ...prev,
            chargable_rate: orderInfo.chargable_rate || orderInfo.chargeable || "",
          }));
          initializeDefaultRows();
        }
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Something went wrong while fetching order details");
    } finally {
      setOpenmodal2(false);
    }
  };

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

  const apidataget = async (freightId) => {
    const payload = { freight_id: freightId };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload
      );
      if (response.data && response.data.data) {
        const freightObj = { ...response.data.data[0] };

        setGetdata(freightObj);
        setSelected(freightId);
        setOpenmodal(false);

        const chargeable = freightObj.chargable_rate || freightObj.chargeable || "";
        setFreight((prev) => ({
          ...prev,
          chargable_rate: chargeable,
        }));

        if (freightId) {
          getFreightQuoteInvoiceByFreight(freightId);
        }
      }
    } catch (error) {
      console.error("Error fetching freight details:", error);
      toast.error("Failed to load freight details");
    }
  };

  const getFreightQuoteInvoiceByFreight = async (freightId) => {
    try {
      // Replaced incorrect endpoint logic to target GetNewFreightQuoteInvoiceById exclusively
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetNewFreightQuoteInvoiceById`,
         {
          quote_invoice_id: null,
          freight_id: parseInt(freightId)
        }
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const invoiceData = Array.isArray(rawData) ? rawData[0] : rawData;
        if (invoiceData) {
          setFreight((prev) => ({
            ...prev,
            customer_invoice_no: invoiceData.customer_invoice_no || prev.customer_invoice_no,
            invoice_for_country: getCountry(invoiceData.invoice_for_country, invoiceData.company_address) || prev.invoice_for_country,
            final_base_currency: invoiceData.final_base_currency || prev.final_base_currency,
            chargable_rate: invoiceData.chargeable !== undefined ? invoiceData.chargeable : prev.chargable_rate,
            company_id: invoiceData.company_id || invoiceData.company_address?.id || prev.company_id,
            company_address: invoiceData.company_address || prev.company_address,
            client_id: invoiceData.client_id || prev.client_id,
            client_name: invoiceData.client_name || prev.client_name,
            quote_type: invoiceData.quote_type || prev.quote_type,
            freight_quote_estimate_id: invoiceData.freight_quote_estimate_id || null,
            quote_validity: invoiceData.quote_validity || prev.quote_validity,
            payment_terms: invoiceData.payment_terms || prev.payment_terms,
          }));

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
          } else {
            initializeDefaultRows();
          }
        } else {
          initializeDefaultRows();
        }
      } else {
        initializeDefaultRows();
      }
    } catch (error) {
      console.error("Error loading invoice by freight:", error);
      initializeDefaultRows();
    }
  };

  const loadQuoteInvoiceData = async (invoiceId, freightId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetNewFreightQuoteInvoiceById`,
        {
          quote_invoice_id: parseInt(invoiceId),
          freight_id: parseInt(freightId)
        }
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const invoiceData = Array.isArray(rawData)
          ? (rawData.find((item) => String(item.id || item.freight_quote_estimate_id || item.quote_invoice_id) === String(invoiceId)) || rawData[0])
          : rawData;
        if (invoiceData) {
          setFreight({
            customer_invoice_no: invoiceData.customer_invoice_no || "",
            invoice_for_country: invoiceData.invoice_for_country || "",
            due_date: toLocalDateString(invoiceData.due_date || invoiceData.date),
            final_base_currency: invoiceData.final_base_currency || "Select",
            chargable_rate: invoiceData.chargeable || "",
            company_id: invoiceData.company_id || "",
            company_address: invoiceData.company_address || null,
            freight_quote_estimate_id: invoiceData.freight_quote_estimate_id || null,
            quote_validity: invoiceData.quote_validity || "",
            payment_terms: invoiceData.payment_terms || "",
          });

          setSelectedSupplier(invoiceData.supplier_id || "");
          if (invoiceData.freight_id) {
            apidataget(invoiceData.freight_id);
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
          } else {
            initializeDefaultRows();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching quote invoice by id:", error);
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

  const handlechangecalc = (e) => {
    const { name, value } = e.target;
    setFreight((prev) => ({
      ...prev,
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
      console.error("Error loading company addresses:", error);
    }
  };

  const handlepresss = (e) => {
    if (e.charCode < 42 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const appendRow = (setter) => {
    setter((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
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
        comment: "",
      },
    ]);
  };

  const deleteRow = (setter, id) => {
    setter((prev) => prev.filter((row) => row.id !== id));
  };

  const updateRowField = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
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

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const formatMoney = (value) => safeNumber(value).toFixed(2);

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

  const estimateCalculate = async () => {
    if (selected === "" || selected === undefined || selected === null) {
      toast.error("Please select an order first.");
      return;
    }
    // if (!selectedSupplier) {
    //   toast.error("Please select a supplier first.");
    //   return;
    // }

    try {
      const allComponents = [];

      const mapRowToComponent = (row, calc, name) => {
        const comp = {
          admin_frieght_component_id: row.admin_frieght_component_id || null,
          description: row.description || "",
          qty: cleanParseFloat(row.qty) || 0,
          currency: row.currency || "",
          cost: cleanParseFloat(row.cost) || 0,
          unit_type: row.unitType || "",
          unit: calc.unit || 0,
          total_cost: calc.tCost || 0,
          gp_percent: cleanParseFloat(row.gp_percent) || 0,
          sales_price: calc.salesPrice || 0,
          roe: cleanParseFloat(row.roe) || 0,
          final_amount: calc.finalAmt || 0,
          vat_type: row.vatTyp || "",
          disc_percent: cleanParseFloat(row.discPercent) || 0,
          discount: calc.disc || 0,
          exclusive: calc.exclusive || 0,
          vat: calc.vat || 0,
          vat_incl: calc.inclusive || 0,
          comment: row.comment || "",
          name: name
        };
        if (row.db_id) {
          comp.id = row.db_id;
        }
        return comp;
      };

      originRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Origin Charges"));
      });
      freightRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Freight Charges"));
      });
      transitRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Transit Charges"));
      });
      destinationRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Destination Charges"));
      });
      adminRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Admin Charges"));
      });
      customsRowsData.forEach(({ row, calc }) => {
        if (row.description) allComponents.push(mapRowToComponent(row, calc, "Customs Charges"));
      });

      const payload = {
        freight_id: (selected && parseInt(selected) !== 0) ? parseInt(selected) : null,
        client_id: getdata?.client_id || getdata?.user_id || null,
        order_id: getdata?.order_id,
        client_name: getdata?.client_name || "",
        company_id: freight.company_id,
        invoice_for_country: freight.invoice_for_country || "",
        supplier_id: selectedSupplier ? parseInt(selectedSupplier) : null,
        customer_invoice_no: freight.customer_invoice_no || "",
        final_base_currency: freight.final_base_currency || "Select",
        sumof_totalcost: sumofall || 0,
        sumof_finalamount: sumofRoe || 0,
        sumof_vatincl: totalVatInclusive || 0,
        chargeable: cleanParseFloat(freight.chargable_rate) || 0,
        quote_type: "ADMIN",
        components: allComponents,
        freight_quote_estimate_id: freight.freight_quote_estimate_id || (location.state?.copyInvoiceData?.freight_quote_estimate_id || null),
        quote_validity: freight.quote_validity || "",
        payment_terms: freight.payment_terms || "",
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addUpdateNewFreightQuoteInvoice`,
        payload
      );
      if (response.data && response.data.success === true) {
        toast.success(response.data.message || "Invoice saved successfully");
        navigate("/Admin/invoices");
      } else {
        toast.error(response.data.message || "Failed to save Invoice");
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong while saving");
    }
  };

  const handleclicknav = () => {
    window.history.back();
  };

  const closemodal = () => setOpenmodal(false);
  const closemodal1 = () => setOpenmodal1(false);
  const andlemodaloen = () => setOpenmodal(true);
  const andndndn = () => setOpenmodal1(true);

  const setSelecSupplier = (value) => {
    setSelectedSupplier(value);
    setTimeout(() => {
      closemodal1();
    }, 500);
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

  const shipmentValue = (...keys) => {
    for (const key of keys) {
      const value = getdata?.[key] ?? freight?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  };

  const shipmentDate = (key) => {
    const value = shipmentValue(key);
    if (!value || value === "0000-00-00") return "";
    const datePart = value.includes("T") ? value.split("T")[0] : value;
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB");
  };

  const renderRowsForSection = (rowsData, rowsState, setter, dropdownOptions, sectionTitle, totalTCost, totalFinalAmt) => {
    return (
      <>
        <tr className="estimate-section-row">
          <td colSpan={19}>
            <strong>
              {sectionTitle}{" "}
              <i
                className="fa fa-plus appendIcon"
                style={{ cursor: "pointer" }}
                onClick={() => appendRow(setter)}
              ></i>
            </strong>
          </td>
        </tr>
        {rowsData.map(({ row, calc }) => (
          <tr key={row.id}>
            <td>
              <select
                className="supplier_form"
                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                onChange={(e) =>
                  handleDropdownChange(setter, dropdownOptions, row.id, e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="Note">Note</option>
                {dropdownOptions.map((item) => {
                  const isAlreadySelected = rowsState.some(
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
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
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
                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
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
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
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
                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                onChange={(e) => updateRowField(setter, row.id, "unitType", e.target.value)}
                value={row.unitType || "Select"}
              >
                <option value="Select">Select</option>
                <option value="L/S">L/S</option>
                <option value="W/M">W/M</option>
              </select>
            </td>
            <td>
              <input
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                type="text"
                className="supplier_form"
                disabled
                value={formatValue(calc.unit, 2)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                disabled
                type="text"
                className="supplier_form"
                value={formatValue(calc.tCost)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                type="text"
                className="supplier_form"
                onChange={(e) => updateRowField(setter, row.id, "gp_percent", e.target.value)}
                value={row.gp_percent || ""}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                disabled
                type="text"
                className="supplier_form"
                value={formatValue(calc.salesPrice)}
                placeholder="0.00"
              />
            </td>
            <td>
              <input
                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
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
                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                disabled
                value={formatValue(calc.finalAmt, 2)}
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
                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                value={
                  row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)"
                    ? row.vat ?? ""
                    : formatValue(calc.vat)
                }
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
                value={formatValue(calc.inclusive)}
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
      {openmodal1 && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5 className="bold">Select Supplier</h5>
              <button className="btn-close" onClick={() => closemodal1()}>
                <CloseIcon />
              </button>
            </div>
            <div className="custom-modal-body">
              <div style={{ margin: "20px" }}>
                <select
                  className="form-select"
                  value={selectedSupplier}
                  onChange={(e) => setSelecSupplier(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {dat1.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <br />
              </div>
            </div>
          </div>
        </div>
      )}



      {openmodal2 && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5 className="bold">Select Order</h5>
              <button className="btn-close" onClick={() => setOpenmodal2(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="custom-modal-body">
              <div style={{ margin: "20px" }}>
                <select
                  className="form-select"
                  value={selectedOrder}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                >
                  <option value="">Select Order</option>
                  {orderList.map((item) => (
                    <option key={item.order_id} value={item.order_id}>
                      {item.order_number}
                    </option>
                  ))}
                </select>
                <br />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <ArrowBackIcon onClick={handleclicknav} style={{ cursor: "pointer" }} />
              <h4 className="freight_hd mb-0">Add Freight Invoice</h4>
            </div>
            <div className="d-flex gap-3 align-items-center blueText">
              <i onClick={downloadPDF1} className="fa fa-download" style={{ cursor: "pointer" }} aria-hidden="true"></i>

              <button onClick={handleOpenOrderModal} className="blueBtn">
                Select Order
              </button>
              <button onClick={andndndn} className="blueBtn">
                Select Supplier
              </button>
            </div>
          </div>

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
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", paddingBottom: "10px" }}>
                      <div>
                        <img style={{ height: 55 }} src={logo} alt="logo" />
                      </div>
                    </td>
                    <td style={{ width: "50%", color: "#000", paddingBottom: "10px", textAlign: "left" }}>
                      <p style={{ fontSize: 16, fontWeight: 600, marginBottom: "unset", borderBottom: "1px solid #cb191e", display: "inline-block" }}>
                        Asia Direct - Africa
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: "unset", lineHeight: "1.5", marginTop: 10 }}>
                        {freight.company_address?.company_name || ""}<br />
                        {freight.company_address?.address_line || ""}
                      </p>
                      <p>
                        <span><b>Registration No.:-</b> {freight.company_address?.company_registration_no || ""}</span> <br />
                        <span><b>VAT No.:-</b> {freight.company_address?.tax_vat_no || ""}</span> <br />
                        <span><b>Importers code:-</b></span>{freight.company_address?.postal_code || ""}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table style={{ border: "1px solid #1b2245", padding: "10px 20px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "center", fontSize: 13, fontWeight: 600, width: "100%" }}>
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
                      <table style={{ width: "100%" }}>
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
                              Cargo Details ISO Commodity
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table style={{ width: "100%" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0px 10px" }}>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Commodity</strong>
                                <span>{getdata?.product_desc || getdata?.commodity || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Hazardous</strong>
                                <span>{getdata.hazardous?.toLowerCase() === "no" ? "No" : (getdata.hazard_type || getdata.hazardous || "-")}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>No. of Packages</strong>
                                <span>{getdata?.no_of_packages || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Package Type</strong>
                                <span style={{ textTransform: "capitalize" }}>{getdata?.package_type || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Gross Weight (kgs)</strong>
                                <span>{getdata?.weight || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Dimensions (M3)</strong>
                                <span>{getdata?.m3 || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Volumetric (kgs)</strong>
                                <span>{getdata?.volumetric_weight || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center my-1">
                                <strong>Chargeable</strong>
                                <input
                                  type="text"
                                  name="chargable_rate"
                                  className="form-control form-control-sm w-50"
                                  style={{ height: 28 }}
                                  value={freight.chargable_rate}
                                  onChange={handlechangecalc}
                                  onKeyPress={handlepresss}
                                />
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
                              <div className="d-flex justify-content-between align-items-center my-1">
                                <strong>Base Currency</strong>
                                <select
                                  name="final_base_currency"
                                  className="form-select form-select-sm w-50"
                                  value={freight.final_base_currency || "Select"}
                                  onChange={handlechangecalc}
                                >
                                  <option value="Select">Select</option>
                                  <option value="USD">USD</option>
                                  <option value="RAND">RAND</option>
                                  <option value="EURO">EURO</option>
                                  <option value="INR">INR</option>
                                </select>
                              </div>
                              <div className="d-flex justify-content-between align-items-center my-1">
                                <strong>Payment Terms</strong>
                                <input
                                  type="text"
                                  name="payment_terms"
                                  value={freight.payment_terms || ""}
                                  onChange={handlechangecalc}
                                  className="form-control form-control-sm w-50"
                                  style={{ height: 28 }}
                                />
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
                              <select
                                name="invoice_for_country"
                                value={freight.invoice_for_country || ""}
                                onChange={handleInvoiceForChange}
                                style={{ width: "180px", padding: "2px", border: "1px solid #ccc" }}
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
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Client Ref</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              <input
                                type="text"
                                name="customer_invoice_no"
                                value={freight.customer_invoice_no || ""}
                                onChange={handlechangecalc}
                                style={{ width: "180px", padding: "2px", border: "1px solid #ccc" }}
                              />
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
                              {freight.reference_no || getdata?.freight_number || "-"}
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
                              {shipmentDate("quote_invoice_date") || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td style={{
                              width: 170,
                              padding: "5px 10px 0px 10px",
                              fontSize: 13,
                            }}>
                              <strong>Quote Validity</strong>
                            </td>
                            <td style={{ fontSize: 13, paddingTop: "5px", paddingRight: 10, textAlign: "right" }}>
                              <input
                                type="text"
                                name="quote_validity"
                                value={freight.quote_validity || ""}
                                onChange={handlechangecalc}
                                style={{ width: "180px", padding: "2px", border: "1px solid #ccc" }}
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
                            <td style={{ padding: "0px 10px" }}>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Country of Origin</strong>
                                <span>{getdata?.collection_from_name || getdata?.country_of_origin || "-"}</span>
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
                                <span>{getdata?.post_of_discharge || getdata?.port_of_discharge || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Place of Delivery</strong>
                                <span>{getdata?.delivery_to_name || getdata?.place_of_delivery || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Incoterm</strong>
                                <span>{getdata?.incoterm || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Mode of Transport</strong>
                                <span>{getdata?.freight || getdata?.mode_of_transport || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Freight No</strong>
                                <span>{getdata?.freight_number || "-"}</span>
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
                            <td style={{ padding: "0px 10px" }}>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Load type</strong>
                                <span>{getdata?.fcl_lcl || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Transit Priority</strong>
                                <span style={{ textTransform: "capitalize" }}>{getdata?.type || "-"}</span>
                              </div>
                              <div className="d-flex justify-content-between my-1">
                                <strong>Insurance</strong>
                                <span style={{ textTransform: "capitalize" }}>{getdata?.insurance || "-"}</span>
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
                      <div style={{ border: "1px solid black", width: "33%", borderBottom: "0px solid transparent", height: 22, borderTop: "unset" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, textTransform: "uppercase", paddingLeft: 5 }}>
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
                    {renderRowsForSection(originRowsData, originRows, setOriginRows, originDropdown, "Origin Charges", totalChageswithOutExchange, totalChangeRoeOrigin)}
                    {renderRowsForSection(freightRowsData, freightRows, setFreightRows, freightDropdown, "Freight Charges", totalChageswithOutExchangeinsurance, totalChangeRoeOriginaftercalcuinsurance)}
                    {renderRowsForSection(transitRowsData, transitRows, setTransitRows, transitDropdown, "Transit Charges", totalChageswithOuTransit, transitRoe)}
                    {renderRowsForSection(destinationRowsData, destinationRows, setDestinationRows, destinationDropdown, "Destination Charges", totalChaDestinationTransit, totalChaDestinationTransitRoe)}
                    {renderRowsForSection(adminRowsData, adminRows, setAdminRows, adminDropdown, "Admin Charges", totaAdminransit, totalAdminnsitRoe)}
                    {renderRowsForSection(customsRowsData, customsRows, setCustomsRows, customsDropdown, "Customs Charges", customsTotalTCost, customsTotalFinalAmt)}
                    
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
            </div>
          </section>

          <div className="text-center mt-3 mb-5">
            <button type="button" className="ship_btn" onClick={estimateCalculate}>
              Save Estimate
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}