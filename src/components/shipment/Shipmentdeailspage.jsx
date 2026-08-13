import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import {
  Modal,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
export default function Shipmentdeailspage() {
  const navigate = useNavigate();
  const [datat1, setDatat1] = useState("");
  const [tabledata, setTabledata] = useState([]);
  const [tabledata1, setTabledata1] = useState([]);
  const location = useLocation();
  const [documents, setDocuments] = useState({});
  const [statusModal, setStatusModal] = useState(false);
  const [shipmentStatus, setShipmentStatus] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const datat = location.state.data[0];
  console.log("datat", datat);
  const handleclick = () => {
    navigate("/admin/manage-shipment");
  };
  useEffect(() => {
    GetShipmentDetails();
  }, []);
  const GetShipmentDetails = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}GetShipmentDetails`, {
        shipment_id: location.state.data[0].id,
      })
      .then((response) => {
        console.log(response.data);
        setDatat1(response.data.shipment);
        setTabledata(response.data.details);
        setTabledata1(response.data.clearance);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const GetFreightImages = () => {
    const data = { shipment_id: datat.id, uploaded_by: "1" };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}GetFreightImages`, data)
      .then((response) => {
        console.log(response.data.data);
        setDocuments(response.data.data);
      })
      .catch((error) => {
        console.log(error.response?.data);
      });
  };
  useEffect(() => {
    GetFreightImages();
  }, []);
  const handleOpenStatusModal = () => {
    setShipmentStatus(datat1?.status || "");
    setStatusModal(true);
  };
  const handleCloseStatusModal = () => {
    setStatusModal(false);
  };
  const handleUpdateStatus = async () => {
    try {
      const payload = {
        shipment_id: datat.id,
        status: shipmentStatus,
        date: date,
        comment: comment,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}update-shipment-status`,
        payload,
      );
      if (response.data.success) {
        toast.success("Status Updated Successfully");
        handleCloseStatusModal();
        GetShipmentDetails();
      }
    } catch (error) {
      console.log(error);
      const errorData = error?.response?.data;
      if (Array.isArray(errorData?.errors)) {
        errorData.errors.forEach((err) => {
          toast.error(err.msg || err.message);
        });
      } else if (errorData?.message) {
        toast.error(errorData.message);
      } else if (errorData?.error) {
        toast.error(errorData.error);
      } else {
        toast.error(error?.message || "Failed to update status");
      }
    }
  };
  const deleteapi = (id) => {
    console.log(id);
    const data11 = {
      doc_id: id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}ShipmentDocument`, data11)
      .then((response) => {
        GetFreightImages();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div>
          <div>
            <div className="row">
              <div className="container">
                <div className="client_details">
                  <div className="d-flex justify-content-between">
                    <div className="d-flex gap-3">
                      <div>
                        <ArrowBackIcon
                          style={{ cursor: "pointer" }}
                          onClick={handleclick}
                          className=""
                        />
                      </div>
                      <h4 className="det_hd mb-0 ">Shipment Details</h4>
                    </div>
                    <div>
                      <button
                        className="blueBtn"
                        onClick={handleOpenStatusModal}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                  <div className="row mt-4 viewDetails g-4">
                    <div className="col-lg-4 col-md-6 col-sm-6">
                      <div className="card desti_card">
                        <div className="card-body">

                          <h6 className="orgin_hd">Shipment Details</h6>

                          <div className="main_det">

                            <div className="view_box">
                              <p className="client_para">Freight</p>
                              <p className="or_para">{datat1?.freight}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Waybill</p>
                              <p className="or_para">{datat1?.waybill}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Carrier</p>
                              <p className="or_para">{datat1?.carrier}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Vessel</p>
                              <p className="or_para">{datat1?.vessel}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Container No</p>
                              <p className="or_para">{datat1?.container}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Release Type</p>
                              <p className="or_para">{datat1?.release_type}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Status</p>
                              <p className="or_para">{datat1?.status}</p>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-6">
                      <div className="card desti_card">
                        <div className="card-body">

                          <h6 className="orgin_hd">Route Details</h6>

                          <div className="main_det">

                            <div className="view_box">
                              <p className="client_para">Origin Agent</p>
                              <p className="or_para">{datat1?.origin_agent}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Country of Origin</p>
                              <p className="or_para">{datat?.origin_country_name}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Port of Loading</p>
                              <p className="or_para">{datat1?.port_of_loading}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">ETD</p>
                              <p className="or_para">
                                {datat1?.ATD && new Date(datat1?.ATD).toLocaleDateString("en-GB")}
                              </p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Destination Agent</p>
                              <p className="or_para">{datat1?.destination_agent}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Country of Destination</p>
                              <p className="or_para">{datat?.des_country_name}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">Port of Discharge</p>
                              <p className="or_para">{datat1?.port_of_discharge}</p>
                            </div>

                            <div className="view_box">
                              <p className="client_para">ETA</p>
                              <p className="or_para">
                                {datat1?.ETD && new Date(datat1?.ETD).toLocaleDateString("en-GB")}
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-sm-6">
                      <div className="card desti_card">
                        <div className="card-body">
                          <h6 className="orgin_hd">Documents</h6>
                          <div className="main_det">
                            <div className="parentShipDetail view_box">
                              <div>
                                <p className="client_para">Master Bill </p>
                              </div>
                              <div>
                                <p className="or_para">
                                  {datat1?.document ? (
                                    <a
                                      href={`${process.env.REACT_APP_BASE_URLdocument}${datat?.document}`}
                                    >
                                      View Documnet
                                    </a>
                                  ) : (
                                    ""
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="parentShipDetail view_box">
                              <div>
                                <p className="client_para"> House Bill </p>
                              </div>
                              <div>
                                <p></p>
                              </div>
                            </div>
                            <div className="parentShipDetail view_box">
                              <div>
                                <p className="client_para">Arrival Notification </p>
                              </div>
                              <div>
                                <p></p>
                              </div>
                            </div>
                            <div className="parentShipDetail view_box">
                              <div>
                                <p className="client_para"> Other</p>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="card desti_card">
                        <div className="card-body mb-3">
                          {Object.keys(documents).map(
                            (groupName, groupIndex) => (
                              <div key={groupIndex} className="mb-2">
                                <p className="or_para">{groupName} :</p>
                                <div className="wayWillView">
                                  {documents[groupName]?.map((item, index) => (
                                    <div
                                      key={item.id}
                                      className="d-flex align-items-center mt-3"
                                    >
                                      <a
                                        href={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view_docu  mt-0"
                                      >
                                        View Document
                                      </a>
                                      <DeleteIcon
                                        onClick={() => deleteapi(item.id)}
                                        className="text-danger ms-2"
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
                                  ))}

                                </div>
                              </div>
                            ),
                          )}
                          <div className="mt-3">
                            <label>Attach Quotation</label>
                            {datat.attachment_Estimate && (
                              <a
                                href={`${process.env.REACT_APP_BASE_URLdocument}${datat?.attachment_Estimate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view_docu ms-2"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="card border-0">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">ETD</h6>
                            <p>{new Date(datat1?.ATD).toLocaleDateString("en-GB")}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">ETA</h6>
                            <p>{new Date(datat1?.ETD).toLocaleDateString("en-GB")}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Carrier</h6>
                            <p>{datat1?.carrier}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Container No</h6>
                            <h6>{datat1?.container}</h6>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Destination Agent</h6>
                            <h6>{datat1?.destination_agent}</h6>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Freight</h6>
                            <p>{datat1?.freight}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Load</h6>
                            <p>{datat1?.load}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Origin Agent</h6>
                            <p>{datat1?.origin_agent}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Port of Discharge</h6>
                            <p>{datat1?.port_of_discharge}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Port of Loading</h6>
                            <p>{datat1?.port_of_loading}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Release Type</h6>
                            <p>{datat1.release_type}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Status</h6>
                            <p>{datat1.status}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Vessel</h6>
                            <p>{datat1?.vessel}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Waybill</h6>
                            <p>{datat1.waybill}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Country of Origin</h6>
                            <p>{datat.origin_country_name}</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Country of Destination</h6>
                            <p>{datat.des_country_name}</p>
                          </div>
                        </div>
                        <div className="row">
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">View Document</h6>
                            <a href={`${process.env.REACT_APP_BASE_URLdocument}${datat?.document}`}>View Document</a>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="inner_section">
                            <h6 className="fw-bold">Date of Dispatch</h6>
                            <p >{new Date(datat1?.date_of_dispatch).toLocaleDateString("en-GB")}</p>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
                <table className="table mt-4 table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Sr.No.</th>
                      <th>Freight / Order No.</th>
                      <th>Client Name</th>
                      <th>HAWB / Tracking</th>
                      <th>Total Weight</th>
                      <th>Total CBM</th>
                      <th>Nature of Goods</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabledata?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {item?.freight_number} / {item?.order_number}
                        </td>
                        <td>{item?.client_name}</td>
                        <td>{item?.hawb}</td>
                        <td>{item?.weight}</td>
                        <td>{item?.dimensions}</td>
                        <td>{item?.nature_of_goods}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="table mt-4 table-striped tableICon">
                  <thead>
                    <tr>
                      <th>Sr.No.</th>
                      <th>Freight / Order No.</th>
                      <th>Client Name</th>
                      <th>Total Weight</th>
                      <th>Port of Loading</th>
                      <th>Port of Discharge</th>
                      <th>Nature of Goods</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabledata1
                      ?.filter((item) => item?.clearance_id) // ✅ ONLY clearance data
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item?.clearance_number} </td>
                          <td>{item?.client_name}</td>
                          <td>{item?.total_weight}</td>
                          <td>{item?.port_of_loading}</td>
                          <td>{item?.port_of_discharge}</td>
                          <td>{item?.nature_of_goods}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal open={statusModal} onClose={handleCloseStatusModal}>
        <Box
          className="warehouse_modal123"
          sx={{
            position: "absolute",
            overflow: "scroll",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            height: 300,
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <div className="row">
            <h5 className=" fw-bold fs-5 mb-3">
              <span style={{ color: "#1b2245" }}>Update Status for </span>
            </h5>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={shipmentStatus}
                label="Status"
                onChange={(e) => setShipmentStatus(e.target.value)}
              >
                <MenuItem value="Goods at origin port">
                  Goods at origin port
                </MenuItem>
                <MenuItem value="Goods are in transit">
                  Goods are in transit
                </MenuItem>
                <MenuItem value="Arrived at destination port">
                  Arrived at destination port
                </MenuItem>
                <MenuItem value="Customs clearing in progress">
                  Customs clearing in progress
                </MenuItem>
                <MenuItem value="Customs released">Customs released</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <input
                type="date"
                className="p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Comment</InputLabel>
              <textarea
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="p-2"
              />
            </FormControl>
          </div>
          <div className="text-end mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateStatus}
            >
              Update Status
            </Button>
          </div>
        </Box>
      </Modal>
      
    </div>
  );
}
