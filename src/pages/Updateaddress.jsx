import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export default function UpdateAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const allldatat = location?.state?.data;
  console.log(allldatat);

  const [data, setData] = useState({});
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log(data.freight_dimension);
    if (name === "shipper_email") {
      validateEmail(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailError("");
    } else {
      setEmailError("Invalid email format");
    }
  };

  const handleUpdate = () => {
    if (emailError) {
      toast.error("Please fix the email before submitting");
      return;
    }

    const updatedData = {
      order_id: allldatat?.order_id,
      date_of_colletion: new Date(data?.date_of_colletion).toLocaleDateString(
        "en-GB"
      ),
      commerical_invoice: data?.commerical_invoice,
      cartons: data?.cartons,
      freight_product_desc: data?.freight_product_desc,
      freight_dimension: data?.freight_dimension,
      freight_weight: data?.freight_weight,
      freight_id: allldatat?.freight_id,
      customs_clearing: data?.customs_clearing,
      freight_freightType: data?.freight_freightType,
      cargo_pickup_country: data?.cargo_pickup_country,
      cargo_pickup_town: data?.cargo_des_town,
      cargo_des_country: data?.cargo_des_country,
      cargo_des_town: data?.cargo_des_town,
      mode_of_transport: data?.mode_of_transport,
      terms: data?.terms,
      shipper: data?.shipper,
      special_comments: data?.special_comments,
      shipper_email: data?.shipper_email,
      shipper_tel: data?.shipper_tel,
      CBM: data?.CBM,
      shipper_address: data?.shipper_address,
    };
    console.log(updatedData);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-load-details`, updatedData)
      .then((response) => {
        toast.success(response.data.message);
        if (response.data.success === true) {
          navigate("/Admin/order");
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const apiHit = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-loading-details`, {
        order_id: allldatat?.order_id,
      })
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  useEffect(() => {
    apiHit();
  }, []);

  console.log(allldatat);

  const handleKeyPress = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  const handleclicknav = () => {
    navigate("/Admin/order");
  };
  const handlekey = (e) => {
    if (e.charCode < 46 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row  manageFreight">
            <div className="col-12">
              <div className="d-flex">
                <div>
                  <ArrowBackIcon
                    onClick={handleclicknav}
                    className="text-dark"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div>
                  <h4 className="freight_hd ms-3 mt-0">Update Loading Detail's</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="noFormaControl  mt-4">
            <div>
              <div className="row">
                <div className="col-12">
                  <div className="updateLoading">
                    <div className="row">
                      <div className="col-6">
                        <label>Client Name</label>
                        <input
                          type="text"
                          value={allldatat?.full_name}
                          name="full_name"
                          onChange={handleChange}
                          className="form-control"
                          disabled
                        />
                      </div>
                      <div className="col-6">
                        <label>Product Description</label>
                        <input
                          type="text"
                          value={data?.freight_product_desc}
                          name="freight_product_desc"
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Date of collection</label>
                        <input
                          type="text"
                          name="date_of_collection"
                          disabled
                          value={new Date(allldatat?.date).toLocaleDateString(
                            "en-GB"
                          )}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                      <div className="col-6">
                        <label>Dimension(cbm)</label>
                        <input
                          type="number"
                          name="freight_dimension"
                          value={data?.freight_dimension}
                          onChange={handleChange}
                          onKeyPress={handleKeyPress}
                          className="form-control"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className=" col-6">
                        <label>Weight (Kgs)</label>
                        <input
                          type="number"
                          name="freight_weight"
                          value={data?.freight_weight}
                          onKeyPress={handleKeyPress}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="00"
                        />
                      </div>
                      <div className="col-6">
                        <label>Cartons</label>
                        <input
                          type="text"
                          onKeyPress={handleKeyPress}
                          onChange={handleChange}
                          value={data.cartons}
                          name="cartons"
                          className="form-control"
                          placeholder="00"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>CBM</label>
                        <input
                          className="form-control"
                          value={data?.CBM}
                          name="CBM"
                          placeholder="CBM"
                          onChange={handleChange}
                        ></input>
                      </div>
                      {/* <div className='col-6'>
                                                <label>Freight</label>
                                                <select className='form-control' value={data?.freight} name='freight' onChange={handleChange} >
                                                    <option>Select... </option>
                                                    <option value="Sea">Sea </option>
                                                    <option value="Air">Air </option>
                                                    <option value="Road">Road </option>
                                                </select>
                                                 {/* <input  className='form-control' /> */}
                      {/* </div> */}
                      <div className="col-6  ">
                        <label>Freight</label>
                        {/* <input  className='form-control' value={allldatat?.freight} name='freight' onChange={handleChange} /> */}
                        <select
                          className=" "
                          value={data?.freight_freightType}
                          name="freight_freightType"
                          onChange={handleChange}
                        >
                          <option>Select... </option>
                          <option value="Sea">Sea </option>
                          <option value="Air">Air </option>
                          <option value="Road">Road </option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Cargo Pick up Country</label>
                        <input
                          className="form-control"
                          placeholder="Cargo Pickup Country"
                          value={data?.cargo_pickup_country}
                          name="cargo_pickup_country"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-6">
                        <label>Cargo Pickup Town</label>
                        <input
                          className="form-control"
                          value={data?.cargo_pickup_town}
                          placeholder="Cargo Pickup Town"
                          name="cargo_pickup_town"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Cargo Destination Country</label>
                        <input
                          className="form-control"
                          placeholder="Cargo Destination Country"
                          value={data?.cargo_des_country}
                          name="cargo_des_country"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-6">
                        <label>Cargo Destination Town</label>
                        <input
                          className="form-control"
                          placeholder="Cargo Destination Town"
                          value={data?.cargo_des_town}
                          name="cargo_des_town"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Terms</label>
                        <input
                          className="form-control"
                          placeholder="Terms"
                          value={data?.terms}
                          name="terms"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-6">
                        <label>Shipper</label>
                        <input
                          className="form-control"
                          placeholder="Shipper"
                          value={data?.shipper}
                          name="shipper"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Mode Of Transport</label>
                        <select
                          value={data?.mode_of_transport}
                          name="mode_of_transport"
                          onChange={handleChange}
                        >
                          <option>select...</option>
                          <option>Air</option>
                          <option>Sea</option>
                          <option>Road</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label>Shipper email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="@992"
                          value={data?.shipper_email}
                          name="shipper_email"
                          onChange={handleChange}
                        />
                        {emailError && (
                          <span className="text-danger">{emailError}</span>
                        )}
                      </div>
                    </div>
                    <div className=" row">
                      <div className="col-6">
                        <label>Shipper tel</label>
                        <input
                          className="form-control"
                          onKeyPress={handleKeyPress}
                          placeholder="Telephone"
                          value={data?.shipper_tel}
                          name="shipper_tel"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-6">
                        <label>Shipper Address</label>
                        <input
                          className="form-control"
                          placeholder="Shipper Address"
                          value={data?.shipper_address}
                          name="shipper_address"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <label>Custom Clearing</label>
                        <select
                          placeholder="Comment"
                          value={data?.customs_clearing}
                          name="customs_clearing"
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label>Special comments</label>
                        <input
                          className="form-control"
                          placeholder="Comment"
                          value={data?.special_comments}
                          name="special_comments"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <button type="button" onClick={handleUpdate}>
                        Update Details
                      </button>
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
