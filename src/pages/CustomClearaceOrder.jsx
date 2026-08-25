import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CalculateIcon from "@mui/icons-material/Calculate";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AiFillDelete } from "react-icons/ai";
import { MdDriveFileMoveOutline } from "react-icons/md";
import CloseIcon from "@mui/icons-material/Close";
import {
  Modal,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { AssignmentTurnedIn, Calculate, CopyAll, Download } from "@mui/icons-material";
import Swal from "sweetalert2";

const pageSize = 10;
const CustomClearaceOrder = () => {
  const [data, setData] = useState({
    customer_ref: "",
    goods_desc: "",
    destination: "",
    port_of_entry: "",
    port_of_exit: "",
    clearing_agent: "",
    comment_on_docs: "",
  });
  const [formFiles, setFormFiles] = useState({
    supplier_invoice: [],
    other_documents: [],
    licenses: [],
    packing_list: [],
  });
  const [constgetdata, setConstgetdata] = useState([]);
  const [erd, setErd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputdata, setInputdata] = useState({});
  const [staffdata, setStaffdata] = useState([]);
  const [country, setCountry] = useState([]);
  const [client, setClient] = useState([]);
  const [lcientlist, setLcientlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [openmodal, setOpenmodal] = useState(false);
  const [clearanceid, setClearanceid] = useState("");
  const [showSeaOptions, setShowSeaOptions] = useState(false);
  const [showRoadOptions, setShowRoadOptions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loader, setLoader] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pagenation, setPagenation] = useState(1);
  const [filedata1, setFiledata1] = useState(null);
  const [freightIdAssignTask, setFreightIdAssignTask] = useState(null);
  const [openmodalAssignFreight, setOpenmodalAssignFreight] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [show1, setShow1] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const docOptions = [
    { id: "Customs Documents", label: "Customs docs" },
    { id: "Supporting Documents", label: "Supporting docs" },
    { id: "Invoice, Packing List", label: "Invoice / Packing " },
    { id: "Product Literature", label: "Product Literature" },
    { id: "Letters of authority", label: "Letters of authority" },
    { id: "Waybills", label: "Freight Docs" },
    { id: "Waybills", label: "Shipping instruction" },
    { id: "AD_Quotations", label: "Attach Quote" },
    { id: "Supplier Invoices", label: "Supplier Invoices" },
  ];
  const handleShow = () => setShow1(true);
  const handleClose = () => setShow1(false);

  // Handle dropdown change
  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedDocs.find((doc) => doc.name === selected)) {
      setSelectedDocs([...selectedDocs, { name: selected, files: [] }]);
    }
  };

  // Handle file upload for each document type
  const handleFileChangefil = (e, docName) => {
    const files = Array.from(e.target.files);
    setSelectedDocs((prev) =>
      prev.map((doc) => (doc.name === docName ? { ...doc, files } : doc))
    );
  };

  // For saving data (you can send to API)
  const handleSave = () => {
    console.log("Uploaded Documents:", selectedDocs);

    // To see filenames instead of [object Object]
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc);
      doc.files.forEach((file) => {
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });

    handleClose();
  };

  const navigate = useNavigate();
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handleChangeFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  
  const datagetuseirID = JSON.parse(localStorage.getItem("data123"));
  const handleclick = () => {
    if (!data.freight || data.freight.trim() === "") {
      toast.error("Freight is required");
      return;
    }
    if (!data.loading_country || !data.discharge_country) {
      toast.error("Loading & Discharge country is required");
      return;
    }
    console.log(datagetuseirID.id);
    const formdata = new FormData();
    formdata.append("user_id", data.client);
    formdata.append("freight", data?.freight);
    formdata.append("freight_option", data.freight_option);
    formdata.append("is_Import_Export", data.is_Import_Export);
    formdata.append("is_cong_shipp", data.is_cong_shipp);
    formdata.append("goods_desc", data.goods_desc);
    formdata.append("nature_of_goods", data.nature_of_goods);
    formdata.append("packing_type", data.packing_type);
    formdata.append("total_dimension", data.total_dimension);
    formdata.append("total_box", data.total_box);
    formdata.append("total_weight", data.total_weight);
    formdata.append("loading_country", data.loading_country);
    formdata.append("discharge_country", data.discharge_country);
    formdata.append("client", data.client);
    formdata.append("port_of_discharge", data.port_of_discharge);
    formdata.append("port_of_loading", data.port_of_loading);
    formdata.append("added_by", "1");
    formdata.append("customer_ref", data?.customer_ref);
    formdata.append("destination", data?.destination);
    formdata.append("document", selectedImage);
    formdata.append("comment_on_docs", data?.comment_on_docs);
    formdata.append("documentName", data?.documentName);
    formdata.append("sales_representative", data?.sales_representative);
    formdata.append("added_user_id", userid);
    console.log(formdata);
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc.name);
      doc.files.forEach((file) => {
        formdata.append(doc.name, file); // 👈 each file append
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    for (let [key, value] of formdata.entries()) {
      console.log(`${key}: ${value}`);
    }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}add-clearing-customer`, formdata)
      .then((response) => {
        toast.success(response.data.message);
        setShowModal(false);
        getdata();
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handecnagegetthedata = (e) => {
    setFiledata1(e.target.files[0]);
  };
  const handleupdateupdate = async () => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/update-clearing",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        const formdata = new FormData();
        formdata.append("added_by", "1");
        formdata.append("clearing_id", erd);
        formdata.append("freight", inputdata.freight);
        formdata.append("freight_option", inputdata.freight_option);
        formdata.append("is_Import_Export", inputdata.is_Import_Export);
        formdata.append("uploaded_by", "1");
        formdata.append("is_cong_shipp", inputdata.is_cong_shipp);
        formdata.append("goods_desc", inputdata.goods_desc);
        formdata.append("nature_of_goods", inputdata.nature_of_goods);
        formdata.append("packing_type", inputdata.packing_type);
        formdata.append("total_dimension", inputdata.total_dimension);
        formdata.append("total_box", inputdata.total_box);
        formdata.append("total_weight", inputdata.total_weight);
        formdata.append("loading_country", inputdata.loading_country);
        formdata.append("discharge_country", inputdata.discharge_country);
        formdata.append("client", inputdata.client);
        formdata.append("port_of_discharge", inputdata.port_of_discharge);
        formdata.append("port_of_loading", inputdata.port_of_loading);
        formdata.append("comment_on_docs", inputdata.comment_on_docs);
        formdata.append("customer_ref", inputdata.customer_ref);
        formdata.append("sales_representative", inputdata.sales_representative);
        formdata.append("documentName", inputdata.documentName);
        selectedDocs.forEach((doc) => {
          console.log("Doc Type:", doc.name);

          doc.files.forEach((file) => {
            formdata.append(doc.name, file);
            console.log("File:", file.name, "| Size:", file.size, "bytes");
          });
        });
        axios
          .post(`${process.env.REACT_APP_BASE_URL}update-clearing`, formdata)
          .then((response) => {
            toast.success(response.data.message);
            getdata();
            setShowModal(false);
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || "An error occurred");
          });
      } else {
        toast.error("Permission Denied");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Permission Denied");
    }
  };
  const handleGetDataForUpdate = (id) => {
    setErd(id);
    const selectuser = constgetdata.find((item) => item.id === id);
    console.log(selectuser);
    setInputdata({
      customer_ref: selectuser?.customer_ref || "",
      goods_desc: selectuser?.goods_desc || "",
      destination: selectuser?.destination || "",
      port_of_entry: selectuser?.port_of_entry || "",
      port_of_exit: selectuser?.port_of_exit || "",
      clearing_agent: selectuser?.clearing_agent || "",
      comment_on_docs: selectuser?.comment_on_docs || "",
      freight: selectuser?.freight,
      freight_option: selectuser.freight_option,
      client: selectuser.user_id,
      is_Import_Export: selectuser.is_Import_Export,
      is_cong_shipp: selectuser.is_cong_shipp,
      goods_desc: selectuser.goods_desc,
      nature_of_goods: selectuser.nature_of_goods,
      packing_type: selectuser.packing_type,
      total_dimension: selectuser.total_dimension,
      total_box: selectuser.total_box,
      total_weight: selectuser.total_weight,
      loading_country: selectuser.loading_country,
      discharge_country: selectuser.discharge_country,
      port_of_discharge: selectuser.port_of_discharge,
      port_of_loading: selectuser.port_of_loading,
      added_by: "2",
      sales_representative: selectuser?.sales_representative,
      customer_ref: selectuser?.customer_ref,
      destination: selectuser?.destination,
      comment_on_docs: selectuser?.comment_on_docs,
    });
    setIsUpdating(true);
    setShowModal(true);
  };
  const handleSubmit = () => {
    if (isUpdating) {
      handleupdateupdate();
    } else {
      handleclick();
    }
  };
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  const handleModalClose = () => {
    setShowModal(false);
    setIsUpdating(false);
    setInputdata({});
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputdata({ ...inputdata, [name]: value });
  };
  const getdata = async (page) => {
    try {
      setLoader(true);
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/clearing-list",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}clearing-list`,
            {
              user_id: userid,
              added_by: "1",
              page: page
            }
          );
          setConstgetdata(response?.data?.data || []);
          console.log(response?.data);
          setPagenation(response?.data);
        } catch (error) {
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      } else {
        toast.error("Permission Denied: You don't have access to this page");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Permission Denied");
    } finally {
      setLoader(false);
    }
  };
  const handelmdal = () => {
    setOpenmodal(false);
  };
  const getstaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}staff-list`
      );
      console.log(response.data.data);
      setStaffdata(response.data.data);
    } catch (error) {
      console.log(error.response.data.data);
    }
  };
  useEffect(() => {
    getstaff();
    getdata();
  }, []);
  const handleclicknavidata = (id) => {
    const datauser = constgetdata.find((item) => item.id === id);
    console.log(datauser);
    navigate("/Admin/Custom-details", { state: { data: [datauser] } });
  };
  const handleclick1212 = (id) => {
    const datauser = constgetdata.find((item) => item.id === id);
    console.log(datauser);
    navigate("/Admin/AdminclearenceDetails", { state: { data: [datauser] } });
  };
  const handlelcickestrachange = (id) => {
    const datauser = constgetdata.find((item) => item.id === id);
    console.log(datauser);
    navigate("/Admin/shipping-estimate-clearence", {
      state: { data: [datauser], data12: "update" },
    });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getdata(page);
  };
  // const handleSearch = (e) => {
  //   setSearchQuery(e.target.value);
  //   setCurrentPage(1);
  // };
  const filteredData = constgetdata.filter((item) => {
    // console.log(item);
    return (
      item?.clearance_number
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.client_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.goods_desc?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.port_of_entry_name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.port_of_exit_name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase())
    );
  });
  const totalPage = Math.ceil(pagenation.total / pagenation.limit);
  const startindex = (currentPage - 1) * pagenation.limit;
  const endIndex = startindex + pagenation.limit;
  const currentdata = filteredData.slice(startindex, endIndex);
  const handleclickcleared = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, {
        clearing_status: "0",
        added_by: 1,
      })
      .then((response) => {
        console.log(response.data.data);
        setConstgetdata(response?.data?.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  useEffect(() => {
    getcountry();
    getclient();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearchQuery(value);
    setCurrentPage(1);

    throttledSearch(value); // ✅ throttled call
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
      freightData1(value);
    }, 1000)
  ).current;

  const freightData1 = async (value) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}clearing-list`,
        {
          user_id: userid,
          added_by: "1",
          search: value,
        }
      );
      setConstgetdata(response?.data?.data || []);
      console.log(response?.data);
      setPagenation(response?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }

  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        console.log(response.data);
        setCountry(response.data.data);
      })
      .catch((error) => {
        toast.errror(error.response.data.data);
      });
  };

  const getclient = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}client-list`)
      .then((response) => {
        setClient(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const handlelcickdelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Clearance?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}delete-clearing`, { clearing_id: id }
        );
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response?.data?.message || "Clearance Deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
          getdata();
        } else {
          toast.error(response.data.message || "Failed to delete Clearance.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handlelcickdeletettach = (id) => {
    setClearanceid(id);
    setOpenmodal(true);
  };
  const postattachquote = () => {
    const postquote = {
      clearance_id: clearanceid,
      file: filedata1,
    };
    const fromdata = new FormData();
    fromdata.append("clearing_id", clearanceid);
    fromdata.append("file", filedata1);
    console.log(fromdata);
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}AttachedShippingEstimate`,
        fromdata
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.success === true) {
          toast.success(response.data.message);
          handelmdal();
        }
      })
      .catch((error) => {
        console.log(error.response.data);
        toast.error(error.response.data.message);
      });
  };
  const handlelcickdeletesdsd1234 = async (item) => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/MoveToClearaneOrder",
          user_type: usertype,
        }
      );
      if (permission.data.success === true) {
        const dataval = constgetdata.filter((item1) => {
          return item1.id === item.id;
        });
        const daatta = {
          clearance_id: item.id,
          user_id: item.user_id,
        };
        axios
          .post(`${process.env.REACT_APP_BASE_URL}MoveToClearaneOrder`, daatta)
          .then((response) => {
            console.log(response.data);
            toast.success(response.data.message);
            getdata();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || "Failed to move order");
          });
      } else {
        toast.error("Permission Denied");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Permission Denied");
    }
  };
  const handlelcickdelete1234 = async (id) => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/Admin/custom-calcualate",
          user_type: usertype,
        }
      );
      if (permission.data.success === true) {
        console.log("a");
        navigate("/Admin/custom-calcualate", { state: { data: id } });
      } else {
        toast.error("Permission Denied");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Permission Denied");
    }
  };
  useEffect(() => {
    getClient();
  }, []);
  const getClient = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}client-list`)
      .then((response) => {
        setLcientlist(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlekey = (e) => {
    if (e.charCode < 44 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  //////////////////////////////////////////// edit modal work///////////////////////////////////////
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const editQuotation = async (id) => {
    console.log(id);
    const datauser = constgetdata.find((item) => item.id === id.id);
    console.log(datauser);
    navigate("/Admin/Editpdfclearence", { state: { data: [datauser] } });
    // navigate("/Admin/Editpdfclearence", { state: { data: id, secretdata :"dataedit" } });
  };
  const postData = () => {
    const dtatapost = {
      origin: data.origin,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      clearingType: data.clearingType,
      clearing_status: data.clearing_status,
      user_id: userid,
      added_by: "1",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, dtatapost)
      .then((response) => {
        if (response.data.success === true) {
          handleCloseModal();
          setConstgetdata(response.data.data);
          setPagenation(response.data);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files);
    setFormFiles((prev) => ({
      ...prev,
      [fieldName]: files,
    }));
  };

  const handlelcsendid = (item) => {
    console.log(item.id);
    console.log(item)
    setFreightIdAssignTask(item)
    setOpenmodalAssignFreight(true)
  }

  const hanldecloseModal = () => {
    setOpenmodalAssignFreight(false)
  }

  const AssignFreightToSupplier = async () => {
    const payload = {
      clearance_id: freightIdAssignTask.id,
      staff_id: supplierName
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}assignClearanceToStaff`,
        payload
      );
      console.log(response.data);
      toast.success(response.data.message);
      getClient()
      setOpenmodalAssignFreight(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
  const getSupplierdata = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}staff-list`)
      .then((response) => {
        setSupplierData(response.data.data);
      })
      .catch((error) => {
        toast.error("Error fetching suppliers");
      });
  };

  useEffect(() => {
    getSupplierdata();
  }, []);
  return (
    <>

      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <Modal
              open={openmodalAssignFreight}
              onClose={hanldecloseModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="newModal"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: {
                    xs: "95%",   // mobile
                    sm: "80%",   // tablet
                    md: "60%",   // small laptop
                    lg: "40%",   // desktop
                  },
                  bgcolor: "background.paper",
                  boxShadow: 24,
                }}
              >
                <div className="modal-header">
                  <h2>
                    <h2 id="modal-modal-title">Assign Staff</h2>
                  </h2>
                  <button className="btn btn-close" onClick={hanldecloseModal}>
                    <CloseIcon />
                  </button>
                </div>

                <div className="newModalGap">
                  <div className="col-12 ">
                    <label>Assign Staff</label>
                    <select
                      className="form-cuntrol col-12 border px-3 py-2 mb-2"
                      value={supplierName}
                      onChange={(e) => { setSupplierName(e.target.value) }}
                      name="attachdoc"
                    >
                      <option>Select</option>
                      {supplierData.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      variant="contained"
                      className="blueBtn"
                      onClick={AssignFreightToSupplier}
                    >
                      Add Staff
                    </button>

                  </div>
                </div>
              </Box>
            </Modal>
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="">
                  <h4 className="freight_hd">Custom Clearance Admin</h4>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="searchManageFre">
                    <input
                      className="px-2 py-1 rounded "
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearch}
                    ></input>
                  </div>
                  <div className="mx-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUpdating(false);
                        setShowModal(true);
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="dropdown">
                    <button onClick={handleOpenModal}>Filter</button>
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
            <div className="mt-4">
              <div>
                <div>
                  <table className="table table-striped table-hover">
                    <tbody>
                      {constgetdata.map((item, index) => {
                        return (
                          <>
                            <tr key={index}>
                              <td className="list_bd">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <p className="client_nm">
                                      {item.client_name}
                                    </p>
                                    <p className="fright_no mx-2 fs-6">
                                      {item.clearance_number}
                                    </p>
                                  </div>
                                  <div className="">
                                    <p className="port_date">
                                      {new Date(
                                        item.created_at
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                </div>
                                <div className="container-fluid">
                                  <div className="row">
                                    <div className="col-md-3 ps-0">
                                      <div className="">
                                        <p className="origin">
                                          {item.goods_desc}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-5">
                                      <div className="d-flex align-items-center justify-content-center">
                                        <p className="origin">
                                          {item.port_of_entry_name}
                                        </p>
                                        <div className="arrow">
                                          <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                        </div>
                                        <p className="origin">
                                          {item.port_of_exit_name}
                                          <span className="fright_type">
                                            {item?.freight}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-2">
                                      <div className="text-center"></div>
                                    </div>
                                    <div className="col-md-2 pe-0">
                                      <div className="text-end">
                                        <div className="dropdown">
                                          <a
                                            href=""
                                            type="button"
                                            className="act_btn dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                          >
                                            Action
                                          </a>
                                          <div className="dropdown-menu">
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handleclicknavidata(item.id)
                                              }
                                            >
                                              <VisibilityIcon
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  cursor: "pointer",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                }}
                                              />
                                              View Quotation
                                            </a>
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handleclick1212(item.id)
                                              }
                                            >
                                              <VisibilityIcon
                                                style={{
                                                  color: "rgb(27 34 69)",
                                                  cursor: "pointer",
                                                  marginRight: "10px",
                                                  width: "20px",
                                                }}
                                              />
                                              View Details
                                            </a>
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handlelcickdelete(item.id)
                                              }
                                            >
                                              <AiFillDelete
                                                className="text-danger"
                                                style={{
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  cursor: "pointer",
                                                  height: "20px",
                                                }}
                                              />
                                              Delete
                                            </a>
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handlelcickdeletettach(item.id)
                                              }
                                            >
                                              <CopyAll
                                                className="text-danger"
                                                style={{
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  cursor: "pointer",
                                                  height: "20px",
                                                }}
                                              />
                                              Attach Quotation
                                            </a>
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handlelcsendid(item)
                                              }
                                            >
                                              <AssignmentTurnedIn
                                                className="text-danger"
                                                style={{
                                                  marginRight: "10px",
                                                  width: "20px",
                                                  cursor: "pointer",
                                                  height: "20px",
                                                }}
                                              />
                                              Assign Clearance
                                            </a>
                                            <a
                                              className="dropdown-item li_icon"
                                              onClick={() =>
                                                handleGetDataForUpdate(item.id)
                                              }
                                            >
                                              <div className="action_btn">
                                                <FaEdit
                                                  style={{
                                                    color: "rgb(11, 65, 112)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    height: "15px",
                                                  }}
                                                />
                                                Edit
                                              </div>
                                            </a>
                                            <a
                                              className="dropdown-item li_icon NewDropdown"
                                              onClick={() =>
                                                handlelcickdeletesdsd1234(item)
                                              }
                                            >
                                              <div className="action_btn">
                                                <MdDriveFileMoveOutline
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    cursor: "pointer",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                  }}
                                                />
                                                Inorder
                                              </div>
                                            </a>
                                            <a
                                              className="dropdown-item li_icon NewDropdown"
                                              onClick={() =>
                                                editQuotation(item)
                                              }
                                            >
                                              <div className="action_btn">
                                                <MdDriveFileMoveOutline
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    cursor: "pointer",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                  }}
                                                />
                                                Edit Quotation
                                              </div>
                                            </a>
                                            <a
                                              className="dropdown-item li_icon NewDropdown"
                                              onClick={() =>
                                                handlelcickdelete1234(item)
                                              }
                                            >
                                              <div className="action_btn">
                                                <CalculateIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    cursor: "pointer",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                  }}
                                                />
                                                Get Estimate
                                              </div>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <p className="input_user mb-0" />
                                    <label className="status">
                                      {item.quotation_status == 1 ? (
                                        <div className="d-flex align-items-center">
                                          <span className="dot bg-success me-2"></span>
                                          <p className="text-success mb-0">
                                            Accepted
                                          </p>
                                        </div>
                                      ) : item.quotation_status == 2 ? (
                                        <div className="d-flex align-items-center">
                                          <span className="dot bg-info me-2"></span>
                                          <p className="text-info mb-0">
                                            Declined
                                          </p>
                                        </div>
                                      ) : item.quotation_status == 3 ? (
                                        <div className="d-flex align-items-center">
                                          <span className="dot bg-success me-2"></span>
                                          <p className="text-success mb-0">
                                            Moved to Order
                                          </p>
                                        </div>
                                      ) : item.quotation_status == 4 ? (
                                        <p className="text-info mb-0">
                                          Estimated
                                        </p>
                                      ) : (
                                        <div className="d-flex align-items-center">
                                          <span className="dot bg-secondary me-2"></span>
                                          <p className="text-secondary mb-0">
                                            Pending
                                          </p>
                                        </div>
                                      )}
                                    </label>
                                  </div>

                                  <div className="ms-4">
                                    <p className="me-2">{item?.assigned_supplier_name}</p>
                                    {item?.sales_name}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={openmodal}
        onClose={handelmdal}
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
            width: {
              xs: "95%",   // mobile
              sm: "80%",   // tablet
              md: "60%",   // small laptop
              lg: "40%",   // desktop
            },

          }}
        >
          <div className="modal-header">
            <h2 id="modal-modal-title">Attcah Quote</h2>
            <button className="btn btn-close" onClick={handelmdal}>
              <CloseIcon />
            </button>
          </div>
          <div className="newModalGap">
            <div className="row">
              <div className="col-md-12">
                <label>Attach Quote</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handecnagegetthedata}
                  name="file"
                ></input>
              </div>
            </div>
            <div className="text-center mt-3">
              <button
                variant="contained"
                className="blueBtn"
                onClick={postattachquote}
              >
                Add Quote
              </button>

            </div>
          </div>
        </Box>
      </Modal>
      
      <div>
        <div
          className={`modal fade ${showModal ? "show " : ""}`}
          style={{ display: showModal ? "block" : "none" }}
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  {isUpdating ? "Update" : "Add"} Custom Clearance
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="modal-body noFormaControl">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label htmlFor="customer_ref" className="form-label">
                        Mode of Freight <span style={{ color: "red" }}>*</span>
                      </label>

                      <select
                        onChange={isUpdating ? handleInputChange : handlechange}
                        name="freight"
                        className="w-100 py-2 px-2 sel_custom"
                        value={isUpdating ? inputdata.freight : data.freight}
                      >
                        <option>Select...</option>
                        <option value="Sea">Sea</option>
                        <option value="Air">Air</option>
                        <option value="Road">Road</option>
                        <option value="Rail">Rail</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Client </label>
                    <select
                      name="client"
                      onChange={isUpdating ? handleInputChange : handlechange}
                      value={isUpdating ? inputdata.client : data.client}
                    >
                      <option>Select...</option>
                      {lcientlist &&
                        lcientlist.length > 0 &&
                        lcientlist.map((item, index) => {
                          // console.log(item);
                          return (
                            <>
                              <option key={index} value={item.id}>
                                {item.full_name}
                              </option>
                            </>
                          );
                        })}
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    {showSeaOptions && (
                      <>
                        <h5>Sea Freight Options</h5>
                        <select
                          name="seaOption"
                          id="seaOption"
                          onChange={isUpdating ? handleInputChange : handlechange}
                          className="w-100 py-2 px-2"
                        >
                          <option value="">Select...</option>
                          <option value="fullContainer">Full Container</option>
                          <option value="lessThanContainer">
                            Less than Container Size
                          </option>
                        </select>
                      </>
                    )}
                    {showRoadOptions && (
                      <>
                        <h5>Road Freight Options</h5>
                        <select
                          name="roadOption"
                          id="roadOption"
                          onChange={isUpdating ? handleInputChange : handlechange}
                          className="w-100 py-2 px-2"
                        >
                          <option value="">Select...</option>
                          <option value="fullLoad">Full Load</option>
                          <option value="smallCargo">
                            Small Cargo for Console
                          </option>
                        </select>
                      </>
                    )}
                  </div>
                </div>
                <div className="row ">
                  <div className="col-md-6 mb-3 mt-3 mt-md-0">
                    <div>
                      <label>Are You</label>
                      <div className="shipRefer">
                        {!isUpdating ? (
                          <>

                            <div className="radioBtn d-flex gap-3">
                              <div>

                                <input
                                  type="radio"
                                  id="statusShipper"
                                  name="is_cong_shipp"
                                  value="shipper"
                                  onChange={handlechange}
                                />
                                <label htmlFor="statusShipper">Shipper </label>
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  id="statusConsignee"
                                  name="is_cong_shipp"
                                  value="consignee"
                                  onChange={handlechange}
                                />
                                <label htmlFor="statusConsignee">Consignee </label>
                              </div>
                            </div>


                          </>
                        ) : (
                          <>


                            <div className="radioBtn d-flex gap-3">
                              <div>

                                <input
                                  type="radio"
                                  id="statusShipper"
                                  name="is_cong_shipp"
                                  value="shipper"
                                  checked={inputdata.is_cong_shipp === "shipper"}
                                  onChange={handleInputChange}
                                />
                                <label htmlFor="statusShipper">Shipper </label>

                              </div>
                              <div>

                                <input
                                  type="radio"
                                  id="statusConsignee"
                                  name="is_cong_shipp"
                                  value="consignee"
                                  checked={inputdata.is_cong_shipp === "consignee"}
                                  onChange={handleInputChange}
                                />
                                <label htmlFor="statusConsignee">Consignee </label>
                              </div>
                            </div>

                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label>Is this</label>
                    <div className="shipRefer d-flex">
                      {!isUpdating ? (
                        <>
                          <div className="radioBtn">
                            <div>
                              <input
                                type="radio"
                                id="statusOne"
                                name="is_Import_Export"
                                value="import"
                                onChange={handlechange}
                                className="check_input"
                              />
                              <label htmlFor="statusOne">Import</label>

                            </div>
                          </div>
                          <div className="radioBtn">
                            <div>

                              <input
                                type="radio"
                                id="statusTwo"
                                name="is_Import_Export"
                                value="export"
                                onChange={handlechange}
                                className="check_input"
                              />
                              <label htmlFor="statusTwo">Export</label>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="radioBtn">
                            <div>
                              <input
                                type="radio"
                                id="statusOne"
                                name="is_Import_Export"
                                value="import"
                                checked={inputdata.is_Import_Export === "import"}
                                onChange={handleInputChange}
                                className="check_input"
                              />
                              <label htmlFor="statusOne">Import</label>

                            </div>
                          </div>
                          <div className="radioBtn">
                            <div>
                              <input
                                type="radio"
                                id="statusTwo"
                                name="is_Import_Export"
                                value="export"
                                checked={inputdata.is_Import_Export === "export"}
                                onChange={handleInputChange}
                                className="check_input"
                              />
                              <label htmlFor="statusTwo">Export</label>

                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mt-3 mt-md-0">
                    <label>Shipment Refrence</label>
                    <div className="shipRefer">
                      <input
                        type="text"
                        id="stausone"
                        name="customer_ref"
                        className="w-100 rounded py-1 px-2 sel_custom"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating ? inputdata.customer_ref : data.customer_ref
                        }
                        placeholder="Shipment Reference"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mt-3 mt-md-0">
                    <label>Sales Representative</label>
                    <div className="shipRefer">
                      <select
                        name="sales_representative"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating
                            ? inputdata.sales_representative
                            : data.sales_representative
                        }
                      >
                        <option value="">Select...</option>
                        {staffdata &&
                          staffdata.length > 0 &&
                          staffdata.map((item, index) => {
                            return (
                              <>
                                <option value={item.id} key={index}>
                                  {item.full_name}
                                </option>
                              </>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="md_heading text-start">
                      Port of Clearing Details
                    </h6>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="destination" className="form-label">
                        Port of Loading Country{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        id="port_of_entry"
                        name="loading_country"
                        value={
                          isUpdating
                            ? inputdata.loading_country
                            : data.loading_country
                        }
                        onChange={isUpdating ? handleInputChange : handlechange}
                      >
                        <option>Select...</option>
                        {country &&
                          country.length > 0 &&
                          country.map((item, index) => {
                            // console.log(item);
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
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_entry" className="form-label">
                        Port of Exit Country{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <select
                        id="port_of_entry"
                        name="discharge_country"
                        value={
                          isUpdating
                            ? inputdata.discharge_country
                            : data.discharge_country
                        }
                        onChange={isUpdating ? handleInputChange : handlechange}
                      >
                        <option>Select...</option>
                        {country &&
                          country.length > 0 &&
                          country.map((item, index) => {
                            // console.log(item);
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
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_exit" className="form-label">
                        Port of Loading
                      </label>
                      <input
                        className="form-control"
                        name="port_of_loading"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating
                            ? inputdata.port_of_loading
                            : data.port_of_loading
                        }
                        placeholder="Port of Loading"
                      ></input>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="clearing_agent" className="form-label">
                        Port of Discharge
                      </label>
                      <input
                        className="form-control"
                        name="port_of_discharge"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating
                            ? inputdata.port_of_discharge
                            : data.port_of_discharge
                        }
                        placeholder="Port of Discharge"
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="row mb-3 ">
                  <div className="col-md-6 col-sm-6">
                    <h4 className="freight_hd">Document Section</h4>
                    <span class="line"></span>
                  </div>
                  <div className="col-md-6 col-sm-6 mt-3 mt-sm-0 text-sm-end">
                    <button className="blueBtn" onClick={handleShow}>
                      Upload Documents
                    </button>

                    {show1 ? (
                      <Modal
                        open={show1}
                        onClose={handleClose}
                        slotProps={{
                          backdrop: {
                            sx: { backgroundColor: "rgba(0,0,0,0.2)" }, // lighter background
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
                              onChange={handleSelect}
                            >
                              {docOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <div className="mt-3">
                            {selectedDocs.map((doc, index) => (
                              <div key={index} className="mb-3">
                                <label className="fw-bold">{doc.name}</label>
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
                            <Button onClick={handleClose}>Cancel</Button>
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
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="md_heading text-start mt-0">Cargo Details</h6>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_exit" className="form-label">
                        Product Description
                      </label>
                      <input
                        className="form-control"
                        name="goods_desc"
                        value={
                          isUpdating ? inputdata.goods_desc : data.goods_desc
                        }
                        onChange={isUpdating ? handleInputChange : handlechange}
                        placeholder="Product Description"
                      ></input>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="clearing_agent" className="form-label">
                        Nature of Goods
                      </label>
                      <select
                        id="clearing_agent"
                        name="nature_of_goods"
                        value={
                          isUpdating
                            ? inputdata.nature_of_goods
                            : data.nature_of_goods
                        }
                        onChange={isUpdating ? handleInputChange : handlechange}
                      >
                        <option>Select...</option>
                        <option value="General Cargo">General Cargo</option>
                        <option value="Battery">Battery</option>
                        <option value="Powders">Powders</option>
                        <option value="Hazardous">Hazardous</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_exit" className="form-label">
                        Type of Packing
                      </label>
                      <select
                        name="packing_type"
                        value={
                          isUpdating ? inputdata.packing_type : data.packing_type
                        }
                        onChange={isUpdating ? handleInputChange : handlechange}
                      >
                        <option>Select...</option>
                        <option value="box">Box</option>
                        <option value="crate">Crate</option>
                        <option value="pallet">Pallet</option>
                        <option value="bags">Bags</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="clearing_agent" className="form-label">
                        Comment on Goods
                      </label>
                      <input
                        className="form-control"
                        name="comment_on_docs"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating
                            ? inputdata.comment_on_docs
                            : data.comment_on_docs
                        }
                        placeholder="Comment on Docs"
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_exit" className="form-label">
                        No of package
                      </label>
                      <input
                        className="form-control"
                        onKeyPress={handlekey}
                        name="total_box"
                        value={isUpdating ? inputdata.total_box : data.total_box}
                        onChange={isUpdating ? handleInputChange : handlechange}
                        placeholder="0.00"
                      ></input>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="clearing_agent" className="form-label">
                        Total Dimension
                      </label>
                      <input
                        className="form-control"
                        onKeyPress={handlekey}
                        name="total_dimension"
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating
                            ? inputdata.total_dimension?.toLocaleString()
                            : data.total_dimension
                        }
                        placeholder="0.00"
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="port_of_exit" className="form-label">
                        Weight
                      </label>
                      <input
                        className="form-control"
                        name="total_weight"
                        onKeyPress={handlekey}
                        onChange={isUpdating ? handleInputChange : handlechange}
                        value={
                          isUpdating ? inputdata.total_weight : data.total_weight
                        }
                        placeholder="0.00"
                      ></input>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  {isUpdating ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary close"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
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

                  <h2 id="modal-modal-title">Filter</h2>

                  <button className="btn btn-close" onClick={handleCloseModal}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="newModalGap noFormaControl mt-2">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Country of Origin</label>
                      <select name="origin" onChange={handlechange}>
                        <option value="">Select</option>
                        {country &&
                          country.length > 0 &&
                          country.map((item, index) => {
                            return (
                              <>
                                <option value={item.id}>{item.name}</option>
                              </>
                            );
                          })}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Delivery to Country </label>
                      <select name="destination" onChange={handlechange}>
                        <option value="">Select</option>
                        {country &&
                          country.length > 0 &&
                          country.map((item, index) => {
                            return (
                              <>
                                <option value={item.id}>{item.name}</option>
                              </>
                            );
                          })}
                      </select>
                    </div>

                    <div className="col-md-6">
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
                    <div className="col-md-6">
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

                    <div className="col-12">
                      <label>Freight</label>
                      <select name="freight" onChange={handlechange}>
                        <option value="">Select...</option>
                        <option value="Sea">Sea</option>
                        <option value="Air">Air</option>
                        <option value="Road">Road</option>
                      </select>
                    </div>
                    <div className="col-md-12 text-center">
                      <button className="blueBtn" variant="contained" onClick={postData}>
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
        </div>
        {showModal && (
          <div className="modal-backdrop fade show"></div>
        )}

      </div>
    </>
  );
};
export default CustomClearaceOrder;
