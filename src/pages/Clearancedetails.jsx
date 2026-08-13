// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// export default function Clearancedetails() {
//   const infolocation = useLocation();
//   const navigate = useNavigate();
//   const [document, setDocument] = useState([]);
//   const [document1, setDocument1] = useState([]);
//   const [packing, setPacking] = useState([]);
//   const [licenses, setLicenses] = useState([]);
//   const info = infolocation?.state?.clearance_id;
//   console.log(info);
//   const data1 = new Date(info?.date).toLocaleDateString("en-GB");
//   const handleclick = () => {
//     navigate("/Admin/calculation-order");
//   };
//   return (
//     <div className="wpWrapper">
//       <div className="container-fluid">
//         <div className="formDetails">
//           <div className="row">
//             <div className="col-lg-12 px-0">
//               <div className="d-flex">
//                 <div style={{ cursor: "pointer" }}>
//                   <ArrowBackIcon onClick={handleclick} />
//                 </div>
//                 <div>
//                   <h4 className="det_hd ms-3">Admin Clearance Details</h4>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="row mt-4">
//             <div className="col-md-4">
//               <div className="card desti_card">
//                 <div className="card-body">
//                   <div className="">
//                     <h6 className="orgin_hd">Consignee Details</h6>
//                     <span className="line"></span>
//                   </div>
//                   <div className="main_det">
//                     <div className="view_box">
//                       <h6 className="ship_hd">Client</h6>
//                       <div className="d-flex align-items-start">
//                         <i class="fi fi-rs-building build_icon"></i>
//                         <div className="">
//                           <p className="or_para">{info.client_name}</p>
//                           <p className="client_para">
//                             {info.shipment_ref === "shipper"
//                               ? " Unit 4 Villa Valencia2 Anemoon Road Glen Marais 1619 South Africa"
//                               : info.address_1}
//                           </p>
//                           <p className="client_para">
//                             {info.shipment_ref === "shipper"
//                               ? "+27 10 448 0733"
//                               : info.telephone}
//                           </p>
//                           <p className="client_para">
//                             {info.shipment_ref === "shipper"
//                               ? "sa@asiadirect.africa "
//                               : info.client_email}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="view_box">
//                       <h6 className="ship_hd">Delivery Address</h6>
//                       <div className="d-flex align-items-start">
//                         <div className=""></div>
//                         <div className="">
//                           <p className="or_para">{info.delivery_to_name}</p>
//                           <p className="client_para">
//                             {info.place_of_delivery}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="view_box">
//                       <h6 className="ship_hd">Importer</h6>
//                       <div className="d-flex align-items-start">
//                         <i class="fi fi-rs-building build_icon"></i>
//                         <div className="">
//                           <p className="or_para">{info.importers_ref}</p>
//                           <p className="client_para">Export Code:{info.code}</p>
//                           <p className="client_para">
//                             Vat Number:{info.tax_ref}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="">
//                       <div className="d-flex align-items-start">
//                         <i class="fi fi-rr-marker build_icon"></i>
//                         <div className="">
//                           <p className="client_para">
//                             {info.place_of_delivery}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-4 ps-4">
//               <div className="card desti_card">
//                 <div className="card-body">
//                   <div className="">
//                     <h6 className="orgin_hd">Booking Information</h6>
//                     <span className="line"></span>
//                   </div>
//                   <div className="main_det">
//                     <div class="table-responsive">
//                       <table class="det_show">
//                         <tbody>
//                           <tr>
//                             <td>
//                               <p className="ship_hd">POL Information</p>
//                             </td>
//                           </tr>
//                           {/* <tr>
//                             <td class="fright_num">
//                               <p class="client_para1">
//                                 <strong>Place of loading:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">
//                                 {info.supplier_address}
//                               </p>
//                             </td>
//                           </tr> */}
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Port of Loading:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.port_of_loading}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Freight Option:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.freight}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Client Reference:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.customer_ref}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Incoterms:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.incoterm}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Type:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.fcl_lcl}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Insurance:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.insurance}</p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1 mb-3">
//                                 <strong>Warehouse:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1 mb-3">
//                                 {info.assign_warehouse}
//                               </p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p className="ship_hd">POD Information </p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Place of delivery:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">
//                                 {/* {info.port_of_discharge} */}
//                               </p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="client_para1">
//                                 <strong>Port of Discharge:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">
//                                 {info.port_of_discharge}
//                               </p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="instr_td">
//                               <p className="client_para1 mb-3">
//                                 <strong>Instructions:</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p className="client_para1 mb-3">
//                                 {info.shipment_des}
//                               </p>
//                             </td>
//                           </tr>
//                           <tr>
//                             <td>
//                               <p class="ship_hd">
//                                 <strong>Comment</strong>
//                               </p>
//                             </td>
//                             <td>
//                               <p class="client_para1">{info.comment_on_docs}</p>
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="view_card">
//             <div className="row">
//               <div className="col-md-4 pe-4">
//                 <div className="card desti_card1">
//                   <div className="card-body">
//                     <div className="">
//                       <h6 className="orgin_hd">Cargo Details</h6>
//                       <span className="line"></span>
//                     </div>
//                     <div className="main_det">
//                       <div class="table-responsive">
//                         <table class="det_show">
//                           <tbody>
//                             <tr>
//                               <td class="fright_num">
//                                 <p class="client_para1">
//                                   {" "}
//                                   <strong>Product Description:</strong>{" "}
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">{info.goods_desc}</p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>Packaging:</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">{info.packing_type}</p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>No of Packages:</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">
//                                   {info.nature_of_goods}
//                                 </p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>Dimensions(cbm):</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">{info.total_dimension}</p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>Weight(kgs):</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">{info.total_weight}</p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>Commodity:</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1">
//                                   {info.commodity_name}
//                                 </p>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td>
//                                 <p class="client_para1">
//                                   <strong>Vol weight(kgs):</strong>
//                                 </p>
//                               </td>
//                               <td>
//                                 <p class="client_para1"></p>
//                               </td>
//                             </tr>
//                             <tr></tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-8">
//                 <div className="card desti_card">
//                   <div className="card-body mb-3">
//                     <div className="mb-2 supplyInv ">
//                       <div>
//                         <label>Supplier Invoice : </label>
//                       </div>
//                       <div>
//                         {document?.map((item, index) => {
//                           return (
//                             <>
//                               <a
//                                 href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="view_docu ms-2"
//                               >
//                                 View Document
//                               </a>
//                             </>
//                           );
//                         })}
//                       </div>
//                     </div>
//                     {/* <div className="mb-2 ">
//                       <label>Other Document :</label>
//                       {document1?.map((item, index) => {
//                         return (
//                           <>
//                             <a
//                               href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="view_docu ms-2"
//                             >
//                               View Document
//                             </a>
//                           </>
//                         );
//                       })}
//                     </div>
//                     <div className="mb-2 ">
//                       <label>packing List :</label>
//                       {packing?.map((item, index) => {
//                         return (
//                           <>
//                             <a
//                               href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="view_docu ms-2"
//                             >
//                               View Document
//                             </a>
//                           </>
//                         );
//                       })}
//                     </div>
//                     <div className="mb-2 ">
//                       <label>Licenses Docs :</label>
//                       {licenses?.map((item, index) => {
//                         return (
//                           <>
//                             <a
//                               href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="view_docu ms-2"
//                             >
//                               View Document
//                             </a>
//                           </>
//                         );
//                       })}
//                     </div>
//                     <div className="mb-2 ">
//                       <label>Attach Quotation :</label>
//                       {info.attachment_Estimate === null ? (
//                         ""
//                       ) : (
//                         <a
//                           href={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="view_docu ms-2"
//                         >
//                           View Document
//                         </a>
//                       )}
//                     </div> */}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ToastContainer } from "react-bootstrap";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from "react-toastify";
export default function MAnageFreightDetails() {
  const infolocation = useLocation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState({});
  const info = infolocation?.state.clearance_id;
  console.log(infolocation?.state);
  const data1 = new Date(info?.date).toLocaleDateString("en-GB");
  const handleclick = () => {
    navigate("/Admin/calculation-order");
  };
  useEffect(() => {
    GetFreightImages();
  }, [])

  const GetFreightImages = () => {
    const data = { clearance_id: info.id, uploaded_by: "1" };

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
            <div className="col-lg-12 px-0">
              <div className="d-flex">
                <div style={{ cursor: "pointer", }}>
                  <ArrowBackIcon onClick={handleclick} />
                </div>
                <div>
                  <h4 className="det_hd ms-3">Clearance Order Details</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4 viewDetails">
            <div className="col-md-4">
              <div className="card desti_card">
                <div className="card-body">
                  <div className="">
                    <h6 className="orgin_hd">Shipper Details</h6>
                    <span className="line"></span>
                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd">      <i class="fi fi-rs-building build_icon"></i> Asia Direct</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">
                            {info.is_cong_shipp === "shipper"
                              ? info.client_name
                              : "Asia Direct"}
                          </p>
                          <p className="client_para">
                            {info.is_cong_shipp === "shipper"
                              ? info.address_1
                              : "    Unit 4 Villa Valencia2 Anemoon Road Glen Marais 1619 South Africa"}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? info.telephone
                              : "+27 10 448 0733"}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? info.client_email
                              : "sa@asiadirect.africa "}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd">
                        <i className="fi fi-rr-marker build_icon"></i>
                        Pickup Address
                      </h6>
                      <div className="d-flex align-items-start">
                        <div className="">
                        </div>
                        <div className="">
                          <p className="or_para">{info.collection_from_name}</p>
                          <p className="client_para">{info.port_of_entry_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd"><i className="fi fi-rs-building build_icon"></i> Exporter</h6>
                      <div className="d-flex align-items-start">

                        <div className="">
                          <p className="or_para">{info.shipper_name}</p>
                          <p className="client_para">Export Code:{info.code}</p>
                          <p className="client_para">Vat Number:4740280377</p>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div className="d-flex align-items-start">
                        <h6 className="ship_hd">
                          <i className="fi fi-rr-marker build_icon"></i>

                        </h6>

                        <div className="">
                          <p className="client_para">{info.supplier_address}</p>
                          <p className="client_para">{info.supplier_address}</p>
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
                    <span className="line"></span>
                  </div>
                  <div className="main_det">
                    <div className="view_box">
                      <h6 className="ship_hd">
                        <i className="fi fi-rs-building build_icon"></i>
                        Client
                      </h6>
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
                              : info.address_1}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? "+27 10 448 0733"
                              : info.telephone}
                          </p>
                          <p className="client_para">
                            {info.shipment_ref === "shipper"
                              ? "sa@asiadirect.africa "
                              : info.client_email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="view_box">
                      <h6 className="ship_hd">
                        <i className="fi fi-rr-marker build_icon"></i>
                        Delivery Address
                      </h6>
                      <div className="d-flex align-items-start">
                        <div className=""></div>
                        <div className="">
                          <p className="or_para">{info.port_of_exit_name}</p>
                          <p className="client_para">
                            {info.place_of_delivery}
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
                            Vat Number:{info.tax_ref}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="">
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
                    <span class="line"></span>
                  </div>

                  <div className="main_det">

                    <div className="view_box">
                      <p className="client_para">Product Description</p>
                      <p className="or_para">{info.goods_desc}</p>
                    </div>

                    <div className="view_box">
                      <p className="client_para">Hazardous</p>
                      <p className="or_para">{info.hazardous}</p>
                    </div>

                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">

                      <div>
                        <p className="client_para">Order Status</p>
                        <p className="or_para">{info.order_status}</p>
                      </div>

                      <div>
                        <p className="client_para">Packaging</p>
                        <p className="or_para">{info.packing_type}</p>
                      </div>

                    </div>

                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">

                      <div>
                        <p className="client_para">No of Packages</p>
                        <p className="or_para">{info.total_box}</p>
                      </div>

                      <div>
                        <p className="client_para">Dimensions (cbm)</p>
                        <p className="or_para">{info.total_dimension}</p>
                      </div>

                    </div>

                    <div className="d-flex gap-2 justify-content-between view_box flex-wrap">

                      <div>
                        <p className="client_para">Weight (kgs)</p>
                        <p className="or_para">{info.weight}</p>
                      </div>

                      <div>
                        <p className="client_para">Vol Weight (kgs)</p>
                        <p className="or_para">{info.total_weight}</p>
                      </div>

                    </div>

                    <div className="view_box">
                      <p className="client_para">Commodity</p>
                      <p className="or_para">{info.commodity_name}</p>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
          <div className="view_card">
            <div className="row viewDetails">
              <div className="col-md-4">
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
                                <p className="client_para1">
                                  <strong>POL Information</strong> </p>
                              </td>
                            </tr>
                            <tr>
                              <td class="fright_num">
                                <p class="client_para1"><strong>Place of loading:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">
                                  {info.supplier_address}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Port of Loading:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.port_of_loading}</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="instr_td">
                                <p className="client_para1 mb-3"><strong>Instructions:</strong></p>
                              </td>
                              <td>
                                <p className="client_para1 mb-3">
                                  {info.shipment_origin}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p className="ship_hd">Transit Information</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Freight Option:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.freight}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Efficiency:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.type}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Incoterms:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.incoterm}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Type:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.fcl_lcl}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Insurance:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">{info.insurance}</p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1 mb-3"><strong>Warehouse:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1 mb-3">
                                  {info.assign_warehouse}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p className="client_para1"> <strong>POD Information </strong>   </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Place of delivery:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">
                                  {info.place_of_delivery}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Port of Discharge:</strong></p>
                              </td>
                              <td>
                                <p class="client_para1">
                                  {info.post_of_discharge}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td className="instr_td">
                                <p className="client_para1 mb-3"><strong>Instructions:</strong></p>
                              </td>
                              <td>

                                <p className="client_para1 mb-3">
                                  {info.shipment_des}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p class="client_para1"><strong>Comment</strong></p>
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
              </div>
              {/* <div className="col-md-8">
                <div className="card desti_card">
                  <div className="card-body mb-3">
                    <div className="mb-2 supplyInv ">
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
                            <DeleteIcon onClick={()=>{deleteapi(item.id)}} className="text-danger" style={{cursor:"pointer"}} />
                          </>
                        );
                      })}
                     </div>
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
                             <DeleteIcon onClick={()=>{deleteapi(item.id)}} className="text-danger" style={{cursor:"pointer"}} />
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
                             <DeleteIcon onClick={()=>{deleteapi(item.id)}} className="text-danger" style={{cursor:"pointer"}} />
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
                             <DeleteIcon onClick={()=>{deleteapi(item.id)}} className="text-danger" style={{cursor:"pointer"}} />
                          </>
                        );
                      })}
                    </div>
                    <div className="mb-2 ">
                      <label>Attach Quotation :</label>
                      {
                        info.attachment_Estimate===null?"":  <a
                        href={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view_docu ms-2"
                      >
                        View Document
                      </a>
                      }
                          
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="col-md-4">

                <div className="card desti_card" style={{ height: "unset" }}>
                  <div className="card-body mb-3">
                    <h6 className="orgin_hd">view Document</h6>
                    <span class="line"></span>
                    {Object.keys(documents).map((groupName, groupIndex) => (
                      <div key={groupIndex} className="my-2">
                        <label>{groupName} :</label>
                        {documents[groupName]?.map((item, index) => (
                          <div key={item.id} className="d-flex align-items-center mt-2">
                            <a
                              href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view_docu mt-0 "
                            >
                              View Document
                            </a>
                            <DeleteIcon
                              onClick={() => deleteapi(item.id)}
                              className="text-danger ms-2"
                              style={{ cursor: "pointer", height: "18px", width: "18px" }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Quotation (separate because it's not part of groups) */}
                    <div className="mb-2">
                      <label> :</label>
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
