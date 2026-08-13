import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const AddBatch = () => {
  const [lcientlist, setLcientlist] = useState([]);
  const [apidata, setApidata] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showhazardous, setShowhazardous] = useState(false);
  const [data1, setData1] = useState("");
  const location = useLocation();
  const [formData2, setFormData2] = useState(null);
  const data123 = location?.state?.data;

  const [data, setData] = useState({
    date_created: data123?.date_created || "",
    date_of_first_received: data123?.date_first_received || "",
    ETD: data123?.ETD || "",
    total_days_in_storage: data123?.total_days_in_storage || "",
    Are_you: data123?.Are_you || "",
    freight: data123?.freight || "",
    Batch_Reference: data123?.Batch_Reference || "",
    Batch_Name: data123?.Batch_Name || "",
    freight_speed: data123?.freight_speed || "",
    freight_option: data123?.freight_option || "",
    Collection_from_Warehouse: data123?.Collection_from_Warehouse || "",
    Destination_from_Warehouse: data123?.Destination_from_Warehouse || "",
    country_of_origin: data123?.country_of_origin || "",
    destination_country: data123?.destination_country || "",
    port_of_loading: data123?.port_of_loading || "",
    post_of_discharge: data123?.post_of_discharge || "",
    Collection_Address: data123?.Collection_Address || "",
    Delivery_Address: data123?.Delivery_Address || "",
    Origin_Handler: data123?.Origin_Handler || "",
    Destination_Handler: data123?.Destination_Handler || "",
    cost_to_collect: data123?.cost_to_collect || "",
    destination_cost_to_collect: data123?.destination_cost_to_collect || "",
    warehouse_cost: data123?.warehouse_cost || "",
    destination_Warehouse_cost: data123?.destination_Warehouse_cost || "",
    Documentation_Costs: data123?.destination_Warehouse_cost || "",
    destination_Documentation_Costs:
      data123?.destination_Documentation_Costs || "",
    Oncarriage_Costs: data123?.Oncarriage_Costs || "",
    destination_On_carriage_Costs: data123?.destination_On_carriage_Costs || "",
    incidental_Cost: data123?.incidental_Cost || "",
    destination_incidental_cost: data123?.destination_incidental_cost || "",
    freight_cost: data123?.freight_cost || "",
    num_of_shipment: data123?.num_of_shipment || "",
    nature_of_goods: data123?.nature_of_goods || "",
    type_of_packing: data123?.type_of_packing || "",
    no_of_packages: data123?.no_of_packages || "",
    dimension: data123?.dimension || "",
    weight: data123?.weight || "",
    volumetric_weight: data123?.volumetric_weight || "",
    master_waybill: data123?.master_waybill || "",
    house_waybill: data123?.house_waybill || "",
    carrier: data123?.carrier || "",
    vessel: data123?.vessel || "",
    Container_no: data123?.Container_no || "",
    Delivery_Port_of_loading: data123?.Delivery_Port_of_loading || "",
    Delivery_Port_of_Discharge: data123?.Delivery_Port_of_Discharge || "",
    final_destination: data123?.final_destination || "",
    Origin_Carrier: data123?.Origin_Carrier || "",
    Destination_carrier: data123?.Destination_carrier || "",
    Registration_number: data123?.Registration_number || "",
    Destination_registration_number:
      data123?.Destination_registration_number || "",
    comment: data123?.comment || "",
  });

  const [error, setError] = useState({});
  const [countries, setCountruies] = useState([]);
  const navigate = useNavigate();
  
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setShowhazardous(data.hazardous);
  };

  const handlehange1 = (e) => {
    setData1(e.target.value);
    console.log(data1);
  };

  ////////////////////////////////////////////////////////////////getdate///////////////////////////////////////////////////////////////////////////
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;

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

  const handleclick = () => {
    apihit();
  };

  const apihit = () => {
    const data123 = {
      // warehouse_id,
      date_created: formattedDate,
      date_first_received: data.date_of_first_received,
      ETD: data.ETD,
      total_days_storage: data.total_days_in_storage,
      is_exporImport: data.Are_you,
      freight: data1,
      batch_number: data.Batch_Reference,
      batch_name: data.Batch_Name,
      freight_speed: data.freight_speed,
      freight_option: data.freight_option,
      collection_warehouse: data.Collection_from_Warehouse,
      delivery_warehouse: data.Destination_from_Warehouse,
      origin_country_id: data.country_of_origin,
      detination_country_id: data.destination_country,
      port_loading: data.port_of_loading,
      port_discharge: data.post_of_discharge,
      collection_address: data.Collection_Address,
      delivery_address: data.Delivery_Address,
      origin_handler: data.Origin_Handler,
      des_handler: data.Destination_Handler,
      costs_to_collect: data.cost_to_collect,
      costs_to_collect_des: data.destination_cost_to_collect,
      warehouse_cost: data.warehouse_cost,
      warehouse_cost_des: data.destination_Warehouse_cost,
      origin_doc_costs: data.Documentation_Costs,
      des_doc_costs: data.destination_Documentation_Costs,
      origin_oncarriage_costs: data.Oncarriage_Costs,
      des_oncarriage_costs: data.destination_On_carriage_Costs,
      origin_Incidental_costs: data.incidental_Cost,
      des_Incidental_costs: data.destination_incidental_cost,
      freight_cost: data.freight_cost,
      no_of_shipments: data.num_of_shipment,
      nature_of_good: data.nature_of_goods,
      type_of_packaging: data.type_of_packing,
      total_boxes: data.no_of_packages,
      total_dimensions: data.dimension,
      total_weight: data.weight,
      volumentric_weight: data.volumetric_weight,
      master_waybill: data.master_waybill,
      house_waybill: data.house_waybill,
      carrier: data.carrier,
      vessel: data.vessel,
      container_no: data.Container_no,
      devy_port_of_loading: data.Delivery_Port_of_loading,
      devy_port_of_discharge: data.Delivery_Port_of_Discharge,
      devy_final_des: data.final_destination,
      origin_carrier: data.Origin_Carrier,
      des_carrier: data.Destination_carrier,
      registration_number: data.Registration_number,
      comment: data.comment,
    };
    console.log(data123);
    setLoader(true);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}createBatch`, data123)
      .then((response) => {
        toast.success(response.data.message);
        if (response.data.success === true) {
          setLoader(false);
          setTimeout(() => {
            navigate("/Admin/Batches");
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

  useEffect(() => {
    getClient();
  }, []);

  const getClient = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}client-list`)
      .then((response) => {
        console.log(response.data.data);
        setLcientlist(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  useEffect(() => {
    getwarehouse();
  }, []);

  const getwarehouse = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getWarehouse`)
      .then((response) => {
        console.log(response.data);
        setApidata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const handleFileChange2 = (event) => {
    const files = event.target.files;
    setFormData2({ ...formData2, licenses: files });
  };

  return (
    <>
      <div className="wpWrapper ">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-12">
              <div className="d-flex ">
                <div>
                  <h4 className="freight_hd">Add Batch</h4>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className=" add_fre_cd">
              <div className="row">
                <div className="col-12">
                  <span class="line"></span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="borderShip updateLoading">
                    <div className="row">
                      <div className="col-6">
                        <label>Date Created</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formattedDate}
                          onChange={handlechange}
                          name="date_created"
                        />
                      </div>
                      <div className="col-6">
                        <label>Date of First Received</label>
                        <input
                          type="date"
                          name="date_of_first_received"
                          onChange={handlechange}
                          className="form-control"
                        ></input>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <label>Total Days in Storage</label>
                        <input
                          type="text"
                          name="total_days_in_storage"
                          value={data.total_days_in_storage}
                          onChange={handlechange}
                          onKeyPress={handlekey}
                          placeholder="Num of Days"
                          className="form-control"
                        ></input>
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
                            name="Are_you"
                            defaultValue="Exporting"
                            value={data.Are_you}
                            onChange={handlechange}
                          />
                          <label htmlFor="collectOne">Exporting</label>
                          <input
                            type="radio"
                            style={{ cursor: "pointer" }}
                            id="collectOne1"
                            name="Are_you"
                            value={data.Are_you}
                            defaultValue="Importing"
                            onChange={handlechange}
                          />
                          <label htmlFor="collectTwo">Importing</label>
                        </div>
                      </div>
                      <div className="col-6">
                        <label>Freight Type</label>
                        <select
                          name="freight"
                          value={data.freight}
                          onChange={handlehange1}
                        >
                          <option value="">Select</option>
                          <option value="Sea">Sea</option>
                          <option value="Air">Air</option>
                          <option value="Road">Road</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Batch Reference</label>
                        <input
                          type="text"
                          placeholder="Batch Reference"
                          onChange={handlechange}
                          name="Batch_Reference"
                          value={data.Batch_Reference}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Batch Name</label>
                        <input
                          type="text"
                          className="w-100 rounded"
                          name="Batch_Name"
                          value={data.Batch_Name}
                          placeholder="Batch Name"
                          onChange={handlechange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <label>Freight Speed</label>
                        <select
                          name="freight_speed"
                          value={data.freight_speed}
                          onChange={handlechange}
                        >
                          <option value="">Select</option>
                          <option value="Express">Express</option>
                          <option value="Normal">Normal</option>
                        </select>
                      </div>
                      {data1 === "Sea" ? (
                        <div className="col-6">
                          <label>Freight Option</label>
                          <select
                            name="freight_option"
                            onChange={handlechange}
                            value={data.freight_option}
                          >
                            <option value="">Select</option>
                            <option value="Full_container">
                              Full Container
                            </option>
                            <option value="Less_then_container_size">
                              Less then Container size
                            </option>
                          </select>
                        </div>
                      ) : data1 === "Air" ? (
                        ""
                      ) : data1 === "Road" ? (
                        <div className="col-6">
                          <label>Freight Option</label>
                          <select
                            name="freight_option"
                            value={data.freight_option}
                            onChange={handlechange}
                          >
                            <option value="">Select</option>
                            <option value="Full_Load">Full Load</option>
                            <option value="Small_cargo_for_console">
                              Small Cargo for Console
                            </option>
                          </select>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 mt-3">
                  <h4 className="freight_hd">Location Details</h4>
                  <span class="line"></span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="borderShip updateLoading noFormaControl">
                    <div className="row">
                      <div className="col-6">
                        <label>Collection from (Warehouse Name)</label>
                        <select
                          name="Collection_from_Warehouse"
                          value={data.Collection_from_Warehouse}
                          onChange={handlechange}
                          placeholder="Collection From Warehouse"
                        >
                          <option>Select...</option>
                          {apidata &&
                            apidata.length > 0 &&
                            apidata.map((item, index) => {
                              console.log(item);
                              return (
                                <>
                                  <option key={index} value={item.id}>
                                    {item.warehouse_name}
                                  </option>
                                </>
                              );
                            })}
                        </select>
                      </div>
                      <div className="col-6">
                        <label> Delivery to (Warehouse Name)</label>
                        <select
                          name="Destination_from_Warehouse"
                          onChange={handlechange}
                          value={data.Destination_from_Warehouse}
                          placeholder="Collection From Warehouse"
                        >
                          <option>Select...</option>
                          {apidata &&
                            apidata.length > 0 &&
                            apidata.map((item, index) => {
                              console.log(item);
                              return (
                                <>
                                  <option key={index} value={item.id}>
                                    {item.warehouse_name}
                                  </option>
                                </>
                              );
                            })}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Country of Origin</label>
                        <select
                          name="country_of_origin"
                          onChange={handlechange}
                          value={data.country_of_origin}
                        >
                          <option>Select</option>
                          {countries &&
                            countries.length > 0 &&
                            countries.map((item, index) => {
                              // console.log(item);
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
                        <label> Destination Country</label>
                        <select
                          name="destination_country"
                          onChange={handlechange}
                          value={data.destination_country}
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
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Port of Loading</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          name="port_of_loading"
                          value={data.port_of_loading}
                          placeholder="Port of Loading"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Port of Discharge</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          name="post_of_discharge"
                          value={data.post_of_discharge}
                          placeholder="Port of Discharge"
                          className="form-control"
                        />
                        <p className="text-danger mb-0">
                          {error.post_of_discharge}
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Collection Address</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          value={data.Collection_Address}
                          name="Collection_Address"
                          placeholder="Place of Delivery"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Delivery Address</label>
                        <input
                          name="Delivery_Address"
                          placeholder="Delivery Address"
                          className="form-control"
                          value={data.Delivery_Address}
                          onChange={handlechange}
                        ></input>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label className="ware_label">Origin Handler</label>
                        <select
                          className="mb-3 py-2"
                          name="Origin_Handler"
                          value={data.Origin_Handler}
                          onChange={handlechange}
                        >
                          <option>Select...</option>
                          <option>DHL</option>
                          <option>Fedex</option>
                          <option>SACO CFR</option>
                          <option>Contra Consolidations</option>
                          <option>Afristar</option>
                          <option>Asia Direct - Africa</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="ware_label">
                          Destination Handler
                        </label>
                        <select
                          className="mb-3 py-2"
                          name="Destination_Handler"
                          onChange={handlechange}
                          value={data.Destination_Handler}
                        >
                          <option>Select...</option>
                          <option>Shenzhen Nimbus Shipping</option>
                          <option>Shenzhen Portline</option>
                          <option>OBD Logistics</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 mt-3">
                  <h4 className="freight_hd">Cost details</h4>
                  <span class="line"></span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="borderShip ">
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="mb-3 fs-bold fw-bold">Origin</label>
                        <br />
                        <label>Cost to Collect</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          name="cost_to_collect"
                          value={data.cost_to_collect}
                          onKeyPress={handlekey123}
                          placeholder="Cost to Collect"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label className="mb-3 fs-bold fw-bold">
                          Destination
                        </label>
                        <br />
                        <label>Cost to Collect</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          value={data.destination_cost_to_collect}
                          onKeyPress={handlekey123}
                          name="destination_cost_to_collect"
                          placeholder="Cost to Collect"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>Warehouse Cost</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          name="warehouse_cost"
                          value={data.warehouse_cost}
                          placeholder="Warehouse Cost"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Warehouse Cost</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          value={data.destination_Warehouse_cost}
                          onKeyPress={handlekey123}
                          name="destination_Warehouse _cost"
                          placeholder="Warehouse Cost"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>Documentation Costs</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          value={data.Documentation_Costs}
                          name="Documentation_Costs"
                          placeholder="Documentation Costs"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Documentation Costs </label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          value={data.destination_Documentation_Costs}
                          name="destination_Warehouse_cost"
                          placeholder="Documentation Costs"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>On carriage Costs</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          name="Oncarriage_Costs"
                          placeholder="On carriage Costs"
                          value={data.Oncarriage_Costs}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>On carriage Costs</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          name="destination_On_carriage_Costs"
                          placeholder="On carriage Costs"
                          className="form-control"
                          value={data.destination_On_carriage_Costs}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>Incidental Cost</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          name="incidental_Cost"
                          placeholder="Incidental Cost"
                          value={data.incidental_Cost}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Incidental Cost</label>
                        <input
                          type="text"
                          onChange={handlechange}
                          onKeyPress={handlekey123}
                          value={data.destination_incidental_cost}
                          name="destination_incidental_cost"
                          placeholder="Incidental Cost"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12">
                        <label>Freight Cost</label>
                        <input
                          type="text"
                          onKeyPress={handlekey123}
                          onChange={handlechange}
                          name="freight_cost"
                          value={data.freight_cost}
                          placeholder="Freight Cost"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 mt-3">
                  <h4 className="freight_hd">Cargo Details</h4>
                  <span class="line"></span>
                </div>
              </div>
              <div className="row">
                <div>
                  <div className="col-3">
                    <label className="ware_label">Select Document</label>
                    <select
                      style={{ padding: "10px" }}
                      className="mb-3 border rounded w-100"
                      name="documentName"
                      onChange={handlechange}
                    >
                      <option value="">Select...</option>
                      <option value="Customs Documents">Customs docs</option>
                      <option value="Supporting Documents">
                        Supporting docs
                      </option>
                      <option value="Invoice, Packing List">
                        Invoice / Packing L
                      </option>
                      <option value="Product Literature">
                        Product Literature
                      </option>
                      <option value="Letters of authority">LOA</option>
                      <option value="Waybills">Freight Docs</option>
                      <option value="Waybills">Shipping instruction</option>
                      <option value="Supplier Invoices">
                        Freight Invoices{" "}
                      </option>
                      <option value="AD_Quotations">Attach Quote</option>
                    </select>
                  </div>
                </div>
                <div className="col-6 mt-3">
                  <h5>Upload Document</h5>
                  <input
                    type="file"
                    name="licenses"
                    className="mb-3 w-100 rounded"
                    onChange={handleFileChange2}
                    multiple
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="borderShip updateLoading">
                    <div className="row">
                      <div className="col-6">
                        <label>Num. of Shipment</label>
                        <input
                          name="num_of_shipment"
                          onChange={handlechange}
                          value={data.num_of_shipment}
                          placeholder="Number of Shipment"
                          className="form-control"
                        ></input>
                      </div>
                      <div className="col-6 ">
                        <label>Nature of Goods</label>
                        <select
                          name="nature_of_goods"
                          value={data.nature_of_goods}
                          onChange={handlechange}
                        >
                          <option value="">Select...</option>
                          <option value="General_Cargo">General Cargo</option>
                          <option value="Battery">Battery</option>
                          <option value="Liquids">Liquids</option>
                          <option value="Powders">Powders</option>
                          <option value="Harzadous">Harzadous</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <label>Type of Packing</label>
                        <select
                          name="type_of_packing"
                          value={data.type_of_packing}
                          onChange={handlechange}
                        >
                          <option>select...</option>
                          <option>Box</option>
                          <option>Crate</option>
                          <option>Pallet</option>
                          <option>Bags</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Total Box</label>
                        <input
                          type="text"
                          onKeyPress={handlekey}
                          name="no_of_packages"
                          value={data.no_of_packages}
                          placeholder="Num.. of Package"
                          onChange={handlechange}
                          className="form-control"
                        />
                        <p className="text-danger mb-0">
                          {error.no_of_packages}
                        </p>
                      </div>
                      <div className="col-6">
                        <label>Total Dimension</label>
                        <input
                          type="text"
                          onKeyPress={handlekey123}
                          name="dimension"
                          onChange={handlechange}
                          value={data.dimension}
                          placeholder="Dimension"
                          className="form-control"
                        />
                        <p className="text-danger mb-0">{error.dimension}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Total Weight</label>
                        <input
                          type="text"
                          onKeyPress={handlekey123}
                          name="weight"
                          onChange={handlechange}
                          value={data.weight}
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
                          onChange={handlechange}
                          //   value={isNaN(volumetricweight.toLocaleString())}
                          name="volumetric_weight"
                          placeholder="Volumetric Weight"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 mt-3">
                  <h4 className="freight_hd">Delivery details</h4>
                  <span class="line"></span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="borderShip updateLoading">
                    <div className="row">
                      <div className="col-6">
                        <label>Master Waybill</label>

                        <input
                          onChange={handlechange}
                          name="master_waybill"
                          value={data.master_waybill}
                          className="form-control"
                          placeholder="master_waybill"
                        ></input>
                      </div>

                      <div className="col-6 ">
                        <label>House Waybill</label>
                        <input
                          value={data.house_waybill}
                          onChange={handlechange}
                          name="house_waybill"
                          className="form-control"
                          placeholder="house_waybill"
                        ></input>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <label>Carrier</label>
                        <input
                          type="text"
                          //   onKeyPress={handlekey}
                          name="carrier"
                          value={data.carrier}
                          placeholder="carrier"
                          onChange={handlechange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Vessel</label>
                        <input
                          type="text"
                          name="vessel"
                          value={data.vessel}
                          onChange={handlechange}
                          placeholder="vessel"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <label>Container Number / Flight Number</label>
                        <input
                          type="text"
                          value={data.Container_no}
                          onKeyPress={handlekey123}
                          name="Container_no"
                          onChange={handlechange}
                          placeholder="Container_no"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Port of Loading</label>
                        <input
                          type="text"
                          value={data.Delivery_Port_of_loading}
                          //   onKeyPress={handlekey}
                          name="Delivery_Port_of_loading"
                          placeholder="Port of Loading"
                          onChange={handlechange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Port of Discharge</label>
                        <input
                          type="text"
                          value={data.Delivery_Port_of_Discharge}
                          name="Delivery_Port_of_Discharge"
                          onChange={handlechange}
                          placeholder="Port_of_Discharge"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <label>Final Destination</label>
                        <input
                          value={data.final_destination}
                          type="text"
                          name="final_destination"
                          onChange={handlechange}
                          placeholder="Final Destination"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Origin Carrier</label>
                        <input
                          type="text"
                          name="Origin_Carrier"
                          value={data.Origin_Carrier}
                          onChange={handlechange}
                          placeholder="Origin Carrier"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Destination Carrier</label>
                        <input
                          type="text"
                          value={data.Destination_carrier}
                          name="Destination_carrier"
                          onChange={handlechange}
                          placeholder="Destination carrier"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Registration Number</label>
                        <input
                          type="text"
                          value={data.Registration_number}
                          name="Registration_number"
                          onChange={handlechange}
                          placeholder="Registration Number"
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>comment </label>
                        <input
                          type="text"
                          value={data.comment}
                          name="comment"
                          onChange={handlechange}
                          placeholder="Comment"
                          className="form-control"
                        />
                      </div>
                      {/* <div className="col-6">
                        <label>Registration Number</label>
                        <input
                          type="text"
                          name="Destination_registration_number"
                          onChange={handlechange}
                          placeholder="Registration Number"
                          className="form-control"
                        />
                      </div> */}
                    </div>
                    {/* <div className="row">
                      <div className="col-6">
                        <label>comment </label>
                        <input
                          type="text"
                          name="comment"
                          onChange={handlechange}
                          placeholder="Comment"
                          className="form-control"
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="btnAddFre pt-4">
                <button
                  onClick={handleclick}
                  className="px-4 py-1 rounded text-white"
                  style={{ backgroundColor: "#1b2245" }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};
export default AddBatch;
