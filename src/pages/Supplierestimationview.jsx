import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { RiFolderUserFill } from "react-icons/ri";
import { MdArrowOutward } from "react-icons/md";
import { exportEstimatePdf } from "../utils/pdfExportUtils";

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

export default function Supplierestimationview() {
  const [update, setUpdate] = useState([0]);
  const location = useLocation();
  const [freight, setFreight] = useState({});
  const [freightDetails, setFreightDetails] = useState({});
  const [showData, setShowData] = useState(true);
  const pdfRef = useRef();
  const isPdfGenerating = useRef(false);
  const isEstimateLoaded = useRef(false);
  const hasInitialized = useRef(false);
  const isFreightLoadedFromApi = useRef(false);

  const [supplierdata, setSupplierdata] = useState([]);
  const [dat, setDat] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [selected, setSelected] = useState([]); // selected IDs
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Selected supplier details from routing state
  const getdata = location?.state?.data;
  const supplierId = location?.state?.data?.id;
  const localFreigtId = location?.state?.freight_id;

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

  useEffect(() => {
    getFreightDataById();
    getdataapi();
    getsupplier();
    getdata1();
    supplierSelected();
  }, []);

  const fetchCompanyAddressForCountry = async (countryName) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}company-addresses`,
        { params: { country: countryName } }
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
      console.error("Error fetching company address for country:", error);
    }
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

    await fetchCompanyAddressForCountry(selectedCountry);
  };

  const getFreightDataById = async () => {
    const payload = {
      freight_id: localFreigtId,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload
      );
      if (response?.data?.data?.length > 0) {
        setFreightDetails(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching freight data by id:", error);
    }
  };

  const getdataapi = async () => {
    const payload = {
      freight_id: parseInt(localFreigtId),
      supplier_id: parseInt(supplierId)
    };
    if (getdata?.freight_quote_estimate_id) {
      payload.freight_quote_estimate_id = parseInt(getdata.freight_quote_estimate_id);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getFreightQuoteEstimateBySupplier`,
        payload
      );
      if (response.data && response.data.success && response.data.data) {
        const rawData = response.data.data;
        const estimateData = Array.isArray(rawData) ? rawData[0] : rawData;
        isFreightLoadedFromApi.current = true;

        if (!estimateData) return;

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
          company_address: estimateData.company_address || prev?.company_address || null,
        }));

        if (estimateData.invoice_for_country && !estimateData.company_address) {
          fetchCompanyAddressForCountry(estimateData.invoice_for_country);
        }

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
      console.error("Error fetching freight quote estimate by supplier:", error);
    }
  };

  const getsupplier = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setSupplierdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const getdata1 = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const supplierSelected = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-suppler-selected`,
        { freight_id: localFreigtId }
      );
      if (response?.data?.data) {
        setSelected(response.data.data.map((item) => item.id));
      }
    } catch (error) {
      console.log("Something went wrong:", error);
    }
  };

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
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight/assign-Suppliers`,
        { freight_id: localFreigtId, supplier_ids: selected }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setOpenmodal(false);
      }
    } catch (error) {
      toast.error("Error assigning supplier");
    }
  };

  const andlemodaloen = () => {
    setOpenmodal(true);
  };

  const closemodal = () => {
    setOpenmodal(false);
  };

  const handleclicknav = () => {
    navigate("/Admin/SupplierEstimation", { state: { data: localFreigtId } });
  };

  const handlechangecalc = (e) => {
    const { name, value } = e.target;
    setFreight((prevInputData) => ({
      ...prevInputData,
      [name]: value,
    }));
  };

  const handlepresss = (e) => {
    if (e.charCode < 42 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const isUnitTypeSelected = (unitType) =>
    Boolean(unitType && unitType !== "Select");

  const resolveRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return 0;
    if (String(unitType) === "1") return 1;
    const rate = parseFloat(freight?.chargable_rate);
    return Number.isNaN(rate) ? 0 : rate;
  };

  const displayRowUnit = (unitType) => {
    if (!unitType || unitType === "Select") return "";
    if (String(unitType) === "1") return 1;
    return freight?.chargable_rate ?? "";
  };

  const calculateRowData = (row) => {
    const qty = parseFloat(row?.qty) || 0;
    const cost = parseFloat(row?.cost) || 0;
    const unit = resolveRowUnit(row?.unitType);
    const tCost = (row?.unitType && row?.unitType !== "Select") ? (cost * unit * qty) : 0;
    const gpPercent = parseFloat(row?.gp_percent) || 0;
    let salesPrice = tCost;
    if (gpPercent > 0 && gpPercent < 100) {
      salesPrice = tCost / (1 - gpPercent / 100);
    }
    const roe = parseFloat(row?.roe) || 0;
    const finalAmt = salesPrice * roe;

    const discPercent = parseFloat(row?.discPercent) || 0;
    const vatPercent = getVatPercent(row?.vatTyp);

    const disc = (finalAmt * discPercent) / 100;
    const exclusive = finalAmt - disc;
    let vat = (exclusive * vatPercent) / 100;
    if (row?.vatTyp === "Manual VAT" || row?.vatTyp === "Manual VAT (Capital Goods)") {
      vat = parseFloat(row?.vat) || 0;
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

  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
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

  const totalVatInclusive =
    originRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    freightRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    transitRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    destinationRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    adminRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0) +
    customsRowsData.reduce((sum, item) => sum + item.calc.inclusive, 0);

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

  useEffect(() => {
    if (isEstimateLoaded.current) return;
    if (hasInitialized.current) return;
    if (!isFreightLoadedFromApi.current) return;

    hasInitialized.current = true;
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

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const estimateCalculate = async () => {
    try {
      const allComponents = [];

      const mapRowToComponent = (row, calc, sectionName) => ({
        ...(row.db_id && { id: row.db_id }),
        name: sectionName,
        admin_frieght_component_id: row.admin_frieght_component_id || null,
        description: row.description || "",
        qty: parseFloat(row.qty) || 0,
        currency: row.currency || "",
        cost: parseFloat(row.cost) || 0,
        unit_type: row.unitType === "1" ? "L/S" : (row.unitType === "2" ? "W/M" : ""),
        unit: parseFloat(calc.unit) || 0,
        total_cost: parseFloat(calc.tCost) || 0,
        gp_percent: parseFloat(row.gp_percent) || 0,
        sales_price: parseFloat(calc.salesPrice) || 0,
        roe: parseFloat(row.roe) || 0,
        final_amount: parseFloat(calc.finalAmt) || 0,
        vat_type: row.vatTyp || "",
        disc_percent: parseFloat(row.discPercent) || 0,
        discount: parseFloat(calc.disc) || 0,
        exclusive: parseFloat(calc.exclusive) || 0,
        vat: parseFloat(calc.vat) || 0,
        vat_incl: parseFloat(calc.inclusive) || 0,
        comment: row.comment || ""
      });

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
        freight_id: parseInt(localFreigtId),
        client_id: parseInt(freightDetails.client_id || freightDetails.id || freightDetails.client_ref),
        client_name: freightDetails.client_name,
        supplier_id: parseInt(supplierId) || null,
        customer_invoice_no: freight.customer_invoice_no || "",
        invoice_for_country: freight.invoice_for_country || "",
        company_id: freight.company_id ? parseInt(freight.company_id) : null,
        quote_type: "ADMIN",
        date: freightDetails.date ? new Date(freightDetails.date).toISOString().split('T')[0] : getTodayDate(),
        final_base_currency: freight.final_base_currency || "Select",
        sumof_totalcost: parseFloat(sumofall) || 0,
        sumof_finalamount: parseFloat(sumofRoe) || 0,
        sumof_vatincl: parseFloat(totalVatInclusive) || 0,
        chargeable: parseFloat(freight.chargable_rate) || 0,
        components: allComponents,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}add-freight-quotes-estimate`,
        payload
      );
      if (response.data.success === true) {
        toast.success(response.data.message);
        getdataapi();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleclAssign = async (status) => {
    const quoteId = freight.freight_quote_estimate_id || freight.id || freight.quote_estimate_id;
    if (!quoteId) {
      toast.error("Quotation ID not found. Save the estimate first.");
      return;
    }

    const payload = {
      freight_quote_estimate_id: parseInt(quoteId),
      is_approved: status, // 1 = approved, 2 = rejected
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}approveRejectFreightQuote`,
        payload
      );
      if (response.data && response.data.success) {
        toast.success(response.data.message || "Quotation Status Updated Successfully");
        getdataapi();
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error occurred");
    }
  };

  const downloadPDF = () => {
    navigate("/Admin/Downloadestimate", { state: { data: freight } });
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
      await exportEstimatePdf(element, "supplier-estimate.pdf");
    } catch (e) {
      console.error("PDF generation failed", e);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      isPdfGenerating.current = false;
    }
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
                      <div className="d-flex align-items-center">
                        <ArrowBackIcon
                          onClick={handleclicknav}
                          style={{ cursor: "pointer" }}
                        />
                        <h4 className="freight_hd mb-0 ms-3">Supplier Estimate Form</h4>
                        <span className="badge bg-secondary ms-3 px-3 py-2 fs-6">
                          Supplier: {getdata?.name}
                        </span>
                      </div>
                      <div className="d-flex gap-3 align-items-center blueText">
                        <i onClick={() => downloadPDF1()} className="fa fa-download" aria-hidden="true" style={{ cursor: "pointer" }}></i>
                        {/* <i className="fa fa-address-card" onClick={() => downloadPDF()} style={{ cursor: "pointer" }}></i> */}
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
                                alt="logo"
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
                              {freight?.company_address?.company_name || ""}<br/>
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
                                      {freightDetails?.client_name || freight?.client_name}
                                      <br />
                                      {freightDetails?.address_1 || freight?.address_1}
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
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p style={{ fontSize: 13, marginBottom: "unset" }}>
                                        <strong> No. of Packages</strong>
                                      </p>
                                      <p style={{ fontSize: 13, marginBottom: "unset" }}>
                                        {freightDetails?.no_of_packages}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Package Type</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.package_type}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Weight</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.weight}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>M3</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      ></p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Volumetric (kgs)</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.volumetric_weight}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Chargeable</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <input
                                          type="text"
                                          onKeyPress={handlepresss}
                                          name="chargable_rate"
                                          value={freight.chargable_rate || ""}
                                          onChange={handlechangecalc}
                                        ></input>
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Commodity</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.commodity}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Hazardous</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.hazardous}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Incoterm</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.incoterm}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Freight</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.freight}
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
                                margin: "0px",
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
                                  <td style={{ padding: "5px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                        }}
                                      >
                                        <strong>Final Base Currency</strong>
                                      </p>
                                      <select
                                        className="select_supplier border"
                                        style={{
                                          margin: 0,
                                          fontSize: 13,
                                          fontWeight: 700,
                                          paddingLeft: 5,
                                          width: "40%",
                                          border: "1px",
                                        }}
                                        onChange={handlechangecalc}
                                        name="final_base_currency"
                                        value={freight?.final_base_currency || "Select"}
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
                              </tbody>
                            </table>
                          </td>
                          <td>
                            <table>
                              <tbody>
                                <tr>
                                  <td style={{
                                    width: 170,
                                    display: "block",
                                    padding: "0px 10px 0px 10px",
                                    fontSize: 13,
                                  }}>
                                    <strong>Invoice For</strong>
                                  </td>
                                  <td style={{ fontSize: 13, marginBottom: 4 }}>
                                    <select
                                      name="invoice_for_country"
                                      value={freight.invoice_for_country || ""}
                                      onChange={handleInvoiceForChange}
                                      style={{ width: "100%", padding: "2px" }}
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
                                    padding: "5px 10px 0px 10px",
                                    fontSize: 13,
                                  }}>
                                    <strong>Invoice No.</strong>
                                  </td>
                                  <td style={{ fontSize: 13, paddingTop: "5px" }}>
                                    <input
                                      type="text"
                                      name="customer_invoice_no"
                                      value={freight.customer_invoice_no || ""}
                                      onChange={handlechangecalc}
                                    ></input>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 10px 0px 10px",
                                      fontSize: 13,
                                    }}
                                  >
                                    <strong>Reference</strong>
                                  </td>
                                  <td style={{ fontSize: 13 }}>
                                    {freightDetails?.reference_no || freight?.reference_no}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      padding: "0px 10px 0px 10px",
                                      width: 170,
                                      display: "block",
                                      paddingBottom: 0,
                                      fontSize: 13,
                                    }}
                                  >
                                    <strong>Quote Date</strong>
                                  </td>
                                  <td style={{ fontSize: 13 }}>
                                    {freightDetails?.date ? new Date(freightDetails.date).toLocaleDateString("en-GB") : ""}
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
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Country of Origin</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.collection_from_name}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Place of Receipt</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.port_of_loading}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Port of Loading</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.port_of_loading}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Port of Discharge</strong>
                                      </p>
                                      <p
                                        className="text-dark"
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.post_of_discharge}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Place of Delivery</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.delivery_to_name}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Freight Collect Accepted</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.quote_received}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Date</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freightDetails?.date ? new Date(freightDetails.date).toLocaleDateString("en-GB") : ""}
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
                    <table className="cost-table">
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
                          <th>VAT Type </th>
                          <th>Disc % </th>
                          <th>Discount </th>
                          <th>Exclusive </th>
                          <th>VAT </th>
                          <th>VAT Incl </th>
                          <th colSpan={2}>Comment </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Origin Charges */}
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Origin Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setOriginRows)}></i></strong>
                          </td>
                        </tr>
                        {originRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setOriginRows, originDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {originDropdown.map((item) => {
                                  const isAlreadySelected = originRows.some(
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
                                onChange={(e) => updateRowField(setOriginRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setOriginRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setOriginRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setOriginRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setOriginRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setOriginRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setOriginRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setOriginRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setOriginRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setOriginRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setOriginRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Origin Charges </strong></td>
                          <td colSpan={4}> {totalChageswithOutExchange.toFixed(2)} </td>
                          <td> {totalChangeRoeOrigin.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* Freight Charges */}
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Freight Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setFreightRows)}></i></strong>
                          </td>
                        </tr>
                        {freightRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setFreightRows, freightDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {freightDropdown.map((item) => {
                                  const isAlreadySelected = freightRows.some(
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
                                onChange={(e) => updateRowField(setFreightRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setFreightRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setFreightRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setFreightRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setFreightRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setFreightRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setFreightRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setFreightRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setFreightRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setFreightRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setFreightRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Freight Charges </strong></td>
                          <td colSpan={4}> {totalChageswithOutExchangeinsurance.toFixed(2)} </td>
                          <td> {totalChangeRoeOriginaftercalcuinsurance.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* Transit Charges */}
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Transit Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setTransitRows)}></i></strong>
                          </td>
                        </tr>
                        {transitRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setTransitRows, transitDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {transitDropdown.map((item) => {
                                  const isAlreadySelected = transitRows.some(
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
                                onChange={(e) => updateRowField(setTransitRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setTransitRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setTransitRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setTransitRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setTransitRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setTransitRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setTransitRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setTransitRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setTransitRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setTransitRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setTransitRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Transit Charges </strong></td>
                          <td colSpan={4}> {totalChageswithOuTransit.toFixed(2)} </td>
                          <td> {transitRoe.toFixed(2)} </td>
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
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Destination Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setDestinationRows)}></i></strong>
                          </td>
                        </tr>
                        {destinationRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setDestinationRows, destinationDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {destinationDropdown.map((item) => {
                                  const isAlreadySelected = destinationRows.some(
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
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setDestinationRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setDestinationRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Destination Charges </strong></td>
                          <td colSpan={4}> {totalChaDestinationTransit.toFixed(2)} </td>
                          <td> {totalChaDestinationTransitRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* Admin Charges */}
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Admin Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setAdminRows)}></i></strong>
                          </td>
                        </tr>
                        {adminRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setAdminRows, adminDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {adminDropdown.map((item) => {
                                  const isAlreadySelected = adminRows.some(
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
                                onChange={(e) => updateRowField(setAdminRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setAdminRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setAdminRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setAdminRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setAdminRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setAdminRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setAdminRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setAdminRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setAdminRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setAdminRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setAdminRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Admin Charges </strong></td>
                          <td colSpan={4}> {totaAdminransit.toFixed(2)} </td>
                          <td> {totalAdminnsitRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* Customs Charges */}
                        <tr className="estimate-section-row">
                          <td colSpan={19}>
                            <strong>Customs Charges <i className="fa fa-plus appendIcon" style={{ cursor: "pointer" }} onClick={() => appendRow(setCustomsRows)}></i></strong>
                          </td>
                        </tr>
                        {customsRowsData.map(({ row, calc }) => (
                          <tr key={row.id}>
                            <td>
                              <select
                                className="supplier_form"
                                value={row.admin_frieght_component_id || (row.description === "Note" ? "Note" : "")}
                                onChange={(e) =>
                                  handleDropdownChange(setCustomsRows, customsDropdown, row.id, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Note">Note</option>
                                {customsDropdown.map((item) => {
                                  const isAlreadySelected = customsRows.some(
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
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "qty", e.target.value)}
                                value={row.qty || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "currency", e.target.value)}
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
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "cost", e.target.value)}
                                value={row.cost || ""}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                className="select_supplier"
                                style={{ margin: 0, fontSize: 13, fontWeight: 700, paddingLeft: 5, border: 0 }}
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "unitType", e.target.value)}
                                value={row.unitType || "Select"}
                              >
                                <option value="Select">Select</option>
                                <option value="1">L/S</option>
                                <option value="2">W/M</option>
                              </select>
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                disabled
                                value={displayRowUnit(row.unitType)}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                disabled
                                type="text"
                                className="supplier_form"
                                value={calc.tCost ? calc.tCost.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", fontWeight: 400, border: "0px", verticalAlign: "middle" }}
                                type="text"
                                className="supplier_form"
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "gp_percent", e.target.value)}
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
                                value={calc.salesPrice ? calc.salesPrice.toFixed(2) : "0.00"}
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "roe", e.target.value)}
                                value={row.roe || ""}
                                className="supplier_form"
                                placeholder="1.00"
                              />
                            </td>
                            <td>
                              <input
                                style={{ marginBottom: 0, fontSize: 13, color: "black", border: "0px", verticalAlign: "middle" }}
                                disabled
                                value={calc.finalAmt ? calc.finalAmt.toFixed(2) : "0.00"}
                                placeholder="0.00"
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <select
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "vatTyp", e.target.value)}
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
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "discPercent", e.target.value)}
                                className="supplier_form"
                                value={row.discPercent || ""}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.disc ? calc.disc.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.exclusive ? calc.exclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled={!(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)")}
                                value={(row.vatTyp === "Manual VAT" || row.vatTyp === "Manual VAT (Capital Goods)") ? (row.vat ?? "") : (calc.vat ? calc.vat.toFixed(2) : "0.00")}
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "vat", e.target.value)}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="0.00"
                                disabled
                                value={calc.inclusive ? calc.inclusive.toFixed(2) : "0.00"}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Comment"
                                onChange={(e) => updateRowField(setCustomsRows, row.id, "comment", e.target.value)}
                                value={row.comment || ""}
                                className="supplier_form"
                              />
                            </td>
                            <td>
                              <i
                                className="fa fa-trash text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => deleteRow(setCustomsRows, row.id)}
                              />
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}><strong>Total - Customs Charges </strong></td>
                          <td colSpan={4}> {customsTotalTCost.toFixed(2)} </td>
                          <td> {customsTotalFinalAmt.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* Summary / Total rows */}
                        <tr>
                          <td colSpan={6}><strong> Total - Charge</strong></td>
                          <td colSpan={4}> {sumofall.toFixed(2)} </td>
                          <td> {sumofRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td> {totalVatInclusive.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center mt-4">
                    {/* Approve / Reject buttons */}
                    {freight?.is_approved === 1 || freight?.is_approved === "1" ? (
                      <div className="alert alert-success text-center fw-bold mx-auto w-50 mb-3">
                        This Quotation is Approved
                      </div>
                    ) : freight?.is_approved === 2 || freight?.is_approved === "2" ? (
                      <div className="alert alert-danger text-center fw-bold mx-auto w-50 mb-3">
                        This Quotation is Rejected
                      </div>
                    ) : (
                      <div className="col-12 d-flex justify-content-center gap-3 mb-3">
                        <button
                          className="blueBtn px-4 py-2 fs-6 fw-bold"
                          onClick={() => handleclAssign(1)}
                        >
                          Approve Quote
                        </button>
                        <button
                          className="redBtn px-4 py-2 fs-6 fw-bold"
                          onClick={() => handleclAssign(2)}
                        >
                          Reject Quote
                        </button>
                      </div>
                    )}

                    {/* Save estimate button (if not approved/rejected yet) */}
                    {(!freight?.is_approved || freight?.is_approved === 0 || freight?.is_approved === "0") && (
                      <button className="ship_btn px-4 py-2 fs-6 fw-bold btn btn-primary" onClick={estimateCalculate}>
                        Get Quote
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}
