import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { createFilterOptions } from "@mui/material/Autocomplete";
import "react-toastify/dist/ReactToastify.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
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
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

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

export default function SupplierWarehouse() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [batch, setBatch] = useState([]);
  const [countries, setCountries] = useState([]);
  const [nameData, setNameData] = useState("");
  const [clientData, setClientData] = useState([]);
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
  const [orderID, setOrderID] = useState("");
  const [freightIdPass, setFreightIdPass] = useState("");
  const [responseData, setResponseData] = useState("");
  const [clickdata, setClickdata] = useState({});
  const [handlsupplier, setHandlsupplier] = useState([]);
  const [handlebatches, setHandlebatches] = useState([]);
  const [orderDatap, setOrderDatap] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleassignsupplier, setHandleassignsupplier] = useState(false);
  const [batchidsdsd, setBatchidsdsd] = useState();
  const [loader, setLoader] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
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
    getData(1);
  }, []);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  const getData = async (page = 1) => {
    try {
      setLoader(true);
      const payload = {
        user_id: userid,
        page: page,
        limit: pageSize,
      };
      console.log("Sending page:", page); 
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetSupplierCreatedWarehouseOrders`,
        payload,
      );
      console.log("Response page:", response.data.page); // 🔥 debug
      setLoader(false);
      if (response.data && response.data.data) {
        setData(response.data.data);
        setPagenationData(response.data);
      } else {
        toast.error("No warehouse orders found.");
      }
    } catch (error) {
      setLoader(false);
      toast.error("Error fetching data");
    }
  };
  const getAllBatch = (item) => {
    console.log(item);
    const payload = {
      des_country_id: item.delivery_to,
      origin_country_id: item.collection_from,
      freight: item.freight_type,
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
  // const handlePageChange = (page) => {
  //   console.log(page);
  //   setCurrentPage(page);
  //   getData(page);
  // };
  const handlePageChange = (page) => {
    setCurrentPage(page);

    if (searchQuery.trim() !== "") {
      getdata11(searchQuery, page);
    } else {
      getData(page);
    }
  };
  const handleEditClick = (order_id) => {
    const selectedData = data.find((item) => item.id === order_id);
    console.log(selectedData);
    setSelectedData(selectedData);
    handleOpenModal();
  };
  const userData = JSON.parse(localStorage.getItem("data123"));
  const handleEditClickAssign = async (item) => {
    console.log(item);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to move this product to the order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Move it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        const payload = {
          supplier_warehouse_id: item.id,
          user_id: userData.id,
        };
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}MoveSupplierWarehouseOrder`, // 🔥 change API if needed
          payload,
        );
        if (response?.data?.success) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Product moved to order successfully!",
          });
          // 🔄 refresh data if needed
          getData(currentPage);
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: response?.data?.message || "Something went wrong",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
        });
      }
    }
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
        getData(currentPage);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlechangewarehouse2 = (e) => {
    const { name, value } = e.target;
    setProdata((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        getData(currentPage);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  console.log(pagenationData, pagenationData.limit, pagenationData.total);
  const totalPage = Math.ceil(pagenationData.total / pagenationData.limit);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedData({ ...selectedData, [name]: value });
  };
  const handleSubmit = async () => {
    console.log(prodata);
    console.log(nameData);
    const payload = {
      supplier_warehouse_id: selectedData?.id,
      client_id: nameData?.client_id,
      customer_ref: nameData?.customer_ref,
      order_action: nameData?.order_action,
      order_id: nameData?.order_id,
      batch_id: nameData?.batch_id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}adminUpdateSupplierWarehouse`,
        payload,
      );
      if (response?.data?.success) {
        handleCloseModalpopup();
        setNameData("");
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Warehouse updated successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.data?.message || "Update failed",
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };
  const filterOptions = (options, { inputValue }) => {
    console.log("Filtering options with input:", inputValue);
    return options.filter(
      (option) =>
        option.full_name?.toLowerCase().startsWith(inputValue.toLowerCase()), // 👈 strict match
    );
  };
  //   const handleSubmit =()=>{
  // console.log(prodata)
  // console.log(nameData)
  // // console.log(supplier_warehouse_id)
  //         const payload={
  //    supplier_warehouse_id:selectedData.id,
  //     client_id:nameData.client_id,
  //      customer_ref:nameData.customer_ref,
  //       order_action:nameData.order_action,
  //       order_id:nameData.order_id,
  // batch_id:nameData.batch_id
  //     }
  //     try {
  //         const response = axios.post(`${process.env.REACT_APP_BASE_URL}adminUpdateSupplierWarehouse`,payload)
  //         if(response.data.success){
  //           Swal.meesaeg
  //           handleCloseModalpopup()
  //         }
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  // const handleSubmit = () => {
  //   const formdata1 = new FormData();
  //   formdata1.append(
  //     "warehouse_assign_id",
  //     selectedData.warehouse_assign_order_id,
  //   );
  //   formdata1.append("order_id", selectedData.order_id);
  //   formdata1.append("freight_id", selectedData.freight_id);
  //   formdata1.append("ware_receipt_no", selectedData.ware_receipt_no);
  //   formdata1.append("tracking_number", selectedData.tracking_number);
  //   formdata1.append("warehouse_status", selectedData.warehouse_status);
  //   formdata1.append("warehouse_collect", selectedData.warehouse_collect);
  //   formdata1.append("date_received", selectedData.date_received);
  //   formdata1.append("package_type", selectedData.package_type);
  //   formdata1.append("no_of_packages", selectedData.no_of_packages);
  //   formdata1.append("total_dimension", selectedData.total_dimension);
  //   formdata1.append("weight", selectedData.weight);
  //   formdata1.append("costs_to_collect", selectedData.costs_to_collect);
  //   formdata1.append("warehouse_cost", selectedData.warehouse_cost);
  //   formdata1.append("warehouse_dispatch", selectedData.warehouse_dispatch);
  //   formdata1.append("cost_to_dispatch", selectedData.cost_to_dispatch);
  //   formdata1.append("documentName", selectedData.documentName);
  //   formdata1.append("packages", JSON.stringify(selectedData.packages));
  //   selectedDocs.forEach((doc) => {
  //     console.log("Doc Type:", doc.name);
  //     doc.files.forEach((file) => {
  //       formdata1.append(doc.name, file);
  //       console.log("File:", file.name, "| Size:", file.size, "bytes");
  //     });
  //   });
  //   for (let [key, value] of formdata1.entries()) {
  //     console.log(`${key}:`, value);
  //   }
  //   axios
  //     .post(`${process.env.REACT_APP_BASE_URL}editWarehouseDetails`, formdata1)
  //     .then((response) => {
  //       setSelectedDocs([]);
  //       toast.success("Warehouse order updated successfully");
  //       getData();
  //       handleCloseModal();
  //     })
  //     .catch((error) => {
  //       console.error(error.response?.data || error.message);
  //       toast.error("Error updating warehouse order");
  //     });
  // };
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
  useEffect(() => {
    getcountry();
    // allOrder();
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
  const handleclicknavi = async (item) => {
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
        navigate("/Admin/warehousesupplierproduct", { state: { data: item } });
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
  const allOrder = async (client_id) => {
    console.log(client_id);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}AllOrderNumbers?client_id=${client_id.client_id}`,
      );
      if (response.data.success) {
        setOrderDatap(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
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
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.trim() === "") {
      getData(1); // 🔥 reset to original data
    } else {
      debouncedSearch(value);
    }
  };
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
  const getdata11 = async (value, page = 1) => {
    setLoader(true);
    try {
      const payload = {
        user_id: userid,
        page: page,
        limit: pageSize,
        search: value, // 👈 send search value
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}GetSupplierCreatedWarehouseOrders`,
        payload,
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
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while fetching orders.",
      );
    }
  };
  // const getdata11 = async (value) => {
  //   setLoader(true);
  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}GetWarehouseOrders`,
  //       { user_id: userid, user_type: usertype, search: value },
  //     );
  //     setLoader(false);
  //     if (response.data && response.data.data) {
  //       setData(response.data.data);
  //       setPagenationData(response.data);
  //     } else {
  //       toast.error("No warehouse orders found.");
  //     }
  //   } catch (error) {
  //     setLoader(false);
  //     console.error("Error fetching warehouse orders:", error);
  //     if (error.response && error.response.status === 400) {
  //       toast.error(
  //         error.response.data.message || "Data not found or permission denied.",
  //       );
  //     } else {
  //       toast.error("Something went wrong while fetching orders.");
  //     }
  //   }
  // };
  useEffect(() => {
    getSupplier();
    getBatches();
  }, []);
  const getBatches = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}AllWarehouseBatchNumbers`,
      );
      if (response.status === 200) {
        setHandlebatches(response.data.data);
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
        toast.error(error.message || "Something went wrong");
      }
      console.error("AssignSupplier Error:", error);
    }
  };
  const handlechangewarehouse1 = (e) => {
    setProdata({
      ...prodata,
      [e.target.name]: e.target.value,
    });
  };
  const handlechangewarehouse = (e) => {
    const { name, value } = e.target;
    setNameData({ ...nameData, [name]: value });
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
  const options = orderDatap.map((item) => ({
    value: item.order_number,
    label: item.order_number,
  }));
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="freight_hd">Supplier Warehouse </h4>
                </div>
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <input
                    className="searchTop"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <button
                    variant="contained"
                    onClick={() => {
                      handleOpenModal2();
                    }}
                    className="blueBtn"
                  >
                    Filter
                  </button>
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
                                              {item?.warehouse_name}
                                              {/* {item.supplier_name ? "/" : ""}{" "}
                                              {item.supplier_name} */}
                                            </p>
                                          </div>
                                          <div className="col-md-2">
                                            <div>
                                              <p>{item?.order_number}</p>
                                            </div>
                                          </div>
                                          <div className="col-md-4"></div>
                                          <div className="col-md-2">
                                            <p>
                                              <span className="bold600">
                                                Weight:
                                              </span>{" "}
                                              {item.total_weight}
                                            </p>
                                          </div>
                                          <div className="col-md-2 text-end">
                                            <p className="port_date">
                                              <div className="ss text-end">
                                                {item?.move_to_adminWarhouse ==
                                                "1" ? (
                                                  <span className="text-success">
                                                    Moved To Warehouse
                                                  </span>
                                                ) : item.move_to_adminWarhouse ==
                                                  "2" ? (
                                                  <span className="text-danger">
                                                    Rejected
                                                  </span>
                                                ) : (
                                                  <span className="text-secondary">
                                                    Pending
                                                  </span>
                                                )}
                                              </div>
                                            </p>
                                          </div>
                                          <div className="supParaGroup">
                                            <p className="fright_no mx-2">
                                              {item.batch_number}
                                            </p>
                                            <p className="fright_no mx-2">
                                              {/* Order Number : {item.order_number} */}
                                            </p>
                                          </div>
                                        </div>
                                        {/* second row */}
                                        <div className="row align-items-center">
                                          <div className="col-md-4">
                                            <div className="">
                                              <p className="origin">
                                                {item.customer_name}
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
                                                {item.destination_country_name}
                                                {/* <span className="fright_type">
                                                  (
                                                  {item.Freight
                                                    ? item.Freight
                                                    : item.freight_type}
                                                  )
                                                </span> */}
                                              </p>
                                            </div>
                                            <div className="d-flex">
                                              <p className="origin">Status: {item.warehouse_item_status}</p>
                                            </div>
                                          </div>
                                          <div className="col-md-2">
                                            <p>
                                              <span>Dimension: </span>
                                              {item.total_cbm}
                                            </p>
                                          </div>
                                          <div className="col-md-2">
                                            <div className="text-end">
                                              <p className="origin">
                                                {item.nature_of_hazard}
                                                <div className="text-end">
                                                  <p className="port_date">
                                                    {new Date(
                                                      item.created_at,
                                                    ).toLocaleDateString(
                                                      "en-GB",
                                                    )}
                                                  </p>
                                                </div>
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {/* third row */}
                                        <div className="row align-items-center">
                                          <div className="col-md-2">
                                            {item.goods_description}
                                            {/* <div className="d-flex align-items-center">
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
                                            </div> */}
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
                                          <div className="col-md-2">
                                            <p>
                                              <span>Packages:</span>{" "}
                                              {item.total_packages}
                                            </p>
                                          </div>
                                          <div className="col-md-2 text-end">
                                            {item.move_to_adminWarhouse ===
                                            0 ? (
                                              <DriveFileMoveIcon
                                                className="me-2 mt-1"
                                                fontSize="small"
                                                onClick={() =>
                                                  handleEditClickAssign(item)
                                                }
                                                style={{
                                                  color: "#1d2044",
                                                  cursor: "pointer",
                                                }}
                                              />
                                            ) : (
                                              ""
                                            )}
                                            {item.move_to_adminWarhouse ===
                                            0 ? (
                                              <FaEdit
                                                onClick={() =>
                                                  handleEditClick(item.id)
                                                }
                                                style={{
                                                  color: "#1d2044",
                                                  cursor: "pointer",
                                                }}
                                              />
                                            ) : (
                                              ""
                                            )}
                                            {/* <DeleteIcon
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
                                            /> */}
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
                                            {/* <PictureAsPdfIcon
                                              style={{ cursor: "pointer" }}
                                              onClick={() => {
                                                handleclickrevert123(item);
                                              }}
                                            /> */}
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
                            height: 300,
                            width: 450,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                          }}
                        >
                          <h4 id="modal-modal-title text-dark">
                            Assign Supplier
                          </h4>
                          <select
                            className="form-control"
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
                          <div className="d-flex  mt-3">
                            <Button
                              variant="contained"
                              className="submit_btn"
                              onClick={AssignSupplier}
                            >
                              Submit
                            </Button>
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
                            <Button variant="contained" onClick={postData}>
                              Apply
                            </Button>
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
                            <h2 id="modal-modal-title">Edit Supplier Warehouse Order</h2>
                            <button
                              className="btn btn-close"
                              onClick={handleCloseModalpopup}
                            >
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="newModalGap noFormaControl">
                            {selectedData && (
                              <>
                                <div container spacing={2}>
                                  <div className="row g-2">
                                    <div className="col-md-12">
                                      <h5 className="mb-0">Client Details</h5>
                                    </div>
                                    <div className="col-md-6 autoComplete">
                                      <label>Customer name</label>
                                      <Autocomplete
                                        options={clientData || []}
                                        getOptionLabel={(option) =>
                                          option.full_name || ""
                                        }
                                        filterOptions={filterOptions}
                                        value={
                                          clientData.find(
                                            (item) =>
                                              item.id === nameData.client_id,
                                          ) || null
                                        }
                                        onChange={(event, newValue) => {
                                          handlechangewarehouse({
                                            target: {
                                              name: "client_id",
                                              value: newValue
                                                ? newValue.id
                                                : "",
                                            },
                                          });
                                          allOrder({
                                            client_id: newValue
                                              ? newValue.id
                                              : "",
                                          });
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.id === value.id
                                        }
                                        renderInput={(params) => (
                                          <TextField {...params} />
                                        )}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label>Customer Ref</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="customer_ref"
                                        placeholder="Customer Ref"
                                        onChange={handlechangewarehouse}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label>Create new Freight Order</label>
                                      <select
                                        className="form-select"
                                        name="order_action"
                                        onChange={handlechangewarehouse}
                                      >
                                        <option>Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                    {nameData.order_action === "No" ? (
                                      <div className="col-md-6 autoComplete">
                                        <label>Order Number</label>
                                        <Autocomplete
                                          options={orderDatap || []}
                                          getOptionLabel={(option) =>
                                            option.order_number || ""
                                          }
                                          value={
                                            orderDatap.find(
                                              (item) =>
                                                item.order_id ===
                                                nameData.order_id,
                                            ) || null
                                          }
                                          onChange={(event, newValue) => {
                                            handlechangewarehouse({
                                              target: {
                                                name: "order_id",
                                                value: newValue
                                                  ? newValue.order_id
                                                  : "", // ✅ store ID
                                              },
                                            });
                                          }}
                                          isOptionEqualToValue={(
                                            option,
                                            value,
                                          ) =>
                                            option.order_id === value.order_id
                                          }
                                          renderInput={(params) => (
                                            <TextField {...params} />
                                          )}
                                        />
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                    <div className="col-md-6 autoComplete">
                                      <label>Groupage #</label>

                                      <Autocomplete
                                        options={handlebatches || []}
                                        getOptionLabel={(option) =>
                                          option.batch_number || ""
                                        }
                                        value={
                                          handlebatches.find(
                                            (item) =>
                                              item.batch_id ===
                                              nameData.batch_id, // ✅ use state
                                          ) || null
                                        }
                                        onChange={(e, value) => {
                                          handlechangewarehouse({
                                            target: {
                                              name: "batch_id",
                                              value: value
                                                ? value.batch_id
                                                : "",
                                            },
                                          });
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.batch_id === value.batch_id
                                        }
                                        renderInput={(params) => (
                                          <TextField {...params} />
                                        )}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label>Date</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        disabled
                                        value={
                                          selectedData.date_received
                                            ? selectedData.date_received.split(
                                                "T",
                                              )[0]
                                            : ""
                                        }
                                        name="date_received"
                                        onChange={handlechangewarehouse}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label>Warehouse Order Id</label>
                                      <input
                                        type="type"
                                        className="form-control"
                                        disabled
                                        value={selectedData.warehouse_order_id}
                                        name="warehouse_order_id"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Courier waybill_ref</label>
                                      <input
                                        type="type"
                                        className="form-control"
                                        disabled
                                        value={selectedData.courier_waybill_ref}
                                        name="courier_waybill_ref"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Dispatch Date</label>
                                      {/* <input
                                  type="date"
                                  className="form-control"
                                  disabled
                                  name="dispatched_date"
                                  onChange={handlechangewarehouse}
                                  placeholder=""
                                ></input> */}
                                      <input
                                        type="date"
                                        className="form-control"
                                        disabled
                                        value={
                                          selectedData.dispatch_date
                                            ? selectedData.dispatch_date.split(
                                                "T",
                                              )[0]
                                            : ""
                                        }
                                        name="dispatch_date"
                                        onChange={handlechangewarehouse}
                                      />
                                    </div>
                                    <div className="col-md-12">
                                      <h5 className="mt-3 mb-2">
                                        Package Information
                                      </h5>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Customer Name</label>
                                      <input
                                        className="form-control"
                                        disabled
                                        value={selectedData.customer_name}
                                        name="customer_name"
                                        onChange={handlechangewarehouse}
                                        placeholder="customer name"
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Customer ref</label>
                                      <input
                                        className="form-control"
                                        disabled
                                        value={selectedData.customer_ref}
                                        name="customer_ref"
                                        onChange={handlechangewarehouse}
                                        placeholder="customer name"
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Country of Origin</label>
                                      <select
                                        name="collection_from"
                                        disabled
                                        value={selectedData.collection_from}
                                        onChange={handlechangewarehouse}
                                        className="form-select"
                                      >
                                        <option>Select</option>
                                        {countries &&
                                          countries.length > 0 &&
                                          countries.map((item, index) => {
                                            return (
                                              <>
                                                <option
                                                  key={index}
                                                  value={item.id}
                                                >
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
                                        name="destination_country"
                                        disabled
                                        value={selectedData.destination_country}
                                        onChange={handlechangewarehouse}
                                        className="form-select"
                                      >
                                        <option>Select</option>
                                        {countries &&
                                          countries.length > 0 &&
                                          countries.map((item, index) => {
                                            return (
                                              <>
                                                <option
                                                  key={index}
                                                  value={item.id}
                                                >
                                                  {item.name}
                                                </option>
                                              </>
                                            );
                                          })}
                                      </select>
                                    </div>

                                    <div className="col-md-6">
                                      <label>Box Marking</label>
                                      <input
                                        className="form-control"
                                        disabled
                                        name="box_marking"
                                        value={selectedData.box_marking}
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Good Description</label>
                                      <input
                                        type="Good Description"
                                        className="form-control"
                                        disabled
                                        value={selectedData.goods_description}
                                        name="goods_description"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Packing Type</label>
                                      <select
                                        className="form-select"
                                        value={selectedData.package_type}
                                        name="package_type"
                                        disabled
                                        onChange={handlechangewarehouse}
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
                                        disabled
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                    {selectedData.hazardous === "Yes" ? (
                                      <div className="col-md-6">
                                        <label>Description of Hazardous </label>
                                        <input
                                          type="type"
                                          className="form-control"
                                          disabled
                                          value={
                                            selectedData.hazard_description
                                          }
                                          name="hazard_description"
                                          onChange={handlechangewarehouse}
                                          placeholder=""
                                        ></input>
                                      </div>
                                    ) : (
                                      ""
                                    )}

                                    <div className="col-md-6">
                                      <label>Total cbm</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.total_cbm}
                                        name="total_cbm"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Total Package</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.total_packages}
                                        name="total_packages"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>

                                    <div className="col-md-6">
                                      <label>Total Dimension </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.total_cbm}
                                        name="total_cbm"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div item className="col-md-6">
                                    <label htmlFor="">Weight</label>
                                    <input
                                      className="form-control"
                                      disabled
                                      label="Weight"
                                      variant="outlined"
                                      name="weight"
                                      value={selectedData.weight || ""}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                    <div className="col-lg-md">
                                      <label>Comment on Packages</label>
                                      <textarea
                                        className="w-100 form-control"
                                        name="package_comment"
                                        disabled
                                        value={selectedData.package_comment}
                                        placeholder="Other Information"
                                      ></textarea>
                                    </div>
                                    
                                    <div className="col-md-12">
                                      <h5 className="mt-3 mb-2">
                                        Damaged Goods
                                      </h5>
                                    </div>

                                    <div className="col-md-6">
                                      <label>Damaged Goods</label>
                                      <select
                                        type="text"
                                        className="form-select"
                                        disabled
                                        value={selectedData.damaged_goods}
                                        name="damaged_goods"
                                        onChange={handlechangewarehouse}
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
                                        disabled
                                        value={selectedData.damaged_pkg_qty}
                                        name="damaged_pkg_qty"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-12">
                                      <label>Attach File</label>
                                      <input
                                        type="file"
                                        className="form-control"
                                        disabled
                                        name="attach_file"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>

                                    <div className="col-md-12">
                                      <label>Comment on Damaged</label>

                                      <textarea
                                        className="w-100 form-control"
                                        name="damage_comment"
                                        disabled
                                        onChange={handlechangewarehouse}
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
                                        disabled
                                        value={selectedData.supplier_company}
                                        name="supplier_company"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Supplier Name (Person)</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.supplier_person}
                                        name="supplier_person"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Supplier Address</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.supplier_address}
                                        name="supplier_address"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Supplier Contact</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.supplier_contact}
                                        name="supplier_contact"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>

                                    <div className="col-md-12">
                                      <h5 className="mt-3 mb-2">
                                        Cargo Handeling
                                      </h5>
                                    </div>

                                    <div className="col-md-6">
                                      <label>Warehouse Collect</label>
                                      <select
                                        className="form-select"
                                        value={selectedData.warehouse_collect}
                                        name="warehouse_collect"
                                        disabled
                                        onChange={handlechangewarehouse}
                                        placeholder="customer name"
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Cost To Collect</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.costs_to_collect}
                                        name="costs_to_collect"
                                        onChange={handlechangewarehouse}
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Warehouse Storage</label>
                                      <select
                                        className="form-select"
                                        value={selectedData.warehouse_storage}
                                        name="warehouse_storage"
                                        disabled
                                        onChange={handlechangewarehouse}
                                        placeholder="customer name"
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Warehouse Cost</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.warehouse_cost}
                                        name="warehouse_cost"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Handeling Required</label>
                                      <select
                                        type="text"
                                        className="form-select"
                                        value={selectedData.handling_required}
                                        name="handling_required"
                                        disabled
                                        onChange={handlechangewarehouse}
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
                                        disabled
                                        value={selectedData.handling_cost}
                                        name="handling_cost"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-6">
                                      <label>Warehouse Dispatch</label>
                                      <select
                                        className="form-select"
                                        value={selectedData.warehouse_dispatch}
                                        name="warehouse_dispatch"
                                        disabled
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                    <div className="col-md-6">
                                      <label>cost to dispatch</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={selectedData.cost_to_dispatch}
                                        name="cost_to_dispatch"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-12">
                                      <label>Attach Product Image</label>
                                      <input
                                        type="file"
                                        className="form-control"
                                        disabled
                                        name="Attach_Product_Image"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-12">
                                      <label>Attach Other</label>
                                      <input
                                        type="file"
                                        className="form-control"
                                        disabled
                                        name="attach_other"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></input>
                                    </div>
                                    <div className="col-md-12">
                                      <label>Warehouse Comment</label>
                                      <textarea
                                        className="form-control"
                                        disabled
                                        value={selectedData.warehouse_comment}
                                        name="warehouse_comment"
                                        onChange={handlechangewarehouse}
                                        placeholder=""
                                      ></textarea>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 d-flex justify-content-center">
                                  <button
                                    variant="contained"
                                    className="blueBtn"
                                    onClick={handleSubmit}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </>
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
                            p: 4,
                            borderRadius: 2,
                            maxHeight: "90vh",
                            overflowY: "auto",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                          >
                            <Typography variant="h6">
                              Warehouse Detail
                            </Typography>
                            <IconButton onClick={handleCloseModal3}>
                              <CloseIcon />
                            </IconButton>
                          </Box>
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
                              <div className="col-9 mt-3">
                                <h4 className="freight_hd">Document Section</h4>
                                <span class="line"></span>
                              </div>
                              <div className="col-3">
                                <Button
                                  className="btn  btn-primary"
                                  onClick={handleShow}
                                >
                                  Upload Documents
                                </Button>
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
                                        p: 3,
                                        bgcolor: "background.paper",
                                        borderRadius: 2,
                                        width: 500,
                                        mx: "auto",
                                        mt: 10,
                                      }}
                                    >
                                      <h2>Upload Documents</h2>
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
                                      <Box
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
                              </div>
                            </div>
                            <div className="row mb-3"></div>
                            <div class="modal-footer"></div>
                          </div>
                          <Box mt={3} display="flex" justifyContent="flex-end">
                            <Button
                              variant="contained"
                              onClick={handpechangepro}
                            >
                              Add Product
                            </Button>
                          </Box>
                        </Box>
                      </Modal>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
