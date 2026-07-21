import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";

const pageSize = 10;
const style1 = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "12px",
  overflow: "hidden",
  width: {
    xs: "95%", // mobile
    sm: "80%", // tablet
    md: "60%", // small laptop
    lg: "50%", // desktop
  },
};
export default function WarehouseOrder() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [batch, setBatch] = useState([]);
  const [countries, setCountries] = useState([]);
  const [file, setFile] = useState(null);
  const [formFiles, setFormFiles] = useState({
    supplier_invoice: [],
    other_documents: [],
    licenses: [],
    packing_list: [],
  });
  const [erd, setErd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [prodata, setProdata] = useState("");
  const [clientData, setClientData] = useState([]);
  const [orderID, setOrderID] = useState("");
  const [freightIdPass, setFreightIdPass] = useState("");
  const [responseData, setResponseData] = useState("");
  const [clickdata, setClickdata] = useState({});
  const [handlsupplier, setHandlsupplier] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleassignsupplier, setHandleassignsupplier] = useState(false);
  const [batchidsdsd, setBatchidsdsd] = useState();
  const [loader, setLoader] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [nameData, setNameData] = useState("");
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [updatedata, setUpdatedata] = useState(false);
  const [pagenationData, setPagenationData] = useState(1);
  const [data1, setData1] = useState({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    freightType: "",
    freightSpeed: "",
  });
  const [show1, setShow1] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  useEffect(() => {
    getcountry();
  }, []);
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountries(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.data);
      });
  };
  useEffect(() => {
    getclientdata();
  }, []);
  const getclientdata = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}client-list`,
      );
      if (response.data.success) {
        setClientData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const filterOptions = (options, { inputValue }) => {
    console.log("Filtering options with input:", inputValue);
    return options.filter(
      (option) =>
        option.full_name?.toLowerCase().startsWith(inputValue.toLowerCase()), // 👈 strict match
    );
  };
  const handlechangewarehouse = (e) => {
    const { name, value } = e.target;
    setNameData({ ...nameData, [name]: value });
  };
  const docOptions = [
    { id: "Warehouse Entry Docs", label: "Shipper Docs" },
    { id: "Warehouse Entry Docs", label: "Warehouse Docs" },
    { id: "Invoice, Packing List", label: "Invoice / Pkl" },
    { id: "Product Literature", label: "Product literature" },
    { id: "Letters of Authority", label: "LOA" },
  ];
  const handleShow = () => setShow1(true);
  const handleClose = () => setShow1(false);
  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedDocs.find((doc) => doc.name === selected)) {
      setSelectedDocs([...selectedDocs, { name: selected, files: [] }]);
    }
  };
  const handleFileChangefil = (e, docName) => {
    const files = Array.from(e.target.files);
    setSelectedDocs((prev) =>
      prev.map((doc) => (doc.name === docName ? { ...doc, files } : doc)),
    );
  };
  const handleSave = () => {
    console.log("Uploaded Documents:", selectedDocs);
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc);
      doc.files.forEach((file) => {
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    handleClose();
  };
  const [selectedData, setSelectedData] = useState(null);
  const navigate = useNavigate();
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleOpenModal3();
  };
  const handleCloseModalpopup = () => {
    setIsModalOpen(false);
  };
  const handleOpenModal2 = () => setIsModalOpen2(true);
  const handleOpenModal3 = () => setIsModalOpen3(true);
  const handleCloseModal2 = () => setIsModalOpen2(false);
  const handleCloseModal3 = () => setIsModalOpen3(false);
  useEffect(() => {
    getData();
  }, []);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  const getData = async (page) => {
    try {
      const datapost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/GetWarehouseOrders",
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      if (permission.data.success === true) {
        setLoader(true);
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}GetWarehouseOrders`,
            { user_id: userid, user_type: usertype, page: page },
          );
          setLoader(false);
          if (response.data && response.data.data) {
            setData(response.data.data);
            setPagenationData(response.data);
          } else {
            toast.error("No warehouse orders found.");
          }
        } catch (error) {
          setLoader(false);
          console.error("Error fetching warehouse orders:", error);
          if (error.response && error.response.status === 400) {
            toast.error(
              error.response.data.message ||
              "Data not found or permission denied.",
            );
          } else {
            toast.error("Something went wrong while fetching orders.");
          }
        }
      } else {
        toast.error("Permission Denied: You don’t have access to this action");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      if (error.response && error.response.status === 400) {
        toast.error("Permission Denied: You don’t have access to this page");
      } else {
        toast.error("Something went wrong while checking permission.");
      }
    }
  };
  const getAllBatch = (item) => {
    console.log(item);
    const payload = {
      des_country_id: item.delivery_to,
      origin_country_id: item.collection_from,
      freight: item.Freight,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}AllBatchNumbers`, payload)
      .then((response) => {
        setClickdata(response.data.data[0]);
        setBatch(response.data.data);
        toast.error(response.data.data.message);
      })
      .catch((error) => {
        console.error(error.response.data);
        toast.error("Error fetching batch data");
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getData(page);
  };
  const handleEditClick = (freight_ID, warehouse_assign_order_id, order_id) => {
    console.log(freight_ID, warehouse_assign_order_id, order_id);
    console.log(data);
    setOrderID(order_id);
    setErd(warehouse_assign_order_id);
    const selectedItem = data.find(
      (item) => (item.freight_ID ?? item.freight_id) === freight_ID,
    );
    console.log(selectedItem);
    if (selectedItem) {
      const freightVal =
        selectedItem.freight ||
        selectedItem.Freight ||
        selectedItem.freight_type ||
        "";
      const clientVal = selectedItem.client_id || "";
      setSelectedData({
        ...selectedItem,
        freight: freightVal,
      });
      setNameData((prev) => ({
        ...(typeof prev === "object" && prev !== null ? prev : {}),
        client_id: clientVal,
      }));
    } else {
      setSelectedData(selectedItem);
    }
    handleOpenModal();
  };
  const handleEditClickAssign = (freight_ID, order_id) => {
    console.log(freight_ID, order_id);
    setOrderID(order_id);
    setFreightIdPass(freight_ID);
    const selectedData = data.find(
      (item) => (item.freight_ID ?? item.freight_id) === freight_ID,
    );
    console.log(selectedData);
    setSelectedData(selectedData);
    setHandleassignsupplier(true);
  };
  const handleclose = () => {
    setHandleassignsupplier(false);
  };
  const handleEditClick12 = (
    warehouse_assign_order_id,
    order_id,
    freight_id,
  ) => {
    const data = {
      id: warehouse_assign_order_id,
      order_id: order_id,
      freight_id: freight_id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}DeleteWarehouseOrder`, data)
      .then((response) => {
        toast.success(response.data.message);
        getData();
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handleBatchChange = (e, item) => {
    const batchId = e.target.value;
    setBatchidsdsd(e.target.value);
    console.log(e);
    console.log(clickdata);
    console.log(item);
    console.log(item.batch_id);
    console.log(e.target.value, item);
    if (batchId) {
      console.log(batchId);
      moveFreightToBatch(batchId, item);
    }
  };
  const moveFreightToBatch = (batchId, item) => {
    console.log(item, batchId);
    const datapost = {
      freight_id: item.freight_id,
      batch_id: batchId,
      warehouse_id: item.warehouse_id,
      order_id: item.order_id,
    };
    console.log(datapost);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}moveFreightToBatch`, datapost)
      .then((response) => {
        toast.success("Freight moved to batch successfully");
        getData();
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const totalPage = Math.ceil(pagenationData.total / pagenationData.limit);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedData({ ...selectedData, [name]: value });
  };
  const handleSubmit = () => {
    const formdata1 = new FormData();
    formdata1.append(
      "warehouse_assign_id",
      selectedData.warehouse_assign_order_id,
    );
    formdata1.append("order_id", selectedData.order_id);
    formdata1.append("freight_id", selectedData.freight_id);
    formdata1.append("ware_receipt_no", selectedData.ware_receipt_no);
    formdata1.append("tracking_number", selectedData.tracking_number);
    formdata1.append("warehouse_status", selectedData.warehouse_status);
    formdata1.append("warehouse_collect", selectedData.warehouse_collect);
    formdata1.append("destination_country", selectedData.delivery_to);
    formdata1.append("collection_from", selectedData.collection_from);
    formdata1.append("date_received", selectedData.date_received);
    formdata1.append("package_type", selectedData.package_type);
    formdata1.append("no_of_packages", selectedData.no_of_packages);
    formdata1.append("customer_name", selectedData.customer_name);
    formdata1.append(
      "client_id",
      nameData?.client_id ?? selectedData?.client_id ?? "",
    );
    formdata1.append("total_dimension", selectedData.total_dimension);
    formdata1.append("goods_description", selectedData.goods_description);
    formdata1.append("weight", selectedData.weight);
    formdata1.append("freight", selectedData.freight);
    formdata1.append("costs_to_collect", selectedData.order_costs_to_collect);
    formdata1.append("warehouse_cost", selectedData.order_warehouse_cost);
    formdata1.append("warehouse_dispatch", selectedData.warehouse_dispatch);
    formdata1.append("cost_to_dispatch", selectedData.cost_to_dispatch);
    formdata1.append("dispatched_date", selectedData.dispatched_date);
    formdata1.append("documentName", selectedData.documentName);
    formdata1.append("courier_waybill_ref", selectedData.courier_waybill_ref);
    // formdata1.append("dispatched_date", selectedData.dispatched_date);
    formdata1.append("warehouse_comment", selectedData.warehouse_comment);
    formdata1.append("customer_ref", selectedData.customer_ref);
    formdata1.append("box_marking", selectedData.box_marking);
    formdata1.append("hazardous", selectedData.hazardous);
    formdata1.append("hazard_description", selectedData.hazard_description);
    formdata1.append("package_comment", selectedData.package_comment);
    formdata1.append("damage_goods", selectedData.damage_goods);
    formdata1.append("damaged_pkg_qty", selectedData.damaged_pkg_qty);
    formdata1.append("damage_comment", selectedData.damage_comment);
    formdata1.append("supplier_company", selectedData.supplier_company);
    formdata1.append("supplier_person", selectedData.supplier_person);
    formdata1.append("supplier_address", selectedData.supplier_address);
    formdata1.append("supplier_contact_no", selectedData.supplier_contact_no);
    formdata1.append("warehouse_order_id", selectedData.warehouse_order_id);
    formdata1.append("warehouse_storage", selectedData.warehouse_storage);
    formdata1.append("handling_required", selectedData.handling_required);
    formdata1.append("handling_cost", selectedData.handling_cost);
    formdata1.append("supplier_contact", selectedData.supplier_contact);
    formdata1.append("packages", JSON.stringify(selectedData.packages));
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc.name);
      doc.files.forEach((file) => {
        formdata1.append(doc.name, file); // 👈 each file append
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    for (let [key, value] of formdata1.entries()) {
      console.log(`${key}:`, value);
    }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}editWarehouseDetails`, formdata1)
      .then((response) => {
        setSelectedDocs([]);
        toast.success("Warehouse order updated successfully");
        getData();
        handleCloseModal();
      })
      .catch((error) => {
        console.error(error.response?.data || error.message);
        toast.error("Error updating warehouse order");
      });
  };
  const closeModal1 = () => {
    setIsModalOpen1(false);
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const postData1 = () => {
    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      axios
        .post(`${process.env.REACT_APP_BASE_URL}UploadExcelWarehouse`, formdata)
        .then((response) => {
          if (response.data.success === true) {
            toast.success(response.data.message);
            closeModal1();
          }
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } else {
      console.log("No file selected");
    }
  };
  const handleclicknavi = async (item) => {
    console.log(item);
    try {
      const datapost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/Admin/warehousedetails",
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      if (permission.data.success === true) {
        console.log(item);
        navigate("/Admin/warehousedetails", { state: { data: item } });
      } else {
        toast.error("Permission Denied: You don’t have access to this page");
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      if (error.response && error.response.status === 400) {
        toast.error("Permission Denied: You don’t have access to this page");
      } else {
        toast.error("Something went wrong while checking permission.");
      }
    }
  };
  const handleclickrevert123 = (item) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-estimate-details`, {
        estimate_id: item.estimated_id,
      })
      .then((response) => {
        navigate("/Admin/download_url", { state: response.data.data });
      })
      .catch((error) => {
        toast.error("Estimate not calculate");
      });
  };
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData1({ ...data1, [name]: value });
  };
  const handlechangepro = (e) => {
    const { name, value } = e.target;
    setProdata({ ...prodata, [name]: value });
  };
  const handpechangepro = () => {
    console.log(erd);
    const formdata = new FormData();
    formdata.append("warehouse_order_id", erd);
    formdata.append("order_id", orderID);
    formdata.append("user_id", JSON.parse(localStorage.getItem("data123")).id);
    formdata.append(
      "added_by",
      JSON.parse(localStorage.getItem("data123")).user_type,
    );
    formdata.append("product_description", prodata.product_description);
    formdata.append("Hazardous", prodata.Hazardous);
    formdata.append("date_received", prodata.date_received);
    formdata.append("package_type", prodata.package_type);
    formdata.append("packages", prodata.packages);
    formdata.append("dimension", prodata.dimension);
    formdata.append("weight", prodata.weight);
    formdata.append("warehouse_ref", prodata.warehouse_ref);
    formdata.append("freight", prodata.freight);
    formdata.append("groupage_batch_ref", prodata.groupage_batch_ref);
    formdata.append("supplier", prodata.supplier);
    formdata.append(
      "warehouse_receipt_number",
      prodata.warehouse_receipt_number,
    );
    formdata.append("tracking_number", prodata.tracking_number);
    formdata.append("date_dspatched", prodata.date_dspatched);
    formdata.append("supplier_address", prodata.supplier_address);
    formdata.append("warehouse_collect", prodata.warehouse_collect);
    formdata.append("costs_to_collect", prodata.costs_to_collect);
    formdata.append("port_of_loading", prodata.port_of_loading);
    formdata.append("warehouse_dispatch", prodata.warehouse_dispatch);
    formdata.append("warehouse_cost", prodata.warehouse_cost);
    formdata.append("cost_to_dispatch", prodata.cost_to_dispatch);
    formdata.append("waybill_ref", prodata.waybill_ref);
    formdata.append("documentName", prodata.documentName);
    // Append files with static key "document"
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc.name);
      doc.files.forEach((file) => {
        formdata.append(doc.name, file); // 👈 each file append
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    // Optional: log the formdata
    for (let [key, value] of formdata.entries()) {
      console.log(`${key}:`, value);
    }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}addWarehouseProduct`, formdata)
      .then((response) => {
        handleCloseModal3();
        toast.success(response.data.message);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response?.data || error.message);
        toast.error("Error adding warehouse product");
      });
  };
  console.log(selectedData);
  const handlekey = (e) => {
    if (e.charCode < 48 || e.charCode > 57) {
      e.preventDefault();
    }
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
    const data3 = {
      origin: data1.origin,
      destination: data1.destination,
      startDate: data1.startDate,
      endDate: data1.endDate,
      freightType: data1.freight,
      freightSpeed: data1.type,
      user_id: userid,
      user_type: usertype,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}GetWarehouseOrders`, data3)
      .then((response) => {
        console.log(response.data.data);
        if (response.data.success === true) {
          handleCloseModal2();
          setData(response.data.data);
          setPagenationData(response.data);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.length < 3) {
      getData(1); // default data load
      return;
    }
    debouncedSearch(value);
  };
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const debouncedSearch = useRef(
    debounce((value) => {
      getdata11(value);
    }, 500),
  ).current;
  const throttle = (func, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  };
  const throttledSearch = useRef(
    throttle((value) => {
      getdata11(value);
    }, 1000),
  ).current;
  const getdata11 = async (value) => {
    setLoader(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetWarehouseOrders`,
        { user_id: userid, user_type: usertype, search: value.trim() },
      );
      setLoader(false);
      if (response.data && response.data.data) {
        setData(response.data.data);
        setPagenationData(response.data);
      } else {
        toast.error("No warehouse orders found.");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching warehouse orders:", error);
      if (error.response && error.response.status === 400) {
        toast.error(
          error.response.data.message || "Data not found or permission denied.",
        );
      } else {
        toast.error("Something went wrong while fetching orders.");
      }
    }
  };
  useEffect(() => {
    getSupplier();
  }, []);
  const getSupplier = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}supplier-list`,
      );

      if (response.status === 200) {
        setHandlsupplier(response.data.data);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error fetching supplier list:",
        error.response?.data || error.message,
      );
    }
  };
  const handleChangeSupplier = (e) => {
    setResponseData(e.target.value);
  };
  const AssignSupplier = async () => {
    if (!responseData) {
      toast.error("Please select a supplier");
      return;
    }
    const payload = {
      supplier_id: parseInt(responseData, 10),
      freight_id: freightIdPass,
      order_id: orderID,
    };
    console.log("Payload:", payload);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}assignWarehouseOrderToSupplier`,
        payload,
      );
      toast.success(response.data?.message || "Supplier assigned successfully");
      handleclose();
    } catch (error) {
      if (error.response) {
        toast.error(
          error.response.data?.message ||
          `Request failed with status ${error.response.status}`,
        );
      } else if (error.request) {
        toast.error("Server not responding. Please try again later.");
      } else {
        // ✅ Something else went wrong
        toast.error(error.message || "Something went wrong");
      }
      console.error("AssignSupplier Error:", error);
    }
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="freight_hd">Warehouse Order List</h4>
                </div>
                <div className="d-flex justify-content-end align-items-center">
                  <div className="">
                    <input
                      className="px-2 py-1 rounded "
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearch}
                    ></input>
                  </div>
                  <div className="ms-1">
                    <button
                      className="blueBtn"
                      variant="contained"
                      onClick={() => {
                        handleOpenModal2();
                      }}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {loader ? (
            <div class="loader-container">
              <div class="loader"></div>
              <p class="loader-text">Updating... This may take some time</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-12">
                <div className="  mt-3">
                  <div className="">
                    <div className="table-responsive">
                      <table className="table table-striped tableICon supplierMainTable">
                        <tbody>
                          {data &&
                            data.length > 0 &&
                            data.map((item) => {
                              return (
                                <>
                                  <tr key={item.id}>
                                    <td className="list_bd">
                                      <div>
                                        <div className="row align-items-center">
                                          <div className="col-md-2">
                                            <p
                                              className="client_nm"
                                              style={{ fontSize: "16px" }}
                                            >
                                              {item.client_name}
                                            </p>
                                          </div>
                                          <div className="col-md-2">
                                            <div>
                                              <p>{item.order_number}</p>
                                            </div>
                                          </div>
                                          <div className="col-md-4">
                                            <div className="dropdown">
                                              <select
                                                onClick={() => {
                                                  getAllBatch(item);
                                                }}
                                                onChange={(e) =>
                                                  handleBatchChange(e, item)
                                                }
                                                name="dropval"
                                                value={item?.dropval}
                                                className="py-1 ps-1 sel_batches"
                                                style={{ cursor: "pointer" }}
                                              >
                                                <option
                                                  className="op_tion"
                                                  value=""
                                                >
                                                  Select Batch
                                                </option>
                                                {batch &&
                                                  batch.length > 0 &&
                                                  batch.map(
                                                    (batchItem, index) => (
                                                      <option
                                                        className="op_tion"
                                                        key={index}
                                                        value={
                                                          batchItem.batch_id
                                                        }
                                                      >
                                                        {
                                                          batchItem.batch_number
                                                        }
                                                      </option>
                                                    ),
                                                  )}
                                              </select>
                                            </div>
                                          </div>
                                          <div className="col-md-2">
                                            <p>
                                              <span className="bold600">
                                                Weight:
                                              </span>{" "}
                                              {item.weight || 0}
                                            </p>
                                          </div>
                                          <div className="col-md-2 text-end">
                                            <p className="port_date">
                                              {new Date(
                                                item.date,
                                              ).toLocaleDateString("en-GB")}
                                            </p>
                                          </div>
                                          <div className="supParaGroup">
                                            <p className="fright_no mx-2">
                                              {[item.batch_number, item.freight_number]
                                                .filter(Boolean)
                                                .join(" / ") || "-"}
                                            </p>
                                          </div>
                                        </div>
                                        {/* second row */}
                                        <div className="row align-items-center">
                                          <div className="col-md-4">
                                            <div className="">
                                              <p className="origin">
                                                {item.product_desc}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="col-md-4">
                                            <div className="d-flex ">
                                              <p className="origin">
                                                {item.collection_from_name}
                                              </p>
                                              <div className="arrow">
                                                <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                              </div>
                                              <p className="origin">
                                                {item.delivery_to_name}
                                                <span className="fright_type">
                                                  (
                                                  {item.Freight
                                                    ? item.Freight
                                                    : item.freight_type}
                                                  )
                                                </span>
                                              </p>
                                            </div>
                                            <div className="d-flex">
                                              <p className="origin">Status: {item.warehouse_item_status}</p>
                                            </div>
                                          </div>
                                          <div className="col-md-2">
                                            <p>
                                              <span>Dimension: </span>
                                              {item.dimension || 0}
                                            </p>
                                          </div>
                                          <div className="col-md-2">
                                            <div className="text-end">
                                              <p className="origin">
                                                <span>Packages: </span>
                                                {item.total_packages || 0}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {/* third row */}
                                        <div className="row align-items-center">
                                          <div className="col-md-2">
                                            <div className="d-flex align-items-center">
                                              <p
                                                type="radio"
                                                className="input_user mb-0"
                                              />
                                              {item.assign_to_batch === 0 ? (
                                                <div className="d-flex align-items-center">
                                                  <span className="dot bg-danger me-2"></span>
                                                  <p
                                                    className="text-danger mb-0"
                                                    style={{ fontSize: "12px" }}
                                                  >
                                                    Batch Not Assigned
                                                  </p>
                                                </div>
                                              ) : (
                                                <div className="d-flex align-items-center">
                                                  <span className="dot bg-success me-2"></span>
                                                  <p
                                                    className="text-success mb-0"
                                                    style={{ fontSize: "12px" }}
                                                  >
                                                    Batch Assigned
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="col-md-2">
                                            <div>
                                              <p>
                                                Days in Warehouse:{" "}
                                                {item.days_in_warehouse || 0}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="col-md-4"></div>
                                          <div className="col-md-2"></div>
                                          <div className="col-md-2 text-end">
                                            <i
                                              class="fa fa-tasks me-2 mt-2"
                                              onClick={() =>
                                                handleEditClickAssign(
                                                  item.freight_ID,
                                                  item.order_id,
                                                )
                                              }
                                              style={{
                                                color: "#1d2044",
                                                cursor: "pointer",
                                              }}
                                            />
                                            <FaEdit
                                              onClick={() =>
                                                handleEditClick(
                                                  item.freight_id,
                                                  item.warehouse_assign_order_id,
                                                  item.order_id,
                                                )
                                              }
                                              style={{
                                                color: "#1d2044",
                                                cursor: "pointer",
                                              }}
                                            />
                                            <DeleteIcon
                                              onClick={() =>
                                                handleEditClick12(
                                                  item.warehouse_assign_order_id,
                                                  item.order_id,
                                                  item.freight_id,
                                                )
                                              }
                                              style={{
                                                color: "#1d2044",
                                                cursor: "pointer",
                                              }}
                                            />
                                            <VisibilityIcon
                                              onClick={() =>
                                                handleclicknavi(item)
                                              }
                                              style={{
                                                color: "rgb(27 34 69)",
                                                cursor: "pointer",
                                                width: "20px",
                                              }}
                                            />
                                            <PictureAsPdfIcon
                                              style={{ cursor: "pointer" }}
                                              onClick={() => {
                                                handleclickrevert123(item);
                                              }}
                                            />
                                          </div>{" "}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                        </tbody>
                      </table>
                      <div className="text-center d-flex justify-content-end align-items-center">
                        <button
                          disabled={currentPage === 1}
                          className="bg_page"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <i class="fi fi-rr-angle-small-left page_icon"></i>
                        </button>
                        <span className="mx-2">{`Page ${currentPage} of ${totalPage}`}</span>
                        <button
                          disabled={currentPage === totalPage}
                          className="bg_page"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <i class="fi fi-rr-angle-small-right page_icon"></i>
                        </button>
                      </div>
                      <ToastContainer />
                      <Modal
                        open={handleassignsupplier}
                        onClose={handleclose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                      >
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
                            <h2 className="modal-title" id="modal-modal-title text-dark">
                              Assign Supplier
                            </h2>
                             <button
                              className="btn btn-close"
                              onClick={handleclose}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="newModalGap  noFormaControl">
                            <select
                              className="form-select"
                              onChange={handleChangeSupplier}
                            >
                              <option>select</option>

                              {handlsupplier &&
                                handlsupplier.length > 0 &&
                                handlsupplier.map((item, index) => {
                                  return (
                                    <>
                                      <option key={index} value={item.id}>
                                        {item.name}
                                      </option>
                                    </>
                                  );
                                })}
                            </select>
                            <div className="d-flex justify-content-center  mt-3">
                              <button
                                variant="contained"
                                className="blueBtn"
                                onClick={AssignSupplier}>
                                Submit
                              </button>
                            </div>
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={isModalOpen1}
                        onClose={closeModal1}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            height: 300,
                            width: 450,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                          }}
                        >
                          <h4 id="modal-modal-title">Add Excel</h4>
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="mb-3 border ps-2 py-2 rounded w-100"
                            style={{ display: "block", marginTop: "16px" }}
                          />
                          <Button
                            variant="contained"
                            className="submit_btn"
                            onClick={postData1}
                          >
                            Submit
                          </Button>
                        </Box>
                      </Modal>
                      <Modal
                        open={isModalOpen2}
                        onClose={handleCloseModal2}
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
                              xs: "95%",
                              sm: "80%",
                              md: "60%",
                              lg: "40%",
                            },
                          }}
                        >
                          <div className="modal-header">
                            <h2 id="modal-modal-title">Filter</h2>
                            <button
                              className="btn btn-close"
                              onClick={handleCloseModal2}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="newModalGap noFormaControl">
                            <div className="row my-3  ">
                              <div className="col-6">
                                <label>Delivery Type</label>
                                <select name="type" onChange={handlechange}>
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
                                <select name="origin" onChange={handlechange}>
                                  <option value="">Select</option>
                                  {updatedata &&
                                    updatedata.length > 0 &&
                                    updatedata.map((item, index) => {
                                      return (
                                        <>
                                          <option value={item.id}>
                                            {item.name}
                                          </option>
                                        </>
                                      );
                                    })}
                                </select>
                              </div>
                              <div className="col-6">
                                <label>Delivery to Country </label>
                                <select
                                  name="destination"
                                  onChange={handlechange}
                                >
                                  <option value="">Select</option>
                                  {updatedata &&
                                    updatedata.length > 0 &&
                                    updatedata.map((item, index) => {
                                      return (
                                        <>
                                          <option value={item.id}>
                                            {item.name}
                                          </option>
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
                              <div className="col-6">
                                <label>Freight</label>
                                <select name="freight" onChange={handlechange}>
                                  <option value="">Select...</option>
                                  <option value="Sea">Sea</option>
                                  <option value="Air">Air</option>
                                  <option value="Road">Road</option>
                                </select>
                              </div>
                            </div>
                            <div className="d-flex justify-content-center">
                              <button className="blueBtn" variant="contained" onClick={postData}>
                                Apply
                              </button>

                            </div>
                          </div>
                        </Box>
                      </Modal>
                      <Modal
                        open={isModalOpen}
                        onClose={handleCloseModalpopup}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                        className="editWare"
                      >
                        <Box sx={style1}>
                          <div className="modal-header">
                            <h2 id="modal-modal-title">Edit Warehouse Order</h2>
                            <button
                              className="btn btn-close"
                              onClick={handleCloseModalpopup}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="newModalGap noFormControl">
                            <div className="text-center">
                              <div className="d-flex justify-content-between">
                                <div
                                  className="fs-3  d-flex align-items-center justify-content-center rounded-circle   text-white mb-3"
                                  style={{
                                    cursor: "pointer",
                                    height: 35,
                                    width: 35,
                                    background: "#1b2245",
                                  }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#exampleModal"
                                  onClick={handleCloseModal}
                                >
                                  <i
                                    class="fa fa-plus"
                                    style={{ fontSize: "16px" }}
                                    aria-hidden="true"
                                  ></i>
                                </div>
                              </div>
                            </div>
                            {selectedData && (
                              <div className="row g-2">
                                {/* <div item className="col-md-6">
                                    <label htmlFor="">Customer Name</label>
                                    <input
                                      className="form-control"
                                      value={selectedData.customer_name}
                                      name="customer_name"
                                      onChange={handleInputChange}
                                      placeholder="customer name"
                                    />
                                  </div>
                                  <div item className="col-md-6">
                                    <label htmlFor="">Customer Ref</label>

                                    <input
                                      className="form-control"
                                      value={selectedData.customer_ref}
                                      name="customer_ref"
                                      onChange={handleInputChange}
                                      placeholder="customer name"
                                    />
                                  </div> */}
                                <div item className="col-md-6">
                                  <label htmlFor="">Date</label>
                                  <input
                                    className="form-control"
                                    label="Date Received"
                                    type="date"
                                    variant="outlined"
                                    name="date_received"
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    value={
                                      selectedData?.date_received &&
                                        !isNaN(
                                          new Date(selectedData.date_received),
                                        )
                                        ? new Date(selectedData.date_received)
                                          .toISOString()
                                          .split("T")[0]
                                        : ""
                                    }
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Warehouse Order Id</label>
                                  <input
                                    type="type"
                                    className="form-control"
                                    value={selectedData.warehouse_order_id}
                                    name="warehouse_order_id"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  />
                                </div>

                                <div className="col-md-6">
                                  <label>Courier waybill_ref</label>
                                  <input
                                    type="type"
                                    className="form-control"
                                    value={selectedData.courier_waybill_ref}
                                    name="courier_waybill_ref"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Dispatch Date</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={
                                      selectedData?.dispatched_date &&
                                        !isNaN(
                                          new Date(selectedData.dispatched_date),
                                        )
                                        ? new Date(selectedData.dispatched_date)
                                          .toISOString()
                                          .split("T")[0]
                                        : ""
                                    }
                                    name="dispatched_date"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-12">
                                  <h5 className="mt-3 mb-2">
                                    Package Information
                                  </h5>
                                </div>

                                <div item className="col-md-6">
                                  <label htmlFor="">Customer Name</label>
                                  {/* <input
                                      className="form-control"
                                      value={selectedData.customer_name}
                                      name="customer_name"
                                      onChange={handleInputChange}
                                      placeholder="customer name"
                                    /> */}
                                  <Autocomplete
                                    options={clientData || []}
                                    getOptionLabel={(option) =>
                                      option.full_name || ""
                                    }
                                    filterOptions={filterOptions}
                                    value={
                                      clientData.find(
                                        (item) =>
                                          Number(item.id) ===
                                          Number(
                                            nameData?.client_id ??
                                              selectedData?.client_id,
                                          ),
                                      ) || null
                                    }
                                    onChange={(event, newValue) => {
                                      const newClientId = newValue
                                        ? newValue.id
                                        : "";
                                      handlechangewarehouse({
                                        target: {
                                          name: "client_id",
                                          value: newClientId,
                                        },
                                      });
                                      setSelectedData((prev) => ({
                                        ...prev,
                                        client_id: newClientId,
                                      }));
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      Number(option.id) === Number(value.id)
                                    }
                                    renderInput={(params) => (
                                      <TextField {...params} />
                                    )}
                                  />
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Freight</label>

                                  <select
                                    className="form-control py-3"
                                    value={
                                      (
                                        selectedData?.freight ||
                                        selectedData?.Freight ||
                                        selectedData?.freight_type ||
                                        ""
                                      ).toLowerCase()
                                    }
                                    name="freight"
                                    onChange={handleInputChange}
                                  >
                                    <option value="">select</option>
                                    <option value="sea">Sea</option>
                                    <option value="air">Air</option>
                                    <option value="road">Road</option>
                                  </select>
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Customer Ref</label>

                                  <input
                                    className="form-control"
                                    value={selectedData.customer_ref}
                                    name="customer_ref"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Box Marking</label>
                                  <input
                                    className="form-control"
                                    name="box_marking"
                                    value={selectedData.box_marking}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Country of Origin</label>
                                  <select
                                    name="collection_from"
                                    value={selectedData.collection_from}
                                    onChange={handleInputChange}
                                    className="form-select"
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
                                <div className="col-md-6">
                                  <label> Destination Country</label>
                                  <select
                                    name="delivery_to"
                                    value={selectedData.delivery_to}
                                    onChange={handleInputChange}
                                    className="form-select"
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
                                <div className="col-md-6">
                                  <label>Good Description</label>
                                  <input
                                    type="Good Description"
                                    className="form-control"
                                    value={selectedData.goods_description}
                                    name="goods_description"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Packing Type</label>
                                  <select
                                    className="form-select"
                                    value={selectedData.package_type}
                                    name="package_type"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  >
                                    <option value="">Select</option>
                                    <option value="carte">carte</option>
                                    <option value="pallet">pallet</option>
                                    <option value="Box">Box</option>
                                    <option value="Bag">Bag</option>
                                  </select>
                                </div>
                                <div className="col-md-6">
                                  <label>Hazardous </label>
                                  <select
                                    className="form-select"
                                    value={selectedData.hazardous}
                                    name="hazardous"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  >
                                    <option value="">Select</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                  </select>
                                </div>
                                {selectedData.hazardous === "Yes" ? (
                                  <div className="col-md-6">
                                    <label>Description of Hazardous </label>
                                    <input
                                      type="type"
                                      className="form-control"
                                      value={selectedData.hazard_description}
                                      name="hazard_description"
                                      onChange={handleInputChange}
                                      placeholder=""
                                    />
                                  </div>
                                ) : (
                                  ""
                                )}

                                <div item className="col-md-6">
                                  <label htmlFor="">Total Packages</label>
                                  <input
                                    className="form-control"
                                    label="Total Packages"
                                    variant="outlined"
                                    name="no_of_packages"
                                    value={selectedData.no_of_packages || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Dimension</label>
                                  <input
                                    className="form-control"
                                    label="Dimension"
                                    variant="outlined"
                                    name="total_dimension"
                                    value={selectedData.total_dimension || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>

                                <div item className="col-md-6">
                                  <label htmlFor="">Weight</label>
                                  <input
                                    className="form-control"
                                    label="Weight"
                                    variant="outlined"
                                    name="weight"
                                    value={selectedData.weight || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>

                                <div className="col-lg-12">
                                  <label>Comment on Packages</label>
                                  <textarea
                                    className="w-100 form-control"
                                    name="package_comment"
                                    value={selectedData.package_comment}
                                    onChange={handleInputChange}
                                    placeholder="Other Information"
                                  ></textarea>
                                </div>

                                <div className="col-md-12">
                                  <h5 className="mt-3 mb-2">Damaged Goods</h5>
                                </div>

                                <div className="col-md-6">
                                  <label>Damaged Goods</label>
                                  <select
                                    type="text"
                                    className="form-select"
                                    value={selectedData.damage_goods}
                                    name="damage_goods"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div className="col-md-6">
                                  <label>Damaged Packed (qty)</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.damaged_pkg_qty}
                                    name="damaged_pkg_qty"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                {/* <div className="col-md-12">
                                        <label>Attach File</label>
                                        <TextField
                                          type="file"
                                          className="form-control"
                                          
                                          name="attach_file"
                                          onChange={handleInputChange}
                                        ></input>
                                      </div> */}

                                <div className="col-md-12">
                                  <label>Comment on Damaged</label>

                                  <textarea
                                    className="w-100 form-control"
                                    name="damage_comment"
                                    onChange={handleInputChange}
                                    value={selectedData.damage_comment}
                                  ></textarea>
                                </div>
                                <div className="col-md-12">
                                  <h5 className="mt-3 mb-2">
                                    Supplier Information
                                  </h5>
                                </div>

                                <div className="col-md-6">
                                  <label>Supplier Name (Company)</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.supplier_company}
                                    name="supplier_company"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Supplier Name (Person)</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.supplier_person}
                                    name="supplier_person"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Supplier Address</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.supplier_address}
                                    name="supplier_address"
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Supplier Contact</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.supplier_contact_no}
                                    name="supplier_contact_no"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  />
                                </div>

                                <div className="col-md-12">
                                  <h5 className="mt-3 mb-2">Cargo Handeling</h5>
                                </div>

                                <div item className="col-md-6">
                                  <label htmlFor="">Warehouse Collect</label>

                                  <select
                                    className="form-select"
                                    label="Warehouse Collect"
                                    variant="outlined"
                                    name="warehouse_collect"
                                    value={selectedData.warehouse_collect || ""}
                                    onChange={handleInputChange}
                                  >
                                    <option></option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Warehouse Cost</label>
                                  <input
                                    className="form-control"
                                    label="Warehouse Cost"
                                    variant="outlined"
                                    name="order_warehouse_cost"
                                    value={
                                      selectedData.order_warehouse_cost || ""
                                    }
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Warehouse Storage</label>
                                  <select
                                    className="form-select"
                                    value={selectedData.warehouse_storage}
                                    name="warehouse_storage"
                                    onChange={handleInputChange}
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Costs to collect</label>
                                  <input
                                    className="form-control"
                                    label="Costs to collect"
                                    variant="outlined"
                                    name="order_costs_to_collect"
                                    value={
                                      selectedData.order_costs_to_collect || ""
                                    }
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Handeling Required</label>
                                  <select
                                    type="text"
                                    className="form-select"
                                    value={selectedData.handling_required}
                                    name="handling_required"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div className="col-md-6">
                                  <label>Handeling cost</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={selectedData.handling_cost}
                                    name="handling_cost"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Warehouse Dispatch</label>
                                  <select
                                    className="form-select"
                                    value={selectedData.warehouse_dispatch}
                                    name="warehouse_dispatch"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div item className="col-md-6">
                                  <label htmlFor="">Cost to Dispatch</label>
                                  <input
                                    className="form-control"
                                    label="Cost to Dispatch"
                                    variant="outlined"
                                    name="cost_to_dispatch"
                                    value={selectedData.cost_to_dispatch || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-12">
                                  <label>Warehouse Comment</label>
                                  <textarea
                                    className="form-control"
                                    value={selectedData.warehouse_comment}
                                    name="warehouse_comment"
                                    onChange={handleInputChange}
                                    placeholder=""
                                  ></textarea>
                                </div>

                                {/* <div item className="col-md-6">
                                    <label htmlFor="">Warehouse Receipt No</label>
                                    <input
                                      className="form-control"
                                      label="Warehouse Receipt No"
                                      variant="outlined"
                                      name="ware_receipt_no"
                                      value={selectedData.ware_receipt_no || ""}
                                      onChange={handleInputChange}
                                    />
                                  </div> */}
                                {/* <div item className="col-md-6">
                                    <label htmlFor="">Waybill</label>

                                    <input
                                      className="form-control"
                                      label="Waybill"
                                      variant="outlined"
                                      name="tracking_number"
                                      value={selectedData.tracking_number || ""}
                                      onChange={handleInputChange}
                                    />
                                  </div> */}

                                {/* <div className="col-8 mt-4">
                                    <h5>
                                      Document Section
                                    </h5>

                                  </div>
                                  <div className="col-4 mt-4 text-end">
                                    <button
                                      onClick={handleShow}
                                      className="uploadIcon"
                                    >
                                      <i class="fa fa-upload" aria-hidden="true"></i>
                                    </button>

                                    {show1 ? (
                                      <Modal
                                        open={show1}
                                        onClose={handleClose}
                                        slotProps={{
                                          backdrop: {
                                            sx: {
                                              backgroundColor:
                                                "rgba(0,0,0,0.2)",
                                            }, // lighter background
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            p: 3,
                                            bgcolor: "background.paper",
                                            borderRadius: 2,
                                            width: 500,
                                            mx: "auto",
                                            mt: 10,
                                          }}
                                        >
                                          <h2>Upload Documents</h2>

                                          {/* Dropdown */}
                                {/* <FormControl
                                            fullWidth
                                            sx={{ mt: 2 }}
                                          >
                                            <InputLabel id="doc-select-label">
                                              Select Document Type
                                            </InputLabel>
                                            <Select
                                              labelId="doc-select-label"
                                              // value={selected}
                                              onChange={handleSelect}
                                            >
                                              {docOptions.map((option) => (
                                                <MenuItem
                                                  key={option.id}
                                                  value={option.id}
                                                >
                                                  {option.label}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>

                                          {/* Dynamic file inputs */}
                                {/* <div className="mt-3">
                                            {selectedDocs.map(
                                              (doc, index) => (
                                                <div
                                                  key={index}
                                                  className="mb-3"
                                                >
                                                  <label className="fw-bold">
                                                    {doc.name}
                                                  </label>
                                                  <input
                                                    type="file"
                                                    className="form-control"
                                                    multiple
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) =>
                                                      handleFileChangefil(
                                                        e,
                                                        doc.name,
                                                      )
                                                    }
                                                  />
                                                </div>
                                              ),
                                            )}
                                          </div>

                                          {/* Footer buttons */}
                                {/* <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "flex-end",
                                              gap: 2,
                                              mt: 3,
                                            }}
                                          >
                                            <Button onClick={handleClose}>
                                              Cancel
                                            </Button>
                                            <Button
                                              variant="contained"
                                              color="success"
                                              onClick={handleSave}
                                            >
                                              Save Documents
                                            </Button>
                                          </Box>
                                        </Box>
                                      </Modal>
                                    ) : (
                                      ""
                                    )}
                                  </div> */}

                                <div className="d-flex justify-content-center mt-4">
                                  <button
                                    variant="contained"
                                    className="blueBtn"
                                    onClick={handleSubmit}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </Box>
                      </Modal>
                      <Modal open={isModalOpen3} onClose={handleCloseModal3}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "80%",
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
                            <h2 className="modal-title">
                              Warehouse Detail
                            </h2>
                            <button onClick={handleCloseModal3}>
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="newModalGap  noFormaControl">
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">
                                  Product Description
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="product description"
                                  onChange={handlechangepro}
                                  name="product_description"
                                />
                              </div>
                              <div className="col-md-6 noFormaControl">
                                <label className="form-label">Harzadous</label>
                                <select
                                  onChange={handlechangepro}
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
                                <label className="form-label">
                                  Warehouse Ref.
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="warehouse reference"
                                  name="warehouse_ref"
                                  onChange={handlechangepro}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">
                                  Data Received
                                </label>
                                <input
                                  type="date"
                                  className="form-control"
                                  placeholder=""
                                  name="date_received"
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-md-6 noFormaControl">
                                <label className="form-label">
                                  Package Type
                                </label>
                                <select
                                  name="package_type"
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
                                <label className="form-label">
                                  Total Packages
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="0.00"
                                  onKeyPress={handlekey}
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
                                  placeholder="0.00"
                                  onKeyPress={handlekey}
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">
                                  Supplier Address
                                </label>
                                <input
                                  type="text"
                                  name="supplier_address"
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
                                  className="form-control"
                                  placeholder="0.00"
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>

                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">
                                  Warehouse Order
                                </label>
                                <input
                                  type="text"
                                  name="warehouse_order_id"
                                  className="form-control"
                                  placeholder="0.00"
                                  onChange={handlechangepro}
                                  onKeyPress={handlekey}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">
                                  Costs to Collect
                                </label>
                                <input
                                  type="text"
                                  name="costs_to_collect"
                                  className="form-control"
                                  placeholder="0.00"
                                  onKeyPress={handlekey}
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">
                                  Warehouse dispatch
                                </label>
                                <input
                                  type="text"
                                  name="warehouse_dispatch"
                                  className="form-control"
                                  placeholder="0.00"
                                  onChange={handlechangepro}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">
                                  Waybill Ref
                                </label>
                                <input
                                  type="text"
                                  name="waybill_ref"
                                  className="form-control"
                                  placeholder="0.00"
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label className="form-label">
                                  Warehouse Cost
                                </label>
                                <input
                                  type="text"
                                  name="warehouse_cost"
                                  className="form-control"
                                  placeholder="0.00"
                                  onChange={handlechangepro}
                                  onKeyPress={handlekey}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">
                                  Cost to Dispatch
                                </label>
                                <input
                                  type="text"
                                  name="cost_to_dispatch"
                                  className="form-control"
                                  placeholder="0.00"
                                  onKeyPress={handlekey}
                                  onChange={handlechangepro}
                                />
                              </div>
                            </div>
                            <div className="row mb-3 mt-4">
                              <div className="col-sm-6">
                                <h4 className="freight_hd">Document Section</h4>
                                <span class="line"></span>
                              </div>
                              <div className="col-sm-6">
                                <div className="text-end">
                                  <button
                                    className="redBtn"
                                    onClick={handleShow}
                                  >
                                    Upload Documents
                                  </button>

                                </div>

                                {show1 ? (
                                  <Modal
                                    open={show1}
                                    onClose={handleClose}
                                    slotProps={{
                                      backdrop: {
                                        sx: {
                                          backgroundColor: "rgba(0,0,0,0.2)",
                                        }, // lighter background
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        bgcolor: "background.paper",
                                        borderRadius: 2,
                                        mx: "auto",
                                        mt: 10,
                                        width: {
                                          xs: "95%",
                                          sm: "80%",
                                          md: "60%",
                                          lg: "40%",
                                        },
                                      }}
                                    >
                                      <div className="modal-header">
                                        <h5>Upload Documents</h5>
                                      </div>
                                      <div className="newModalGap  noFormaControl">


                                        {/* Dropdown */}
                                        <FormControl fullWidth sx={{ mt: 2 }}>
                                          <InputLabel id="doc-select-label">
                                            Select Document Type
                                          </InputLabel>
                                          <Select
                                            labelId="doc-select-label"
                                            // value={selected}
                                            onChange={handleSelect}
                                          >
                                            {docOptions.map((option) => (
                                              <MenuItem
                                                key={option.id}
                                                value={option.id}
                                              >
                                                {option.label}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>

                                        {/* Dynamic file inputs */}
                                        <div className="mt-3">
                                          {selectedDocs.map((doc, index) => (
                                            <div key={index} className="mb-3">
                                              <label className="fw-bold">
                                                {doc.name}
                                              </label>
                                              <input
                                                type="file"
                                                className="form-control"
                                                multiple
                                                accept="image/*,application/pdf"
                                                onChange={(e) =>
                                                  handleFileChangefil(e, doc.name)
                                                }
                                              />
                                            </div>
                                          ))}
                                        </div>

                                        {/* Footer buttons */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 2,
                                            mt: 3,
                                          }}
                                        >
                                          <button className="redBtn" onClick={handleClose}>
                                            Cancel
                                          </button>
                                          <button
                                            variant="contained"
                                            color="success"
                                            onClick={handleSave}
                                            className="blueBtn"
                                          >
                                            Save Documents
                                          </button>
                                        </Box>
                                      </div>
                                    </Box>
                                  </Modal>
                                ) : (
                                  ""
                                )}

                              </div>
                            </div>
                            {/* <div className="row mb-3">
                              <div className="col-6 mt-3">
                          <select name="documentName" className="w-100 py-3"  onChange={handlechangepro}>
                            <option value="">Select Document</option>
                            <option value="Warehouse Entry Docs">  Shipper Docs</option>
                            <option value="Warehouse Entry Docs">Warehouse Docs</option>
                            <option value="Invoice, Packing List">Invoice / Packing </option>
                            <option value="Product Literature">Product Literature</option>
                            <option value="Letters of Authority">LOA</option>
                          </select>
                        </div>
                              <div className="col-6 mt-3">
                          <label>Upload Document</label>
                          <input
                            type="file"
                            multiple
                            className="w-100 mb-3 rounded"
                            onChange={(e) =>
                              handleFileChange(e, "other_documents")
                            }
                          />
                        </div>
                            </div> */}
                            <div mt={3} className="d-flex justify-content-center">
                              <button
                                className="blueBtn"
                                variant="contained"
                                onClick={handpechangepro}
                              >
                                Add Product
                              </button>
                            </div>
                          </div>


                        </Box>
                      </Modal>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </>
  );
}
