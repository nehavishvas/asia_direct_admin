import { Close, Edit } from "@mui/icons-material";
import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const pageSize = 10;
const Query = () => {
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
  useEffect(() => {
    getclientlistr(currentPage, searchQuery);
  }, [currentPage, searchQuery]);
  const getclientlistr = (page = 1, search = "") => {
    const payload = {
      page: page,
      limit: pageSize,
      search: search,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}getQueries`, payload)
      .then((response) => {
        console.log(response.data.data);
        // setLoader(false);
        setTotalPage(response?.data?.totalPages || 1);
        setSupplierdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response);
        // setLoader(false);
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
      <div className="wpWrapper">
        <div className="container-fluid">

          <div className="row manageFreight">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="">
                  <h4 className="freight_hd">Customer Query</h4>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">

                  <input
                    className="py-1 rounded ps-1"
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
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive mt-2">
                <table className="table mt-4 table-striped tableICon">
                  <thead>
                    <tr>
                      <th scope="col">Freight Number</th>
                      <th scope="col">Dispute ID</th>
                      <th scope="col">Name</th>
                      <th className="col-2" scope="col-2">
                        Nature of Heading
                      </th>
                      <th scope="col">Message</th>
                      <th scope="col">Subject</th>
                      <th scope="col">Outcome</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ border: "none" }}>
                    {supplierdata &&
                      supplierdata.length > 0 &&
                      supplierdata.map((item, index) => {
                        return (
                          <>
                            <tr className="border-bottom" key={index}>
                              <td>{item.freight_no}</td>
                              <td>{item.Dispute_ID}</td>
                              <td>{item?.name}</td>
                              <td className="col-2">
                                {item?.nature_of_Heading}{" "}
                              </td>
                              <td>{item?.message}</td>
                              <td>
                                <p>{item.subject}</p>
                              </td>
                              <td>
                                <p>{item.outcome}</p>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="action_btn1">
                                    <AiFillDelete
                                      className="text-danger"
                                      onClick={() => {
                                        handledelete(item.id);
                                      }}
                                    />
                                  </div>
                                  <div className="action_btn1">
                                    <Edit
                                      style={{ cursor: "pointer" }}

                                      onClick={() => {
                                        handledit(item.id);
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })}
                  </tbody>
                </table>
                <Modal
                  open={modalOpendAdd}
                  onClose={handleclickclose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                  className="newModal"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      width: {
                        xs: "95%",
                        sm: "80%",
                        md: "60%",
                        lg: "40%",
                      },

                    }}
                  >
                    <div className="modal-header">
                      <h2>
                        <h2 id="modal-modal-title"> Add Query</h2>
                      </h2>
                      <button
                        className="btn btn-close"
                        onClick={handleclickclose}
                      >
                        <Close />{" "}
                      </button>
                    </div>
                    <div className="newModalGap   noFormaControl">
                      <div className="col-md-12">
                        <label className="div_label">
                          Name <span className="redStar">*</span>
                        </label>
                        <input
                          type="text"
                          className="box1 form-control mb-3"
                          name="name"
                          placeholder="Name"
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="div_label">
                          Freight Number <span className="redStar">*</span>
                        </label>
                        <input
                          type="text"
                          className="box1 form-control mb-3"
                          name="phone_no"
                          placeholder="Freight Number"
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-12 position-relative">
                        <label className="div_label">
                          Client <span className="redStar">*</span>
                        </label>

                        <input
                          type="text"
                          className="form-control mb-3"
                          placeholder="Search client by name"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          onFocus={() => clientList.length && setShowDropdown(true)}
                        />

                        {showDropdown && clientList.length > 0 && (
                          <ul
                            className="list-group position-absolute w-100"
                            style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                          >
                            {clientList.map((item, index) => (
                              <li
                                key={index}
                                className="list-group-item list-group-item-action"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setClientSearch(item.full_name);
                                  setDataDispute({
                                    ...dataDispute,
                                    client_id: item.id,
                                    client_name: item.full_name,
                                  });
                                  setShowDropdown(false);
                                }}
                              >
                                {item.full_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>


                      <div className="col-md-12">
                        <label className="div_label">
                          Nature of Heading <span className="redStar">*</span>
                        </label>
                        <select
                          name="nature_of_Heading"
                          className="box1 form-control mb-3"
                          onChange={handleChange}
                          value={dataDispute.nature_of_Heading}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="Invoicing">Invoicing</option>
                          <option value="Service Support">
                            Service Support
                          </option>
                          <option value="Pricing">Pricing</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="div_label">
                          Subject <span className="redStar">*</span>
                        </label>
                        <input
                          type="text"
                          name="subject"
                          className="box1 form-control mb-3"
                          placeholder="Subject"
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="div_label">
                          Message <span className="redStar">*</span>
                        </label>
                        <textarea
                          className="box2 form-control mb-3"
                          name="message"
                          placeholder="Write your message here..."
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                      <div className="d-flex justify-content-center">
                        <button
                          onClick={handleclickapi1}
                          className=" blueBtn"
                        >
                          Add Query
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
                  className="newModal"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      bgcolor: "background.paper",
                      boxShadow: 24,
                      height: "220px",
                      width: {
                        xs: "95%",   // mobile
                        sm: "80%",   // tablet
                        md: "60%",   // small laptop
                        lg: "40%",   // desktop
                      },

                    }}
                  >
                    <div className="modal-header">
                      <h2>
                        <h2 id="modal-modal-title">Update Request</h2>
                      </h2>
                      <button className="btn btn-close" onClick={closeModal1}>
                        <Close />{" "}
                      </button>
                    </div>
                    <div className="newModalGap   noFormaControl">
                      <div className="row">
                        <div className="col-md-12">
                          <label class="div_label">Outcome </label>
                          <select
                            name="outcome"
                            class="box1"
                            placeholder="Outcome"
                            onChange={handlechnage}
                            required
                          >
                            <option>Select...</option>
                            <option value="Resolved">Resolved</option>
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
    </>
  );
};
export default Query;
