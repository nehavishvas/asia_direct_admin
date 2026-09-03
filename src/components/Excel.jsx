import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Excel() {
  const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
  const userid = userdata?.id;
  const usertype = userdata?.user_type;
  const [hasPermission, setHasPermission] = useState(null);
  const [pageLoader, setPageLoader] = useState(false);
  const [freightFile, setFreightFile] = useState(null);
  const [orderFile, setOrderFile] = useState(null);
  const [batchesFile, setBatchesFile] = useState(null);
  const [warehouseFile, setWarehouseFile] = useState(null);
  const [clientFile, setClientFile] = useState(null);
  const [sageinvoice, setSageinvoice] = useState(null);
  const [cashbook, setCashbook] = useState(null);
  const [loading, setLoading] = useState({
    freight: false,
    order: false,
    batches: false,
    warehouse: false,
    client: false,
    sageinvoice:false,
    cashbook:false,
  });
  const checkPermission = async () => {
    try {
      setPageLoader(true);
      if (!userid || !usertype) {
        setHasPermission(false);
        return;
      }
      const checkPost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/Admin/oploadfile",
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        checkPost
      );
      if (response.data && response.data.success === true) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        toast.error("Permission Denied: You don't have access to this page");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasPermission(false);
      toast.error(error.response?.data?.message || "Permission Denied: You don't have access to this page");
    } finally {
      setPageLoader(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const validateFile = (file) => {
    const allowedExtensions = ["xlsx", "xls"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }
  const handleFileChange = (file, setFile) => {
    if (file && validateFile(file)) {
      setFile(file);
    } else {
      toast.error("Invalid file type. Please upload an Excel file.");
    }
  };
  const handleUpload = (file, endpoint, fileType) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    setLoading((prev) => ({ ...prev, [fileType]: true }));
    const formdata = new FormData();
    formdata.append("file", file);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}${endpoint}`, formdata)
      .then((response) => {
        setLoading((prev) => ({ ...prev, [fileType]: false }));
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          toast.error("Upload failed. Please try again.");
        }
      })
      .catch((error) => {
        setLoading((prev) => ({ ...prev, [fileType]: false }));
        toast.error("An error occurred during upload.");
        console.error(error.response ? error.response.data : error);
      });
  };
  return (
    <>
      {pageLoader || hasPermission === null ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading...</p>
        </div>
      ) : hasPermission === false ? (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <h4 className="freight_hd">Upload Excel Files</h4>
                <div className="line"></div>
              </div>
            </div>
            <div className="text-center mt-5">
              <h3 className="text-danger">You don't have permission to access this page</h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="wpWrapper">
      <div className="container-fluid">
        <div className="row manageFreight">
          <div className="col-12">
            <div className="d-flex ">
              <div>
                <h4 className="freight_hd">Upload Excel Files</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div>
            <div >
              <div className="row align-items-center manageFreight mb-3">
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Freight Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setFreightFile)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(freightFile, "UploadExcelShipment", "freight")}
                      disabled={loading.freight}>
                      {loading.freight ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Order Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setOrderFile)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(orderFile, "UploadExcelShipmentOrder", "order")}
                      disabled={loading.order}
                    >
                      {loading.order ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div >
              <div className="row align-items-center manageFreight mb-3">
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Batches Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setBatchesFile)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(batchesFile, "UploadExcelBatch", "batches")}
                      disabled={loading.batches}
                    >
                      {loading.batches ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Warehouse Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setWarehouseFile)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(warehouseFile, "UploadExcelWarehouse", "warehouse")}
                      disabled={loading.warehouse}
                    >
                      {loading.warehouse ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div >
              <div className="row align-items-center manageFreight mb-3">
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Client Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setClientFile)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(clientFile, "upload-excel-client", "client")}
                      disabled={loading.client}
                    >
                      {loading.client ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Sage Invoice Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setSageinvoice)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(sageinvoice, "UploadSageInvoiceLlist", "sageinvoice")}
                      disabled={loading.client}
                    >
                      {loading.client ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div >
              <div className="row align-items-center manageFreight mb-3">
                <div className="col-md-6">
                  <div className="freight_excel">
                    <label>Cashbook Excel</label>
                  </div>
                  <div className="d-flex align-items-center">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e.target.files[0], setCashbook)}
                    />
                    <button
                      className="btn btn-primary mx-2"
                      onClick={() => handleUpload(cashbook, "UploadCashbookList", "cashbook")}
                      disabled={loading.cashbook}
                    >
                      {loading.cashbook ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div >
    </div >
      )}
    </>
  );
}
