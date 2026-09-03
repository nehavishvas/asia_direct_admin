import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Delete } from "@mui/icons-material";
import Swal from "sweetalert2";

export default function BatchesOrder() {
  const [batch, setBatch] = useState([]);
  const [dataapi, setDataapi] = useState({});
  const [freightData, setFreightData] = useState([]);
  const [updatedata, setUpdatedata] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const datat1 = location.state.data;
  console.log(datat1);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  useEffect(() => {
    getdata();
  }, []);
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...dataapi, [name]: value });
  };
  const getdata = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getAllBatch`)
      .then((response) => {
        setBatch(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlechnage = (e) => {
    const { name, value } = e.target;
    setDataapi({ ...dataapi, [name]: value });
  };
  const batchId =
    location.state.data.id === null
      ? location.state.data.batch_id
      : location.state.data.id;
  console.log(batchId);
  useEffect(() => {
    clickapival();
  }, []);

  const clickapival = () => {
    const data1234 = { batch_id: batchId };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}getFreightsByBatch`, data1234)
      .then((response) => {
        console.log(response.data.data);
        setFreightData(response.data.data || []);
      })
      .catch((error) => {
        setFreightData([]);
        console.log(error.response?.data?.message || error.message, "No Batches Found");
      });
  };
  useEffect(() => {
    if (dataapi.dropval) {
      clickapival();
    }
  }, [dataapi.dropval]);
  const handleclcick = (item) => {
    navigate("/Admin/warehousedetails", { state: { data: item } });
  };

  const handleclcickrevert = async (item) => {
    const data123 = {
      freight_id: item.freight_id,
      batch_id: item.batch_id,
      order_id: item.order_id
    };
    console.log(data123);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}revertMovedFreight`,
          data123
        );
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response?.data?.message || "Order Deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
          clickapival();
        } else {
          toast.error(response.data.message || "Failed to delete Order.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleclicknav = () => {
    navigate("/Admin/Batches");
  };
  useEffect(() => {
    updatecountry();
  }, []);
  const updatecountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setUpdatedata(response.data.data);
      })
      .catch((error) => {
        console.group(error.response.data.message);
      });
  };
  const postData = () => {
    const data1 = {
      batch_id: batchId,
      delivery_type: dataapi.type,
      priority: dataapi.priority,
      country_of_origin: dataapi.origin,
      delivery_to_country: dataapi.destination,
      start_date: dataapi.startDate,
      end_date: dataapi.endDate,
      freight: dataapi.freight,
      type: dataapi.type,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}getFreightsByBatch`, data1)
      .then((response) => {
        if (response.data.success === true) {
          setFreightData(response.data.data);
          handleCloseModal();
        }
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div>
            <div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="d-flex justify-content-between gap-3">
                    <div className="d-flex gap-2">
                      <div>
                        <ArrowBackIcon
                          onClick={handleclicknav}
                          className="text-dark"
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      <div>
                        <h4 className="freight_hd" onClick={postData}>
                          Batches Order
                        </h4>
                      </div>
                    </div>
                    <div>
                      <button className="blueBtn">
                        {datat1.track_status}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4 viewDetails">
                <div className="col-md-4 pe-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Batchs</h6>
                      </div>
                      <div className="main_det">
                        <div className="ship_section_title">
                          <p className="ship_hd">
                            <i className="fi fi-rs-boxes-stacked build_icon"></i> Batch Info
                          </p>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Batch Number</p>
                            <p className="or_para">{datat1.batch_number}</p>
                          </div>
                          <div>
                            <p className="client_para">Batch Name</p>
                            <p className="or_para">{datat1.batch_name}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Origin</p>
                            <p className="or_para">{datat1.origin_country_name}</p>
                          </div>
                          <div>
                            <p className="client_para">Destination</p>
                            <p className="or_para">{datat1.des_country_name}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Origin Handler</p>
                            <p className="or_para">{datat1.origin_handler}</p>
                          </div>
                          <div>
                            <p className="client_para">Destination Handler</p>
                            <p className="or_para">{datat1.agent}</p>
                          </div>
                        </div>

                        <div className="view_box">
                          <p className="client_para">Warehouse</p>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Date Start</p>
                            <p className="or_para">
                              {new Date(datat1.created_at).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                          <div>
                            <p className="client_para">Date of Dispatch</p>
                            <p className="or_para">{datat1.date_dispatch}</p>
                          </div>
                        </div>

                        <div className="view_box">
                          <p className="client_para">Days in Storage</p>
                          <p className="or_para">{datat1.total_days_storage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Batch Costs</h6>
                      </div>
                      <div className="main_det">
                        <div className="ship_section_title">
                          <p className="ship_hd">
                            <i className="fi fi-rs-dollar build_icon"></i> Cost Breakdown
                          </p>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Dimension</p>
                            <p className="or_para">{datat1.total_dimensions}</p>
                          </div>
                          <div>
                            <p className="client_para">Weight</p>
                            <p className="or_para">{datat1.total_weight}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Freight Costs</p>
                            <p className="or_para">{datat1.freight_cost}</p>
                          </div>
                          <div>
                            <p className="client_para">Cost to Collect</p>
                            <p className="or_para">{datat1.costs_to_collect}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Warehouse Costs</p>
                            <p className="or_para">{datat1.warehouse_cost}</p>
                          </div>
                          <div>
                            <p className="client_para">Warehouse Costs Destination</p>
                            <p className="or_para">{datat1.warehouse_cost_des}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">On carriage costs</p>
                            <p className="or_para">{datat1.origin_oncarriage_costs}</p>
                          </div>
                          <div>
                            <p className="client_para">Warehouse Costs Destination</p>
                            <p className="or_para">{datat1.warehouse_cost_des}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Cost to Collect Destination</p>
                            <p className="or_para">{datat1.costs_to_collect_des}</p>
                          </div>
                          <div>
                            <p className="client_para">Destination Costs</p>
                            <p className="or_para">{datat1.destination_country}</p>
                          </div>
                        </div>

                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Incidental Cost</p>
                            <p className="or_para">{datat1.origin_Incidental_costs}</p>
                          </div>
                          <div>
                            <p className="client_para">Packages</p>
                            <p className="or_para">{datat1.total_freight_packages}</p>
                          </div>
                        </div>

                        <div className="view_box">
                          <p className="client_para">Shipments</p>
                          <p className="or_para">{datat1.count_freight}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 ps-4">
                  <div className="card desti_card">
                    <div className="card-body">
                      <div className="">
                        <h6 className="orgin_hd">Booking Information</h6>
                      </div>
                      <div className="main_det">
                        {/* BOOKING DETAILS SECTION */}
                        <div className="ship_section_title">
                          <p className="ship_hd">Booking Details</p>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Place of Loading</p>
                            <p className="or_para"></p>
                          </div>
                          <div>
                            <p className="client_para">Port of Loading</p>
                            <p className="or_para">{datat1.port_loading}</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Collection Address</p>
                            <p className="or_para">{datat1.collection_address}</p>
                          </div>
                          <div>
                            <p className="client_para">Batch Name</p>
                            <p className="or_para">{datat1.batch_name}</p>
                          </div>
                        </div>

                        {/* TRANSIT SECTION */}
                        <div className="ship_section_title">
                          <p className="ship_hd">Transit Information</p>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Freight Option</p>
                            <p className="or_para">{datat1.freight}</p>
                          </div>
                          <div>
                            <p className="client_para">ETD</p>
                            <p className="or_para">{datat1.ETD}</p>
                          </div>
                          <div>
                            <p className="client_para">Carrier</p>
                            <p className="or_para">{datat1.carrier}</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Vessel Name</p>
                            <p className="or_para">{datat1.vessel}</p>
                          </div>
                          <div>
                            <p className="client_para">Master Bill</p>
                            <p className="or_para">{datat1.master_waybill}</p>
                          </div>
                          <div>
                            <p className="client_para">House Bill</p>
                            <p className="or_para">{datat1.house_waybill}</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Container Number</p>
                            <p className="or_para">{datat1.container_no}</p>
                          </div>
                          <div>
                            <p className="client_para">Release Type</p>
                            <p className="or_para">
                              {new Date(datat1.ETA).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>

                        {/* POD SECTION */}
                        <div className="ship_section_title">
                          <p className="ship_hd">POD Information</p>
                        </div>
                        <div className="d-flex gap-2 view_box justify-content-between flex-wrap">
                          <div>
                            <p className="client_para">Place of Loading</p>
                            <p className="or_para">{datat1.devy_port_of_loading}</p>
                          </div>
                          <div>
                            <p className="client_para">Port of Discharge</p>
                            <p className="or_para">{datat1.devy_port_of_discharge}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="view_card viewDetails">
                <div className="row my-3">
                  <div className="col-md-4 pe-4">
                    <div className="card desti_card">
                      <div className="card-body">
                        <div className="">
                          <h6 className="orgin_hd">Comment</h6>
                        </div>
                        <div className="main_det">
                          <div className="view_box">
                            <p className="client_para">Comment</p>
                            <p className="or_para">{datat1.comment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 ">
                    <div className="card desti_card">
                      <div className="card-body">
                        <div className="">
                          <h6 className="orgin_hd">Attachment's</h6>
                        </div>
                        <div className="main_det">
                          <div className="view_box">
                            <p className="client_para">File</p>
                            <p className="or_para">{datat1.attachment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="text-end">
                <button
                  className="p-2 p-1 px-3  my-3 rounded ms-auto mb-2"
                  style={{
                    color: "White",
                    background: "#1b2245",
                    border: "none",
                  }}
                  onClick={handleOpenModal}
                >
                  Filter
                </button>
              </div> */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow className="border-bottom">
                      <TableCell className="fw-bold">Freight No / Order Number</TableCell>
                      <TableCell className="fw-bold">Client Name</TableCell>
                      <TableCell className="fw-bold">
                        Num. of Packages
                      </TableCell>
                      <TableCell className="fw-bold">Freight</TableCell>
                      <TableCell className="fw-bold">Weight</TableCell>
                      <TableCell className="fw-bold">Dimension</TableCell>
                      <TableCell className="fw-bold">Package Type</TableCell>
                      <TableCell className="fw-bold">View</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {freightData && freightData.length > 0 ? (
                      freightData.map((item, index) => {
                        console.log(item);
                        return (
                          <TableRow key={index} className="border-bottom">
                            <TableCell>
                              {[item.freight_number, item.order_number].filter(Boolean).join(' / ') || '-'}
                            </TableCell>
                            <TableCell>{item.client_Name}</TableCell>
                            <TableCell>{item.no_of_packages}</TableCell>
                            <TableCell>{item.freight}</TableCell>
                            <TableCell>{item.weight}</TableCell>
                            <TableCell>{item.dimensions}</TableCell>
                            <TableCell>{item.package_type}</TableCell>
                            <TableCell>
                              <VisibilityIcon
                                onClick={() => handleclcick(item)}
                                style={{
                                  color: "rgb(27 34 69)",
                                  cursor: "pointer",
                                  width: "20px",
                                }}
                              />
                              <Delete className='ms-2' style={{ cursor: "pointer" }} onClick={() => handleclcickrevert(item)} />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" className="fw-semibold text-secondary py-4">
                          No records found for this batch
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Modal
                open={isModalOpen}
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
                    <h2 id="modal-modal-title">Filter</h2>
                    <button
                      className="btn btn-close"
                      onClick={handleCloseModal}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                  <div className="newModalGap noFormaControl">
                    <div className="row my-3  ">
                      <div className="col-6">
                        <label>Delivery Type</label>
                        <select
                          name="type"
                          onChange={handlechange} >
                          <option value="">Select</option>
                          <option value="express">Express</option>
                          <option value="normal">Consolidation</option>
                        </select>
                      </div>
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
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>Country of Origin</label>
                        <select
                          name="origin"
                          onChange={handlechange} >
                          <option value="">Select</option>
                          {updatedata &&
                            updatedata.length > 0 &&
                            updatedata.map((item, index) => {
                              return (
                                <>
                                  <option value={item.id}>{item.name}</option>
                                </>
                              );
                            })}
                        </select>
                      </div>
                      <div className="col-6">
                        <label>Delivery to Country </label>
                        <select
                          name="destination"
                          onChange={handlechange}>
                          <option value="">Select</option>
                          {updatedata &&
                            updatedata.length > 0 &&
                            updatedata.map((item, index) => {
                              return (
                                <>
                                  <option value={item.id}>{item.name}</option>
                                </>
                              );
                            })}
                        </select>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label>Start Date</label>
                        <input
                          type="date"
                          id="shipper3"
                          name="startDate"
                          style={{ cursor: "pointer" }}
                          className="form-control"
                          onChange={handlechange}
                        />
                      </div>
                      <div className="col-6">
                        <label>End Date </label>
                        <input
                          type="date"
                          id="shipper3"
                          name="endDate"
                          style={{ cursor: "pointer" }}
                          className="form-control"
                          onChange={handlechange}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12">
                        <label>Freight</label>
                        <select
                          name="freight"
                          onChange={handlechange}>
                          <option value="">Select...</option>
                          <option value="Sea">Sea</option>
                          <option value="Air">Air</option>
                          <option value="Road">Road</option>
                        </select>
                      </div>
                    </div>
                    <Button variant="contained" onClick={postData}>
                      Apply
                    </Button>
                  </div>
                </Box>
              </Modal>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
