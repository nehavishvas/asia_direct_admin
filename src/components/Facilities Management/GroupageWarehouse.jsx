import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Box, Button, Modal } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
const pageSize = 10;

export default function GroupageWarehouse() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [countruies, setCountruies] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [pagenationData, setPagenationData] = useState(1);

  const [input, setInput] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact: "",
    country_id: "",
  });

  const [inputdata, setInputdata] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    contact: "",
    country_id: "",
  });

  // ---------------- FETCH DATA ----------------
  const getdata = async (page = 1, search = "") => {
    try {
      setLoader(true);

      const payload = {
        page: page,
        limit: pageSize,
        search: search,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getGroupageHandlers`,
        payload
      );

      setData(response.data.data);
      setPagenationData(response.data);
    } catch (error) {
      toast.error("Error fetching suppliers");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getdata(currentPage, searchQuery);
  }, []);

  const totalPages = Math.ceil(pagenationData.total / pagenationData.limit);

  // ---------------- HANDLE INPUT (ADD) ----------------
  const handlechange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- ADD SUPPLIER ----------------
  const handleAddSupplier = () => {
    const data = {
      id: input.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      contact: input.contact,
      country_id: input.country_id,
    };

    axios
      .post(`${process.env.REACT_APP_BASE_URL}addGroupageHandler`, data)
      .then((res) => {
        toast.success(res.data.message || "Add Groupage Warehouse successfully!");
        setIsModalOpen(false);
        getdata();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data?.message || "Invalid input!");
        } else if (error.request) {
          toast.error("Network error! Server not responding.");
        } else {
          toast.error("Unexpected error: " + error.message);
        }
      });
  };

  // ---------------- DELETE SUPPLIER ----------------
  const handledelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(`${process.env.REACT_APP_BASE_URL}deleteGroupageHandler`, {
            id: id,
          })
          .then((res) => {
            toast.success(res.data.message);
            getdata();
          })
          .catch((err) => {
            toast.error(err.response?.data?.message || "Delete failed!");
          });
      }
    });
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openModal2 = (id) => {
    const usr = data.find((p) => p.id === id);
    console.log(id, usr);
    if (usr) {
      setInputdata({
        id: usr.id,
        email: usr.email,
        name: usr.name,
        phone: usr.phone,
        address: usr.address,
        country_id: usr.country_id,
      });
    }
    setIsModalOpen2(true);
  };

  // ---------------- HANDLE UPDATE INPUT ----------------
  const handleupdateapi = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile") {
      setInputdata((prev) => ({ ...prev, profile: files[0] }));
    } else {
      setInputdata((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---------------- UPDATE SUPPLIER ----------------
  const postData1234 = () => {
    const formdata = {
      id: inputdata.id,
      email: inputdata.email,
      name: inputdata.name,
      phone: inputdata.phone,
      address: inputdata.address,
      country_id: inputdata.country_id
    }
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}updateGroupageHandler`,
        formdata
      )
      .then((res) => {
        toast.success(res.data.message);
        setIsModalOpen2(false);
        getdata();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Update failed!");
      });
  };

  // ---------------- GET COUNTRIES ----------------
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountruies(response.data.data);
      })
      .catch(() => {
        toast.error("Country fetch failed");
      });
  };

  useEffect(() => {
    getcountry();
  }, []);
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    getdata(1, value);
  };
  return (
    <>
      <>
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="d-flex justify-content-between my-3">
              <h4>Groupage Warehouse Agent</h4>
              <div className="d-flex searchManageFre">
                <input
                  type="text"
                  placeholder="Search"
                  className="px-2 py-1"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <button
                  className="btn btn-primary ms-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Groupage Warehouse
                </button>
              </div>
            </div>
            {/* ---------------- TABLE ---------------- */}
            {loader ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Sr.No.</th>
                      <th> Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Country</th>
                      {/* <th>Profile</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{item.address}</td>
                        <td>{item.country_name}</td>
                        <td>
                          <FaEdit
                            onClick={() => openModal2(item.id)}
                            style={{
                              color: "#1b2245",
                              marginRight: "10px",
                              cursor: "pointer",
                            }}
                          />
                          <AiFillDelete
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => handledelete(item.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* PAGINATION */}
                <div className="d-flex justify-content-end align-items-end">
                  <button
                    disabled={currentPage === 1}
                    className="bg_page"
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      getdata(currentPage - 1, searchQuery);
                    }}
                  >
                    <i class="fi fi-rr-angle-small-left page_icon"></i>
                  </button>

                  <span className="mx-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    className="bg_page"
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      getdata(currentPage + 1, searchQuery);
                    }}
                  >
                    <i class="fi fi-rr-angle-small-right page_icon"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ---------------- ADD SUPPLIER MODAL ---------------- */}
        {isModalOpen && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <div className="custom-modal-header">
                <h5>Add Groupage Warehouse</h5>
                <button
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="newModalGap  noFormaControl">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control mb-2"
                  name="email"
                  placeholder="test@example.com"
                  onChange={handlechange}
                />
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  name="name"
                  placeholder="Name"
                  onChange={handlechange}
                />
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  name="phone"
                  placeholder="123456789"
                  onChange={handlechange}
                />
                <label>Country</label>
                <select
                  name="country_id"
                  onChange={handlechange}
                  className="form-control mb-2"
                >
                  <option>Select</option>
                  {countruies &&
                    countruies.length > 0 &&
                    countruies.map((item, index) => {
                      return (
                        <>
                          <option key={index} value={item.id}>
                            {item.name}
                          </option>
                        </>
                      );
                    })}
                </select>
                <label>Address</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  name="address"
                  onChange={handlechange}
                />
              </div>
              <div className="custom-modal-footer">
                <button variant="contained" className="blueBtn" onClick={handleAddSupplier}>
                  Add Groupage Warehouse
                </button>
              </div>
            </div>
          </div>
        )}
        <Modal open={isModalOpen2} onClose={() => setIsModalOpen2(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              width: "30%",
            }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Edit Groupage Warehouse</h2>
              <button
                className="btn-close"
                onClick={() => setIsModalOpen2(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="newModalGap  noFormaControl">

              <label>Email</label>
              <input
                type="email"
                className="form-control mb-2"
                name="email"
                value={inputdata.email}
                onChange={handleupdateapi}
              />
              <label>Name</label>
              <input
                type="text"
                className="form-control mb-2"
                name="name"
                value={inputdata.name}
                onChange={handleupdateapi}
              />
              <label>Phone</label>
              <input
                type="text"
                className="form-control mb-2"
                name="phone"
                value={inputdata.phone}
                onChange={handleupdateapi}
              />
              <label>Country of Origin</label>
              <select
                name="country_id"
                onChange={handleupdateapi}
                className="form-control mb-2"
                value={inputdata.country_id}
              >
                <option>Select</option>
                {countruies &&
                  countruies.length > 0 &&
                  countruies.map((item, index) => {
                    return (
                      <>
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      </>
                    );
                  })}
              </select>
              <label>address</label>
              <input
                type="address"
                className="form-control mb-2"
                value="address"
                name="inputdata.address"
                onChange={handleupdateapi}
              />
              <div className="d-flex justify-content-center  mt-3">
                <button variant="contained" className="blueBtn" onClick={postData1234}>
                  Update Groupage Warehouse
                </button>
              </div>

            </div>
          </Box>
        </Modal>
        
      </>
    </>
  );
}
