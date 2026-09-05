import { Close, Edit } from "@mui/icons-material";
import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const pageSize = 10;
const Query = () => {
  const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
  const userid = userdata?.id;
  const usertype = userdata?.user_type;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clientList, setClientList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dataDispute, setDataDispute] = useState("");
  const [modalid, setModalid] = useState(null);
  const [data, setData] = useState({});
  const [totalPage, setTotalPage] = useState(1);
  const [loader, setLoader] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [modalOpendAdd, setModalOpendAdd] = useState(false);
  const [supplierdata, setSupplierdata] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);

  const checkPermission = async () => {
    try {
      setLoader(true);
      if (!userid || !usertype) {
        setHasPermission(false);
        return;
      }
      const postdata = {
        staff_id: userid,
        route_url: "/Admin/query",
        user_type: usertype,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        postdata
      );
      if (response.data && response.data.success === true) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        toast.error("You don't have permission to access this page");
      }
    } catch (error) {
      setHasPermission(false);
      toast.error(error.response?.data?.message || "You don't have permission to access this page");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasPermission === true) {
      getclientlistr(currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, hasPermission]);

  const getclientlistr = (page = 1, search = "") => {
    const payload = {
      page: page,
      limit: pageSize,
      search: search,
    };
    setLoader(true);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}getQueries`, payload)
      .then((response) => {
        console.log(response.data.data);
        setLoader(false);
        setTotalPage(response?.data?.totalPages || 1);
        setSupplierdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response);
        setLoader(false);
        toast.error(error.response?.data?.message || "Failed to fetch queries");
      });
  };
  const handledelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const data1 = {
          query_id: id,
        };
        axios
          .post(`${process.env.REACT_APP_BASE_URL}deleteQueries`, data1)
          .then((response) => {
            getclientlistr(currentPage, searchQuery);
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
      }
    });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const filteredData = supplierdata.filter((item) => {
    console.log(item);
    return item?.name?.toLowerCase()?.includes(searchQuery.toLowerCase());
  });

  const handledit = (id) => {
    setModalid(id);
    setIsModalOpen1(true);
  };
  const closeModal1 = () => {
    setIsModalOpen1(false);
  };
  const handlechnage = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handleclickapi = async () => {
    try {
      const requestData = {
        id: modalid,
        outcome: data.outcome,
        resolution: data.resolution,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/updateQuery`,
        requestData
      );
      if (response.status === 200 && response.data.success) {
        closeModal1();
        toast.success("Query successfully updated");
      } else {
        console.log(response.data.message || "Unexpected response");
        toast.error(response.data.message || "Failed to update query");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong, please try again.");
    }
  };
  const handleclickopen = () => {
    setModalOpendAdd(true);
  };
  const handleclickclose = () => {
    setModalOpendAdd(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataDispute({ ...dataDispute, [name]: value });
  };
  useEffect(() => {
    if (!clientSearch) {
      setClientList([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchClients(clientSearch);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [clientSearch]);
  const fetchClients = async (searchText) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}client-list`,
        { search: searchText }
      );
      setClientList(response.data.data || []);
      setShowDropdown(true);
    } catch (error) {
      console.log(error);
    }
  };
  const handleclickapi1 = async () => {
    try {
      // Basic validation
      if (
        !dataDispute.name ||
        !dataDispute.subject ||
        !dataDispute.message ||
        !dataDispute.client_id
      ) {
        toast.error("Please fill all required fields");
        return;
      }
      const payload = {
        message: dataDispute.message,
        freight_no: dataDispute.phone_no,
        name: dataDispute.name,
        nature_of_Heading: dataDispute.nature_of_Heading, // dropdown
        user_id: dataDispute.client_id,
        subject: dataDispute.subject,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}addQueries`,
        payload
      );

      if (response.data.success) {
        toast.success("Query added successfully");
        setModalOpendAdd(false);
        setDataDispute({});
        setClientSearch("");
        setClientList([]);
        getclientlistr(currentPage, searchQuery);// refresh table
      } else {
        toast.error(response.data.message || "Failed to add query");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  return (
    <>
      {loader || hasPermission === null ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading...</p>
        </div>
      ) : hasPermission === false ? (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <h4 className="freight_hd">Customer Query</h4>
                <div className="line"></div>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="text-danger">You don't have permission to access this page</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">

            <div className="row manageFreight">
              <div className="col-md-12">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="">
                    <h4 className="freight_hd">Customer Query</h4>
                  </div>
                  <div className="d-flex gap-2 flex-wrap align-items-center searchManageFre">

                    <input
                      className="rounded"
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <div className="">
                      <button className="freight_hd" onClick={handleclickopen}>
                        Add Dispute
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="row manageFreight mt-4">
              <div className="col-md-12">
                {loader ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <p className="loader-text">Loading...</p>
                  </div>
                ) : (
                  <div className="table-responsive select_customer">
                    <table className="table table-striped tableICon">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Name</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Query Number</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData &&
                          filteredData.length > 0 &&
                          filteredData.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  {new Date(item.created).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </td>
                                <td>{item.name}</td>
                                <td>{item.subject}</td>
                                <td>{item.message}</td>
                                <td>{item.query_number}</td>

                                <td>
                                  <div className="d-flex gap-2">
                                    <div
                                      onClick={() => {
                                        handledit(item.id);
                                      }}
                                    >
                                      <Edit
                                        style={{
                                          color: "rgb(27 34 69)",
                                          width: "20px",
                                          cursor: "pointer",
                                        }}
                                      />
                                    </div>

                                    <div
                                      onClick={() => {
                                        handledelete(item.id);
                                      }}
                                    >
                                      <AiFillDelete
                                        style={{
                                          color: "rgb(27 34 69)",
                                          width: "20px",
                                          cursor: "pointer",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
                <Modal
                  open={modalOpendAdd}
                  onClose={handleclickclose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: {
                        xs: "95%", // mobile
                        sm: "80%", // tablet
                        md: "60%", // small laptop
                        lg: "40%", // desktop
                      },
                    }}
                  >
                    <div className="modal-header">
                      <h2 id="modal-modal-title">Dispute Query Details</h2>
                      <button
                        className="btn btn-close"
                        onClick={handleclickclose}
                      >
                        <Close />
                      </button>
                    </div>
                    <div className="newModalGap modal_scroll">
                      <div className="row">
                        <div className="col-md-6 mt-2">
                          <label class="div_label">Search Client*</label>
                          <input
                            type="text"
                            class="box1 form-control mt-0"
                            placeholder="Type client name..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            required
                          />
                          {showDropdown && clientList.length > 0 && (
                            <ul
                              className="dropdown-menu show w-100"
                              style={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                position: "absolute",
                                zIndex: 1000,
                              }}
                            >
                              {clientList.map((client) => (
                                <li
                                  key={client.id}
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setDataDispute({
                                      ...dataDispute,
                                      client_id: client.id,
                                      name: client.full_name,
                                    });
                                    setClientSearch(client.full_name);
                                    setShowDropdown(false);
                                  }}
                                >
                                  {client.full_name} ({client.email})
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="col-md-6 mt-2">
                          <label class="div_label">Subject*</label>
                          <input
                            type="text"
                            name="subject"
                            value={dataDispute.subject || ""}
                            class="box1 form-control mt-0"
                            placeholder="subject"
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mt-2">
                          <label class="div_label">Nature of Heading*</label>
                          <select
                            name="nature_of_Heading"
                            value={dataDispute.nature_of_Heading || ""}
                            className="form-select mt-0"
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select...</option>
                            <option value="freight estimation">
                              Freight Estimation
                            </option>
                            <option value="accounts">Accounts</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="customs clearing">
                              Customs Clearing
                            </option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6 mt-2">
                          <label class="div_label">Phone no</label>
                          <input
                            type="text"
                            name="phone_no"
                            value={dataDispute.phone_no || ""}
                            class="box1 form-control mt-0"
                            placeholder="Phone no"
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-12 mt-2">
                          <label class="div_label">Message*</label>
                          <textarea
                            name="message"
                            value={dataDispute.message || ""}
                            class="box1 form-control mt-0"
                            placeholder="message"
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <button
                          className="blueBtn"
                          variant="contained"
                          onClick={handleclickapi1}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </Box>
                </Modal>
                <Modal
                  open={isModalOpen1}
                  onClose={closeModal1}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: {
                        xs: "95%", // mobile
                        sm: "80%", // tablet
                        md: "60%", // small laptop
                        lg: "40%", // desktop
                      },
                    }}
                  >
                    <div className="modal-header">
                      <h2 id="modal-modal-title">Edit Query Details</h2>
                      <button className="btn btn-close" onClick={closeModal1}>
                        <Close />
                      </button>
                    </div>
                    <div className="newModalGap modal_scroll">
                      <div className="row">
                        <div className="col-md-6 mt-2">
                          <label class="div_label">Outcome*</label>
                          <select
                            name="outcome"
                            className="form-select mt-0"
                            onChange={handlechnage}
                            required
                          >
                            <option value="">Select...</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Unresolved">Unresolved</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                        <div className="col-md-12 mt-2">
                          <label class="div_label">Resolution*</label>
                          <input
                            type="text"
                            name="resolution"
                            class="box1 form-control mt-0"
                            placeholder="resolution"
                            onChange={handlechnage}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-center mt-3">
                        <button
                          className="blueBtn"
                          variant="contained"
                          onClick={handleclickapi}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </Box>
                </Modal>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="text-center d-flex justify-content-end align-items-center">
                  <button
                    disabled={currentPage === 1}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i class="fi fi-rr-angle-small-left page_icon"></i>
                  </button>
                  <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
                  <button
                    disabled={currentPage === totalPage}
                    className="bg_page"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i class="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Query;
