// import React, { useEffect, useState } from "react";
// import "./CustomIns.css";
// import logo from ".././Assests/logo.png";
// import { usePDF } from "react-to-pdf";
// import { useLocation, useNavigate } from "react-router-dom";
// import { DownloadForOffline } from "@mui/icons-material";
// import { data } from "jquery";
// import axios from "axios";
// const BookingInstruction = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState({});
//   const openInsForm = () => {
//     navigate("/Admin/booking_instruction_form", { state: { data: info } });
//   };
//   const loaction = useLocation();
//   console.log(loaction?.state?.data);
//   const info = loaction?.state?.data;
//   const { toPDF, targetRef } = usePDF({ filename: "Booking Instruction.pdf" });

//   const getdata = async () => {
//     try {
//       const orde = {
//         order_id: info.order_id,
//       };
//       const response = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}GetBookingInstructionById`,
//         orde
//       );
//       console.log(response.data.data);
//       if (response.data.success === true) {
//         console.log(response.data.data);
//         setData(response.data.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   useEffect(() => {
//     getdata();
//   }, []);
//   return (
//     <div className="wpWrapper">
//       <div className="container-fluid">
//         <div className="d-flex justify-content-between">
//           <div className="mb-2">
//             <div className="d-flex">
//               <h4 class="freight_hd">
//                 Shipping and Custom Clearance Instruction
//               </h4>
//               <div className="addInsForm ms-4 ">
//                 <button onClick={openInsForm}>Add Booking Instruction</button>
//               </div>
//             </div>
//           </div>
//           <div>
//             <DownloadForOffline onClick={() => toPDF()} />
//           </div>
//         </div>
//         <div className="customInsPdf " ref={targetRef}>
//           <table>
//             <tr>
//               <td>
//                 <table className="Bordered-table">
//                   <tr>
//                     <td>
//                       <div>
//                         <div style={{ display: "flex" }}>
//                           <div
//                             style={{ width: "50%", border: "1px solid #000" }}
//                           >
//                             <table style={{ background: "#b2b3b730" }}>
//                               <tr>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid rgb(0, 0, 0)",
//                                   }}
//                                 >
//                                   <h6>SHIPPER : </h6>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   SHIPPER:
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {/* {info?.shipment_ref === "shipper"
//                                     ? "Asia Direct"
//                                     : info?.client_name} */}
//                                   {info.shipment_ref === "consignee"
//                                     ? info.shipper_name
//                                     : info.client_name}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   rowspan="3"
//                                   style={{
//                                     borderRight: "1px solid #000",
//                                     width: "40%",
//                                   }}
//                                 >
//                                   ADDRESS
//                                 </th>
//                                 <td
//                                 // style={{ borderBottom: "1px solid #000" }}
//                                 >
//                                   {info.shipment_ref === "consignee"
//                                     ? info.supplier_address
//                                     : info?.address_1 +
//                                       " " +
//                                       info.address_2 +
//                                       " " +
//                                       <br /> +
//                                       info.province +
//                                       " " +
//                                       <br /> +
//                                       info.delivery_to_name}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td> </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{ borderBottom: "1px solid #000" }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   CONTACT
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {info.shipment_ref === "consignee"
//                                     ? info.telephone
//                                     : info.cellphone}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   TEL. NO / EMAIL
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {info.shipment_ref === "consignee"
//                                     ? info.telephone
//                                     : info.cellphone}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   PO NUMBER TO ASIA DIRECT - AFRICA
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_ship_poNo}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   EXPORT CUSTOMS CODE:
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_ship_custCode}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   REGISTERED NAME OF IMP / EXPORTERS CODE
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_ship_regNum}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td>
//                                   <strong>
//                                     In the event that the Customer issues
//                                     instructions for the use of an exporter’s
//                                     code other than the Customer’s own, the
//                                     Customer warrants that they do so with the
//                                     written authorisation of the owner of the
//                                     exporter’s code and a copy of the
//                                     authorisation shall be forwarded to Asia
//                                     Direct - Africa together with the
//                                     instruction.
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   SHIPPER'S REF NO:
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderTop: "1px solid #000",

//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_ship_refNo}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>
//                                     COMMERICIAL DOCUMENT INFORMATION{" "}
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   MARK WITH AN X THE DOCUMENTS YOU ARE PROVIDING
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {data.bk_xdoc_provider}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   COMMERCIAL INVOICE
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 //  className= {data.bk_comm_Invoice==="Yes"?"fa fa-check":""}
//                                 >
//                                    <i  className= {data.bk_comm_Invoice==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",

//                                   }}
//                                   // className= {data.bk_comm_Invoice==="No"?"fa fa-check":""}                                >
//                                        > <i  className= {data.bk_comm_Invoice==="No"?"fa fa-check":""} ></i>
//                                   </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   TOTAL COUNT OF COMMERCIAL INVOICES ON THIS
//                                   SHIPMENT
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "130px",
//                                     borderLeft: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {data.bk_count_CommInv}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}

//                                 >
//                                   PACKING LIST
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                     // className= {data.bk_packing_list==="Yes"?"fa fa-check":""}
//                                 >
//                                  <i  className= {data.bk_packing_list==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                     // className= {data.bk_packing_list==="No"?"fa fa-check":""}
//                                 >
//                                   <i  className= {data.bk_packing_list==="No"?"fa fa-check":""} ></i>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   ORIGINAL TRANSPORT DOCUMENTS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                     // className= {data.bk_trasprt_doc==="Yes"?"fa fa-check":""}
//                                 > <i  className= {data.bk_trasprt_doc==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                     // className= {data.bk_trasprt_doc==="No"?"fa fa-check":""}
//                                 >
//                                   <i  className= {data.bk_trasprt_doc==="No"?"fa fa-check":""} ></i>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     whiteSpace: "break-spaces",
//                                   }}
//                                 >
//                                   MSDS ( MATERIAL SAFTY DATA SHEET FOR DG CARGO)
//                                   / PRODUCT LITERATURE
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {/* {data.bk_MSDS} */}
//                                    <i  className= {data.bk_MSDS==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                     <i  className= {data.bk_MSDS==="No"?"fa fa-check":""} ></i>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   CUSTOMS DOCUMENTS / RULINGS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   COUNTRY TRADE AGREEMENT / CERIFICATE / EUR1
//                                   /SADC
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {/* {data.bk_CuntyTrd_SADC} */}
//                                    <i  className= {data.bk_CuntyTrd_SADC==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                    <i  className= {data.bk_CuntyTrd_SADC==="No"?"fa fa-check":""} ></i>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   LETTER OF CREDIT
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                    <i  className= {data.bk_letter_credit==="Yes"?"fa fa-check":""} ></i>
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                          <i  className= {data.bk_letter_credit==="No"?"fa fa-check":""} ></i>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>INSURANCE REQUIREMENTS</strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "45%",
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   IS ASIA DIRECT - AFRICA REQUIRED TO PROVIDE
//                                   INSURANCE COVER. Please note that should you
//                                   not require Insurance goods are carried at
//                                   Owners Risk
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {data.bk_Insur_cover}
//                                    {/* <i  className= {data.bk_Insur_cover==="Yes"?"fa fa-check":""} ></i> */}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >

//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   <i  className= {data.bk_Insur_cover==="Yes"?"fa fa-check":""} ></i>
//                                   </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >   <i  className= {data.bk_Insur_cover==="No"?"fa fa-check":""} ></i></td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "45%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   ASIA DIRECT - AFRICA CHARGES ESTIMATE SUPPLIED
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                  {data.bk_estim_supp==="Yes"? "Yes":""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 > {data.bk_estim_supp==="No"? "NO":""}</td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   ESTIMATE REF
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 > {data.bk_estim_supp==="Yes"? <i className="fa fa-check"></i>:""}</td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >{data.bk_estim_supp==="No"? <i className="fa fa-check"></i>:""}</td>
//                                 <td
//                                   style={{
//                                     width: "100px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   ESTIMATE REF
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>
//                                     {" "}
//                                     Asia Direct - Africa  BILLING
//                                     REQUIREMENTS{" "}
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   SELECT
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   Shipper
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   Consignee
//                                 </td>

//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   Other (specify)
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style={{ borderBottom: "1px solid #000" }}>
//                                   ORIGIN EXPORT CHARGES
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {/* {data.bk_org_exptCharge} */}
//                                 {data.bk_org_exptCharge==="Shipper"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                   >
//                                   {data.bk_org_exptCharge==="Consignee"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "100px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid #000",
//                                     width: "45%",
//                                   }}
//                                 >
//                                   INTERNATIONAL FREIGHT CHARGES
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {/* {data.bk_intenFreig_charge} */}
//                                    {data.bk_intenFreig_charge==="Shipper"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                   >
//                                   {data.bk_intenFreig_charge==="Consignee"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "100px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <td style={{ borderBottom: "1px solid #000" }}>
//                                   CHARGES AT DESTINATION
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   {/* {data.bk_charges_destination} */}
//                                    {data.bk_charges_destination==="Shipper"? <i className="fa fa-check"></i>:""}

//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                    {data.bk_charges_destination==="Consignee"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "100px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr style={{ borderBottom: "1px solid #000" }}>
//                                 <td> DUTIES & TAXES</td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderBottom: "none",
//                                   }}
//                                 >
//                                   {/* {data.bk_duties_taxes} */}
//                                    {data.bk_duties_taxes==="Shipper"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderBottom: "none",
//                                   }}
//                                 >
//                                      {data.bk_duties_taxes==="Consignee"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "100px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     borderBottom: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                             </table>
//                           </div>
//                           {/* right part end */}
//                           <div
//                             style={{
//                               width: "50%",
//                               marginLeft: "10px",
//                               border: "1px solid rgb(0, 0, 0)",
//                             }}
//                           >
//                             <table style={{ background: "#b2b3b730" }}>
//                               <tr>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid rgb(0, 0, 0)",
//                                   }}
//                                 >
//                                   <h6>CONSIGNEE:</h6>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   CONSIGNEE:
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {" "}
//                                   {info.shipment_ref === "consignee"
//                                     ? info.client_name
//                                     : info.shipper_name}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   rowspan="2"
//                                   style={{
//                                     borderRight: "1px solid #000",
//                                     width: "45%",
//                                   }}
//                                 >
//                                   ADDRESS
//                                 </th>
//                                 <td>
//                                   {/* address_1 */}
//                                   {info.shipment_ref === "consignee"
//                                     ? info?.address_1 +
//                                       " " +
//                                       info.address_2 +
//                                       " " +
//                                       info.province
//                                     : info.supplier_address}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style={{ borderBottom: "1px solid #000" }}>
//                                   {" "}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   NOTIFY PARTY
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_consg_notfParty}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   CONTACT PERSON
//                                 </th>
//                                 <td
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {info.shipment_ref === "consignee"
//                                     ? info.client_email
//                                     : ""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   TEL
//                                 </td>
//                                 <td
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   {info?.shipment_ref === "shipper"
//                                     ? ""
//                                     : info?.cellphone}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   PORT OF DISCHARGE
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {info.post_of_discharge}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                     borderTop: "1px solid #000",
//                                   }}
//                                 >
//                                   <strong>
//                                     TRANSPORT DOCUMENT INSTRUCTIONS
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   CONTACT PERSON TO RECEIVE TRACKING REPORTS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderTop: "1px solid #000",

//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_track_contPersn}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   CONTACT PERSON TO RECEIVE POD DOCUMENTS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderTop: "1px solid #000",

//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_podDoc_contPersn}
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>EXPORT MODE OF TRANSPORT</strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table className="selectRight">
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "95px",
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   SELECT
//                                 </th>
//                                 <td
//                                   className="exWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport ===
//                                       "RoadConsole"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   Road Consol
//                                   <br />
//                                   {/* {info.fcl_lcl} */}
//                                 </td>
//                                 <td
//                                   className="exWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport ===
//                                       "RoadDedicated"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   Road Dedicated
//                                 </td>
//                                 <td
//                                   className="exWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport === "SeaFCL"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   {" "}
//                                   Sea FCL
//                                 </td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport === "SeaLCL"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   Sea LCL
//                                 </td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport === "SeaB/Bulk"
//                                         ? "lightgreen"
//                                         : "white",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   Sea B/Bulk
//                                 </td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport === "AirConsol"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   Air Consol
//                                 </td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     backgroundColor:
//                                       data.bk_exprt_modTransport ===
//                                       "AirExpress"
//                                         ? "lightgreen"
//                                         : "white",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   Air Express
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   className="exWidth"
//                                   style={{
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",

//                                   }}
//                                 >
//                                   <i
//   className={data.bk_exprt_modTransport === "RoadConsole" ? "fa fa-check" : ""}
// ></i>
//                                 </th>
//                                 <td
//                                   className="exWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                    <i
//   className={data.bk_exprt_modTransport === "RoadDedicated" ? "fa fa-check  " : ""}
// ></i>
//                                 </td>
//                                 <td
//                                   className="exWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 ><i
//   className={data.bk_exprt_modTransport === "SeaFCL" ? "fa fa-check" : ""}
// ></i></td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   <i
//   className={data.bk_exprt_modTransport === "SeaLCL" ? "fa fa-check" : ""}
// >
//   </i>
//   </td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 ><i
//   className={data.bk_exprt_modTransport === "SeaB/Bulk" ? "fa fa-check" : ""}
// ></i></td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 > <i
//   className={data.bk_exprt_modTransport === "AirConsol" ? "fa fa-check" : ""}
// ></i></td>
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   <i
//   className={data.bk_exprt_modTransport === "AirExpress" ? "fa fa-check" : ""}
// ></i>
//                                 </td>
//                               </tr>
//                             </table>

//                             <table className="">
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>
//                                     COMMERICAL TERMS OF SALE ( INCOTERMS 2020 ){" "}
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             {/* namePlace */}
//                             <table className="selectRight">
//                               <tr>
//                                 <th
//                                   style={{
//                                     border: "1px solid #000",
//                                     width: "95px",
//                                     borderLeft: "none",
//                                   }}
//                                 >
//                                   NAMED PLACE
//                                 </th>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "EXW"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   {" "}
//                                   EXW
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "FCA"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   FCA
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "FOB"
//                                         ? "lightgreen"
//                                         : "white",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   FOB
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "FAS"
//                                         ? "lightgreen"
//                                         : "white",
//                                     textAlign: "center",
//                                     width: "70px",
//                                   }}
//                                 >
//                                   FAS
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "CFR"
//                                         ? "lightgreen"
//                                         : "white",
//                                     width: "70px",
//                                   }}
//                                 >
//                                   CFR
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "CIF"
//                                         ? "lightgreen"
//                                         : "white",
//                                     width: "70px",
//                                   }}
//                                 >
//                                   CIF
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "CIP"
//                                         ? "lightgreen"
//                                         : "white",
//                                     width: "70px",
//                                   }}
//                                 >
//                                   CIP
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     border: "1px solid #000",
//                                     width: "95px",
//                                     borderLeft: "none",
//                                   }}
//                                 ></th>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                   }}
//                                 >
//                                   CPT
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "DPU"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   DPU
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "DAP"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                 >
//                                   DAP
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     width: "140px",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "DDP (incl VAT)"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                   colSpan={2}
//                                 >
//                                   DDP (incl VAT)
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     width: "140px",
//                                     backgroundColor:
//                                       data.bk_comTerm_sales === "DDP (excl VAT)"
//                                         ? "lightgreen"
//                                         : "white",
//                                   }}
//                                   colSpan={2}
//                                 >
//                                   DDP (excl VAT)
//                                 </td>
//                               </tr>
//                             </table>

//                             {/* namePlace */}
//                             <table className="selectRight" style={{borderBottom:"#000"}}>
//                               <tr>
//                                 {" "}
//                                 <th
//                                   style={{
//                                     borderTop: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     width: "95px",
//                                     borderTop: "none",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   {" "}
//                                   Instruction at Origin {" "}
//                                 </th>{" "}
//                                 <td
//                                   rowSpan={2}
//                                   style={{
//                                     width: "195px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >{data?.bk_Instru_origin}</td>{" "}
//                                 <td
//                                   style={{
//                                     width: "140px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                       borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   {" "}
//                                  Instruction at Destination
//                                 </td>{" "}
//                                 <td
//                                   className="lclWidth"
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                       borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   {data?.bk_Instru_des}
//                                   </td>{" "}
//                                 {/* <td
//                                   className="lclWidth"
//                                   style={{
//                                     // border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>{" "} */}
//                               </tr>
//                             </table>
//                             <table className="">
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                     borderBottom: "1px solid #000",
//                                   }}
//                                 >
//                                   <strong>SHIPMENT DETAILS</strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   HAZARDOUS CARGO
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   {data.bk_hazard_cargo==="Yes"? "Yes":""}

//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                   >
//                                   {data.bk_hazard_cargo==="No"? "No":""}

//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   IF YES ,PROVIDE IMCO CLASS/ UN# AND PROPER
//                                   SHIPPING NAME
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                    {data.bk_hazard_cargo==="Yes"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                   >
//                                   {data.bk_hazard_cargo==="No"? <i className="fa fa-check"></i>:""}
//                                   </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>

//                               {/* two row */}
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   IS THE CARGO PACKED TO INTERNATIONAL HAZARDOUS
//                                   REGULATIONS?
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   {/* {data.bk_cargo_packed} */}
//                                    {data.bk_cargo_packed==="Yes"? "Yes":""}

//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                    {data.bk_cargo_packed==="No"? "No":""}

//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   IF NO (WHO IS RESPONSIBLE FOR PACKING COSTS )
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                    {data.bk_cargo_packed==="Yes"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 > {data.bk_cargo_packed==="No"? <i className="fa fa-check"></i>:""}</td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               {/* two row end */}
//                               {/* two row */}
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   BATTERIES MSDS MUST BE PROVIDED
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   {/* {data.bk_battery_MSDS} */}
//                                   {data.bk_battery_MSDS==="Yes"? "Yes":""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                     {data.bk_battery_MSDS==="No"? "No":""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   ARE THE BATTERIES PACKED SEPERATLY OR INSIDE
//                                   OTHER EQUIPMENT
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                      {data.bk_battery_MSDS==="Yes"? <i className="fa fa-check"></i>:""}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >  {data.bk_battery_MSDS==="No"? <i className="fa fa-check"></i>:""}</td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               {/* two row end */}
//                               {/* two row */}
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   IF SHIPPER HAS PACKED THE SEAFREIGHT CONTAINER
//                                   CAN YOU PROVIDE YOUR SOLAS VERFICATION NUMBER
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   IF YES (STATE VERFICATION NUMBER)
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                               {/* two row end */}
//                               {/* two row */}
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   IS Asia Direct - Africa  TO ARRANGE
//                                   PRE-SHIPMENT INSPECTION?
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   IF YES. REFERENCE NUMBER AND INSPECTION BODY
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "85px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     width: "85px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   colSpan={3}
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <th
//                                   rowSpan={2}
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   TYPE OF EXPORT ENTRY REQUIRED
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "85px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   PERMANENT
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "85px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   TEMPORARY
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   EX BOND
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   RETURN
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   OTHER
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   {data.bk_export_Import}
//                                 </td>
//                                 <td
//                                   style={{
//                                     width: "65px",
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 >
//                                   No
//                                 </td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                                 <td
//                                   style={{
//                                     border: "1px solid #000",
//                                     borderRight: "none",
//                                     textAlign: "center",
//                                     borderTop: "none",
//                                   }}
//                                 ></td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     textAlign: "center",
//                                     background: "#b2b3b730",
//                                   }}
//                                 >
//                                   <strong>
//                                     {" "}
//                                     Asia Direct - Africa  BILLING
//                                     REQUIREMENTS{" "}
//                                   </strong>
//                                 </td>
//                               </tr>
//                             </table>
//                             <table>
//                               <tr>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid #000",
//                                     borderTop: "1px solid #000",
//                                   }}
//                                 >
//                                   description one
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style={{ borderBottom: "1px solid #000" }}>
//                                   description one
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td>description one</td>
//                               </tr>
//                             </table>
//                           </div>
//                         </div>
//                         <table>
//                           <tr>
//                             <td
//                               style={{
//                                 textAlign: "center",
//                                 background: "#b2b3b730",
//                                 marginTop: "20px",
//                               }}
//                               className="my-2"
//                             >
//                               <strong>
//                                 COLLECTION REQUIREMENTS (ONLY COMPLETE IF CARGO
//                                 IS NOT BEING DELIVERED TO ASIA DIRECT - AFRICA
//                                 WAREHOUSE)
//                               </strong>
//                             </td>
//                           </tr>
//                         </table>
//                         <div style={{ display: "flex" }}>
//                           <div
//                             style={{ width: "50%", border: "1px solid #000" }}
//                           >
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "45%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   COLLECTION ADDRESS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 ></td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderRight: "1px solid #000",
//                                     width: "40%",
//                                   }}
//                                 >
//                                   CONTACT NAME AND TEL
//                                 </th>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid #000",
//                                     borderBottom: "none",
//                                   }}
//                                 >
//                                   Address line one
//                                 </td>
//                               </tr>
//                             </table>
//                           </div>
//                           <div
//                             style={{
//                               width: "50%",
//                               border: "1px solid #000",
//                               marginLeft: "10px",
//                             }}
//                           >
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "40%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                   }}
//                                 >
//                                   COLLECTION ADDRESS
//                                 </th>
//                                 <td
//                                   style={{
//                                     width: "55%",
//                                     borderBottom: "1px solid #000",
//                                     borderLeft: "1px solid #000",
//                                   }}
//                                 >
//                                   {data.bk_coll_dddress}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <th
//                                   style={{
//                                     borderRight: "1px solid #000",
//                                     width: "40%",
//                                   }}
//                                 >
//                                   CONTACT NAME AND TEL
//                                 </th>
//                                 <td
//                                   style={{
//                                     borderBottom: "1px solid #000",
//                                     borderBottom: "none",
//                                   }}
//                                 >
//                                   Adress line one
//                                 </td>
//                               </tr>
//                             </table>
//                           </div>
//                         </div>
//                         <table>
//                           <tr>
//                             <td
//                               style={{
//                                 textAlign: "center",
//                                 background: "#b2b3b730",
//                               }}
//                               className="my-2"
//                             >
//                               <strong>
//                                 CARGO DETAILS AND CARGO HANDLING REQUIRMENTS
//                               </strong>
//                             </td>
//                           </tr>
//                         </table>
//                         <div style={{ display: "flex" }}>
//                           <div
//                             style={{ width: "50%", border: "1px solid #000" }}
//                           >
//                             <table>
//                               <tr>
//                                 <th
//                                   style={{
//                                     width: "50%",
//                                     borderBottom: "1px solid #000",
//                                     borderRight: "1px solid #000",
//                                     textAlign: "center",
//                                     borderRight: "NONE",
//                                   }}
//                                 >
//                                   DESCRIPTION OF GOODS
//                                 </th>
//                               </tr>
//                               <tr>
//                                 <td >
//                                   {data.bk_desc_goods}
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td>

//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td >

//                                 </td>
//                               </tr>
//                             </table>
//                           </div>
//                           <div
//                             style={{
//                               width: "50%",
//                               border: "1px solid #000",
//                               marginLeft: "10px",
//                             }}
//                           >
//                             <table className="">
//                               <tr>
//                                 <th style={{borderBottom:"1px solid #000"}}>HANDLING REQUIREMENTS </th>
//                               </tr>
//                               <tr>
//                                 <td>{data.bk_handling_req}</td>
//                               </tr>
//                             </table>
//                           </div>
//                         </div>
//                         <table>
//                           <tr>
//                             <td style={{ padding: "unset !important" }}>
//                               <p style={{ marginTop: "5px" }}>
//                                 We hereby agree to be bound by the Standard
//                                 Trading Conditions as set out by Asia Direct -
//                                 Africa. A copy of which will be made available
//                                 on request. Please ensure ALL your requirements
//                                 are completed on the above instruction
//                               </p>
//                               <p style={{ marginTop: "5px" }}>
//                                 herby request Asia Direct - Africa to clear and
//                                 deliver these goods in accordance with the
//                                 abovementioned shipping and clearing
//                                 instructions. I further declare that no onther
//                                 clearing instructions have been given to any
//                                 other person to effect clearance on my behalf
//                                 .The person authorising and signing this
//                                 document certifies that they are duly authorised
//                                 by the principle company to issue such an
//                                 instruction
//                               </p>
//                               <div
//                                 style={{
//                                   display: "flex",
//                                   marginTop: "20px",
//                                   justifyContent: "space-between",
//                                 }}
//                               >
//                                 <div>
//                                   <p
//                                     style={{
//                                       borderTop: "2px solid #000",
//                                       width: "200px",
//                                     }}
//                                   >
//                                     <strong>Name</strong>
//                                   </p>
//                                 </div>
//                                 <div>
//                                   {" "}
//                                   <p
//                                     style={{
//                                       borderTop: "2px solid #000",
//                                       width: "200px",
//                                     }}
//                                   >
//                                     <strong>Designation</strong>
//                                   </p>
//                                 </div>
//                                 <div>
//                                   {" "}
//                                   <p
//                                     style={{
//                                       borderTop: "2px solid #000",
//                                       width: "200px",
//                                     }}
//                                   >
//                                     <strong>Signature</strong>
//                                   </p>{" "}
//                                 </div>
//                                 <div>
//                                   <p
//                                     style={{
//                                       borderTop: "2px solid #000",
//                                       width: "200px",
//                                     }}
//                                   >
//                                     <strong>Date (yy/mm/dd)</strong>
//                                   </p>
//                                 </div>
//                               </div>
//                               <div
//                                 style={{
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   marginTop: "20px",
//                                 }}
//                               >
//                                 <p style={{ fontSize: "10px" }}>
//                                   This document is the property of Asia Direct -
//                                   Africa
//                                   ; Distribution and reproduction
//                                   prohibited without authorisation of the QHSE
//                                   Manager
//                                 </p>
//                                 <div>
//                                   <img
//                                     style={{ width: "150px" }}
//                                     src={logo}
//                                     alt=""
//                                   />
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         </table>
//                       </div>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default BookingInstruction;
import React, { useEffect, useState } from "react";
import "./CustomIns.css";
import logo from ".././Assests/logo.png";
import { usePDF } from "react-to-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowBack, DownloadForOffline } from "@mui/icons-material";
import { data } from "jquery";
import axios from "axios";

const BookingInstruction = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const openInsForm = () => {
    navigate("/Admin/booking_instruction_form", { state: { data: info } });
  };
  const loaction = useLocation();
  console.log(loaction?.state?.data);
  const info = loaction?.state?.data;
  const { toPDF, targetRef } = usePDF({
    filename: "Booking Instruction.pdf",
    pdfOptions: {
      margin: [20, 0, 20, 0], // top, right, bottom, left
    },
  });

  const getdata = async () => {
    try {
      const orde = {
        order_id: info.order_id,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetBookingInstructionById`,
        orde
      );
      console.log(response.data.data);
      if (response.data.success === true) {
        console.log(response.data.data);
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getdata();
  }, []);

  const backbutton = () => {
    // navigate("/Admin/WarehouseOrder");
    window.history.back();
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="d-flex justify-content-between mb-3">
          <div>
            <div className="d-flex">
              <ArrowBack style={{ cursor: "pointer" }} onClick={backbutton} />
              <h4 class="freight_hd">
                Shipping and Custom Clearance Instruction
              </h4>

            </div>
          </div>
          <div className="d-flex gap-3">
            <div className="addInsForm">
              <button onClick={openInsForm}>Add Booking Instruction</button>
            </div>
            <DownloadForOffline onClick={() => toPDF()} />
          </div>
        </div>

        <div className="customInsPdf leftTh" ref={targetRef}>
          <div style={{ padding: "5px" }}>
            <div>
              <img
                style={{ width: "150px" }}
                src={logo}
                alt=""
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <h4 className="underLineHeading">Booking Instruction</h4>
            </div>
          </div>
          <table>
            <tr>
              <td>
                <table
                  className="Bordered-table"
                  style={{ borderCollapse: " collapse !important" }}
                >
                  <tr>
                    <td style={{ padding: "unset" }}>
                      <div>
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              width: "50%",
                              border: "1px solid #000",
                              paddingBottom: "10px",
                            }}
                          >
                            <table style={{ background: "#b2b3b730" }}>
                              <tr>
                                <td
                                  style={{
                                    borderBottom: "1px solid rgb(0, 0, 0)",
                                  }}
                                >
                                  <h6>SHIPPER : </h6>
                                </td>
                              </tr>
                            </table>
                            <table
                              style={{ borderCollapse: " collapse !important" }}
                            >
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  SHIPPER:
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {/* {info?.shipment_ref === "shipper"
                                    ? "Asia Direct"
                                    : info?.client_name} */}
                                  {info.shipment_ref === "consignee"
                                    ? info.shipper_name
                                    : info.client_name}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  rowspan="3"
                                  style={{
                                    borderRight: "1px solid #000",
                                    width: "40%",
                                  }}
                                >
                                  ADDRESS
                                </th>
                                <td>
                                  {info.shipment_ref === "consignee"
                                    ? info.supplier_address
                                    : info?.address_1 +
                                    " " +
                                    info.address_2 +
                                    " " +
                                    <br /> +
                                    info.province +
                                    " " +
                                    <br /> +
                                    info.delivery_to_name}
                                </td>
                              </tr>
                              <tr>
                                <td> </td>
                              </tr>
                              <tr>
                                <td
                                // style={{ borderTop: "1px solid #000" }}
                                ></td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  CONTACT
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {info.shipment_ref === "consignee"
                                    ? info.telephone
                                    : info.cellphone}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  TEL. NO / EMAIL
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {info.shipment_ref === "consignee"
                                    ? info.telephone
                                    : info.cellphone}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  PO NUMBER TO ASIA DIRECT - AFRICA
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {data.bk_ship_poNo}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  EXPORT CUSTOMS CODE:
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {data.bk_ship_custCode}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  REGISTERED NAME OF IMP / EXPORTERS CODE
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {data.bk_ship_regNum}
                                </td>
                              </tr>
                            </table>
                            <table
                              style={{ borderCollapse: " collapse !important" }}
                            >
                              <tr>
                                <td>
                                  <strong>
                                    In the event that the Customer issues
                                    instructions for the use of an exporter’s
                                    code other than the Customer’s own, the
                                    Customer warrants that they do so with the
                                    written authorisation of the owner of the
                                    exporter’s code and a copy of the
                                    authorisation shall be forwarded to Asia
                                    Direct - Africa together with the
                                    instruction.
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  SHIPPER'S REF NO:
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {data.bk_ship_refNo}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>
                                    COMMERICIAL DOCUMENT INFORMATION{" "}
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  MARK WITH AN X THE DOCUMENTS YOU ARE PROVIDING
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_xdoc_provider}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "none",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  COMMERCIAL INVOICE
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "none",
                                    borderTop: "none",
                                  }}
                                //  className= {data.bk_comm_Invoice==="Yes"?"fa fa-check":""}
                                >
                                  <i
                                    className={
                                      data.bk_comm_Invoice === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "none",
                                    borderTop: "none",
                                  }}
                                // className= {data.bk_comm_Invoice==="No"?"fa fa-check":""}                                >
                                >
                                  {" "}
                                  <i
                                    className={
                                      data.bk_comm_Invoice === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  TOTAL COUNT OF COMMERCIAL INVOICES ON THIS
                                  SHIPMENT
                                </th>
                                <td
                                  style={{
                                    width: "130px",

                                    textAlign: "center",
                                  }}
                                >
                                  {data.bk_count_CommInv}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderTop: "1px solid #000",

                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  PACKING LIST
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderLeft: "none",
                                    borderBottom: "none",
                                    textAlign: "center",
                                  }}
                                // className= {data.bk_packing_list==="Yes"?"fa fa-check":""}
                                >
                                  <i
                                    className={
                                      data.bk_packing_list === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    borderTop: "1px solid #000",
                                    textAlign: "center",
                                  }}
                                // className= {data.bk_packing_list==="No"?"fa fa-check":""}
                                >
                                  <i
                                    className={
                                      data.bk_packing_list === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",

                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  ORIGINAL TRANSPORT DOCUMENTS
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "none",
                                    borderBottom: "none",
                                  }}
                                // className= {data.bk_trasprt_doc==="Yes"?"fa fa-check":""}
                                >
                                  {" "}
                                  <i
                                    className={
                                      data.bk_trasprt_doc === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    borderTop: "1px solid #000",
                                    textAlign: "center",
                                  }}
                                // className= {data.bk_trasprt_doc==="No"?"fa fa-check":""}
                                >
                                  <i
                                    className={
                                      data.bk_trasprt_doc === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",

                                    borderRight: "1px solid #000",
                                    whiteSpace: "break-spaces",
                                  }}
                                >
                                  MSDS ( MATERIAL SAFTY DATA SHEET FOR DG CARGO)
                                  / PRODUCT LITERATURE
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderBottom: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {/* {data.bk_MSDS} */}
                                  <i
                                    className={
                                      data.bk_MSDS === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    borderTop: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_MSDS === "No" ? "fa fa-check" : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",

                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  CUSTOMS DOCUMENTS / RULINGS
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderBottom: "unset",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  COUNTRY TRADE AGREEMENT / CERIFICATE / EUR1
                                  /SADC
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {/* {data.bk_CuntyTrd_SADC} */}
                                  <i
                                    className={
                                      data.bk_CuntyTrd_SADC === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_CuntyTrd_SADC === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  LETTER OF CREDIT
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_letter_credit === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_letter_credit === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>INSURANCE REQUIREMENTS</strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "45%",
                                    border: "1px solid #000",
                                    borderLeft: "unset",
                                  }}
                                >
                                  IS ASIA DIRECT - AFRICA REQUIRED TO PROVIDE
                                  INSURANCE COVER. Please note that should you
                                  not require Insurance goods are carried at
                                  Owners Risk
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderLeft: "none",
                                    textAlign: "center",
                                  }}
                                >
                                  {data.bk_Insur_cover}
                                  {/* <i  className= {data.bk_Insur_cover==="Yes"?"fa fa-check":""} ></i> */}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_Insur_cover === "Yes"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  {" "}
                                  <i
                                    className={
                                      data.bk_Insur_cover === "No"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "45%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  ASIA DIRECT - AFRICA CHARGES ESTIMATE SUPPLIED
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {data.bk_estim_supp === "Yes" ? "Yes" : ""}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    borderRight: "1px solid #000",

                                    textAlign: "center",
                                  }}
                                >
                                  {" "}
                                  {data.bk_estim_supp === "No" ? "NO" : ""}
                                </td>
                                <td
                                  style={{
                                    textAlign: "center",
                                  }}
                                >
                                  ESTIMATE REF
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  {" "}
                                  {data.bk_estim_supp === "Yes" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  {data.bk_estim_supp === "No" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "100px",
                                    border: "1px solid #000",
                                    borderLeft: "unset",
                                    borderRight: "unset",
                                    textAlign: "center",
                                  }}
                                >
                                  ESTIMATE REF
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>
                                    {" "}
                                    Asia Direct - Africa Logistics BILLING
                                    REQUIREMENTS{" "}
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderBottom: "unset",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  SELECT
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  Shipper
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    textAlign: "center",
                                  }}
                                >
                                  Consignee
                                </td>

                                <td
                                  style={{
                                    borderTop: "1px solid #000",

                                    textAlign: "center",
                                  }}
                                >
                                  Other (specify)
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  ORIGIN EXPORT CHARGES
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {/* {data.bk_org_exptCharge} */}
                                  {data.bk_org_exptCharge === "Shipper" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderLeft: "unset",
                                    textAlign: "center",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {data.bk_org_exptCharge === "Consignee" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "100px",
                                    borderTop: "1px solid #000",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    width: "45%",
                                    borderRight: "1px solid #000",
                                    borderBottom: "unset",
                                  }}
                                >
                                  INTERNATIONAL FREIGHT CHARGES
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {/* {data.bk_intenFreig_charge} */}
                                  {data.bk_intenFreig_charge === "Shipper" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderLeft: "unset",
                                    textAlign: "center",
                                  }}
                                >
                                  {data.bk_intenFreig_charge === "Consignee" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "100px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  CHARGES AT DESTINATION
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {/* {data.bk_charges_destination} */}
                                  {data.bk_charges_destination === "Shipper" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                >
                                  {data.bk_charges_destination ===
                                    "Consignee" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "100px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    borderLeft: "unset",
                                    borderBottom: "unset",
                                  }}
                                ></td>
                              </tr>
                              <tr
                                style={{
                                  borderTop: "1px solid #000",
                                  borderRight: "1px solid #000",
                                }}
                              >
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderLeft: "unset",
                                  }}
                                >
                                  DUTIES & TAXES
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",

                                    borderLeft: "unset",
                                  }}
                                >
                                  {/* {data.bk_duties_taxes} */}
                                  {data.bk_duties_taxes === "Shipper" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderLeft: "unset",
                                    textAlign: "center",
                                  }}
                                >
                                  {data.bk_duties_taxes === "Consignee" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "100px",
                                    border: "1px solid #000",
                                    borderRight: "unset",
                                    borderLeft: "none",
                                  }}
                                ></td>
                              </tr>
                            </table>
                          </div>
                          {/* right part end */}
                          <div
                            style={{
                              width: "50%",
                              marginLeft: "10px",
                              border: "1px solid rgb(0, 0, 0)",
                            }}
                          >
                            <table style={{ background: "#b2b3b730" }}>
                              <tr>
                                <td
                                  style={{
                                    borderBottom: "1px solid rgb(0, 0, 0)",
                                  }}
                                >
                                  <h6>CONSIGNEE:</h6>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  CONSIGNEE:
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {" "}
                                  {info.shipment_ref === "consignee"
                                    ? info.client_name
                                    : info.shipper_name}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderRight: "1px solid #000",
                                    width: "45%",
                                  }}
                                >
                                  ADDRESS
                                </th>
                                <td style={{ borderBottom: "unset" }}>
                                  {/* address_1 */}
                                  {info.shipment_ref === "consignee"
                                    ? info?.address_1 +
                                    " " +
                                    info.address_2 +
                                    " " +
                                    info.province
                                    : info.supplier_address}
                                </td>
                              </tr>

                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  NOTIFY PARTY
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {data.bk_consg_notfParty}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderTop: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  CONTACT PERSON
                                </th>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {info.shipment_ref === "consignee"
                                    ? info.client_email
                                    : ""}
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                  }}
                                >
                                  TEL
                                </td>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {info?.shipment_ref === "shipper"
                                    ? ""
                                    : info?.cellphone}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  PORT OF DISCHARGE
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                  }}
                                >
                                  {info.post_of_discharge}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  <strong>
                                    TRANSPORT DOCUMENT INSTRUCTIONS
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  CONTACT PERSON TO RECEIVE TRACKING REPORTS
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  {data.bk_track_contPersn}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderRight: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  CONTACT PERSON TO RECEIVE POD DOCUMENTS
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {data.bk_podDoc_contPersn}
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>EXPORT MODE OF TRANSPORT</strong>
                                </td>
                              </tr>
                            </table>
                            <table className="selectRight">
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "95px",
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  SELECT
                                </th>
                                <td
                                  className="exWidth"
                                  style={{
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    backgroundColor:
                                      data.bk_exprt_modTransport ===
                                        "RoadConsole"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  Road Consol
                                  {/* {info.fcl_lcl} */}
                                </td>
                                <td
                                  className="exWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                    backgroundColor:
                                      data.bk_exprt_modTransport ===
                                        "RoadDedicated"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  Road Dedicated
                                </td>
                                <td
                                  className="exWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_exprt_modTransport === "SeaFCL"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  {" "}
                                  Sea FCL
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_exprt_modTransport === "SeaLCL"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  Sea LCL
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    backgroundColor:
                                      data.bk_exprt_modTransport === "SeaB/Bulk"
                                        ? "lightgreen"
                                        : "white",
                                    textAlign: "center",
                                  }}
                                >
                                  Sea B/Bulk
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_exprt_modTransport === "AirConsol"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  Air Consol
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    backgroundColor:
                                      data.bk_exprt_modTransport ===
                                        "AirExpress"
                                        ? "lightgreen"
                                        : "white",
                                    textAlign: "center",
                                  }}
                                >
                                  Air Express
                                </td>
                              </tr>
                              <tr>
                                <th
                                  className="exWidth"
                                  style={{
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport ===
                                        "RoadConsole"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </th>
                                <td
                                  className="exWidth"
                                  style={{
                                    borderBottom: "1px solid #000",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport ===
                                        "RoadDedicated"
                                        ? "fa fa-check  "
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  className="exWidth"
                                  style={{
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderRight: "unset",
                                    borderTop: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport === "SeaFCL"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    borderBottom: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "1px solid #000",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport === "SeaLCL"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport === "SeaB/Bulk"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "unset",
                                  }}
                                >
                                  {" "}
                                  <i
                                    className={
                                      data.bk_exprt_modTransport === "AirConsol"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "unset",
                                  }}
                                >
                                  <i
                                    className={
                                      data.bk_exprt_modTransport ===
                                        "AirExpress"
                                        ? "fa fa-check"
                                        : ""
                                    }
                                  ></i>
                                </td>
                              </tr>
                            </table>

                            <table className="">
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>
                                    COMMERICAL TERMS OF SALE ( INCOTERMS 2020 ){" "}
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            {/* namePlace */}
                            <table className="selectRight">
                              <tr>
                                <th
                                  style={{
                                    border: "1px solid #000",
                                    width: "95px",
                                    borderLeft: "none",
                                    borderBottom: "unset",
                                  }}
                                >
                                  NAMED PLACE
                                </th>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderBottom: "unset",
                                    borderLeft: "unset",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "EXW"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  {" "}
                                  EXW
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderLeft: "unset",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "FCA"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  FCA
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderRight: "none",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "FOB"
                                        ? "lightgreen"
                                        : "white",
                                    textAlign: "center",
                                  }}
                                >
                                  FOB
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderRight: "none",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "FAS"
                                        ? "lightgreen"
                                        : "white",
                                    textAlign: "center",
                                    width: "70px",
                                  }}
                                >
                                  FAS
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "CFR"
                                        ? "lightgreen"
                                        : "white",
                                    width: "70px",
                                  }}
                                >
                                  CFR
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",

                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "CIF"
                                        ? "lightgreen"
                                        : "white",
                                    width: "70px",
                                  }}
                                >
                                  CIF
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderBottom: "unset",

                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "CIP"
                                        ? "lightgreen"
                                        : "white",
                                    width: "70px",
                                  }}
                                >
                                  CIP
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    border: "1px solid #000",
                                    width: "95px",
                                    borderLeft: "none",
                                  }}
                                ></th>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderLeft: "unset",
                                  }}
                                >
                                  CPT
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderLeft: "unset",

                                    backgroundColor:
                                      data.bk_comTerm_sales === "DPU"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  DPU
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "DAP"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                >
                                  DAP
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    width: "140px",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "DDP (incl VAT)"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                  colSpan={2}
                                >
                                  DDP (incl VAT)
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    width: "140px",
                                    backgroundColor:
                                      data.bk_comTerm_sales === "DDP (excl VAT)"
                                        ? "lightgreen"
                                        : "white",
                                  }}
                                  colSpan={2}
                                >
                                  DDP (excl VAT)
                                </td>
                              </tr>
                            </table>

                            {/* namePlace */}
                            <table
                              className="selectRight"
                              style={{ borderBottom: "#000" }}
                            >
                              <tr>
                                {" "}
                                <th
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    width: "95px",
                                    borderTop: "none",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {" "}
                                  Instruction at Origin{" "}
                                </th>{" "}
                                <td
                                  rowSpan={2}
                                  style={{
                                    width: "195px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "unset",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {data?.bk_Instru_origin}
                                </td>{" "}
                                <td
                                  style={{
                                    width: "140px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {" "}
                                  Instruction at Destination
                                </td>{" "}
                                <td
                                  className="lclWidth"
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {data?.bk_Instru_des}
                                </td>{" "}
                                {/* <td
                                  className="lclWidth"
                                  style={{
                                    // border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>{" "} */}
                              </tr>
                            </table>
                            <table className="">
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  <strong>SHIPMENT DETAILS</strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  HAZARDOUS CARGO
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_hazard_cargo === "Yes" ? "Yes" : ""}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_hazard_cargo === "No" ? "No" : ""}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  IF YES ,PROVIDE IMCO CLASS/ UN# AND PROPER
                                  SHIPPING NAME
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_hazard_cargo === "Yes" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_hazard_cargo === "No" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>

                              {/* two row */}
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  IS THE CARGO PACKED TO INTERNATIONAL HAZARDOUS
                                  REGULATIONS?
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {/* {data.bk_cargo_packed} */}
                                  {data.bk_cargo_packed === "Yes" ? "Yes" : ""}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_cargo_packed === "No" ? "No" : ""}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  IF NO (WHO IS RESPONSIBLE FOR PACKING COSTS )
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_cargo_packed === "Yes" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {" "}
                                  {data.bk_cargo_packed === "No" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>
                              {/* two row end */}
                              {/* two row */}
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  BATTERIES MSDS MUST BE PROVIDED
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {/* {data.bk_battery_MSDS} */}
                                  {data.bk_battery_MSDS === "Yes" ? "Yes" : ""}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_battery_MSDS === "No" ? "No" : ""}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  ARE THE BATTERIES PACKED SEPERATLY OR INSIDE
                                  OTHER EQUIPMENT
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {data.bk_battery_MSDS === "Yes" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                >
                                  {" "}
                                  {data.bk_battery_MSDS === "No" ? (
                                    <i className="fa fa-check"></i>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>
                              {/* two row end */}
                              {/* two row */}
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  IF SHIPPER HAS PACKED THE SEAFREIGHT CONTAINER
                                  CAN YOU PROVIDE YOUR SOLAS VERFICATION NUMBER
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  IF YES (STATE VERFICATION NUMBER)
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>
                              {/* two row end */}
                              {/* two row */}
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  IS Asia Direct - Africa Logistics TO ARRANGE
                                  PRE-SHIPMENT INSPECTION?
                                </th>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  IF YES. REFERENCE NUMBER AND INSPECTION BODY
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "85px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    width: "85px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "none",
                                  }}
                                ></td>
                                <td
                                  colSpan={3}
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <th
                                  rowSpan={2}
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  TYPE OF EXPORT ENTRY REQUIRED
                                </th>
                                <td
                                  style={{
                                    width: "85px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "unset",
                                    borderRight: "unset",
                                  }}
                                >
                                  PERMANENT
                                </td>
                                <td
                                  style={{
                                    width: "85px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  TEMPORARY
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  EX BOND
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  RETURN
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  OTHER
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    textAlign: "center",
                                    borderTop: "none",
                                    borderLeft: "unset",
                                    borderRight: "unset",
                                  }}
                                >
                                  {data.bk_export_Import}
                                </td>
                                <td
                                  style={{
                                    width: "65px",
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                >
                                  No
                                </td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                                <td
                                  style={{
                                    border: "1px solid #000",
                                    borderRight: "none",
                                    textAlign: "center",
                                    borderTop: "none",
                                  }}
                                ></td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    textAlign: "center",
                                    background: "#b2b3b730",
                                  }}
                                >
                                  <strong>
                                    {" "}
                                    Asia Direct - Africa Logistics BILLING
                                    REQUIREMENTS{" "}
                                  </strong>
                                </td>
                              </tr>
                            </table>
                            <table>
                              <tr>
                                <td
                                  style={{
                                    borderBottom: "1px solid #000",
                                    borderTop: "1px solid #000",
                                  }}
                                >
                                  description one
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderBottom: "1px solid #000" }}>
                                  description one
                                </td>
                              </tr>
                              <tr>
                                <td>description one</td>
                              </tr>
                            </table>
                          </div>
                        </div>
                        <table>
                          <tr>
                            <td
                              style={{
                                textAlign: "center",
                                background: "#b2b3b730",
                                marginTop: "20px",
                              }}
                              className="my-2"
                            >
                              <strong>
                                COLLECTION REQUIREMENTS (ONLY COMPLETE IF CARGO
                                IS NOT BEING DELIVERED TO ASIA DIRECT - AFRICA
                                WAREHOUSE)
                              </strong>
                            </td>
                          </tr>
                        </table>
                        <div style={{ display: "flex" }}>
                          <div
                            style={{ width: "50%", border: "1px solid #000" }}
                          >
                            <table style={{ height: "100%" }}>
                              <tr>
                                <th
                                  style={{
                                    width: "45%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  COLLECTION ADDRESS
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                ></td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderRight: "1px solid #000",
                                    width: "40%",
                                  }}
                                >
                                  CONTACT NAME AND TEL
                                </th>
                                <td
                                  style={{
                                    borderBottom: "1px solid #000",
                                    borderBottom: "none",
                                  }}
                                >
                                  Address line one
                                </td>
                              </tr>
                            </table>
                          </div>
                          <div
                            style={{
                              width: "50%",
                              border: "1px solid #000",
                              marginLeft: "10px",
                            }}
                          >
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "40%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                  }}
                                >
                                  Opening Times
                                </th>
                                <td
                                  style={{
                                    width: "55%",
                                    borderBottom: "1px solid #000",
                                  }}
                                >
                                  {data.bk_opening_times}
                                </td>
                              </tr>
                              <tr>
                                <th
                                  style={{
                                    borderRight: "1px solid #000",
                                    width: "40%",
                                  }}
                                >
                                  Opening Times Confirm Loading Facilities at
                                  Collection Point
                                </th>
                                <td
                                  style={{
                                    borderBottom: "1px solid #000",
                                    borderBottom: "none",
                                  }}
                                >
                                  {data?.bk_loading_facilities}
                                </td>
                              </tr>
                            </table>
                          </div>
                        </div>
                        {/*
                          PAGE-BREAK SPACER (react-to-pdf only slices pages by
                          raw pixel height, it has no concept of "start this
                          element on a new page"). This blank div pushes the
                          "CARGO DETAILS AND CARGO HANDLING REQUIRMENTS"
                          section down until it spills onto the next
                          auto-generated page.
                          TUNE THIS VALUE: download the PDF, check where the
                          Cargo Details heading lands, then adjust the height
                          below and re-download:
                            - Still on the same page as the content above it?
                              -> increase the height
                            - New page appears but is mostly/entirely blank
                              before Cargo Details starts?
                              -> decrease the height
                        */}
                        <div
                          id="cargo-details-page-break-spacer"
                          style={{ marginTop: "100px" }}
                        />
                        <table
                          style={{
                            pageBreakBefore: "always",
                            breakBefore: "page",
                          }}
                        >
                          <tr>
                            <td
                              style={{
                                textAlign: "center",
                                background: "#b2b3b730",
                              }}
                              className="my-2"
                            >
                              <strong>
                                CARGO DETAILS AND CARGO HANDLING REQUIRMENTS
                              </strong>
                            </td>
                          </tr>
                        </table>
                        <div style={{ display: "flex" }}>
                          <div
                            style={{ width: "50%", border: "1px solid #000" }}
                          >
                            <table>
                              <tr>
                                <th
                                  style={{
                                    width: "50%",
                                    borderBottom: "1px solid #000",
                                    borderRight: "1px solid #000",
                                    textAlign: "center",
                                    borderRight: "NONE",
                                  }}
                                >
                                  DESCRIPTION OF GOODS
                                </th>
                              </tr>
                              <tr>
                                <td style={{ borderBottom: "1px solid #000" }}>
                                  {data.bk_desc_goods}
                                </td>
                              </tr>
                              <tr>
                                <td style={{ borderBottom: "1px solid #000" }}>
                                  .{" "}
                                </td>
                              </tr>
                              <tr>
                                <td>.</td>
                              </tr>
                            </table>
                          </div>
                          <div
                            style={{
                              width: "50%",
                              border: "1px solid #000",
                              marginLeft: "10px",
                            }}
                          >
                            <table className="bottomTable">
                              <tr>
                                <th
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                    borderBottom: "0",
                                    borderRight: "0",
                                  }}
                                >
                                  HANDLING REQUIREMENTS{" "}
                                </th>
                                {/* <th>WEIGHT (KG'S)</th>
                                <th>NUMBER OF PIECES </th>
                                <th>LENGTH (METER)</th>
                                <th>WIDTH (METER)</th>
                                <th>HEIGHT (METER)</th> */}
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                    borderBottom: "0",
                                    borderRight: "0",
                                  }}
                                >
                                  {data.bk_handling_req}
                                </td>
                                {/* <td> </td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td>123</td> */}
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                    borderBottom: "0",
                                    borderRight: "0",
                                  }}
                                >
                                  .
                                </td>
                                {/* <td> </td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td>123</td>*/}
                              </tr>
                              <tr>
                                <td
                                  style={{
                                    borderTop: "1px solid #000",
                                    borderLeft: "1px solid #000",
                                    borderBottom: "0",
                                    borderRight: "0",
                                  }}
                                >
                                  .
                                </td>
                                {/* <td> </td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td>123</td> */}
                              </tr>
                            </table>
                          </div>
                        </div>

                        <table>
                          <tr>
                            <td
                              style={{
                                textAlign: "center",
                                background: "#b2b3b730",
                              }}
                              className="my-2"
                            >
                              <strong>TERMS &amp; CONDITIONS</strong>
                            </td>
                          </tr>
                        </table>
                        <div style={{ border: "1px solid #000", padding: "10px" }}>
                          <p>
                            All business is undertaken subject to our General
                            Trading Conditions, a copy of which is available
                            on request. (E&amp;OE) Errors and Omissions
                            Excepted.
                          </p>
                          <p>
                            <strong>1. Insurance</strong>: All goods are
                            shipped at the customer's risk. If insurance is
                            required, it must be arranged and paid for by the
                            customer.
                          </p>
                          <p>
                            <strong>2. Weight and Dimensions</strong>: Changes
                            in the actual weight, dimensions of the goods from
                            the initial quote may affect the final pricing at
                            billing. The customer will be notified of any
                            price adjustments.
                          </p>
                          <p>
                            <strong>3. Misdeclaration of Goods</strong>: Any
                            misdeclaration of goods will result in additional
                            charges and potential legal consequences.
                            Misdeclaration may include cargo description,
                            costs, hazardous e.t.c.
                          </p>
                          <p>
                            <strong>4. Customs Duties &amp; VAT</strong>: The
                            customer is responsible for all customs duties
                            and VAT applicable to their shipment.
                          </p>
                          <p>
                            <strong>5. Customs Stops &amp; Inspections</strong>
                            : Any costs incurred due to customs stops and
                            inspections will be billed to the customer.
                          </p>
                          <p>
                            <strong>6. Late Collection &amp; Storage Fees</strong>
                            : Goods not collected within the agreed timeframe
                            will incur storage fees. These fees are payable
                            by the customer.
                          </p>
                          <p>
                            <strong>7. Late Payment of Invoices</strong>: Late
                            payment of invoices will attract interest charges
                            as per the company's policy.
                          </p>
                          <p>
                            <strong>8. Abandoned Cargo</strong>: Cargo not
                            collected within 28 days will be regarded
                            abandoned, the customer will be liable for any
                            disposal costs and associated fees.
                          </p>
                        </div>

                        <table style={{ marginTop: "15px" }}>
                          <tr>
                            <td>
                              <strong>Banking Details</strong>
                            </td>
                          </tr>
                        </table>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <p style={{ marginBottom: "2px" }}>
                              <strong>Account Name</strong>
                            </p>
                            <p>Dancliff Logistics Limited</p>
                          </div>
                          <div>
                            <p style={{ marginBottom: "2px" }}>
                              <strong>Bank Name</strong>
                            </p>
                            <p>First National Bank</p>
                          </div>
                        </div>

                        <table>
                          <tr>
                            <td style={{ padding: "unset !important" }}>
                              <p style={{ marginTop: "5px" }}>
                                We hereby agree to be bound by the Standard
                                Trading Conditions as set out by Asia Direct -
                                Africa. A copy of which will be made available
                                on request. Please ensure ALL your requirements
                                are completed on the above instruction
                              </p>
                              <p style={{ marginTop: "5px" }}>
                                herby request Asia Direct - Africa to clear and
                                deliver these goods in accordance with the
                                abovementioned shipping and clearing
                                instructions. I further declare that no onther
                                clearing instructions have been given to any
                                other person to effect clearance on my behalf
                                .The person authorising and signing this
                                document certifies that they are duly authorised
                                by the principle company to issue such an
                                instruction
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  marginTop: "20px",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div>
                                  <p
                                    style={{
                                      borderTop: "2px solid #000",
                                      width: "200px",
                                    }}
                                  >
                                    <strong>Name</strong>
                                  </p>
                                </div>
                                <div>
                                  {" "}
                                  <p
                                    style={{
                                      borderTop: "2px solid #000",
                                      width: "200px",
                                    }}
                                  >
                                    <strong>Designation</strong>
                                  </p>
                                </div>
                                <div>
                                  {" "}
                                  <p
                                    style={{
                                      borderTop: "2px solid #000",
                                      width: "200px",
                                    }}
                                  >
                                    <strong>Signature</strong>
                                  </p>{" "}
                                </div>
                                <div>
                                  <p
                                    style={{
                                      borderTop: "2px solid #000",
                                      width: "200px",
                                    }}
                                  >
                                    <strong>Date (yy/mm/dd)</strong>
                                  </p>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginTop: "20px",
                                }}
                              >
                                <p style={{ fontSize: "10px" }}>
                                  This document is the property of Asia Direct -
                                  Africa; Distribution and reproduction
                                  prohibited without authorisation of the QHSE
                                  Manager
                                </p>

                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingInstruction;
