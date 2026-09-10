import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
export default function Freightbyuserdetail() {
  const infolocation = useLocation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const info = infolocation?.state?.data[0];
  console.log(infolocation?.state?.data[0]);
  const handleclicknav = () => {
    navigate("/Admin/freight");
  };
  const GetFreightImages = () => {
    const data = { freight_id: info.freight_id, uploaded_by: "1" };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}GetFreightImages`, data)
      .then((response) => {
        console.log(response.data.data);
        setDocuments(response.data.data);
      })
      .catch((error) => {
        console.log(error.response?.data);
      });
  };
  useEffect(() => {
    GetFreightImages();
  }, []);
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
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="formDetails">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex align-items-center gap-3">
                <ArrowBackIcon
                  onClick={handleclicknav}
                  style={{ cursor: "pointer" }}
                />
                <h4 className="det_hd mb-0">User Freight Details</h4>
              </div>
            </div>
          </div>
          <div className="row mt-4 viewDetails">
            <div className="col-md-4">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Shipper Details</h6>

                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd">   <i class="fi fi-rs-building build_icon"></i> Shipper</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">
                            {" "}
                            {info.shipment_ref === "shipper"
                              ? info.client_name
                              : "Asia Direct"}
                          </p>
                          <p className="client_para">
                            {" "}
                            {info.shipment_ref === "shipper"
                              ? info.client_address_1
                              : "    Unit 4 Villa Valencia2 Anemoon Road Glen Marais 1619 South Africa"}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? info.client_cellphone
                              : "+27 10 448 0733"}
                          </p>
                          <p className="client_para">
                            {" "}
                            {info.shipment_ref === "shipper"
                              ? info.client_email
                              : "sa@asiadirect.africa "}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd">  <i className="fi fi-rr-marker build_icon"></i> Pickup Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">
                            {info.collection_from_country}
                          </p>
                          <p className="client_para">{info.port_of_loading}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rs-building build_icon"></i> Exporter</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">{info.shipper_name}</p>
                          <p className="client_para">Export Code:{info.code}</p>
                          <p className="client_para">
                            Vat Number:{info.tax_ref}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <div className="d-flex align-items-start">
                        <i class="fi fi-rr-marker build_icon"></i>
                        <div className="">
                          <p className="client_para">{info.address_1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Consignee Details</h6>

                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd">  <i class="fi fi-rs-building build_icon"></i> Consignee</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">
                            {info.shipment_ref === "shipper"
                              ? "Asia Direct"
                              : info.client_name}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? " Unit 4 Villa Valencia2 Anemoon Road Glen Marais 1619 South Africa"
                              : info.client_address_1}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? "+27 10 448 0733"
                              : info.client_cellphone}
                          </p>
                          <p className="client_para">
                            {" "}
                            {info.shipment_ref === "shipper"
                              ? "sa@asiadirect.africa "
                              : info.client_email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"><i className="fi fi-rr-marker build_icon"></i> Delivery Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">{info.delivery_to_country}</p>
                          <p className="client_para">
                            {info.post_of_discharge}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"><i className="fi fi-rs-building build_icon"></i> Importer</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">{info.importers_ref}</p>
                          <p className="client_para">
                            Export Code:{info?.code}
                          </p>
                          <p className="client_para">
                            Vat Number:{info.tax_ref}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <div className="d-flex align-items-start">
                        <i class="fi fi-rr-marker build_icon"></i>
                        <div className="">
                          <p className="client_para">
                            {info.place_of_delivery}
                          </p>
                          <p className="client_para">{info.address_1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Cargo Details</h6>
                  </div>

                  <div className="main_det">

                    <div className="view_box">
                      <p className="client_para">Product Description</p>
                      <p className="or_para">{info.product_desc}</p>
                    </div>

                    <div className="view_box">
                      <p className="client_para">Industry</p>
                      <p className="or_para">{info.nature_of_goods}</p>
                    </div>

                    <div className="view_box">
                      <p className="client_para">Commodity</p>
                      <p className="or_para">{info.commodity_name}</p>
                    </div>

                    <div className="view_box">
                      <p className="client_para">Packaging</p>
                      <p className="or_para">{info.package_type}</p>
                    </div>
                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">

                      <div>
                        <p className="client_para">No of Packages</p>
                        <p className="or_para">{info.no_of_packages}</p>
                      </div>

                      <div>
                        <p className="client_para">Dimensions (cbm)</p>
                        <p className="or_para">{info.dimension}</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">

                      <div>
                        <p className="client_para">Weight (kgs)</p>
                        <p className="or_para">{info.weight}</p>
                      </div>

                      <div>
                        <p className="client_para">Vol weight (kgs)</p>
                        <p className="or_para">{info.volumetric_weight}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="view_card viewDetails">
            <div className="row">
              <div className="col-md-6">
                <div className="card desti_card">
                  <div className="card-body">
                    <div>
                      <h6 className="orgin_hd">Booking Information</h6>
                    </div>

                    <div className="main_det">

                      {/* POL Information */}
                      <div className="ship_section_title">
                        <p className="ship_hd">POL Information</p>
                      </div>

                      <div className="d-flex gap-2 view_box flex-wrap">
                        <div className="flex-grow-1">
                          <p className="client_para">Port of Discharge</p>
                          <p className="or_para">{info.post_of_discharge}</p>
                        </div>

                        <div className="flex-grow-1">
                          <p className="client_para">Port of Loading</p>
                          <p className="or_para">{info.port_of_loading}</p>
                        </div>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Instructions</p>
                        <p className="client_para1 mb-3"> {info.shipment_origin} </p>
                      </div>

                      {/* Transit Information */}
                      <div className="ship_section_title">
                        <p className="ship_hd">Transit Information</p>
                      </div>

                      <div className="d-flex gap-2 view_box justify-content-between flex-wrap">

                        <div>
                          <p className="client_para">Freight Option</p>
                          <p class="client_para1">{info.freight}</p>
                        </div>

                        <div>
                          <p className="client_para">Efficiency</p>
                          <p class="client_para1">{info.freight_type}</p>
                        </div>

                        <div>
                          <p className="client_para">Incoterms</p>
                          <p class="client_para1">{info.incoterm}</p>
                        </div>

                      </div>

                      <div className="d-flex justify-content-between gap-2 view_box flex-wrap">



                        <div>
                          <p className="client_para">Insurance</p>
                          <p className="or_para">{info.insurance}</p>
                        </div>

                        <div>
                          <p className="client_para">Warehouse</p>
                          <p className="or_para">{info.assign_warehouse}</p>
                        </div>
                        <div>
                          <p className="client_para">Type</p>
                          <p class="client_para1">{info.fcl_lcl}</p>
                        </div>
                      </div>

                      {/* POD Information */}
                      <div className="ship_section_title">
                        <p className="ship_hd">POD Information</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Place of Delivery</p>
                        <p className="or_para">{info.post_of_discharge}</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Port of Discharge</p>
                        <p className="or_para">{info.port_of_loading}</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Instructions</p>
                        <p className="or_para">{info.shipment_des}</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Comment</p>
                        <p className="or_para">{info.comment}</p>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
              <div className="col-md-6">
                <div className="card desti_card">
                  <div className="card-body mb-3">
                    {Object.keys(documents).map((groupName, groupIndex) => (
                      <div key={groupIndex} className="mb-2">
                        <label>{groupName} :</label>
                        {documents[groupName]?.map((item, index) => (
                          <div
                            key={item.id}
                            className="d-flex align-items-center"
                          >
                            <a
                              href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view_docu ms-2"
                            >
                              View Document
                            </a>
                            <FiTrash2
                              onClick={() => deleteapi(item.id)}
                              className="text-danger ms-2"
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
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
        </div>
      </div>
    </div>
  );
}
