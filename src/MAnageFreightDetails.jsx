import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ToastContainer } from "react-bootstrap";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export default function MAnageFreightDetails() {
  const infolocation = useLocation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const { id } = useParams();

  console.log(id); // yaha mil jayegi id
  const [data, setData] = useState({
    documentName: "",
    licenses: "",
    other_documents: "",
    packing_list: "",
    supplier_invoice: "",
  });
  const [formFiles, setFormFiles] = useState({
    supplier_invoice: [],
    other_documents: [],
    licenses: [],
    packing_list: [],
  });

  const info1 = infolocation?.state?.data[0];
  const [info, setInfo] = useState([]);
  console.log(infolocation?.state?.data[0]);
  const data1 = new Date(info1?.date).toLocaleDateString("en-GB");
  const handleclick = () => {
    navigate("/Admin/managefreight");
  };
  const GetFreightImages = () => {
    const data = { freight_id: id, uploaded_by: "1" };
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
  const getFreightDataById = async () => {
    const payload = {
      freight_id: id,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload
      );

      if (response?.data?.data?.length > 0) {
        setInfo(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching freight data by id:", error);
    }
  };

  useEffect(() => {
    getFreightDataById()
  }, []);

  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="formDetails">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  <div style={{ cursor: "pointer" }}>
                    <ArrowBackIcon onClick={handleclick} />
                  </div>
                  <div>
                    <h4 className="det_hd ms-3">Admin Freight Details</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4 viewDetails">
            <div className=" col-lg-4 col-md-6 col-sm-6">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Shipper Details</h6>
                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd">  <i class="fi fi-rs-building build_icon"></i> Exporter</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">
                            {info?.shipment_ref === "consignee"
                              ? info?.shipper_name
                              : info?.client_name}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? info?.supplier_address
                              : info?.address_1 + " " + info?.address_2 + " " + <br /> + info?.province + " " + <br /> + info?.delivery_to_name}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? info?.telephone
                              : info?.cellphone}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? ""
                              : info?.client_email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rr-marker build_icon"></i> Pickup Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">{info?.collection_from_name}</p>
                          <p className="client_para">{info?.port_of_loading}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rs-building build_icon"></i> Exporter</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">{info?.shipper_name}</p>
                          <p className="client_para">Export Code:{info?.code}</p>
                          <p className="client_para">Vat Number:{
                            info?.shipment_ref === "shipper" ? 4740280377 : ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <div className="d-flex align-items-start">
                        <i class="fi fi-rr-marker build_icon"></i>
                        <div className="">
                          <p className="client_para">{info.supplier_address}</p>

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
                  <div className="">
                    <h6 className="orgin_hd">Consignee Details</h6>
                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rs-building build_icon"></i> Importer</h6>
                      <div className="d-flex align-items-start">
                        <div className="">
                          <p className="or_para">
                            {info?.shipment_ref === "consignee"
                              ? info.client_name
                              : info.shipper_name}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? info?.address_1 + " " + info.address_2 + " " + info.province + " " + info.delivery_to_name
                              : info.supplier_address}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? info.cellphone
                              : info.telephone}
                          </p>
                          <p className="client_para">
                            {info?.shipment_ref === "consignee"
                              ? info.client_email
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rr-marker build_icon"></i> Delivery Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">{info.delivery_to_name}</p>
                          <p className="client_para">
                            {info.post_of_discharge}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i class="fi fi-rs-building build_icon"></i> Importer</h6>
                      <div className="d-flex align-items-start">
                        <div className="">
                          <p className="or_para">{info.importers_ref}</p>
                          <p className="client_para">Export Code:{info.code}</p>
                          <p className="client_para">
                            Vat Number :
                            {
                              info.shipment_ref === "consignee" ?
                                4740280377 : ""
                            }
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
                    <h6 className="orgin_hd">Cargo Details</h6>
                  </div>
                  <div className="main_det">
                    {/* PRODUCT DESCRIPTION */}
                    <div className="view_box">
                      <p className="client_para">Product Description</p>
                      <p className="or_para">{info.product_desc}</p>
                    </div>

                    {/* HAZARDOUS */}
                    <div className="view_box">
                      <p className="client_para">Hazardous</p>
                      <p className="or_para">{info.hazardous}</p>
                    </div>

                    {/* INDUSTRY */}
                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">
                      <div>
                        <p className="client_para">Industry</p>
                        <p className="or_para">{info.nature_of_hazard}</p>
                      </div>

                      {/* PACKAGING */}
                      <div>
                        <p className="client_para">Packaging</p>
                        <p className="or_para">{info.package_type}</p>
                      </div>
                    </div>

                    {/* NO OF PACKAGES */}
                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">
                      <div className="view_box">
                        <p className="client_para">No of Packages</p>
                        <p className="or_para">{info.no_of_packages}</p>
                      </div>

                      {/* DIMENSIONS */}
                      <div className="view_box">
                        <p className="client_para">Dimensions (cbm)</p>
                        <p className="or_para">{info.dimension}</p>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">
                      {/* WEIGHT */}
                      <div>
                        <p className="client_para">Weight (kgs)</p>
                        <p className="or_para">{info.weight}</p>
                      </div>
                      {/* VOLUMETRIC WEIGHT */}
                      <div>
                        <p className="client_para">Vol Weight (kgs)</p>
                        <p className="or_para">{info?.volumetric_weight}</p>
                      </div>
                    </div>

                    {/* COMMODITY */}
                    <div className="view_box">
                      <p className="client_para">Commodity</p>
                      <p className="or_para">{info.commodity_name}</p>
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

                      {/* POL SECTION */}
                      <div className="ship_section_title">
                        <p className="ship_hd">POL Information</p>
                      </div>
                      <div className="d-flex gap-2 view_box">
                        <div className="flex-grow-1">
                          <p className="client_para">Place of Loading</p>
                          <p className="or_para">{info.supplier_address}</p>
                        </div>
                        <div className="flex-grow-1">
                          <p className="client_para">Port of Loading</p>
                          <p className="or_para">{info.port_of_loading}</p>
                        </div>

                      </div>


                      <div className="view_box">
                        <p className="client_para">Instructions</p>
                        <p className="or_para">{info.shipment_origin}</p>
                      </div>

                      {/* TRANSIT SECTION */}
                      <div className="ship_section_title">
                        <p className="ship_hd">Transit Information</p>
                      </div>
                      <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                        <div>
                          <p className="client_para">Freight Option</p>
                          <p className="or_para">{info.freight}</p>
                        </div>
                        <div>
                          <p className="client_para">Efficiency</p>
                          <p className="or_para">{info.type}</p>
                        </div>
                        <div>
                          <p className="client_para">Incoterms</p>
                          <p className="or_para">{info.incoterm}</p>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between gap-2 view_box flex-wrap">

                        <div>
                          <p className="client_para">Type</p>
                          <p className="or_para">{info.fcl_lcl}</p>
                        </div>
                        <div>
                          <p className="client_para">Insurance</p>
                          <p className="or_para">{info.insurance}</p>
                        </div>
                        <div>
                          <p className="client_para">Warehouse</p>
                          <p className="or_para">{info.assign_warehouse}</p>
                        </div>
                      </div>





                      {/* POD SECTION */}
                      <div className="ship_section_title">
                        <p className="ship_hd">POD Information</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Place of Delivery</p>
                        <p className="or_para">{info.place_of_delivery}</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Port of Discharge</p>
                        <p className="or_para">{info.post_of_discharge}</p>
                      </div>

                      <div className="view_box">
                        <p className="client_para">Instructions</p>
                        <p className="or_para">{info.shipment_des}</p>
                      </div>

                      {/* COMMENT */}
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
        </div>
      </div>
      
    </div>
  );
}
