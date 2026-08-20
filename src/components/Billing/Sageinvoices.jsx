// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Box, Button, Modal } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import CloseIcon from "@mui/icons-material/Close";

// const pageSize = 10;
// export default function Sageinvoices() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [data, setData] = useState([]);
//   const [files, setFiles] = useState(null);
//   const [loader, setLoader] = useState(false);
//   const [sageid, setSageid] = useState(null);
//   const [namess, setNamess] = useState({
//     search: "",
//   });
//   const [pagenation, setPagenation] = useState(1);
//   const [openmodal, setOpenmodal] = useState(false);
//   const navigate = useNavigate();
//   const totalPage = pagenation?.totalPages;
//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = startIndex + pageSize;
//   const currentdata = data.slice(startIndex, endIndex);
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     getwarehouse(page);
//   };
//   const userid = JSON.parse(localStorage.getItem("data123"))?.id;
//   const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
//   useEffect(() => {
//     getwarehouse();
//   }, []);
//   const getwarehouse = async (page) => {
//     console.log(page);
//     try {
//       setLoader(true);
//       console.log("Checking permissions...");
//       const datapost = {
//         staff_id: userid,
//         route_url: "/Admin/sageinvoice",
//         user_type: usertype,
//       };
//       const permission = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}CheckPermission`,
//         datapost
//       );
//       if (permission.data.success) {
//         try {
//           const response = await axios.get(
//             `${process.env.REACT_APP_BASE_URL}GetSageInvoiceList?page=${currentPage}`
//           );
//           console.log(response.data);
//           setPagenation(response.data.pagination);
//           setData(response.data.data);
//         } catch (error) {
//           toast.error(
//             error.response?.data?.message ||
//               "Something went wrong while fetching data"
//           );
//         }
//       } else {
//         toast.error("You don’t have permission to access this page");
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//           "Something went wrong while checking permissions"
//       );
//     } finally {
//       setLoader(false);
//     }
//   };
//   const handleclick = (item) => {
//     console.log(item.id);
//     setSageid(item.id);
//     setOpenmodal(true);
//   };
//   const handleCloseModal = () => setOpenmodal(false);
//   const postData123 = () => {
//     const formdtaa = new FormData();
//     formdtaa.append("sage_invoice_id", sageid);
//     if (!files) {
//     } else {
//       formdtaa.append("document", files);
//       axios
//         .post(`${process.env.REACT_APP_BASE_URL}UpdateSageInvoiceDoc`, formdtaa)
//         .then((response) => {
//           if (response.data.success === true) {
//             toast.success(response.data.message);
//             handleCloseModal();
//           }
//         })
//         .catch((error) => {
//           toast.error(error.response.data.message);
//         });
//     }
//   };
//   const handlefilechange = (e) => {
//     setFiles(e.target.files[0]);
//   };
//   const handlechange = (e) => {
//     const { name, value } = e.target;
//     setNamess({ ...namess, [name]: value });
//   };
//   const handekgjfkdg = async () => {
//     if (!namess.search) {
//     }
//     try {
//       setLoader(true);
//       console.log("Checking permissions...");
//       const datapost = {
//         staff_id: userid,
//         route_url: "/Admin/sageinvoice",
//         user_type: usertype,
//       };
//       const permission = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}CheckPermission`,
//         datapost
//       );
//       if (permission.data.success) {
//         try {
//           const response = await axios.get(
//             `${process.env.REACT_APP_BASE_URL}GetSageInvoiceList?search=${namess.search}`
//           );
//           console.log(response.data);
//           setNamess({ search: "" });
//           setPagenation(response.data.pagination);
//           setData(response.data.data);
//         } catch (error) {
//           toast.error(
//             error.response?.data?.message ||
//               "Something went wrong while fetching data"
//           );
//         }
//       } else {
//         toast.error("You don’t have permission to access this page");
//       }
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message ||
//           "Something went wrong while checking permissions"
//       );
//     } finally {
//       setLoader(false);
//     }
//   };
//   return (
//     <>
//       {loader ? (
//         <div class="loader-container">
//           <div class="loader"></div>
//           <p class="loader-text">Updating... SageInvoice may take some time</p>
//         </div>
//       ) : (
//         <div className="wpWrapper">
//           <div className="container-fluid">
//             <div className="">
//               <div className="card-body">
//                 <div className="row  manageFreight">
//                   <div className="col-12">
//                     <div className="d-flex  justify-content-between">
//                       <div>
//                         <h4 className="freight_hd">Sage Invoice</h4>
//                       </div>
//                       <div className="d-flex">
//                         <div>
//                           <input
//                             name="search"
//                             className="mx-2 rounded px-2 py-1"
//                             placeholder="Search... "
//                             onChange={handlechange}
//                           ></input>
//                         </div>
//                         <div>
//                           <button onClick={handekgjfkdg}>Search</button>
//                         </div>
//                       </div>
//                     </div>
//                     <div></div>
//                     <div className="d-flex justify-content-end align-items-center"></div>
//                   </div>
//                 </div>
//                 <div className="table-responsive mt-4">
//                   <table className="table table-striped tableICon">
//                     <thead>
//                       <tr>
//                         <th>Document Number</th>
//                         <th>Customer Name</th>
//                         <th>Customer Ref.</th>
//                         <th>Date</th>
//                         <th>Total</th>
//                         <th>Upload</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {data &&
//                         data.length > 0 &&
//                         data.map((item, index) => {
//                           console.log(item);
//                           return (
//                             <>
//                               <tr key={item.id}>
//                                 <td>{item.document_number}</td>
//                                 <td>{item.customer_name}</td>
//                                 <td>{item.customer_ref}</td>
//                                 <td>
//                                   {new Date(item.date).toLocaleDateString(
//                                     "EN-gb"
//                                   )}
//                                 </td>
//                                 <td>{item.total}</td>
//                                 <td>
//                                   <button
//                                     className="btn btn-secondary"
//                                     onClick={() => {
//                                       handleclick(item);
//                                     }}
//                                   >
//                                     Upload
//                                   </button>
//                                 </td>
//                               </tr>
//                             </>
//                           );
//                         })}
//                     </tbody>
//                   </table>
//                   <div className="text-center d-flex justify-content-end align-items-center">
//                     <button
//                       disabled={currentPage === 1}
//                       className="bg_page"
//                       onClick={() => handlePageChange(currentPage - 1)}
//                     >
//                       <i class="fi fi-rr-angle-small-left page_icon"></i>
//                     </button>
//                     <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
//                     <button
//                       disabled={currentPage === totalPage}
//                       className="bg_page"
//                       onClick={() => handlePageChange(currentPage + 1)}
//                     >
//                       <i class="fi fi-rr-angle-small-right page_icon"></i>
//                     </button>
//                   </div>
//                   
//                 </div>
//                 <Modal
//                   open={openmodal}
//                   onClose={handleCloseModal}
//                   aria-labelledby="modal-modal-title"
//                   aria-describedby="modal-modal-description"
//                 >
//                   <Box
//                     sx={{
//                       position: "absolute",
//                       top: "50%",
//                       left: "50%",
//                       transform: "translate(-50%, -50%)",
//                     }}
//                   >
//                     <div className="modal-header">
//                       <h2>
//                         <h2 id="modal-modal-title">Filter</h2>
//                       </h2>
//                       <button
//                         className="btn btn-close"
//                         onClick={handleCloseModal}
//                       >
//                         <CloseIcon />
//                       </button>
//                     </div>
//                     <div className="newModalGap">
//                       <label className="ware_label">Attach Sage Document</label>
//                       <div>
//                         <input
//                           type="file"
//                           onChange={handlefilechange}
//                           className="border py-2 px-2 rounded w-100"
//                         ></input>
//                       </div>

//                       <Button
//                         variant="contained"
//                         onClick={postData123}
//                         className="mt-3 mb-2"
//                       >
//                         Apply
//                       </Button>
//                     </div>
//                   </Box>
//                 </Modal>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Box, Button, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AiFillDelete } from "react-icons/ai";
import Swal from "sweetalert2";

const pageSize = 10;

export default function Sageinvoices() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [files, setFiles] = useState(null);
  const [loader, setLoader] = useState(false);
  const [sageid, setSageid] = useState(null);
  const [namess, setNamess] = useState({
    search: "",
  });
  const [activeTab, setActiveTab] = useState("general");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countruies, setCountruies] = useState({});
  const [pagenation, setPagenation] = useState({});
  const [openmodal, setOpenmodal] = useState(false);
  const [openAdModal, setOpenAdModal] = useState(false);
  const [adDocumentUrl, setAdDocumentUrl] = useState("");
  const totalPage = pagenation?.totalPages || 1;
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  useEffect(() => {
    getwarehouse();
  }, [currentPage, activeTab, selectedCountry]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // const getwarehouse = async () => {
  //   try {
  //     setLoader(true);

  //     const datapost = {
  //       staff_id: userid,
  //       route_url: "/Admin/sageinvoice",
  //       user_type: usertype,
  //     };

  //     const permission = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}CheckPermission`,
  //       datapost,
  //     );

  //     if (permission.data.success) {
  //       try {
  //         let url = `${process.env.REACT_APP_BASE_URL}GetSageInvoiceList?page=${currentPage}`;

  //         // TAB PARAM
  //         if (activeTab !== "general") {
  //           url += `&country=${activeTab}`;
  //         }

  //         // DROPDOWN COUNTRY
  //         if (selectedCountry) {
  //           url += `&filter_country=${selectedCountry}`;
  //         }

  //         // SEARCH
  //         if (namess.search) {
  //           url += `&search=${namess.search}`;
  //         }

  //         const response = await axios.get(url);

  //         setPagenation(response.data.pagination);
  //         setData(response.data.data);
  //       } catch (error) {
  //         toast.error(
  //           error.response?.data?.message ||
  //             "Something went wrong while fetching data",
  //         );
  //       }
  //     } else {
  //       toast.error("You don’t have permission to access this page");
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error.response?.data?.message ||
  //         "Something went wrong while checking permissions",
  //     );
  //   } finally {
  //     setLoader(false);
  //   }
  // };
  const getwarehouse = async () => {
    try {
      setLoader(true);

      const datapost = {
        staff_id: userid,
        route_url: "/Admin/sageinvoice",
        user_type: usertype,
      };

      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );

      if (permission.data.success) {
        try {
          let url = "";

          // ALL TAB
          if (activeTab === "general") {
            url = `${process.env.REACT_APP_BASE_URL}GetSageInvoiceList?page=${currentPage}`;

            // SEARCH
            if (namess.search) {
              url += `&search=${namess.search}`;
            }

            // COUNTRY FILTER DROPDOWN
            if (selectedCountry) {
              url += `&filter_country=${selectedCountry}`;
            }
          } else {
            // REGION TAB API
            url = `${process.env.REACT_APP_BASE_URL}GetSageInvoiceListByRegion?page=${currentPage}&limit=${pageSize}&region=${activeTab}`;

            // SEARCH
            if (namess.search) {
              url += `&search=${namess.search}`;
            }
          }

          const response = await axios.get(url);

          setPagenation(response.data.pagination);
          setData(response.data.data);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
            "Something went wrong while fetching data",
          );
        }
      } else {
        toast.error("You don’t have permission to access this page");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Something went wrong while checking permissions",
      );
    } finally {
      setLoader(false);
    }
  };

  const deletewarehouse = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-sage-invoice/${id}`)
          .then((response) => {
            Swal.fire("Deleted!", response.data.message, "success");
            getwarehouse();
          })
          .catch((error) => {
            Swal.fire("Error!", "Something went wrong", "error");
            console.log(error.response?.data);
          });
      }
    });
  };

  const handleclick = (item) => {
    setSageid(item.id);
    setOpenmodal(true);
  };

  const handleCloseModal = () => setOpenmodal(false);

  const postData123 = () => {
    const formdtaa = new FormData();

    formdtaa.append("sage_invoice_id", sageid);

    if (files) {
      formdtaa.append("document", files);

      axios
        .post(`${process.env.REACT_APP_BASE_URL}UpdateSageInvoiceDoc`, formdtaa)
        .then((response) => {
          if (response.data.success === true) {
            toast.success(response.data.message);
            handleCloseModal();
          }
        })
        .catch((error) => {
          toast.error(error.response?.data?.message);
        });
    } else {
      toast.error("Please select file");
    }
  };

  const handlefilechange = (e) => {
    setFiles(e.target.files[0]);
  };

  const handlechange = (e) => {
    const { name, value } = e.target;

    setNamess({ ...namess, [name]: value });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    getwarehouse();
  };

  const countrypushdata = async (id) => {
    console.log(id);
    try {
      const countryChangedata = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetSageInvoiceList?country=${id}`,
      );
      setData(countryChangedata.data.data);
      getwarehouse();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getcountry();
  }, []);
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountruies(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.data);
      });
  };

  return (
    <>
      {loader ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">
            Updating... SageInvoice may take some time
          </p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="card-body">
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-3 manageFreight">
                <h4 className="freight_hd">Sage Invoice</h4>

                <div className="d-flex align-items-center gap-2 searchManageFre">
                  <input
                    name="search"
                    value={namess.search}
                    className="form-control"
                    placeholder="Search..."
                    onChange={handlechange}
                  />

                  <button className="blueBtn" onClick={handleSearch}>
                    Search
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2 mb-4 flex-wrap">
                <button
                  className={`btn ${activeTab === "general"
                    ? "btn-primary"
                    : "btn-outline-primary"
                    }`}
                  onClick={() => {
                    setActiveTab("general");
                    setCurrentPage(1);
                  }}
                >
                  All
                </button>
                <button
                  className={`btn ${activeTab === "South Africa"
                    ? "btn-primary"
                    : "btn-outline-primary"
                    }`}
                  onClick={() => {
                    setActiveTab("South Africa");
                    setCurrentPage(1);
                  }}
                >
                  South Africa
                </button>
                <button
                  className={`btn ${activeTab === "Zimbabwe"
                    ? "btn-primary"
                    : "btn-outline-primary"
                    }`}
                  onClick={() => {
                    setActiveTab("Zimbabwe");
                    setCurrentPage(1);
                  }}
                >
                  Zimbabwe
                </button>
                <button
                  className={`btn ${activeTab === "Zambia"
                    ? "btn-primary"
                    : "btn-outline-primary"
                    }`}
                  onClick={() => {
                    setActiveTab("Zambia");
                    setCurrentPage(1);
                  }}
                >
                  Zambia
                </button>
              </div>
              {/* TABLE */}
              <div className="table-responsive mt-4">
                <table className="table table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Document Number</th>
                      <th>Customer Name</th>
                      <th>Customer Ref.</th>
                      <th>Date</th>
                      <th>Total</th>
                      {/* {activeTab === "general" && <th>Country</th>} */}
                      <th>Upload</th>
                      <th>Invoice (AD)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data &&
                      data.length > 0 &&
                      data.map((item) => {
                        return (
                          <tr key={item.id}>
                            <td>{item.document_number}</td>
                            <td>{item.customer_name}</td>
                            <td>{item.customer_ref}</td>
                            <td>
                              {new Date(item.date).toLocaleDateString("EN-gb")}
                            </td>
                            <td>{item.total}</td>
                            <td>
                              <button
                                className="tableBtn"
                                onClick={() => {
                                  handleclick(item);
                                }}
                              >
                                Upload
                              </button>
                            </td>
                             <td className="text-center">
                              {item.freight_invoice_docs?.find((doc) => doc.document_name === "Invoice (AD)") ? (
                                <i
                                  className="fi fi-rr-document"
                                  style={{ cursor: "pointer", fontSize: "1.2rem", color: "#007bff" }}
                                  title="View AD Document"
                                  onClick={() => {
                                    const doc = item.freight_invoice_docs.find((d) => d.document_name === "Invoice (AD)");
                                    setAdDocumentUrl(`${process.env.REACT_APP_BASE_URLdocument}${doc.document}`);
                                    setOpenAdModal(true);
                                  }}
                                ></i>
                              ) : (
                                "-"
                              )}
                             </td>

                            <td>
                              <AiFillDelete
                                onClick={() => {
                                  deletewarehouse(item.id);
                                }}
                                style={{
                                  color: "rgb(212, 69, 25)",
                                  marginRight: "10px",
                                  width: "20px",
                                  height: "15px",
                                  cursor: "pointer",
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                <div className="text-center d-flex justify-content-end align-items-center">
                  <button
                    disabled={currentPage === 1}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i className="fi fi-rr-angle-small-left page_icon"></i>
                  </button>
                  <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
                  <button
                    disabled={currentPage === totalPage}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
                
              </div>
              <Modal
                open={openmodal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="modal-header">
                    <h2>
                      <h2 id="modal-modal-title">Filter</h2>
                    </h2>
                    <button
                      className="btn btn-close"
                      onClick={handleCloseModal}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="newModalGap">
                    <label className="ware_label">Attach Sage Document</label>
                    <div>
                      <input
                        type="file"
                        onChange={handlefilechange}
                        className="border py-2 px-2 rounded w-100"
                      ></input>
                    </div>
                    <div className="text-center mt-3">
                      <button
                        variant="contained"
                        onClick={postData123}
                        className="blueBtn"
                      >
                        Apply
                      </button>

                    </div>
                  </div>
                </Box>
              </Modal>
              <Modal open={openAdModal} onClose={() => setOpenAdModal(false)}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80%",
                    height: "80vh",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <h5>AD Document</h5>
                    <button
                      onClick={() => setOpenAdModal(false)}
                      className="btn btn-danger btn-sm"
                    >
                      Close
                    </button>
                  </div>
                  <iframe
                    src={adDocumentUrl}
                    width="100%"
                    height="100%"
                    title="AD Document"
                    style={{ border: "none", flexGrow: 1 }}
                  ></iframe>
                </Box>
              </Modal>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
