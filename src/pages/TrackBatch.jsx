import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export default function TrackBatch() {
  const [orderdata, setOrderdata] = useState({ status: "", description: "" });
  const [countdata, setCountdata] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dataordwer = location?.state?.data;
  console.log(location?.state.data)
  const handlechange = (e) => {
    const { name, value } = e.target;
    setOrderdata({ ...orderdata, [name]: value });
  };
  const handleclick = () => {
    const datapost = {
      batch_id: dataordwer,
      status: orderdata.status,
      description: orderdata.description,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}UpdateOrderFromBatch`, datapost)
      .then((response) => {
        toast.success(response.data.message);
        getorderstatus();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };
  const getorderstatus = () => {
    try {
        axios
        .post(`${process.env.REACT_APP_BASE_URL}get-order-status`, {
          batch_id: + dataordwer,
        })
        .then((response) => {
          console.log(response.data.data);
          setCountdata(response.data.data);
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message || "Failed to fetch order status"
          );
        });
    } catch (error) {
        console.log("some thing went wrong")
    }
  };

  
  useEffect(() => {
    getorderstatus();
  }, []);
  const handleclicknav = () => {
    navigate("/Admin/Batches");
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row  manageFreight">
            <div className="col-12">
              <div className="d-flex  ">
                <div className="d-flex">
                  <div>
                    <ArrowBackIcon
                      onClick={handleclicknav}
                      className="text-dark"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <div>
                    <h4 className="freight_hd text-start ms-3">Update Batch Status</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div>
              <div className="row align-items-end manageFreight mt-4 noFormaControl	">
                <div className="col-3">
                  <label className="track_label">Batch Id</label>
                  <input
                    className="form-control"
                    disabled
                    value={`${dataordwer}` || ""}
                  />
                </div>
                <div className="col-3">
                  <label className="track_label">New Status</label>
                  <select
                  
                    onChange={handlechange}
                    name="status"
                    value={orderdata.status}
                  >
                    <option value="">Select...</option>
                    <option value="Received at Asia Direct warehouse">Received at Asia Direct warehouse</option>
                    <option value="Dispatched to port">Dispatched to port</option>
                    <option value="Goods at origin port">Goods at origin port</option>
                    <option value="Goods are in transit">Goods are in transit</option>
                    <option  value="Arrived at destination port">Arrived at destination port</option>
                    <option value="Customs clearing in progress">Customs clearing in progress</option>
                    <option value="Customs released">Customs released</option>
                    <option value="Goods in transit to warehouse">Goods in transit to warehouse</option>
                    <option  value="Arrived at Asia Direct warehouse">Arrived at Asia Direct warehouse</option>
                  </select>
                </div>
                <div className="col-3">
                  <label className="track_label">Description</label>
                  <input
                    className="form-control"
                    name="description"
                    onChange={handlechange}
                    value={orderdata.description}
                  />
                </div>
                <div className="col-3">
                  <div className="">
                    <button
                      type="button"
                      className="up_datebtn"
                      onClick={handleclick}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
              <div className="row my-5 ">
                <div className="col-12">
                  <div className="track-result">
                    <div className="track-result-block">
                      <div className="track-result-id">
                        <b>Batch Tracking:</b> {`${dataordwer}`}
                      </div>
                      <div className="track-result-bar">
                        <ul className="track-progress">
                          {countdata.map((item, index) => (
                            <li
                              key={index}
                              className={`icon-confirm-order ${
                                item?.is_completed === "1"
                                  ? "icon-green track-active"
                                  : ""
                              } ${
                                item?.status === orderdata.status
                                  ? "icon-highlight"
                                  : ""
                              }`}
                            >
                              <i class="fi fi-rr-check check_track"></i>
                              {item?.status}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
