import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export default function Trackorder() {
  const [orderdata, setOrderdata] = useState({ status: "", description: "" });
  const [countdata, setCountdata] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dataordwer = location?.state?.data[0];
  const handlechange = (e) => {
    const { name, value } = e.target;
    setOrderdata({ ...orderdata, [name]: value });
  };
  const handleclick = () => {
    const datapost = {
      order_id: dataordwer?.order_id,
      status: orderdata.status,
      description: orderdata.description,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-order-status`, datapost)
      .then((response) => {
        toast.success(response.data.message);
        // Update the timeline status
        getorderstatus(); // Re-fetch the status to refresh the timeline with the latest data
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };
  const getorderstatus = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-order-status`, {
        order_id: "OR000" + dataordwer?.order_id,
      })
      .then((response) => {
        setCountdata(response.data.data);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Failed to fetch order status"
        );
      });
  };
  useEffect(() => {
    getorderstatus();
  }, []);

  const handleclicknav = () => {
    navigate("/Admin/order");
  };

  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid py-4">

          {/* Header */}

          <div className="d-flex align-items-center justify-content-between flex-wrap">

            <div className="d-flex align-items-center gap-3">
              <div className="">
                <ArrowBackIcon
                  onClick={handleclicknav}
                  className="text-dark"
                  style={{ cursor: "pointer" }}
                />
              </div>

              <div>
                <h4 className="freight_hd mb-0">Update Order Status</h4>

              </div>
            </div>


          </div>


          {/* Form Section */}
          <div className="card  mt-4">
            <div>

              <div className="row g-4 align-items-end p-4">

                {/* Order ID */}
                <div className="col-lg-3">
                  <label className="customLabel">Order ID</label>

                  <input
                    className="form-control customInput"
                    disabled
                    value={`OR000${dataordwer?.order_id}` || ""}
                  />
                </div>

                {/* Status */}
                <div className="col-lg-3">
                  <label className="customLabel">New Status</label>

                  <select
                    className="form-select customInput"
                    onChange={handlechange}
                    name="status"
                    value={orderdata.status}
                  >
                    <option value="">Select Status</option>
                    <option>Collected from supplier</option>
                    <option>Received at Asia Direct warehouse</option>
                    <option>Dispatched to port</option>
                    <option>Goods at origin port</option>
                    <option>Goods are in transit</option>
                    <option>Arrived at destination port</option>
                    <option>Customs clearing in progress</option>
                    <option>Customs released</option>
                    <option>Goods in transit to warehouse</option>
                    <option>Arrived at Asia Direct warehouse</option>
                    <option>Out for delivery</option>
                    <option>Delivered</option>
                  </select>
                </div>

                {/* Description */}
                <div className="col-lg-4">
                  <label className="customLabel">Description</label>

                  <input
                    className="form-control customInput"
                    name="description"
                    placeholder="Enter shipment description..."
                    onChange={handlechange}
                    value={orderdata.description}
                  />
                </div>

                {/* Button */}
                <div className="col-lg-2">
                  <button
                    type="button"
                    className="blueBtn w-100"
                    onClick={handleclick}
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="trackingSection p-4">

                <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">Shipment Timeline</h5>
                    <p className="text-muted mb-0">
                      Live tracking progress of shipment
                    </p>
                  </div>

                  <div className="trackingId">
                    Tracking ID :
                    <span className="ms-2">
                      {`OR000${dataordwer?.order_id}`}
                    </span>
                  </div>
                </div>

                <div className="trackTimeline">

                  {countdata.map((item, index) => (
                    <div
                      key={index}
                      className={`timelineCard 
                  ${item?.is_completed === "1" ? "completedTrack" : ""}
                  ${item?.status === orderdata.status ? "activeTrack" : ""}
                `}
                    >

                      <div className="timelineIcon">
                        <i className="fi fi-rr-check"></i>
                      </div>

                      <div className="timelineContent">
                        <h6>{item?.status}</h6>

                        {/* {item?.is_completed === "1" && (
                          <small>
                            {new Date(item?.created_at).toLocaleDateString("en-GB")}
                          </small>
                        )} */}
                      </div>

                    </div>
                  ))}

                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
