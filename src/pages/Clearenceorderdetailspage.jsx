import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Clearenceorderdetailspage() {
  const infolocation = useLocation();
  const navigate = useNavigate();
  const [document, setDocument] = useState([]);
  const [document1, setDocument1] = useState([]);
  const [documents, setDocuments] = useState({});
  const [packing, setPacking] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const info = infolocation?.state?.data[0];
  console.log(infolocation?.state?.data[0]);
  const handleclicknav = () => {
    navigate("/Admin/custom-clearance-order");
  };
  const GetFreightImages = () => {
    const data = { clearance_id: info.id, uploaded_by: "1" };

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
  //   console.log(info);
  //   const data = { clearence_id: info.id };
  //   axios
  //     .post(`${process.env.REACT_APP_BASE_URL}GetFreightImages`, data)
  //     .then((response) => {
  //       console.log(response.data);
  //       setDocument(response.data.data["Supplier Invoice"]);
  //       setLicenses(response.data.data.Licenses);
  //       setDocument1(response.data.data["Other Documents"]);
  //       setPacking(response.data.data["Packing List"]);
  //       console.log(response.data.data["Supplier Invoice"]);
  //     })
  //     .catch((error) => {
  //       console.log(error.response.data);
  //     });
  // };
  useEffect(() => {
    GetFreightImages();
  }, []);
  const deleteapi = (id) => {
    console.log(id);
    const data11 = {
      doc_id: id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}clearanceDocument`, data11)
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
                <h4 className="det_hd mb-0">Clearance Details</h4>
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
                      <h6 className="ship_hd">  <i class="fi fi-rs-building build_icon"></i> Shipper</h6>
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
                          {/* <p className='client_para'>{info.cellphone}</p> */}
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
                      <h6 className="ship_hd">   <i class="fi fi-rr-marker build_icon"></i> Pickup Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">
                            {info.port_of_entry_name}
                          </p>
                          <p className="client_para">{info.port_of_loading}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd">   <i class="fi fi-rs-building build_icon"></i> Exporter</h6>
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
                      <h6 className="ship_hd">   <i class="fi fi-rs-building build_icon"></i> Consignee</h6>
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
                      <h6 className="ship_hd">   <i className="fi fi-rr-marker build_icon"></i> Delivery Address</h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">{info.port_of_exit_name}</p>
                          <p className="client_para">
                            {info.port_of_discharge}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"> <i className="fi fi-rs-building build_icon"></i> Importer</h6>
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
            {/* <div className="col-md-4 ps-4">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Booking Information</h6>
                    <span className="line"></span>
                  </div>
                  <div className="main_det">
                    <div class="table-responsive">
                      <table class="det_show">
                        <tbody>
                          <tr>
                            <td>
                              <p className="ship_hd">POL Information</p>
                            </td>
                          </tr>
                          <tr>
                            <td class="fright_num">
                              <p class="client_para1">Port of Discharge :</p>
                            </td>
                            <td>
                              <p class="client_para1">
                                {info.port_of_discharge}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Port of Loading:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.port_of_loading}</p>
                            </td>
                          </tr>
                          <tr>
                            <td className="instr_td">
                              <p className="client_para1 mb-3">Packing Type:</p>
                            </td>
                            <td>
                              <p className="client_para1 mb-3">
                                {info.packing_type}
                              </p>
                            </td>
                          </tr>
                          {/* <tr>
                            <td>
                              <p className="ship_hd">Transit Information</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Freight Option:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.freight}</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Efficiency:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.freight_type}</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1 ">Incoterms:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.incoterm}</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Insurance:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.insurance}</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Warehouse:</p>
                            </td>
                            <td>
                              <p class="client_para1">
                                {info.assign_warehouse}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Type:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.fcl_lcl}</p>
                            </td>
                          </tr> */}
            {/* <tr>
                            <td><p class="client_para1">Insurance:</p></td>
                            <td><p class="client_para1">Yes</p></td>
                          </tr> */}
            {/* <tr>
                            <td><p class="client_para1 mb-3">Warehouse:</p></td>
                            <td><p class="client_para1 mb-3">xxxxxxxxxx</p></td>
                          </tr> */}
            {/* <tr>
                            <td>
                              <p className="ship_hd">POD Information</p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Place of delivery:</p>
                            </td>
                            <td>
                              <p class="client_para1">
                                {info.post_of_discharge}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="client_para1">Port of Discharge:</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.port_of_loading}</p>
                            </td>
                          </tr>
                          <tr>
                            <td className="instr_td">
                              <p className="client_para1 mb-3">Instructions:</p>
                            </td>
                            <td>
                              <p className="client_para1 mb-3">
                                {info.shipment_des}
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p class="ship_hd">Comment</p>
                            </td>
                            <td>
                              <p class="client_para1">{info.comment}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="col-md-4">
              <div className="card desti_card">
                <div className="card-body">

                  <div className="">
                    <h6 className="orgin_hd">Cargo Details</h6>
                  </div>

                  <div className="main_det">

                    {/* PRODUCT DESCRIPTION */}
                    <div className="view_box">
                      <p className="client_para">Product Description</p>
                      <p className="or_para">{info.product_desc}</p>
                    </div>

                    {/* INDUSTRY */}
                    <div className="view_box">
                      <p className="client_para">Industry</p>
                      <p className="or_para">{info.nature_of_goods}</p>
                    </div>

                    {/* TOTAL BOX */}
                    <div className="view_box">
                      <p className="client_para">Total Box</p>
                      <p className="or_para">{info.total_box}</p>
                    </div>

                    {/* PACKAGING */}
                    <div className="view_box">
                      <p className="client_para">Packaging</p>
                      <p className="or_para">{info.packing_type}</p>
                    </div>

                    {/* VOLUME WEIGHT */}
                    <div className="view_box">
                      <p className="client_para">Vol Weight (kgs)</p>
                      <p className="or_para">{info.volumetric_weight}</p>
                    </div>

                    {/* CHARGEABLE WEIGHT */}
                    {/* <div className="view_box">
                      <h6 className="ship_hd">Chargeable Weight</h6>
                      <p className="or_para"></p>
                    </div> */}

                  </div>

                </div>
              </div>
            </div>
          </div>
          <div className="view_card">
            <div className="row viewDetails">
              {/* <div className="col-md-8">
                <div className="card desti_card">
                  <div className="card-body mb-3">
                    <div className="mb-2 supplyInv ">
                      <div>
                        <label>Supplier Invoice : </label>
                      </div>
                        {document &&
                          document.length > 0 &&
                          document?.map((item, index) => {
                            console.log(item);
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
                                <FiTrash2
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
                    <div className="mb-2 ">
                      <label>Other Document :</label>
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
                            <FiTrash2
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
                    <div className="mb-2 ">
                      <label>packing List :</label>
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
                            <FiTrash2
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
                    <div className="mb-2 ">
                      <label>Licenses Docs :</label>
                      {licenses?.map((item, index) => {
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
                            <FiTrash2
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
                    <div className="mb-2 ">
                      <label>Attach Quotation :</label>
                      {info.attachment_Estimate === null ? (
                        ""
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
                </div>
              </div> */}

              <div className="col-md-12 mb-2">
                <div className="card desti_card">
                  <div className="card-body">
                    <h6 className="orgin_hd fw-bold">Comment</h6>
                    <p className="or_para"> {info.freight_comment}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-12">
                <div className="card desti_card">
                  <div className="card-body">
                    <h6 className="orgin_hd"> view Document</h6>
                    {Object.keys(documents).map((groupName, groupIndex) => (
                      <div key={groupIndex} className="mb-2">
                        <label>{groupName}</label>
                        {documents[groupName]?.map((item, index) => (
                          <div key={item.id} className="d-flex align-items-center">
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

                    {/* Quotation (separate because it's not part of groups) */}
                    <div className="mb-2">
                      {info.attachment_Estimate && (
                        <>
                          <label> :</label>
                          <a
                            href={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view_docu ms-2"
                          >
                            View Document
                          </a>
                        </>
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
