import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Modal, Button, Typography, IconButton } from "@mui/material";
export default function WarehouseDetails() {
  const location = useLocation();
  const info = location.state.data;
  console.log(info);
  const [documents, setDocuments] = useState({});
  const [selectedData, setSelectedData] = useState({});
  const navigate = useNavigate();
  const [apidata, setApidata] = useState([]);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [isModalviewsection3, setIsModalviewsection3] = useState(false);
  const [show1, setShow1] = useState(false);
  const postassiandata = async () => {
    const payloca = {
      warehouse_assign_order_id: info.warehouse_assign_order_id || info.id,
    };
    try {
      await axios
        .post(
          `${process.env.REACT_APP_BASE_URL}getWarehouseOrderProduct`,
          payloca,
        )
        .then((response) => {
          console.log(response.data.data);
          setApidata(response.data.data);
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    postassiandata();
  }, []);
  const handleclicknav = () => {
    // navigate("/Admin/WarehouseOrder");
    window.history.back();
  };
  const GetFreightImages = () => {
    const data = {
      freight_id: info.freight_id,
      warehouse_assign_order_id: info.warehouse_assign_order_id || info.id,
      uploaded_by: "1",
    };
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

  const handleCloseModal3 = () => {
    setIsModalOpen3(false);
    setSelectedData({});
  };
  const deleteapi = (id) => {
    console.log(id);
    const data11 = {
      doc_id: id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}DeleteDocument`, data11)
      .then((response) => {
        GetFreightImages();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const handleEditClick12 = async (freightId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    // ❌ Agar user cancel kare to yahin stop
    if (!result.isConfirmed) return;
    const payload = {
      id: freightId,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}DeleteWarehouseProduct`,
        payload,
      );
      if (response?.data?.success) {
        Swal.fire("Deleted!", "Product deleted successfully", "success");
        postassiandata(); // refresh data
      } else {
        Swal.fire("Error!", "Failed to delete product", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error!", "Something went wrong", "error");
    }
  };
  const handleEditClick = async (freight_ID) => {
    console.log(freight_ID);
    const payload = {
      id: freight_ID,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getWarehouseProductById`,
        payload,
      );
      if (response?.data?.success) {
        setSelectedData(response.data.data);
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (error) {
      console.log(error);
    }
    setIsModalOpen3(true);
  };
  const handleEditClickview = async (freight_ID) => {
    console.log(freight_ID);
    const payload = {
      id: freight_ID,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getWarehouseProductById`,
        payload,
      );
      if (response?.data?.success) {
        setSelectedData(response.data.data);
      } else {
        toast.error("Failed to fetch product details");
      }
    } catch (error) {
      console.log(error);
    }
    setIsModalviewsection3(true);
  };
  const handleCloseadadModal3 = () => {
    setIsModalviewsection3(false);
    setSelectedData({});
  }

  const handlechangepro = (e) => {
    const { name, value } = e.target;
    setSelectedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  console.log(selectedData);
  const handlekey = (e) => {
    if (e.charCode < 48 || e.charCode > 57) {
      e.preventDefault();
    }
  };

  const handpechangepro = async () => {
    const payload = {
      id: selectedData.id,
      product_description: selectedData.product_description,
      warehouse_ref: selectedData.warehouse_ref,
      date_received: selectedData.date_received,
      package_type: selectedData.package_type,
      packages: selectedData.packages,
      dimension: selectedData.dimension,
      weight: selectedData.weight,
      supplier_address: selectedData.supplier_address,
      supplier: selectedData.supplier,
      warehouse_order_id: selectedData.warehouse_order_id,
      costs_to_collect: selectedData.costs_to_collect,
      warehouse_cost: selectedData.warehouse_cost,
      warehouse_dispatch: selectedData.warehouse_dispatch,
      cost_to_dispatch: selectedData.cost_to_dispatch,
      waybill_ref: selectedData.waybill_ref,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}updateWarehouseProduct`,
        payload,
      );
      if (response?.data?.success) {
        toast.success("   Product updated successfully");
        postassiandata();
        setIsModalOpen3(false);
        setSelectedData({});
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const totalWeight = apidata.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const totalPackages = apidata.reduce(
    (sum, item) => sum + Number(item.packages || 0),
    0
  );

  const totalDimension = apidata.reduce(
    (sum, item) => sum + Number(item.dimension || 0),
    0
  );
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="formDetails">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex align-items-center gap-3">
                <ArrowBackIcon
                  onClick={handleclicknav}
                  className="text-dark"
                  style={{ cursor: "pointer" }}
                />
                <h4 className="det_hd text-start mb-0">
                  Warehouse Full Details
                </h4>
              </div>
            </div>
          </div>
          <div className="details_box viewDetails">
            <div className="row">
              <div className="col-md-4 pe-4">
                <div className=" card desti_card">
                  <div className="card-body">
                    <div>
                      <h6 className="orgin_hd">Warehouse Details</h6>

                    </div>
                    <div className="main_det">
                      <div className="view_box">

                        <h6 className="ship_hd">
                          <i className="fi fi-rs-receipt build_icon"></i> Freight Details
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>
                            <p className="client_para">Freight Number:</p>
                            <p className="or_para">{info.freight_number}</p>

                            <p className="client_para">Date:</p>
                            <p className="or_para">
                              {new Date(info.created_at).toLocaleDateString("en-GB")}
                            </p>

                            <p className="client_para">Client:</p>
                            <p className="or_para">{info.client_name}</p>

                            <p className="client_para">Client Ref:</p>
                            <p className="or_para">{info.customer_ref}</p>

                            <p className="client_para">Groupage:</p>
                            <p className="or_para">{info?.batch_number}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card desti_card">
                  <div className="card-body">
                    <div className="">
                      <h6 className="orgin_hd">Costs Estimates</h6>

                    </div>
                    <div className="main_det">

                      <div className="view_box">

                        <h6 className="ship_hd">
                          <i className="fi fi-rs-dollar build_icon"></i> Cost Breakdown
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="client_para">Collection</p>
                            <p className="or_para">{info.order_warehouse_cost}</p>

                            <p className="client_para">Warehouse</p>
                            <p className="or_para">{info.warehouse_cost}</p>

                            <p className="client_para">Cost to Collect</p>
                            <p className="or_para">{info.order_costs_to_collect}</p>

                            <p className="client_para">Handling Costs</p>
                            <p className="or_para">{info.handling_cost}</p>

                            <p className="client_para">Origin Incidental Cost</p>
                            <p className="or_para">{info.origin_Incidental_costs}</p>

                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 pe-4">
                <div className=" card desti_card">
                  <div className="card-body">
                    <div>
                      <h6 className="orgin_hd">Packages Details</h6>

                    </div>
                    <div className="main_det">
                      <div className="view_box">

                        <h6 className="ship_hd">
                          <i className="fi fi-rs-box build_icon"></i> Package Summary
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>

                            <p className="client_para">Weight:</p>
                            <p className="or_para">{totalWeight}</p>

                            <p className="client_para">Dimensions:</p>
                            <p className="or_para">{totalDimension}</p>

                            <p className="client_para">Packages:</p>
                            <p className="or_para">{totalPackages}</p>

                            {/* Optional field */}
                            {/* 
        <p className="client_para">Orders:</p>
        <p className="or_para"></p>
        */}

                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="card desti_card">
              <div className="card-body mb-3">
                {Object.keys(documents).map((groupName, groupIndex) => (
                  <div key={groupIndex} className="mb-2">
                    <label>{groupName} :</label>
                    <div className="wayWillView">
                      {documents[groupName]?.map((item, index) => (
                        <div>
                          <div className="image-box">
                            <img
                              src={`${process.env.REACT_APP_BASE_URLdocument}${item?.document}`}
                              alt="doc"
                              className="preview-img"
                              onClick={() =>
                                window.open(
                                  `${process.env.REACT_APP_BASE_URLdocument}${item?.document}`,
                                  "_blank"
                                )
                              }
                            />

                            <FiTrash2
                              onClick={() => deleteapi(item.id)}
                              className="delete-icon action-icon-delete"
                            />
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                ))}
                {/* Quotation (separate because it's not part of groups) */}
                <div className="mb-2">
                  <label>Attach Quotation :</label>

                  {info.attachment_Estimate && (
                    <div>
                      <div className="image-box ms-2">
                        <img
                          src={`${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`}
                          alt="quotation"
                          className="preview-img"
                          onClick={() =>
                            window.open(
                              `${process.env.REACT_APP_BASE_URLdocument}${info?.attachment_Estimate}`,
                              "_blank"
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="table-responsive mt-2">
            <table className="table table-striped tableICon">
              <thead>
                <tr>
                  <th scope="col">Product Description</th>
                  <th scope="col">Waybill</th>
                  <th scope="col">Warehouse Ref</th>
                  <th scope="col">Date Received</th>
                  <th scope="col">Package Type</th>
                  <th scope="col">Packages</th>
                  <th scope="col">Dimension</th>
                  <th scope="col">Weight</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody style={{ border: "none" }}>
                {apidata &&
                  apidata.length > 0 &&
                  apidata.map((item, index) => {
                    return (
                      <>
                        <tr className="border-bottom" key={index}>
                          <td>{item.product_description}</td>
                          <td>{item.tracking_number}</td>
                          <td>{item.warehouse_ref}</td>
                          <td>
                            {new Date(item.date_received).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td>{item.package_type}</td>
                          <td>{item.packages}</td>
                          <td>{item.dimension}</td>
                          <td>{item.weight}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {item?.id ? (
                                <FiEye
                                  onClick={() => handleEditClickview(item.id)}
                                  className="action-icon-view"
                                />
                              ) : null}
                              {item?.id ? (
                                <FiEdit
                                  onClick={() => handleEditClick(item.id)}
                                  className="action-icon-edit"
                                />
                              ) : null}
                              {item?.id ? (
                                <FiTrash2
                                  onClick={() => handleEditClick12(item.id)}
                                  className="action-icon-delete"
                                />
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
        <Modal open={isModalOpen3} onClose={handleCloseModal3}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",

              bgcolor: "background.paper",
              boxShadow: 24,
              width: {
                xs: "95%",
                sm: "80%",
                md: "60%",
                lg: "40%",
              },
            }}
          >
            <div
              className="modal-header"
            >
              <h2 className="modal-title">Warehouse Detail</h2>
              <button onClick={handleCloseModal3}>
                <CloseIcon />
              </button>
            </div>
            <div className="newModalGap  noFormaControl">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Product Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="product description"
                    value={selectedData.product_description || ""}
                    onChange={handlechangepro}
                    name="product_description"
                  />
                </div>
                <div className="col-md-6 noFormaControl">
                  <label className="form-label">Harzadous</label>
                  <select
                    onChange={handlechangepro}
                    value={selectedData.Hazardous || ""}
                    name="Hazardous"
                  >
                    <option>Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Ref.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedData.warehouse_ref || ""}
                    placeholder="warehouse reference"
                    name="warehouse_ref"
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Data Received</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_received"
                    value={
                      selectedData.date_received
                        ? new Date(selectedData.date_received)
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6 noFormaControl">
                  <label className="form-label">Package Type</label>
                  <select
                    name="package_type"
                    value={selectedData.package_type || ""}
                    onChange={handlechangepro}
                  >
                    <option value="">Select...</option>
                    <option value="box">Box</option>
                    <option value="crate">Crate</option>
                    <option value="pallet">Pallet</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Total Packages</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    value={selectedData.packages || ""}
                    name="packages"
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Dimension</label>
                  <input
                    type="text"
                    name="dimension"
                    value={selectedData.dimension || ""}
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    className="form-control"
                    value={selectedData.weight || ""}
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Supplier Address</label>
                  <input
                    type="text"
                    name="supplier_address"
                    value={selectedData.supplier_address || ""}
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={selectedData.supplier || ""}
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Order</label>
                  <input
                    type="text"
                    name="warehouse_order_id"
                    className="form-control"
                    placeholder="0.00"
                    value={selectedData.warehouse_order_id || ""}
                    onChange={handlechangepro}
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Costs to Collect</label>
                  <input
                    type="text"
                    name="costs_to_collect"
                    className="form-control"
                    placeholder="0.00"
                    value={selectedData.costs_to_collect || ""}
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse dispatch</label>
                  <input
                    type="text"
                    value={selectedData.warehouse_dispatch || ""}
                    name="warehouse_dispatch"
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Waybill Ref</label>
                  <input
                    type="text"
                    value={selectedData.waybill_ref || ""}
                    name="waybill_ref"
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Cost</label>
                  <input
                    type="text"
                    name="warehouse_cost"
                    className="form-control"
                    placeholder="0.00"
                    value={selectedData.warehouse_cost || ""}
                    onChange={handlechangepro}
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cost to Dispatch</label>
                  <input
                    type="text"
                    name="cost_to_dispatch"
                    value={selectedData.cost_to_dispatch || ""}
                    className="form-control"
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>


              <div className="d-flex justify-content-center">
                <button className="blueBtn" variant="contained" onClick={handpechangepro}>
                  Edit Product
                </button>
              </div>
            </div>
          </Box>
        </Modal>
        <Modal open={isModalviewsection3} onClose={handleCloseadadModal3}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              width: {
                xs: "95%",
                sm: "80%",
                md: "60%",
                lg: "40%",
              },
            }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Warehouse Detail</h2>
              <button className="btn btn-close" onClick={handleCloseadadModal3}>
                <CloseIcon />
              </button>
            </div>
            <div className="newModalGap  noFormaControl">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Product Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="product description"
                    disabled
                    value={selectedData.product_description || ""}
                    onChange={handlechangepro}
                    name="product_description"
                  />
                </div>
                <div className="col-md-6 noFormaControl">
                  <label className="form-label">Harzadous</label>
                  <select
                    onChange={handlechangepro}
                    value={selectedData.Hazardous || ""}
                    name="Hazardous"
                    disabled
                  >
                    <option>Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Ref.</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedData.warehouse_ref || ""}
                    placeholder="warehouse reference"
                    disabled
                    name="warehouse_ref"
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Data Received</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_received"
                    disabled
                    value={
                      selectedData.date_received
                        ? new Date(selectedData.date_received)
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6 noFormaControl">
                  <label className="form-label">Package Type</label>
                  <select
                    name="package_type"
                    disabled
                    value={selectedData.package_type || ""}
                    onChange={handlechangepro}
                  >
                    <option value="">Select...</option>
                    <option value="box">Box</option>
                    <option value="crate">Crate</option>
                    <option value="pallet">Pallet</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Total Packages</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    value={selectedData.packages || ""}
                    name="packages"
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Dimension</label>
                  <input
                    type="text"
                    name="dimension"
                    value={selectedData.dimension || ""}
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    onChange={handlechangepro}
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Weight</label>
                  <input
                    type="text"
                    disabled
                    name="weight"
                    className="form-control"
                    value={selectedData.weight || ""}
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Supplier Address</label>
                  <input
                    type="text"
                    name="supplier_address"
                    disabled
                    value={selectedData.supplier_address || ""}
                    className="form-control"
                    placeholder="0.00"
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={selectedData.supplier || ""}
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    onChange={handlechangepro}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Order</label>
                  <input
                    type="text"
                    name="warehouse_order_id"
                    className="form-control"
                    placeholder="0.00"
                    value={selectedData.warehouse_order_id || ""}
                    onChange={handlechangepro}
                    disabled
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Costs to Collect</label>
                  <input
                    type="text"
                    name="costs_to_collect"
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    value={selectedData.costs_to_collect || ""}
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse dispatch</label>
                  <input
                    type="text"
                    value={selectedData.warehouse_dispatch || ""}
                    name="warehouse_dispatch"
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    onChange={handlechangepro}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Waybill Ref</label>
                  <input
                    type="text"
                    value={selectedData.waybill_ref || ""}
                    name="waybill_ref"
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Warehouse Cost</label>
                  <input
                    type="text"
                    name="warehouse_cost"
                    className="form-control"
                    placeholder="0.00"
                    disabled
                    value={selectedData.warehouse_cost || ""}
                    onChange={handlechangepro}
                    onKeyPress={handlekey}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Cost to Dispatch</label>
                  <input
                    type="text"
                    name="cost_to_dispatch"
                    value={selectedData.cost_to_dispatch || ""}
                    className="form-control"
                    disabled
                    placeholder="0.00"
                    onKeyPress={handlekey}
                    onChange={handlechangepro}
                  />
                </div>
              </div>
              <div className="row mb-3"></div>
              <div class="modal-footer"></div>
            </div>

          </Box>
        </Modal>
      </div>
    </div>
  );
}
