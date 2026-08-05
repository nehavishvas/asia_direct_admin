import { ArrowBack } from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
export default function BookingInsForm() {
  const [data, setData] = useState({
    order_id: "",
    bk_shipper: "",
    bk_ship_add: "",
    bk_ship_contact: "",
    bk_ship_tel_email: "",
    bk_ship_poNo: "",
    bk_ship_custCode: "",
    bk_ship_regNum: "",
    bk_ship_refNo: "",
    bk_consignee: "",
    bk_consg_add: "",
    bk_consg_notfParty: "",
    bk_consg_ContPersn: "",
    bk_consg_tel: "",
    bk_consg_portDischg: "",
    bk_xdoc_provider: "",
    bk_comm_Invoice: "",
    bk_count_CommInv: "",
    bk_packing_list: "",
    bk_custm_doc: "",
    bk_trasprt_doc: "",
    bk_MSDS: "",
    bk_CuntyTrd_SADC: "",
    bk_letter_credit: "",
    bk_track_contPersn: "",
    bk_podDoc_contPersn: "",
    bk_exprt_modTransport: "",
    bk_comTerm_sales: "",
    bk_Instru_origin: "",
    bk_Instru_des: "",
    bk_Insur_cover: "",
    bk_estim_supp: "",
    bk_estim_ref: "",
    bk_org_exptCharge: "",
    bk_intenFreig_charge: "",
    bk_duties_taxes: "",
    bk_hazard_cargo: "",
    bk_cargo_packed: "",
    bk_battery_MSDS: "",
    bk_cnsolid_mulShipp: "",
    bk_preship_insp: "",
    bk_export_Import: "",
    bk_coll_dddress: "",
    bk_opening_times: "",
    bk_conName_tel: "",
    bk_loading_facilities: "",
    bk_desc_goods: "",
    bk_handling_req: "",
  });
  const location = useLocation();
  const navigate = useNavigate();
  const getdat = location.state.data;
  useEffect(() => {
    const loadData = async () => {
      await getStackta();
      await GetBookingInstructionById();
    };
    loadData();
  }, []);
  const getStackta = async () => {
    const postdata = {
      orderId: getdat.order_id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}OrderDetailsById`,
        postdata
      );

      if (response.data.success) {
        console.log(response.data.data[0]);
        const orderData = response.data.data[0] || {};
        const shipmentRefLower = orderData.shipment_ref?.toLowerCase();
        
        // Initialize default/fallback values
        orderData.bk_consg_ContPersn = orderData.bk_consg_ContPersn || (shipmentRefLower === "consignee" ? orderData.client_email : "");
        orderData.bk_ship_tel_email = orderData.bk_ship_tel_email || (shipmentRefLower === "shipper" ? orderData.email : "sa@asiadirect.africa");

        setData(prevState => ({
          ...prevState,
          ...orderData
        }));
      } else {
        console.error("Error fetching order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };
  const GetBookingInstructionById = async () => {
    try {
      const datapost = {
        order_id: getdat?.order_id,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetBookingInstructionById`,
        datapost
      );
      if (response.data && response.data.data) {
        const resData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        if (resData) {
          setData(prevState => {
            const merged = { ...prevState };
            Object.keys(resData).forEach(key => {
              if (resData[key] !== null && resData[key] !== undefined && resData[key] !== "") {
                merged[key] = resData[key];
              }
            });
            return merged;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching booking instruction:", error);
    }
  };

  const handlechnage = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleclick = async () => {
    console.log("Value of bk_comm_Invoice:", data.bk_comm_Invoice);
    const shipmentRefLower = data?.shipment_ref?.toLowerCase();
    const getdatShipmentRefLower = getdat?.shipment_ref?.toLowerCase();
    const postdatapi = {
      order_id: data?.order_id || getdat?.order_id,
      bk_shipper:
        shipmentRefLower === "shipper" ? data?.shipper_name : "Asia Direct",
      bk_ship_add:
        shipmentRefLower === "shipper"
          ? data?.supplier_address
          : " Johannesburg, South Africa",
      bk_ship_contact:
        getdatShipmentRefLower === "shipper"
          ? getdat?.cellphone
          : "+27 10 448 0733",
      bk_ship_tel_email:
        getdatShipmentRefLower === "shipper"
          ? getdat?.email
          : "sa@asiadirect.africa",
      bk_ship_poNo: data?.bk_ship_poNo,
      bk_ship_custCode: getdat?.code,
      bk_ship_regNum: data.bk_ship_regNum,
      bk_ship_refNo: data.bk_ship_refNo,
      bk_consignee:
        shipmentRefLower === "shipper" ? data?.shipper_name : "Asia Direct",
      bk_consg_add:
        shipmentRefLower === "shipper" ? data?.address_1 : "Asia Direct",
      bk_consg_notfParty: data.bk_consg_notfParty,

      bk_consg_tel:
        shipmentRefLower === "shipper" ? data?.telephone : "Asia Direct",
      bk_consg_portDischg: data?.post_of_discharge,
      bk_xdoc_provider: data?.bk_xdoc_provider,
      bk_comm_Invoice: data?.bk_comm_Invoice,
      bk_count_CommInv: data?.bk_count_CommInv,
      bk_packing_list: data?.bk_packing_list,
      bk_custm_doc: data?.bk_custm_doc,
      bk_trasprt_doc: data?.bk_trasprt_doc,
      bk_MSDS: data?.bk_MSDS,
      bk_CuntyTrd_SADC: data?.bk_CuntyTrd_SADC,
      bk_letter_credit: data?.bk_letter_credit,
      bk_track_contPersn: data?.bk_track_contPersn,
      bk_podDoc_contPersn: data?.bk_podDoc_contPersn,
      bk_exprt_modTransport: data?.bk_exprt_modTransport,
      bk_comTerm_sales: data?.bk_comTerm_sales,
      bk_Instru_origin: data?.bk_Instru_origin,
      bk_Instru_des: data?.bk_Instru_des,
      bk_Insur_cover: data?.bk_Insur_cover,
      bk_estim_supp: data?.bk_estim_supp,
      bk_opening_times: data?.bk_opening_times,
      bk_estim_ref: data?.bk_estim_ref,
      bk_org_exptCharge: data?.bk_org_exptCharge,
      bk_charges_destination: data?.bk_charges_destination,
      bk_intenFreig_charge: data?.bk_intenFreig_charge,
      bk_duties_taxes: data?.bk_duties_taxes,
      bk_hazard_cargo: data?.bk_hazard_cargo,
      bk_consg_ContPersn: data?.bk_consg_ContPersn,
      bk_cargo_packed: data?.bk_cargo_packed,
      bk_battery_MSDS: data?.bk_battery_MSDS,
      bk_cnsolid_mulShipp: data?.bk_cnsolid_mulShipp,
      bk_preship_insp: data?.bk_preship_insp,
      bk_export_Import: data?.bk_export_Import,
      bk_coll_dddress: data?.bk_coll_dddress,
      bk_opening_timesbk_coll_dddress: data?.bk_opening_timesbk_coll_dddress,
      bk_conName_tel: data?.bk_conName_tel,
      bk_loading_facilities: data?.bk_loading_facilities,
      bk_desc_goods: data?.bk_desc_goods,
      bk_handling_req: data?.bk_handling_req,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}AddOrUpdateBookingInstruction`,
        postdatapi
      );
      if (
        response.status === 200 ||
        response.data.status === 200 ||
        response.data.success
      ) {
        toast.success(response.data.message || "Data Updated");
        navigate("/Admin/bookinginstruction", { state: { data: getdat } });
      } else {
        toast.error(response.data.message || "Failed to update instruction");
      }
    } catch (error) {
      console.error("Error submitting booking instruction:", error);
      toast.error("Network or server error updating booking instruction");
    }
  };
  const backbutton = () => {
    // navigate("/Admin/WarehouseOrder");
    window.history.back();
  }

  return (
    <div>
      <div className="wpWrapper">
        <div className="container-fluid">
          <section className="bookingInsForm">

            <div className="row">
              <div className="col-md-12">
                <ArrowBack style={{ cursor: "pointer" }} onClick={backbutton} />

              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <form action="">
                  <div className="borderShipRight">
                    <div className="row">
                      <div className="col-lg-12">
                        <h4>Shipper</h4>
                        <span className="line"></span>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-lg-6 ">
                        <label className="ware_label" htmlFor="">
                          Shipper
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          disabled
                          value={
                            data.shipment_ref?.toLowerCase() === "consignee"
                              ? data.shipper_name
                              : data.shipper_name
                          }
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Address
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          disabled
                          value={
                            data.shipment_ref?.toLowerCase() === "consignee"
                              ? data.supplier_address
                              : (data?.address_1 || "") + " " + (data.address_2 || "") + " " + (data.province || "") + " " + (data.delivery_to_name || "")
                          }
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Contact
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          disabled
                          value={data.shipment_ref?.toLowerCase() === "consignee"
                            ? data.cellphone
                            : data.cellphone}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Tel. No / Email
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          disabled
                          placeholder="search"
                          value={data.bk_ship_tel_email}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          PO Number to Asia Direct - Africa
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          name="bk_ship_poNo"
                          onChange={handlechnage}
                          value={data?.bk_ship_poNo}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Export Customs Code:
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          disabled
                          value={data?.code}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Registered Name of Imp / Exporters Code
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          name="bk_ship_regNum"
                           onChange={handlechnage}
                          value={data.bk_ship_regNum}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Shipper's Ref No:
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          name="bk_ship_refNo"
                          onChange={handlechnage}
                          value={data.bk_ship_refNo}
                        />
                      </div>
                    </div>
                  </div>
                  <label className="bgLabel mt-3" htmlFor="">
                    COMMERICIAL DOCUMENT INFORMATION
                  </label>
                  <div className="borderShipRight">
                    <div className="row">
                      <div className="col-lg-6">
                        <label className="ware_label">
                          Mark with an X the Documents You Are Providing
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="docProviderYes"
                              name="bk_xdoc_provider"
                              value="Yes"
                              checked={data.bk_xdoc_provider === "Yes"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="docProviderYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="docProviderNo"
                              name="bk_xdoc_provider"
                              value="No"
                              checked={data.bk_xdoc_provider === "No"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="docProviderNo"> No</label>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <label className="ware_label">
                          Commercial Invoice
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="checkYes"
                              name="bk_comm_Invoice"
                              value="Yes"
                              checked={data.bk_comm_Invoice === "Yes"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="checkYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="checkNo"
                              name="bk_comm_Invoice"
                              value="No"
                              checked={data.bk_comm_Invoice === "No"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="checkNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 ">
                        <label className="ware_label" htmlFor="">
                          Total Count of Commercial Invoices on This Shipment
                        </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          name="bk_count_CommInv"
                          onChange={handlechnage}
                          value={data.bk_count_CommInv}
                        />
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Packing List
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="packingList"
                              name="bk_packing_list"
                              onChange={handlechnage}
                              checked={data.bk_packing_list === "Yes"}
                              value="Yes"
                            />
                            <label htmlFor="packingListYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="packingList"
                              name="bk_packing_list"
                              onChange={handlechnage}
                              checked={data.bk_packing_list === "No"}
                              value="No"
                            />
                            <label htmlFor="packingListNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          CUSTOMS DOCUMENTS / RULINGS
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="originalTransport"
                              name="bk_custm_doc"
                              defaultValue="Yes"
                              checked={data.bk_custm_doc === "Yes"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="originalTransportYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="originalTransport"
                              name="bk_custm_doc"
                              onChange={handlechnage}
                              checked={data.bk_custm_doc === "No"}
                              defaultValue="No"
                            />
                            <label htmlFor="originalTransportNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Original Transport Documents
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="originalTransport"
                              name="bk_trasprt_doc"
                              checked={data.bk_trasprt_doc === "Yes"}
                              onChange={handlechnage}
                              defaultValue="Yes"
                            />
                            <label htmlFor="originalTransportYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="originalTransport"
                              name="bk_trasprt_doc"
                              onChange={handlechnage}
                              checked={data.bk_trasprt_doc === "No"}
                              defaultValue="No"
                            />
                            <label htmlFor="originalTransportNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          MSDS (Material Safety Data Sheet for DG Cargo) /
                          Product Literature
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="msds"
                              onChange={handlechnage}
                              name="bk_MSDS"
                              checked={data.bk_MSDS === "Yes"}
                              defaultValue="Yes"
                            />
                            <label htmlFor="msdsYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              onChange={handlechnage}
                              id="msds"
                              name="bk_MSDS"
                              checked={data.bk_MSDS === "No"}
                              defaultValue="No"
                            />
                            <label htmlFor="msdsNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Country Trade Agreement / Certificate / EUR1 / SADC
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="tradeAgreement"
                              name="bk_CuntyTrd_SADC"
                              defaultValue="Yes"
                              onChange={handlechnage}
                              checked={data.bk_CuntyTrd_SADC === "Yes"}
                            />
                            <label htmlFor="tradeAgreementYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="tradeAgreement"
                              onChange={handlechnage}
                              name="bk_CuntyTrd_SADC"
                              checked={data.bk_CuntyTrd_SADC === "No"}
                              defaultValue="No"
                            />
                            <label htmlFor="tradeAgreementNo"> No</label>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <label className="ware_label" htmlFor="">
                          Letter of Credit
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="letterAuth"
                              name="bk_letter_credit"
                              onChange={handlechnage}
                              checked={data.bk_letter_credit === "Yes"}
                              defaultValue="Yes"
                            />
                            <label htmlFor="letterAuthYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="letterAuth"
                              name="bk_letter_credit"
                              defaultValue="No"
                              checked={data.bk_letter_credit === "No"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="letterAuthNo"> No</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <label className="bgLabel mt-3" htmlFor="">
                    INSURANCE REQUIREMENTS
                  </label>
                  <div className="borderShipRight">
                    <div className="row">
                      <div className="col-lg-12">
                        <label htmlFor="" className="ware_label">
                          Is Asia Direct - Africa Required To Provide
                          Insurance Cover. Please note that should you not
                          require Insurance goods are carried at Owners Risk
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="insuranceCover"
                              name="bk_Insur_cover"
                              onChange={handlechnage}
                              checked={data.bk_Insur_cover === "Yes"}
                              defaultValue="Yes"
                            />
                            <label htmlFor="insuranceCoverYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              onChange={handlechnage}
                              id="insuranceCover"
                              checked={data.bk_Insur_cover === "No"}
                              name="bk_Insur_cover"
                              defaultValue="No"
                            />
                            <label htmlFor="insuranceCoverNo"> No</label>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <label htmlFor="" className="ware_label">
                          Asia Direct - Africa Charges Estimate Supplied
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="chargesEstimate"
                              name="bk_estim_supp"
                              onChange={handlechnage}
                              checked={data.bk_estim_supp === "Yes"}
                              defaultValue="Yes"
                            />
                            <label htmlFor="chargesEstimateYes"> Yes</label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="chargesEstimate"
                              name="bk_estim_supp"
                              checked={data.bk_estim_supp === "No"}
                              defaultValue="No"
                              onChange={handlechnage}
                            />
                            <label htmlFor="chargesEstimateNo"> No</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label className="ware_label">Estimate Ref </label>
                        <input
                          className="mb-2 border ps-2 py-2 rounded w-100"
                          type="text"
                          name="bk_estim_ref"
                          value={data.bk_estim_ref}
                          onChange={handlechnage}
                        />
                      </div>
                    </div>
                  </div>
                  <label className="bgLabel mt-3" htmlFor="">
                    Asia Direct - Africa BILLING REQUIREMENTS
                  </label>
                  <div className="borderShipRight">
                    <div className="row">
                      <div className="col-lg-6">
                        <label htmlFor="" className="ware_label">
                          Origin Export Charges
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="originExport"
                              name="bk_org_exptCharge"
                              onChange={handlechnage}
                              checked={data.bk_org_exptCharge === "Shipper"}
                              defaultValue="Shipper"
                            />
                            <label htmlFor="originExportShipper">
                              Shipper
                            </label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="originExport"
                              name="bk_org_exptCharge"
                              onChange={handlechnage}
                              checked={data.bk_org_exptCharge === "Consignee"}
                              defaultValue="Consignee"
                            />
                            <label htmlFor="originExportConsignee">
                              {" "}
                              Consignee
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label htmlFor="" className="ware_label">
                          International Freight Charges
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="freightCharges"
                              name="bk_intenFreig_charge"
                              onChange={handlechnage}
                              checked={
                                data.bk_intenFreig_charge === "Shipper"
                              }
                              defaultValue="Shipper"
                            />
                            <label htmlFor="freightChargesShipper">
                              {" "}
                              Shipper
                            </label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="freightCharges"
                              name="bk_intenFreig_charge"
                              onChange={handlechnage}
                              defaultValue="Consignee"
                              checked={
                                data.bk_intenFreig_charge === "Consignee"
                              }
                            />
                            <label htmlFor="freightChargesConsignee">
                              {" "}
                              Consignee
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <label htmlFor="" className="ware_label">
                          Charges at Destination
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="destinationCharges"
                              onChange={handlechnage}
                              name="bk_charges_destination"
                              defaultValue="Shipper"
                              checked={
                                data.bk_charges_destination === "Shipper"
                              }
                            />
                            <label htmlFor="destinationChargesShipper">
                              {" "}
                              Shipper
                            </label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="destinationCharges"
                              name="bk_charges_destination"
                              onChange={handlechnage}
                              checked={
                                data.bk_charges_destination === "Consignee"
                              }
                              defaultValue="Consignee"
                            />
                            <label htmlFor="destinationChargesConsignee">
                              {" "}
                              Consignee
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <label htmlFor="" className="ware_label">
                          Duties & Taxes
                        </label>
                        <div className="d-flex checkInsForm">
                          <div>
                            <input
                              type="radio"
                              id="dutiesTaxes"
                              name="bk_duties_taxes"
                              defaultValue="Shipper"
                              checked={data.bk_duties_taxes === "Shipper"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="dutiesTaxesShipper">
                              {" "}
                              Shipper
                            </label>
                          </div>
                          <div className="ms-3">
                            <input
                              type="radio"
                              id="dutiesTaxes"
                              name="bk_duties_taxes"
                              defaultValue="Consignee"
                              checked={data.bk_duties_taxes === "Consignee"}
                              onChange={handlechnage}
                            />
                            <label htmlFor="dutiesTaxesConsignee">
                              {" "}
                              Consignee
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              {/* right part */}
              <div className="col-lg-6">
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-12">
                      <h4>Consignee</h4>
                      <span className="line"></span>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-lg-6 ">
                      <label className="ware_label" htmlFor="">
                        Consignee
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        disabled
                        value={
                          data.shipment_ref?.toLowerCase() === "consignee"
                            ? data.client_name
                            : data.shipper_name
                        }

                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Address{" "}
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        disabled
                        value={
                          data.shipment_ref?.toLowerCase() === "consignee"
                            ? (data?.address_1 || "") + " " + (data.address_2 || "") + " " + (data.province || "")
                            : data.supplier_address
                        }
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Notify Party
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="test"
                        name="bk_consg_notfParty"
                        onChange={handlechnage}
                        value={data?.bk_consg_notfParty}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Contact Person
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_consg_ContPersn"
                        onChange={handlechnage}
                        value={data?.bk_consg_ContPersn}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Tel
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        disabled
                        value={
                          data?.shipment_ref?.toLowerCase() === "shipper"
                            ? data?.cellphone
                            : data?.telephone
                        }
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Port Of Discharge
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        disabled
                        value={data?.post_of_discharge}
                      />
                    </div>
                  </div>
                </div>
                <label className="bgLabel mt-3" htmlFor="">
                  TRANSPORT DOCUMENT INSTRUCTIONS
                </label>
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Contact Person to Receive Tracking Reports
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        onChange={handlechnage}
                        name="bk_track_contPersn"
                        value={data.bk_track_contPersn}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Contact Person to Receive POD Documents
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_podDoc_contPersn"
                        onChange={handlechnage}
                        value={data.bk_podDoc_contPersn}
                      />
                    </div>
                  </div>
                </div>
                <label className="bgLabel mt-3" htmlFor="">
                  MODE OF TRANSPORT
                </label>
                <div className="borderShipRight">
                  <div className="col-lg-12">
                    <label className="ware_label" htmlFor="">
                      Export Mode of Transport
                    </label>
                    <div className="d-flex flex-wrap checkInsForm">
                      <div className="me-4">
                        <input
                          type="radio"
                          onChange={handlechnage}
                          id="seaFcl"
                          name="bk_exprt_modTransport"
                          checked={
                            data.bk_exprt_modTransport === "RoadConsole"
                          }
                          defaultValue="RoadConsole"
                        />
                        <label htmlFor="roadConsol"> Road Consol</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          name="bk_exprt_modTransport"
                          onChange={handlechnage}
                          checked={
                            data.bk_exprt_modTransport === "RoadDedicated"
                          }
                          defaultValue="RoadDedicated"
                        />
                        <label htmlFor="roadDedicated"> Road Dedicated</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          checked={data.bk_exprt_modTransport === "SeaFCL"}
                          name="bk_exprt_modTransport"
                          onChange={handlechnage}
                          defaultValue="SeaFCL"
                        />
                        <label htmlFor="seaFcl"> Sea FCL</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          checked={data.bk_exprt_modTransport === "SeaLCL"}
                          name="bk_exprt_modTransport"
                          defaultValue="SeaLCL"
                          onChange={handlechnage}
                        />
                        <label htmlFor="seaLcl"> Sea LCL</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          name="bk_exprt_modTransport"
                          defaultValue="SeaB/Bulk"
                          checked={data.bk_exprt_modTransport === "SeaB/Bulk"}
                          onChange={handlechnage}
                        />
                        <label htmlFor="seaBulk"> Sea B/Bulk</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          name="bk_exprt_modTransport"
                          onChange={handlechnage}
                          checked={data.bk_exprt_modTransport === "AirConsol"}
                          defaultValue="AirConsol"
                        />
                        <label htmlFor="airConsol"> Air Consol</label>
                      </div>
                      <div className="me-4">
                        <input
                          type="radio"
                          id="seaFcl"
                          name="bk_exprt_modTransport"
                          defaultValue="AirExpress"
                          onChange={handlechnage}
                          checked={
                            data.bk_exprt_modTransport === "AirExpress"
                          }
                        />
                        <label htmlFor="airExpress"> Air Express</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-12">
                      <label className="ware_label" htmlFor="">
                        Commercial Terms of Sale (Incoterms 2020)
                      </label>
                      <div className="d-flex flex-wrap checkInsForm">
                        {[
                          "EXW",
                          "FCA",
                          "FOB",
                          "FAS",
                          "CFR",
                          "CIF",
                          "CIP",
                          "CPT",
                          "DPU",
                          "DAP",
                          "DDP (incl VAT)",
                          "DDP (excl VAT)",
                        ].map((term, index) => {
                          const id = `incoterm-${term
                            .replace(/\s|\(|\)/g, "")
                            .replace("/", "-")}`;
                          return (
                            <div className="me-4 mb-2" key={index}>
                              <input
                                type="radio"
                                id={id}
                                checked={data.bk_comTerm_sales === term}
                                onChange={handlechnage}
                                name="bk_comTerm_sales"
                                value={term}
                              />
                              <label htmlFor={id}> {term}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Instructions at Origin
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_Instru_origin"
                        onChange={handlechnage}
                        value={data.bk_Instru_origin}
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="ware_label" htmlFor="">
                        Instructions at Destination
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_Instru_des"
                        value={data.bk_Instru_des}
                        onChange={handlechnage}
                      />
                    </div>
                  </div>
                </div>
                <label className="bgLabel mt-3" htmlFor="">
                  SHIPMENT DETAILS
                </label>
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Hazardous Cargo
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="hazardousCargo"
                            name="bk_hazard_cargo"
                            onChange={handlechnage}
                            checked={data.bk_hazard_cargo === "Yes"}
                            defaultValue="Yes"
                          />
                          <label htmlFor="hazardousCargoYes"> Yes</label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="hazardousCargo"
                            name="bk_hazard_cargo"
                            defaultValue="No"
                            onChange={handlechnage}
                            checked={data.bk_hazard_cargo === "No"}
                          />
                          <label htmlFor="hazardousCargoNo"> No</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Is the cargo packed to international hazardous
                        regulations?
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="packedToHazardous"
                            name="bk_cargo_packed"
                            onChange={handlechnage}
                            checked={data.bk_cargo_packed === "Yes"}
                            defaultValue="Yes"
                          />
                          <label htmlFor="packedToHazardousYes"> Yes</label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="packedToHazardous"
                            name="bk_cargo_packed"
                            defaultValue="No"
                            checked={data.bk_cargo_packed === "No"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="packedToHazardousNo"> No</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Batteries MSDS must be provided
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="batteriesMsds"
                            name="bk_battery_MSDS"
                            defaultValue="Yes"
                            onChange={handlechnage}
                            checked={data.bk_battery_MSDS === "Yes"}
                          />
                          <label htmlFor="batteriesMsdsYes"> Yes</label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="batteriesMsds"
                            name="bk_battery_MSDS"
                            defaultValue="No"
                            checked={data.bk_battery_MSDS === "No"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="batteriesMsdsNo"> No</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Are goods to be consolidated from multiple shippers
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="goodsConsolidated"
                            name="bk_cnsolid_mulShipp"
                            defaultValue="Yes"
                            checked={data.bk_cnsolid_mulShipp === "Yes"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="goodsConsolidatedYes"> Yes</label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="goodsConsolidated"
                            name="bk_cnsolid_mulShipp"
                            defaultValue="No"
                            checked={data.bk_cnsolid_mulShipp === "No"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="goodsConsolidatedNo"> No</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Is Asia Direct - Africa to arrange pre-shipment
                        inspection?
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="preShipmentInspection"
                            name="bk_preship_insp"
                            defaultValue="Yes"
                            checked={data.bk_preship_insp === "Yes"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="preShipmentInspectionYes">
                            {" "}
                            Yes
                          </label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="preShipmentInspection"
                            name="bk_preship_insp"
                            checked={data.bk_preship_insp === "No"}
                            defaultValue="No"
                            onChange={handlechnage}
                          />
                          <label htmlFor="preShipmentInspectionNo"> No</label>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="" className="ware_label">
                        Type of Export/Import Customs Entry Required
                      </label>
                      <div className="d-flex checkInsForm">
                        <div>
                          <input
                            type="radio"
                            id="customsEntry"
                            name="bk_export_Import"
                            defaultValue="Yes"
                            checked={data.bk_export_Import === "Yes"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="customsEntryYes"> Yes</label>
                        </div>
                        <div className="ms-3">
                          <input
                            type="radio"
                            id="customsEntry"
                            name="bk_export_Import"
                            defaultValue="No"
                            checked={data.bk_export_Import === "No"}
                            onChange={handlechnage}
                          />
                          <label htmlFor="customsEntryNo"> No</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <label className="bgLabel mt-3" htmlFor="">
                  COLLECTION REQUIREMENTS (ONLY COMPLETE IF CARGO IS NOT BEING
                  DELIVERED TO ASIA DIRECT - AFRICA WAREHOUSE)
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-12 ">
                      <label className="ware_label" htmlFor="">
                        Collection Address
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_coll_dddress"
                        onChange={handlechnage}
                        value={data.bk_coll_dddress}
                      />
                    </div>
                    <div className="col-lg-12 ">
                      <label className="ware_label" htmlFor="">
                        Contact Name and Tel
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        name="bk_conName_tel"
                        onChange={handlechnage}
                        value={data.bk_conName_tel}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="borderShipRight">
                  <div className="row">
                    <div className="col-lg-12 ">
                      <label className="ware_label" htmlFor="">
                        Opening Times
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        value={data.bk_opening_times}
                        onChange={handlechnage}
                        name="bk_opening_times"
                      />
                    </div>
                    <div className="col-lg-12">
                      <label className="ware_label" htmlFor="">
                        Confirm Loading Facilities at Collection Point
                      </label>
                      <input
                        className="mb-2 border ps-2 py-2 rounded w-100"
                        type="text"
                        value={data.bk_loading_facilities}
                        onChange={handlechnage}
                        name="bk_loading_facilities"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <label className="bgLabel mt-3" htmlFor="">
                  CARGO DETAILS AND CARGO HANDLING REQUIRMENTS
                </label>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="borderShipRight h-100">
                  <div className="row">
                    <label className="ware_label">Description of Goods</label>
                    <textarea
                      className="mb-2 border ps-2 py-2 rounded w-100"
                      name="bk_desc_goods"
                      onChange={handlechnage}
                      value={data.bk_desc_goods}
                      id=""
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="borderShipRight h-100">
                  <div className="row">
                    <label className="ware_label">
                      Handling Requirements{" "}
                    </label>
                    <input
                      className="mb-2 border ps-2 py-2 rounded w-100"
                      name="bk_handling_req"
                      onChange={handlechnage}
                      value={data.bk_handling_req}
                      id=""
                    />
                  </div>
                </div>
                <div className="btnAddFre"></div>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-md-12 text-center  ">
                <button
                  className="blueBtn"
                  onClick={handleclick}
                >
                  Submit
                </button>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
