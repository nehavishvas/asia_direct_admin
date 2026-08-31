import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
export default function Supplierwarhousproduct() {
  const location = useLocation();
  const info = location.state.data;
  console.log(info);
  const [documents, setDocuments] = useState({});
  const [productData, setProductData] = useState("");
  const [productModalOpen1, setProductModalOpen1] = useState(false);
  const navigate = useNavigate();
  const [apidata, setApidata] = useState([]);
  const postassiandata = async () => {
    try {
      await axios
        .get(
          `${process.env.REACT_APP_BASE_URL}getSupplierWarehouseProducts?supplier_warehouse_id=${info.id}`,
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
  const getFileType = (fileName = "") => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    if (["doc", "docx"].includes(ext)) return "doc";
    return "other";
  };
  const handleclicknav = () => {
    window.history.back();
    // navigate("/Admin/SupplierWarehouse");
  };
  useEffect(() => {
    postassiandata();
    if (info?.files) {
      setDocuments(info.files);
    }
  }, []);

  const handlechangegetdatainput = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const editproduct123 = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}updateSupplierWarehouseProduct`,
        productData,
      );
      if (response?.data?.success) {
        Swal.fire("Success!", "Product updated successfully", "success");
        setProductModalOpen1(false);
        postassiandata(); // refresh data
      } else {
        Swal.fire("Error!", "Failed to update product", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error!", "Something went wrong", "error");
    }
  };

  useEffect(() => {
    postassiandata();
    if (info?.files) {
      const grouped = info.files.reduce((acc, item) => {
        const key = item.type || "other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
      setDocuments(grouped);
    }
  }, []);
  const deleteapi = (id) => {
    console.log(id);
    const data11 = {
      doc_id: id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}DeleteDocument`, data11)
      .then((response) => {
        // GetFreightImages();
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const totals = apidata.reduce(
    (acc, item) => {
      acc.packages += Number(item.packages) || 0;
      acc.weight += Number(item.weight) || 0;
      if (item.dimension && typeof item.dimension === "string") {
        const dims = item.dimension.split("x").map(Number);
        if (dims.length === 3) {
          const volume = dims[0] * dims[1] * dims[2];
          acc.dimension += volume || 0;
        } else {
          acc.dimension += Number(item.dimension) || 0;
        }
      } else {
        acc.dimension += Number(item.dimension) || 0;
      }
      return acc;
    },
    { packages: 0, dimension: 0, weight: 0 },
  );
  const handleEditClick = (freightId) => {
    console.log(freightId);
    const payload = {
      id: freightId,
    };
    try {
      const response = axios
        .post(
          `${process.env.REACT_APP_BASE_URL}getWarehouseProductById`,
          payload,
        )
        .then((res) => {
          console.log(res.data.data);
          setProductData(res.data.data);
          setProductModalOpen1(true);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const closeeditprocutmodal = () => {
    setProductModalOpen1(false);
    setProductData("");  
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
  return (
    <div className="wpWrapper">
      <div className="container-fluid">
        <div className="formDetails">
          <div className="row">
            <div className="col-lg-12">
              <div className="d-flex">
                <div>
                  <ArrowBackIcon

                    onClick={handleclicknav}
                    className="text-dark"
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <div>
                  <h4 className="det_hd text-start ms-3">
                    Warehouse Full Details
                  </h4>
                </div>
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
                          <i className="fi fi-rs-receipt build_icon"></i> Order Details
                        </h6>

                        <div className="d-flex align-items-start">
                          <div>
                            <p className="client_para">Order Number:</p>
                            <p className="or_para">OR000{info.order_id}</p>

                            <p className="client_para">Date:</p>
                            <p className="or_para">
                              {new Date(info.created_at).toLocaleDateString("en-GB")}
                            </p>

                            <p className="client_para">Client:</p>
                            <p className="or_para">{info.customer_name}</p>

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
                            <p className="or_para">{info.costs_to_collect}</p>

                            <p className="client_para">Warehouse</p>
                            <p className="or_para">{info.warehouse_cost}</p>

                            <p className="client_para">Cost to Collect</p>
                            <p className="or_para">{info.costs_to_collect}</p>

                            <p className="client_para">Origin On Carriage Costs</p>
                            <p className="or_para">{info.origin_oncarriage_costs}</p>

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
                            <p className="or_para">{totals.weight}</p>

                            <p className="client_para">Dimensions:</p>
                            <p className="or_para">{totals.dimension}</p>

                            <p className="client_para">Packages:</p>
                            <p className="or_para">{totals.packages}</p>
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
                  <div key={groupIndex} className="mb-4">
                    <label className="fw-bold text-capitalize">
                      {groupName.replace("_", " ")} :
                    </label>

                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {documents[groupName]?.map((item) => {
                        const fileUrl = `${process.env.REACT_APP_BASE_URLdocument}${item.file}`;
                        const fileType = getFileType(item.file);

                        return (
                          <div
                            key={item.id}
                            style={{
                              width: "140px",
                              border: "1px solid #ddd",
                              borderRadius: "10px",
                              padding: "8px",
                              textAlign: "center",
                              background: "#fafafa",
                            }}
                          >
                            {/* ✅ IMAGE */}
                            {fileType === "image" && (
                              <img
                                src={fileUrl}
                                alt="file"
                                style={{
                                  width: "100%",
                                  height: "90px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => window.open(fileUrl, "_blank")}
                              />
                            )}

                            {/* ✅ PDF */}
                            {fileType === "pdf" && (
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => window.open(fileUrl, "_blank")}
                              >
                                📄 <br /> PDF File
                              </div>
                            )}

                            {/* ✅ EXCEL */}
                            {fileType === "excel" && (
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => window.open(fileUrl, "_blank")}
                              >
                                📊 <br /> Excel File
                              </div>
                            )}

                            {/* ✅ DOC */}
                            {fileType === "doc" && (
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => window.open(fileUrl, "_blank")}
                              >
                                📝 <br /> Document
                              </div>
                            )}

                            {/* ✅ OTHER */}
                            {fileType === "other" && (
                              <div
                                style={{ cursor: "pointer" }}
                                onClick={() => window.open(fileUrl, "_blank")}
                              >
                                📎 <br /> File
                              </div>
                            )}

                            {/* ✅ FILE NAME */}
                            <div
                              style={{
                                fontSize: "11px",
                                marginTop: "5px",
                                wordBreak: "break-word",
                              }}
                            >
                              {item.file.split("-").slice(1).join("-")}
                            </div>

                            {/* ✅ DELETE */}
                            <DeleteIcon
                              onClick={() => deleteapi(item.id)}
                              className="text-danger mt-1"
                              style={{ cursor: "pointer", fontSize: "18px" }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* Quotation (separate because it's not part of groups) */}
                <div className="mb-2">
                  <label>Attach Quotation :</label>
                  {info.attachment_Estimate && (
                    <a
                      href={`${process.env.REACT_APP_BASE_URLdocument}/${info?.attachment_Estimate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view_docu ms-2"
                    >
                      View
                    </a>
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
                {apidata && apidata.length > 0 ? (
                  apidata.map((item, index) => {
                    return (
                      <tr className="border-bottom" key={index}>
                        <td>{item.product_description}</td>
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
                          {index !== 0 && ( // 👈 yaha condition lagayi
                            <FaEdit
                              onClick={() => handleEditClick(item.id)}
                              style={{ color: "#1d2044", cursor: "pointer" }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Modal
          open={productModalOpen1}
          onClose={closeeditprocutmodal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95%", // mobile
                sm: "80%", // tablet
                md: "70%", // small laptop
                lg: "60%", // desktop
              },
            }}
          >
            <div className="modal-header">
              <h2 id="modal-modal-title">Edit Warehouse Product</h2>
              <button className="btn btn-close" onClick={closeeditprocutmodal}>
                <CloseIcon />
              </button>
            </div>
            <div className="newModalGap noFormaControl">
              <div className="row g-2">
                <div className="col-md-6">
                  <label>Goods Description</label>
                  <input
                    className="form-control"
                    name="product_description"
                    onChange={handlechangegetdatainput}
                    value={productData.product_description}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Hazardous</label>
                  <input
                    className="form-control"
                    name="hazardous"
                    onChange={handlechangegetdatainput}
                    value={productData.hazardous}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Date Received</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date_received"
                    value={
                      productData.date_received
                        ? productData.date_received.split("T")[0]
                        : ""
                    }
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  />
                </div>
                <div className="col-md-6">
                  <label>Package Type</label>
                  <input
                    className="form-control"
                    name="package_type"
                    value={productData.package_type}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Packages</label>
                  <input
                    className="form-control"
                    name="packages"
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                    value={productData.packages}
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Dimension</label>
                  <input
                    className="form-control"
                    name="dimension"
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                    value={productData.dimension}
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Weight</label>
                  <input
                    className="form-control"
                    name="weight"
                    value={productData.weight}
                    onChange={handlechangegetdatainput}
                    placeholder="0.00"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Warehouse Ref</label>
                  <input
                    className="form-control"
                    name="warehouse_ref"
                    value={productData.warehouse_ref}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Freight</label>
                  {/* <input
                                  className="form-control"
                                  name="freight"
                                  value={productData.freight}
                                  onChange={handlechangegetdatainput}
                                  placeholder="warehouse name"
                                ></input> */}
                  <select
                    className="form-control"
                    name="freight"
                    value={productData.freight}
                    onChange={handlechangegetdatainput}
                  >
                    <option>select</option>
                    <option value="Sea">Sea</option>
                    <option value="Air">Air</option>
                    <option value="Road">Road</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label>Groupage Batch Ref</label>
                  <input
                    className="form-control"
                    name="groupage_batch_ref"
                    onChange={handlechangegetdatainput}
                    value={productData.groupage_batch_ref}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Warehouse Receipt Number</label>
                  <input
                    className="form-control"
                    name="warehouse_receipt_number"
                    value={productData.warehouse_receipt_number}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Date Dispatched</label>
                  {/* <input
                                  className="form-control"
                                  type="date"
                                  name="date_dspatched"
                                  value={productData.date_dspatched}
                                  onChange={handlechangegetdatainput}
                                  placeholder="warehouse name"
                                ></input> */}
                  <input
                    type="date"
                    className="form-control"
                    name="date_dispatched"
                    value={
                      productData.date_dispatched
                        ? productData.date_dispatched.split("T")[0]
                        : ""
                    }
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  />
                </div>

                <div className="col-md-6">
                  <label>Supplier Address</label>
                  <input
                    className="form-control"
                    name="supplier_address"
                    value={productData.supplier_address}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Warehouse Collect</label>
                  <input
                    className="form-control"
                    name="warehouse_collect"
                    value={productData.warehouse_collect}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Costs To Collect</label>
                  <input
                    className="form-control"
                    name="costs_to_collect"
                    value={productData.costs_to_collect}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Port Of Loading</label>
                  <input
                    className="form-control"
                    name="port_of_loading"
                    value={productData.port_of_loading}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Warehouse Dispatch</label>
                  <input
                    className="form-control"
                    name="warehouse_dispatch"
                    value={productData.warehouse_dispatch}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Warehouse Cost</label>
                  <input
                    className="form-control"
                    name="warehouse_cost"
                    value={productData.warehouse_cost}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Cost To Dispatch</label>
                  <input
                    className="form-control"
                    name="cost_to_dispatch"
                    value={productData.cost_to_dispatch}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Waybill Ref</label>
                  <input
                    className="form-control"
                    name="waybill_ref"
                    value={productData.waybill_ref}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label>Supplier Email</label>
                  <input
                    className="form-control"
                    name="supplier_Email"
                    value={productData.supplier_Email}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
                <div className="col-md-6">
                  <label>Supplier Contact</label>
                  <input
                    className="form-control"
                    name="Supplier_Contact"
                    value={productData.Supplier_Contact}
                    onChange={handlechangegetdatainput}
                    placeholder="warehouse name"
                  ></input>
                </div>
              </div>
              <button
                className="blueBtn mt-3"
                variant="contained"
                onClick={() => {
                  editproduct123();
                }}
              >
                Edit Product
              </button>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
