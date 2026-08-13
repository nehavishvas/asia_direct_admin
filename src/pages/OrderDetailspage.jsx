import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
export default function MAnageFreightDetails() {
  const infolocation = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [dat, setDat] = useState({});
  const [data0, setData0] = useState({});
  const [data111, setData111] = useState({});
  const [data2, setData2] = useState({});
  const [data3, setData3] = useState({});
  const [data4, setData4] = useState({});
  const [data5, setData5] = useState({});
  const [data6, setData6] = useState({});
  const [data7, setData7] = useState({});
  const [data8, setData8] = useState({});
  const [data9, setData9] = useState({});
  const [data10, setData10] = useState({});
  const [data11, setData11] = useState({});
  const info = infolocation?.state?.data;
  console.log(infolocation?.state);
  console.log(infolocation.state.data);

  useEffect(() => {
    getalldata();
  }, []);

  const getalldata = async () => {
    try {
      console.log(info?.order_id);
      const datapost = { orderId: info?.order_id };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}OrderDetailsById`,
        datapost,
      );
      setData(response.data.data[0]);
      console.log(response.data.data[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const [document, setDocument] = useState([]);
  const [documents, setDocuments] = useState({});
  const [document1, setDocument1] = useState([]);
  const [packing, setPacking] = useState([]);
  const [licenses, setLicenses] = useState([]);
  console.log(info);
  useEffect(() => {
    getdata();
  }, []);

  const getdata = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-shipestimate`, {
        freight_id: info.freight_id,
      })
      .then((response) => {
        setDat(response.data.data);
        console.log(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const getordertracking = () => {
    const data1 = {
      order_id: `OR000${info.order_id}`,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-order-status`, data1)
      .then((response) => {
        console.log(response.data);
        setData0(response?.data?.data[0]);
        setData111(response?.data?.data[1]);
        setData2(response?.data?.data[2]);
        setData3(response?.data?.data[3]);
        setData4(response?.data?.data[4]);
        setData5(response?.data?.data[5]);
        setData6(response?.data?.data[6]);
        setData7(response?.data?.data[7]);
        setData8(response?.data?.data[8]);
        setData9(response?.data?.data[9]);
        setData10(response?.data?.data[10]);
        setData11(response?.data?.data[11]);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getordertracking();
  }, []);
  const handleclicknav = () => {
    navigate("/Admin/order");
  };
  const deleteapi = (id) => {
    console.log(id);
    const data11 = {
      doc_id: id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}DeleteDocument`, data11)
      .then((response) => {
        GetFreightImages();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const GetFreightImages = () => {
    const data = { uploaded_by: "1" };
    if (info?.freight_id) {
      data.freight_id = info.freight_id;
    }
    if (info?.order_id) {
      data.order_id = info.order_id;
    }

    axios
      .post(`${process.env.REACT_APP_BASE_URL}GetFreightImages`, data)
      .then((response) => {
        console.log(response.data.data);

        // Save all groups (Customs, Packing, Invoices, Licenses, etc.)
        setDocuments(response.data.data);
      })
      .catch((error) => {
        console.log(error.response?.data);
      });
  };
  // const GetFreightImages = () => {
  //   const data = { freight_id: info.freight_id };
  //   axios
  //     .post(`${process.env.REACT_APP_BASE_URL}GetFreightImages`, data)
  //     .then((response) => {
  //       setDocument(response?.data?.data["Supplier Invoice"]);
  //       setLicenses(response?.data?.data["Licenses"]);
  //       setDocument1(response?.data?.data["Other Documents"]);
  //       setPacking(response?.data?.data["Packing List"]);
  //       console.log(response?.data?.data);
  //     })
  //     .catch((error) => {
  //       console.log(error.response.data);
  //     });
  // };
  useEffect(() => {
    GetFreightImages();
  }, []);

  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="formDetails">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex">
                <div>
                  <ArrowBackIcon
                    onClick={handleclicknav}
                    className="text-dark"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div>
                  <h4 className="det_hd ms-3"> Order Freight Detail's</h4>
                </div>
              </div>
            </div>
          </div>
          <section className="my-4 viewDetails">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="card desti_card">
                  <div className="card-body">
                    <div>
                      <h6 className="orgin_hd">Shipper Details</h6>
                    </div>

                    <div className="main_det">

                      {/* Shipper Details */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-building build_icon"></i>
                          Shipper
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>
                            <p className="or_para">
                              {info.shipment_ref === "consignee"
                                ? info.shipper_name
                                : info.client_name}
                            </p>

                            <p className="client_para">
                              Contact Person :
                              {info.shipment_ref === "consignee"
                                ? ""
                                : info.client_email}
                            </p>

                            <p className="client_para">
                              Cell :
                              {info.shipment_ref === "consignee"
                                ? info.telephone
                                : info.cellphone}
                            </p>

                            <p className="client_para">
                              Telephone :
                              {info.shipment_ref === "consignee"
                                ? info.telephone
                                : info.cellphone}
                            </p>

                            <p className="client_para">
                              Email :
                              {info.shipment_ref === "consignee"
                                ? ""
                                : info.client_email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pickup Address */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rr-marker build_icon"></i>
                          Pickup Address
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>
                            <p className="client_para">
                              Address :
                              {info.shipment_ref === "consignee" ? (
                                info.supplier_address
                              ) : (
                                <>
                                  {info?.address_1} {info?.address_2}
                                  <br />
                                  {info?.province}
                                  <br />
                                  {info?.delivery_to_name}
                                </>
                              )}
                            </p>

                            <p className="client_para">
                              City : {info?.city}
                            </p>

                            <p className="client_para">
                              Country : {info?.collection_from_country}
                            </p>

                            <p className="client_para">
                              Postal Code : {info?.code}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Export Details */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-building build_icon"></i>
                          Export Details
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>
                            <p className="or_para">
                              {info?.shipper_name}
                            </p>

                            <p className="client_para">
                              Export Code : {info?.code}
                            </p>

                            <p className="client_para">
                              Vat/Tax No : {info?.tax_ref}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="card desti_card">
                  <div className="card-body">

                    <div>
                      <h6 className="orgin_hd">Consignee Details</h6>
                    </div>

                    <div className="main_det">

                      {/* Consignee Details */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-building build_icon"></i>
                          Consignee
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="or_para">
                              {info.shipment_ref === "consignee"
                                ? info.client_name
                                : info.shipper_name}
                            </p>

                            <p className="client_para">
                              Contact Person :
                              {info.shipment_ref === "consignee"
                                ? info.client_email
                                : ""}
                            </p>

                            <p className="client_para">
                              Cell :
                              {info.shipment_ref === "consignee"
                                ? info.cellphone
                                : info.telephone}
                            </p>

                            <p className="client_para">
                              Telephone :
                              {info?.shipment_ref === "shipper"
                                ? ""
                                : info?.cellphone}
                            </p>

                            <p className="client_para">
                              Email :
                              {info.shipment_ref === "consignee"
                                ? info.client_email
                                : ""}
                            </p>

                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rr-marker build_icon"></i>
                          Delivery Address
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="client_para">
                              Address :
                              {info.shipment_ref === "consignee" ? (
                                <>
                                  {info?.address_1} {info?.address_2}
                                  <br />
                                  {info?.province}
                                </>
                              ) : (
                                info.supplier_address
                              )}
                            </p>

                            <p className="client_para">
                              City :
                            </p>

                            <p className="client_para">
                              Country : {info?.delivery_to_country}
                            </p>

                            <p className="client_para">
                              Postal Code :
                            </p>

                          </div>
                        </div>
                      </div>

                      {/* Export Details */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-building build_icon"></i>
                          Export Details
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="or_para">
                              Asia Direct
                            </p>

                            <p className="client_para">
                              Export Code : {info?.code}
                            </p>

                            <p className="client_para">
                              Vat/Tax No : {info?.tax_ref}
                            </p>

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6">
                <div className="card desti_card cargoBold">
                  <div className="card-body">

                    <div>
                      <h6 className="orgin_hd">Cargo Details</h6>
                    </div>

                    <div className="main_det">

                      {/* Product Details */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-box build_icon"></i>
                          Product Details
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="or_para">
                              {info?.product_desc}
                            </p>

                            <p className="client_para">
                              Commodity : {data?.commodity_name}
                            </p>

                            <p className="client_para">
                              Industry : {info?.nature_of_hazard}
                            </p>

                          </div>
                        </div>
                      </div>

                      {/* Cargo Info */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rs-package build_icon"></i>
                          Cargo Info
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="client_para">
                              Hazardous : {info?.hazardous}
                            </p>

                            <p className="client_para">
                              Packaging : {info?.package_type}
                            </p>

                            <p className="client_para">
                              No of Packages : {info?.no_of_packages}
                            </p>

                          </div>
                        </div>
                      </div>

                      {/* Weight & Dimensions */}
                      <div className="view_box">
                        <h6 className="ship_hd">
                          <i className="fi fi-rr-scale build_icon"></i>
                          Weight & Dimensions
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="client_para">
                              Dimensions (CBM) : {info?.dimension}
                            </p>

                            <p className="client_para">
                              Weight (KGS) : {info?.weight}
                            </p>

                            <p className="client_para">
                              Vol weight(kgs) : {info?.volumetric_weight}
                            </p>

                            <p className="client_para">
                              Chargeable Weight :
                            </p>

                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

            </div>
            <div className="details_box">
              <div className="row">
                <div className="col-lg-4 col-md-6 col-sm-6">
                  <div className="card desti_card">
                    <div className="card-body">

                      <div>
                        <h6 className="orgin_hd">Booking Information</h6>
                      </div>

                      <div className="main_det">

                        {/* POL Information */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rs-flag build_icon"></i>
                            POL Information
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Freight Number : {data?.freight_number}
                              </p>

                              <p className="client_para">
                                Origin Handler : {data?.shipments_origin_agent}
                              </p>

                              <p className="client_para">
                                Place of Loading : {info?.shipper_address}
                              </p>

                              <p className="client_para">
                                Port of Loading : {info?.port_of_loading}
                              </p>

                              <p className="client_para">
                                Instructions : {info?.shipment_origin}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* Transit Information */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rs-route build_icon"></i>
                            Transit Information
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Freight Option : {info?.freight}
                              </p>

                              <p className="client_para">
                                Efficiency : {info?.type}
                              </p>

                              <p className="client_para">
                                Incoterms : {info?.incoterm}
                              </p>

                              <p className="client_para">
                                Insurance : {info?.insurance}
                              </p>

                              <p className="client_para">
                                Type : {info?.fcl_lcl}
                              </p>

                              <p className="client_para">
                                Warehouse : {info?.assign_warehouse}
                              </p>

                              <p className="client_para">
                                ETD : {new Date(info?.delivery_ETA).toLocaleDateString(
                                  "en-GB",
                                )}
                              </p>

                              <p className="client_para">
                                Carrier : {data?.carrier}
                              </p>

                              <p className="client_para">
                                Vessel Name : {data?.vessel}
                              </p>

                              <p className="client_para">
                                Master Bill : {data?.shipments_waybill}
                              </p>

                              <p className="client_para">
                                House Bill : {data?.house_bill_landing}
                              </p>

                              <p className="client_para">
                                Container No : {data?.container_no}
                              </p>

                              <p className="client_para">
                                Release Type : {data?.shipments_release_type}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* POD Information */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rr-marker build_icon"></i>
                            POD Information
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Destination Handler : {data?.shipments_destination_agent}
                              </p>

                              <p className="client_para">
                                Place of Delivery : {info?.place_of_delivery}
                              </p>

                              <p className="client_para">
                                Port of Discharge : {info?.post_of_discharge}
                              </p>

                              <p className="client_para">
                                Instructions : {info?.shipment_des}
                              </p>

                              <p className="client_para">
                                Local Carrier : {data?.local_carrier}
                              </p>

                              <p className="client_para">
                                Driver Name : {data?.driver_name}
                              </p>

                              <p className="client_para">
                                Vehicle Registration : {data?.vehicle_registration}
                              </p>

                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 col-sm-6">
                  <div className="card desti_card">
                    <div className="card-body">

                      <div>
                        <h6 className="orgin_hd">Shipping Estimate</h6>
                      </div>

                      <div className="main_det">

                        {/* Freight */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rs-truck-side build_icon"></i>
                            Freight
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Type : {dat.freight}
                              </p>

                              <p className="client_para">
                                Cost : {dat.freight_amount}
                              </p>

                              <p className="client_para">
                                Billing : {dat.freight_final_amount}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* Origin Charges */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rs-map build_icon"></i>
                            Origin Charges
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Pickup : {dat.origin_pick_up} / {dat.origin_pick_final_amt}
                              </p>

                              <p className="client_para">
                                Customs : {dat.origin_customs} / {dat.origin_cust_final_amt}
                              </p>

                              <p className="client_para">
                                Document : {dat.origin_document} / {dat.origin_doc_final_amt}
                              </p>

                              <p className="client_para">
                                Warehouse : {dat.origin_warehouse} / {dat.origin_ware_final_amt}
                              </p>

                              <p className="client_para">
                                Port Fees : {dat.origin_port_fees} / {dat.org_port_fee_final_amt}
                              </p>

                              <p className="client_para">
                                Other : {dat.origin_other} / {dat.org_other_final_amt}
                              </p>

                            </div>
                          </div>
                        </div>

                        {/* Destination Charges */}
                        <div className="view_box">
                          <h6 className="ship_hd">
                            <i className="fi fi-rs-flag build_icon"></i>
                            Destination Charges
                          </h6>

                          <div className="d-flex align-items-start">
                            <div>

                              <p className="client_para">
                                Delivery : {dat.des_delivery} / {dat.des_delivery_final_amt}
                              </p>

                              <p className="client_para">
                                Customs : {dat.des_cust} / {dat.des_cust_final_amt}
                              </p>

                              <p className="client_para">
                                Documents : {dat.des_document} / {dat.des_doc_final_amt}
                              </p>

                              <p className="client_para">
                                Warehouse : {dat.des_warehouse} / {dat.des_ware_final_amt}
                              </p>

                              <p className="client_para">
                                Port Fees : {dat.des_port_fees} / {dat.des_portfees_final_amt}
                              </p>

                              <p className="client_para">
                                Unpack : {dat.des_unpack} / {dat.des_unpack_final_amt}
                              </p>

                              <p className="client_para">
                                Other : {dat.des_other} / {dat.des_other_final_amt}
                              </p>

                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

                {/* <div className="col-md-4 ps-4">
                <div className="card desti_card">
                  <div className="card-body">
                    <div className="">
                      <h6 className="orgin_hd">Tracking</h6>
                      <span className="line"></span>
                    </div>
                    <div className="scroll_timeline">
                      <div class="row">
                        <div class="col-md-12">
                          <div class="main-timeline">
                            <div class="timeline">
                              <div class="timeline-content">
                                {dat0.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                )}

                                <h3 class="title left_title">
                                  Collected from supplier
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data111.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}
                                <h3 class="title right_title">
                                  Received at Asia Direct warehouse
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data2.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}
                                <h3 class="title left_title">
                                  Dispatched to port
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data3.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}
                                <h3 class="title right_title">
                                  Goods at origin port
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data4.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-white"></i>
                                  </div>
                                )}
                                <h3 class="title left_title">
                                  Goods are in transit
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data5.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}
                                <h3 class="title right_title">
                                  Arrived at destination port
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data6.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}
                                <h3 class="title left_title">
                                  Customs clearing in progress
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data7.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}

                                <h3 class="title right_title">
                                  Customs released
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data8.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}

                                <h3 class="title left_title">
                                  Goods in transit to warehouse
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data9.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}

                                <h3 class="title right_title">
                                  Imported at Asia Direct warehouse
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data10.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}

                                <h3 class="title left_title">
                                  Out for delivery
                                </h3>
                              </div>
                            </div>
                            <div class="timeline">
                              <div class="timeline-content">
                                {data11.is_completed === "0" ? (
                                  <div class="timeline-icon">
                                    <i class="fa fa-globe"></i>
                                  </div>
                                ) : (
                                  <div class="timeline-icon aaa">
                                    <i class="fa fa-globe text-success"></i>
                                  </div>
                                )}

                                <h3 class="title right_title">Delivered</h3>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}{" "}
                {/* <div className="col-md-4  ">
                <div className="card desti_card">
                  <div className="card-body">
                    <div className="">
                      <h6 className="orgin_hd">Documents</h6>
                      <span className="line"></span>
                    </div>
                    <div className="mb-3 mt-2">
                      <div className="mb-3 supplyInv">
                        <div>
                          <label>Supplier Invoice : </label>
                        </div>
                        <div>
                          {document?.map((item, index) => {
                            return (
                              <>
                                <a
                                  href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view_docu ms-2"
                                >
                                  View Document
                                </a>
                                <DeleteIcon
                                  onClick={() => {
                                    deleteapi(item.id);
                                  }}
                                  className="text-danger"
                                  style={{ cursor: "pointer" }}
                                />
                              </>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-3 supplyInv">
                        <div>
                          <label>Other Document :</label>
                        </div>
                        <div>
                          {document1?.map((item, index) => {
                            return (
                              <>
                                <a
                                  href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view_docu ms-2"
                                >
                                  View Document
                                </a>
                                <DeleteIcon
                                  onClick={() => {
                                    deleteapi(item.id);
                                  }}
                                  className="text-danger"
                                  style={{ cursor: "pointer" }}
                                />
                              </>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-3 supplyInv">
                        <div>
                          <label>packing List :</label>
                        </div>
                        <div>
                          {packing?.map((item, index) => {
                            return (
                              <>
                                <a
                                  href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view_docu ms-2"
                                >
                                  View Document
                                </a>
                                <DeleteIcon
                                  onClick={() => {
                                    deleteapi(item.id);
                                  }}
                                  className="text-danger"
                                  style={{ cursor: "pointer" }}
                                />
                              </>
                            );
                          })}
                        </div>
                      </div>
                      <div className="mb-3 supplyInv">
                         
                          <div>
                            <label>Attach Quotation:</label>
                          </div>
                          <div>
                            {info?.attachment_Estimate === null ? (
                              " "
                            ) : (
                              <a
                                href={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view_docu ms-2"
                              >
                                View Document
                              </a>
                            )}
                         
                        </div>
                      </div>
                      <div className="mb-3 "></div>
                    </div>
                  </div>
                </div>
              </div> */}
                <div className="col-md-4">
                  <div className="card desti_card">
                    <div className="card-body mb-3">
                      {Object.keys(documents).map((groupName, groupIndex) => (
                        <div key={groupIndex} className="mb-2">
                          <label className="orgin_hd">{groupName} :</label>
                          {documents[groupName]?.map((item, index) => (
                            <div
                              key={item.id}
                              className="d-flex align-items-center gap-2 mt-3"
                            >
                              <a
                                href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view_docu mt-0"
                              >
                                View Document
                              </a>
                              <DeleteIcon
                                onClick={() => deleteapi(item.id)}
                                className="text-danger ms-2"
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Quotation (separate because it's not part of groups) */}
                      <div className="mb-2">
                        <label>Attach Quotation :</label>
                        {info.attachment_Estimate && (
                          <a
                            href={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view_docu ms-2"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
    </div>
  );
}
