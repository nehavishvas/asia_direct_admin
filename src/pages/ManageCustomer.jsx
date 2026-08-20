import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete, AiFillMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, Modal, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const pageSize = 10;
const ManageCustomer = () => {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState([]);
  const [updatedata, setUpdatedata] = useState([]);
  const [searinpdata, setSearinpdata] = useState([]);
  const [error, setError] = useState({});
  const [openmodal, setOpenmodal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery1, setSearchQuery1] = useState("");
  const [pagenation, setPagenation] = useState(1);
  const [inputud, setInputud] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState({
    client_name: "",
    email: "",
    client_ref: "",
    contact_person: "",
    cellphone: "",
    telephone: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    country: "",
    code: "",
    country_code: "",
    company_id: "",
    importers_ref: "",
    tax_ref: "",
    password: "",
  });
  const [id, setId] = useState("");
  const [id1, setId1] = useState("");
  const [supplierdata, setSupplierdata] = useState([]);
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const editDataAll = (id) => {
    console.log(id);
    setInputud(id);
    setId(id);
    setId1(id);
    const selectedUser = supplierdata.filter((item) => {
      return item.id === id;
    });
    console.log(selectedUser[0]);
    const getData = selectedUser[0];
    console.log(getData);
    setInputData((prevData) => ({
      ...prevData,
      client_name: getData.full_name,
      email: getData.email,
      client_ref: getData.client_ref,
      contact_person: getData.contact_person,
      cellphone: getData.cellphone,
      telephone: getData.telephone,
      address_1: getData.address_1,
      address_2: getData.address_2,
      city: getData.city,
      province: getData.province,
      country: getData.country,
      code: getData.code,
      country_code: getData.country_code,
      company_id: getData.company_id,
      importers_ref: getData.importers_ref,
      tax_ref: getData.tax_ref,
    }));
  };
  const handlevalidate = (value) => {
    let error = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.email) {
      error.email = "Email is Required";
    } else if (!emailRegex.test(value.email)) {
      error.email = "Supplier Email is invalid";
    }
    // if (!value.cellphone) {
    //   error.cellphone = "Cellphone is Required";
    // }
    if (!value.address_1) {
      error.address_1 = "Address is Required";
    }
    if (!value.client_name) {
      error.client_name = "Name is Required";
    }
    if (!value.code) {
      error.code = "Code is Required";
    }
    // if (!value.telephone) {
    //   error.telephone = "Telephone is Required";
    // }
    if (!value.client_ref) {
      error.client_ref = "Client Ref is Required";
    }
    if (Object.keys(error).length === 0) {
      apihit();
    } else {
      setError(error);
    }
  };
  const handleclick = () => {
    handlevalidate(data);
  };
  const apihit = async () => {
    console.log(data);
    const payload = {
      client_name: data.client_name,
      email: data.email,
      client_ref: data.client_ref,
      contact_person: data.contact_person,
      cellphone: data.cellphone,
      telephone: data.telephone,
      address_1: data.address_1,
      address_2: data.address_2,
      city: data.city,
      province: data.province,
      country: data.country,
      code: data.code,
      country_code: data.country_code,
      company_id: data.company_id,
      importers_ref: data.importers_ref,
      tax_ref: data.tax_ref,
      password: data.password,
    };
    console.log(payload)
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}add-customer`,
        payload
      );
      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.success === true) {
          handleclosemodal();
        }
        getclientlistr();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  useEffect(() => {
    getclientlistr();
  }, []);
  const getsearchValu = () => {
    const postdata = {
      search: searinpdata.search,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}client-list`, postdata)
      .then((response) => {
        console.log(response.data);
        setLoader(false);
        setPagenation(response.data);
        setSupplierdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response);
        setLoader(false);
      });
  };
  const getclientlistr = async (page) => {
    console.log(page);
    const postdata = {
      page: page,
      limit: 10,
    };
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}client-list`, postdata)
      .then((response) => {
        console.log(response.data);
        setLoader(false);
        setPagenation(response.data);
        setSupplierdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response);
        setLoader(false);
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
        axios
          .post(`${process.env.REACT_APP_BASE_URL}delete-client`, {
            client_id: id,
          })
          .then((response) => {
            getclientlistr();
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
  const handleupdatevalue = (id) => {
    console.log(id);
    const updaredata = {
      client_name: inputData.client_name,
      email: inputData.email,
      client_ref: inputData.client_ref,
      contact_person: inputData.contact_person,
      cellphone: inputData.cellphone,
      telephone: inputData.telephone,
      address_1: inputData.address_1,
      address_2: inputData.address_2,
      city: inputData.city,
      province: inputData.province,
      country: inputData.country,
      code: inputData.code,
      company_id: inputData.company_id,
      importers_ref: inputData.importers_ref,
      country_code: inputData.country_code,
      tax_ref: inputData.tax_ref,
      client_id: id1,
      password: inputData.password,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-client`, updaredata)
      .then((response) => {
        getclientlistr();
        setId1("");
        toast.success("Costumer Update Successfully");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const [isChecked, setIsChecked] = useState(true);
  const handleToggle = (id) => {
    const updatedData = supplierdata.map((item) =>
      item.id === id ? { ...item, status: 1 - item.status } : item
    );
    setSupplierdata(updatedData);
  };
  const handleToggle2 = (id) => {
    const updatedData = supplierdata.map((item) =>
      item.id === id ? { ...item, status: 1 - item.status } : item
    );
    setSupplierdata(updatedData);
  };
  let name, value;
  const submitInputdata = (e) => {
    name = e.target.name;
    value = e.target.value;
    setInputData({ ...inputData, [name]: value });
  };
  const handlelcicckac = (id) => {
    axios
      .post(`${`process.env.REACT_APP_BASE_URL`}change-status`, {
        user_id: id,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };
  const handlePageChange = (page) => {
    console.log(page);
    setCurrentPage(page);
    getclientlistr(page);
  };
  const filteredData = supplierdata.filter((item) => {
    return (
      item.cellphone.toLowerCase().includes(searchQuery1.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery1.toLowerCase()) ||
      item.full_name.toLowerCase().includes(searchQuery1.toLowerCase()) ||
      item.telephone.toLowerCase().includes(searchQuery1.toLowerCase())
    );
  });
  const totalPage = Math.ceil(pagenation.totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentdata = filteredData.slice(startIndex, endIndex);
  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearinpdata({ ...searinpdata, [name]: value });
    setSearchQuery1(e.target.value);
    setCurrentPage(1);
  };
  const handleclickdata = (id) => {
    const dataall = supplierdata.filter((item) => {
      return item.id === id;
    });
    console.log(dataall);
    navigate("/Admin/customer-details", { state: { alldata: dataall } });
  };
  const handlepress = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const postData = () => {
    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      axios
        .post(`${process.env.REACT_APP_BASE_URL}upload-excel-client`, formdata)
        .then((response) => {
          getclientlistr();
          toast.success(response.data.message);
          getclientlistr();
          closeModal();
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } else {
      console.log("No file selected");
    }
  };
  const updatecountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        console.log(response.data.data);
        setUpdatedata(response.data.data);
      })
      .catch((error) => {
        console.group(error.response.data.message);
      });
  };
  useEffect(() => {
    updatecountry();
  }, []);
  const handleclickmodal = () => {
    setOpenmodal(true);
  };
  const handleclosemodal = () => {
    setOpenmodal(false);
  };
  const querryinQuote = (item) => {
    console.log("item", item);
    navigate("/Admin/QuotationInFreight", { state: { data: item } });
  };
    const handlekey = (e) => {
    if (e.charCode < 44 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  return (
    <>
      {loader ? (
        <div class="loader-container">
          <div class="loader"></div>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div>
              <div className="row manageFreight">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="">
                      <h4 className="freight_hd">Customer</h4>
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                      <div className="ms-2">
                        <button type="button" onClick={handleclickmodal}>
                          Add Customer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" mt-2 d-flex">
                <div className="searchManageFre">
                  <input
                    type="text"
                    placeholder="search"
                    name="search"
                    onChange={handleSearch}
                    className="form-control w-100"
                  ></input>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={getsearchValu}
                  >
                    Search
                  </button>
                </div>
              </div>
              {/* <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                maria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">
                        Add Customer1111
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="modal-body customer_bdy">
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Email</label>
                          <br />
                          <input
                            type="email"
                            name="email"
                            onChange={handlechange}
                            placeholder="Email@gmail.com"
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.email}</p>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Address 1</label>
                          <br />
                          <input
                            type="text"
                            name="address_1"
                            value={data.address_1}
                            placeholder="Address"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.address_1}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Importer Refrence</label>
                          <input
                            type="text"
                            name="importers_ref"
                            placeholder="Importer Refrence"
                            value={data.importers_ref}
                            onChange={handlechange}
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Address 2</label>
                          <input
                            type="text"
                            name="address_2"
                            placeholder="Address"
                            value={data.address_2}
                            onChange={handlechange}
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>City</label>
                          <input
                            type="text"
                            name="city"
                            value={data.city}
                            placeholder="city"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Province</label>
                          <input
                            type="text"
                            placeholder="Province"
                            className="w-100 border p-2 rounded"
                            value={data.province}
                            name="province"
                            onChange={handlechange}
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Country</label>
                          <select
                            name="country"
                            value={data.country}
                            onChange={handlechange}
                            className="w-100 border p-2 rounded"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item, index) => {
                                return (
                                  <>
                                    <option key={item.id}>{item.name}</option>
                                  </>
                                );
                              })}
                          </select>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Client Ref</label>
                          <input
                            type="text"
                            name="client_ref"
                            placeholder="Client Refrence"
                            onChange={handlechange}
                            value={data.client_ref}
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.client_ref}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Client Name</label>
                          <input
                            type="text"
                            name="client_name"
                            onChange={handlechange}
                            placeholder="Client Name"
                            value={data.client_name}
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">
                            {error.client_name}
                          </p>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Contact Person</label>
                          <input
                            type="text"
                            name="contact_person"
                            onChange={handlechange}
                            placeholder="Contact Person"
                            value={data.contact_person}
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Cellphone</label>
                          <input
                            type="text"
                            name="cellphone"
                            onKeyPress={handlepress}
                            placeholder="Cellphone"
                            onChange={handlechange}
                            value={data.cellphone}
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.cellphone}</p>
                        </div>
                        <div className="mb-3  col-md-6">
                          <label>Telephone</label>
                          <input
                            type="text"
                            name="telephone"
                            onKeyPress={handlepress}
                            placeholder="Telephone"
                            onChange={handlechange}
                            value={data.telephone}
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.telephone}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Code</label>
                          <input
                            type="text"
                            name="code"
                            onKeyPress={handlepress}
                            placeholder="code"
                            onChange={handlechange}
                            value={data.code}
                            id="quntity"
                            className="w-100 border p-2 rounded"
                          ></input>
                          <p className="text-danger mb-0">{error.code}</p>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Company Reg/ID#</label>
                          <input
                            type="text"
                            name="company_id"
                            onChange={handlechange}
                            placeholder="Xyz refrecne number"
                            value={data.company_id}
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label>Vat/Tax Ref</label>
                          <input
                            type="text"
                            name="tax_ref"
                            onChange={handlechange}
                            value={data.tax_ref}
                            placeholder=" Vat / Tax Ref"
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                        <div className="mb-3 col-md-6">
                          <label>Password</label>
                          <input
                            type="text"
                            name="password"
                            onChange={handlechange}
                            value={data.password}
                            placeholder="password"
                            className="w-100 border p-2 rounded"
                          ></input>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={handleclick}
                      className="btn text-white"
                    >
                      Add Customer
                    </button>
                  </div>
                </div>
              </div> */}
              <div className="table-responsive mt-2">
                <table className="table mt-4 table-striped tableICon">
                  <thead>
                    <tr>
                      <th scope="col">Costumer Id</th>
                      <th scope="col">Client Name</th>
                      <th className="col-2" scope="col-2">
                        Client Email
                      </th>
                      <th scope="col">Cellphone</th>
                      <th scope="col">Telephone</th>
                      <th scope="col">Date of Reg</th>
                      <th scope="col">Status</th>
                      <th scope="col">View</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ border: "none" }}>
                    {pagenation.data &&
                      pagenation.data.length > 0 &&
                      pagenation.data.map((item, index) => {
                        return (
                          <>
                            <tr className="border-bottom" key={index}>
                              <td>{item.client_number}</td>
                              <td>{item.full_name}</td>
                              <td className="col-2">{item.email} </td>
                              <td>{item.cellphone}</td>
                              <td>{item.telephone}</td>
                              <td>
                                {new Date(item.created_at).toLocaleDateString(
                                  "en-GB"
                                )}
                              </td>
                              <td>
                                {item.status == 1 ? (
                                  <label
                                    className={`switch round ${
                                      isChecked ? "checked" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={!isChecked}
                                      onClick={() => {
                                        handlelcicckac(item.id);
                                      }}
                                      onChange={() => {
                                        handleToggle2(item.id);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                ) : (
                                  <label
                                    className={`switch round ${
                                      isChecked ? "checked" : ""
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onClick={() => {
                                        handlelcicckac(item.id);
                                      }}
                                      onChange={() => {
                                        handleToggle(item.id);
                                      }}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                )}
                              </td>
                              <td>
                                <VisibilityIcon
                                  onClick={() => {
                                    handleclickdata(item.id);
                                  }}
                                  style={{
                                    color: "rgb(27 34 69)",
                                    cursor: "pointer",
                                  }}
                                />
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
                                  <div className="action_btn1 ms-2">
                                    <AiFillMessage
                                      style={{ cursor: "pointer" }}
                                      className="text-success"
                                      onClick={() => {
                                        querryinQuote(item);
                                      }}
                                    />
                                  </div>
                                  <div className="ms-2">
                                    <button
                                      type="button"
                                      className=" border-0"
                                      data-bs-toggle="modal"
                                      data-bs-target="#staticBackdrop"
                                      onClick={() => {
                                        editDataAll(item.id);
                                      }}
                                    >
                                      <FaEdit style={{ color: "#1b2245" }} />
                                    </button>
                                    <div
                                      className="modal fade modalManageFreight"
                                      id="staticBackdrop"
                                      data-bs-backdrop="static"
                                      data-bs-keyboard="false"
                                      tabIndex={-1}
                                      aria-labelledby="staticBackdropLabel"
                                      aria-hidden="true"
                                    >
                                      <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                                        <div className="modal-content">
                                          <div className="modal-header">
                                            <h5
                                              className="modal-title"
                                              id="staticBackdropLabel"
                                            >
                                              Update Customer
                                            </h5>
                                            <button
                                              type="button"
                                              className="btn-close"
                                              data-bs-dismiss="modal"
                                              aria-label="Close"
                                            >
                                              <CloseIcon />
                                            </button>
                                          </div>
                                          <div className="modal-body">
                                            <div className="row">
                                              <div className="col-md-6 mb-3">
                                                <label>Client Name</label>
                                                <input
                                                  type="text"
                                                  name="client_name"
                                                  onChange={submitInputdata}
                                                  value={inputData.client_name}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Contact Person</label>
                                                <input
                                                  type="text"
                                                  name="contact_person"
                                                  onChange={submitInputdata}
                                                  value={
                                                    inputData.contact_person
                                                  }
                                                  onKeyPress={handlepress}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Email</label>
                                                <input
                                                  type="email"
                                                  name="email"
                                                  onChange={submitInputdata}
                                                  value={inputData.email}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Client Ref</label>
                                                <input
                                                  type="text"
                                                  name="client_ref"
                                                  onChange={submitInputdata}
                                                  value={inputData.client_ref}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-6 d-flex">
                                                <div className="col-md-4 mb-3">
                                                <label>Country Code</label>
                                                <select
                                                  name="country_code"
                                                  onChange={submitInputdata}
                                                  value={inputData.country_code}
                                                  className="form-control"
                                                >
                                                  <option>Select...</option>
                                                  {updatedata &&
                                                    updatedata.length > 0 &&
                                                    updatedata.map(
                                                      (item, index) => {
                                                        return (
                                                          <>
                                                            <option
                                                              key={index}
                                                              value={item.id}
                                                            >
                                                              +{item.phonecode} {item.shortname}
                                                            </option>
                                                          </>
                                                        );
                                                      }
                                                    )}
                                                </select>
                                              </div>
                                              <div className="col-md-8 mb-3">
                                                <label>Cellphone</label>
                                                <input
                                                  type="text"
                                                  name="cellphone"
                                                  onChange={submitInputdata}
                                                  value={inputData.cellphone}
                                                  onKeyPress={handlepress}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                                </div>
                                               <div className="col-6 d-flex">
                                                <div className="col-md-4 mb-3">
                                                <label>Country Code</label>
                                                <select
                                                  name="country_code"
                                                  onChange={submitInputdata}
                                                  value={inputData.country_code}
                                                  className="form-control"
                                                >
                                                  <option>Select...</option>
                                                  {updatedata &&
                                                    updatedata.length > 0 &&
                                                    updatedata.map(
                                                      (item, index) => {
                                                        return (
                                                          <>
                                                            <option
                                                              key={index}
                                                              value={item.id}
                                                            >
                                                              +{item.phonecode} {item.shortname}
                                                            </option>
                                                          </>
                                                        );
                                                      }
                                                    )}
                                                </select>
                                              </div>
                                              <div className="col-md-8 mb-3">
                                                <label>Telephone</label>
                                                <input
                                                  type="text"
                                                  name="telephone"
                                                  onChange={submitInputdata}
                                                  value={inputData.telephone}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Address 1</label>
                                                <input
                                                  type="text"
                                                  name="address_1"
                                                  value={inputData.address_1}
                                                  onChange={submitInputdata}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Address 2</label>
                                                <input
                                                  type="text"
                                                  name="address_2"
                                                  value={inputData.address_2}
                                                  onChange={submitInputdata}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>City</label>
                                                <input
                                                  type="text"
                                                  name="city"
                                                  value={inputData.city}
                                                  onChange={submitInputdata}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Province</label>
                                                <input
                                                  type="text"
                                                  className="form-control"
                                                  value={inputData.province}
                                                  name="province"
                                                  onChange={submitInputdata}
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Country</label>
                                                <select
                                                  name="country"
                                                  onChange={submitInputdata}
                                                  value={inputData.country}
                                                  className="form-control"
                                                >
                                                  <option>Select...</option>
                                                  {updatedata &&
                                                    updatedata.length > 0 &&
                                                    updatedata.map(
                                                      (item, index) => {
                                                        return (
                                                          <>
                                                            <option
                                                              key={index}
                                                              value={item.id}
                                                            >
                                                              {item.name}
                                                            </option>
                                                          </>
                                                        );
                                                      }
                                                    )}
                                                </select>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Postal Code</label>
                                                <input
                                                  type="text"
                                                  name="code"
                                                  onChange={submitInputdata}
                                                  value={inputData.code}
                                                  id="quntity"
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>
                                                  Company Reg / ID #
                                                </label>
                                                <input
                                                  type="text"
                                                  name="company_id"
                                                  onChange={submitInputdata}
                                                  value={inputData.company_id}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Importer Refrence</label>
                                                <input
                                                  type="text"
                                                  name="importers_ref"
                                                  value={
                                                    inputData.importers_ref
                                                  }
                                                  onChange={submitInputdata}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Vat / Tax Ref</label>
                                                <input
                                                  type="text"
                                                  name="tax_ref"
                                                  onChange={submitInputdata}
                                                  value={inputData.tax_ref}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                              <div className="col-md-6 mb-3">
                                                <label>Password</label>
                                                <input
                                                  type="password"
                                                  name="password"
                                                  onChange={submitInputdata}
                                                  className="form-control"
                                                ></input>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="modal-footer">
                                            <button
                                              type="button"
                                              data-bs-dismiss="modal"
                                              onClick={() => {
                                                handleupdatevalue(item.id);
                                              }}
                                              className="btn text-white m-0"
                                            >
                                              Update Customer
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ms-2">
                                    <a
                                      href="https://chat.whatsapp.com/C1SiwQek53B434FSz4BjQo"
                                      target="_blank"
                                    >
                                      <WhatsAppIcon className="text-success" />
                                    </a>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })}
                  </tbody>
                </table>
              </div>
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
                open={openmodal}
                onClose={handleclosemodal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="newModal modalCustomer"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                  }}
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 id="modal-modal-title">Add Customer</h2>
                      <button
                        type="button"
                        className="btn btn-close"
                        onClick={handleclosemodal}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="newModalGap noFormaControl">
                      <div className="row my-3">
                        <div className="col-md-6">
                          <label>Client Name</label>
                          <input
                            type="text"
                            name="client_name"
                            onChange={handlechange}
                            value={data.client_name}
                            placeholder="Client Name"
                            className="w-100 border p-2 rounded"
                          />
                          <p className="text-danger mb-0">
                            {error.client_name}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <label>Contact Person</label>
                          <input
                            type="text"
                            name="contact_person"
                            onChange={handlechange}
                            value={data.contact_person}
                            placeholder="Contact Person"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                      </div>
                      <div className="row my-3">
                        <div className="col-md-6">
                          <label>Client Ref</label>
                          <input
                            type="text"
                            name="client_ref"
                            onChange={handlechange}
                            value={data.client_ref}
                            placeholder="Client Reference"
                            className="w-100 border p-2 rounded"
                          />
                          <p className="text-danger mb-0">{error.client_ref}</p>
                        </div>
                        <div className="col-md-6">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            onChange={handlechange}
                            placeholder="Email@gmail.com"
                            className="w-100 border p-2 rounded"
                          />
                          <p className="text-danger mb-0">{error.email}</p>
                        </div>
                      </div>
                      
                      <div className="row my-3">
                        <div className="d-flex col-md-6">
                            <div className="col-4">
                          <label className="mb-3">Country Code</label>
                          <select
                            name="country_code"
                            onChange={handlechange}
                            className="form-control"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item) => (
                                <option key={item.id} value={item.phonecode}>
                                  +{item.phonecode} {item.shortname}
                                </option>
                              ))}
                          </select>
                            </div>
                            <div className="col-8">
                               <label>Cellphone</label>
                          <input
                            type="text"
                            name="cellphone"
                            onChange={handlechange}
                             onKeyPress={handlekey}
                            placeholder="Cellphone"
                            className="w-100 border form-control p-2 rounded"
                          />
                        </div>
                         
                          {/* <input
                            type="text"
                            name="cellphone"
                            value={inputData.cellphone}
                            onChange={submitInputdata}
                            className="w-100 border p-2 rounded"
                          /> */}
                          <p className="text-danger mb-0">{error.cellphone}</p>
                        </div>
                            <div className="col-6 d-flex ">
 <div className="col-4">
                          <label className="mb-3">Country Code</label>
                          <select
                            name="country_code"
                           
                           onChange={handlechange}
                            
                            className="form-control"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item) => (
                                <option key={item.id} value={item.phonecode}>
                                  +{item.phonecode} {item.shortname}
                                </option>
                              ))}
                          </select>
                            </div>
                        <div className="col-md-8">

                          <label>Telephone</label>
                          <input
                            type="text"
                            name="telephone"
                            onChange={handlechange}
                             onKeyPress={handlekey}
                            placeholder="Telephone"
                            className="w-100 border p-2 rounded"
                          />
                          {/* <input
                            type="text"
                            name="telephone"
                            value={inputData.telephone}
                            onChange={submitInputdata}
                            className="w-100 border p-2 rounded"
                          /> */}
                          <p className="text-danger mb-0">{error.telephone}</p>
                        </div>
                            </div>
                        
                      </div>
                      <div className="row my-3">
                        <div className="col-md-6">
                          <label>Address 1</label>
                          <input
                            type="text"
                            name="address_1"
                            value={data.address_1}
                            onChange={handlechange}
                            placeholder="Address"
                            className="w-100 border p-2 rounded"
                          />
                          <p className="text-danger mb-0">{error.address_1}</p>
                        </div>
                        <div className="col-md-6">
                          <label>Address 2</label>
                          <input
                            type="text"
                            name="address_2"
                            value={data.address_2}
                            onChange={handlechange}
                            placeholder="Address"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                      </div>
                      <div className="row ">
                        <div className="col-md-6">
                          <label>City</label>
                          <input
                            type="text"
                            name="city"
                            value={data.city}
                            onChange={handlechange}
                            placeholder="City"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                        <div className="col-md-6">
                          <label>Province</label>
                          <input
                            type="text"
                            name="province"
                            value={data.province}
                            onChange={handlechange}
                            placeholder="Province"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                      </div>
<div className="row my-3">
                        <div className="col-md-6">
                          <label>Country</label>
                          <select
                            name="country"
                            value={data.country}
                           onChange={handlechange}
                            className="form-control"
                          >
                            <option>Select...</option>
                            {updatedata &&
                              updatedata.length > 0 &&
                              updatedata.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label>Postal Code</label>
                          <input
                            type="text"
                            name="code"
                            onChange={handlechange}
                            value={data.code}
                            placeholder="Postal Code"
                            className="w-100 border p-2 rounded"
                          />
                          <p className="text-danger mb-0">{error.code}</p>
                        </div>
                      </div>
                      <div className="row my-3">
                        <div className="col-md-6">
                          <label>Company Reg/ID#</label>
                          <input
                            type="text"
                            name="company_id"
                            onChange={handlechange}
                            value={data.company_id}
                            placeholder="Xyz reference number"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                        <div className="col-md-6">
                          <label>Importer Reference</label>
                          <input
                            type="text"
                            name="importers_ref"
                            onChange={handlechange}
                            value={data.importers_ref}
                            placeholder="Importer Reference"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                      </div>
                      <div className="row my-3">
                        <div className="col-md-6">
                          <label>Vat/Tax Ref</label>
                          <input
                            type="text"
                            name="tax_ref"
                            onChange={handlechange}
                            value={data.tax_ref}
                            placeholder="Vat/Tax Ref"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                        <div className="col-md-6">
                          <label>Password</label>
                          <input
                            type="text"
                            name="password"
                            onChange={handlechange}
                            value={data.password}
                            placeholder="Password"
                            className="w-100 border p-2 rounded"
                          />
                        </div>
                      </div>
                      <div className="modal-footer unsetLt">
                        <Button
                          variant="contained"
                          onClick={handleclick}
                          className="btn text-white"
                        >
                          Add Customer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Box>
              </Modal>

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
                  <div className="mb-3">
                    <h3 id="modal-modal-title">Add Excel</h3>
                  </div>
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
                  <button
                    className="ms-2 btn bg-danger"
                    style={{ color: "white" }}
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    Submit
                  </button>
                </Box>
              </Modal>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ManageCustomer;
