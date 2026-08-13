import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDownloadForOffline } from "react-icons/md";
import { usePDF } from "react-to-pdf";
import logo from "../Assests/logo.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import html2pdf from "html2pdf.js";
export default function Supplierestimationview() {
  const [update, setUpdate] = useState([0]);
  const location = useLocation();
  const [showData, setShowData] = useState(false);
  const [freight, setFreight] = useState([0]);
  const [client, setClient] = useState([]);
  const pdfRef = useRef();
  const [suppluierquot, setSuppluierquot] = useState([]);
  const [supplierdata, setSupplierdata] = useState([]);
  const [dat, setDat] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const navigate = useNavigate();
  const getdata = location?.state?.data;
  const getdata11 = location?.state?.freight_id;
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
  useEffect(() => {
    getsupplier();
  }, []);
  useEffect(() => {
    getdataapi();
  }, []);
  console.log(location.state, "location");
  const data1 = location?.state?.data?.id;
  const data2 = location?.state?.freight_id;
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
    console.log(getdata);
    const data123456 = {
      supplier_id: data1,
      freight_id: data2.data,
    };
    console.log(data123456);
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}GetShipEstimateSupplierId`,
        data123456,
      )
      .then((response) => {
        console.log(response);
        setFreight(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handleclicknav = () => {
    navigate("/Admin/SupplierEstimation", { state: { data: data2.data } });
  };
  const closemodal = () => {
    setOpenmodal(false);
  };
  const handkeassign = async () => {
    try {
      const dataassign = {
        freight_id: data1,
        supplier_id: data2,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}ApproveShippingEstimate`,
        dataassign,
      );
      if (response.data?.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "Server error occurred");
    }
  };
  const oripick1 = parseFloat(freight.origin_pick_up_cost) || 0;
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
      freight.Destination_disbursemant_currenc_unitType1 == "1"
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
    freight.Destination_doc_currency_unittype == "1"
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
  const userType = JSON.parse(localStorage.getItem("data123"));
  const estimateCalculate = async () => {
    console.log(data1, data2);
    const payload = {
      freight_id: data2.data,
      client_id: getdata.client_ref,
      client_name: getdata.client_name,
      serial_number: freight.serial_number,
      date: update.date,
      client_ref: getdata.client_ref,
      user_type: userType.user_type,
      product_desc: getdata.product_desc,
      type: getdata.type,
      freight: getdata.freight,
      ...(getdata?.quote_estimate_id && {
        quote_estimate_id: getdata?.quote_estimate_id,
      }),
      incoterm: getdata.incoterm,
      dimension: getdata.dimension,
      supplier_id: freight.supplier_id,
      weight: getdata.weight,
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
      origin_pick_up_documantion_cost: freight.origin_pick_up_documantion_cost,
      origin_pick_up_documantation_fees:
        freight.origin_pick_up_documantation_fees,
      origin_pick_documantation_cost_gp:
        freight.origin_pick_documantation_cost_gp,
      oridoc4: oridoc4,
      finaldoc1: finaldoc1,
      pickup_freight_currency: freight.pickup_freight_currency,
      freight_charge_currency: freight.freight_charge_currency,
      Transit_currency: freight.Transit_currency,
      Destination_freight_currency: freight.Destination_freight_currency,
      admin_currency_charge: freight.admin_currency_charge,
      roe_origin_doc_currency: freight.roe_origin_doc_currency,
      finalvlaueodoc: finalvlaueodoc,
      origin_pick_up_forewarding_cost: freight.origin_pick_up_forewarding_cost,
      origin_pick_up_forewarding_fees: freight.origin_pick_up_forewarding_fees,
      origin_pickup_forewarding_gp: freight.origin_pickup_forewarding_gp,
      oriforewarding4: oriforewarding4,
      roe_origin_forewarding: freight.roe_origin_forewarding,
      finalforewarding1: finalforewarding1,
      finalvlaueoforewarding: finalvlaueoforewarding,
      origin_pick_up_custome_cost: freight.origin_pick_up_custome_cost,
      origin_pick_up_custome_clearance:
        freight.origin_pick_up_custome_clearance,
      origin_pickup_custome_gp: freight.origin_pickup_custome_gp,
      Destination_disbursemant_currenc_unitType1: freight.Destination_disbursemant_currenc_unitType1,
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
      freight_currency_insurance_cost: freight.freight_currency_insurance_cost,
      freight_currency_insurance_unit: freight.freight_currency_insurance_unit,
      freightorigin_insurance_gp: freight.freightorigin_insurance_gp,
      oriinsurance4: oriinsurance4,
      roe_insurance_currency: freight.roe_insurance_currency,
      finalinsurance1: finalinsurance1,
      finalvlaueoInsurance: finalvlaueoInsurance,
      totalChageswithOutExchangeinsurance: totalChageswithOutExchangeinsurance,
      totalChangeRoeOriginaftercalcuinsurance:
        totalChangeRoeOriginaftercalcuinsurance,
      Transit_currency_Cost: freight.Transit_currency_Cost,
      Transit_currency_unit: freight.Transit_currency_unit,
      Transit_currency_gp: freight.Transit_currency_gp,
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
      transit_change_Documentation_gp: freight.transit_change_Documentation_gp,
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
      Destination_freight_currency_gp: freight.Destination_freight_currency_gp,
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
      Destination_Unpack_currency_roe: freight.Destination_Unpack_currency_roe,
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
      origin_pick_up_fuel_unitTypeQTY: freight.origin_pick_up_fuel_unitTypeQTY,
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
      origin_pick_up_custome_unitType: freight.origin_pick_up_custome_unitType,
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
      Destination_doc_currency_unittypeQTY:
        freight.Destination_doc_currency_unittypeQTY,
      ...(getdata?.quote_estimate_id && {
        quote_estimate_id: getdata?.quote_estimate_id,
      }),
    };
    try {
      // const payload = {
      //   freight_id: getdata.freight_id,
      //   client_id: getdata.client_ref,
      //   client_name: getdata.client_name,
      //   serial_number: freight.serial_number,
      //   date: update.date,
      //   client_ref: getdata.client_ref,
      //   product_desc: getdata.product_desc,
      //   type: getdata.type,
      //   freight: getdata.freight,
      //   ...(getdata.quote_estimate_id && {
      //     quote_estimate_id: getdata.quote_estimate_id,
      //   }),
      //   incoterm: getdata.incoterm,
      //   dimension: getdata.dimension,
      //   supplier_id: freight.supplier_id,
      //   weight: getdata.weight,
      //   origin_pick_up_cost: freight.origin_pick_up_cost,
      //   origin_pick_up_fees: freight.origin_pick_up_fees,
      //   origin_pickup_fee_gpcalc: freight.origin_pickup_fee_gpcalc,
      //   roe_origin_currencyorigin: freight.roe_origin_currencyorigin,
      //   finalvlaueoriginPickup: finalvlaueoriginPickup,
      //   oripick4: oripick4,
      //   finalori1: finalori1,
      //   origin_pick_up_fuel_cost: freight.origin_pick_up_fuel_cost,
      //   origin_pick_up_fuel_fees: freight.origin_pick_up_fuel_fees,
      //   origin_pick_fuelGP: freight.origin_pick_fuelGP,
      //   orifuel4: orifuel4,
      //   finalfuel1: finalfuel1,
      //   roe_origin_fuel_currency: freight.roe_origin_fuel_currency,
      //   finalvlaueoFuel: finalvlaueoFuel,
      //   origin_pick_up_cfs_cost: freight.origin_pick_up_cfs_cost,
      //   origin_pick_up_cfs_fees: freight.origin_pick_up_cfs_fees,
      //   origin_pickup_vfs_gp: freight.origin_pickup_vfs_gp,
      //   oricfs4: oricfs4,
      //   finalcfs1: finalcfs1,
      //   roe_origin_cfs_currency: freight.roe_origin_cfs_currency,
      //   roe_freight_currency: freight.roe_freight_currency,
      //   finalvlaueocfs: finalvlaueocfs,
      //   origin_pick_up_documantion_cost:
      //     freight.origin_pick_up_documantion_cost,
      //   origin_pick_up_documantation_fees:
      //     freight.origin_pick_up_documantation_fees,
      //   origin_pick_documantation_cost_gp:
      //     freight.origin_pick_documantation_cost_gp,
      //   oridoc4: oridoc4,
      //   finaldoc1: finaldoc1,
      //   roe_origin_doc_currency: freight.roe_origin_doc_currency,
      //   finalvlaueodoc: finalvlaueodoc,
      //   origin_pick_up_forewarding_cost:
      //     freight.origin_pick_up_forewarding_cost,
      //   origin_pick_up_forewarding_fees:
      //     freight.origin_pick_up_forewarding_fees,
      //   origin_pickup_forewarding_gp: freight.origin_pickup_forewarding_gp,
      //   oriforewarding4: oriforewarding4,
      //   roe_origin_forewarding: freight.roe_origin_forewarding,
      //   finalforewarding1: finalforewarding1,
      //   finalvlaueoforewarding: finalvlaueoforewarding,
      //   origin_pick_up_custome_cost: freight.origin_pick_up_custome_cost,
      //   origin_pick_up_custome_clearance:
      //     freight.origin_pick_up_custome_clearance,
      //   origin_pickup_custome_gp: freight.origin_pickup_custome_gp,
      //   oricustome4: oricustome4,
      //   roe_origin_customes: freight.roe_origin_customes,
      //   finalcustomes1: finalcustomes1,
      //   finalvlaueoCustomes: finalvlaueoCustomes,
      //   totalChageswithOutExchange: totalChageswithOutExchange,
      //   totalChangeRoeOrigin: totalChangeRoeOrigin,
      //   freight_charge_currency_cost: freight.freight_charge_currency_cost,
      //   freight_charge_currency_fees: freight.freight_charge_currency_fees,
      //   freight_charge_currency_gp: freight.freight_charge_currency_gp,
      //   orifreight4: orifreight4,
      //   finalfreight1: finalfreight1,
      //   finalvlaueofreight: finalvlaueofreight,
      //   freight_currency_insurance_cost:
      //     freight.freight_currency_insurance_cost,
      //   freight_currency_insurance_unit:
      //     freight.freight_currency_insurance_unit,
      //   freightorigin_insurance_gp: freight.freightorigin_insurance_gp,
      //   oriinsurance4: oriinsurance4,
      //   roe_insurance_currency: freight.roe_insurance_currency,
      //   finalinsurance1: finalinsurance1,
      //   finalvlaueoInsurance: finalvlaueoInsurance,
      //   totalChageswithOutExchangeinsurance:
      //     totalChageswithOutExchangeinsurance,
      //   totalChangeRoeOriginaftercalcuinsurance:
      //     totalChangeRoeOriginaftercalcuinsurance,
      //   Transit_currency_Cost: freight.Transit_currency_Cost,
      //   Transit_currency_unit: freight.Transit_currency_unit,
      //   Transit_currency_gp: freight.Transit_currency_gp,
      //   Transit_currency_roe: freight.Transit_currency_roe,
      //   finaltransit1: finaltransit1,
      //   finalvlaueotransit: finalvlaueotransit,
      //   oritransit4: oritransit4,
      //   transit_currency_THC_cost: freight.transit_currency_THC_cost,
      //   transit_currency_THC_init: freight.transit_currency_THC_init,
      //   transit_currency_THC_gp: freight.transit_currency_THC_gp,
      //   roe_Transit_Thc: freight.roe_Transit_Thc,
      //   finalThc1: finalThc1,
      //   finalvlaueotfineal: finalvlaueotfineal,
      //   oriThc4: oriThc4,
      //   Transit_currency_unpack_cost: freight.Transit_currency_unpack_cost,
      //   Transit_currency_unpack_unit: freight.Transit_currency_unpack_unit,
      //   Transit_currency_unpack_gp: freight.Transit_currency_unpack_gp,
      //   Transit_unpack_roe: freight.Transit_unpack_roe,
      //   finalunpack1: finalunpack1,
      //   finalvlaueotfunpack: finalvlaueotfunpack,
      //   oriunpack4: oriunpack4,
      //   transit_3rd_party_cost: freight.transit_3rd_party_cost,
      //   transit_3rd_party_unit: freight.transit_3rd_party_unit,
      //   transit_3rd_party_gp: freight.transit_3rd_party_gp,
      //   ori3rdparty4: ori3rdparty4,
      //   final3rdparty1: final3rdparty1,
      //   finalvlaueot3dparty: finalvlaueot3dparty,
      //   transit_currency_3rd: freight.transit_currency_3rd,
      //   transit_admin_change: freight.transit_admin_change,
      //   transit_admin_unit: freight.transit_admin_unit,
      //   transit_admin_gp: freight.transit_admin_gp,
      //   ori3rdAdmin4: ori3rdAdmin4,
      //   final3rdAdmin1: final3rdAdmin1,
      //   finalvlaueotAdmin: finalvlaueotAdmin,
      //   roe_transit_admin: freight.roe_transit_admin,
      //   transit_currency_port: freight.transit_currency_port,
      //   transit_currency_port_unit: freight.transit_currency_port_unit,
      //   transit_currency_port_gp: freight.transit_currency_port_gp,
      //   ori3rdport4: ori3rdport4,
      //   final3rdport1: final3rdport1,
      //   finalvlaueotPort: finalvlaueotPort,
      //   roe_trans_port: freight.roe_trans_port,
      //   Transit_advanced_load: freight.Transit_advanced_load,
      //   Transit_advanced_unit: freight.Transit_advanced_unit,
      //   Transit_advanced_gp: freight.Transit_advanced_gp,
      //   Transit_advanced_gp_roe: freight.Transit_advanced_gp_roe,
      //   oriadv4: oriadv4,
      //   final3rdadv1: final3rdadv1,
      //   finalvlaueotadv: finalvlaueotadv,
      //   transit_change_Documentation: freight.transit_change_Documentation,
      //   transit_change_Documentation_unit:
      //     freight.transit_change_Documentation_unit,
      //   transit_change_Documentation_gp:
      //     freight.transit_change_Documentation_gp,
      //   roe_transit_change_Documentation:
      //     freight.roe_transit_change_Documentation,
      //   oridocumentation4: oridocumentation4,
      //   final3rdocumantation1: final3rdocumantation1,
      //   finalvlaueotDocumantation: finalvlaueotDocumantation,
      //   totalChageswithOuTransit: totalChageswithOuTransit,
      //   transitRoe: transitRoe,
      //   Destination_freight_currency_cost:
      //     freight.Destination_freight_currency_cost,
      //   Destination_freight_currency_unit:
      //     freight.Destination_freight_currency_unit,
      //   Destination_freight_currency_gp:
      //     freight.Destination_freight_currency_gp,
      //   destinationdocumentation4: destinationdocumentation4,
      //   final3rdestination1: final3rdestination1,
      //   final3rdestinationRoe: final3rdestinationRoe,
      //   Destination_freight_currency_Roe:
      //     freight.Destination_freight_currency_Roe,
      //   Destination_THC_currency_cost: freight.Destination_THC_currency_cost,
      //   Destination_THC_currency_unit: freight.Destination_THC_currency_unit,
      //   Destination_THC_currency_gp: freight.Destination_THC_currency_gp,
      //   destinationTHCdocumentation4: destinationTHCdocumentation4,
      //   final3rTHCdestination1: final3rTHCdestination1,
      //   final3rTHCdestinationRoe: final3rTHCdestinationRoe,
      //   Destination_THC_currency_Roe: freight.Destination_THC_currency_Roe,
      //   Destination_Unpack_currency_cost:
      //     freight.Destination_Unpack_currency_cost,
      //   Destination_Unpack_currency_unit:
      //     freight.Destination_Unpack_currency_unit,
      //   Destination_Unpack_currency_gp: freight.Destination_Unpack_currency_gp,
      //   destinationUnpackdocumentation4: destinationUnpackdocumentation4,
      //   final3runpackdestination1: final3runpackdestination1,
      //   final3rUnpackdestinationRoe: final3rUnpackdestinationRoe,
      //   Destination_Unpack_currency_roe:
      //     freight.Destination_Unpack_currency_roe,
      //   Destination_fuelsurcharge_currency_cost:
      //     freight.Destination_fuelsurcharge_currency_cost,
      //   Destination_fuelsurcharge_currency_unit:
      //     freight.Destination_fuelsurcharge_currency_unit,
      //   Destination_fuelsurcharge_currency_gp:
      //     freight.Destination_fuelsurcharge_currency_gp,
      //   destinationfuelsurchargedocumentation4:
      //     destinationfuelsurchargedocumentation4,
      //   final3rfuelsurchargedestination1: final3rfuelsurchargedestination1,
      //   final3rfuelsurCahrgeestinationRoe: final3rfuelsurCahrgeestinationRoe,
      //   Destination_fuelsurcharge_currency_roe:
      //     freight.Destination_fuelsurcharge_currency_roe,
      //   Destination_adminsurcharge_currency_cost:
      //     freight.Destination_adminsurcharge_currency_cost,
      //   Destination_adminsurcharge_currency_unit:
      //     freight.Destination_adminsurcharge_currency_unit,
      //   Destination_adminsurcharge_currency_gp:
      //     freight.Destination_adminsurcharge_currency_gp,
      //   destinatiadminsurcharge4: destinatiadminsurcharge4,
      //   Valueadminsurchargedestanion: Valueadminsurchargedestanion,
      //   adminsurcharge2: adminsurcharge2,
      //   Destination_adminsurcharge_currency_roe:
      //     freight.Destination_adminsurcharge_currency_roe,
      //   Destination_portcargo_currency_cost:
      //     freight.Destination_portcargo_currency_cost,
      //   Destination_portcargo_currency_unit:
      //     freight.Destination_portcargo_currency_unit,
      //   Destination_portcargo_currency_gp:
      //     freight.Destination_portcargo_currency_gp,
      //   destinatiportcargo4: destinatiportcargo4,
      //   Vaportcargoion: Vaportcargoion,
      //   admiportcargo2: admiportcargo2,
      //   Destination_portcargo_currency_roe:
      //     freight.Destination_portcargo_currency_roe,
      //   Destination_AdvancedLoad_currency_cost:
      //     freight.Destination_AdvancedLoad_currency_cost,
      //   Destination_AdvancedLoad_currency_unit:
      //     freight.Destination_AdvancedLoad_currency_unit,
      //   Destination_AdvancedLoad_currency_gp:
      //     freight.Destination_AdvancedLoad_currency_gp,
      //   destinatiAdvancedLoad4: destinatiAdvancedLoad4,
      //   VAdvancedLoadion: VAdvancedLoadion,
      //   desdvancedLoadion: desdvancedLoadion,
      //   Destination_AdvancedLoad_currency_roe:
      //     freight.Destination_AdvancedLoad_currency_roe,
      //   Destination_3rdpartyDesc_currency_cost:
      //     freight.Destination_3rdpartyDesc_currency_cost,
      //   Destination_3rdpartyDesc_currency_unit:
      //     freight.Destination_3rdpartyDesc_currency_unit,
      //   Destination_3rdpartyDesc_currency_gp:
      //     freight.Destination_3rdpartyDesc_currency_gp,
      //   destinati3rdpartyload4: destinati3rdpartyload4,
      //   VAdvanced3rdpartyLoadion: VAdvanced3rdpartyLoadion,
      //   desdva3rdpartyion: desdva3rdpartyion,
      //   Destination_3rdpartyDesc_currency_roe:
      //     freight.Destination_3rdpartyDesc_currency_roe,
      //   Destination_delivery_currency_cost:
      //     freight.Destination_delivery_currency_cost,
      //   Destination_delivery_currency_unit:
      //     freight.Destination_delivery_currency_unit,
      //   Destination_delivery_currency_gp:
      //     freight.Destination_delivery_currency_gp,
      //   destindeliveryyDesc4: destindeliveryyDesc4,
      //   VAdvandeliverytyLoadion: VAdvandeliverytyLoadion,
      //   desddeliverytyion: desddeliverytyion,
      //   Destination_delivery_currency_roe:
      //     freight.Destination_delivery_currency_roe,
      //   Destination_fuelcharge_currency_cost:
      //     freight.Destination_fuelcharge_currency_cost,
      //   Destination_fuelcharge_currency_unit:
      //     freight.Destination_fuelcharge_currency_unit,
      //   Destination_fuelcharge_currency_gp:
      //     freight.Destination_fuelcharge_currency_gp,
      //   destindfuelchangerDesc4: destindfuelchangerDesc4,
      //   VAdvfuelchangeon: VAdvfuelchangeon,
      //   defuelchangyion: defuelchangyion,
      //   Destination_fuelcharge_currency_roe:
      //     freight.Destination_fuelcharge_currency_roe,
      //   totalChaDestinationTransit: totalChaDestinationTransit,
      //   totalChaDestinationTransitRoe: totalChaDestinationTransitRoe,
      //   Destination_AdminAgrncy_currency_cost:
      //     freight.Destination_AdminAgrncy_currency_cost,
      //   Destination_AdminAgrncy_currency_unit:
      //     freight.Destination_AdminAgrncy_currency_unit,
      //   Destination_AdminAgrncy_currency_gp:
      //     freight.Destination_AdminAgrncy_currency_gp,
      //   deadminAgencyesc4: deadminAgencyesc4,
      //   VAadminAgencyngeon: VAadminAgencyngeon,
      //   defuelchdminAgencyngangyion: defuelchdminAgencyngangyion,
      //   Destination_AdminAgrncy_currency_roe:
      //     freight.Destination_AdminAgrncy_currency_roe,
      //   Destination_disbursemant_currency_cost:
      //     freight.Destination_disbursemant_currency_cost,
      //   Destination_disbursemant_currency_unit:
      //     freight.Destination_disbursemant_currency_unit,
      //   Destination_disbursemant_currency_gp:
      //     freight.Destination_disbursemant_currency_gp,
      //   deaddisbursemantc4: deaddisbursemantc4,
      //   VAdisbursemon: VAdisbursemon,
      //   dedisbursementon: dedisbursementon,
      //   Destination_disbursemant_currency_roe:
      //     freight.Destination_disbursemant_currency_roe,
      //   Destination_doc_currency_cost: freight.Destination_doc_currency_cost,
      //   Destination_doc_currency_unit: freight.Destination_doc_currency_unit,
      //   Destination_doc_currency_gp: freight.Destination_doc_currency_gp,
      //   deadoctc4: deadoctc4,
      //   VAdocon: VAdocon,
      //   dedisbudoon: dedisbudoon,
      //   Destination_doc_currency_roe: freight.Destination_doc_currency_roe,
      //   deadoctc4: deadoctc4,
      //   totaAdminransit: totaAdminransit,
      //   totalAdminnsitRoe: totalAdminnsitRoe,
      //   sumofall: sumofall,
      //   sumofRoe: sumofRoe,
      // };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addEstimateShippingQuote`,
        payload,
      );
      if (response.data.success === true) {
        toast.success(response.data.message);
      } else {
        console.log("some thing went wrong");
      }
    } catch (error) {
      console.log(error.data);
    }
  };

  const supplier = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-suppler-selected`, {
        freight_id: getdata?.id,
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

  // ////////////////////////////////////////////////////supplier selected

  const supplierSelected = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}get-suppler-selected`,
        { freight_id: getdata.freight_id },
      );
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
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    getdataapi();
    getNewDataapi();
  }, []);

  const data1231 = {
    estimate_id: getdata?.estimate_id,
  };
  const getNewDataapi = async () => {
    const data123456 = {
      supplier_id: getdata?.id,
      freight_id: getdata11?.data,
    };
    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}GetQuoteShipEstimateBySupplier`,
        data123456,
      )
      .then((response) => {
        console.log(response.data.data);
        setFreight(response.data.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
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
      { freight_id: getdata.freight_id, supplier_ids: selected },
    );
    if (response.data.success) {
      toast.success(response.data.message);
      setOpenmodal(false);
    }
  };
  const downloadPDF = async () => {
    // console.log(freight.quote_estimate_id)
    navigate("/Admin/DownloadEstimate", { state: { data: freight } });
    // await setShowData("True");
    // await downloadPDF1();
  };
  const downloadPDF1 = () => {
    const element = pdfRef.current;
    const contentWidth = element.scrollWidth;
    const contentHeight = element.scrollHeight;
    const rect = element.getBoundingClientRect();
    const pdfWidth = Math.max(rect.width, contentWidth);
    const pdfHeight = Math.max(rect.height, contentHeight);
    const options = {
      margin: 0,
      filename: "page.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 1.5, useCORS: true, windowWidth: contentWidth },
      jsPDF: {
        unit: "px",
        format: [pdfWidth, pdfHeight],
        orientation: "portrait",
      },
      pagebreak: false,
    };
    html2pdf().from(element).set(options).save();
    setShowData(false);
  };

  // const handleclAssign = async (status) => {
  //   const payload = {
  //     freight_id: freight.freight_id,
  //     supplier_id: freight.supplier_id,
  //     status: status // 1 = Approved, 2 = Rejected
  //   };

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}ApproveShippingEstimate`,
  //       payload
  //     );
  //     toast.success("Quotation Status Updated Successfully");
  //     console.log("Success:", response.data);
  //   } catch (error) {
  //     console.error("Error:", error.response?.data || error.message);
  //   }
  // };
  const handleclAssign = async (status) => {
    const payload = {
      freight_id: freight.freight_id,
      supplier_id: freight.supplier_id,
      status: status, // 1 = Approved, 2 = Rejected
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}ApproveShippingEstimate`,
        payload,
      );
      toast.success(
        response.data?.message || "Quotation Status Updated Successfully",
      );
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Full Error:", error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.message || err);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response) {
        toast.error(`Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };
  return (
    <>
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
              <div style={{ margin: "20px" }}>
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
            <div>
              <div className="row mb-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex">
                      <div>
                        <ArrowBackIcon
                          onClick={handleclicknav}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      <div>
                        <h4 className="freight_hd mt-0 ms-3">Supplier Estimate Form</h4>
                      </div>
                    </div>
                    {/* <MdDownloadForOffline
                      onClick={() => downloadPDF()}
                      className="fs-2"
                      style={{ color: "#1b2245", cursor: "pointer" }}
                    /> */}
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
                          <td style={{ width: "50%", color: "#000" }}>
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
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: "unset",
                                lineHeight: "1.5",

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
                            <p> </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table
                      style={{
                        border: "2px solid #1b2245",
                        padding: "10px 20px",
                        width: "100%",
                        marginTop: 5,
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
                                      fontSize: 13,
                                      padding: "0px 10px",
                                    }}
                                  >
                                    <strong>
                                      {freight.client_name}
                                      <br />
                                      {freight.address_1}
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
                                  <td style={{ fontSize: 13, }}>
                                    Shipment Details ISO Commodity
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style={{ width: "100%" }}>
                              <tbody>
                                <tr>
                                  { }
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

                                        }}
                                      >
                                        <strong> No. of Packages</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",

                                        }}
                                      >
                                        {freight?.no_of_packages}
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
                                        {freight?.package_type}
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
                                        {freight?.weight}
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
                                        {freight?.volumetric_weight}
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
                                        {freight?.commodity}
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
                                        {freight?.hazardous}
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
                                        {freight?.incoterm}
                                      </p>
                                    </div>
                                    {/* <div
                                                  style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                  }}
                                                >
                                                  <p
                                                    style={{
                                                      fontSize: 13,
                                                      marginBottom: "unset",
                                                      marginTop: 10,
                                                    }}
                                                  >
                                                    <strong>dimension</strong>
                                                  </p>
                                                  <p
                                                    style={{
                                                      fontSize: 13,
                                                      marginBottom: "unset",
                                                      marginTop: 10,
                                                    }}
                                                  >
                                                    {freight?.dimension}
                                                  </p>
                                                </div> */}

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
                                        {freight?.freight}
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
                                  <td style={{ fontSize: 14 }}>
                                    Rate of Exchange
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style={{ width: "100%" }}>
                              <tbody>
                                <tr>
                                  <td>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "5px 10px",
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
                          <td style={{ width: "50%", paddingTop: 5 }}>
                            <table>
                              <tbody>
                                <tr>
                                  <td
                                    style={{
                                      width: 170,
                                      display: "block",
                                      padding: "0px 10px 5px 10px",
                                      fontSize: 13,
                                    }}
                                  >
                                    <strong>Reference</strong>
                                  </td>
                                  <td
                                    style={{ paddingBottom: 5, fontSize: 14 }}
                                  >
                                    {freight?.client_ref_name}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      padding: "0px 10px 5px 10px",
                                      width: 170,
                                      display: "block",

                                      fontSize: 13,
                                    }}
                                  >
                                    <strong>Quote Date</strong>
                                  </td>
                                  <td
                                    style={{
                                      paddingBottom: 15,
                                      fontSize: 13,
                                      padding: "0px 10px 5px 10px",
                                    }}
                                  >
                                    {new Date(freight?.date).toLocaleDateString(
                                      "en-GB",
                                    )}
                                  </td>
                                </tr>
                                {/* <tr>
                                              <td
                                                style={{
                                                  padding: "0px 10px 10px 10px",
                                                  width: 170,
                                                  display: "block",
                                                  paddingBottom: 10,
                                                  fontSize: 13,
                                                }}
                                              >
                                                <strong>Valid Until</strong>
                                              </td>
                                              <td
                                                style={{ paddingBottom: 15, fontSize: 14 }}
                                              >
                                                2023/11/07
                                              </td>
                                            </tr> */}
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
                                          fontSize: 13,
                                          marginBottom: "unset",

                                        }}
                                      >
                                        <strong> Country of Origin</strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",

                                        }}
                                      >
                                        {freight.collection_from_name}
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
                                        {freight?.port_of_loading}
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
                                        {freight?.port_of_loading}
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
                                        {freight?.post_of_discharge}
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
                                        {freight?.delivery_to_name}
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
                                        <strong>
                                          {" "}
                                          Freight Collect Accepted
                                        </strong>
                                      </p>
                                      <p
                                        style={{
                                          fontSize: 13,
                                          marginBottom: "unset",
                                          marginTop: 5,
                                        }}
                                      >
                                        {freight?.quote_received}
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
                                        {new Date(
                                          freight?.date,
                                        ).toLocaleDateString("en-GB")}
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
                              QUOTE INFORMATION
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                        <th>GP</th>
                        <th>Amt</th>
                        <th>ROE</th>
                        <th>Final Amount</th>
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
                            onKeyPress={handlepresss}
                            className="supplier_form"
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
                            disabled
                            onChange={handlechangecalc}
                            // value={freight?.origin_pick_up_fees}
                            value={
                              freight.origin_pick_up_unitType ? oripick2 : 0
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
                        <td>
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
                        <td>
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
                        <td>
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
                            value={freight?.origin_pick_up_documantion_cost}
                            name="origin_pick_up_documantion_cost"
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
                        <td>
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
                            value={freight?.origin_pick_up_forewarding_unitType}
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
                        <td>
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
                            value={freight?.origin_pick_up_custome_unitTypeQTY}
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
                        <td>
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
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong>Total - Origin Charges </strong>
                        </td>
                        <td colSpan={4}>
                          {" "}
                          {totalChageswithOutExchange.toFixed(2)}{" "}
                        </td>
                        <td> {totalChangeRoeOrigin.toFixed(2)} </td>
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
                            value={freight?.freight_charge_currency_unitTypeQTY}
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
                        <td>
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
                            value={freight?.freight_currency_insurance_unittype}
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
                        <td>
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
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong> Total - Freight Charges</strong>
                        </td>
                        <td colSpan={4}>
                          {" "}
                          {totalChageswithOutExchangeinsurance.toFixed(2)}{" "}
                        </td>
                        <td>
                          {" "}
                          {totalChangeRoeOriginaftercalcuinsurance.toFixed(
                            2,
                          )}{" "}
                        </td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                              isNaN(oridocumentation4) ? 0.0 : oridocumentation4
                            }
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
                      </tr>

                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong> Total - Transit Charges</strong>
                        </td>
                        <td colSpan={4}>
                          {" "}
                          {totalChageswithOuTransit.toFixed(2)}{" "}
                        </td>
                        <td> {transitRoe.toFixed(2)} </td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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
                            value={freight?.Destination_portcargo_currency_cost}
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
                        <td>
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
                        <td>
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
                        <td>
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
                            value={freight?.Destination_delivery_currency_cost}
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
                        <td>
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
                        <td>
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
                            name="Destination_fuelcharge_currency_roe"
                            onChange={handlechangecalc}
                            value={freight.Destination_fuelcharge_currency_roe}
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
                      </tr>

                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong> Total - Destination Charges </strong>
                        </td>
                        <td colSpan={4}>
                          {" "}
                          {totalChaDestinationTransit.toFixed(2)}{" "}
                        </td>
                        <td> {totalChaDestinationTransitRoe.toFixed(2)} </td>
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
                              isNaN(deadminAgencyesc4) ? 0.0 : deadminAgencyesc4
                            }
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
                            name="Destination_AdminAgrncy_currency_roe"
                            onChange={handlechangecalc}
                            value={freight.Destination_AdminAgrncy_currency_roe}
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
                        <td>
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
                        <td>
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
                              isNaN(dedisbudoon) ? 0.0 : dedisbudoon.toFixed(2)
                            }
                            placeholder="0.00"
                            className="supplier_form"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong> Total - Admin Charges</strong>
                        </td>
                        <td colSpan={4}> {totaAdminransit.toFixed(2)} </td>
                        <td> {totalAdminnsitRoe.toFixed(2)} </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td colSpan={6}>
                          <strong> Total - Charge</strong>
                        </td>
                        <td colSpan={4}> {sumofall.toFixed(2)} </td>
                        <td> {sumofRoe.toFixed(2)} </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-center mt-3">
                    {freight.isConfirmed === 1 ? (
                      ""
                    ) : (
                      <button className="ship_btn" onClick={estimateCalculate}>
                        Get Quote
                      </button>
                    )}
                    {freight.isConfirmed === 1 ? (
                      ""
                    ) : (
                      <div className="col-6 d-flex">
                        <div>
                          <button
                            className="blueBtn"
                            onClick={() => {
                              handleclAssign(1);
                            }}
                          >
                            Approve Quote
                          </button>
                        </div>
                        <div className="mx-2">
                          <button
                            className="redBtn"
                            onClick={() => {
                              handleclAssign(2);
                            }}
                          >
                            Reject Quote
                          </button>
                        </div>
                      </div>
                    )}
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
