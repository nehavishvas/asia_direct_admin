import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Box, FormControl } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, InputLabel, MenuItem, Modal, Select } from "@mui/material";

export default function Addshipment() {
  const location = useLocation();
  const data123 = location?.state?.id || {};
  const [data, setData] = useState({
    freight: data123.freight || "",
    carrier: data123.carrier || "",
    vessel: data123.vessel || "",
    ETD: data123.ETD || "",
    ATD: data123.ATD || "",
    status: data123.status || "",
    origin_agent: data123.origin_agent || "",
    port_of_loading: data123.port_of_loading || "",
    port_of_discharge: data123.port_of_discharge || "",
    destination_agent: data123.destination_agent || "",
    origin_country_id: data123.origin_country_id || "",
    des_country_id: data123.des_country_id || "",
    load: data123.load || "",
    release_type: data123.release_type || "",
  });

  const [clearanceOrder, setClearanceOrder] = useState([]);
  const [show1, setShow1] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const docOptions = [
    { id: "Waybills", label: "Master Bill" },
    { id: "Waybills", label: "House bill" },
    { id: "Waybills", label: "Arrival Notification" },
    { id: "Supporting Documents", label: "Detention Notice" },
    { id: "Release", label: "Release" },
  ];
  const handleShow = () => setShow1(true);
  const handleClose = () => setShow1(false);

  // Handle dropdown change
  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedDocs.find((doc) => doc.name === selected)) {
      setSelectedDocs([...selectedDocs, { name: selected, files: [] }]);
    }
  };

  // Handle file upload for each document type
  const handleFileChangefil = (e, docName) => {
    const files = Array.from(e.target.files);
    setSelectedDocs((prev) =>
      prev.map((doc) =>
        doc.name === docName ? { ...doc, files } : doc
      )
    );
  };

  // For saving data (you can send to API)
  const handleSave = () => {
    console.log("Uploaded Documents:", selectedDocs);
    // To see filenames instead of [object Object]
    selectedDocs.forEach(doc => {
      console.log("Doc Type:", doc);
      doc.files.forEach(file => {
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    handleClose();
  };

  const [data1, setData1] = useState("");
  const [freightOptions, setFreightOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [filedata, setFiledata] = useState(null);
  const [clearanceArray, setClearanceArray] = useState([]);
  const [aggregatedArray, setAggregatedArray] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOption1, setSelectedOption1] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    getFreightOptions(data);
    getBatchOptions(data);
    GetClearanceOrder(data);
  }, [data?.des_country_id, data?.origin_country_id]);

  const getFreightOptions = async (data) => {
    try {
      const payload = {
        des_country_id: data.des_country_id,
        origin_country_id: data.origin_country_id,
        freight: data.freight,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}AllFreightOrderNumbers`,
        payload
      );
      setFreightOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching freight options:", error.message);
    }
  };

  const GetClearanceOrder = async (data) => {
    try {
      const payload = {
        destination: data.des_country_id,
        origin: data.origin_country_id,
        freight: data.freight,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getClerance`,
        payload
      );
      console.log(response.data.data)
      setClearanceOrder(response.data.data);
    } catch (error) {
      console.error("Error fetching freight options:", error.message);
    }
  }

  const getBatchOptions = async (data) => {
    try {
      const payload = {
        des_country_id: data.des_country_id,
        origin_country_id: data.origin_country_id,
        freight: data.freight,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}AllBatchNumbers`,
        payload
      );
      setBatchOptions(response.data.data);
    } catch (error) {
      console.error("Error fetching batch options:", error.message);
    }
  };
  const getCountries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}GetCountries`
      );
      setCountries(response.data.data);
    } catch (error) {
      console.error("Error fetching countries:", error.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleInputChange1 = (e) => {
    const { name, value } = e.target;
    setData1((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleOptionChange = (event, newValue) => {
    console.log(newValue)
    setSelectedOption(newValue);
  };

  const addShipment = async () => {
    const requiredFields = {
      load: "Load",
      carrier: "Carrier",
      freight: "Freight",
      ATD: "ATD",
      ETD: "ETD",
      port_of_loading: "Port of Loading",
      port_of_discharge: "Port of Discharge",
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !data[key] || data[key].toString().trim() === "")
      .map(([_, label]) => label);
    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(", ")}`);
      return;
    }
    const formdata = new FormData();
    formdata.append("ATD", data.ATD);
    formdata.append("ETD", data.ETD);
    formdata.append("carrier", data.carrier);
    formdata.append("container", data.container);
    formdata.append("des_country_id", data.des_country_id);
    formdata.append("destination_agent", data.destination_agent);
    formdata.append("freight", data.freight);
    formdata.append("load", data.load);
    formdata.append("origin_agent", data.origin_agent);
    formdata.append("origin_country_id", data.origin_country_id);
    formdata.append("port_of_discharge", data.port_of_discharge);
    formdata.append("port_of_loading", data.port_of_loading);
    formdata.append("release_type", data.release_type);
    formdata.append("seal", data.seal);
    formdata.append("status", data.status);
    formdata.append("vessel", data.vessel);
    formdata.append("waybill", data.waybill);
    formdata.append("details", JSON.stringify(aggregatedArray));
    formdata.append("date_of_dispatch", data.date_of_dispatch);
    formdata.append("documentName", data.documentName);
    selectedDocs.forEach((doc) => {
      doc.files.forEach((file) => {
        formdata.append(doc.name, file);
      });
    });
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}AddShipment`,
        formdata
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/Admin/manage-shipment");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding shipment");
    }
  };

  const handleclickprintdate = async () => {
    const origin_country_id = data.origin_country_id;
    const des_country_id = data.des_country_id;

    try {
      if (data1.shipment_waybill === "Assign Clearance") {
        if (!selectedOption1) {
          toast.error("Please select a clearance order.");
          return;
        }
        const payload = {
          type: "3",
          id: selectedOption1.id,
          origin_country_id,
          des_country_id
        };
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}getAssignShipmentList`,
          payload
        );
        setClearanceArray(prev => [
          ...prev,
          ...response.data.data
        ]);
        setAggregatedArray(prev => [
          ...prev,
          ...response.data.data
        ]);
        toast.success("Clearance added successfully.");
        return;
      }
      if (data1.shipment_waybill === "freight") {
        if (!selectedOption) {
          toast.error("Please select a freight order.");
          return;
        }
        const payload = {
          type: "1",
          id: selectedOption.order_id,
          origin_country_id,
          des_country_id
        };
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}getAssignShipmentList`,
          payload
        );
        setAggregatedArray(prev => [
          ...prev,
          ...response.data.data
        ]);
        toast.success("Freight added successfully.");
        return;
      }
      if (data1.shipment_waybill === "batch") {
        if (!selectedOption) {
          toast.error("Please select a batch.");
          return;
        }
        const payload = {
          type: "2",
          id: selectedOption.batch_id,
          origin_country_id,
          des_country_id
        };
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}getAssignShipmentList`,
          payload
        );
        setAggregatedArray(prev => [
          ...prev,
          ...response.data.data
        ]);
        toast.success("Batch added successfully.");
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const handleClick = (item) => {
    // Remove from aggregated array
    setAggregatedArray((prev) =>
      prev.filter((currentItem) => currentItem !== item)
    );

    // Remove from clearance array ALSO
    setClearanceArray((prev) =>
      prev.filter((currentItem) => currentItem !== item)
    );
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className=" ">
          <h4 className="freight_hd">
            <ArrowBackIcon
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/Admin/manage-shipment")}
              className="me-2 fw-bold"
            />
            Shipment Details / Form
          </h4>
          <div className="col-lg-12">
            <h4 className="mt-4">Vessel Detals</h4>
            <span className="line"></span>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="borderShipNew ">
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">Freight</label>
                    <select
                      value={data?.freight}
                      name="freight"
                      onChange={handleInputChange}
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    >
                      <option>Select...</option>
                      <option>Sea</option>
                      <option>Air</option>
                      <option>Road</option>
                    </select>
                  </div>
                  <div className="col-lg-6">
                    <label className="ware_label">Waybill</label>
                    <input
                      type="text"
                      name="waybill"
                      onChange={handleInputChange}
                      placeholder="Waybill"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">Carrier</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      name="carrier"
                      value={data?.carrier}
                      placeholder="Carrier"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ware_label">Vessel</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      value={data?.vessel}
                      name="vessel"
                      placeholder="Vessel"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">Container No.</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      name="container"
                      placeholder="Container No."
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ware_label">House Bill</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      name="load"
                      value={data?.load}
                      placeholder="Load"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                  <div className="col-12">
                    <label className="ware_label">Release Type</label>
                    <input
                      type="text"
                      value={data?.release_type}
                      onChange={handleInputChange}
                      name="release_type"
                      placeholder="Release Type"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mt-4">Transit Details</h4>
                <span className="line"></span>
              </div>
              <div className="borderShipNew ">
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">Country of Origin</label>
                    <select
                      className="mb-3 border ps-2 py-2 rounded w-100"
                      name="origin_country_id"
                      value={data?.origin_country_id}
                      onChange={handleInputChange}
                    >
                      <option>Select...</option>
                      {countries.map((item, index) => {
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
                    <label className="ware_label">
                      Country of Destination{" "}
                    </label>
                    <select
                      className="mb-3 border ps-2 py-2 rounded w-100"
                      name="des_country_id"
                      value={data?.des_country_id}
                      onChange={handleInputChange}
                    >
                      <option>Select...</option>
                      {countries.map((item, index) => {
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
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">Place of Loading</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      value={data?.port_of_loading}
                      name="port_of_loading"
                      placeholder="Place of Loading"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ware_label">Place of Delivery</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      value={data?.port_of_discharge}
                      name="port_of_discharge"
                      placeholder="Place of Delivery"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="ware_label">ETD</label>
                    <input
                      type="date"
                      onChange={handleInputChange}
                      value={data?.ETD}
                      name="ETD"
                      className=" mb-0 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                  <div className="col-6">
                    <label className="ware_label">ETA</label>
                    <input
                      type="date"
                      value={data?.ATD}
                      onChange={handleInputChange}
                      name="ATD"
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>
                </div>
                <div className="row noFormaControl">
                  <div className="col-6">
                    <label className="ware_label">Origin Agent</label>
                    <select
                      className="mb-3 py-2"
                      onChange={handleInputChange}
                      value={data?.origin_agent}
                      name="origin_agent"
                    >
                      <option>Select...</option>
                      <option>Asia Direct</option>
                      <option>OBD Logistics</option>
                      <option>Shenzhen Nimbus Shipping</option>
                      <option>Shenzhen Portline</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="ware_label">Destination Agent</label>
                    <select
                      className="mb-3 border ps-2 py-2 rounded w-100"
                      name="destination_agent"
                      value={data?.destination_agent}
                      onChange={handleInputChange}
                    >
                      <option>Select...</option>
                      <option>Afristar</option>
                      <option>Asia Direct - Africa</option>
                      <option>Contra Consolidations</option>
                      <option>DHL</option>
                      <option>Fedex</option>
                      <option>SACO CFR</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="row">
                <div className="col-12">
                  <label className="ware_label">Status</label>
                  <select
                    onChange={handleInputChange}
                    name="status"
                    value={data?.status}
                    placeholder="Email address"
                    className="mb-3 border ps-2 py-2 rounded w-100"
                  >
                    <option>Select</option>
                    <option value="Goods at origin port">
                      Goods at origin port
                    </option>
                    <option value="Goods are in transit">
                      Goods are in transit
                    </option>
                    <option value="Arrived at destination port">
                      Arrived at destination port
                    </option>
                    <option value="Customs clearing in progress">
                      Customs clearing in progress
                    </option>
                    <option value="Customs released">Customs released</option>
                  </select>
                </div>
              </div>
              <div className="borderShipNew Right">
                <div className="row">
                  <div className="col-12">
                    <label className="ware_label">Seal No.</label>
                    <input
                      type="text"
                      onChange={handleInputChange}
                      name="seal"
                      placeholder="Seal No."
                      className="mb-3 border ps-2 py-2 rounded w-100"
                    />
                  </div>


                  <div className="row mb-3 mt-4">

                    <div className=" mt-3">
                      <h4 className="freight_hd">Document Section</h4>
                      <span class="line"></span>
                    </div>
                    <div className="mt-2">
                      <button className="uploadBtn" onClick={handleShow}>
                        Upload Documents
                      </button>

                      {
                        show1 ? <Modal
                          open={show1}
                          onClose={handleClose}
                          slotProps={{
                            backdrop: {
                              sx: { backgroundColor: "rgba(0,0,0,0.2)" }, // lighter background
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 3,
                              bgcolor: "background.paper",
                              borderRadius: 2,
                              width: 500,
                              mx: "auto",
                              mt: 10,
                            }}
                          >
                            <h2>Upload Documents</h2>

                            {/* Dropdown */}
                            <FormControl fullWidth sx={{ mt: 2 }}>
                              <InputLabel id="doc-select-label">Select Document Type</InputLabel>
                              <Select
                                labelId="doc-select-label"
                                // value={selected}
                                onChange={handleSelect}
                              >
                                {docOptions.map((option) => (
                                  <MenuItem key={option.id} value={option.id}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            {/* Dynamic file inputs */}
                            <div className="mt-3">
                              {selectedDocs.map((doc, index) => (
                                <div key={index} className="mb-3">
                                  <label className="fw-bold">{doc.name}</label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleFileChangefil(e, doc.name)}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Footer buttons */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                              <Button onClick={handleClose}>Cancel</Button>
                              <Button variant="contained" color="success" onClick={handleSave}>
                                Save Documents
                              </Button>
                            </Box>
                          </Box>
                        </Modal> : ""
                      }
                    </div>

                  </div>
                </div>
              </div>
              <div className="borderShipNew Right ">
                <div className="row">
                  <h4 className="mt-3">Assign Shipments</h4>
                  <div className="col-12">
                    <label className="ware_label">Assign Shipment</label>
                    <select
                      onChange={handleInputChange1}
                      style={{ padding: "10px" }}
                      className="mb-3 border rounded w-100"
                      name="shipment_waybill"
                    >
                      <option>Select...</option>
                      <option value="freight">Freight / Order</option>
                      <option value="batch">Groupage / Batch</option>
                      <option value="Assign Clearance">Assign Clearance</option>
                    </select>
                  </div>
                  <div className="col-12 freightAuto searchManageFre">
                    <label className="ware_label">
                      {data1.shipment_waybill === "freight"
                        ? "Freight"
                        : "Batch"}
                    </label>
                    <Box sx={{ width: 300 }}>
                      <Autocomplete
                        options={
                          data1.shipment_waybill === "freight"
                            ? freightOptions
                            : batchOptions
                        }
                        getOptionLabel={(option) =>
                          data1.shipment_waybill === "freight"
                            ? `${option.freight_number || "N/A"} / ${option.order_number || "N/A"
                            }`
                            : option.batch_number
                        }
                        value={selectedOption}
                        onChange={handleOptionChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search & Select"
                            variant="outlined"
                          />
                        )}
                      />
                    </Box>
                  </div>
                  <div className="col-12 freightAuto searchManageFre">

                    {data1.shipment_waybill === "Assign Clearance" ? (
                      <>
                        <label className="ware_label mt-3">Add Clearance</label>
                        <Box sx={{ width: 280 }}>
                          <Autocomplete
                            options={clearanceOrder || []}
                            getOptionLabel={(option) =>
                              `${option.clearance_number}`
                            }
                            value={selectedOption1}
                            onChange={(event, newValue) => setSelectedOption1(newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search Clearance Number"
                                variant="outlined"
                              />
                            )}
                          />
                        </Box>
                      </>) : ""}
                  </div>
                  <div className="col-12" style={{ marginTop: "31px" }}>
                    <div className="text-center">
                      <button
                        className="btn addBtnShip  btn-secondary rounded py-2 px-2"
                        onClick={handleclickprintdate}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive mt-4">
            <h4>Freight / Order Details</h4>
            <table className="table  table-striped tableICon">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Freight / Order No.</th>
                  <th>Client Name</th>
                  <th>HAWB / Tracking</th>
                  <th>Total Weight</th>
                  <th>Total CBM</th>
                  <th>Nature of Goods</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedArray
                  ?.filter(item => !item.clearance_id)
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.freight_number} / {item.order_number}</td>
                      <td>{item.client_name}</td>
                      <td>{item.hawb}</td>
                      <td>{item.weight}</td>
                      <td>{item.dimensions}</td>
                      <td>{item.nature_of_goods}</td>
                      <td>
                        <DeleteIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClick(item)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* <button
              className="mt-4 btn btn-secondary w-50"
              onClick={addShipment}
            >
              Save Shipment
            </button> */}
          </div>
          <div className="table-responsive mt-4">
            <h4>Clearance Order Details</h4>
            <table className="table  table-striped tableICon">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Clearance Order.</th>
                  <th>Client Name</th>
                  <th>Order Status</th>
                  <th>Costumer ref.</th>
                  <th>Total BOX</th>
                  <th>Port of Discharge</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clearanceArray?.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {item?.clearance_number}
                    </td>
                    <td>{item?.client_name}</td>
                    <td>{item?.order_status}</td>
                    <td>{item?.customer_ref}</td>
                    <td>{item.total_box}</td>
                    <td>{item.port_of_discharge}</td>
                    <td>
                      <DeleteIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          handleClick(item);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 btn btn-secondary w-50"
              onClick={addShipment}
            >
              Save Shipment
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
