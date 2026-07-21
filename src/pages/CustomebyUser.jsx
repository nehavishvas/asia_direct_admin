import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { AiFillDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaidIcon from "@mui/icons-material/Paid";
import CancelIcon from "@mui/icons-material/Cancel";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalculateIcon from "@mui/icons-material/Calculate";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TollIcon from "@mui/icons-material/Toll";
import {
  Modal,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FaEdit } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import { AssignmentTurnedIn } from "@mui/icons-material";
import Swal from "sweetalert2";

const pageSize = 10;
export default function CustomebyUserap() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({
    trans_reference: "",
    client: "",
    customer_ref: "",
    goods_desc: "",
    destination: "",
    port_of_entry: "",
    port_of_exit: "",
    clearing_agent: "",
    clearing_status: "",
    clearing_result: "",
    document_req: "",
    document: "",
    sad500: "",
    comment_on_docs: "",
  });
  const [error, setError] = useState([]);
  const [image1, setImage1] = useState(null);
  const [image2, setImahe2] = useState(null);
  const [constgetdata, setConstgetdata] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [erd, setErd] = useState("");
  const [inputdata, setInputdata] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [file1, setFile1] = useState(null);
  const [eid, setEid] = useState(null);
  const [freightIdAssignTask, setFreightIdAssignTask] = useState(null);
  const [openmodalAssignFreight, setOpenmodalAssignFreight] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [openeditmodal, setOpeneditmodal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [staffdata, setStaffdata] = useState([]);
  const [formData11, setFormData11] = useState(null);
  const [formData1, setFormData1] = useState(null);
  const [formData2, setFormData2] = useState(null);
  const [formData3, setFormData3] = useState(null);
  const [country, setCountry] = useState([]);
  const [age, setAge] = React.useState("");
  const [pagenationData, setPagenationData] = useState(1);
  const [eids, setEids] = useState("");
  const handleChange = (event) => {
    setAge(event.target.value);
  };
  const navigate = useNavigate();
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
  const handleSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedDocs.find((doc) => doc.name === selected)) {
      setSelectedDocs([...selectedDocs, { name: selected, files: [] }]);
    }
  };
  const handleFileChangefil = (e, docName) => {
    const files = Array.from(e.target.files);
    setSelectedDocs((prev) =>
      prev.map((doc) => (doc.name === docName ? { ...doc, files } : doc))
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
  //////////////////////////////////////////post data//////////////////////////////////////////////
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  const handECHlhange = (e) => {
    const data = e.target.files[0];
    setImage1(data);
  };
  const handECHlhange2 = (e) => {
    const data4 = e.target.files[0];
    setImahe2(data4);
  };
  const handlevalifdate = (value) => {
    let error = {};
    if (!value.trans_reference) {
      error.trans_reference = "trans reference is required";
      toast.error("trans reference is required");
    }
    if (!value.customer_ref) {
      error.customer_ref = "customer reference is required";
      toast.error("customer reference is required");
    } else {
      apihit();
    }
    setError(error);
  };
  const handleclick = () => {
    handlevalifdate(data);
  };
  const handleFileChange4 = (event) => {
    const files = event.target.files;
    setFormData11({ ...formData11, supplier_invoice: files });
  };
  const handleFileChange1 = (event) => {
    const files = event.target.files;
    setFormData1({ ...formData1, packing_list: files });
  };
  const handleFileChange2 = (event) => {
    const files = event.target.files;
    setFormData2({ ...formData2, licenses: files });
  };
  const handleFileChange3 = (event) => {
    const files = event.target.files;
    setFormData3({ ...formData3, other_documents: files });
  };
  const apihit = () => {
    const formdata = new FormData();
    formdata.append("trans_reference", data.trans_reference);
    formdata.append("client", data.client);
    formdata.append("customer_ref", data.customer_ref);
    formdata.append("goods_desc", data.goods_desc);
    formdata.append("destination", data.destination);
    formdata.append("port_of_entry", data.port_of_entry);
    formdata.append("port_of_exit", data.port_of_exit);
    formdata.append("clearing_agent", data.clearing_agent);
    formdata.append("clearing_status", data.clearing_status);
    formdata.append("clearing_result", data.clearing_result);
    formdata.append("document_req", data.document_req);
    formdata.append("document", image1);
    formdata.append("sad500", image2);
    formdata.append("comment_on_docs", data.comment_on_docs);
    formdata.append("documentName", data.documentName);
    if (formData2) {
      for (let i = 0; i < formData2.licenses.length; i++) {
        formdata.append("document", formData2.licenses[i]);
      }
    }
    axios
      .post(`${process.env.REACT_APP_BASE_URL}add-clearing`, formdata)
      .then((response) => {
        console.log(response.data);
        toast.success(response.data.message);
        getdata();
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  /////////////////////////////////////////delete functin //////////////////////////////////////////
  const handlelcickdelete = async (id) => {
    const postdata = {
      staff_id: userid,
      route_url: "/freight-list",
      user_type: usertype,
    };
    const permisssion = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      postdata
    );
    if (permisssion.data.success === true) {
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
          const response = await axios.post(`${process.env.REACT_APP_BASE_URL}delete-clearing`, {
            clearing_id: id,
          });
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
      // axios
      //   .post(`${process.env.REACT_APP_BASE_URL}delete-clearing`, {
      //     clearing_id: id,
      //   })
      //   .then((response) => {
      //     toast.success(response.data.message);
      //     getdata();
      //   })
      //   .catch((error) => {
      //     toast.error(error.response.data.message);
      //   });
    } else {
      toast.error(permisssion.data.message);
    }
  };
  //////////////////////////////////////////////////get data/////////////////////////////////////////////////
  const getdata = async (currentData) => {
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      {
        staff_id: userid,
        route_url: "/clearing-list",
        user_type: usertype,
      }
    );
    if (permission.data.success === true) {
      setLoader(true);
      axios
        .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, {
          added_by: 2,
          user_id: userid,
          page: currentData,
        })
        .then((response) => {
          console.log(response?.data?.data);
          setConstgetdata(response?.data?.data);
          setPagenationData(response.data);
          setLoader(false);
        })
        .catch((error) => {
          setLoader(false);
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("error");
    }
  };
  const getdata11 = async (currentData) => {
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      {
        staff_id: userid,
        route_url: "/clearing-list",
        user_type: usertype,
      }
    );
    if (permission.data.success === true) {
      setLoader(true);
      axios
        .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, {
          added_by: 2,
          user_id: userid,
          search: currentData,
        })
        .then((response) => {
          console.log(response?.data?.data);
          setConstgetdata(response?.data?.data);
          setPagenationData(response.data);
          setLoader(false);
        })
        .catch((error) => {
          setLoader(false);
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("error");
    }
  };
  useEffect(() => {
    getdata();
  }, []);
  const handleclicknva = (id) => {
    const datauser = constgetdata.filter((item) => {
      return item.id === id;
    });
    navigate("/Admin/clearenceeditview", { state: { data: datauser } });
  };
  ////////////////////////////////////////////////////////////update data//////////////////////////
  const handlegetid = (id) => {
    setErd(id);
    const selectuser = constgetdata.filter((item) => {
      return item.id === id;
    });
    const getdata = selectuser[0];
    console.log(getdata);
    setInputdata((previData) => ({
      ...previData,
      trans_reference: getdata.trans_reference,
      client: getdata.client,
      customer_ref: getdata.customer_ref,
      goods_desc: getdata.goods_desc,
      destination: getdata.destination,
      port_of_entry: getdata.port_of_entry,
      port_of_exit: getdata.port_of_exit,
      clearing_agent: getdata.clearing_agent,
      clearing_status: getdata.clearing_status,
      clearing_result: getdata.clearing_result,
      document_req: getdata.document_req,
      document: getdata.document,
      sad500: getdata.sad500,
      comment_on_docs: getdata.comment_on_docs,
    }));
    console.log(inputdata);
  };
  const updatedata = () => {
    const formdata = new FormData();
    formdata.append("clearing_id", eids);
    formdata.append("trans_reference", inputdata.trans_reference);
    formdata.append("client", inputdata.client);
    formdata.append("customer_ref", inputdata.customer_ref);
    formdata.append("freight", inputdata.customer_ref);
    formdata.append("goods_desc", inputdata.goods_desc);

    formdata.append("loading_country", inputdata.loading_country);
    formdata.append("discharge_country", inputdata.discharge_country);
    formdata.append("port_of_loading", inputdata.port_of_loading);
    formdata.append("port_of_discharge", inputdata.port_of_discharge);

    formdata.append("is_cong_shipp", inputdata.is_cong_shipp);
    formdata.append("is_Import_Export", inputdata.is_Import_Export);
    formdata.append("destination", inputdata.destination);
    formdata.append("clearing_agent", inputdata.clearing_agent);
    formdata.append("clearing_status", inputdata.clearing_status);
    formdata.append("clearing_result", inputdata.clearing_result);
    formdata.append("document_req", inputdata.document_req);
    formdata.append("total_weight", inputdata.total_weight);
    formdata.append("total_box", inputdata.total_box);
    formdata.append("total_dimension", inputdata.total_dimension);
    formdata.append("comment_on_docs", inputdata.comment_on_docs);
    formdata.append("documentName", inputdata.documentName);
    selectedDocs.forEach((doc) => {
      console.log("Doc Type:", doc.name);
      doc.files.forEach((file) => {
        formdata.append(doc.name, file); // 👈 each file append
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    console.log(formdata);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}update-clearing`, formdata)
      .then((response) => {
        getdata();
        handleCloseModal7();
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  ////////////////////////////////get table filter data///////////////////////////////////////////
  const totalPages = Math.ceil(pagenationData?.total / pagenationData?.limit);
  const startIndex = (currentPage - 1) * pagenationData?.limit;
  const endIndex = startIndex + pagenationData?.limit;
  const currentData = constgetdata.slice(startIndex, endIndex);

  const handlePageChange = (currentData) => {
    setCurrentPage(currentData);
    getdata(currentData);
  };

  const handleclickaccc = async (id) => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/status-clearance",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}status-clearance`,
            {
              clearance_id: id,
              status: "1",
            }
          );

          getdata();
          toast.success(response.data.message);
        } catch (error) {
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      } else {
        toast.error("Access Denied");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleclickdecli = (id) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}status-clearance`, {
        clearance_id: id,
        status: "2",
      })
      .then((response) => {
        console.log(response.data);
        toast.error(response.data.message);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleclickaccname123234 = (id) => {
    const dataval = constgetdata.filter((item) => {
      return item.id === id.id;
    });
    console.log(dataval);
    navigate("/Admin/Editclearence", {
      state: { data: dataval },
    });
  };
  const handleclickaccname123 = async (item) => {
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
        console.log(item);
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
            toast.success(response.data.message);
            getdata();
          })
          .catch((error) => {
            console.log(error.response.data);
            toast.error(error.response.data.message);
          });
      } else {
        toast.error(permission.data.message);
      }
    } catch (error) {
      toast.error("permisiion denied");
    }
  };
  useEffect(() => {
    getcountry();
  }, []);
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountry(response.data.data);
      })
      .catch((error) => {
        toast.errror(error.response.data.data);
      });
  };
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleModal = (id) => {
    setEid(id);
    setIsModalOpen1(true);
  };
  const handleCloseModal1 = () => setIsModalOpen1(false);
  const postData = () => {
    const postdata = {
      origin: data.origin,
      destination: data.destination,
      startDate: data.startdate,
      endDate: data.enddate,
      clearingType: data.clearing_type,
      clearing_status: data.clearing_status,
      added_by: "2",
      user_id: userid,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, postdata)
      .then((response) => {
        if (response.data.success === true) {
          // handleCloseModal();
          setIsModalOpen(false);
          console.log(response.data);
          setConstgetdata(response.data.data);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handlefilechange = (e) => {
    setFile1(e.target.files[0]);
  };

  const postData123 = async () => {
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      {
        staff_id: userid,
        route_url: "/AttachedShippingEstimate",
        user_type: usertype,
      }
    );
    console.log(permission);
    if (permission.data.success === true) {
      const fromdata = new FormData();
      fromdata.append("clearing_id", eid);
      fromdata.append("file", file1);
      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}AttachedShippingEstimate`,
          fromdata
        )
        .then((response) => {
          if (response.data.success === true) {
            handleCloseModal1();
            toast.success(response.data.message);
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("Access Denied");
    }
  };

  const handleclicedit = (id) => {
    const dataapp = constgetdata.find((item) => {
      return item.id === id;
    });
    console.log(dataapp);
    setInputdata((prevData) => ({
      ...prevData,
      dataapp,
    }));
    setInputdata(dataapp);
    setEids(id);
    setOpeneditmodal(true);
  };

  const handleOpenModal7 = () => setOpeneditmodal(true);
  const handleCloseModal7 = () => setOpeneditmodal(false);

  const handlechnageupdate = (e) => {
    const { name, value } = e.target;
    setInputdata({ ...inputdata, [name]: value });
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
  }, []);
  const handlelcsendid = (item) => {
    console.log(item.id);
    console.log(item);
    setFreightIdAssignTask(item);
    setOpenmodalAssignFreight(true);
  };

  const hanldecloseModal = () => {
    setOpenmodalAssignFreight(false);
  };

  const AssignFreightToSupplier = async () => {
    const payload = {
      clearance_id: freightIdAssignTask.id,
      staff_id: supplierName,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}assignClearanceToStaff`,
        payload
      );
      console.log(response.data);
      toast.success(response.data.message);
      getdata();
      setOpenmodalAssignFreight(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
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
      getdata11(value);
    }, 1000)
  ).current;

  const getdata1 = async (currentData) => {
    setLoader(true);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}clearing-list`, {
        added_by: 2,
        user_id: userid,
        page: currentData,
      })
      .then((response) => {
        console.log(response?.data?.data);
        setConstgetdata(response?.data?.data);
        setPagenationData(response.data);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        toast.error(error.response.data.message);
      });
  };

  return (
    <>
      <Modal
        open={openeditmodal}
        onClose={handleOpenModal7}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            width: "800px",
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
            <h2>
              <h2 id="modal-modal-title">Update Clearance</h2>
            </h2>
            <button className="btn btn-close" onClick={handleCloseModal7}>
              <CloseIcon />
            </button>
          </div>
          <div className="newModalGap noFormaControl">
            <div className="row mb-2">
              <div className="col-md-6">
                <label>Freight</label>
                <select
                  name="customer_ref"
                  value={inputdata.customer_ref}
                  onChange={handlechnageupdate}
                >
                  <option value="">Select...</option>
                  <option value="Sea">Sea</option>
                  <option value="Air">Air</option>
                  <option value="Road">Road</option>
                </select>
              </div>
              <div className="col-md-6 mt-2 mt-md-0">
                <label>Are You</label>
                <div className="shipRefer">
                  <div className="radioBtn d-flex gap-3">
                    <div>
                      <input
                        type="radio"
                        id="statusShipper"
                        name="is_cong_shipp"
                        value="shipper"
                        checked={inputdata.is_cong_shipp === "Shipper"}
                        onChange={handlechnageupdate}
                      />
                      <label htmlFor="statusShipper">Shipper </label>

                    </div>
                    <div>
                      <input
                        type="radio"
                        id="statusConsignee"
                        name="is_cong_shipp"
                        value="consignee"
                        checked={inputdata.is_cong_shipp === "Consignee"}
                        onChange={handlechnageupdate}
                      />
                      <label htmlFor="statusConsignee">Consignee </label>
                    </div>
                  </div>


                </div>
              </div>
            </div>
            <div className="row mb-2">
              {/* <div className="col-md-6">
                        <label>Freight</label>
                        <select name="freight" onChange={handlechange}>
                          <option value="">Select...</option>
                          <option value="Sea">Sea</option>
                          <option value="Air">Air</option>
                          <option value="Road">Road</option>
                        </select>
                      </div> */}
              <div className="col-md-6">
                <label>Is This</label>
                <div className="shipRefer">
                  <div className="radioBtn d-flex gap-3">
                    <div>
                      <input
                        type="radio"
                        id="statusShipper"
                        name="is_Import_Export"
                        value="import"
                        checked={inputdata.is_Import_Export === "import"}
                        onChange={handlechnageupdate}
                      />
                      <label htmlFor="statusShipper">Import </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="statusConsignee"
                        name="is_Import_Export"
                        value="export"
                        checked={inputdata.is_Import_Export === "export"}
                        onChange={handlechnageupdate}
                      />
                      <label htmlFor="statusConsignee">Export </label>
                    </div>
                  </div>


                </div>
              </div>
            </div>
            {/* <div className="row">
                <div className="col-md-6">
                  <label>Shipment Refrence</label>
                  <div className="shipRefer">
                    <input
                      type="text"
                      id="stausone"
                      name="customer_ref"
                      className="w-100 rounded py-1 px-2 sel_custom"
                      placeholder="Shipment Reference"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Sales Representative</label>
                  <div className="shipRefer">
                    <select
                      name="sales_representative"
                      onChange={ handlechange}
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
              </div> */}
            <div className="row">
              <div className="col-md-12">
                <h6 className="md_heading text-start mt-0">
                  Port of Clearing Details
                </h6>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="destination" className="form-label">
                    Port of Loading Country
                  </label>
                  <select
                    id="port_of_entry"
                    name="loading_country"
                    onChange={handlechnageupdate}
                    value={inputdata.loading_country}
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
                    Port of Exit Country
                  </label>
                  <select
                    id="port_of_entry"
                    name="discharge_country"
                    value={inputdata.discharge_country}
                    onChange={handlechnageupdate}
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
                    onChange={handlechnageupdate}
                    value={inputdata.port_of_loading}
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
                    value={inputdata.port_of_discharge}
                    onChange={handlechnageupdate}
                    placeholder="Port of Discharge"
                  ></input>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="row mb-3">
                  <div className="col-md-6 col-sm-6">
                    <h4 className="freight_hd">Document Section</h4>
                    <span class="line"></span>
                  </div>
                  <div className="col-md-6 col-sm-6 text-start text-sm-end mt-3 mt-sm-0">
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
                                <MenuItem key={option.id} value={option.id}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {/* Dynamic file inputs */}
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

                          {/* Footer buttons */}
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
                <h6 className="md_heading text-start">Cargo Details</h6>
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
                    value={inputdata.goods_desc}
                    onChange={handlechnageupdate}
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
                    onChange={handlechnageupdate}
                    value={inputdata.nature_of_goods}
                  >
                    <option>Select...</option>
                    <option value="General Cargo">General Cargo</option>
                    <option value="Battery">Battery</option>
                    <option value="Powders">Powders</option>
                    <option value="Harzadous">Hazardous</option>
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
                    value={inputdata.packing_type}
                    onChange={handlechnageupdate}
                  >
                    <option>Select...</option>
                    <option value="box">Box</option>
                    <option value="crate">Crate</option>
                    <option value="Pallet">Pallet</option>
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
                    value={inputdata.comment_on_docs}
                    onChange={handlechnageupdate}
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
                    name="total_box"
                    value={inputdata.total_box}
                    onChange={handlechnageupdate}
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
                    name="total_dimension"
                    value={inputdata.total_dimension}
                    onChange={handlechnageupdate}
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
                    value={inputdata.total_weight}
                    onChange={handlechnageupdate}
                    placeholder="0.00"
                  ></input>
                </div>
              </div>
              {/* <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="clearing_agent" className="form-label">
                   Select Document
                  </label>
                          <select name="documentName" onChange={handlechnageupdate}>
                            <option value="">Select...</option>
                            <option value="Customs Documents">Customs docs</option>
                            <option value="Supporting Documents">Supporting docs</option>
                            <option value="Invoice, Packing List">Invoice / Packing L</option>
                            <option value="Product Literature">Product Literature</option>
                            <option value="Letters of authority">LOA</option>
                            <option value="Waybills">Freight Docs</option>
                            <option value="Waybills">Shipping instruction</option>
                            <option value="Supplier Invoices">Freight Invoices </option>
                            <option value="AD_Quotations">Attach Quote</option>
                          </select>
                </div>
              </div> */}
            </div>

            {/* <div className="row">             
                <div className="col-12 mt-3">
                  <h5>licenses</h5>
                  <input
                    type="file"
                    name="licenses"
                    className="mb-3 w-100 rounded"
                    onChange={handleFileChange2}
                    multiple
                  />
              </div>
            </div> */}
            <div className="text-center">
              <button className="blueBtn" variant="contained" onClick={updatedata}>
                Update
              </button>
            </div>
          </div>
        </Box>
      </Modal>
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

            bgcolor: "background.paper",
            boxShadow: 24,
            width: {
              xs: "95%",   // mobile
              sm: "80%",   // tablet
              md: "60%",   // small laptop
              lg: "40%",   // desktop
            },

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
                className="form-control col-12"
                value={supplierName}
                onChange={(e) => {
                  setSupplierName(e.target.value);
                }}
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
            <div className="text-center mt-3">
              <button
                variant="contained"
                className="text-center blueBtn"
                onClick={AssignFreightToSupplier}
              >
                Add Staff
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-12">
              <div className="d-flex justify-content-between flex-wrap gap-2">
                <h4 className="freight_hd">Custom Clearance User</h4>
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    <input
                      className="px-2 py-1 rounded "
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearch}
                    ></input>
                  </div>
                  <button onClick={handleOpenModal}>Filter</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div>
              <div
                className="modal fade"
                id="exampleModal"
                tabIndex={-1}
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">
                        Add Clearance order
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">
                            Trans Refrence*
                          </label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="trans_reference"
                            className="w-100 border p-2 rounded "
                            placeholder="Trans Refrence"
                          ></input>
                          <p className="text-danger">{error.trans_reference}</p>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal"> Client</label>
                          <input
                            type="type"
                            onChange={handlechange}
                            name="client"
                            className="w-100 border p-2 rounded mb-3"
                            placeholder="client"
                          ></input>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">Customer Ref</label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="customer_ref"
                            className="w-100 border p-2 rounded "
                            placeholder="customer Refrence"
                          ></input>
                          <p className="text-danger">{error.customer_ref}</p>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">
                            Goods Description
                          </label>
                          <input
                            type="text"
                            onChange={handlechange}
                            name="goods_desc"
                            placeholder="Goods Description"
                            className="w-100 border p-2 rounded mb-3"
                          ></input>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">Destination</label>
                          <input
                            type="text"
                            name="destination"
                            placeholder="destination"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded mb-3"
                          ></input>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal ">
                            Port of Entry
                          </label>
                          <select
                            onChange={handlechange}
                            placeholder="Port Of Entry"
                            name="port_of_entry"
                            className="w-100 border mb-3 rounded p-2 bg-white"
                          >
                            <option>Select...</option>
                            <option>Durban</option>
                            <option>Johannesburg</option>
                            <option>OR Tambo</option>
                            <option>Capetown</option>
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-12">
                          <label className="fs-5 fw-normal">Port of Exit</label>
                          <input
                            type="text"
                            name="port_of_exit"
                            placeholder="Port Of Exit"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded mb-3"
                          ></input>
                        </div>

                        <div className="col-lg-12">
                          <label className="fs-5 fw-normal">
                            Clearing Result
                          </label>
                          <input
                            type="text"
                            name="clearing_result"
                            placeholder="Clearing Result"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded mb-3"
                          ></input>
                        </div>
                        <div className="col-lg-6 ">
                          <label className="fs-5 fw-normal">
                            Clearing Agent
                          </label>
                          <select
                            name="clearing_agent"
                            onChange={handlechange}
                            placeholder="Clearing Agent"
                            className="w-100 border mb-3 rounded p-2 mx-2 bg-white"
                          >
                            <option>Select...</option>
                            <option>Amanda</option>
                            <option>Mbedzi</option>
                            <option>Kethu</option>
                            <option>Sia</option>
                            <option>Shingi</option>
                            <option>Dolly</option>
                            <option>CARRIER</option>
                          </select>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">
                            Document Required
                          </label>
                          <select
                            className="w-100 mb-3 border rounded p-2 bg-white"
                            onChange={handlechange}
                            name="document_req"
                          >
                            <option>Select...</option>
                            <option>Not Rquired</option>
                            <option>ITAC</option>
                            <option>Other</option>
                            <option>Documents Required</option>
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6">
                          {" "}
                          <label className="fs-5 fw-normal">
                            Clearing status
                          </label>
                          <select
                            className="w-100 mb-3 border rounded py-2 bg-white"
                            onChange={handlechange}
                            name="clearing_status"
                          >
                            <option>Select...</option>
                            <option>Pending</option>
                            <option>Success</option>
                            <option>Failed</option>
                          </select>
                        </div>

                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">
                            Document Upload
                          </label>
                          <input
                            type="file"
                            name="document"
                            onChange={handECHlhange}
                            className="w-100 border p-1 rounded"
                            required
                          ></input>
                          <p className="text-danger">{error.document}</p>
                        </div>
                      </div>

                      <div className="row ">
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal"> SAD500</label>
                          <input
                            type="file"
                            onChange={handECHlhange2}
                            name="sad500"
                            className="w-100 border p-1 rounded mb-3"
                            required
                          ></input>
                        </div>
                        <div className="col-lg-6">
                          <label className="fs-5 fw-normal">
                            {" "}
                            Comment on Docs
                          </label>
                          <input
                            type="text"
                            name="comment_on_docs"
                            placeholder="Comment on Docs"
                            onChange={handlechange}
                            className="w-100 border p-2 rounded mb-3"
                          ></input>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleclick}
                        className="btn btn-primary"
                      >
                        save
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
                <div>
                  <table className="table table-striped">
                    <tbody style={{ border: "none" }}>
                      {constgetdata &&
                        constgetdata.length > 0 &&
                        constgetdata.map((item, index) => {
                          return (
                            <>
                              <tr>
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
                                            {item?.port_of_entry_name}
                                          </p>
                                          <div className="arrow">
                                            <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                          </div>
                                          <p className="origin">
                                            {item?.port_of_exit_name}
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
                                                onClick={() => {
                                                  handleclicknva(item.id);
                                                }}
                                              >
                                                <VisibilityIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                View
                                              </a>
                                              {/* <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclicedit(item.id);
                                                }}
                                              >
                                                <p
                                                  // class="btn btn-primary"
                                                  data-bs-toggle="modal"
                                                  data-bs-target="#exampleModal"
                                                >
                                                  Edit
                                                </p>
                                              </a> */}

                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() =>
                                                  handleclicedit(item.id)
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
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handlelcickdelete(item.id);
                                                }}
                                              >
                                                <AiFillDelete
                                                  className="text-danger"
                                                  style={{
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    fontSize: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Delete
                                              </a>
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclickdecli(item.id);
                                                }}
                                              >
                                                <CancelIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Declined
                                              </a>
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclickaccc(item.id);
                                                }}
                                              >
                                                <CheckCircleIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Accepted
                                              </a>
                                              {/* <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclickaccname(item.id);
                                                }}
                                              >
                                                <CalculateIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Calculate Estimate
                                              </a> */}
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclickaccname123234(
                                                    item
                                                  );
                                                }}
                                              >
                                                <CalculateIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Edit Estimate
                                              </a>
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handlelcsendid(item);
                                                }}
                                              >
                                                <AssignmentTurnedIn
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Assign Clearance
                                              </a>
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleModal(item.id);
                                                }}
                                              >
                                                <CalculateIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Attach Quote
                                              </a>
                                              <a
                                                className="dropdown-item li_icon"
                                                onClick={() => {
                                                  handleclickaccname123(item);
                                                }}
                                              >
                                                <SwapHorizontalCircleIcon
                                                  style={{
                                                    color: "rgb(27 34 69)",
                                                    marginRight: "10px",
                                                    width: "20px",
                                                    cursor: "pointer",
                                                  }}
                                                />
                                                Move to order
                                              </a>
                                              <a className="dropdown-item li_icon">
                                                {item.bill_of_lading ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.bill_of_lading}`}
                                                  >
                                                    <ReceiptIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.arrival_notification ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.arrival_notification}`}
                                                  >
                                                    <AddAlertIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.letter_of_authority ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.letter_of_authority}`}
                                                  >
                                                    <MarkEmailReadIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.packing_list ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.packing_list}`}
                                                  >
                                                    <ReceiptLongIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.product_brochures ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.product_brochures}`}
                                                  >
                                                    <LocalLibraryIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.product_literature ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.product_literature}`}
                                                  >
                                                    <Inventory2Icon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.proof_of_payment ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.proof_of_payment}`}
                                                  >
                                                    <PaidIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.supplier_invoice ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.supplier_invoice}`}
                                                  >
                                                    <ReceiptIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                                {item.waybill ? (
                                                  <a
                                                    href={`${process.env.REACT_APP_BASE_URLdocument}${item.waybill}`}
                                                  >
                                                    <TollIcon
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                        height: "20px",
                                                      }}
                                                    />
                                                  </a>
                                                ) : (
                                                  ""
                                                )}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <div className="">
                                      <p
                                        type="radio"
                                        className="input_user mb-0"
                                      />
                                      <label className="status">
                                        {item?.quotation_status == "0" ? (
                                          <div className="d-flex align-items-center">
                                            <span className="dot bg-secondary me-2"></span>
                                            <p className="text-secondary mb-0">
                                              Pending
                                            </p>
                                          </div>
                                        ) : item.quotation_status == "1" ? (
                                          <div className="d-flex align-items-center">
                                            <span className="dot bg-success me-2"></span>
                                            <p className="text-success mb-0">
                                              Accepted
                                            </p>
                                          </div>
                                        ) : item.quotation_status == "2" ? (
                                          <div className="d-flex align-items-center">
                                            <span className="dot bg-info me-2"></span>
                                            <p className="text-info mb-0">
                                              Declined
                                            </p>
                                          </div>
                                        ) : item.quotation_status == "3" ? (
                                          <div className="d-flex align-items-center">
                                            <span className="dot bg-success me-2"></span>
                                            <p className="text-success mb-0">
                                              Ordered
                                            </p>
                                          </div>
                                        ) : item.quotation_status == "4" ? (
                                          <div className="d-flex align-items-center">
                                            <span className="dot bg-success me-2"></span>
                                            <p className="text-success mb-0">
                                              Estimated
                                            </p>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </label>
                                    </div>
                                    <div>{item?.assigned_supplier_name}</div>
                                  </div>
                                </td>

                                <div
                                  className="modal fade modalManageFreight modal_user "
                                  id="staticBackdrop"
                                  data-bs-backdrop="static"
                                  data-bs-keyboard="false"
                                  tabIndex={-1}
                                  aria-labelledby="staticBackdropLabel"
                                  aria-hidden="true"
                                ></div>
                              </tr>
                            </>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="text-center d-flex justify-content-end align-items-center">
                <button
                  disabled={currentPage === 1}
                  className="bg_page"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i class="fi fi-rr-angle-small-left page_icon"></i>
                </button>
                <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  disabled={currentPage === totalPages}
                  className="bg_page"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i class="fi fi-rr-angle-small-right page_icon"></i>
                </button>
              </div>
              <ToastContainer />
            </div>
          </div>
          <Modal
            open={isModalOpen1}
            onClose={handleCloseModal1}
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
                  xs: "95%",   // mobile
                  sm: "80%",   // tablet
                  md: "60%",   // small laptop
                  lg: "40%",   // desktop
                },

              }}
            >
              <div className="modal-header">
                <h2 id="modal-modal-title">Filter</h2>
                <button className="btn btn-close" onClick={handleCloseModal1}>
                  <CloseIcon />
                </button>
              </div>

              <div className="newModalGap">
                <h6>Attach Quote</h6>
                <input
                  type="file"
                  className="border px-3 rounded py-2 my-2 w-100"
                  onChange={handleCloseModal1}
                ></input>
                <div className="text-center mt-3">

                  <button
                    className="blueBtn"

                    variant="contained"
                    onClick={postData123}
                  >
                    Apply
                  </button>
                </div>

              </div>
            </Box>
          </Modal>
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
              <div className="newModalGap">
                {/* <div className="col-md-6">
                  <label>Delivery Type</label>
                  <select
                    name="type"
                    onChange={handlechange}
                    className="form-control"
                  >
                    <option value="">Select</option>
                    <option value="express">Express</option>
                    <option value="normal">Consolidation</option>
                  </select>
                </div> */}
                {/* <div className="col-md-6">
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
                </div> */}

                <div className="row g-2">
                  <div className="col-md-6">
                    <label>Country of Origin</label>
                    <select
                      name="origin"
                      onChange={handlechange}
                      className="form-control"
                    >
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
                    <select
                      name="destination"
                      onChange={handlechange}
                      className="form-control"
                    >
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
                    <select
                      name="freight"
                      onChange={handlechange}
                      className="form-control"
                    >
                      <option value="">Select...</option>
                      <option value="Sea">Sea</option>
                      <option value="Air">Air</option>
                      <option value="Road">Road</option>
                    </select>
                  </div>
                  {/* <div className="col-md-6">
                      <label>freight Type </label>
                      <select
                        name="type"
                        onChange={handlechange}
                        className="form-control"
                      >
                        <option value="">Select...</option>
                        <option value="express">Express</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div> */}
                </div>
                <div className="text-center">
                  <button className="blueBtn mt-3" variant="contained" onClick={postData}>
                    Apply
                  </button>

                </div>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </>
  );
}
