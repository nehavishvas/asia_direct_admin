// import React from 'react'
// import image from '../Assests/favicon.png'
// import { usePDF } from 'react-to-pdf';
// import { MdDownloadForOffline } from 'react-icons/md';
// import { useLocation, useNavigate } from 'react-router-dom';
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// export default function Letterofauthority() {
//   const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
//   const navigate = useNavigate()
//   const location = useLocation()
//   console.log(location.state.data)
//   const datat = (location.state.data)
//   const handleclicknav =() =>{
//     navigate('/Admin/order')
//   }
//   return (
//     <>
//       <div className='wpWrapper'>
//         <div className="container-fluid">
//           <div>
//             <div>
//               <div className="row manageFreight">
//                 <div className="col-12">
//                   <div className='d-flex justify-content-between align-items-center'>
//                   <div className="d-flex">
//                   <div>
//                     <ArrowBackIcon
//                       onClick={handleclicknav}
//                       className="text-dark"
//                       style={{ cursor: "pointer" }}
//                     />
//                   </div>
//                   <div>
//                     <h4 className="freight_hd mt-0 ms-3">Letter Of Authority</h4>

//                   </div>
//                   </div>
//                     <MdDownloadForOffline className="fs-2" onClick={() => toPDF()} style={{ color: "#1b2245" }} />
//                   </div>
//                 </div>
//               </div>
//               <section style={{marginTop:"10px"}} ref={targetRef}>
//                 <div
//                   style={{
//                     height: "auto",
//                     width: "100%",
//                     border: "1px solid black",
//                     padding: 10,
//                     outline: "auto"
//                   }}
//                 >
//                   <table style={{ width: "100%" }}   >
//                     <tbody>
//                       <tr>
//                         <th>
//                           <h1 style={{ fontSize: 30, textAlign: "center", marginBottom:0}}>
//                             Asia Direct-Africa(Pty)Ltd
//                           </h1>
//                         </th>
//                       </tr>
//                       <tr>
//                         <td>
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "center",
//                               alignItems: "start"
//                             }}
//                           >
//                             <p style={{ fontSize: 11, padding: "0 10px 0 0", margin: 0 }}>
//                               Address:
//                             </p>
//                             <p style={{ fontSize: 11, textAlign: "center", margin: 0 }}>
//                               Unit-4,Villa Valenica Office Park,2 Anemoon Ave
//                               <br />
//                               Kempton Park,South Africa,1619
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "center",
//                               alignItems: "start",
//                               width: "100%"
//                             }}
//                           >
//                             <p style={{ fontSize: 11, padding: "0 10px 0 0" }}>Reg:</p>
//                             <p style={{ fontSize: 11, textAlign: "center" }}>
//                               2017/667803/07
//                             </p>
//                             <table>
//                               <tbody>
//                                 <tr>
//                                   <td>
//                                     <p style={{ fontSize: 11, padding: "0 10px 0 0" }}>
//                                       Vat:
//                                     </p>
//                                   </td>
//                                   <td>
//                                     <p style={{ fontSize: 11, textAlign: "center" }}>
//                                       4740280377
//                                     </p>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </div>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <table style={{ width: "100%" }}>
//                     <tbody>
//                       <tr>
//                         <td style={{ width: "50%" }}>
//                           <table style={{ width: "100%" }}>
//                             <tbody>
//                               <tr style={{ verticalAlign: "sub" }}>
//                                 <td>
//                                   <div style={{ width: "100%" }}>
//                                     <p
//                                       style={{
//                                         fontSize: 17,
//                                         fontWeight: 700,
//                                         marginBottom: 85
//                                       }}
//                                     >
//                                       Letter of Authority:Transporter
//                                     </p>
//                                   </div>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td>
//                                   <div style={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "40px" }}>
//                                     <img
//                                       src={image}
//                                       style={{
//                                         maxWidth: "200px",
//                                         maxHeight: "100%",
//                                         objectFit: "contain"
//                                       }}
//                                     />
//                                   </div>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </td>
//                         <td style={{ width: "50%" }}>
//                           <table style={{ width: "100%" }}>
//                             <tbody>
//                               <tr>
//                                 <td style={{ padding: 0 }}>
//                                   <div
//                                     style={{
//                                       border: "1px solid black",
//                                       width: "40%",
//                                       borderBottom: 0
//                                     }}
//                                   >
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                       Cargo Pick Up
//                                     </p>
//                                   </div>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style={{ padding: 0 }}>
//                                   <div style={{ border: "1px solid black", width: "100%" }}>
//                                     <p
//                                       style={{
//                                         marginBottom: 30,
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                       Company:{datat.cargo_pickup}
//                                     </p>
//                                     <div
//                                       style={{
//                                         border: "1px solid black",
//                                         width: "40%",
//                                         borderBottom: 0,
//                                         borderLeft: "transparent"
//                                       }}
//                                     >
//                                       <p
//                                         style={{
//                                           margin: 0,
//                                           fontSize: 10,
//                                           color: "black",
//                                           fontWeight: 400,
//                                           fontFamily: "monospace",
//                                           paddingLeft: 5
//                                         }}
//                                       >
//                                         Driver Instructions
//                                       </p>
//                                     </div>
//                                     <div
//                                       style={{
//                                         border: "1px solid black",
//                                         width: "100%",
//                                         borderBottom: 0,
//                                         borderLeft: "transparent",
//                                         marginBottom: 25
//                                       }}
//                                     >{datat.Delivery_Instruction}</div>
//                                   </div>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                           <table style={{ width: "100%", marginTop: 10 }}>
//                             <tbody>
//                               <tr>
//                                 <td style={{ padding: 0 }}>
//                                   <div
//                                     style={{
//                                       border: "1px solid black",
//                                       width: "40%",
//                                       borderBottom: 0
//                                     }}
//                                   >
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                       Consignee Details
//                                     </p>
//                                   </div>
//                                 </td>
//                               </tr>
//                               <tr>
//                                 <td style={{ padding: 0 }}>
//                                   <div style={{ border: "1px solid black", width: "100%" }}>
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                       {datat.client_name}
//                                     </p>
//                                     <p
//                                       style={{
//                                         marginBottom: 10,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                       {datat.address_1}
//                                     </p>
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                              {datat.city}
//                                     </p>
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
                                      
//                                     </p>
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                      {datat.user_country_name}
//                                     </p>
//                                     <p
//                                       style={{
//                                         margin: 0,
//                                         fontSize: 10,
//                                         fontWeight: 500,
//                                         paddingLeft: 5
//                                       }}
//                                     >
//                                      {datat.code}
//                                     </p>
//                                   </div>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <table style={{ width: "100%", marginBottom: 20 }}>
//                     <tbody>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div
//                             style={{
//                               border: "1px solid black",
//                               width: "22%",
//                               borderBottom: 0
//                             }}
//                           >
//                             <p
//                               style={{
//                                 margin: 0,
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                                 textTransform: "uppercase",
//                                 paddingLeft: 5
//                               }}
//                             >
//                               Cargo Carrier Information
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div style={{ border: "1px solid black", width: "50%" }}>
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Carrier
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Order Number/Reference
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "50%",
//                                 // backgroundColor: "red",
//                                 borderTop: 0
//                               }}>
//                               {/* //   ><p className='text-white'></p> */}
//                               <p className=''>{datat?.carrier}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <button
//                                 type="button"
//                                 style={{
//                                   backgroundColor: "lightgrey",
//                                   color: "black",
//                                   border: 0,
//                                   borderRadius: 20,
//                                   width: "100%",
//                                   margin: "3px 0px",
//                                   fontSize: 10
//                                 }}
//                               >
//                                 {'OR000' + datat?.order_id}
//                               </button>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Carrier Code
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Local Clearing Agent
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "50%",
//                                 // backgroundColor: "red",  
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{marginBottom: 0 }}>{datat.Carrier_code}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat?.local_handler}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Vessel/Voyage/Imo(LLoyads)
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 CONTAINER No.
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Master Bill of Landing
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 House Bill Of Landing
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0,

//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.vessel}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.container_no}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent",
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.master_landing_bill}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0,
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.house_bill_landing}</p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Release Type
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   marginBottom: 5,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Commodity Type
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.release_type}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "50%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat.commodity_name}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Origin
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Etd
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Destination
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Eta
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat?.collection_from_country}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {new Date(datat?.date_dispatched).toDateString("en-GB")}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat?.delivery_to_country}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {new Date(datat?.delivery_ETA).toDateString("en-GB")}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Port of loading
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Etd
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Port of discharge
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   textTransform: "uppercase",
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Eta
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "30%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat?.port_of_loading}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "20%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {new Date(datat?.date_dispatched).toDateString("en-GB")}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "25%",
//                                 borderTop: 0,
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >
//                                 {datat.post_of_discharge}
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "25%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   color: "black",
//                                   fontWeight: 400,
//                                   fontFamily: "monospace",
//                                   paddingLeft: 5,
//                                   paddingTop: 5
//                                 }}
//                               >


//                                 {new Date(datat?.delivery_ETA).toDateString("en-GB")}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <table style={{ width: "100%", marginBottom: 20 }}>
//                     <tbody>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div
//                             style={{
//                               border: "1px solid black",
//                               width: "22%",
//                               borderBottom: 0
//                             }}
//                           >
//                             <p
//                               style={{
//                                 margin: 0,
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                                 textTransform: "uppercase",
//                                 paddingLeft: 5
//                               }}
//                             >
//                               Transporter details
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div style={{ border: "1px solid black", width: "22%" }}>
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Company
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "16%"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Ports Registration
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "12%",
//                                 borderLeft: "transparent"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Driver Name
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "15%"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Driver License/Id
//                               </p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "10%"
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   marginBottom: 0,
//                                   fontSize: 10,
//                                   fontWeight: 700,
//                                   textTransform: "uppercase",
//                                   paddingLeft: 5
//                                 }}
//                               >
//                                 Vehicle Reg.
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ width: "100%", display: "flex" }}>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "22%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.local_carrier}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 borderTop: 0,
//                                 width: "16%"
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>.</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 width: "12%",
//                                 borderLeft: "transparent",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.driver_name}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "15%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.driver_license_id}</p>
//                             </div>
//                             <div
//                               style={{
//                                 border: "1px solid black",
//                                 borderLeft: "transparent",
//                                 width: "10%",
//                                 borderTop: 0
//                               }}
//                             >
//                               <p style={{ marginBottom: 0 }}>{datat?.vehicle_registration}</p>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <table style={{ width: "100%", marginBottom: 20 }}>
//                     <tbody>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div
//                             style={{
//                               border: "1px solid black",
//                               width: "22%",
//                               borderBottom: 0
//                             }}
//                           >
//                             <p
//                               style={{
//                                 margin: 0,
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                                 paddingLeft: 5
//                               }}
//                             >
//                               Remarks/Special Instructions
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={{ padding: 0 }}>
//                           <div style={{ border: "1px solid black", width: "100%" }}>
//                             <p
//                               style={{
//                                 marginBottom: 30,
//                                 fontSize: 10,
//                                 fontWeight: 500,
//                                 paddingLeft: 5
//                               }}
//                             >
//                               Asia Direct is responsible for all charged issued.
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <table style={{ width: "100%", marginBottom: 20 }}>
//                     <tbody>
//                       <tr>
//                         <td>
//                           <p style={{ marginBottom: 20, fontSize: 10, fontWeight: 500 }}>
//                             We act on behalf of the consignee.
//                           </p>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>
//                           <p style={{ marginBottom: 20, fontSize: 10, fontWeight: 500 }}>
//                             We have instructed the above-mentioned transporter to fulfill
//                             collection/delivery of the cargo as per this instruction.Should
//                             you have any queries or concerns please do not hesitate to contact
//                             as at support@asiadirect.africa or alternatively call us +27 (0)
//                             448 0733.
//                           </p>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>
//                           <p style={{ margin: 0, fontSize: 10, fontWeight: 500 }}>Regards</p>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>
//                           <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>
//                             Asia Direct-Africa
//                           </p>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }
import React, { useEffect } from 'react'
import image from '../Assests/favicon.png'
import { usePDF } from 'react-to-pdf';
import { MdDownloadForOffline } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from 'axios';
export default function Letterofauthority() {
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
  const navigate = useNavigate()
  const [data, setData] = React.useState({})
  const location = useLocation()
  console.log(location.state.data)
  const datat = (location.state.data)
  const handleclicknav =() =>{
    navigate('/Admin/order')
  }

  useEffect(() => { 
    getalldata()
  },[])
  const getalldata = async () => {
    try {
      console.log("dataget", datat.order_id);
  
      const postData = {
        orderId: datat.order_id,
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}OrderDetailsById`,
        postData
      );
  
      console.log(response.data.data[0]);
      setData(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <>
      <div className='wpWrapper'>
        <div className="container-fluid">
          <div>
            <div>
              <div className="row manageFreight">
                <div className="col-12">
                  <div className='d-flex justify-content-between align-items-center'>
                    <div className="d-flex align-items-center gap-3">
                      <ArrowBackIcon
                        onClick={handleclicknav}
                        className="text-dark"
                        style={{ cursor: "pointer" }}
                      />
                      <h4 className="freight_hd mb-0">Letter Of Authority</h4>
                    </div>
                    <MdDownloadForOffline className="fs-2" onClick={() => toPDF()} style={{ color: "#1b2245" }} />
                  </div>
                </div>
              </div>
              <section style={{marginTop:"10px"}} ref={targetRef}>
                <div
                  style={{
                    height: "auto",
                    width: "100%",
                    border: "1px solid black",
                    padding: 10,
                    outline: "auto"
                  }}
                >
                  <table style={{ width: "100%" }}   >
                    <tbody>
                      <tr>
                        <th>
                          <h1 style={{ fontSize: 30, textAlign: "center", marginBottom:0}}>
                            Asia Direct-Africa(Pty)Ltd
                          </h1>
                        </th>
                      </tr>
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "start"
                            }}
                          >
                            <p style={{ fontSize: 11, padding: "0 10px 0 0", margin: 0 }}>
                              Address:
                            </p>
                            <p style={{ fontSize: 11, textAlign: "center", margin: 0 }}>
                              Unit-4,Villa Valenica Office Park,2 Anemoon Ave
                              <br />
                              Kempton Park,South Africa,1619
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "start",
                              width: "100%"
                            }}
                          >
                            <p style={{ fontSize: 11, padding: "0 10px 0 0" }}>Reg:</p>
                            <p style={{ fontSize: 11, textAlign: "center" }}>
                              2017/667803/07
                            </p>
                            <table>
                              <tbody>
                                <tr>
                                  <td>
                                    <p style={{ fontSize: 11, padding: "0 10px 0 0" }}>
                                      Vat:
                                    </p>
                                  </td>
                                  <td>
                                    <p style={{ fontSize: 11, textAlign: "center" }}>
                                      4740280377
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "50%" }}>
                          <table style={{ width: "100%" }}>
                            <tbody>
                              <tr style={{ verticalAlign: "sub" }}>
                                <td>
                                  <div style={{ width: "100%" }}>
                                    <p
                                      style={{
                                        fontSize: 17,
                                        fontWeight: 700,
                                        marginBottom: 85
                                      }}
                                    >
                                      Letter of Authority:Transporter
                                    </p>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <div style={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: "40px" }}>
                                    <img
                                      src={image}
                                      style={{
                                        maxWidth: "200px",
                                        maxHeight: "100%",
                                        objectFit: "contain"
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style={{ width: "50%" }}>
                          <table style={{ width: "100%" }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: 0 }}>
                                  <div
                                    style={{
                                      border: "1px solid black",
                                      width: "40%",
                                      borderBottom: 0
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        paddingLeft: 5
                                      }}
                                    >
                                      Cargo Pick Up
                                    </p>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: 0 }}>
                                  <div style={{ border: "1px solid black", width: "100%" }}>
                                    <p
                                      style={{
                                        marginBottom: 30,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        paddingLeft: 5
                                      }}
                                    >
                                      Company:{data.cargo_pickup}
                                    </p>
                                    <div
                                      style={{
                                        border: "1px solid black",
                                        width: "40%",
                                        borderBottom: 0,
                                        borderLeft: "transparent"
                                      }}
                                    >
                                      <p
                                        style={{
                                          margin: 0,
                                          fontSize: 10,
                                          color: "black",
                                          fontWeight: 400,
                                          fontFamily: "monospace",
                                          paddingLeft: 5
                                        }}
                                      >
                                        Driver Instructions
                                      </p>
                                    </div>
                                    <div
                                      style={{
                                        border: "1px solid black",
                                        width: "100%",
                                        borderBottom: 0,
                                        borderLeft: "transparent",
                                        marginBottom: 25
                                      }}
                                    >{data.Delivery_Instruction}</div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <table style={{ width: "100%", marginTop: 10 }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: 0 }}>
                                  <div
                                    style={{
                                      border: "1px solid black",
                                      width: "40%",
                                      borderBottom: 0
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                                      Consignee Details
                                    </p>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: 0 }}>
                                  <div style={{ border: "1px solid black", width: "100%" }}>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        paddingLeft: 5
                                      }}
                                    >
                                      {data.client_name}
                                    </p>
                                    <p
                                      style={{
                                        marginBottom: 10,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                                      {data.address_1}
                                    </p>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                             {data.city}
                                    </p>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                                      
                                    </p>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                                     {data.user_country_name}
                                    </p>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 10,
                                        fontWeight: 500,
                                        paddingLeft: 5
                                      }}
                                    >
                                     {data.code}
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
                  <table style={{ width: "100%", marginBottom: 20 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div
                            style={{
                              border: "1px solid black",
                              width: "22%",
                              borderBottom: 0
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                paddingLeft: 5
                              }}
                            >
                              Cargo Carrier Information
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div style={{ border: "1px solid black", width: "50%" }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Carrier
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%"
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Order Number/Reference
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "50%",
                                // backgroundColor: "red",
                                borderTop: 0
                              }}>
                              {/* //   ><p className='text-white'></p> */}
                              <p className=''>{data?.carrier}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <button
                                type="button"
                                style={{
                                  backgroundColor: "lightgrey",
                                  color: "black",
                                  border: 0,
                                  borderRadius: 20,
                                  width: "100%",
                                  margin: "3px 0px",
                                  fontSize: 10
                                }}
                              >
                                {'OR000' + datat?.order_id}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Carrier Code
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Local Clearing Agent
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "50%",
                                // backgroundColor: "red",  
                                borderTop: 0
                              }}
                            >
                              <p style={{marginBottom: 0 }}>{data.Carrier_code}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data?.local_handler}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Vessel/Voyage/Imo(LLoyads)
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                CONTAINER No.
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Master Bill of Landing
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                House Bill Of Landing
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0,

                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.vessel}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.container_no}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent",
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.master_landing_bill}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0,
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.house_bill_landing}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Release Type
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  marginBottom: 5,
                                  paddingLeft: 5
                                }}
                              >
                                Commodity Type
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.release_type}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "50%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data.commodity_name}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Origin
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Etd
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Destination
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Eta
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data?.collection_from_country}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {new Date(data?.date_dispatched).toDateString("en-GB")=="01/01/197"?"":new Date(data?.date_dispatched).toDateString("en-GB")}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data?.delivery_to_country}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {new Date(data?.delivery_ETA).toDateString("en-GB")=="01/01/1970"?"":new Date(data?.delivery_ETA).toDateString("en-GB")}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Port of loading
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Etd
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Port of discharge
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  textTransform: "uppercase",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  paddingLeft: 5
                                }}
                              >
                                Eta
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "30%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data?.port_of_loading}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "20%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {new Date(data?.date_dispatched).toDateString("en-GB")=='01/01/1970'?"":new Date(data?.date_dispatched).toDateString("en-GB")}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "25%",
                                borderTop: 0,
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >
                                {data.post_of_discharge}
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "25%",
                                borderTop: 0
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  color: "black",
                                  fontWeight: 400,
                                  fontFamily: "monospace",
                                  paddingLeft: 5,
                                  paddingTop: 5
                                }}
                              >


                                {new Date(data?.delivery_ETA).toDateString("en-GB")=="01/01/1970"?"":new Date(data?.delivery_ETA).toDateString("en-GB")}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table style={{ width: "100%", marginBottom: 20 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div
                            style={{
                              border: "1px solid black",
                              width: "22%",
                              borderBottom: 0
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                paddingLeft: 5
                              }}
                            >
                              Transporter details
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div style={{ border: "1px solid black", width: "22%" }}>
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5
                                }}
                              >
                                Company
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "16%"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5
                                }}
                              >
                                Ports Registration
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "12%",
                                borderLeft: "transparent"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5
                                }}
                              >
                                Driver Name
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "15%"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5
                                }}
                              >
                                Driver License/Id
                              </p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "10%"
                              }}
                            >
                              <p
                                style={{
                                  marginBottom: 0,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  paddingLeft: 5
                                }}
                              >
                                Vehicle Reg.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ width: "100%", display: "flex" }}>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "22%",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.local_carrier}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                borderTop: 0,
                                width: "16%"
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>.</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                width: "12%",
                                borderLeft: "transparent",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.driver_name}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "15%",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.driver_license_id}</p>
                            </div>
                            <div
                              style={{
                                border: "1px solid black",
                                borderLeft: "transparent",
                                width: "10%",
                                borderTop: 0
                              }}
                            >
                              <p style={{ marginBottom: 0 }}>{data?.vehicle_registration}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table style={{ width: "100%", marginBottom: 20 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div
                            style={{
                              border: "1px solid black",
                              width: "22%",
                              borderBottom: 0
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 10,
                                fontWeight: 700,
                                paddingLeft: 5
                              }}
                            >
                              Remarks/Special Instructions
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 0 }}>
                          <div style={{ border: "1px solid black", width: "100%" }}>
                            <p
                              style={{
                                marginBottom: 30,
                                fontSize: 10,
                                fontWeight: 500,
                                paddingLeft: 5
                              }}
                            >
                              Asia Direct is responsible for all charged issued.
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table style={{ width: "100%", marginBottom: 20 }}>
                    <tbody>
                      <tr>
                        <td>
                          <p style={{ marginBottom: 20, fontSize: 10, fontWeight: 500 }}>
                            We act on behalf of the consignee.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style={{ marginBottom: 20, fontSize: 10, fontWeight: 500 }}>
                            We have instructed the above-mentioned transporter to fulfill
                            collection/delivery of the cargo as per this instruction.Should
                            you have any queries or concerns please do not hesitate to contact
                            as at support@asiadirect.africa or alternatively call us +27 (0)
                            448 0733.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 500 }}>Regards</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>
                            Asia Direct-Africa
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
