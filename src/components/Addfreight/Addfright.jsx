import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { Modal, Button, Form } from "react-bootstrap";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Addfright = () => {
  const [lcientlist, setLcientlist] = useState([]);
  const [staffdata, setStaffdata] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [refane, setRefane] = useState({});
  const [reemail, setReemail] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setReemail(selectedOption);
    setRefane(selectedOption);
  };
  const handleChangeemail = (e) => {
    setReemail(e.target.value);
  };
  const handleChange1inpo = (e) => {
    setRefane(e.target.value);
  };
  const [apidata, setApidata] = useState([]);
  const [formFiles, setFormFiles] = useState({
    supplier_invoice: [],
    other_documents: [],
    licenses: [],
    packing_list: [],
  });
  const [loader, setLoader] = useState(false);
  const [showhazardous, setShowhazardous] = useState(false);
  const [data, setData] = useState({
    client_ref: "",
    date: "",
    type: "",
    freight: "",
    incoterm: "",
    dimension: "",
    weight: "",
    quote_received: "",
    client_quoted: "",
    is_active: "",
    comment: "",
    no_of_packages: "",
    package_type: "",
    commodity: "",
    hazardous: "",
    country_of_origin: "",
    destination_country: "",
    supplier_address: "",
    port_of_loading: "",
    post_of_discharge: "",
    place_of_delivery: "",
    ready_for_collection: "",
    require_for_delivery: "",
    transit_time: "",
    priority: "",
    shipment_details: "",
    nature_of_hazard: "",
    volumetric_weight: "",
    assign_for_estimate: "",
    assign_to_transporter: "",
    assign_warehouse: "",
    assign_to_clearing: "",
    send_to_warehouse: "",
    quote_received: "",
    shipment_origin: "",
    shipment_des: "",
    shipper_name: "",
    fcl_lcl: "",
  });
  const [error, setError] = useState({});
  const [countries, setCountruies] = useState([]);
  const navigate = useNavigate();
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    setShowhazardous(data.hazardous);
  };
  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files);
    setFormFiles((prev) => ({
      ...prev,
      [fieldName]: files,
    }));
  };
  ///////////////////////getdate///////////////////////////////////////////////////////////////////////////
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    getcountry();
    getstaff();
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
  const handleclick = () => {
    handlevalidate(data);
  };

  const handleclick2 = () => {
    navigate("/Admin/managefreight");
  };

  const useridsales = JSON.parse(localStorage.getItem("data123"));
  const handlevalidate = (value) => {
    console.log(useridsales.id);
    console.log(selectedOption);
    let error = {};
    if (!value.date) {
      error.date = "Freight date is required"
    }
    if (!value.type) {
      error.type = "Freight type is required";
    }
    if (!value.freight) {
      error.freight = "Freight is required";
    }
    if (!value.incoterm) {
      error.incoterm = "Incoterm is required";
    }
    if (!value.weight) {
      error.weight = "Weight is required";
    }
    if (!value.shipper_name) {
      error.shipper_name = "Client Quoted is required";
    }
    if (!value.comment) {
      error.comment = "Comment is required";
    }
    if (!value.fcl_lcl) {
      error.fcl_lcl = "Type is required";
    }
    if (!value.no_of_packages) {
      error.no_of_packages = "Number of packages is required";
    }
    if (!value.package_type) {
      error.package_type = "Package type is required";
    }
    if (!value.commodity) {
      error.commodity = "Commodity is required";
    }
    if (!value.dimension) {
      error.dimension = "Dimension is required";
    }
    if (!value.hazardous) {
      error.hazardous = "Hazardous is required";
    }
    if (!value.country_of_origin) {
      error.country_of_origin = "Country of origin is required";
    }
    if (!value.destination_country) {
      error.destination_country = "Destination country is required";
    }
    if (!value.shipper_address) {
      error.shipper_address = "Supplier address is required";
    }
    if (!value.port_of_loading) {
      error.port_of_loading = "Port of loading is required";
    }
    if (!value.post_of_discharge) {
      error.post_of_discharge = "Port of discharge is required";
    }
    if (!value.place_of_delivery) {
      error.place_of_delivery = "Place of delivery is required";
    }
    if (!value.ready_for_collection) {
      error.ready_for_collection = "Require for collection is required";
    }
    if (!value.require_for_delivery) {
      error.require_for_delivery = "Require for Delivery is required";
    }
    if (!value.Product_Description) {
      error.Product_Description = "Product Description is required";
    }
    if (!value.transit_time) {
      error.transit_time = "Transit time is required";
    }
    if (!value.priority) {
      error.priority = "Priority is required";
    }
    if (!selectedOption) {
      error.supplier = "Client is required";
    }
    if (!value.assign_to_clearing) {
      error.assign_to_clearing = "Assign to clearing is required";
    }
    if (!value.send_to_warehouse) {
      error.send_to_warehouse = "Send to warehouse is required";
    }
    if (!value.shipment_origin) {
      error.shipment_origin = "Shipment origin is required";
    }
    if (!value.shipment_des) {
      error.shipment_des = "Shipment destination is required";
    }
    if (!value.insurance) {
      error.insurance = "insurance is required";
    }
    if (!value.shipment_ref) {
      error.shipment_ref = "shipment_ref is required";
    }
    Object.values(error).forEach((message) => {
      toast.error(message);
    });
    if (Object.keys(error).length === 0) {
      toast.error(error);
      apihit();
    }
    setError(error);
  };

  const apihit = () => {
    setLoader(true);
    console.log(reemail?.clientemail);
    console.log(selectedOption);
    console.log(reemail);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const data123 = {
      type: emailPattern.test(data.name_email) ? "email" : "name",
      value: data.name_email,
    };
    console.log(data123);
    const formdata = new FormData();
    formdata.append("client_ref", selectedOption.value);
    formdata.append("date", data.date);
    formdata.append("type", data.type);
    formdata.append("freight", data.freight);
    formdata.append("incoterm", data.incoterm);
    formdata.append("dimension", data.dimension);
    formdata.append("weight", data.weight);
    formdata.append("quote_received", data.quote_received);
    formdata.append("client_quoted", data.client_quoted);
    formdata.append("is_active", data.is_active);
    formdata.append("comment", data.comment);
    formdata.append("no_of_packages", data.no_of_packages);
    formdata.append("package_type", data.package_type);
    formdata.append("commodity", data.commodity);
    formdata.append("sales_representative", useridsales.id);
    formdata.append("hazardous", data.hazardous);
    formdata.append("country_of_origin", data.country_of_origin);
    formdata.append("destination_country", data.destination_country);
    formdata.append("supplier_address", data.shipper_address);
    formdata.append("port_of_loading", data.port_of_loading);
    formdata.append("post_of_discharge", data.post_of_discharge);
    formdata.append("place_of_delivery", data.place_of_delivery);
    formdata.append("ready_for_collection", data.ready_for_collection);
    formdata.append("require_for_delivery", data.require_for_delivery);
    formdata.append("transit_time", data.transit_time);
    formdata.append("priority", data.priority);
    formdata.append("user_id", useridsales.id);
    formdata.append(
      "client_email",
      reemail?.clientemail === undefined ? reemail : reemail.clientemail,
    );
    formdata.append("nature_of_hazard", data.nature_of_hazard);
    formdata.append("Product_Description", data.Product_Description);
    formdata.append("add_attachments", data.attachmentType);
    formdata.append("volumetric_weight", volumetricweight);
    formdata.append("assign_for_estimate", data.assign_for_estimate);
    formdata.append("assign_to_transporter", data.assign_to_transporter);
    formdata.append("assign_warehouse", data.send_to_warehouse);
    formdata.append("assign_to_clearing", data.assign_to_clearing);
    formdata.append("send_to_warehouse", data.send_to_warehouse);
    formdata.append("shipment_origin", data.shipment_origin);
    formdata.append("shipment_des", data.shipment_des);
    formdata.append("shipper_name", data.shipper_name);
    formdata.append("insurance", data.insurance);
    formdata.append("shipment_ref", data.shipment_ref);
    formdata.append("fcl_lcl", data.fcl_lcl);
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc.name);
      doc.files.forEach((file) => {
        formdata.append(doc.name, file);
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    formdata.append(
      "client_ref_name",
      refane == "[object Object]" ? selectedOption.clientemail : refane,
    );
    const keybane = data.documentName;
    Object.values(formFiles).forEach((files) => {
      files.forEach((file) => {
        formdata.append("document", file);
      });
    });
    console.log(formdata);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}add-freight`, formdata)
      .then((response) => {
        toast.success(response.data.message);
        if (response.data.success === true) {
          setLoader(false);
          setTimeout(() => {
            navigate("/Admin/managefreight");
          }, [1500]);
        }
      })
      .catch((error) => {
        setLoader(false);
        toast.error(error.response.data.message);
      });
  };
  const handlekey123 = (e) => {
    if ((e.charCode < 44 || e.charCode > 57) && e.charCode !== 46) {
      e.preventDefault();
    }
  };
  const handlekey = (e) => {
    if (e.charCode < 44 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  const Volumetricweight = (e) => {
    if (e.charCode < 44 || e.charCode > 57) {
      e.preventDefault();
    }
    const volumetricweight12 = 167 * parseInt(data.dimension);
    console.log(volumetricweight12);
  };
  const volumetricweight = 167 * parseInt(data.dimension);
  console.log(volumetricweight);
  useEffect(() => {
    getClient();
  }, []);
  const getClient = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}client-list`)
      .then((response) => {
        setLcientlist(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const options = lcientlist.map((item) => ({
    value: item.id,
    clientemail: item.email,
    label: item.full_name,
    clientrefval: item.client_ref,
  }));
  const customStyles = {
    control: (provided) => ({
      ...provided,
      textAlign: "center",
      height: "40px",
      padding: "",
      minHeight: "40px",
    }),
    singleValue: (provided) => ({
      ...provided,
      textAlign: "center",
      overflow: "visible",
    }),
    placeholder: (provided) => ({
      ...provided,
      textAlign: "center",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0",
      padding: "0",
    }),
  };
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };
  const toggleModal1 = () => {
    setModalOpen(false);
  };
  const ghandleaddcommodity = () => {
    const data111 = { name: data.name };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}addCommodity`, data111)
      .then((response) => {
        if (response.data.success === "true") toggleModal1();
        getdataap();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  useEffect(() => {
    getdataap();
  }, []);
  const getdataap = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getCommodities`)
      .then((response) => {
        console.log(response.data);
        setApidata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const getstaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}staff-list`,
      );
      console.log(response.data.data);
      setStaffdata(response.data.data);
    } catch (error) {
      console.log(error.response.data.data);
    }
  };
  const [show, setShow] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const docOptions = [
    { id: "Customs Documents", label: "Customs docs" },
    { id: "Supporting Documents", label: "Supporting docs" },
    { id: "Invoice, Packing List", label: "Invoice / Packing " },
    { id: "Product Literature", label: "Product Literature" },
    { id: "Letters of authority", label: "Letters of authority" },
    { id: "Waybills", label: "Freight Docs" },
    { id: "Waybills", label: "Shipping instruction" },
    { id: "AD_Quotations", label: "Attach Quote" },
    { id: "Supplier Invoices", label: "Supplier Invoices" },
  ];
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedDocs.find((doc) => doc.name === selected)) {
      setSelectedDocs([...selectedDocs, { name: selected, files: [] }]);
    }
  };
  const handleFileChangefil = (e, docName) => {
    const files = Array.from(e.target.files);
    setSelectedDocs((prev) =>
      prev.map((doc) => (doc.name === docName ? { ...doc, files } : doc)),
    );
  };
  const handleSave = () => {
    console.log("Uploaded Documents:", selectedDocs);
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc);
      doc.files.forEach((file) => {
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    handleClose();
  };
  return (
    <>
      {loader ? (
        <div class="loader-container">
          <div class="loader"></div>
          <p class="loader-text">Updating... This may take some time</p>
        </div>
      ) : (
        <div className="wpWrapper ">
          {modalOpen && (
            <div
              className="modal show d-block commodityModal"
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Commodity</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={toggleModal}
                      aria-label="Close"
                    >
                      <i class="fa fa-times" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <label>Add Commodity</label>
                    <input
                      className="form-control"
                      name="name"
                      onChange={handlechange}
                      placeholder="Add Commodity"
                    ></input>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn" onClick={toggleModal}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={ghandleaddcommodity}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <div className="d-flex gap-3">
                  <div style={{ cursor: "pointer" }}>
                    <ArrowBackIcon onClick={handleclick2} />
                  </div>
                  <div>
                    <h4 className="det_hd">Add Freight</h4>
                    <div className="line"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className=" add_fre_cd">
                <div className="row">
                  <div className="col-12">

                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <div className="borderShip updateLoading">
                      <div className="row">
                        <div className="col-6">
                          <label>Date</label>
                          <input
                            type="date"
                            className="form-control"
                            onChange={handlechange}
                            name="date"
                          />
                          <p className="text-danger mb-0">{error.date}</p>
                        </div>
                        <div className="col-6">
                          <label>Client</label>
                          <Select
                            value={selectedOption}
                            onChange={handleChange}
                            options={options}
                            placeholder="Select..."
                            styles={customStyles}
                            isSearchable
                          />
                          <p className="text-danger mb-0">{error.supplier}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Delivery Type</label>
                          <select name="type" onChange={handlechange}>
                            <option value="">Select</option>
                            <option value="express">Express</option>
                            <option value="normal">Consolidation</option>
                          </select>
                          <p className="text-danger mb-0">{error.type}</p>
                        </div>
                        <div className="col-6">
                          <label>Freight Type</label>
                          <select name="freight" onChange={handlechange}>
                            <option value="">Select</option>
                            <option value="Sea">Sea</option>
                            <option value="Air">Air</option>
                            <option value="Road">Road</option>
                          </select>
                          <p className="text-danger mb-0">{error.freight}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Estimated Transit Time</label>
                          <input
                            type="text"
                            onKeyPress={handlekey}
                            placeholder="Transit Time"
                            onChange={handlechange}
                            name="transit_time"
                            className="form-control"
                          />
                          <p className="text-danger  mb-0">
                            {error.transit_time}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>You are</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              style={{ cursor: "pointer" }}
                              id="collectOne1"
                              name="shipment_ref"
                              defaultValue="shipper"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectOne">Shipper</label>
                            <input
                              type="radio"
                              style={{ cursor: "pointer" }}
                              id="collectOne1"
                              name="shipment_ref"
                              defaultValue="consignee"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectTwo">Consignee</label>
                          </div>
                          <p className="text-danger mb-0">
                            {error.shipment_ref}
                          </p>
                        </div>
                        <div className="col-6">
                          <label>Type</label>
                          <select name="fcl_lcl" onChange={handlechange}>
                            <option value="">Select...</option>
                            <option value="FCL">FCL</option>
                            <option value="LCL">LCL</option>
                          </select>
                          <p className="text-danger mb-0">{error.fcl_lcl}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Priority </label>
                          <div className="shipRefer1 d-flex">
                            <div>
                              <input
                                type="radio"
                                id="shipper"
                                name="priority"
                                style={{ cursor: "pointer" }}
                                value="High"
                                onChange={handlechange}
                              />
                              <label htmlFor="shipper">High</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="shipper2"
                                style={{ cursor: "pointer" }}
                                name="priority"
                                value="Medium"
                                onChange={handlechange}
                              />
                              <label htmlFor="consignee">Medium</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="shipper3"
                                name="priority"
                                style={{ cursor: "pointer" }}
                                value="Low"
                                onChange={handlechange}
                              />
                              <label htmlFor="mediumPr">Low</label>
                            </div>
                          </div>
                          <p className="text-danger mb-0">{error.priority}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="borderShip updateLoading">
                      <div className="row g-2">
                        <div className="col-xl-6 col-lg-12 col-md-12">
                          <label>Insurance</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              style={{ cursor: "pointer" }}
                              onChange={handlechange}
                              id="estYes1"
                              name="insurance"
                              value="Yes"
                            />
                            <label htmlFor="estYes1">Yes</label>
                            <input
                              type="radio"
                              style={{ cursor: "pointer" }}
                              onChange={handlechange}
                              id="estNo1"
                              name="insurance"
                              value="No"
                            />
                            <label htmlFor="estNo1">No</label>
                          </div>
                          <p className="text-danger mb-0">{error.is_active}</p>
                        </div>

                        <div className="col-xl-6 col-lg-12 col-md-12">
                          <label>Assign to Clearing</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              id="clearingOne"
                              name="assign_to_clearing"
                              style={{ cursor: "pointer" }}
                              defaultValue="Yes"
                              onChange={handlechange}
                            />
                            <label htmlFor="clearingOne">Yes</label>
                            <input
                              type="radio"
                              id="clearingTwo"
                              name="assign_to_clearing"
                              defaultValue="No"
                              style={{ cursor: "pointer" }}
                              onChange={handlechange}
                            />
                            <label htmlFor="clearingTwo">No</label>
                          </div>
                          <p className="text-danger mb-0">
                            {error.assign_to_clearing}
                          </p>
                        </div>
                        <div className="col-xl-6 col-lg-12 col-md-12">
                          <label>Send to Warehouse</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              id="warehouseOne"
                              name="send_to_warehouse"
                              style={{ cursor: "pointer" }}
                              defaultValue="Yes"
                              onChange={handlechange}
                            />
                            <label htmlFor="warehouseOne">Yes</label>
                            <input
                              type="radio"
                              id="warehouseTwo"
                              name="send_to_warehouse"
                              defaultValue="No"
                              onChange={handlechange}
                              style={{ cursor: "pointer" }}
                            />
                            <label htmlFor="warehouseTwo">No</label>
                          </div>
                          <p className="text-danger mb-0">
                            {error.send_to_warehouse}
                          </p>
                        </div>

                        <div className="col-xl-6 col-lg-12 col-md-12">
                          <label>Required for Collection</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              id="collectOne"
                              name="ready_for_collection"
                              style={{ cursor: "pointer" }}
                              defaultValue="yes"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectOne">Yes</label>
                            <input
                              type="radio"
                              id="collectOne"
                              name="ready_for_collection"
                              style={{ cursor: "pointer" }}
                              defaultValue="no"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectTwo">No</label>
                          </div>
                          <p className="text-danger mb-0">
                            {error.ready_for_collection}
                          </p>
                        </div>

                        <div className="col-xl-6 col-lg-12 col-md-12">
                          <label>Required for Delivery</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              id="collectOne"
                              name="require_for_delivery"
                              style={{ cursor: "pointer" }}
                              defaultValue="yes"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectOne">Yes</label>
                            <input
                              type="radio"
                              id="collectOne"
                              name="require_for_delivery"
                              style={{ cursor: "pointer" }}
                              defaultValue="no"
                              onChange={handlechange}
                            />
                            <label htmlFor="collectTwo">No</label>
                          </div>
                          <p className="text-danger mb-0">
                            {error.require_for_delivery}
                          </p>
                        </div>
                      </div>
                      <div className="row"></div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12 mt-3">
                    <h4 className="freight_hd">Cargo transit details</h4>
                    <span class="line"></span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="borderShip updateLoading">
                      <div className="row">
                        <div className="col-6">
                          <label>Country of Origin</label>
                          <select
                            name="country_of_origin"
                            onChange={handlechange}
                          >
                            <option>Select</option>
                            {countries &&
                              countries.length > 0 &&
                              countries.map((item, index) => {
                                return (
                                  <>
                                    <option key={index} value={item.id}>
                                      {item.name}
                                    </option>
                                  </>
                                );
                              })}
                          </select>
                          <p className="text-danger mb-0">
                            {error.country_of_origin}
                          </p>
                        </div>
                        <div className="col-6">
                          <label> Destination Country</label>
                          <select
                            name="destination_country"
                            onChange={handlechange}
                          >
                            <option>Select</option>
                            {countries &&
                              countries.length > 0 &&
                              countries.map((item, index) => {
                                return (
                                  <>
                                    <option key={index} value={item.id}>
                                      {item.name}
                                    </option>
                                  </>
                                );
                              })}
                          </select>
                          <p className="text-danger mb-0">
                            {error.destination_country}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Port of Loading</label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="port_of_loading"
                            placeholder="Port of Loading"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">
                            {error.port_of_loading}
                          </p>
                        </div>
                        <div className="col-6">
                          <label>Port of Discharge</label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="post_of_discharge"
                            placeholder="Port of Discharge"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">
                            {error.post_of_discharge}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        {data.shipment_ref === "shipper" ? (
                          <>
                            <div className="col-6">
                              <label>Consignee Name</label>
                              <input
                                type="text"
                                onChange={handlechange}
                                name="shipper_name"
                                placeholder="Consignee Name"
                                className="form-control"
                              />
                              <p className="text-danger mb-0">
                                {error.consignee_name}
                              </p>
                            </div>
                            <div className="col-6">
                              <label>Consignee Address</label>
                              <input
                                type="text"
                                onChange={handlechange}
                                name="shipper_address"
                                placeholder="Consignee Address"
                                className="form-control"
                              />
                              <p className="text-danger mb-0">
                                {error.consignee_address}
                              </p>
                            </div>
                          </>
                        ) : data.shipment_ref === "consignee" ? (
                          <>
                            <div className="col-6">
                              <label>Shipper Name</label>
                              <input
                                type="text"
                                onChange={handlechange}
                                name="shipper_name"
                                placeholder="Shipper Name"
                                className="form-control"
                              />
                              <p className="text-danger mb-0">
                                {error.shipper_name}
                              </p>
                            </div>
                            <div className="col-6">
                              <label>Shipper Address</label>
                              <input
                                type="text"
                                onChange={handlechange}
                                name="shipper_address"
                                placeholder="Shipper Address"
                                className="form-control"
                              />
                              <p className="text-danger mb-0">
                                {error.shipper_address}
                              </p>
                            </div>
                          </>
                        ) : null}
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Place of Delivery</label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="place_of_delivery"
                            placeholder="Place of Delivery"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">
                            {error.place_of_delivery}
                          </p>
                        </div>
                        <div className="col-6">
                          <label>Incoterm</label>
                          <select name="incoterm" onChange={handlechange}>
                            <option value="">Select...</option>
                            <option value="CFR">CFR</option>
                            <option value="CIF">CIF</option>
                            <option value="DAP">DAP</option>
                            <option value="DDU">DDU</option>
                            <option value="DDP">DDP</option>
                            <option value="EXW">EXW</option>
                            <option value="FCA">FCA</option>
                            <option value="FOB">FOB </option>
                          </select>
                          <p className="text-danger mb-0">{error.incoterm}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>Client Reference</label>
                          <input
                            type="text"
                            className="w-100 rounded"
                            name="client_ref_name"
                            value={refane?.clientrefval}
                            placeholder="Client Reference"
                            onChange={handleChange1inpo}
                          />
                        </div>
                        <div className="col-6">
                          <label>Name / Email</label>
                          <input
                            name="name_email"
                            value={reemail.clientemail}
                            onChange={handleChangeemail}
                            className="form-control"
                            placeholder="Name / Email"
                          ></input>
                          <p className="text-danger mb-0">{error.fcl_lcl}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12 mt-3">
                    <h4 className="freight_hd">Loading details</h4>
                    <span class="line"></span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="borderShip updateLoading1">
                      <div className="row">
                        <div className="col-6">
                          <label>Origin</label>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_origin"
                                value="Shipper will deliver at Asia Direct - Africa warehouse"
                              />
                            </div>
                            <div className="childshipper ms-2">
                              <p className="mb-0">
                                Shipper will deliver at Asia Direct - Africa
                                warehouse
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_origin"
                                value="Asia Direct will collect from shipper address"
                              />
                            </div>
                            <div className="childshipper ms-2">
                              <p className="mb-0">
                                Asia Direct will collect from shipper address
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_origin"
                                value="Shipper will deliver to the port of loading"
                              />
                            </div>
                            <div className="childshipper ms-2">
                              <p className="mb-0">
                                Shipper will deliver to the port of loading,
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_origin"
                                value="Shipper will deliver and facilitate export at the Port of loading"
                              />
                            </div>
                            <div className="childshipper ms-2">
                              <p className="mb-0">
                                Shipper will deliver and facilitate export at
                                the Port of loading
                              </p>
                            </div>
                          </div>
                          <p className="text-danger mb-0">
                            {error.shipment_origin}
                          </p>
                        </div>
                        <div className="col-6">
                          <label>Destination</label>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_des"
                                value="Asia Direct will deliver to the Address"
                              />
                            </div>
                            <div className="childshipper ms-3">
                              <p className="mb-0">
                                Asia Direct will deliver to the Address.
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_des"
                                value="Consignee will collect at Asia Direct - Africa warehouse"
                              />
                            </div>
                            <div className="childshipper ms-3">
                              <p className="mb-0">
                                Consignee will collect at Asia Direct - Africa
                                warehouse
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_des"
                                value="Consignee will collect at the nearest port"
                              />
                            </div>
                            <div className="childshipper ms-3">
                              <p className="mb-0">
                                Consignee will collect at the nearest port
                              </p>
                            </div>
                          </div>
                          <div className="parentShipper">
                            <div className="childshipper">
                              <input
                                type="radio"
                                onChange={handlechange}
                                style={{ cursor: "pointer" }}
                                name="shipment_des"
                                value="Consignee will collect and facilitate import at destination port"
                              />
                            </div>
                            <div className="childshipper ms-3">
                              <p className="mb-0">
                                Consignee will collect and facilitate import at
                                destination port
                              </p>
                            </div>
                          </div>
                          <p className="text-danger mb-0">
                            {error.shipment_des}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-12 mt-3">
                    <h4 className="freight_hd">Cargo Information</h4>
                    <span class="line"></span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="borderShip updateLoading">
                      <div className="row">
                        <div className="col-6">
                          <label>Package Type</label>
                          <select name="package_type" onChange={handlechange}>
                            <option value="">Select...</option>
                            <option value="box">Box</option>
                            <option value="crate">Crate</option>
                            <option value="pallet">Pallet</option>
                            <option value="bags">Bags</option>
                          </select>
                          <p className="text-danger mb-0">
                            {error.package_type}
                          </p>
                        </div>
                        <div className="col-6 ">
                          <label>Commodity</label>
                          <div className="commoButton w-100">
                            <select
                              name="commodity"
                              onChange={handlechange}
                              placeholder="commodity"
                              className="w-100"
                            >
                              <option>Select...</option>
                              {apidata &&
                                apidata.length > 0 &&
                                apidata.map((item, index) => {
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
                          <p className="text-danger mb-0">{error.commodity}</p>
                        </div>
                      </div>
                      <div className="row">
                        {data.hazardous === "yes" ? (
                          <div className=" col-6">
                            <label>Nature of hazard</label>
                            <select
                              name="nature_of_hazard"
                              onChange={handlechange}
                            >
                              <option value="">Select</option>
                              <option value="General Cargo">
                                General Cargo
                              </option>
                              <option value="Explosive">Explosive</option>
                              <option value="Class 3 flammable liquids">
                                Class 3 flammable liquids
                              </option>
                              <option value="Corrosives">Corrosives</option>
                              <option value="Class 2 gases">
                                Class 2 gases
                              </option>
                              <option value="Compressed gas">
                                Compressed gas
                              </option>
                              <option value="Infection">Infection</option>
                              <option value="Corrosive">Corrosive</option>
                              <option value="Flammable">Flammable</option>
                              <option value="Flammable solids">
                                Flammable solids
                              </option>
                              <option value="Organic peroxides">
                                Organic peroxides
                              </option>
                              <option value="Toxic substances">
                                Toxic substances
                              </option>
                              <option value="Class 9 other substances and articles">
                                Class 9 other substances and articles
                              </option>
                              <option value="Dry ice">Dry ice</option>
                              <option value="Poison">Poison</option>
                              <option value="Batteries">Batteries</option>
                              <option value="Gases">Gases</option>
                              <option value="Refrigerated">Refrigerated</option>
                              <option value="Inflammable">Inflammable</option>
                              <option value="Air bags">Air bags</option>
                              <option value="Ammunition">Ammunition</option>
                              <option value="Cigarette lighters">
                                Cigarette lighters
                              </option>
                              <option value="Lithium batteries">
                                Lithium batteries
                              </option>
                            </select>
                            <p className="text-danger mb-0">
                              {error.nature_of_hazard}
                            </p>
                          </div>
                        ) : (
                          ""
                        )}
                        <div className="col-6">
                          <label>Product Description</label>
                          <input
                            type="text"
                            name="Product_Description"
                            onChange={handlechange}
                            placeholder="Product Description"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">
                            {error.Product_Description}
                          </p>
                        </div>
                        <div className="col-6 ">
                          <label>Hazardous</label>
                          <div className="shipRefer1">
                            <input
                              type="radio"
                              id="HazardousOne"
                              name="hazardous"
                              style={{ cursor: "pointer" }}
                              defaultValue="yes"
                              onChange={handlechange}
                            />
                            <label htmlFor="HazardousOne">Yes</label>
                            <input
                              type="radio"
                              id="HazardousOne"
                              style={{ cursor: "pointer" }}
                              name="hazardous"
                              defaultValue="no"
                              onChange={handlechange}
                            />
                            <label htmlFor="HazardousTwo">No</label>
                          </div>
                          <p className="text-danger mb-0">{error.hazardous}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label>No. of Packages</label>
                          <input
                            type="text"
                            onKeyPress={handlekey}
                            name="no_of_packages"
                            placeholder="Num.. of Package"
                            onChange={handlechange}
                            className="form-control"
                          />
                          <p className="text-danger mb-0">
                            {error.no_of_packages}
                          </p>
                        </div>
                        <div className="col-6">
                          <label>Dimension</label>
                          <input
                            type="text"
                            onKeyPress={handlekey123}
                            name="dimension"
                            onChange={handlechange}
                            placeholder="Dimension"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">{error.dimension}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <label> Weight</label>
                          <input
                            type="text"
                            onKeyPress={handlekey123}
                            name="weight"
                            onChange={handlechange}
                            placeholder="Weight"
                            className="form-control"
                          />
                          <p className="text-danger mb-0">{error.weight}</p>
                        </div>
                        <div className="col-6">
                          <label>Volumetric Weight</label>
                          <input
                            type="text"
                            onKeyPress={handlekey}
                            value={
                              isNaN(volumetricweight) === true
                                ? ""
                                : volumetricweight
                            }
                            name="volumetric_weight"
                            placeholder="Volumetric Weight"
                            className="form-control"
                          />
                        </div>
                      </div>
                      <div className="row mb-3 mt-4  align-items-center">
                        <div className="col-md-6">
                          <h4 className="freight_hd">Document Section</h4>
                          <span class="line"></span>
                        </div>
                        <div className="col-md-6 text-end">
                          <button className="blueBtn" variant="primary" onClick={handleShow}>
                            Upload Documents
                          </button>
                        </div>
                      </div>
                      <Modal
                        show={show}
                        onHide={handleClose}
                        centered
                      >
                        <Modal.Header>
                          <Modal.Title>Upload Documents</Modal.Title>

                          <button
                            type="button"
                            className="btn-close crossReact"
                            onClick={handleClose}
                            aria-label="Close"
                          >
                            <i class="fa fa-times" aria-hidden="true"></i>

                          </button>
                        </Modal.Header>
                        <Modal.Body>
                          <Form.Select onChange={handleSelect} defaultValue="">
                            <option value="" disabled>
                              Select Document Type
                            </option>
                            {docOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                          <div className="mt-3">
                            {selectedDocs.map((doc, index) => (
                              <div key={index} className="mb-3">
                                <label className="fw-bold">{doc.name}</label>
                                <input
                                  type="file"
                                  className="form-control"
                                  multiple
                                  accept="image/*,application/pdf"
                                  onChange={(e) =>
                                    handleFileChangefil(e, doc.name)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <button className="redBtn" variant="secondary" onClick={handleClose}>
                            Cancel
                          </button>
                          <button className="blueBtn" variant="success" onClick={handleSave}>
                            Save Documents
                          </button>
                        </Modal.Footer>
                      </Modal>
                      <div className="row">
                        <div className="col-12">
                          <label>Comment</label>
                          <textarea
                            name="comment"
                            id=""
                            onChange={handlechange}
                            className="form-control"
                            placeholder="write your comment here.."
                          ></textarea>
                          <p className="text-danger mb-0">{error.comment}</p>
                        </div>
                      </div>
                      <div className="btnAddFre">
                        <button onClick={handleclick}>Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
export default Addfright;
