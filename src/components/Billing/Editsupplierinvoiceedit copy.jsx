import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDownloadForOffline } from "react-icons/md";
import { usePDF } from "react-to-pdf";
import logo from "../../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import html2pdf from "html2pdf.js";
import { RiFolderUserFill } from "react-icons/ri";
import { MdArrowOutward } from "react-icons/md";
import { useRef } from "react";

export default function Editsupplierinvoiceedit() {
  const [update, setUpdate] = useState([0]);
  const location = useLocation();
  const [freight, setFreight] = useState([0]);
  const [origin, setOrigin] = useState([0]);
  const [showData, setShowData] = useState(true);
  const [quotationID, setQuotationID] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const pdfRef = useRef();
  const [client, setClient] = useState([]);
  const [suppluierquot, setSuppluierquot] = useState([]);
  const [supplierdata, setSupplierdata] = useState([]);
  const [getdata, setGetdata] = useState([]);
  const [dat, setDat] = useState([]);
  const [dat1, setDat1] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [openmodal1, setOpenmodal1] = useState(false);
  const [selected, setSelected] = useState([]); // selected IDs
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const invoiceItemPrefixes = [
    "org_pickUp",
    "origin_fuelSur",
    "origin_cfs",
    "org_docFee",
    "org_forwFee",
    "org_clearance",
    "ocenfreight_charge",
    "insurance",
    "trans_clear_fees",
    "trans_THC_levy",
    "trans_unpack_charg",
    "trans_CFS_charg",
    "trans_admin_charg",
    "trans_portCargo",
    "trans_adv_loadHouse",
    "trans_doc_fee",
    "dest_clearing_fees",
    "dest_THC_levy",
    "dest_unpack_chrg",
    "dest_fuel_Surchar",
    "dest_admin_chrg",
    "dest_portCargo",
    "dest_adv_loadHouse",
    "dest_CFS_charg",
    "dest_delivry_charge",
    "dest_fuel_surchrg",
    "admin_agencyFee",
    "admin_disbur_fee",
    "admin_doc_adminFees",
    "cust_duty",
    "cust_vat",
    "adv_duty",
    "cust_penalty",
    "custProv_pay",
    "clearing_fee",
    "disbursement",
    "surcharge",
  ];

  const customChargePrefixes = [
    "cust_duty",
    "cust_vat",
    "adv_duty",
    "cust_penalty",
    "custProv_pay",
    "clearing_fee",
    "disbursement",
    "surcharge",
  ];

  const invoiceItemSources = [
    "items",
    "item",
    "invoice_items",
    "supplier_invoice_items",
    "supplierInvoiceItems",
    "supplier_invoice_item",
  ];

  const pickFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null);

  const getInvoiceItems = (invoiceData) => {
    for (const key of invoiceItemSources) {
      if (Array.isArray(invoiceData?.[key])) return invoiceData[key];
    }
    return [];
  };

  const resolveInvoiceItemPrefix = (row, index) => {
    const rowValues = [
      row?.prefix,
      row?.item_key,
      row?.itemKey,
      row?.field_name,
      row?.fieldName,
      row?.code,
      row?.name,
      row?.item,
      row?.description,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return (
      invoiceItemPrefixes.find((prefix) =>
        rowValues.some((value) => value.includes(prefix.toLowerCase())),
      ) || invoiceItemPrefixes[index]
    );
  };

  const normalizeSupplierInvoiceData = (apiData) => {
    const invoiceData = Array.isArray(apiData) ? apiData[0] || {} : apiData || {};
    const items = getInvoiceItems(invoiceData);
    const normalized = { ...invoiceData };

    normalized.items = items.map((row, index) => {
      const prefix = resolveInvoiceItemPrefix(row, index);
      const id = pickFirstValue(row?.id, row?.item_id, row?.supplier_invoice_item_id);
      const discountPercent = pickFirstValue(
        row?.[`${prefix}_disc%`],
        row?.discount_percent,
        row?.discount_percentage,
        row?.disc_percent,
        row?.disc_percentage,
      );

      if (prefix) {
        if (id !== undefined) normalized[`${prefix}_item_id`] = id;
        if (discountPercent !== undefined) normalized[`${prefix}_disc%`] = discountPercent;
        if (row?.vat_percent !== undefined && normalized[`${prefix}_vatTyp`] === undefined) {
          normalized[`${prefix}_vatTyp`] = row.vat_percent;
        }
        if (row?.vat_percentage !== undefined && normalized[`${prefix}_vatTyp`] === undefined) {
          normalized[`${prefix}_vatTyp`] = row.vat_percentage;
        }
      }

      return {
        ...row,
        id,
        prefix,
      };
    });

    return normalized;
  };

  const item = location.state?.item.supplier_invoice_id;
  console.log(item)
  const fwtsupplierdata = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}getSupplierInvoiceById/${item}`);
      const invoiceData = normalizeSupplierInvoiceData(response.data.data);
      setFreight(invoiceData);
      setGetdata(invoiceData?.shipment || invoiceData);
      console.log(invoiceData)

    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    fwtsupplierdata()
  }, [item])

  const user = JSON.parse(localStorage.getItem("data123"));
  const localFreigtId = localStorage.getItem("freightid");
  console.log("Stored:", localStorage.getItem("freightid"));

  const andlemodaloen = () => {
    setOpenmodal(true);
  };
  const andndndn = () => {
    setOpenmodal1(true);
  };
  const handlechangecalc = (e) => {
    const { name, value } = e.target;
    setFreight((prevInputData) => ({
      ...prevInputData,
      [name]: value,
    }));
  };
  const freight_amount =
    freight?.origin_pick_up_entey * freight?.origin_pick_up_Unit;
  const num1 = parseFloat(freight_amount || 0);
  const num2 = parseFloat(freight.freight_gp || 0);
  const num3 = num1 / (1 - num2 / 100);
  const finalval = isNaN(num3) ? 0 : num3.toFixed(2);
  const finalvalflo = parseFloat(finalval);
  const originhandelc = (e) => {
    const { name, value } = e.target;
    setOrigin({ ...origin, [name]: value });
  };
  const oripick1 = parseFloat(freight.origin_pick_up_cost) || 0;
  // const oripick19 = parseFloat(freight.freight_charge_currencyQTY) || 0;
  // const oripick2 = parseFloat(freight.origin_pick_up_fees) || 0;
  const oripick2 =
    freight.origin_pick_up_unitType == "1" ? 1 : freight.chargable_rate;
  const oripick3 = parseFloat(freight.origin_pickup_fee_gpcalc) || 0;
  const oripick4 = freight.origin_pick_up_unitType
    ? oripick1 * oripick2 * freight.freight_charge_currencyQTY
    : 0.0;
  let finalValue = 0;
  if (oripick4 > 0) {
    finalValue = oripick4 * (1 + oripick3 / 100);
  }
  const finalori1 = isNaN(finalValue) ? "0.00" : finalValue.toFixed(2);
  const finalvlaueoriginPickup =
    finalori1 * parseInt(freight?.roe_origin_currencyorigin);
  const orifuel1 = parseFloat(freight.origin_pick_up_fuel_cost) || 0;
  // const orifuel2 = parseFloat(freight.origin_pick_up_fuel_fees) || 0;
  const orifuel2 =
    freight.origin_pick_up_fuel_unitType === "1" ? 1 : freight.chargable_rate;
  const orifuel3 = parseFloat(freight.origin_pick_fuelGP) || 0;
  const orifuel4 = freight.origin_pick_up_fuel_unitType
    ? orifuel1 * orifuel2 * freight.origin_pick_up_fuel_unitTypeQTY
    : 0.0;
  let finalValueFuel = 0;
  if (orifuel4 > 0) {
    finalValueFuel = orifuel4 * (1 + orifuel3 / 100);
  }
  const finalfuel1 = isNaN(finalValueFuel) ? "0.00" : finalValueFuel.toFixed(2);
  const finalvlaueoFuel =
    finalfuel1 * parseInt(freight?.roe_origin_fuel_currency);
  const oricfs1 = parseFloat(freight.origin_pick_up_cfs_cost) || 0;
  // const oricfs2 = parseFloat(freight.origin_pick_up_cfs_fees) || 0;
  const oricfs2 = parseFloat(
    freight.origin_pick_up_cfs_unitType === "1" ? 1 : freight.chargable_rate,
  );
  const oricfs3 = parseFloat(freight.origin_pickup_vfs_gp) || 0;
  const oricfs4 = freight.origin_pick_up_cfs_unitType
    ? oricfs1 * oricfs2 * freight.origin_pick_up_cfs_unitTypeQTY
    : 0.0;
  let finalValuecfs = 0;
  if (oricfs4 > 0) {
    finalValuecfs = oricfs4 * (1 + oricfs3 / 100);
  }
  const finalcfs1 = isNaN(finalValuecfs) ? "0.00" : finalValuecfs.toFixed(2);
  const finalvlaueocfs = finalcfs1 * parseInt(freight?.roe_origin_cfs_currency);

  const oridoc1 = parseFloat(freight.origin_pick_up_documantion_cost) || 0;
  // const oridoc2 = parseFloat(freight.origin_pick_up_documantation_fees) || 0;
  const oridoc2 = parseFloat(
    freight.origin_pick_up_documantation_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const oridoc3 = parseFloat(freight.origin_pick_documantation_cost_gp) || 0;
  const oridoc4 = freight.origin_pick_up_documantation_unitType
    ? oridoc1 * oridoc2 * freight.origin_pick_up_documantation_unitTypeQTY
    : 0.0;
  let finalValuedoc = 0;
  if (oridoc4 > 0) {
    finalValuedoc = oridoc4 * (1 + oridoc3 / 100);
  }
  console.log(oridoc4);
  const finaldoc1 = isNaN(finalValuedoc) ? "0.00" : finalValuedoc.toFixed(2);
  console.log(finaldoc1, "finaldoc1");
  console.log(freight.roe_origin_doc_currency);
  console.log(parseInt(freight?.roe_origin_doc_currency));
  const finalvlaueodoc = finaldoc1 * parseInt(freight?.roe_origin_doc_currency);

  const oriforewarding1 =
    parseFloat(freight.origin_pick_up_forewarding_cost) || 0;
  const oriforewarding2 = parseFloat(
    freight.origin_pick_up_forewarding_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const oriforewarding2 =
  //   parseFloat(freight.origin_pick_up_forewarding_fees) || 0;
  const oriforewarding3 = parseFloat(freight.origin_pickup_forewarding_gp) || 0;
  const oriforewarding4 = freight.origin_pick_up_forewarding_unitType
    ? oriforewarding1 *
    oriforewarding2 *
    freight.origin_pick_up_forewarding_unitTypeQTY
    : 0.0;
  let finalValueforewarding = 0;
  if (oriforewarding4 > 0) {
    finalValueforewarding = oriforewarding4 * (1 + oriforewarding3 / 100);
  }
  console.log(oriforewarding4);
  const finalforewarding1 = isNaN(finalValueforewarding)
    ? "0.00"
    : finalValueforewarding.toFixed(2);
  console.log(finalforewarding1, "finalforewarding1");
  console.log(freight.roe_origin_forewarding);
  console.log(parseInt(freight?.roe_origin_forewarding));
  const finalvlaueoforewarding =
    finalforewarding1 * parseInt(freight?.roe_origin_forewarding);
  const oricustome1 = parseFloat(freight.origin_pick_up_custome_cost) || 0;
  // const oricustome2 = parseFloat(freight.origin_pick_up_custome_clearance) || 0;
  const oricustome2 = parseFloat(
    freight.origin_pick_up_custome_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const oricustome3 = parseFloat(freight.origin_pickup_custome_gp) || 0;
  const oricustome4 = freight.origin_pick_up_custome_unitType
    ? oricustome1 * oricustome2 * freight.origin_pick_up_custome_unitTypeQTY
    : 0.0;
  let finalValuecustome = 0;
  if (oricustome4 > 0) {
    finalValuecustome = oricustome4 * (1 + oricustome3 / 100);
  }
  console.log(oriforewarding4);
  const finalcustomes1 = isNaN(finalValuecustome)
    ? "0.00"
    : finalValuecustome.toFixed(2);
  console.log(finalcustomes1, "finalcustomes1");
  console.log(freight.roe_origin_customes);
  console.log(parseInt(freight?.roe_origin_customes));
  const finalvlaueoCustomes =
    finalcustomes1 * parseInt(freight?.roe_origin_customes);
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const calculateInvoiceBreakup = (amount, discountPercent, vatPercent) => {
    const baseAmount = safeNumber(amount);
    const discountAmount = (baseAmount * safeNumber(discountPercent)) / 100;
    const exclusiveAmount = baseAmount - discountAmount;
    const vatAmount = (exclusiveAmount * safeNumber(vatPercent)) / 100;
    const inclusiveAmount = exclusiveAmount + vatAmount;

    return {
      disc: discountAmount,
      exclusive: exclusiveAmount,
      vat: vatAmount,
      inclusive: inclusiveAmount,
    };
  };

  const formatMoney = (value) => safeNumber(value).toFixed(2);
  const discountInputValue = (prefix) =>
    pickFirstValue(
      freight?.[`${prefix}_disc%`],
      freight?.[`${prefix}_disc_percent`],
      freight?.[`${prefix}_discount_percent`],
      "",
    );

  const calculateCustomChargeRow = (prefix) => {
    const unitType = freight[`${prefix}_unitTyp`];
    const unit = unitType === "1" ? 1 : safeNumber(freight.chargable_rate);
    const totalCost = unitType
      ? safeNumber(freight[`${prefix}_cost`]) * unit * safeNumber(freight[`${prefix}_qty`])
      : 0;
    const finalAmt = totalCost * safeNumber(freight[`${prefix}_roe`]);

    return { unit, totalCost, finalAmt };
  };

  const customChargeRows = {
    cust_duty: calculateCustomChargeRow("cust_duty"),
    cust_vat: calculateCustomChargeRow("cust_vat"),
    adv_duty: calculateCustomChargeRow("adv_duty"),
    cust_penalty: calculateCustomChargeRow("cust_penalty"),
    custProv_pay: calculateCustomChargeRow("custProv_pay"),
    clearing_fee: calculateCustomChargeRow("clearing_fee"),
    disbursement: calculateCustomChargeRow("disbursement"),
    surcharge: calculateCustomChargeRow("surcharge"),
  };
  const hasCustomChargeValue = (prefix) =>
    [
      freight?.[`${prefix}_qty`],
      freight?.[`${prefix}_cost`],
    ].some((value) => value !== undefined && value !== null && value !== "" && safeNumber(value) !== 0);
  const totalChageswithOutExchange =
    safeNumber(oripick4) +
    safeNumber(orifuel4) +
    safeNumber(oricfs4) +
    safeNumber(oridoc4) +
    safeNumber(oriforewarding4) +
    safeNumber(oricustome4);
  console.log(totalChageswithOutExchange);
  const totalChangeRoeOrigin =
    safeNumber(finalvlaueoriginPickup) +
    safeNumber(finalvlaueoFuel) +
    safeNumber(finalvlaueocfs) +
    safeNumber(finalvlaueodoc) +
    safeNumber(finalvlaueoCustomes) +
    safeNumber(finalvlaueoforewarding);
  // ////////////////////////////freight calculation
  const orifreight1 = parseFloat(freight.freight_charge_currency_cost) || 0;
  // const orifreight2 = parseFloat(freight.freight_charge_currency_fees) || 0;
  const orifreight2 = parseFloat(
    freight.freight_charge_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const orifreight3 = parseFloat(freight.freight_charge_currency_gp) || 0;
  const orifreight4 = freight.freight_charge_currency_unitType
    ? orifreight1 * orifreight2 * freight.freight_charge_currency_unitTypeQTY
    : 0.0;
  let finalValuefreight = 0;
  if (orifreight4 > 0) {
    console.log(orifreight4);
    finalValuefreight = orifreight4 * (1 + orifreight3 / 100);
  }
  console.log(orifreight4);
  const finalfreight1 = isNaN(finalValuefreight)
    ? "0.00"
    : finalValuefreight.toFixed(2);
  const finalvlaueofreight =
    finalfreight1 * parseInt(freight?.roe_freight_currency);
  const oriinsurance1 =
    parseFloat(freight.freight_currency_insurance_cost) || 0;
  const oriindsurance2 = parseFloat(
    freight.freight_currency_insurance_unittype === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const oriindsurance2 =
  //   parseFloat(freight.freight_currency_insurance_unit) || 0;
  const oriinsurance3 = parseFloat(freight.freightorigin_insurance_gp) || 0;
  const oriinsurance4 = freight.freight_currency_insurance_unittype
    ? oriinsurance1 *
    oriindsurance2 *
    freight.freight_currency_insurance_unittypeQTY
    : 0.0;
  let finalValueinsurance = 0;
  if (oriinsurance4 > 0) {
    finalValueinsurance = oriinsurance4 * (1 + oriinsurance3 / 100);
  }
  console.log(oriinsurance4);
  const finalinsurance1 = isNaN(finalValueinsurance)
    ? "0.00"
    : finalValueinsurance.toFixed(2);
  console.log(finalfreight1, "finalfreight1");
  console.log(freight.roe_insurance_currency);
  console.log(parseInt(freight?.roe_insurance_currency));
  const finalvlaueoInsurance =
    finalinsurance1 * parseInt(freight?.roe_insurance_currency);
  console.log(finalvlaueoFuel, "finalvlaueoFuel");
  console.log(orifuel1, orifuel3, orifuel4, finalValueFuel, finalvlaueoFuel);

  const totalChageswithOutExchangeinsurance =
    safeNumber(orifreight4) + safeNumber(oriinsurance4);

  console.log(totalChageswithOutExchangeinsurance);

  const totalChangeRoeOriginaftercalcuinsurance =
    safeNumber(finalvlaueoInsurance) + safeNumber(finalvlaueofreight);

  ///////////////////////////////transit change/////////////////////////////////////////////

  const oritransit1 = parseFloat(freight.Transit_currency_Cost) || 0;
  // const oritransit2 = parseFloat(freight.Transit_currency_unit) || 0;
  const oritransit2 = parseFloat(
    freight.Transit_currency_unitTpe === "1" ? 1 : freight.chargable_rate,
  );
  const oritransit3 = parseFloat(freight.Transit_currency_gp) || 0;
  const oritransit4 = freight.Transit_currency_unitTpe
    ? oritransit1 * oritransit2 * freight.Transit_currency_unitTpeQTY
    : 0.0;
  let finalValuetransit = 0;
  if (oritransit4 > 0) {
    finalValuetransit = oritransit4 * (1 + oritransit3 / 100);
  }
  console.log(oriinsurance4);
  const finaltransit1 = isNaN(finalValuetransit)
    ? "0.00"
    : finalValuetransit.toFixed(2);
  const finalvlaueotransit =
    finaltransit1 * parseInt(freight?.Transit_currency_roe);

  const oriThc1 = parseFloat(freight.transit_currency_THC_cost) || 0;
  // const oriThc2 = parseFloat(freight.transit_currency_THC_init) || 0;
  const oriThc2 = parseFloat(
    freight.transit_currency_THC_initType === "1" ? 1 : freight.chargable_rate,
  );
  const oriThc3 = parseFloat(freight.transit_currency_THC_gp) || 0;
  const oriThc4 = freight.transit_currency_THC_initType
    ? oriThc1 * oriThc2 * freight.transit_currency_THC_initTypeQTY
    : 0.0;
  let finalValueThc = 0;
  if (oriThc4 > 0) {
    finalValueThc = oriThc4 * (1 + oriThc3 / 100);
  }
  const finalThc1 = isNaN(finalValueThc) ? "0.00" : finalValueThc.toFixed(2);
  const finalvlaueotfineal = finalThc1 * parseInt(freight?.roe_Transit_Thc);

  const oriunpack1 = parseFloat(freight.Transit_currency_unpack_cost) || 0;
  const oriunpack2 = parseFloat(
    freight.Transit_currency_unpack_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const oriunpack2 = parseFloat(freight.Transit_currency_unpack_unit) || 0;
  const oriunpack3 = parseFloat(freight.Transit_currency_unpack_gp) || 0;
  const oriunpack4 = freight.Transit_currency_unpack_unitType
    ? oriunpack1 * oriunpack2 * freight.transit_currency_THC_initTypeeQTY
    : 0.0;
  let finalValueUnpack = 0;
  if (oriunpack4 > 0) {
    finalValueUnpack = oriunpack4 * (1 + oriunpack3 / 100);
  }
  const finalunpack1 = isNaN(finalValueUnpack)
    ? "0.00"
    : finalValueUnpack.toFixed(2);
  const finalvlaueotfunpack =
    finalunpack1 * parseInt(freight?.Transit_unpack_roe);

  const ori3rdparty1 = parseFloat(freight.transit_3rd_party_cost) || 0;
  // const ori3rdparty2 = parseFloat(freight.transit_3rd_party_unit) || 0;
  const ori3rdparty2 = parseFloat(
    freight.transit_3rd_party_unittype === "1" ? 1 : freight.chargable_rate,
  );
  const ori3rdparty3 = parseFloat(freight.transit_3rd_party_gp) || 0;
  const ori3rdparty4 = freight.transit_3rd_party_unittype
    ? ori3rdparty1 * ori3rdparty2 * freight.transit_3rd_party_unittypeQTY
    : 0.0;
  let finalValue3rdparty = 0;
  if (ori3rdparty4 > 0) {
    finalValue3rdparty = ori3rdparty4 * (1 + ori3rdparty3 / 100);
  }
  const final3rdparty1 = isNaN(finalValue3rdparty)
    ? "0.00"
    : finalValue3rdparty.toFixed(2);
  const finalvlaueot3dparty =
    final3rdparty1 * parseInt(freight?.transit_currency_3rd);

  const ori3rdAdmin1 = parseFloat(freight.transit_admin_change) || 0;
  // const ori3rdAdmin2 = parseFloat(freight.transit_admin_unit) || 0;
  const ori3rdAdmin2 = parseFloat(
    freight.transit_admin_unittype === "1" ? 1 : freight.chargable_rate,
  );
  const ori3rdAdmin3 = parseFloat(freight.transit_admin_gp) || 0;
  const ori3rdAdmin4 = freight.transit_admin_unittype
    ? ori3rdAdmin1 * ori3rdAdmin2 * freight.transit_admin_unittypeQTY
    : 0.0;
  let finalValueAdmin = 0;
  if (ori3rdAdmin4 > 0) {
    finalValueAdmin = ori3rdAdmin4 * (1 + ori3rdAdmin3 / 100);
  }
  const final3rdAdmin1 = isNaN(finalValueAdmin)
    ? "0.00"
    : finalValueAdmin.toFixed(2);
  const finalvlaueotAdmin =
    final3rdAdmin1 * parseInt(freight?.roe_transit_admin);

  const ori3rdport1 = parseFloat(freight.transit_currency_port) || 0;
  const ori3rdport2 = parseFloat(
    freight.transit_currency_port_unitType === "1" ? 1 : freight.chargable_rate,
  );
  const ori3rdport3 = parseFloat(freight.transit_currency_port_gp) || 0;
  const ori3rdport4 = freight.transit_currency_port_unitType
    ? ori3rdport1 * ori3rdport2 * freight.transit_currency_port_unitTypeQTY
    : 0.0;
  let finalValueport = 0;
  if (ori3rdport4 > 0) {
    finalValueport = ori3rdport4 * (1 + ori3rdport3 / 100);
  }
  const final3rdport1 = isNaN(finalValueport)
    ? "0.00"
    : finalValueport.toFixed(2);
  const finalvlaueotPort = final3rdport1 * parseInt(freight?.roe_trans_port);

  const oriadv1 = parseFloat(freight.Transit_advanced_load) || 0;
  // const oriadv2 = parseFloat(freight.Transit_advanced_unit) || 0;
  const oriadv2 = parseFloat(
    freight.Transit_advanced_unitType === "1" ? 1 : freight.chargable_rate,
  );
  const oriadv3 = parseFloat(freight.Transit_advanced_gp) || 0;
  const oriadv4 = freight.Transit_advanced_unitType
    ? oriadv1 * oriadv2 * freight.Transit_advanced_unitTypeQTY
    : 0.0;
  let finalValueadv = 0;
  if (oriadv4 > 0) {
    finalValueadv = oriadv4 * (1 + oriadv3 / 100);
  }
  const final3rdadv1 = isNaN(finalValueadv) ? "0.00" : finalValueadv.toFixed(2);
  const finalvlaueotadv =
    final3rdadv1 * parseInt(freight?.Transit_advanced_gp_roe);

  const oridocumentation1 =
    parseFloat(freight.transit_change_Documentation) || 0;
  // const oridocumentation2 =
  //   parseFloat(freight.transit_change_Documentation_unit) || 0;
  const oridocumentation2 = parseFloat(
    freight.transit_change_Documentation_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const oridocumentation3 =
    parseFloat(freight.transit_change_Documentation_gp) || 0;
  const oridocumentation4 = freight.transit_change_Documentation_unitType
    ? oridocumentation1 *
    oridocumentation2 *
    freight.transit_change_Documentation_unitTypeQTY
    : 0.0;
  let finalValuedocumantation = 0;
  if (oridocumentation4 > 0) {
    finalValuedocumantation = oridocumentation4 * (1 + oridocumentation3 / 100);
  }
  const final3rdocumantation1 = isNaN(finalValuedocumantation)
    ? "0.00"
    : finalValuedocumantation.toFixed(2);
  const finalvlaueotDocumantation =
    final3rdocumantation1 * parseInt(freight?.roe_transit_change_Documentation);

  const totalChageswithOuTransit =
    safeNumber(oritransit4) +
    safeNumber(oriunpack4) +
    safeNumber(ori3rdparty4) +
    safeNumber(ori3rdAdmin4) +
    safeNumber(ori3rdport4) +
    safeNumber(oridocumentation4) +
    safeNumber(oriadv4) +
    safeNumber(oriThc4);

  console.log(totalChageswithOutExchangeinsurance);

  const transitRoe =
    safeNumber(finalvlaueotDocumantation) +
    safeNumber(finalvlaueotransit) +
    safeNumber(finalvlaueotadv) +
    safeNumber(finalvlaueotfineal) +
    safeNumber(finalvlaueotfunpack) +
    safeNumber(finalvlaueot3dparty) +
    safeNumber(finalvlaueotAdmin) +
    safeNumber(finalvlaueotPort);

  // ////////////////////////////////////destination charge////////////////////////

  const destinationdocumentation1 =
    parseFloat(freight.Destination_freight_currency_cost) || 0;
  // const destinationdocumentation2 =
  //   parseFloat(freight.Destination_freight_currency_unit) || 0;
  const destinationdocumentation2 = parseFloat(
    freight.Destination_freight_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const destinationdocumentation3 =
    parseFloat(freight.Destination_freight_currency_gp) || 0;
  const destinationdocumentation4 =
    freight.Destination_freight_currency_unitType
      ? destinationdocumentation1 *
      destinationdocumentation2 *
      freight.Destination_freight_currency_unitTypeQTY
      : 0.0;
  let finalValuedestanion = 0;
  if (destinationdocumentation4 > 0) {
    finalValuedestanion =
      destinationdocumentation4 * (1 + destinationdocumentation3 / 100);
  }
  const final3rdestination1 = isNaN(finalValuedestanion)
    ? "0.00"
    : finalValuedestanion.toFixed(2);
  const final3rdestinationRoe =
    final3rdestination1 * parseInt(freight?.Destination_freight_currency_Roe);

  const destinationTHCdocumentation1 =
    parseFloat(freight.Destination_THC_currency_cost) || 0;
  // const destinationTHCdocumentation2 =
  //   parseFloat(freight.Destination_THC_currency_unit) || 0;
  const destinationTHCdocumentation2 = parseFloat(
    freight.Destination_THC_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const destinationTHCdocumentation3 =
    parseFloat(freight.Destination_THC_currency_gp) || 0;
  const destinationTHCdocumentation4 = freight.Destination_THC_currency_unitType
    ? destinationTHCdocumentation1 *
    destinationTHCdocumentation2 *
    freight.Destination_THC_currency_unitTypeQTY
    : 0.0;
  let finalValueTHCdestanion = 0;
  if (destinationTHCdocumentation4 > 0) {
    finalValueTHCdestanion =
      destinationTHCdocumentation4 * (1 + destinationTHCdocumentation3 / 100);
  }
  const final3rTHCdestination1 = isNaN(finalValueTHCdestanion)
    ? "0.00"
    : finalValueTHCdestanion.toFixed(2);
  const final3rTHCdestinationRoe =
    final3rTHCdestination1 * parseInt(freight?.Destination_THC_currency_Roe);

  const destinationUnpackdocumentation1 =
    parseFloat(freight.Destination_Unpack_currency_cost) || 0;
  // const destinationUnpackdocumentation2 =
  //   parseFloat(freight.Destination_Unpack_currency_unit) || 0;
  const destinationUnpackdocumentation2 = parseFloat(
    freight.Destination_Unpack_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const destinationUnpackdocumentation3 =
    parseFloat(freight.Destination_Unpack_currency_gp) || 0;
  const destinationUnpackdocumentation4 =
    freight.Destination_Unpack_currency_unitType
      ? destinationUnpackdocumentation1 *
      destinationUnpackdocumentation2 *
      freight.Destination_Unpack_currency_unitTypeQTY
      : 0.0;
  let finalValueUnpackdestanion = 0;
  if (destinationUnpackdocumentation4 > 0) {
    finalValueUnpackdestanion =
      destinationUnpackdocumentation4 *
      (1 + destinationUnpackdocumentation3 / 100);
  }
  const final3runpackdestination1 = isNaN(finalValueUnpackdestanion)
    ? "0.00"
    : finalValueUnpackdestanion.toFixed(2);
  const final3rUnpackdestinationRoe =
    final3runpackdestination1 *
    parseInt(freight?.Destination_Unpack_currency_roe);

  const destinationfuelsurchargedocumentation1 =
    parseFloat(freight.Destination_fuelsurcharge_currency_cost) || 0;
  // const destinationfuelsurchargedocumentation2 =
  // parseFloat(freight.Destination_fuelsurcharge_currency_unit) || 0;
  const destinationfuelsurchargedocumentation2 = parseFloat(
    freight.Destination_fuelsurcharge_currency_typeUnit === "1"
      ? 1
      : freight.chargable_rate,
  );
  const destinationfuelsurchargedocumentation3 =
    parseFloat(freight.Destination_fuelsurcharge_currency_gp) || 0;
  const destinationfuelsurchargedocumentation4 =
    freight.Destination_fuelsurcharge_currency_typeUnit
      ? destinationfuelsurchargedocumentation1 *
      destinationfuelsurchargedocumentation2 *
      freight.Destination_fuelsurcharge_currency_typeUnitQTY
      : 0.0;
  let finalValueFulesurchargedestanion = 0;
  if (destinationfuelsurchargedocumentation4 > 0) {
    finalValueFulesurchargedestanion =
      destinationfuelsurchargedocumentation4 *
      (1 + destinationfuelsurchargedocumentation3 / 100);
  }
  const final3rfuelsurchargedestination1 = isNaN(
    finalValueFulesurchargedestanion,
  )
    ? "0.00"
    : finalValueFulesurchargedestanion.toFixed(2);
  const final3rfuelsurCahrgeestinationRoe =
    final3rfuelsurchargedestination1 *
    parseInt(freight?.Destination_fuelsurcharge_currency_roe);

  const destinatiadminsurcharge1 =
    parseFloat(freight.Destination_adminsurcharge_currency_cost) || 0;
  const destinatiadminsurcharge2 = parseFloat(
    freight.Destination_adminsurcharge_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const destinatiadminsurcharge2 =
  //   parseFloat(freight.Destination_adminsurcharge_currency_unit) || 0;
  const destinatiadminsurcharge3 =
    parseFloat(freight.Destination_adminsurcharge_currency_gp) || 0;
  const destinatiadminsurcharge4 =
    freight.Destination_adminsurcharge_currency_unitType
      ? destinatiadminsurcharge1 *
      destinatiadminsurcharge2 *
      freight.Destination_adminsurcharge_currency_unitTypeQTY
      : 0.0;
  let finalValueadminsurchargedestanion = 0;
  if (destinatiadminsurcharge4 > 0) {
    finalValueadminsurchargedestanion =
      destinatiadminsurcharge4 * (1 + destinatiadminsurcharge3 / 100);
  }
  const Valueadminsurchargedestanion = isNaN(finalValueadminsurchargedestanion)
    ? "0.00"
    : finalValueadminsurchargedestanion.toFixed(2);
  const adminsurcharge2 =
    Valueadminsurchargedestanion *
    parseInt(freight?.Destination_adminsurcharge_currency_roe);

  const destinatiportcargo1 =
    parseFloat(freight.Destination_portcargo_currency_cost) || 0;
  const destinatiportcargo2 = parseFloat(
    freight.Destination_portcargo_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const destinatiportcargo2 =
  //   parseFloat(freight.Destination_portcargo_currency_unit) || 0;
  const destinatiportcargo3 =
    parseFloat(freight.Destination_portcargo_currency_gp) || 0;
  const destinatiportcargo4 = freight.Destination_portcargo_currency_unitType
    ? destinatiportcargo1 *
    destinatiportcargo2 *
    freight.Destination_portcargo_currency_unitTypeQTY
    : 0.0;
  let finalValueportcargostanion = 0;
  if (destinatiportcargo4 > 0) {
    finalValueportcargostanion =
      destinatiportcargo4 * (1 + destinatiportcargo3 / 100);
  }
  const Vaportcargoion = isNaN(finalValueportcargostanion)
    ? "0.00"
    : finalValueportcargostanion.toFixed(2);
  const admiportcargo2 =
    Vaportcargoion * parseInt(freight?.Destination_portcargo_currency_roe);

  const destinatiAdvancedLoad1 =
    parseFloat(freight.Destination_AdvancedLoad_currency_cost) || 0;
  // const destinatiAdvancedLoad2 =
  //   parseFloat(freight.Destination_AdvancedLoad_currency_unit) || 0;
  const destinatiAdvancedLoad2 = parseFloat(
    freight.Destination_AdvancedLoad_currency_unitType === "1"
      ? 1
      : freight.chargable_rate,
  );
  const destinatiAdvancedLoad3 =
    parseFloat(freight.Destination_AdvancedLoad_currency_gp) || 0;
  const destinatiAdvancedLoad4 =
    destinatiAdvancedLoad1 *
    destinatiAdvancedLoad2 *
    freight.Destination_AdvancedLoad_currency_unitTypeQTY;
  let finalValueAdvancedLoadstanion = 0;
  if (destinatiAdvancedLoad4 > 0) {
    finalValueAdvancedLoadstanion =
      destinatiAdvancedLoad4 * (1 + destinatiAdvancedLoad3 / 100);
  }
  const VAdvancedLoadion = isNaN(finalValueAdvancedLoadstanion)
    ? "0.00"
    : finalValueAdvancedLoadstanion.toFixed(2);
  const desdvancedLoadion =
    VAdvancedLoadion * parseInt(freight?.Destination_AdvancedLoad_currency_roe);

  const destinati3rdpartyDesc1 =
    parseFloat(freight.Destination_3rdpartyDesc_currency_cost) || 0;
  const destinati3rdpartyDesc2 =
    // parseFloat(freight.Destination_3rdpartyDesc_currency_unit) || 0;
    parseFloat(
      freight.Destination_3rdpartyDesc_currency_unitType === "1"
        ? 1
        : freight.chargable_rate,
    );
  const destinati3rdpartyDesc3 =
    parseFloat(freight.Destination_3rdpartyDesc_currency_gp) || 0;
  const destinati3rdpartyload4 =
    freight.Destination_3rdpartyDesc_currency_unitType
      ? destinati3rdpartyDesc1 *
      destinati3rdpartyDesc2 *
      freight.Destination_3rdpartyDesc_currency_unitTypeQTY
      : 0.0;
  let finalValue3rdpartyloadstanion = 0;
  if (destinati3rdpartyload4 > 0) {
    finalValue3rdpartyloadstanion =
      destinati3rdpartyload4 * (1 + destinati3rdpartyDesc3 / 100);
  }
  const VAdvanced3rdpartyLoadion = isNaN(finalValue3rdpartyloadstanion)
    ? "0.00"
    : finalValue3rdpartyloadstanion.toFixed(2);
  const desdva3rdpartyion =
    VAdvanced3rdpartyLoadion *
    parseInt(freight?.Destination_3rdpartyDesc_currency_roe);

  const destindeliveryyDesc1 =
    parseFloat(freight.Destination_delivery_currency_cost) || 0;
  const destindeliveryyDesc2 =
    // parseFloat(freight.Destination_delivery_currency_unit) || 0;
    parseFloat(
      freight.Destination_delivery_currency_unitType === "1"
        ? 1
        : freight.chargable_rate,
    );

  const destindeliveryyDesc3 =
    parseFloat(freight.Destination_delivery_currency_gp) || 0;
  const destindeliveryyDesc4 = freight.Destination_delivery_currency_unitType
    ? destindeliveryyDesc1 *
    destindeliveryyDesc2 *
    freight.Destination_delivery_currency_unitTypeQTY
    : 0.0;
  let finaldeliveryrtyloadstanion = 0;
  if (destindeliveryyDesc4 > 0) {
    finaldeliveryrtyloadstanion =
      destindeliveryyDesc4 * (1 + destindeliveryyDesc3 / 100);
  }
  const VAdvandeliverytyLoadion = isNaN(finaldeliveryrtyloadstanion)
    ? "0.00"
    : finaldeliveryrtyloadstanion.toFixed(2);
  const desddeliverytyion =
    VAdvandeliverytyLoadion *
    parseInt(freight?.Destination_delivery_currency_roe);

  const destindfuelchangerDesc1 =
    parseFloat(freight.Destination_fuelcharge_currency_cost) || 0;
  const destindfuelchangerDesc2 =
    // parseFloat(freight.Destination_fuelcharge_currency_unit) || 0;
    parseFloat(
      freight.Destination_fuelcharge_currency_unitType === "1"
        ? 1
        : freight.chargable_rate,
    );
  const destindfuelchangerDesc3 =
    parseFloat(freight.Destination_fuelcharge_currency_gp) || 0;
  const destindfuelchangerDesc4 =
    freight.Destination_fuelcharge_currency_unitType
      ? destindfuelchangerDesc1 *
      destindfuelchangerDesc2 *
      freight.Destination_fuelcharge_currency_unitTypeQTY
      : 0.0;
  let finalfuelchangertyloadstanion = 0;
  if (destindfuelchangerDesc4 > 0) {
    finalfuelchangertyloadstanion =
      destindfuelchangerDesc4 * (1 + destindfuelchangerDesc3 / 100);
  }
  const VAdvfuelchangeon = isNaN(finalfuelchangertyloadstanion)
    ? "0.00"
    : finalfuelchangertyloadstanion.toFixed(2);
  const defuelchangyion =
    VAdvfuelchangeon * parseInt(freight?.Destination_fuelcharge_currency_roe);

  const totalChaDestinationTransit =
    safeNumber(destinationdocumentation4) +
    safeNumber(destinationTHCdocumentation4) +
    safeNumber(destinationUnpackdocumentation4) +
    safeNumber(destinationfuelsurchargedocumentation4) +
    safeNumber(destinatiadminsurcharge4) +
    safeNumber(destinatiportcargo4) +
    safeNumber(destinatiAdvancedLoad4) +
    safeNumber(destinati3rdpartyload4) +
    safeNumber(destindeliveryyDesc4) +
    safeNumber(destindfuelchangerDesc4);

  console.log(totalChageswithOutExchangeinsurance);

  const totalChaDestinationTransitRoe =
    safeNumber(finalvlaueotDocumantation) +
    safeNumber(final3rdestinationRoe) +
    safeNumber(final3rTHCdestinationRoe) +
    safeNumber(final3rUnpackdestinationRoe) +
    safeNumber(final3rfuelsurCahrgeestinationRoe) +
    safeNumber(adminsurcharge2) +
    safeNumber(admiportcargo2) +
    safeNumber(desdvancedLoadion) +
    safeNumber(desdva3rdpartyion) +
    safeNumber(desddeliverytyion);

  // /////////////////////////////////admin calculation/////////////////////////////

  const deadminAgencyesc1 =
    parseFloat(freight.Destination_AdminAgrncy_currency_cost) || 0;
  const deadminAgencyesc2 =
    // parseFloat(freight.Destination_AdminAgrncy_currency_unit) || 0;
    parseFloat(
      freight.Destination_AdminAgrncy_currency_unitType === "1"
        ? 1
        : freight.chargable_rate,
    );
  const deadminAgencyesc3 =
    parseFloat(freight.Destination_AdminAgrncy_currency_gp) || 0;
  const deadminAgencyesc4 = freight.Destination_AdminAgrncy_currency_unitType
    ? deadminAgencyesc1 *
    deadminAgencyesc2 *
    freight.Destination_AdminAgrncy_currency_unitQTY
    : 0.0;
  let finaldminAgencyestanion = 0;
  if (deadminAgencyesc4 > 0) {
    finaldminAgencyestanion = deadminAgencyesc4 * (1 + deadminAgencyesc3 / 100);
  }
  const VAadminAgencyngeon = isNaN(finaldminAgencyestanion)
    ? "0.00"
    : finaldminAgencyestanion.toFixed(2);
  const defuelchdminAgencyngangyion =
    VAadminAgencyngeon *
    parseInt(freight?.Destination_AdminAgrncy_currency_roe);

  const deaddisbursemantc1 =
    parseFloat(freight.Destination_disbursemant_currency_cost) || 0;
  const deaddisbursemantc2 =
    // parseFloat(freight.Destination_disbursemant_currency_unit) || 0;
    parseFloat(
      freight.Destination_disbursemant_currenc_unitType1 === "1"
        ? 1
        : freight.chargable_rate,
    );
  const deaddisbursemantc3 =
    parseFloat(freight.Destination_disbursemant_currency_gp) || 0;
  const deaddisbursemantc4 = freight.Destination_disbursemant_currenc_unitType1
    ? deaddisbursemantc1 *
    deaddisbursemantc2 *
    freight.Destination_disbursemant_currency_unitTypeQTY
    : 0.0;
  let finaladdisbursematanion = 0;
  if (deaddisbursemantc4 > 0) {
    finaladdisbursematanion =
      deaddisbursemantc4 * (1 + deaddisbursemantc3 / 100);
  }
  const VAdisbursemon = isNaN(finaladdisbursematanion)
    ? "0.00"
    : finaladdisbursematanion.toFixed(2);
  const dedisbursementon =
    VAdisbursemon * parseInt(freight?.Destination_disbursemant_currency_roe);

  const deadoctc1 = parseFloat(freight.Destination_doc_currency_cost) || 0;
  const deadoctc2 = parseFloat(
    freight.Destination_doc_currency_unittype === "1"
      ? 1
      : freight.chargable_rate,
  );
  // const deadoctc2 = parseFloat(freight.Destination_doc_currency_unit) || 0;
  const deadoctc3 = parseFloat(freight.Destination_doc_currency_gp) || 0;
  const deadoctc4 = freight.Destination_doc_currency_unittype
    ? deadoctc1 * deadoctc2 * freight.Destination_doc_currency_unittypeQTY
    : 0.0;
  let finaadoctnion = 0;
  if (deadoctc4 > 0) {
    finaadoctnion = deadoctc4 * (1 + deadoctc3 / 100);
  }
  const VAdocon = isNaN(finaadoctnion) ? "0.00" : finaadoctnion.toFixed(2);
  const dedisbudoon = VAdocon * parseInt(freight?.Destination_doc_currency_roe);

  const totaAdminransit =
    safeNumber(deadminAgencyesc4) +
    safeNumber(deaddisbursemantc4) +
    safeNumber(deadoctc4);

  console.log(totalChageswithOutExchangeinsurance);

  const totalAdminnsitRoe =
    safeNumber(defuelchdminAgencyngangyion) +
    safeNumber(dedisbursementon) +
    safeNumber(dedisbudoon);

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

  const invoiceBreakups = {
    org_pickUp: calculateInvoiceBreakup(finalvlaueoriginPickup, discountInputValue("org_pickUp"), freight.org_pickUp_vatTyp),
    origin_fuelSur: calculateInvoiceBreakup(finalvlaueoFuel, discountInputValue("origin_fuelSur"), freight.origin_fuelSur_vatTyp),
    origin_cfs: calculateInvoiceBreakup(finalvlaueocfs, discountInputValue("origin_cfs"), freight.origin_cfs_vatTyp),
    org_docFee: calculateInvoiceBreakup(finalvlaueodoc, discountInputValue("org_docFee"), freight.org_docFee_vatTyp),
    org_forwFee: calculateInvoiceBreakup(finalvlaueoforewarding, discountInputValue("org_forwFee"), freight.org_forwFee_vatTyp),
    org_clearance: calculateInvoiceBreakup(finalvlaueoCustomes, discountInputValue("org_clearance"), freight.org_clearance_vatTyp),
    ocenfreight_charge: calculateInvoiceBreakup(finalvlaueofreight, discountInputValue("ocenfreight_charge"), freight.ocenfreight_charge_vatTyp),
    insurance: calculateInvoiceBreakup(finalvlaueoInsurance, discountInputValue("insurance"), freight.insurance_vatTyp),
    trans_clear_fees: calculateInvoiceBreakup(finalvlaueotransit, discountInputValue("trans_clear_fees"), freight.trans_clear_fees_vatTyp),
    trans_THC_levy: calculateInvoiceBreakup(finalvlaueotfineal, discountInputValue("trans_THC_levy"), freight.trans_THC_levy_vatTyp),
    trans_unpack_charg: calculateInvoiceBreakup(finalvlaueotfunpack, discountInputValue("trans_unpack_charg"), freight.trans_unpack_charg_vatTyp),
    trans_CFS_charg: calculateInvoiceBreakup(finalvlaueot3dparty, discountInputValue("trans_CFS_charg"), freight.trans_CFS_charg_vatTyp),
    trans_admin_charg: calculateInvoiceBreakup(finalvlaueotAdmin, discountInputValue("trans_admin_charg"), freight.trans_admin_charg_vatTyp),
    trans_portCargo: calculateInvoiceBreakup(finalvlaueotPort, discountInputValue("trans_portCargo"), freight.trans_portCargo_vatTyp),
    trans_adv_loadHouse: calculateInvoiceBreakup(finalvlaueotadv, discountInputValue("trans_adv_loadHouse"), freight.trans_adv_loadHouse_vatTyp),
    trans_doc_fee: calculateInvoiceBreakup(finalvlaueotDocumantation, discountInputValue("trans_doc_fee"), freight.trans_doc_fee_vatTyp),
    dest_clearing_fees: calculateInvoiceBreakup(final3rdestinationRoe, discountInputValue("dest_clearing_fees"), freight.dest_clearing_fees_vatTyp),
    dest_THC_levy: calculateInvoiceBreakup(final3rTHCdestinationRoe, discountInputValue("dest_THC_levy"), freight.dest_THC_levy_vatTyp),
    dest_unpack_chrg: calculateInvoiceBreakup(final3rUnpackdestinationRoe, discountInputValue("dest_unpack_chrg"), freight.dest_unpack_chrg_vatTyp),
    dest_fuel_Surchar: calculateInvoiceBreakup(final3rfuelsurCahrgeestinationRoe, discountInputValue("dest_fuel_Surchar"), freight.dest_fuel_Surchar_vatTyp),
    dest_admin_chrg: calculateInvoiceBreakup(adminsurcharge2, discountInputValue("dest_admin_chrg"), freight.dest_admin_chrg_vatTyp),
    dest_portCargo: calculateInvoiceBreakup(admiportcargo2, discountInputValue("dest_portCargo"), freight.dest_portCargo_vatTyp),
    dest_adv_loadHouse: calculateInvoiceBreakup(desdvancedLoadion, discountInputValue("dest_adv_loadHouse"), freight.dest_adv_loadHouse_vatTyp),
    dest_CFS_charg: calculateInvoiceBreakup(desdva3rdpartyion, discountInputValue("dest_CFS_charg"), freight.dest_CFS_charg_vatTyp),
    dest_delivry_charge: calculateInvoiceBreakup(desddeliverytyion, discountInputValue("dest_delivry_charge"), freight.dest_delivry_charge_vatTyp),
    dest_fuel_surchrg: calculateInvoiceBreakup(defuelchangyion, discountInputValue("dest_fuel_surchrg"), freight.dest_fuel_surchrg_vatTyp),
    admin_agencyFee: calculateInvoiceBreakup(defuelchdminAgencyngangyion, discountInputValue("admin_agencyFee"), freight.admin_agencyFee_vatTyp),
    admin_disbur_fee: calculateInvoiceBreakup(dedisbursementon, discountInputValue("admin_disbur_fee"), freight.admin_disbur_fee_vatTyp),
    admin_doc_adminFees: calculateInvoiceBreakup(dedisbudoon, discountInputValue("admin_doc_adminFees"), freight.admin_doc_adminFees_vatTyp),
    cust_duty: calculateInvoiceBreakup(customChargeRows.cust_duty.finalAmt, discountInputValue("cust_duty"), freight.cust_duty_vatTyp),
    cust_vat: calculateInvoiceBreakup(customChargeRows.cust_vat.finalAmt, discountInputValue("cust_vat"), freight.cust_vat_vatTyp),
    adv_duty: calculateInvoiceBreakup(customChargeRows.adv_duty.finalAmt, discountInputValue("adv_duty"), freight.adv_duty_vatTyp),
    cust_penalty: calculateInvoiceBreakup(customChargeRows.cust_penalty.finalAmt, discountInputValue("cust_penalty"), freight.cust_penalty_vatTyp),
    custProv_pay: calculateInvoiceBreakup(customChargeRows.custProv_pay.finalAmt, discountInputValue("custProv_pay"), freight.custProv_pay_vatTyp),
    clearing_fee: calculateInvoiceBreakup(customChargeRows.clearing_fee.finalAmt, discountInputValue("clearing_fee"), freight.clearing_fee_vatTyp),
    disbursement: calculateInvoiceBreakup(customChargeRows.disbursement.finalAmt, discountInputValue("disbursement"), freight.disbursement_vatTyp),
    surcharge: calculateInvoiceBreakup(customChargeRows.surcharge.finalAmt, discountInputValue("surcharge"), freight.surcharge_vatTyp),
  };

  const totalVatInclusive = invoiceItemPrefixes.reduce(
    (total, prefix) => total + safeNumber(invoiceBreakups[prefix]?.inclusive),
    0,
  );

  const customChargeTotals = customChargePrefixes.reduce(
    (totals, prefix) => {
      if (!hasCustomChargeValue(prefix)) return totals;

      return {
        totalCost: totals.totalCost + safeNumber(customChargeRows[prefix]?.totalCost),
        finalAmount: totals.finalAmount + safeNumber(customChargeRows[prefix]?.finalAmt),
        vatInclusive:
          totals.vatInclusive + safeNumber(invoiceBreakups[prefix]?.inclusive),
      };
    },
    { totalCost: 0, finalAmount: 0, vatInclusive: 0 },
  );

  const invoiceItemsPayload = invoiceItemPrefixes.map((prefix) => {
    const existingItem = Array.isArray(freight?.items)
      ? freight.items.find((row) => row?.prefix === prefix)
      : undefined;
    const rowBreakup = invoiceBreakups[prefix] || {};
    const itemId = pickFirstValue(
      freight?.[`${prefix}_item_id`],
      existingItem?.id,
      existingItem?.item_id,
      existingItem?.supplier_invoice_item_id,
    );

    return {
      ...(existingItem || {}),
      id: itemId,
      item_id: itemId,
      supplier_invoice_item_id: itemId,
      prefix,
      discount_percent: discountInputValue(prefix),
      [`${prefix}_disc%`]: discountInputValue(prefix),
      discount_amount: rowBreakup.disc,
      exclusive: rowBreakup.exclusive,
      taxable_amount: rowBreakup.exclusive,
      tax_amount: rowBreakup.vat,
      vat: rowBreakup.vat,
      vat_inclusive: rowBreakup.inclusive,
      grand_total: rowBreakup.inclusive,
    };
  });

  const estimateCalculate = async () => {
    try {
      const payload = {
        ...freight,
        supplier_invoice_no: freight.supplier_invoice_no,
        due_date: freight.due_date,
        supplier_invoice_id: item,
        invoice_total: totalVatInclusive,
        items: invoiceItemsPayload,
        invoice_items: invoiceItemsPayload,
        supplier_invoice_items: invoiceItemsPayload,
        supplier_id: freight?.supplier_id,
        shipment_id: Number(freight.shipment_id || ""),
        origin_pick_up_cost: freight.origin_pick_up_cost,
        origin_pick_up_fees: freight.origin_pick_up_fees,
        origin_pickup_fee_gpcalc: freight.origin_pickup_fee_gpcalc,
        roe_origin_currencyorigin: freight.roe_origin_currencyorigin,
        finalvlaueoriginPickup: finalvlaueoriginPickup,
        oripick4: oripick4,
        finalori1: finalori1,
        origin_pick_up_fuel_cost: freight.origin_pick_up_fuel_cost,
        origin_pick_up_fuel_fees: freight.origin_pick_up_fuel_fees,
        origin_pick_fuelGP: freight.origin_pick_fuelGP,
        pickup_freight_currency: freight.pickup_freight_currency,
        freight_charge_currency: freight.freight_charge_currency,
        Transit_currency: freight.Transit_currency,
        Destination_freight_currency: freight.Destination_freight_currency,
        admin_currency_charge: freight.admin_currency_charge,
        chargable_rate: freight.chargable_rate,
        orifuel4: orifuel4,
        finalfuel1: finalfuel1,
        roe_origin_fuel_currency: freight.roe_origin_fuel_currency,
        finalvlaueoFuel: finalvlaueoFuel,
        origin_pick_up_cfs_cost: freight.origin_pick_up_cfs_cost,
        origin_pick_up_cfs_fees: freight.origin_pick_up_cfs_fees,
        origin_pickup_vfs_gp: freight.origin_pickup_vfs_gp,
        oricfs4: oricfs4,
        finalcfs1: finalcfs1,
        roe_origin_cfs_currency: freight.roe_origin_cfs_currency,
        roe_freight_currency: freight.roe_freight_currency,
        finalvlaueocfs: finalvlaueocfs,
        origin_pick_up_documantion_cost:
          freight.origin_pick_up_documantion_cost,
        origin_pick_up_documantation_fees:
          freight.origin_pick_up_documantation_fees,
        origin_pick_documantation_cost_gp:
          freight.origin_pick_documantation_cost_gp,
        oridoc4: oridoc4,
        finaldoc1: finaldoc1,
        roe_origin_doc_currency: freight.roe_origin_doc_currency,
        finalvlaueodoc: finalvlaueodoc,
        origin_pick_up_forewarding_cost:
          freight.origin_pick_up_forewarding_cost,
        origin_pick_up_forewarding_fees:
          freight.origin_pick_up_forewarding_fees,
        origin_pickup_forewarding_gp: freight.origin_pickup_forewarding_gp,
        oriforewarding4: oriforewarding4,
        roe_origin_forewarding: freight.roe_origin_forewarding,
        finalforewarding1: finalforewarding1,
        finalvlaueoforewarding: finalvlaueoforewarding,
        origin_pick_up_custome_cost: freight.origin_pick_up_custome_cost,
        origin_pick_up_custome_clearance:
          freight.origin_pick_up_custome_clearance,
        origin_pickup_custome_gp: freight.origin_pickup_custome_gp,
        oricustome4: oricustome4,
        roe_origin_customes: freight.roe_origin_customes,
        finalcustomes1: finalcustomes1,
        finalvlaueoCustomes: finalvlaueoCustomes,
        totalChageswithOutExchange: totalChageswithOutExchange,
        totalChangeRoeOrigin: totalChangeRoeOrigin,
        freight_charge_currency_cost: freight.freight_charge_currency_cost,
        freight_charge_currency_fees: freight.freight_charge_currency_fees,
        freight_charge_currency_gp: freight.freight_charge_currency_gp,
        orifreight4: orifreight4,
        finalfreight1: finalfreight1,
        finalvlaueofreight: finalvlaueofreight,
        freight_currency_insurance_cost:
          freight.freight_currency_insurance_cost,
        freight_currency_insurance_unit:
          freight.freight_currency_insurance_unit,
        freightorigin_insurance_gp: freight.freightorigin_insurance_gp,
        oriinsurance4: oriinsurance4,
        roe_insurance_currency: freight.roe_insurance_currency,
        finalinsurance1: finalinsurance1,
        finalvlaueoInsurance: finalvlaueoInsurance,
        totalChageswithOutExchangeinsurance:
          totalChageswithOutExchangeinsurance,
        totalChangeRoeOriginaftercalcuinsurance:
          totalChangeRoeOriginaftercalcuinsurance,
        Transit_currency_Cost: freight.Transit_currency_Cost,
        Transit_currency_unit: freight.Transit_currency_unit,
        Transit_currency_gp: freight.Transit_currency_gp,
        Destination_disbursemant_currenc_unitType1:
          freight.Destination_disbursemant_currenc_unitType1,
        Transit_currency_roe: freight.Transit_currency_roe,
        finaltransit1: finaltransit1,
        finalvlaueotransit: finalvlaueotransit,
        oritransit4: oritransit4,
        transit_currency_THC_cost: freight.transit_currency_THC_cost,
        transit_currency_THC_init: freight.transit_currency_THC_init,
        transit_currency_THC_gp: freight.transit_currency_THC_gp,
        roe_Transit_Thc: freight.roe_Transit_Thc,
        finalThc1: finalThc1,
        finalvlaueotfineal: finalvlaueotfineal,
        oriThc4: oriThc4,
        Transit_currency_unpack_cost: freight.Transit_currency_unpack_cost,
        Transit_currency_unpack_unit: freight.Transit_currency_unpack_unit,
        Transit_currency_unpack_gp: freight.Transit_currency_unpack_gp,
        Transit_unpack_roe: freight.Transit_unpack_roe,
        finalunpack1: finalunpack1,
        finalvlaueotfunpack: finalvlaueotfunpack,
        oriunpack4: oriunpack4,
        transit_3rd_party_cost: freight.transit_3rd_party_cost,
        transit_3rd_party_unit: freight.transit_3rd_party_unit,
        transit_3rd_party_gp: freight.transit_3rd_party_gp,
        ori3rdparty4: ori3rdparty4,
        final3rdparty1: final3rdparty1,
        finalvlaueot3dparty: finalvlaueot3dparty,
        transit_currency_3rd: freight.transit_currency_3rd,
        transit_admin_change: freight.transit_admin_change,
        transit_admin_unit: freight.transit_admin_unit,
        transit_admin_gp: freight.transit_admin_gp,
        ori3rdAdmin4: ori3rdAdmin4,
        final3rdAdmin1: final3rdAdmin1,
        finalvlaueotAdmin: finalvlaueotAdmin,
        roe_transit_admin: freight.roe_transit_admin,
        transit_currency_port: freight.transit_currency_port,
        transit_currency_port_unit: freight.transit_currency_port_unit,
        transit_currency_port_gp: freight.transit_currency_port_gp,
        ori3rdport4: ori3rdport4,
        final3rdport1: final3rdport1,
        finalvlaueotPort: finalvlaueotPort,
        roe_trans_port: freight.roe_trans_port,
        Transit_advanced_load: freight.Transit_advanced_load,
        Transit_advanced_unit: freight.Transit_advanced_unit,
        Transit_advanced_gp: freight.Transit_advanced_gp,
        Transit_advanced_gp_roe: freight.Transit_advanced_gp_roe,
        oriadv4: oriadv4,
        final3rdadv1: final3rdadv1,
        finalvlaueotadv: finalvlaueotadv,
        transit_change_Documentation: freight.transit_change_Documentation,
        transit_change_Documentation_unit:
          freight.transit_change_Documentation_unit,
        transit_change_Documentation_gp:
          freight.transit_change_Documentation_gp,
        roe_transit_change_Documentation:
          freight.roe_transit_change_Documentation,
        oridocumentation4: oridocumentation4,
        final3rdocumantation1: final3rdocumantation1,
        finalvlaueotDocumantation: finalvlaueotDocumantation,
        totalChageswithOuTransit: totalChageswithOuTransit,
        transitRoe: transitRoe,
        Destination_freight_currency_cost:
          freight.Destination_freight_currency_cost,
        Destination_freight_currency_unit:
          freight.Destination_freight_currency_unit,
        Destination_freight_currency_gp:
          freight.Destination_freight_currency_gp,
        destinationdocumentation4: destinationdocumentation4,
        final3rdestination1: final3rdestination1,
        final3rdestinationRoe: final3rdestinationRoe,
        Destination_freight_currency_Roe:
          freight.Destination_freight_currency_Roe,

        Destination_THC_currency_cost: freight.Destination_THC_currency_cost,
        Destination_THC_currency_unit: freight.Destination_THC_currency_unit,
        Destination_THC_currency_gp: freight.Destination_THC_currency_gp,
        destinationTHCdocumentation4: destinationTHCdocumentation4,
        final3rTHCdestination1: final3rTHCdestination1,
        final3rTHCdestinationRoe: final3rTHCdestinationRoe,
        Destination_THC_currency_Roe: freight.Destination_THC_currency_Roe,
        Destination_Unpack_currency_cost:
          freight.Destination_Unpack_currency_cost,
        Destination_Unpack_currency_unit:
          freight.Destination_Unpack_currency_unit,
        Destination_Unpack_currency_gp: freight.Destination_Unpack_currency_gp,
        destinationUnpackdocumentation4: destinationUnpackdocumentation4,
        final3runpackdestination1: final3runpackdestination1,
        final3rUnpackdestinationRoe: final3rUnpackdestinationRoe,
        Destination_Unpack_currency_roe:
          freight.Destination_Unpack_currency_roe,
        Destination_fuelsurcharge_currency_cost:
          freight.Destination_fuelsurcharge_currency_cost,
        Destination_fuelsurcharge_currency_unit:
          freight.Destination_fuelsurcharge_currency_unit,
        Destination_fuelsurcharge_currency_gp:
          freight.Destination_fuelsurcharge_currency_gp,
        destinationfuelsurchargedocumentation4:
          destinationfuelsurchargedocumentation4,
        final3rfuelsurchargedestination1: final3rfuelsurchargedestination1,
        final3rfuelsurCahrgeestinationRoe: final3rfuelsurCahrgeestinationRoe,
        Destination_fuelsurcharge_currency_roe:
          freight.Destination_fuelsurcharge_currency_roe,
        Destination_adminsurcharge_currency_cost:
          freight.Destination_adminsurcharge_currency_cost,
        Destination_adminsurcharge_currency_unit:
          freight.Destination_adminsurcharge_currency_unit,
        Destination_adminsurcharge_currency_gp:
          freight.Destination_adminsurcharge_currency_gp,
        destinatiadminsurcharge4: destinatiadminsurcharge4,
        Valueadminsurchargedestanion: Valueadminsurchargedestanion,
        adminsurcharge2: adminsurcharge2,
        Destination_adminsurcharge_currency_roe:
          freight.Destination_adminsurcharge_currency_roe,
        Destination_portcargo_currency_cost:
          freight.Destination_portcargo_currency_cost,
        Destination_portcargo_currency_unit:
          freight.Destination_portcargo_currency_unit,
        Destination_portcargo_currency_gp:
          freight.Destination_portcargo_currency_gp,
        destinatiportcargo4: destinatiportcargo4,
        Vaportcargoion: Vaportcargoion,
        admiportcargo2: admiportcargo2,
        Destination_portcargo_currency_roe:
          freight.Destination_portcargo_currency_roe,
        Destination_AdvancedLoad_currency_cost:
          freight.Destination_AdvancedLoad_currency_cost,
        Destination_AdvancedLoad_currency_unit:
          freight.Destination_AdvancedLoad_currency_unit,
        Destination_AdvancedLoad_currency_gp:
          freight.Destination_AdvancedLoad_currency_gp,
        destinatiAdvancedLoad4: destinatiAdvancedLoad4,
        VAdvancedLoadion: VAdvancedLoadion,
        desdvancedLoadion: desdvancedLoadion,
        Destination_AdvancedLoad_currency_roe:
          freight.Destination_AdvancedLoad_currency_roe,
        Destination_3rdpartyDesc_currency_cost:
          freight.Destination_3rdpartyDesc_currency_cost,
        Destination_3rdpartyDesc_currency_unit:
          freight.Destination_3rdpartyDesc_currency_unit,
        Destination_3rdpartyDesc_currency_gp:
          freight.Destination_3rdpartyDesc_currency_gp,
        destinati3rdpartyload4: destinati3rdpartyload4,
        VAdvanced3rdpartyLoadion: VAdvanced3rdpartyLoadion,
        desdva3rdpartyion: desdva3rdpartyion,
        Destination_3rdpartyDesc_currency_roe:
          freight.Destination_3rdpartyDesc_currency_roe,
        Destination_delivery_currency_cost:
          freight.Destination_delivery_currency_cost,
        Destination_delivery_currency_unit:
          freight.Destination_delivery_currency_unit,
        Destination_delivery_currency_gp:
          freight.Destination_delivery_currency_gp,
        destindeliveryyDesc4: destindeliveryyDesc4,
        VAdvandeliverytyLoadion: VAdvandeliverytyLoadion,
        desddeliverytyion: desddeliverytyion,
        Destination_delivery_currency_roe:
          freight.Destination_delivery_currency_roe,
        Destination_fuelcharge_currency_cost:
          freight.Destination_fuelcharge_currency_cost,
        Destination_fuelcharge_currency_unit:
          freight.Destination_fuelcharge_currency_unit,
        Destination_fuelcharge_currency_gp:
          freight.Destination_fuelcharge_currency_gp,
        destindfuelchangerDesc4: destindfuelchangerDesc4,
        VAdvfuelchangeon: VAdvfuelchangeon,
        defuelchangyion: defuelchangyion,
        Destination_fuelcharge_currency_roe:
          freight.Destination_fuelcharge_currency_roe,
        totalChaDestinationTransit: totalChaDestinationTransit,
        totalChaDestinationTransitRoe: totalChaDestinationTransitRoe,
        Destination_AdminAgrncy_currency_cost:
          freight.Destination_AdminAgrncy_currency_cost,
        Destination_AdminAgrncy_currency_unit:
          freight.Destination_AdminAgrncy_currency_unit,
        Destination_AdminAgrncy_currency_gp:
          freight.Destination_AdminAgrncy_currency_gp,
        deadminAgencyesc4: deadminAgencyesc4,
        // finaldminAgencyestanion: finaldminAgencyestanion,
        VAadminAgencyngeon: VAadminAgencyngeon,
        defuelchdminAgencyngangyion: defuelchdminAgencyngangyion,
        Destination_AdminAgrncy_currency_roe:
          freight.Destination_AdminAgrncy_currency_roe,
        Destination_disbursemant_currency_cost:
          freight.Destination_disbursemant_currency_cost,
        Destination_disbursemant_currency_unit:
          freight.Destination_disbursemant_currency_unit,
        Destination_disbursemant_currency_gp:
          freight.Destination_disbursemant_currency_gp,
        deaddisbursemantc4: deaddisbursemantc4,
        VAdisbursemon: VAdisbursemon,
        dedisbursementon: dedisbursementon,
        Destination_disbursemant_currency_roe:
          freight.Destination_disbursemant_currency_roe,
        Destination_doc_currency_cost: freight.Destination_doc_currency_cost,
        Destination_doc_currency_unit: freight.Destination_doc_currency_unit,
        Destination_doc_currency_gp: freight.Destination_doc_currency_gp,
        deadoctc4: deadoctc4,
        VAdocon: VAdocon,
        dedisbudoon: dedisbudoon,
        Destination_doc_currency_roe: freight.Destination_doc_currency_roe,
        deadoctc4: deadoctc4,
        totaAdminransit: totaAdminransit,
        totalAdminnsitRoe: totalAdminnsitRoe,
        sumofall: sumofall,
        sumofRoe: sumofRoe,
        freight_charge_currencyQTY: freight.freight_charge_currencyQTY,
        origin_pick_up_fuel_unitTypeQTY:
          freight.origin_pick_up_fuel_unitTypeQTY,
        origin_pick_up_cfs_unitTypeQTY: freight.origin_pick_up_cfs_unitTypeQTY,
        origin_pick_up_forewarding_unitTypeQTY:
          freight.origin_pick_up_forewarding_unitTypeQTY,
        origin_pick_up_documantation_unitTypeQTY:
          freight.origin_pick_up_documantation_unitTypeQTY,
        origin_pick_up_custome_unitTypeQTY:
          freight.origin_pick_up_custome_unitTypeQTY,
        freight_charge_currency_unitTypeQTY:
          freight.freight_charge_currency_unitTypeQTY,
        freight_currency_insurance_unittypeQTY:
          freight.freight_currency_insurance_unittypeQTY,
        Transit_currency_unitTpeQTY: freight.Transit_currency_unitTpeQTY,
        transit_currency_THC_initTypeQTY:
          freight.transit_currency_THC_initTypeQTY,
        transit_currency_THC_initTypeeQTY:
          freight.transit_currency_THC_initTypeeQTY,
        transit_3rd_party_unittypeQTY: freight.transit_3rd_party_unittypeQTY,
        transit_admin_unittypeQTY: freight.transit_admin_unittypeQTY,
        transit_currency_port_unitTypeQTY:
          freight.transit_currency_port_unitTypeQTY,
        Transit_advanced_unitTypeQTY: freight.Transit_advanced_unitTypeQTY,
        transit_change_Documentation_unitTypeQTY:
          freight.transit_change_Documentation_unitTypeQTY,
        Destination_freight_currency_unitTypeQTY:
          freight.Destination_freight_currency_unitTypeQTY,
        Destination_THC_currency_unitTypeQTY:
          freight.Destination_THC_currency_unitTypeQTY,
        Destination_Unpack_currency_unitTypeQTY:
          freight.Destination_Unpack_currency_unitTypeQTY,
        Destination_fuelsurcharge_currency_typeUnitQTY:
          freight.Destination_fuelsurcharge_currency_typeUnitQTY,
        Destination_adminsurcharge_currency_unitTypeQTY:
          freight.Destination_adminsurcharge_currency_unitTypeQTY,
        Destination_portcargo_currency_unitTypeQTY:
          freight.Destination_portcargo_currency_unitTypeQTY,
        Destination_AdvancedLoad_currency_unitTypeQTY:
          freight.Destination_AdvancedLoad_currency_unitTypeQTY,
        Destination_3rdpartyDesc_currency_unitTypeQTY:
          freight.Destination_3rdpartyDesc_currency_unitTypeQTY,
        Destination_delivery_currency_unitTypeQTY:
          freight.Destination_delivery_currency_unitTypeQTY,
        Destination_fuelcharge_currency_unitTypeQTY:
          freight.Destination_fuelcharge_currency_unitTypeQTY,
        Destination_AdminAgrncy_currency_unitQTY:
          freight.Destination_AdminAgrncy_currency_unitQTY,
        Destination_disbursemant_currency_unitTypeQTY:
          freight.Destination_disbursemant_currency_unitTypeQTY,
        origin_pick_up_unitType: freight.origin_pick_up_unitType,
        origin_pick_up_fuel_unitType: freight.origin_pick_up_fuel_unitType,
        origin_pick_up_cfs_unitType: freight.origin_pick_up_cfs_unitType,
        origin_pick_up_forewarding_unitType:
          freight.origin_pick_up_forewarding_unitType,
        origin_pick_up_documantation_unitType:
          freight.origin_pick_up_documantation_unitType,
        origin_pick_up_custome_unitType:
          freight.origin_pick_up_custome_unitType,
        freight_charge_currency_unitType:
          freight.freight_charge_currency_unitType,
        freight_currency_insurance_unittype:
          freight.freight_currency_insurance_unittype,
        Transit_currency_unitTpe: freight.Transit_currency_unitTpe,
        transit_currency_THC_initType: freight.transit_currency_THC_initType,
        Transit_currency_unpack_unitType:
          freight.Transit_currency_unpack_unitType,
        transit_3rd_party_unittype: freight.transit_3rd_party_unittype,
        transit_admin_unittype: freight.transit_admin_unittype,
        transit_currency_port_unitType: freight.transit_currency_port_unitType,
        Transit_advanced_unitType: freight.Transit_advanced_unitType,
        transit_change_Documentation_unitType:
          freight.transit_change_Documentation_unitType,
        Destination_freight_currency_unitType:
          freight.Destination_freight_currency_unitType,
        Destination_THC_currency_unitType:
          freight.Destination_THC_currency_unitType,
        Destination_Unpack_currency_unitType:
          freight.Destination_Unpack_currency_unitType,
        Destination_fuelsurcharge_currency_typeUnit:
          freight.Destination_fuelsurcharge_currency_typeUnit,
        Destination_adminsurcharge_currency_unitType:
          freight.Destination_adminsurcharge_currency_unitType,
        Destination_portcargo_currency_unitType:
          freight.Destination_portcargo_currency_unitType,
        Destination_AdvancedLoad_currency_unitType:
          freight.Destination_AdvancedLoad_currency_unitType,
        Destination_3rdpartyDesc_currency_unitType:
          freight.Destination_3rdpartyDesc_currency_unitType,
        Destination_delivery_currency_unitType:
          freight.Destination_delivery_currency_unitType,
        Destination_fuelcharge_currency_unitType:
          freight.Destination_fuelcharge_currency_unitType,
        Destination_AdminAgrncy_currency_unitType:
          freight.Destination_AdminAgrncy_currency_unitType,
        Destination_doc_currency_unittype:
          freight.Destination_doc_currency_unittype,
        Destination_AdminAgrncy_currency_unitType:
          freight.Destination_AdminAgrncy_currency_unitType,
        cust_duty_qty: freight.cust_duty_qty,
        cust_duty_curr: freight.cust_duty_curr,
        cust_duty_cost: freight.cust_duty_cost,
        cust_duty_unitTyp: freight.cust_duty_unitTyp,
        cust_duty_unit: customChargeRows.cust_duty.unit,
        cust_duty_TCost: customChargeRows.cust_duty.totalCost,
        cust_duty_roe: freight.cust_duty_roe,
        cust_duty_finalAmt: customChargeRows.cust_duty.finalAmt,
        cust_duty_vatTyp: freight.cust_duty_vatTyp,
        "cust_duty_disc%": freight["cust_duty_disc%"],
        cust_duty_disc: invoiceBreakups.cust_duty.disc,
        cust_duty_vatIncl: invoiceBreakups.cust_duty.inclusive,
        cust_vat_qty: freight.cust_vat_qty,
        cust_vat_curr: freight.cust_vat_curr,
        cust_vat_cost: freight.cust_vat_cost,
        cust_vat_unitTyp: freight.cust_vat_unitTyp,
        cust_vat_unit: customChargeRows.cust_vat.unit,
        cust_vat_TCost: customChargeRows.cust_vat.totalCost,
        cust_vat_roe: freight.cust_vat_roe,
        cust_vat_finalAmt: customChargeRows.cust_vat.finalAmt,
        cust_vat_vatTyp: freight.cust_vat_vatTyp,
        "cust_vat_disc%": freight["cust_vat_disc%"],
        cust_vat_disc: invoiceBreakups.cust_vat.disc,
        cust_vat_vatIncl: invoiceBreakups.cust_vat.inclusive,
        adv_duty_qty: freight.adv_duty_qty,
        adv_duty_curr: freight.adv_duty_curr,
        adv_duty_cost: freight.adv_duty_cost,
        adv_duty_unitTyp: freight.adv_duty_unitTyp,
        adv_duty_unit: customChargeRows.adv_duty.unit,
        adv_duty_TCost: customChargeRows.adv_duty.totalCost,
        adv_duty_roe: freight.adv_duty_roe,
        adv_duty_finalAmt: customChargeRows.adv_duty.finalAmt,
        cust_penalty_qty: freight.cust_penalty_qty,
        cust_penalty_curr: freight.cust_penalty_curr,
        cust_penalty_cost: freight.cust_penalty_cost,
        cust_penalty_unitTyp: freight.cust_penalty_unitTyp,
        cust_penalty_unit: customChargeRows.cust_penalty.unit,
        cust_penalty_TCost: customChargeRows.cust_penalty.totalCost,
        cust_penalty_roe: freight.cust_penalty_roe,
        cust_penalty_finalAmt: customChargeRows.cust_penalty.finalAmt,
        cust_penalty_vatTyp: freight.cust_penalty_vatTyp,
        "cust_penalty_disc%": freight["cust_penalty_disc%"],
        cust_penalty_disc: invoiceBreakups.cust_penalty.disc,
        cust_penalty_vatIncl: invoiceBreakups.cust_penalty.inclusive,
        custProv_pay_qty: freight.custProv_pay_qty,
        custProv_pay_curr: freight.custProv_pay_curr,
        custProv_pay_cost: freight.custProv_pay_cost,
        custProv_pay_unitTyp: freight.custProv_pay_unitTyp,
        custProv_pay_unit: customChargeRows.custProv_pay.unit,
        custProv_pay_TCost: customChargeRows.custProv_pay.totalCost,
        custProv_pay_roe: freight.custProv_pay_roe,
        custProv_pay_finalAmt: customChargeRows.custProv_pay.finalAmt,
        custProv_pay_vatTyp: freight.custProv_pay_vatTyp,
        "custProv_pay_disc%": freight["custProv_pay_disc%"],
        custProv_pay_disc: invoiceBreakups.custProv_pay.disc,
        custProv_pay_vatIncl: invoiceBreakups.custProv_pay.inclusive,
        clearing_fee_qty: freight.clearing_fee_qty,
        clearing_fee_curr: freight.clearing_fee_curr,
        clearing_fee_cost: freight.clearing_fee_cost,
        clearing_fee_unitTyp: freight.clearing_fee_unitTyp,
        clearing_fee_unit: customChargeRows.clearing_fee.unit,
        clearing_fee_TCost: customChargeRows.clearing_fee.totalCost,
        clearing_fee_roe: freight.clearing_fee_roe,
        clearing_fee_finalAmt: customChargeRows.clearing_fee.finalAmt,
        clearing_fee_vatTyp: freight.clearing_fee_vatTyp,
        "clearing_fee_disc%": freight["clearing_fee_disc%"],
        clearing_fee_disc: invoiceBreakups.clearing_fee.disc,
        clearing_fee_vatIncl: invoiceBreakups.clearing_fee.inclusive,
        disbursement_qty: freight.disbursement_qty,
        disbursement_curr: freight.disbursement_curr,
        disbursement_cost: freight.disbursement_cost,
        disbursement_unitTyp: freight.disbursement_unitTyp,
        disbursement_unit: customChargeRows.disbursement.unit,
        disbursement_TCost: customChargeRows.disbursement.totalCost,
        disbursement_roe: freight.disbursement_roe,
        disbursement_finalAmt: customChargeRows.disbursement.finalAmt,
        disbursement_vatTyp: freight.disbursement_vatTyp,
        "disbursement_disc%": freight["disbursement_disc%"],
        disbursement_disc: invoiceBreakups.disbursement.disc,
        disbursement_vatIncl: invoiceBreakups.disbursement.inclusive,
        surcharge_qty: freight.surcharge_qty,
        surcharge_curr: freight.surcharge_curr,
        surcharge_cost: freight.surcharge_cost,
        surcharge_unitTyp: freight.surcharge_unitTyp,
        surcharge_unit: customChargeRows.surcharge.unit,
        surcharge_TCost: customChargeRows.surcharge.totalCost,
        surcharge_roe: freight.surcharge_roe,
        surcharge_finalAmt: customChargeRows.surcharge.finalAmt,
        surcharge_vatTyp: freight.surcharge_vatTyp,
        "surcharge_disc%": freight["surcharge_disc%"],
        surcharge_disc: invoiceBreakups.surcharge.disc,
        surcharge_vatIncl: invoiceBreakups.surcharge.inclusive,
        Destination_doc_currency_unittypeQTY:
          freight.Destination_doc_currency_unittypeQTY,
        ...((getdata.quote_estimate_id || quotationID) && {
          quote_estimate_id: getdata.quote_estimate_id || quotationID,
        }),
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addEstimatSupplierInvoice`,
        payload,
      );
      console.log(response.data)
      if (response.data.success === true) {
        setQuotationID(response.data.ID);
        toast.success(response.data.message);
        navigate("/Admin/Supplier_Invoice");
      } else {
        console.log("some thing went wrong");
      }
    } catch (error) {
      console.log("Full Error =>", error);
      // fdsssssssssss
      console.log("Error Response =>", error.response);

      console.log("Error Data =>", error.response?.data);

      console.log("Error Message =>", error.message);

      console.log("Status Code =>", error.response?.status);

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };
  const handlepresss = (e) => {
    if (e.charCode < 42 || e.charCode > 57) {
      e.preventDefault();
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
  }, 1000);
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

  const handleclicknav = () => {
    window.history.back();
  };
  const closemodal = () => {
    setOpenmodal(false);
  };
  const closemodal1 = () => {
    setOpenmodal1(false);
  };
  useEffect(() => {
    getdatsupplier()
  }, [])
  const getdatsupplier = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}supplier-list`)
      .then((response) => {
        setDat1(response.data.data);
      })
      .catch((error) => {
        console.log(error);
        test(error.response.data);
      });
  };
  const getdata1 = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getWaybillDropdown`)
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

  const downloadPDF = () => {
    setShowData(false); // PDF ke liye limited UI
  };
  const downloadPDF1 = () => {
    console.log(showData);
    // setShowData(true)
    console.log(showData);
    const element = pdfRef.current;
    const contentWidth = element.scrollWidth;
    const contentHeight = element.scrollHeight;
    const rect = element.getBoundingClientRect();
    const options = {
      margin: 0,
      filename: "page.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 1.5, useCORS: true },
      jsPDF: {
        unit: "px",
        format: [rect.width, rect.height],
        orientation: "portrait",
      },
      pagebreak: false,
    };
    html2pdf().from(element).set(options).save();
    setShowData(false);
    console.log(showData);
  };
  const setSelected1111 = async (value) => {
    console.log(value);
    setSelected(value);
    setFreight((prevInputData) => ({
      ...prevInputData,
      shipment_id: value,
    }));
  };
  const apidataget = async () => {
    const payload = {
      shipment_id: freight.shipment_id || selected
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetShipmentDetails`, payload,
      );
      console.log(response.data)
      setOpenmodal(false)
      setGetdata(response.data.shipment);
      setFreight((prevInputData) => ({
        ...prevInputData,
        ...(response.data.shipment || {}),
      }));
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  const setSelecSupplier = async (value) => {
    console.log(value);
    setSelectedSupplier(value);
    setTimeout(() => {
      setOpenmodal1(false);
    }, 1000)
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
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB");
  };
  return (
    <>
      {openmodal1 && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5 className="bold">Select Supplier</h5>
              <button className="btn-close" onClick={() => setOpenmodal1()}>
                <CloseIcon />
              </button>
            </div>
            <div className="custom-modal-body">
              <div style={{ margin: "20px" }}>
                <select
                  className="form-select"
                  value={selected}
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
      {openmodal && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <div className="custom-modal-header">
              <h5 className="bold">Select Shipment</h5>

              <button className="btn-close" onClick={() => closemodal()}>
                <CloseIcon />
              </button>
            </div>

            <div className="custom-modal-body">
              <div style={{ margin: "20px" }}>
                <select
                  className="form-select"
                  value={freight.shipment_id || ""}
                  onChange={(e) => setSelected1111(e.target.value)}
                >
                  <option value="">Select Shipment</option>
                  {dat.map((item) => (
                    <option key={item.id} value={item.shipment_id}>
                      {item.waybill}
                    </option>
                  ))}
                </select>

                <br />
              </div>
            </div>

            <div className="custom-modal-footer">
              <button className="btn btn-primary" onClick={apidataget}>
                Add Shipment
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

                      <h4 className="freight_hd mb-0">
                        Supplier Estimate Form
                      </h4>
                    </div>
                    <div className="d-flex gap-3 align-items-center blueText">
                      {/* <i onClick={() => downloadPDF1()} class="fa fa-download" aria-hidden="true"></i>
                      <i class="fa fa-address-card" onClick={() => downloadPDF()}></i> */}
                      <button onClick={andlemodaloen} className="blueBtn">
                        Select Shipment
                      </button>
                      <button onClick={andndndn} className="blueBtn">
                        Select Supplier
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
                    <table>
                      <tbody>
                        <tr>
                          <td style={{ width: "50%" }}>
                            <div>
                              <img
                                style={{ height: 55 }}
                                src={logo}
                                alt="hellow"
                              />
                            </div>
                          </td>
                          <td
                            style={{
                              width: "50%",
                              color: "#000",
                              paddingBottom: "10px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 20,
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
                                fontSize: 14,
                                fontWeight: 500,
                                marginBottom: "unset",
                                lineHeight: "1.5",
                                marginTop: 10,
                              }}
                            >
                              Asia Direct, Unit 4 Villa Valencia 2 Anemoon Road
                              Glen Marais 1619 South Africa Web
                              www.asiaDirect.africa{" "}
                            </p>
                            <p>
                              <span>VAT Number: 4740280377</span>
                              <br />
                              TEL: +27 10 448 0733
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
                              fontSize: 14,
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
                        border: "2px solid #1b2245",
                        borderTop: "unset",
                        width: "100%",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: "50%",
                              borderRight: "2px solid #1a2142",
                              height: "100%",
                            }}
                          >
                            <table>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      fontSize: 14,
                                      padding: "5px",
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
                                fontSize: 14,
                                textAlign: "center",

                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
                                    Shipment Details ISO Commodity
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style={{ width: "100%" }}>
                              <tbody>
                                <tr>
                                  { }
                                  <td style={{ padding: "10px" }}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                        }}
                                      >
                                        <strong>Waybill</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                        }}
                                      >
                                        {getdata?.waybill}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Carrier</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.carrier}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Vessel</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.vessel}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>ETD</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {shipmentDate("ETD")}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>ATD</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {shipmentDate("ATD")}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Chargeable</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <input
                                          type="text"
                                          onKeyPress={handlepresss}
                                          name="chargable_rate"
                                          value={freight.chargable_rate}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Status</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.status}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Origin Agent</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.origin_agent}
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      {/* <p
                                                    style={{
                                                      fontSize: 14,
                                                      marginBottom: "unset",
                                                      marginTop: 5,
                                                    }}
                                                  >
                                                    <strong>Incoterm</strong>
                                                  </p>
                                                  <p
                                                    style={{
                                                      fontSize: 14,
                                                      marginBottom: "unset",
                                                      marginTop: 5,
                                                    }}
                                                  >
                                                    {getdata?.incoterm}
                                                  </p> */}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Freight</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.freight}
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
                                fontSize: 14,
                                textAlign: "center",
                                margin: "0px",
                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
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
                                          fontSize: 14,
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
                              </tbody>
                            </table>
                          </td>
                          <td>
                            <table>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 10px 0px 10px",
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Invoice No.</strong>
                                  </td>
                                  <td style={{ fontSize: 14 }}>
                                    <input
                                      type="text"
                                      name="supplier_invoice_no"
                                      value={freight.supplier_invoice_no || ""}
                                      onChange={handlechangecalc}
                                    />
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 10px 0px 10px",
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Reference</strong>
                                  </td>
                                  <td style={{ fontSize: 14 }}>
                                    {getdata?.reference_no}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      padding: "0px 10px 0px 10px",
                                      width: 170,
                                      display: "block",
                                      paddingBottom: 0,
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Quote Date</strong>
                                  </td>
                                  <td
                                    style={{
                                      fontSize: 14,
                                    }}
                                  >
                                    {shipmentDate("created_at")}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      padding: "0px 10px 0px 10px",
                                      width: 170,
                                      display: "block",
                                      fontSize: 14,
                                    }}
                                  >
                                    <strong>Due Date</strong>
                                  </td>
                                  <td
                                    style={{
                                      fontSize: 14,
                                    }}
                                  >
                                    <input
                                      type="date"
                                      name="due_date"
                                      value={freight.due_date ? freight.due_date.split('T')[0] : ""}
                                      onChange={handlechangecalc}
                                      style={{
                                        padding: "4px 8px",
                                        fontSize: "14px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        fontFamily: "inherit"
                                      }}
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
                                fontSize: 14,
                                textAlign: "center",
                                margin: "5px 0px",
                                padding: 2,
                              }}
                            >
                              <tbody>
                                <tr>
                                  <td style={{ fontSize: 14 }}>
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Port Of Loading</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.port_of_loading}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Port Of Discharge</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.port_of_discharge}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Destination Agent</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.destination_agent}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>Container</strong>
                                      </p>
                                      <p
                                        className="text-dark"
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.container}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Load</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.load}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Release Type</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.release_type}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong> Origin Country Name</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.origin_country}
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
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        <strong>
                                          {" "}
                                          Destination Country Name
                                        </strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 14,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {getdata?.destination_country}
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
                              width: "31%",
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
                              Shipment Estimate
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
                          <th>Items</th>
                          <th>Description</th>
                          <th>QTY</th>
                          <th>
                            <select name="" id="">
                              <option value="">Currency</option>
                              <option value="">USD</option>
                              <option value="">RAND</option>
                              <option value="">INR</option>
                              <option value="">EURO</option>
                            </select>
                          </th>
                          <th>Cost</th>
                          <th>Unit type</th>
                          <th>Unit</th>
                          <th>T/ Cost</th>
                          {/* <th>GP</th> */}
                          {/* <th>Amt</th> */}
                          <th>ROE</th>
                          <th>Final Amount</th>
                          <th>VAT Type </th>
                          <th>Disc % </th>
                          <th>Discount </th>
                          <th>Exclusive </th>
                          <th>VAT </th>
                          <th>VAT Incl </th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* origin charges */}
                        <tr>
                          <td>Origin Charges</td>
                          <td>Pick-Up Fee</td>
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
                              onChange={handlechangecalc}
                              value={freight?.freight_charge_currencyQTY}
                              name="freight_charge_currencyQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_cost}
                              name="origin_pick_up_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_unitType"
                              value={freight?.origin_pick_up_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              // value={freight?.origin_pick_up_fees}
                              value={
                                freight.origin_pick_up_unitType
                                  ? oripick2
                                    ? oripick2
                                    : 0
                                  : 0
                              }
                              name="origin_pick_up_fees"
                              id="floatingInput"
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={oripick4 ? oripick4 : "0.00"}
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="gp22"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.origin_pickup_fee_gpcalc}
                                        name="origin_pickup_fee_gpcalc"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalori1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_origin_currencyorigin"
                              onChange={handlechangecalc}
                              value={freight.roe_origin_currencyorigin}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueoriginPickup)
                                  ? 0
                                  : finalvlaueoriginPickup.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="org_pickUp_vatTyp" value={freight.org_pickUp_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form"
                              value={discountInputValue("org_pickUp")}
                              name="org_pickUp_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_pickUp.disc)}
                              name="org_pickUp_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.org_pickUp.exclusive)}
                              name='org_pickUp_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_pickUp.vat)}
                              name='org_pickUp_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.org_pickUp.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='org_pickUp_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Fuel Surcharge</td>
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
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_fuel_unitTypeQTY}
                              name="origin_pick_up_fuel_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_fuel_cost}
                              name="origin_pick_up_fuel_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_fuel_unitType"
                              value={freight?.origin_pick_up_fuel_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              // value={freight?.origin_pick_up_fuel_fees}
                              value={
                                freight.origin_pick_up_fuel_unitType
                                  ? orifuel2
                                    ? orifuel2
                                    : 0
                                  : 0.0
                              }
                              name="origin_pick_up_fuel_fees"
                              id="floatingInput"
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={orifuel4 ? orifuel4 : "0.00"}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        value={freight?.origin_pick_fuelGP}
                                        name="origin_pick_fuelGP"
                                        onChange={handlechangecalc}
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalfuel1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_origin_fuel_currency"
                              value={freight.roe_origin_fuel_currency}
                              onChange={handlechangecalc}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueoFuel)
                                  ? 0
                                  : finalvlaueoFuel.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="origin_fuelSur_vatTyp" value={freight.origin_fuelSur_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form"
                              value={discountInputValue("origin_fuelSur")}
                              name="origin_fuelSur_disc%"
                              onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.origin_fuelSur.disc)}
                              name="origin_fuelSur_disc"
                              className="supplier_form"
                              onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.origin_fuelSur.exclusive)}
                              name='origin_fuelSur_exclusive'
                              className="supplier_form"
                              onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.origin_fuelSur.vat)}
                              name='origin_fuelSur_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.origin_fuelSur.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='origin_fuelSur_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>CFS Charge</td>
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
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_cfs_unitTypeQTY}
                              name="origin_pick_up_cfs_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_cfs_cost}
                              name="origin_pick_up_cfs_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_cfs_unitType"
                              value={freight?.origin_pick_up_cfs_unitType}
                            >
                              <option>Select</option>
                              <option value="1">L/S</option>
                              <option value="2">W/m</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.origin_pick_up_cfs_unitType
                                  ? oricfs2
                                    ? oricfs2
                                    : 0
                                  : 0.0
                              }
                              name="origin_pick_up_cfs_fees"
                              id="floatingInput"
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
                              disabled
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              // onChange={handlechangecalc}
                              value={oricfs4 ? oricfs4 : "0.00"}
                              // name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.origin_pickup_vfs_gp}
                                        name="origin_pickup_vfs_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalcfs1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_origin_cfs_currency"
                              value={freight.roe_origin_cfs_currency}
                              onChange={handlechangecalc}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueocfs)
                                  ? 0
                                  : finalvlaueocfs.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="origin_cfs_vatTyp" value={freight.origin_cfs_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form"
                              value={discountInputValue("origin_cfs")}
                              name="origin_cfs_disc%"
                              onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.origin_cfs.disc)}
                              name="origin_cfs_disc"
                              placeholder="0.00"
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.origin_cfs.exclusive)}
                              name='origin_cfs_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.origin_cfs.vat)}
                              name='origin_cfs_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.origin_cfs.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='origin_cfs_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Documentation Fee</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.origin_pick_up_documantation_unitTypeQTY
                              }
                              name="origin_pick_up_documantation_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_documantation_cost}
                              name="origin_pick_up_documantation_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_documantation_unitType"
                              value={
                                freight?.origin_pick_up_documantation_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight.origin_pick_up_documantation_unitType
                                  ? oridoc2
                                    ? oridoc2
                                    : 0
                                  : 0.0
                              }
                              name="origin_pick_up_documantation_fees"
                              id="floatingInput"
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
                              disabled
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={oridoc4 ? oridoc4 : "0.00"}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.origin_pick_documantation_cost_gp}
                                        name="origin_pick_documantation_cost_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalValuedoc.toFixed(2)}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              onChange={handlechangecalc}
                              name="roe_origin_doc_currency"
                              value={freight.roe_origin_doc_currency}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueodoc)
                                  ? 0
                                  : finalvlaueodoc.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="org_docFee_vatTyp" value={freight.org_docFee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form"
                              value={discountInputValue("org_docFee")}
                              name="org_docFee_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_docFee.disc)}
                              name="org_docFee_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_docFee.exclusive)}
                              name='org_docFee_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_docFee.vat)}
                              name='org_docFee_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.org_docFee.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='org_docFee_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Forwarding Fee</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.origin_pick_up_forewarding_unitTypeQTY
                              }
                              name="origin_pick_up_forewarding_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_forewarding_cost}
                              name="origin_pick_up_forewarding_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_forewarding_unitType"
                              value={
                                freight?.origin_pick_up_forewarding_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.origin_pick_up_forewarding_unitType
                                  ? oriforewarding2
                                    ? oriforewarding2
                                    : 0
                                  : 0
                              }
                              name="origin_pick_up_forewarding_fees"
                              id="floatingInput"
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
                              disabled
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              value={oriforewarding4 ? oriforewarding4 : 0.0}
                              // value={freight?.origin_pick_up_forewarding}
                              // name="origin_pick_up_forewarding"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.origin_pickup_forewarding_gp}
                                        name="origin_pickup_forewarding_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalforewarding1 ? finalforewarding1 : 0}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_origin_forewarding"
                              value={freight.roe_origin_forewarding}
                              onChange={handlechangecalc}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueoforewarding)
                                  ? 0
                                  : finalvlaueoforewarding.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="org_forwFee_vatTyp" value={freight.org_forwFee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" onChange={handlechangecalc}
                              value={discountInputValue("org_forwFee")}
                              name="org_forwFee_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.org_forwFee.disc)}
                              name="org_forwFee_disc"
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.org_forwFee.exclusive)}
                              name='org_forwFee_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.org_forwFee.vat)}
                              name='org_forwFee_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.org_forwFee.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='org_forwFee_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Customs Clearance</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.origin_pick_up_custome_unitTypeQTY
                              }
                              name="origin_pick_up_custome_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="pickup_freight_currency"
                              value={freight?.pickup_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.origin_pick_up_custome_cost}
                              name="origin_pick_up_custome_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="origin_pick_up_custome_unitType"
                              value={freight?.origin_pick_up_custome_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.origin_pick_up_custome_unitType
                                  ? oricustome2
                                    ? oricustome2
                                    : 0.0
                                  : 0.0
                              }
                              name="origin_pick_up_custome_clearance"
                              id="floatingInput"
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
                              disabled
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              value={oricustome4 ? oricustome4 : 0}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.origin_pickup_custome_gp}
                                        name="origin_pickup_custome_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalcustomes1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              onChange={handlechangecalc}
                              name="roe_origin_customes"
                              value={freight.roe_origin_customes}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueoCustomes)
                                  ? 0
                                  : finalvlaueoCustomes.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="org_clearance_vatTyp" value={freight.org_clearance_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" onChange={handlechangecalc}
                              value={discountInputValue("org_clearance")}
                              name="org_clearance_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_clearance.disc)}
                              name="org_clearance_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.org_clearance.exclusive)}
                              name="org_clearance_exclusive" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.org_clearance.vat)}
                              name='org_clearance_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.org_clearance.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='org_clearance_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong>Total - Origin Charges </strong>
                          </td>
                          <td colSpan={2}>
                            {" "}
                            {totalChageswithOutExchange.toFixed(2)}{" "}
                          </td>
                          <td> {totalChangeRoeOrigin.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        {/* freight charges */}
                        <tr>
                          <td>Freight Charges</td>
                          <td>{getdata?.freight} freight</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.freight_charge_currency_unitTypeQTY
                              }
                              name="freight_charge_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="freight_charge_currency"
                              value={freight?.freight_charge_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.freight_charge_currency_cost}
                              name="freight_charge_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="freight_charge_currency_unitType"
                              value={freight?.freight_charge_currency_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.freight_charge_currency_unitType
                                  ? orifreight2
                                    ? orifreight2
                                    : 0.0
                                  : 0.0
                              }
                              name="freight_charge_currency_fees"
                              id="floatingInput"
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
                              disabled
                              value={orifreight4 ? orifreight4 : 0}
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.freight_charge_currency_gp}
                                        name="freight_charge_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalfreight1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_freight_currency"
                              onChange={handlechangecalc}
                              value={freight.roe_freight_currency}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueofreight)
                                  ? 0
                                  : finalvlaueofreight.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="ocenfreight_charge_vatTyp" value={freight.ocenfreight_charge_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" onChange={handlechangecalc}
                              value={discountInputValue("ocenfreight_charge")}
                              name="ocenfreight_charge_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.ocenfreight_charge.disc)}
                              name="ocenfreight_charge_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.ocenfreight_charge.exclusive)}
                              name='ocenfreight_charge_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.ocenfreight_charge.vat)}
                              name='ocenfreight_charge_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.ocenfreight_charge.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='ocenfreight_charge_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td>Insurance</td>
                          <td>{getdata?.freight} freight</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.freight_currency_insurance_unittypeQTY
                              }
                              name="freight_currency_insurance_unittypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="freight_charge_currency"
                              value={freight?.freight_charge_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.freight_currency_insurance_cost}
                              name="freight_currency_insurance_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="freight_currency_insurance_unittype"
                              value={
                                freight?.freight_currency_insurance_unittype
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.freight_currency_insurance_unittype
                                  ? isNaN(Number(oriindsurance2))
                                    ? "0.00"
                                    : oriindsurance2
                                  : 0.0
                              }
                              name="freight_currency_insurance_unit"
                              id="floatingInput"
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
                              disabled
                              value={
                                isNaN(oriinsurance4) ? "0.00" : oriinsurance4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.freightorigin_insurance_gp}
                                        name="freightorigin_insurance_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalinsurance1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_insurance_currency"
                              onChange={handlechangecalc}
                              value={freight.roe_insurance_currency}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueoInsurance)
                                  ? 0
                                  : finalvlaueoInsurance.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            <select name="insurance_vatTyp" value={freight.insurance_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form"
                              value={discountInputValue("insurance")}
                              name="insurance_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.insurance.disc)}
                              name="insurance_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.insurance.exclusive)}
                              name='insurance_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.insurance.vat)}
                              name='insurance_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.insurance.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='insurance_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong> Total - Freight Charges</strong>
                          </td>
                          <td colSpan={2}>
                            {" "}
                            {totalChageswithOutExchangeinsurance.toFixed(
                              2,
                            )}{" "}
                          </td>
                          <td>
                            {" "}
                            {totalChangeRoeOriginaftercalcuinsurance.toFixed(
                              2,
                            )}{" "}
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>

                        {/* transit charges */}
                        <tr>
                          <td>Transit Charges</td>
                          <td>Customs Clearing Fees</td>
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
                              onChange={handlechangecalc}
                              value={freight?.Transit_currency_unitTpeQTY}
                              name="Transit_currency_unitTpeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Transit_currency_Cost}
                              name="Transit_currency_Cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Transit_currency_unitTpe"
                              value={freight?.Transit_currency_unitTpe}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.Transit_currency_unitTpe
                                  ? oritransit2
                                    ? oritransit2
                                    : 0.0
                                  : 0.0
                              }
                              name="Transit_currency_unit"
                              id="floatingInput"
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
                              disabled
                              value={isNaN(oritransit4) ? 0.0 : oritransit4}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Transit_currency_gp}
                                        name="Transit_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finaltransit1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              onChange={handlechangecalc}
                              name="Transit_currency_roe"
                              value={freight.Transit_currency_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(Number(finalvlaueotransit))
                                  ? "0.00"
                                  : Number(finalvlaueotransit).toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_clear_fees_vatTyp" value={freight.trans_clear_fees_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={discountInputValue("trans_clear_fees")}
                              name="trans_clear_fees_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_clear_fees.disc)}
                              name="trans_clear_fees_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_clear_fees.exclusive)}
                              name='trans_clear_fees_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_clear_fees.vat)}
                              name='trans_clear_fees_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_clear_fees.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_clear_fees_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>THC Levy</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_currency_THC_initTypeQTY}
                              name="transit_currency_THC_initTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_currency_THC_cost}
                              name="transit_currency_THC_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="transit_currency_THC_initType"
                              value={freight?.transit_currency_THC_initType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.transit_currency_THC_initType
                                  ? oriThc2
                                    ? oriThc2
                                    : 0.0
                                  : 0.0
                              }
                              name="transit_currency_THC_init"
                              id="floatingInput"
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
                              disabled
                              className="supplier_form"
                              value={oriThc4 ? oriThc4 : 0}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.transit_currency_THC_gp}
                                        name="transit_currency_THC_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={finalThc1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              onChange={handlechangecalc}
                              name="roe_Transit_Thc"
                              value={freight.roe_Transit_Thc}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotfineal)
                                  ? 0.0
                                  : finalvlaueotfineal.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_THC_levy_vatTyp" value={freight.trans_THC_levy_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("trans_THC_levy")}
                              name="trans_THC_levy_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_THC_levy.disc)}
                              name="trans_THC_levy_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_THC_levy.exclusive)}
                              name='trans_THC_levy_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_THC_levy.vat)}
                              name='trans_THC_levy_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_THC_levy.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_THC_levy_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Unpack Charges</td>
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
                              onChange={handlechangecalc}
                              value={freight?.transit_currency_THC_initTypeeQTY}
                              name="transit_currency_THC_initTypeeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Transit_currency_unpack_cost}
                              name="Transit_currency_unpack_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Transit_currency_unpack_unitType"
                              value={freight?.Transit_currency_unpack_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.Transit_currency_unpack_unitType
                                  ? isNaN(oriunpack2)
                                    ? 0.0
                                    : oriunpack2
                                  : 0.0
                              }
                              name="Transit_currency_unpack_unit"
                              id="floatingInput"
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
                              onKeyPress={handlepresss}
                              disabled
                              value={isNaN(oriunpack4) ? 0.0 : oriunpack4}
                              className="supplier_form"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                        <input
                                            style={{
                                            marginBottom: 0,
                                            fontSize: 13,
                                            color: "black",
                                            fontWeight: 400,
                                            width: "50px",
                                            border: "0px",
            
                                            verticalAlign: "middle",
                                            }}
                                            type="text"
                                            onKeyPress={handlepresss}
                                            className="supplier_form"
                                            onChange={handlechangecalc}
                                            value={freight?.Transit_currency_unpack_gp}
                                            name="Transit_currency_unpack_gp"
                                            id="floatingInput"
                                            placeholder="0.00%"
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
                                            value={finalunpack1}
                                            className="supplier_form"
                                        />{" "}
                                        </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Transit_unpack_roe"
                              onChange={handlechangecalc}
                              value={freight.Transit_unpack_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotfunpack)
                                  ? 0.0
                                  : finalvlaueotfunpack.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_unpack_charg_vatTyp" value={freight.trans_unpack_charg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={discountInputValue("trans_unpack_charg")}
                              name="trans_unpack_charg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_unpack_charg.disc)}
                              name="trans_unpack_charg_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_unpack_charg.exclusive)}
                              name='trans_unpack_charg_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_unpack_charg.vat)}
                              name='trans_unpack_charg_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_unpack_charg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_unpack_charg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>3rd Party CFS Charge: LCL Handling Out w/ms</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_3rd_party_unittypeQTY}
                              name="transit_3rd_party_unittypeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_3rd_party_cost}
                              name="transit_3rd_party_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="transit_3rd_party_unittype"
                              value={freight?.transit_3rd_party_unittype}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.transit_3rd_party_unittype
                                  ? ori3rdparty2
                                    ? ori3rdparty2
                                    : 0.0
                                  : 0.0
                              }
                              name="transit_3rd_party_unit"
                              id="floatingInput"
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
                              disabled
                              value={isNaN(ori3rdparty4) ? 0.0 : ori3rdparty4}
                              className="supplier_form"
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.transit_3rd_party_gp}
                                        name="transit_3rd_party_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdparty1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              onChange={handlechangecalc}
                              name="transit_currency_3rd"
                              value={freight.transit_currency_3rd}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueot3dparty)
                                  ? 0.0
                                  : finalvlaueot3dparty.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_CFS_charg_vatTyp" value={freight.trans_CFS_charg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("trans_CFS_charg")}
                              name="trans_CFS_charg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_CFS_charg.disc)}
                              name="trans_CFS_charg_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_CFS_charg.exclusive)}
                              name='trans_CFS_charg_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_CFS_charg.vat)}
                              name='trans_CFS_charg_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_CFS_charg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_CFS_charg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Admin Charges</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_admin_unittypeQTY}
                              name="transit_admin_unittypeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_admin_change}
                              name="transit_admin_change"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="transit_admin_unittype"
                              value={freight?.transit_admin_unittype}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.transit_admin_unittype
                                  ? ori3rdAdmin2
                                    ? ori3rdAdmin2
                                    : 0.0
                                  : 0.0
                              }
                              name="transit_admin_unit"
                              id="floatingInput"
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
                              value={isNaN(ori3rdAdmin4) ? 0.0 : ori3rdAdmin4}
                              className="supplier_form"
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.transit_admin_gp}
                                        name="transit_admin_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdAdmin1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_transit_admin"
                              onChange={handlechangecalc}
                              value={freight.roe_transit_admin}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotAdmin)
                                  ? 0.0
                                  : finalvlaueotAdmin.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_admin_charg_vatTyp" value={freight.trans_admin_charg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("trans_admin_charg")}
                              name="trans_admin_charg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_admin_charg.disc)}
                              name='trans_admin_charg_disc' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_admin_charg.exclusive)}
                              name='trans_admin_charg_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_admin_charg.vat)}
                              name='trans_admin_charg_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_admin_charg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_admin_charg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Port Cargo Dues</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_currency_port_unitTypeQTY}
                              name="transit_currency_port_unitTypeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_currency_port}
                              name="transit_currency_port"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="transit_currency_port_unitType"
                              value={freight?.transit_currency_port_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight?.transit_currency_port_unitType
                                  ? ori3rdport2
                                    ? ori3rdport2
                                    : 0.0
                                  : 0.0
                              }
                              name="transit_currency_port_unit"
                              id="floatingInput"
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
                              value={isNaN(ori3rdport4) ? 0.0 : ori3rdport4}
                              className="supplier_form"
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.transit_currency_port_gp}
                                        name="transit_currency_port_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdport1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_trans_port"
                              onChange={handlechangecalc}
                              value={freight.roe_trans_port}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotPort)
                                  ? 0.0
                                  : finalvlaueotPort.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_portCargo_vatTyp" value={freight.trans_portCargo_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("trans_portCargo")}
                              name="trans_portCargo_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_portCargo.disc)}
                              name="trans_portCargo_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_portCargo.exclusive)}
                              name='trans_portCargo_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_portCargo.vat)}
                              name='trans_portCargo_vat'
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_portCargo.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='trans_portCargo_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Advanced Load House Fee USD</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Transit_advanced_unitTypeQTY}
                              name="Transit_advanced_unitTypeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Transit_advanced_load}
                              name="Transit_advanced_load"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Transit_advanced_unitType"
                              value={freight?.Transit_advanced_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Transit_advanced_unitType
                                  ? oriadv2
                                    ? oriadv2
                                    : 0.0
                                  : 0.0
                              }
                              name="Transit_advanced_unit"
                              id="floatingInput"
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
                              disabled
                              className="supplier_form"
                              value={isNaN(oriadv4) ? 0.0 : oriadv4}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Transit_advanced_gp}
                                        name="Transit_advanced_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdadv1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Transit_advanced_gp_roe"
                              onChange={handlechangecalc}
                              value={freight.Transit_advanced_gp_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotadv)
                                  ? 0.0
                                  : finalvlaueotadv.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_adv_loadHouse_vatTyp" value={freight.trans_adv_loadHouse_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("trans_adv_loadHouse")}
                              name="trans_adv_loadHouse_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_adv_loadHouse.disc)}
                              name="trans_adv_loadHouse_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_adv_loadHouse.exclusive)}
                              name='trans_adv_loadHouse_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_adv_loadHouse.vat)}
                              name='trans_adv_loadHouse_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_adv_loadHouse.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='trans_adv_loadHouse_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Documentation Fee</td>
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
                              onChange={handlechangecalc}
                              value={
                                freight?.transit_change_Documentation_unitTypeQTY
                              }
                              name="transit_change_Documentation_unitTypeQTY"
                              id="floatingInput"
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
                              name="Transit_currency"
                              value={freight?.Transit_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.transit_change_Documentation}
                              name="transit_change_Documentation"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="transit_change_Documentation_unitType"
                              value={
                                freight?.transit_change_Documentation_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight?.transit_change_Documentation_unitType
                                  ? oridocumentation2
                                    ? oridocumentation2
                                    : 0.0
                                  : 0.0
                              }
                              name="transit_change_Documentation_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(oridocumentation4)
                                  ? 0.0
                                  : oridocumentation4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.transit_change_Documentation_gp}
                                        name="transit_change_Documentation_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdocumantation1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="roe_transit_change_Documentation"
                              onChange={handlechangecalc}
                              value={freight.roe_transit_change_Documentation}
                              className="supplier_form"
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
                              value={
                                isNaN(finalvlaueotDocumantation)
                                  ? 0.0
                                  : finalvlaueotDocumantation.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="trans_doc_fee_vatTyp" value={freight.trans_doc_fee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={discountInputValue("trans_doc_fee")}
                              name="trans_doc_fee_disc%"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_doc_fee.disc)}
                              name="trans_doc_fee_disc" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.trans_doc_fee.exclusive)}
                              name='trans_doc_fee_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.trans_doc_fee.vat)}
                              name='trans_doc_fee_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.trans_doc_fee.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='trans_doc_fee_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>

                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong> Total - Transit Charges</strong>
                          </td>
                          <td colSpan={2}>
                            {" "}
                            {totalChageswithOuTransit.toFixed(2)}{" "}
                          </td>
                          <td> {transitRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        {/* Destination Charges */}
                        <tr>
                          <td>Destination Charges </td>
                          <td>Customs Clearing Fees</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_freight_currency_unitTypeQTY
                              }
                              name="Destination_freight_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Destination_freight_currency_cost}
                              name="Destination_freight_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency_unitType"
                              value={
                                freight?.Destination_freight_currency_unitType
                              }
                            >
                              <option>Select</option>

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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={
                                freight?.Destination_freight_currency_unitType
                                  ? destinationdocumentation2
                                    ? destinationdocumentation2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_freight_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinationdocumentation4)
                                  ? 0.0
                                  : destinationdocumentation4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_freight_currency_gp}
                                        name="Destination_freight_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rdestination1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              value={freight.Destination_freight_currency_Roe}
                              name="Destination_freight_currency_Roe"
                              onChange={handlechangecalc}
                              className="supplier_form"
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
                              value={
                                isNaN(final3rdestinationRoe)
                                  ? 0.0
                                  : final3rdestinationRoe.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_clearing_fees_vatTyp" value={freight.dest_clearing_fees_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={discountInputValue("dest_clearing_fees")}
                              name="dest_clearing_fees_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_clearing_fees.disc)}
                              name='dest_clearing_fees_disc'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_clearing_fees.exclusive)}
                              name='dest_clearing_fees_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_clearing_fees.vat)}
                              name='dest_clearing_fees_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_clearing_fees.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='dest_clearing_fees_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>THC Levy</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_THC_currency_unitTypeQTY
                              }
                              name="Destination_THC_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Destination_THC_currency_cost}
                              name="Destination_THC_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_THC_currency_unitType"
                              value={freight?.Destination_THC_currency_unitType}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_THC_currency_unitType
                                  ? destinationTHCdocumentation2
                                    ? destinationTHCdocumentation2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_THC_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinationTHCdocumentation4)
                                  ? 0.0
                                  : destinationTHCdocumentation4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_THC_currency_gp}
                                        name="Destination_THC_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rTHCdestination1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_THC_currency_Roe"
                              onChange={handlechangecalc}
                              value={freight.Destination_THC_currency_Roe}
                              className="supplier_form"
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
                              value={
                                isNaN(final3rTHCdestinationRoe)
                                  ? 0.0
                                  : final3rTHCdestinationRoe.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_THC_levy_vatTyp" value={freight.dest_THC_levy_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form"
                              value={discountInputValue("dest_THC_levy")}
                              name="dest_THC_levy_disc%"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_THC_levy.disc)}
                              name="dest_THC_levy_disc"
                              placeholder="0.00"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_THC_levy.exclusive)}
                              name='dest_THC_levy_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_THC_levy.vat)}
                              name='dest_THC_levy_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Unpack Charges</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_Unpack_currency_unitTypeQTY
                              }
                              name="Destination_Unpack_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Destination_Unpack_currency_cost}
                              name="Destination_Unpack_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_Unpack_currency_unitType"
                              value={
                                freight?.Destination_Unpack_currency_unitType
                              }
                            >
                              <option>Select</option>

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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              // value={
                              //   freight.freight
                              //     ?.Destination_Unpack_currency_unitType
                              //     ? destinationUnpackdocumentation2
                              //       ? destinationUnpackdocumentation2
                              //       : 0.0
                              //     : 0.0
                              // }
                              value={
                                freight?.Destination_Unpack_currency_unitType
                                  ? destinationUnpackdocumentation2
                                    ? destinationUnpackdocumentation2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_Unpack_currency_unit"
                              id="floatingInput"
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                isNaN(destinationUnpackdocumentation4)
                                  ? 0.0
                                  : destinationUnpackdocumentation4
                              }
                              name="origin_pick_up"
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_Unpack_currency_gp}
                                        name="Destination_Unpack_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3runpackdestination1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_Unpack_currency_roe"
                              onChange={handlechangecalc}
                              value={freight.Destination_Unpack_currency_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(final3rUnpackdestinationRoe)
                                  ? 0.0
                                  : final3rUnpackdestinationRoe.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_unpack_chrg_vatTyp" value={freight.dest_unpack_chrg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_unpack_chrg")}
                              name="dest_unpack_chrg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_unpack_chrg.disc)}
                              name="dest_unpack_chrg_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_unpack_chrg.exclusive)}
                              name='dest_unpack_chrg_exclusive'
                              placeholder="0.00"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_unpack_chrg.vat)}
                              name='dest_unpack_chrg_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_unpack_chrg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_unpack_chrg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Fuel Surcharge Levy w/m</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_fuelsurcharge_currency_typeUnitQTY
                              }
                              name="Destination_fuelsurcharge_currency_typeUnitQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_fuelsurcharge_currency_cost
                              }
                              name="Destination_fuelsurcharge_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_fuelsurcharge_currency_typeUnit"
                              value={
                                freight?.Destination_fuelsurcharge_currency_typeUnit
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              // value={
                              //   freight.freight
                              //     ?.Destination_fuelsurcharge_currency_typeUnit
                              //     ? destinationfuelsurchargedocumentation2
                              //       ? destinationfuelsurchargedocumentation2
                              //       : 0.0
                              //     : 0.0
                              // }

                              value={
                                freight?.Destination_fuelsurcharge_currency_typeUnit
                                  ? destinationfuelsurchargedocumentation2
                                    ? destinationfuelsurchargedocumentation2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_fuelsurcharge_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinationfuelsurchargedocumentation4)
                                  ? 0.0
                                  : destinationfuelsurchargedocumentation4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_fuelsurcharge_currency_gp
                                        }
                                        name="Destination_fuelsurcharge_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={final3rfuelsurchargedestination1}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_fuelsurcharge_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_fuelsurcharge_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(final3rfuelsurCahrgeestinationRoe)
                                  ? 0.0
                                  : final3rfuelsurCahrgeestinationRoe.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_fuel_Surchar_vatTyp" value={freight.dest_fuel_Surchar_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_fuel_Surchar")}
                              name="dest_fuel_Surchar_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.dest_fuel_Surchar.disc)}
                              name="dest_fuel_Surchar_disc"
                              placeholder="0.00"
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_fuel_Surchar.exclusive)}
                              name='dest_fuel_Surchar_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_fuel_Surchar.vat)}
                              name='dest_fuel_Surchar_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_fuel_Surchar.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_fuel_Surchar_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Admin Charges</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_adminsurcharge_currency_unitTypeQTY
                              }
                              name="Destination_adminsurcharge_currency_unitTypeQTY"
                              id="floatingInput"
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
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_adminsurcharge_currency_cost
                              }
                              name="Destination_adminsurcharge_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_adminsurcharge_currency_unitType"
                              value={
                                freight?.Destination_adminsurcharge_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              // value={
                              //   freight.freight
                              //     ?.Destination_adminsurcharge_currency_unitType
                              //     ? destinatiadminsurcharge2
                              //       ? destinatiadminsurcharge2
                              //       : 0.0
                              //     : 0.0
                              // }
                              value={
                                freight?.Destination_adminsurcharge_currency_unitType
                                  ? destinatiadminsurcharge2
                                    ? destinatiadminsurcharge2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_adminsurcharge_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinatiadminsurcharge4)
                                  ? 0.0
                                  : destinatiadminsurcharge4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_adminsurcharge_currency_gp
                                        }
                                        name="Destination_adminsurcharge_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={Valueadminsurchargedestanion}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_adminsurcharge_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_adminsurcharge_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(adminsurcharge2)
                                  ? 0.0
                                  : adminsurcharge2.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_admin_chrg_vatTyp" value={freight.dest_admin_chrg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={discountInputValue("dest_admin_chrg")}
                              name="dest_admin_chrg_disc%" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_admin_chrg.disc)}
                              name="dest_admin_chrg_disc"
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_admin_chrg.exclusive)}
                              name='dest_admin_chrg_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_admin_chrg.vat)}
                              name='dest_admin_chrg_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_admin_chrg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_admin_chrg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Port Cargo Dues</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_portcargo_currency_unitTypeQTY
                              }
                              name="Destination_portcargo_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_portcargo_currency_cost
                              }
                              name="Destination_portcargo_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_portcargo_currency_unitType"
                              value={
                                freight?.Destination_portcargo_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_portcargo_currency_unitType
                                  ? destinatiportcargo2
                                    ? destinatiportcargo2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_portcargo_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinatiportcargo4)
                                  ? 0.0
                                  : destinatiportcargo4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_portcargo_currency_gp}
                                        name="Destination_portcargo_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={Vaportcargoion}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_portcargo_currency_roe"
                              onChange={handlechangecalc}
                              value={freight.Destination_portcargo_currency_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(admiportcargo2)
                                  ? 0.0
                                  : admiportcargo2.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_portCargo_vatTyp" value={freight.dest_portCargo_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_portCargo")}
                              name="dest_portCargo_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_portCargo.disc)}
                              name="dest_portCargo_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_portCargo.exclusive)}
                              name='dest_portCargo_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_portCargo.vat)}
                              name='dest_portCargo_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_portCargo.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_portCargo_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Advanced Load House Fee USD</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_AdvancedLoad_currency_unitTypeQTY
                              }
                              name="Destination_AdvancedLoad_currency_unitTypeQTY"
                              id="floatingInput"
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
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_AdvancedLoad_currency_cost
                              }
                              name="Destination_AdvancedLoad_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_AdvancedLoad_currency_unitType"
                              value={
                                freight?.Destination_AdvancedLoad_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_AdvancedLoad_currency_unitType
                                  ? destinatiAdvancedLoad2
                                    ? destinatiAdvancedLoad2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_AdvancedLoad_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinatiAdvancedLoad4)
                                  ? 0.0
                                  : destinatiAdvancedLoad4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_AdvancedLoad_currency_gp
                                        }
                                        name="Destination_AdvancedLoad_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdvancedLoadion}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_AdvancedLoad_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_AdvancedLoad_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(desdvancedLoadion)
                                  ? 0.0
                                  : desdvancedLoadion.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_adv_loadHouse_vatTyp" value={freight.dest_adv_loadHouse_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_adv_loadHouse")}
                              name="dest_adv_loadHouse_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_adv_loadHouse.disc)}
                              name="dest_adv_loadHouse_disc" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.dest_adv_loadHouse.exclusive)}
                              name='dest_adv_loadHouse_exclusive' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_adv_loadHouse.vat)}
                              name='dest_adv_loadHouse_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_adv_loadHouse.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='dest_adv_loadHouse_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>3rd Party CFS Charge: LCL Handling Out w/m</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_3rdpartyDesc_currency_unitTypeQTY
                              }
                              name="Destination_3rdpartyDesc_currency_unitTypeQTY"
                              id="floatingInput"
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
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_3rdpartyDesc_currency_cost
                              }
                              name="Destination_3rdpartyDesc_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_3rdpartyDesc_currency_unitType"
                              value={
                                freight?.Destination_3rdpartyDesc_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_3rdpartyDesc_currency_unitType
                                  ? destinati3rdpartyDesc2
                                    ? destinati3rdpartyDesc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_3rdpartyDesc_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destinati3rdpartyload4)
                                  ? 0.0
                                  : destinati3rdpartyload4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_3rdpartyDesc_currency_gp
                                        }
                                        name="Destination_3rdpartyDesc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdvanced3rdpartyLoadion}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_3rdpartyDesc_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_3rdpartyDesc_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(desdva3rdpartyion)
                                  ? 0.0
                                  : desdva3rdpartyion.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            <select name="dest_CFS_charg_vatTyp" value={freight.dest_CFS_charg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_CFS_charg")}
                              name="dest_CFS_charg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_CFS_charg.disc)}
                              name="dest_CFS_charg_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_CFS_charg.exclusive)}
                              name='dest_CFS_charg_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_CFS_charg.vat)}
                              name='dest_CFS_charg_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_CFS_charg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_CFS_charg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Delivery Charges</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_delivery_currency_unitTypeQTY
                              }
                              name="Destination_delivery_currency_unitTypeQTY"
                              id="floatingInput"
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
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_delivery_currency_cost
                              }
                              name="Destination_delivery_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_delivery_currency_unitType"
                              value={
                                freight?.Destination_delivery_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              disabled
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_delivery_currency_unitType
                                  ? destindeliveryyDesc2
                                    ? destindeliveryyDesc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_delivery_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destindeliveryyDesc4)
                                  ? 0.0
                                  : destindeliveryyDesc4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_delivery_currency_gp}
                                        name="Destination_delivery_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdvandeliverytyLoadion}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_delivery_currency_roe"
                              onChange={handlechangecalc}
                              value={freight.Destination_delivery_currency_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(desddeliverytyion)
                                  ? 0.0
                                  : desddeliverytyion.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_delivry_charge_vatTyp" value={freight.dest_delivry_charge_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("dest_delivry_charge")}
                              name="dest_delivry_charge_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_delivry_charge.disc)}
                              name="dest_delivry_charge_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_delivry_charge.exclusive)}
                              name='dest_delivry_charge_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_delivry_charge.vat)}
                              name='dest_delivry_charge_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_delivry_charge.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_delivry_charge_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          {/* Destination Charges */}
                          <td> </td>
                          <td>Fuel Surcharge</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_fuelcharge_currency_unitTypeQTY
                              }
                              name="Destination_fuelcharge_currency_unitTypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_freight_currency"
                              value={freight?.Destination_freight_currency}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_fuelcharge_currency_cost
                              }
                              name="Destination_fuelcharge_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_fuelcharge_currency_unitType"
                              value={
                                freight?.Destination_fuelcharge_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              disabled
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_fuelcharge_currency_unitType
                                  ? destindfuelchangerDesc2
                                    ? destindfuelchangerDesc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_fuelcharge_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(destindfuelchangerDesc4)
                                  ? 0.0
                                  : destindfuelchangerDesc4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_fuelcharge_currency_gp}
                                        name="Destination_fuelcharge_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdvfuelchangeon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_fuelcharge_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_fuelcharge_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(defuelchangyion)
                                  ? 0.0
                                  : defuelchangyion.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="dest_fuel_surchrg_vatTyp" value={freight.dest_fuel_surchrg_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={discountInputValue("dest_fuel_surchrg")}
                              name="dest_fuel_surchrg_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_fuel_surchrg.disc)}
                              name="dest_fuel_surchrg_disc"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_fuel_surchrg.exclusive)}
                              name='dest_fuel_surchrg_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.dest_fuel_surchrg.vat)}
                              name='dest_fuel_surchrg_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.dest_fuel_surchrg.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='dest_fuel_surchrg_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>

                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong> Total - Destination Charges </strong>
                          </td>
                          <td colSpan={2}>
                            {" "}
                            {totalChaDestinationTransit.toFixed(2)}{" "}
                          </td>
                          <td> {totalChaDestinationTransitRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td> Admin Charges</td>
                          <td>Agency fee</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_AdminAgrncy_currency_unitQTY
                              }
                              name="Destination_AdminAgrncy_currency_unitQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="admin_currency_charge"
                              value={freight?.admin_currency_charge}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_AdminAgrncy_currency_cost
                              }
                              name="Destination_AdminAgrncy_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_AdminAgrncy_currency_unitType"
                              value={
                                freight?.Destination_AdminAgrncy_currency_unitType
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={
                                freight.Destination_AdminAgrncy_currency_unitType
                                  ? deadminAgencyesc2
                                    ? deadminAgencyesc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_AdminAgrncy_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(deadminAgencyesc4)
                                  ? 0.0
                                  : deadminAgencyesc4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_AdminAgrncy_currency_gp}
                                        name="Destination_AdminAgrncy_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAadminAgencyngeon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_AdminAgrncy_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_AdminAgrncy_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(defuelchdminAgencyngangyion)
                                  ? 0.0
                                  : defuelchdminAgencyngangyion.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="admin_agencyFee_vatTyp" value={freight.admin_agencyFee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={discountInputValue("admin_agencyFee")}
                              name='admin_agencyFee_disc%'
                              className="supplier_form" onChange={handlechangecalc}
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.admin_agencyFee.disc)}
                              name='admin_agencyFee_disc'
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_agencyFee.exclusive)}
                              name='admin_agencyFee_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_agencyFee.vat)}
                              name='admin_agencyFee_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.admin_agencyFee.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='admin_agencyFee_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Disbursement fee</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_disbursemant_currency_unitTypeQTY
                              }
                              name="Destination_disbursemant_currency_unitTypeQTY"
                              id="floatingInput"
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
                              name="admin_currency_charge"
                              onChange={handlechangecalc}
                              value={freight?.admin_currency_charge}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_disbursemant_currency_cost
                              }
                              name="Destination_disbursemant_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_disbursemant_currenc_unitType1"
                              value={
                                freight?.Destination_disbursemant_currenc_unitType1
                              }
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={
                                freight.Destination_disbursemant_currenc_unitType1
                                  ? deaddisbursemantc2
                                    ? deaddisbursemantc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_disbursemant_currency_unit"
                              id="floatingInput"
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
                              value={
                                isNaN(deaddisbursemantc4)
                                  ? 0.0
                                  : deaddisbursemantc4
                              }
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_disbursemant_currency_gp
                                        }
                                        name="Destination_disbursemant_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdisbursemon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_disbursemant_currency_roe"
                              onChange={handlechangecalc}
                              value={
                                freight.Destination_disbursemant_currency_roe
                              }
                              className="supplier_form"
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
                              value={
                                isNaN(dedisbursementon)
                                  ? 0.0
                                  : dedisbursementon.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="admin_disbur_fee_vatTyp" value={freight.admin_disbur_fee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              value={discountInputValue("admin_disbur_fee")}
                              name='admin_disbur_fee_disc%'
                              placeholder="0.00"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_disbur_fee.disc)}
                              name='admin_disbur_fee_disc'
                              placeholder="0.00"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_disbur_fee.exclusive)}
                              name='admin_disbur_fee_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.admin_disbur_fee.vat)}
                              name='admin_disbur_fee_vat' onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.admin_disbur_fee.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name='admin_disbur_fee_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Documentation & Admin Fee</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={
                                freight?.Destination_doc_currency_unittypeQTY
                              }
                              name="Destination_doc_currency_unittypeQTY"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="admin_currency_charge"
                              value={freight?.admin_currency_charge}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.Destination_doc_currency_cost}
                              name="Destination_doc_currency_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="Destination_doc_currency_unittype"
                              value={freight?.Destination_doc_currency_unittype}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={
                                freight.Destination_doc_currency_unittype
                                  ? deadoctc2
                                    ? deadoctc2
                                    : 0.0
                                  : 0.0
                              }
                              name="Destination_doc_currency_unit"
                              id="floatingInput"
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
                              value={isNaN(deadoctc4) ? 0.0 : deadoctc4}
                              id="floatingInput"
                              placeholder="0.00"
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_doc_currency_gp}
                                        name="Destination_doc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdocon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="Destination_doc_currency_roe"
                              onChange={handlechangecalc}
                              value={freight.Destination_doc_currency_roe}
                              className="supplier_form"
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
                              value={
                                isNaN(dedisbudoon)
                                  ? 0.0
                                  : dedisbudoon.toFixed(2)
                              }
                              placeholder="0.00"
                              className="supplier_form"
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="admin_doc_adminFees_vatTyp" value={freight.admin_doc_adminFees_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={discountInputValue("admin_doc_adminFees")}
                              name="admin_doc_adminFees_disc%" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.admin_doc_adminFees.disc)}
                              name='admin_doc_adminFees_disc'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_doc_adminFees.exclusive)}
                              name='admin_doc_adminFees_exclusive'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.admin_doc_adminFees.vat)}
                              name='admin_doc_adminFees_vat'
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.admin_doc_adminFees.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name='admin_doc_adminFees_vatIncl'
                              className="supplier_form"
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong> Total - Admin Charges</strong>
                          </td>
                          <td colSpan={2}> {totaAdminransit.toFixed(2)} </td>
                          <td> {totalAdminnsitRoe.toFixed(2)} </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td> Description</td>
                          <td>Customs Duty</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_duty_qty || ""}
                              name="cust_duty_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="cust_duty_curr"
                              value={freight?.cust_duty_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_duty_cost || ""}
                              name="cust_duty_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="cust_duty_unitTyp"
                              value={freight?.cust_duty_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.cust_duty.unit)}
                              name="cust_duty_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.cust_duty.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="cust_duty_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_AdminAgrncy_currency_gp}
                                        name="Destination_AdminAgrncy_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAadminAgencyngeon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="cust_duty_roe"
                              onChange={handlechangecalc}
                              value={freight?.cust_duty_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.cust_duty.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="cust_duty_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="cust_duty_vatTyp" value={freight.cust_duty_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("cust_duty")}
                              name="cust_duty_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.cust_duty.disc)}
                              name="cust_duty_disc"
                              placeholder="0.00"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.cust_duty.exclusive)}
                              onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form" value={formatMoney(invoiceBreakups.cust_duty.vat)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form" name="cust_duty_vatIncl" value={formatMoney(invoiceBreakups.cust_duty.inclusive)}
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Customs Vat</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_vat_qty || ""}
                              name="cust_vat_qty"
                              id="floatingInput"
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
                              name="cust_vat_curr"
                              onChange={handlechangecalc}
                              value={freight?.cust_vat_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_vat_cost || ""}
                              name="cust_vat_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="cust_vat_unitTyp"
                              value={freight?.cust_vat_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.cust_vat.unit)}
                              name="cust_vat_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.cust_vat.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="cust_vat_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_disbursemant_currency_gp
                                        }
                                        name="Destination_disbursemant_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdisbursemon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="cust_vat_roe"
                              onChange={handlechangecalc}
                              value={freight?.cust_vat_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.cust_vat.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="cust_vat_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="cust_vat_vatTyp" value={freight.cust_vat_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("cust_vat")}
                              name="cust_vat_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.cust_vat.disc)}
                              name="cust_vat_disc"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.cust_vat.exclusive)}

                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form" value={formatMoney(invoiceBreakups.cust_vat.vat)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" name="cust_vat_vatIncl" value={formatMoney(invoiceBreakups.cust_vat.inclusive)}
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Advalorem Duty</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.adv_duty_qty || ""}
                              name="adv_duty_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="adv_duty_curr"
                              value={freight?.adv_duty_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.adv_duty_cost || ""}
                              name="adv_duty_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="adv_duty_unitTyp"
                              value={freight?.adv_duty_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.adv_duty.unit)}
                              name="adv_duty_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.adv_duty.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="adv_duty_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_doc_currency_gp}
                                        name="Destination_doc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdocon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="adv_duty_roe"
                              onChange={handlechangecalc}
                              value={freight?.adv_duty_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.adv_duty.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="adv_duty_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select value={freight.adv_duty_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("adv_duty")}
                              name="adv_duty_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.adv_duty.disc)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.adv_duty.exclusive)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form" value={formatMoney(invoiceBreakups.adv_duty.vat)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" value={formatMoney(invoiceBreakups.adv_duty.inclusive)}
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Customs Penalty</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_penalty_qty || ""}
                              name="cust_penalty_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="cust_penalty_curr"
                              value={freight?.cust_penalty_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.cust_penalty_cost || ""}
                              name="cust_penalty_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="cust_penalty_unitTyp"
                              value={freight?.cust_penalty_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.cust_penalty.unit)}
                              name="cust_penalty_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.cust_penalty.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="cust_penalty_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_AdminAgrncy_currency_gp}
                                        name="Destination_AdminAgrncy_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAadminAgencyngeon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="cust_penalty_roe"
                              onChange={handlechangecalc}
                              value={freight?.cust_penalty_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.cust_penalty.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="cust_penalty_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="cust_penalty_vatTyp" value={freight.cust_penalty_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("cust_penalty")}
                              name="cust_penalty_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.cust_penalty.disc)}
                              name="cust_penalty_disc"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.cust_penalty.exclusive)}
                              onChange={handlechangecalc}
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form" value={formatMoney(invoiceBreakups.cust_penalty.vat)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              className="supplier_form" name="cust_penalty_vatIncl" value={formatMoney(invoiceBreakups.cust_penalty.inclusive)}
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Customs Provisional payments</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.custProv_pay_qty || ""}
                              name="custProv_pay_qty"
                              id="floatingInput"
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
                              name="custProv_pay_curr"
                              onChange={handlechangecalc}
                              value={freight?.custProv_pay_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.custProv_pay_cost || ""}
                              name="custProv_pay_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="custProv_pay_unitTyp"
                              value={freight?.custProv_pay_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.custProv_pay.unit)}
                              name="custProv_pay_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.custProv_pay.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="custProv_pay_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={
                                          freight?.Destination_disbursemant_currency_gp
                                        }
                                        name="Destination_disbursemant_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdisbursemon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="custProv_pay_roe"
                              onChange={handlechangecalc}
                              value={freight?.custProv_pay_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.custProv_pay.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="custProv_pay_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="custProv_pay_vatTyp" value={freight.custProv_pay_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("custProv_pay")}
                              name="custProv_pay_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.custProv_pay.disc)}
                              name="custProv_pay_disc"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}

                              className="supplier_form" value={formatMoney(invoiceBreakups.custProv_pay.exclusive)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form" value={formatMoney(invoiceBreakups.custProv_pay.vat)}
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              className="supplier_form" name="custProv_pay_vatIncl" value={formatMoney(invoiceBreakups.custProv_pay.inclusive)}
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Clearing fee</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.clearing_fee_qty || ""}
                              name="clearing_fee_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="clearing_fee_curr"
                              value={freight?.clearing_fee_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.clearing_fee_cost || ""}
                              name="clearing_fee_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="clearing_fee_unitTyp"
                              value={freight?.clearing_fee_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.clearing_fee.unit)}
                              name="clearing_fee_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.clearing_fee.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="clearing_fee_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_doc_currency_gp}
                                        name="Destination_doc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdocon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="clearing_fee_roe"
                              onChange={handlechangecalc}
                              value={freight?.clearing_fee_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.clearing_fee.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="clearing_fee_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="clearing_fee_vatTyp" value={freight.clearing_fee_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("clearing_fee")}
                              name="clearing_fee_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.clearing_fee.disc)}
                              name="clearing_fee_disc"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.clearing_fee.exclusive)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.clearing_fee.vat)}
                              onChange={handlechangecalc}
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.clearing_fee.inclusive)}
                              type="text"
                              placeholder="0.00"
                              name="clearing_fee_vatIncl"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Disbursement</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.disbursement_qty || ""}
                              name="disbursement_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="disbursement_curr"
                              value={freight?.disbursement_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.disbursement_cost || ""}
                              name="disbursement_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="disbursement_unitTyp"
                              value={freight?.disbursement_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.disbursement.unit)}
                              name="disbursement_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.disbursement.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="disbursement_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_doc_currency_gp}
                                        name="Destination_doc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdocon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="disbursement_roe"
                              onChange={handlechangecalc}
                              value={freight?.disbursement_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.disbursement.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="disbursement_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="disbursement_vatTyp" value={freight.disbursement_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={discountInputValue("disbursement")}
                              name="disbursement_disc%"
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              value={formatMoney(invoiceBreakups.disbursement.disc)}
                              name="disbursement_disc" onChange={handlechangecalc}
                              placeholder="0.00"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.disbursement.exclusive)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              value={formatMoney(invoiceBreakups.disbursement.vat)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.disbursement.inclusive)}
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              name="disbursement_vatIncl"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td> </td>
                          <td>Surcharge</td>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.surcharge_qty || ""}
                              name="surcharge_qty"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="surcharge_curr"
                              value={freight?.surcharge_curr || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              value={freight?.surcharge_cost || ""}
                              name="surcharge_cost"
                              id="floatingInput"
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
                              onChange={handlechangecalc}
                              name="surcharge_unitTyp"
                              value={freight?.surcharge_unitTyp || ""}
                            >
                              <option>Select</option>
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
                              onKeyPress={handlepresss}
                              className="supplier_form"
                              onChange={handlechangecalc}
                              disabled
                              value={formatMoney(customChargeRows.surcharge.unit)}
                              name="surcharge_unit"
                              id="floatingInput"
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
                              value={formatMoney(customChargeRows.surcharge.totalCost)}
                              id="floatingInput"
                              placeholder="0.00" name="surcharge_TCost"
                              readOnly
                            />
                          </td>
                          {/* <td>
                                      <input
                                        style={{
                                          marginBottom: 0,
                                          fontSize: 13,
                                          color: "black",
                                          fontWeight: 400,
                                          width: "50px",
                                          border: "0px",
            
                                          verticalAlign: "middle",
                                        }}
                                        type="text"
                                        onKeyPress={handlepresss}
                                        className="supplier_form"
                                        onChange={handlechangecalc}
                                        value={freight?.Destination_doc_currency_gp}
                                        name="Destination_doc_currency_gp"
                                        id="floatingInput"
                                        placeholder="0.00%"
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
                                        value={VAdocon}
                                        className="supplier_form"
                                      />{" "}
                                    </td> */}
                          <td>
                            <input
                              style={{
                                marginBottom: 0,
                                fontSize: 13,
                                color: "black",

                                border: "0px",
                                verticalAlign: "middle",
                              }}
                              name="surcharge_roe"
                              onChange={handlechangecalc}
                              value={freight?.surcharge_roe || ""}
                              className="supplier_form"
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
                              value={formatMoney(customChargeRows.surcharge.finalAmt)}
                              placeholder="0.00"
                              className="supplier_form" name="surcharge_finalAmt"
                              readOnly
                            />
                          </td>
                          <td>
                            {" "}
                            <select name="surcharge_vatTyp" value={freight.surcharge_vatTyp || ""} onChange={handlechangecalc}>
                              <option value="">No Vat</option>
                              <option value="15">Standard Rate(15.00%)</option>
                              <option value="15">
                                Standard Rate (Capital Goods) (15.00%)
                              </option>
                              <option value="0">Zero Rate</option>
                              <option value="0">
                                Zero Rate Exports(0.00%)
                              </option>
                              <option value="0">
                                Exempt and Non-Suppliers(0.00%)
                              </option>
                              <option value="15">
                                Export of Second Hands Goods(15.00%)
                              </option>
                              <option value="15">Change in Use(15.00%)</option>
                              <option value="100">Customs VAT(100.00%)</option>
                              <option value="100">
                                Goods and Services Imported(100.00%)
                              </option>
                              <option value="100">
                                Capital Goods and Imported(100.00%)
                              </option>
                              <option value="100">
                                VAT Adjustment (100.00%)
                              </option>
                              <option value="15">
                                Domestic Reverse Charge (15.00%)
                              </option>
                              <option value="">Manual VAT</option>
                              <option value="">
                                Manual VAT (Capital Goods)
                              </option>
                            </select>{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={discountInputValue("surcharge")}
                              name="surcharge_disc%" onChange={handlechangecalc}
                              className="supplier_form"
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.surcharge.disc)}
                              name="surcharge_disc" onChange={handlechangecalc}
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text"
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.surcharge.exclusive)}
                              onChange={handlechangecalc}
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input
                              type="text" onChange={handlechangecalc}
                              placeholder="0.00"
                              value={formatMoney(invoiceBreakups.surcharge.vat)}

                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                          <td>
                            {" "}
                            <input

                              value={formatMoney(invoiceBreakups.surcharge.inclusive)}
                              type="text"
                              placeholder="0.00" onChange={handlechangecalc}
                              name="surcharge_vatIncl"
                              className="supplier_form"
                              readOnly
                            />{" "}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan={6}>
                            <strong> Total - Charge</strong>
                          </td>
                          <td colSpan={2}>
                            {formatMoney(customChargeTotals.totalCost)}
                          </td>
                          <td>{formatMoney(customChargeTotals.finalAmount)}</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>{formatMoney(customChargeTotals.vatInclusive)}</td>
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
    </>
  );
}

