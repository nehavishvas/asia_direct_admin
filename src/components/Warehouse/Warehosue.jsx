import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Box, Button, Modal } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
const pageSize = 10;

export default function Warehouse() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [countries, setcountries] = useState([]);
  const [inputdata, setInputdata] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [inputdtata, setInputdtata] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const totalPage = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentdata = data.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const openModal1 = () => {
    setIsModalOpen1(true);
  };
  const closeModal1 = () => {
    setIsModalOpen1(false);
  };

  useEffect(() => {
    supplierlist();
  }, []);

  const supplierlist = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getSupplierList`,
      );
      setSupplierData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const useirid = JSON.parse(localStorage.getItem("data123"))
  const postData1 = () => {
    if (!validateAddWarehouse()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }
    const data = {
      warehouse_number: inputdata.mobile_number,
      warehouse_name: inputdata.warehouse_name,
      company_name: inputdata.company_name,
      warehouse_address: inputdata.warehouse_address,
      town: inputdata.town,
      country: inputdata.country,
      email: inputdata.email,
      contact_person: inputdata.contact_person,
      mobile_number: inputdata.mobile_number,
      user_id: useirid.id,

      // ✅ FIXED
      supplier_id:
        inputdata.Warehouse_For === "Supplier" ? inputdata.supplier_name : "",

      user_type: inputdata.Warehouse_For === "Supplier" ? "2" : "1",
    };

    axios
      .post(`${process.env.REACT_APP_BASE_URL}addWarehouse`, data)
      .then((response) => {
        getwarehouse();
        toast.success(response.data.message);
        closeModal1();
        setInputdata({});
        setValidationErrors({});
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  useEffect(() => {
    getcountry();
  }, []);
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setcountries(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.data);
      });
  };
  useEffect(() => {
    getwarehouse();
  }, []);
  const getwarehouse = () => {
    setLoader(true);
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getWarehouse`)
      .then((response) => {
        setLoader(false);
        setData(response.data.data);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error.response.data.message);
      });
  };
  const postData = () => {
    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      console.log("asdfhdfh");
      axios
        .post(`${process.env.REACT_APP_BASE_URL}UploadExcelWarehouse`, formdata)
        .then((response) => {
          if (response.data.success === true) {
            toast.success(response.data.message);
            closeModal1();
          }
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } else {
      console.log("No file selected");
    }
  };
  const openModal2 = (id) => {
    console.log(id)
    setInputdtata(id)
    const getuser = data.find((item) => item.warehouse_id === id);
    console.log(getuser)
    setInputdata({
      warehouse_id: getuser.warehouse_id, // ✅ correct
      Warehouse_For: getuser.Warehouse_for,
      supplier_name: getuser.supplier_id,
      contact_person: getuser.contact_person,
      country: getuser.country_id,
      email: getuser.email,
      mobile_number: getuser.mobile_number,
      town: getuser.town,
      warehouse_address: getuser.warehouse_address,
      warehouse_name: getuser.warehouse_name,
      warehouse_number: getuser.warehouse_number,
    });
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  };
  const handleFileChange1 = (e) => {
    const { name, value } = e.target;
    setInputdata({ ...inputdata, [name]: value });
  };
  const apiupdatepost = () => {
    const dataupdate = {
      Warehouse_for: inputdata.Warehouse_For,
      supplier_id:
        inputdata.Warehouse_For === "Supplier"
          ? inputdata.supplier_name
          : "",
      warehouse_id: inputdtata, // ✅ now correct
      warehouse_number: inputdata.warehouse_number,
      warehouse_name: inputdata.warehouse_name,
      warehouse_address: inputdata.warehouse_address,
      town: inputdata.town,
      company_name: inputdata.company_name,
      country: inputdata.country,
      email: inputdata.email,
      contact_person: inputdata.contact_person,
      mobile_number: inputdata.mobile_number,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}editWarehouse`, dataupdate)
      .then((response) => {
        closeModal2();
        toast.success("Warehouse Updated Successfully");
        getwarehouse();
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const deletewarehouse = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this warehouse!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const datadelete = {
          warehouse_id: id,
        };

        axios
          .post(
            `${process.env.REACT_APP_BASE_URL}DeleteWarehouse`,
            datadelete
          )
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

  const validateAddWarehouse = () => {
    let errors = {};

    if (!inputdata.warehouse_name || inputdata.warehouse_name.trim() === "") {
      errors.warehouse_name = "Warehouse Name is required";
    }

    if (
      !inputdata.warehouse_address ||
      inputdata.warehouse_address.trim() === ""
    ) {
      errors.warehouse_address = "Warehouse Address is required";
    }

    if (!inputdata.country || inputdata.country === "Select Country....") {
      errors.country = "Country is required";
    }

    if (
      !inputdata.company_name ||
      inputdata.company_name === "Select Country...."
    ) {
      errors.company_name = "Company Name is required";
    }

    if (!inputdata.town || inputdata.town.trim() === "") {
      errors.town = "Town is required";
    }

    if (!inputdata.mobile_number || inputdata.mobile_number.trim() === "") {
      errors.mobile_number = "Mobile Number is required";
    } else if (!/^\d{10}$/.test(inputdata.mobile_number)) {
      errors.mobile_number = "Mobile Number must be 10 digits";
    }

    if (!inputdata.contact_person || inputdata.contact_person.trim() === "") {
      errors.contact_person = "Contact person is required";
    }

    if (!inputdata.email || inputdata.email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(inputdata.email)) {
      errors.email = "Email is invalid";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <>
      {loader ? (
        <div class="loader-container">
          <div class="loader"></div>
          <p class="loader-text">Updating... This may take some time</p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div>
              <div>
                <div className="row  manageFreight">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h4 className="freight_hd">Warehouse List</h4>
                      </div>
                      <div className="d-flex justify-content-end align-items-center">
                        <div className="mx-2">
                          <button onClick={openModal1}>Add Warehouse</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="table-responsive mt-3">
                  <table className="table table-striped tableICon">
                    <thead>
                      <tr>
                        <th>Sr.No.</th>
                        <th>User </th>
                        <th>Country</th>
                        <th>Email</th>
                        <th>Mobile Number</th>
                        <th>Town</th>
                        <th>Warehouse Name</th>
                        <th>Warehouse Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentdata &&
                        currentdata.length > 0 &&
                        currentdata.map((item, index) => (
                          <tr key={item.id}>
                            <td>{startIndex + index + 1}</td>
                            <td>{item.contact_person}</td>
                            <td>{item.country_name}</td>
                            <td>{item.email}</td>
                            <td>{item.mobile_number}</td>
                            <td>{item.town}</td>
                            <td>{item.warehouse_name}</td>
                            <td>{item.warehouse_number}</td>
                            <td style={{ display: "flex", alignItems: "center" }}>
                              <FaEdit
                                onClick={() => {
                                  openModal2(item.warehouse_id);
                                }}
                                style={{
                                  color: "rgb(27 34 69)",
                                  marginRight: "10px",

                                  cursor: "pointer",
                                }}
                              />
                              <AiFillDelete
                                onClick={() => {
                                  deletewarehouse(item.warehouse_id);
                                }}
                                style={{

                                  cursor: "pointer",
                                }}
                                className="text-danger"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
                  <Modal
                    open={isModalOpen}
                    onClose={closeModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        height: 300,
                        width: 450,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                      }}
                    >
                      <h5 id="modal-modal-title">Add Excel</h5>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="mb-3 border ps-2 py-2 rounded w-100"
                        style={{ display: "block", marginTop: "16px" }}
                      />
                      <Button variant="contained" onClick={postData}>
                        Submit
                      </Button>
                    </Box>
                  </Modal>
                  <Modal
                    open={isModalOpen2}
                    onClose={closeModal2}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box
                      className="warehouse_modal"
                      sx={{
                        position: "absolute",
                        overflow: "scroll",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                      }}
                    >
                      <div className="modal-header">
                        <h2 id="modal-modal-title">Edit Warehouse</h2>
                        <button className="btn btn-close" onClick={closeModal2}>
                          <CloseIcon />
                        </button>
                      </div>
                      <div className="newModalGap noFormaControl">
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Warehouse For</label>
                            <select
                              name="Warehouse_For"
                              value={inputdata.Warehouse_For}
                              onChange={handleFileChange1}
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            >
                              <option value="Own">
                                Asia Direct warehouse
                              </option>
                              <option value="Supplier">Supplier</option>
                            </select>
                          </div>

                          {inputdata.Warehouse_For === "Supplier" && (
                            <div className="col-6">
                              <label className="ware_label">
                                Select Supplier
                              </label>
                              {/* <select
                                name="supplier_name"
                                value={inputdata.supplier_name}
                                onChange={handleFileChange1}
                                className="mb-3 border ps-2 py-2 rounded w-100"
                              >
                                <option value="">Select</option>
                                {supplierData.map((item, index) => (
                                  <option key={index} value={item.name}>
                                    {item.name}
                                  </option>
                                ))}
                              </select> */}
                              <select
                                name="supplier_name"
                                value={inputdata.supplier_name}
                                onChange={handleFileChange1}
                              >
                                <option value="">Select</option>
                                {supplierData.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Warehouse Name</label>
                            <input
                              type="text"
                              placeholder="Warehouse Name"
                              value={inputdata.warehouse_name}
                              onChange={handleFileChange1}
                              className="mb-3 border ps-2 py-2 rounded w-100"
                              name="warehouse_name"
                            />
                          </div>
                          <div className="col-6">
                            <label className="ware_label">
                              Warehouse Address
                            </label>
                            <input
                              type="text"
                              name="warehouse_address"
                              value={inputdata.warehouse_address}
                              placeholder="Warehouse Address"
                              onChange={handleFileChange1}
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Country</label>
                            <select
                              name="country"
                              onChange={handleFileChange1}
                              value={inputdata.country}
                              className="py-2 w-100 "
                            >
                              <option>Select Country....</option>
                              {countries &&
                                countries.length > 0 &&
                                countries.map((item, index) => {
                                  console.log(item);
                                  return (
                                    <>
                                      <option key={index} value={item.id}>
                                        {item.name}
                                      </option>
                                    </>
                                  );
                                })}
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Town</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              value={inputdata.town}
                              name="town"
                              placeholder="Town"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Mobile Number</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              name="mobile_number"
                              placeholder="Mobile Number"
                              value={inputdata.mobile_number}
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Contact Person</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              placeholder="Contact Person"
                              value={inputdata.contact_person}
                              name="contact_person"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Email Address</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              value={inputdata.email}
                              name="email"
                              placeholder="Email Address"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Company Name</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              value={inputdata.company_name}
                              name="company_name"
                              placeholder="company_name Address"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                          </div>
                        </div>
                        <div className="text-center mt-2 unsetLt">
                          <Button variant="contained" onClick={apiupdatepost}>
                            Update Warehouse
                          </Button>
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
                      className="warehouse_modal"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                      }}
                    >
                      {validationErrors.warehouse_number && (
                        <p className="mb-0" style={{ color: "red" }}>
                          {validationErrors.warehouse_number}
                        </p>
                      )}
                      <div className="modal-header">
                        <h2 id="modal-modal-title">Add Warehouse</h2>
                        <button className="btn btn-close" onClick={closeModal1}>
                          <CloseIcon />
                        </button>
                      </div>
                      <div className="newModalGap noFormaControl">
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Warehouse For</label>
                            <select
                              type="text"
                              placeholder="Warehouse Name"
                              onChange={handleFileChange1}
                              className="mb-3 border ps-2 py-2 rounded w-100"
                              name="Warehouse_For"
                            >
                              <option>select</option>
                              <option value="Own">Asia Direct Warehouse </option>
                              <option value="Supplier">Supplier </option>
                            </select>
                            {validationErrors.Warehouse_For && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.Warehouse_For}
                              </p>
                            )}
                          </div>
                          {inputdata.Warehouse_For === "Supplier" ? (
                            <div className="col-6">
                              <label className="ware_label">
                                Select Supplier
                              </label>
                              {/* <select
                                type="text"
                                onChange={handleFileChange1}
                                className="mb-3 border ps-2 py-2 rounded w-100"
                                name="supplier_name"
                              >
                                <option>select</option>
                                {supplierData.map((item) => {
                                  return (
                                    <>
                                      <option>{item.name}</option>
                                    </>
                                  );
                                })}
                              </select> */}
                              <select
                                name="supplier_name"
                                onChange={handleFileChange1}
                                className="mb-3 border ps-2 py-2 rounded w-100"
                              >
                                <option value="">Select</option>
                                {supplierData.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            ""
                          )}
                          <div className="row">
                            <div className="col-6">
                              <label className="ware_label">
                                Warehouse Address
                              </label>
                              <input
                                type="text"
                                name="warehouse_address"
                                placeholder="Warehouse Address"
                                onChange={handleFileChange1}
                                className="mb-3 border ps-2 py-2 rounded w-100"
                              />
                              {validationErrors.warehouse_address && (
                                <p className="mb-0" style={{ color: "red" }}>
                                  {validationErrors.warehouse_address}
                                </p>
                              )}
                            </div>
                            <div className="col-6">
                              <label className="ware_label">
                                Warehouse Name
                              </label>
                              <input
                                type="text"
                                placeholder="Warehouse Name"
                                onChange={handleFileChange1}
                                className="mb-3 border ps-2 py-2 rounded w-100"
                                name="warehouse_name"
                              />
                              {validationErrors.warehouse_name && (
                                <p className="mb-0" style={{ color: "red" }}>
                                  {validationErrors.warehouse_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Country</label>
                            <select
                              name="country"
                              onChange={handleFileChange1}
                              className="py-2 w-100 "
                            >
                              <option>Select Country....</option>
                              {countries &&
                                countries.length > 0 &&
                                countries.map((item, index) => {
                                  console.log(item);
                                  return (
                                    <>
                                      <option key={index} value={item.id}>
                                        {item.name}
                                      </option>
                                    </>
                                  );
                                })}
                            </select>
                            {validationErrors.country && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.country}
                              </p>
                            )}
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Town</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              name="town"
                              placeholder="Town"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                            {validationErrors.town && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.town}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Mobile Number</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              name="mobile_number"
                              placeholder="Mobile Number"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                            {validationErrors.mobile_number && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.mobile_number}
                              </p>
                            )}
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Contact person</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              placeholder="Contact Person"
                              name="contact_person"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                            {validationErrors.contact_person && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.contact_person}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <label className="ware_label">Email address</label>
                            <input
                              type="email"
                              onChange={handleFileChange1}
                              name="email"
                              placeholder="Email Address"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                            {validationErrors.email && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.email}
                              </p>
                            )}
                          </div>
                          <div className="col-6">
                            <label className="ware_label">Company Name</label>
                            <input
                              type="text"
                              onChange={handleFileChange1}
                              name="company_name"
                              placeholder="company_name"
                              className="mb-3 border ps-2 py-2 rounded w-100"
                            />
                            {validationErrors.company_name && (
                              <p className="mb-0" style={{ color: "red" }}>
                                {validationErrors.company_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-center mt-2 unsetLt">
                          <Button
                            variant="contained"
                            className="submit_btn"
                            onClick={postData1}
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </Box>
                  </Modal>
                  <ToastContainer />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
