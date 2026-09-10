import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
export default function MAnagecustomerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mongo, setMongo] = useState([]);
  const datat = location?.state?.alldata[0];
  const imagepro = JSON.parse(localStorage.getItem("data123"));
  console.log(imagepro);
  const imagehel = imagepro?.profile;
  console.log(datat);
  const getdatat = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}client-freights`, {
        user_id: datat?.id,
      })
      .then((response) => {
        setMongo(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  useEffect(() => {
    getdatat();
  }, []);

  const handleclicknav = () => {
    navigate("/Admin/manage-customer");
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-12">
              <div className="d-flex align-items-center gap-3">
                <ArrowBackIcon
                  onClick={handleclicknav}
                  className="text-dark"
                  style={{ cursor: "pointer" }}
                />
                <h4 className="freight_hd mb-0">
                  Customer Profile Details
                </h4>
              </div>
            </div>
          </div>
          <div className="  mt-4">
            <div className=" ">
              <div className="row">
                <div className="col-3">
                  <div className="custo_data">
                    <div className="d-flex justify-content-center align-items-center">
                      <div>
                        <div className="custo_img my-2">
                          <img
                            src={`${process.env.REACT_APP_BASE_URL_image}${datat?.profile}`}
                            alt="Customer Image"
                            className="custo_img1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-9">
                  <div className="custo_data">
                    <div className="row">
                      <div className="col-3">
                        <label className="hd_label">Name</label>
                        <p className="det_input">{datat?.full_name}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Email</label>
                        <p className="det_input">{datat?.email}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Address 1</label>
                        <p className="det_input">{datat?.address_1}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Address 2</label>
                        <p className="det_input">{datat?.address_2}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        <label className="hd_label">Cellphone</label>
                        <p className="det_input">{datat?.cellphone}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Telephone</label>
                        <p className="det_input">{datat?.telephone}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">City</label>
                        <p className="det_input">{datat?.city}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Code</label>
                        <p className="det_input">{datat?.code}</p>
                      </div>
                    </div>
                    <div className="horizontalLine"></div>
                    <div className="row">
                      <div className="col-3">
                        <label className="hd_label">Company ID</label>
                        <p className="det_input">{datat?.company_id}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Contact Person</label>
                        <p className="det_input">{datat?.contact_person}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Country</label>
                        <p className="det_input">{datat?.country_name}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Importer Refrence</label>
                        <p className="det_input">{datat?.importers_ref}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        <label className="hd_label">Province</label>
                        <p className="det_input">{datat?.province}</p>
                      </div>
                      <div className="col-3">
                        <label className="hd_label">Tax Refrence</label>
                        <p className="det_input">{datat?.tax_ref}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <h4 className="freight_hd">Related Freight</h4>
                </div>
              </div>
              <table className="table table-striped table-responsive mt-4">
                <thead>
                  <tr>
                    <th>Sr.No.</th>
                    <th>Client Name</th>
                    <th>Client Refrence</th>
                    <th>Country</th>
                    <th>Dimension </th>
                    <th>Freight</th>
                    <th>Incoterm</th>
                    <th>Province</th>
                  </tr>
                </thead>
                <tbody>
                  {mongo &&
                    mongo.length > 0 &&
                    mongo.map((item, index) => {
                      console.log(item);
                      return (
                        <tr key={index}>
                          <td scope="row">{index + 1}</td>
                          <td className="text-dark">{item?.client_name}</td>
                          <td>{item?.client_ref}</td>
                          <td>{item?.country_id}</td>
                          <td>{item?.dimension}</td>
                          <td>{item?.freight}</td>
                          <td>{item?.incoterm}</td>
                          <td>{item?.province}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
