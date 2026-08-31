import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import RoomIcon from "@mui/icons-material/Room";
import CloseIcon from "@mui/icons-material/Close";
import { CopyAll } from "@mui/icons-material";
import Swal from "sweetalert2";
import PrintIcon from "@mui/icons-material/Print";

export default function Batches() {
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  const [hasPermission, setHasPermission] = useState(null);

  const [datauser, setDatauser] = useState([]);
  const [countruies, setCountruies] = useState([]);
  const [apidata, setApidata] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});
  const [dateStart, setDateStart] = useState("");
  const [querry, setQuerry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [file, setFile] = useState(null);
  const [inputdata, setInputdata] = useState([]);
  const [loader, setLoader] = useState(false);
  const [pagenationData, setPagenationData] = useState(1);
  const [selectedimage, setSelectedimage] = useState(null);
  const [activeTab, setActiveTab] = useState("shift");
  const navigate = useNavigate();
  const handlecjhaneg = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  const handlePageChange = (currentData) => {
    setCurrentPage(currentData);
  };
  const getdata = async () => {
    setLoader(true);
    const payload = {
      page: 1,
      limit: 10000,
      search: querry,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}NewGetAllBatch`,
        payload
      );
      let allItems = [];
      if (response.data && response.data.data) {
        allItems = [...response.data.data];
        const totalItems = response.data.total || response.data.data.length;
        const limitReturned = response.data.limit || 10;

        if (allItems.length < totalItems && limitReturned < totalItems) {
          const totalPagesCount = Math.ceil(totalItems / limitReturned);
          const promises = [];
          for (let p = 2; p <= totalPagesCount; p++) {
            promises.push(
              axios.post(
                `${process.env.REACT_APP_BASE_URL}NewGetAllBatch`,
                { ...payload, page: p, limit: limitReturned }
              )
            );
          }
          if (promises.length > 0) {
            const results = await Promise.all(promises);
            results.forEach((res) => {
              if (res.data && res.data.data) {
                allItems = [...allItems, ...res.data.data];
              }
            });
          }
        }
      }
      setDatauser(allItems);
      setPagenationData(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoader(false);
    }
  };
  const checkPermission = async () => {
    try {
      setLoader(true);
      if (!userid || !usertype) {
        setHasPermission(false);
        return;
      }
      const checkPost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/Admin/Batches",
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
      setLoader(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasPermission !== true) return;
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      getdata();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [querry, hasPermission]);
  const openModal = () => {
    navigate("/Admin/AddBatch");
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handlechnage = (e) => {
    const value = e.target.value;
    setQuerry(value);
  };
  const handlekey = (e) => {
    if (e.charCode < 48 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  const openModal1 = () => {
    setIsModalOpen1(true);
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
  const openModal2 = (id) => {
    const datata = datauser.filter((item) => {
      return item.id === id;
    });
    console.log(datata[0]);
    const userdtata = datata[0];
    setInputdata(userdtata);
    setDateStart(userdtata.date_first_received);
    setIsModalOpen2(true);
  };
  const closeModal2 = () => {
    setIsModalOpen2(false);
  };
  const handleupdateapi = (e) => {
    const { name, value } = e.target;
    setInputdata((prevData) => ({
      ...prevData,
      [name]:
        name === "date_first_received" && value
          ? new Date(value).toISOString()
          : value,
    }));
  };
  const postData = () => {
    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      console.log("asdfhdfh");
      axios
        .post(`${process.env.REACT_APP_BASE_URL}UploadExcelBatch`, formdata)
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

  const handleclickdelete = async (id) => {
    try {
      const datapost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/deleteBatche",
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      if (permission.data.success === true) {
        console.log("Deleting batch with ID:", id);

        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Do you want to delete this Order?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          try {
            const response = await axios.post(
              `${process.env.REACT_APP_BASE_URL}deleteBatche`,
              { batch_id: id },
            );
            if (response.data.success) {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: response?.data?.message || "batch Deleted successfully.",
                confirmButtonColor: "#3085d6",
              });
              getdata();
            } else {
              toast.error(response.data.message || "Failed to delete batch");
            }
          } catch (error) {
            console.error("Error deleting batch:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: error?.response?.data?.message || "Something went wrong!",
              confirmButtonColor: "#d33",
            });
            if (error.response && error.response.status === 400) {
              toast.error(
                error.response.data.message ||
                "Permission Denied: You don’t have access to delete this batch",
              );
            } else {
              toast.error("Something went wrong while deleting the batch.");
            }
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
  const postData1234 = () => {
    const data123 = {
      date_created: formattedDate,
      batch_id: inputdata.id,
      batch_number: inputdata.batch_number,
      warehouse_id: inputdata.warehouse_id,
      date_first_received: inputdata.date_first_received,
      ETD: inputdata.ETD,
      total_days_storage: inputdata.total_days_storage,
      batch_name: inputdata.batch_name,
      is_exporImport: inputdata.is_exporImport,
      freight: inputdata.freight,
      freight_option: inputdata.freight_option,
      freight_speed: inputdata.freight_speed,
      collection_warehouse: inputdata.collection_warehouse,
      delivery_warehouse: inputdata.delivery_warehouse,
      origin_country_id: inputdata.origin_country_id,
      detination_country_id: inputdata.detination_country_id,
      port_loading: inputdata.port_loading,
      port_discharge: inputdata.port_discharge,
      collection_address: inputdata.collection_address,
      delivery_address: inputdata.delivery_address,
      origin_handler: inputdata.origin_handler,
      des_handler: inputdata.des_handler,
      costs_to_collect: inputdata.costs_to_collect,
      warehouse_cost: inputdata.warehouse_cost,
      origin_doc_costs: inputdata.origin_doc_costs,
      origin_oncarriage_costs: inputdata.origin_oncarriage_costs,
      origin_Incidental_costs: inputdata.origin_Incidental_costs,
      costs_to_collect_des: inputdata.costs_to_collect_des,
      warehouse_cost_des: inputdata.warehouse_cost_des,
      des_doc_costs: inputdata.des_doc_costs,
      des_oncarriage_costs: inputdata.des_oncarriage_costs,
      des_Incidental_costs: inputdata.des_Incidental_costs,
      freight_cost: inputdata.freight_cost,
      no_of_shipments: inputdata.no_of_shipments,
      nature_of_good: inputdata.nature_of_good,
      type_of_packaging: inputdata.type_of_packaging,
      total_boxes: inputdata.total_boxes,
      volumentric_weight: inputdata.volumentric_weight,
      total_weight: inputdata.total_weight,
      total_dimensions: inputdata.total_dimensions,
      master_waybill: inputdata.master_waybill,
      house_waybill: inputdata.house_waybill,
      carrier: inputdata.carrier,
      vessel: inputdata.vessel,
      container_no: inputdata.container_no,
      devy_port_of_loading: inputdata.devy_port_of_loading,
      devy_port_of_discharge: inputdata.devy_port_of_discharge,
      devy_final_des: inputdata.devy_final_des,
      origin_carrier: inputdata.origin_carrier,
      des_carrier: inputdata.des_carrier,
      registration_number: inputdata.registration_number,
      comment: inputdata.comment,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}editBatch`, data123)
      .then((response) => {
        if (response.data.success === true) {
          getdata();
          closeModal2();
          toast.success(response.data.message);
          console.log(response.data);
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handleclickid = (id, st) => {
    console.log(id);
    const datta = datauser.filter((item) => {
      return item.id === id;
    });
    console.log(datta[0]);
    navigate("/Admin/BatchesOrder", { state: { data: datta[0] } });
  };
  useEffect(() => {
    if (hasPermission === true) {
      getcountry();
    }
  }, [hasPermission]);
  const getcountry = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}GetCountries`)
      .then((response) => {
        setCountruies(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.data);
      });
  };
  const handlegetstatus = (e, item) => {
    handlefunctioncahnge(e, item);
    console.log(item);
  };
  const handlefunctioncahnge = (e, item) => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}UpdateOrderFromBatch`, {
        batch_id: item.id,
        status: e.target.value,
      })
      .then((response) => {
        if (response.data.success === true) {
          getdata();
          toast.success(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handechangeimage = (e) => {
    const file = e.target.files[0];
    setSelectedimage(file);
  };

  const copy1 = async (id) => {
    console.log(id);

    const dataget = datauser.filter((item) => {
      return item.id === id;
    });
    navigate("/Admin/AddBatch", { state: { data: dataget[0] } });
    console.log(dataget[0]);
  };

  const track = async (id) => {
    try {
      const datapost = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/Admin/Trackbatch",
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      console.log(permission);
      if (permission.data.success === true) {
        navigate("/Admin/Trackbatch", { state: { data: id } });
      } else {
        toast.error("Access Denied");
      }
    } catch (error) {
      toast.error("permission denied");
    }
  };
  const track123 = async (item) => {
    try {
      const postdata = {
        staff_id: userid,
        user_type: usertype,
        route_url: "/AssignBatchToClearing",
      };

      // Await permission check response
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        postdata,
      );

      if (permission.data.success === true) {
        const payload = {
          batch_id: item.id,
        };

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}AssignBatchToClearing`,
            payload,
          );

          if (response.data.success) {
            toast.success(
              response.data.message || "Batch assigned successfully",
            );
          } else {
            toast.error(response.data.message || "Failed to assign batch");
          }
        } catch (error) {
          console.error("Error assigning batch:", error);
          if (error.response && error.response.status === 400) {
            toast.error(
              error.response.data.message ||
              "Permission Denied: You don’t have access to this action",
            );
          } else {
            toast.error("Something went wrong while assigning the batch.");
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

  useEffect(() => {
    getwarehouse();
  }, []);
  const getwarehouse = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getWarehouse`)
      .then((response) => {
        console.log(response.data);
        setApidata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;

  const filteredData = datauser
    ? datauser.filter((item) => {
      const isGoodsInTransit =
        item.track_status?.toLowerCase() === "goods are in transit";
      if (isGoodsInTransit) {
        return activeTab === "unshift";
      }
      const hasTrackStatus = !!item.track_status;
      return activeTab === "shift" ? hasTrackStatus : !hasTrackStatus;
    })
    : [];

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const displayedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredData.length, totalPages, currentPage]);

  return (
    <>
      {loader || hasPermission === null ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p className="loader-text">Loading...</p>
        </div>
      ) : hasPermission === false ? (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row manageFreight">
              <div className="col-12">
                <h4 className="freight_hd">Batches</h4>
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
            <div className="row">
              <div className=" manageFreight">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="freight_hd">Batches</h4>
                    </div>
                    <div className="d-flex align-items-center justify-content-end">
                      <div className="me-2 searchManageFre">
                        <input
                          class="py-1 rounded ps-1"
                          type="text"
                          placeholder="Search"
                          id="outlined-basic"
                          value={querry}
                          onChange={handlechnage}
                        />
                      </div>
                      <div>
                        <Button
                          variant="contained"
                          className="btn_batch"
                          onClick={openModal}
                        >
                          Add Batch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item" style={{ cursor: "pointer" }}>
                  <a
                    className={`nav-link ${activeTab === 'shift' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                    onClick={() => {
                      setActiveTab('shift');
                      setCurrentPage(1);
                    }}
                  >
                    Shipped
                  </a>
                </li>
                <li className="nav-item" style={{ cursor: "pointer" }}>
                  <a
                    className={`nav-link ${activeTab === 'unshift' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                    onClick={() => {
                      setActiveTab('unshift');
                      setCurrentPage(1);
                    }}
                  >
                    Unshipped
                  </a>
                </li>
              </ul>
              <div className="table-responsive mt-4">
                {loader ? (
                  <div className="loader-container" style={{ height: "40vh", background: "transparent" }}>
                    <div className="loader"></div>
                    <p className="loader-text">Updating... This may take some time</p>
                  </div>
                ) : (
                  <TableContainer className="table table-striped tableICon">
                    <Table className="batch_table">
                      <TableHead>
                        <TableRow className="border-bottom">
                          <TableCell className="fw-bold">Batch No.</TableCell>
                          <TableCell className="fw-bold">Freight</TableCell>
                          <TableCell className="fw-bold">Dim.</TableCell>
                          <TableCell className="fw-bold">Weight</TableCell>
                          <TableCell className="fw-bold">Packages</TableCell>
                          <TableCell className="fw-bold col-1">Origin</TableCell>
                          <TableCell className="fw-bold">Destination</TableCell>
                          <TableCell className="fw-bold">
                            Forwarding Agent
                          </TableCell>
                          <TableCell className="fw-bold">Total Freight</TableCell>
                          <TableCell className="fw-bold col-3">Status</TableCell>
                          <TableCell className="fw-bold">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedData &&
                          displayedData.length > 0 &&
                          displayedData.map((item, index) => {
                            const isDisabled =
                              !!item.track_status &&
                              item.track_status?.toLowerCase() !== "goods are in transit"; // 🔥 important

                            return (
                              <TableRow
                                key={index + 1}
                                className="border-bottom"
                                style={{
                                  backgroundColor: isDisabled ? "#f5f5f5" : "",
                                }}
                              >
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.batch_number}</TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.freight}</TableCell>

                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.total_freight_dimension}</TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.total_freight_weight}</TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.total_freight_packages}</TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }} className="col-1">
                                  {item?.origin_country_name}
                                </TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.des_country_name}</TableCell>
                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item?.forwarding_agent}</TableCell>

                                {/* 🔒 Disable row click */}
                                <TableCell style={{
                                  cursor: isDisabled ? "not-allowed" : "pointer", color: isDisabled ? "#999" : ""
                                }}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      handleclickid(item.id);
                                    }
                                  }}
                                >
                                  {item?.count_freight}
                                </TableCell>

                                <TableCell style={{ color: isDisabled ? "#999" : "" }}>{item.track_status}</TableCell>

                                {/* <div className="dropdown">
            <a
              href="#"
              type="button"
              className="act_btn dropdown-toggle mb-3"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={(e) => e.preventDefault()}
            >
              Action
            </a>

            <div className="dropdown-menu">
              <a className="dropdown-item det_page">
                <ul className="p-0 m-0">

                  {/* ✅ ALWAYS ALLOWED */}
                                {/* <li
                    className="page_list"
                    style={{ cursor: "pointer", fontSize: "15px" }}
                    onClick={() => handleclickid(item.id)}
                  >
                    <RemoveRedEyeIcon /> View Details
                  </li>

                  <li
                    className="page_list"
                    style={{ cursor: "pointer", fontSize: "15px" }}
                    onClick={() => openModal2(item.id)}
                  >
                    <ContentCopyIcon /> Edit Batch
                  </li>

                  {/* ❌ DISABLED WHEN STATUS EXISTS */}
                                {/* <li
  className="page_list"
  style={{
    cursor: isDisabled ? "not-allowed" : "pointer",
    fontSize: "15px",
    color: isDisabled ? "#999" : "#000",
    pointerEvents: isDisabled ? "none" : "auto",
  }}
  onClick={() => {
    if (!isDisabled) copy1(item?.id);
  }}
>
  <CopyAll /> Copy
</li>

                  <li
                    className="page_list"
                    style={{
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      fontSize: "15px",
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                    onClick={() => {
                      if (!isDisabled) track(item?.id);
                    }}
                  >
                    <RoomIcon /> Track Batch
                  </li>

                  <li
                    className="page_list"
                    style={{
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      fontSize: "15px",
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                    onClick={() => {
                      if (!isDisabled) track123(item);
                    }}
                  >
                    <WarehouseIcon /> Assign Clearing
                  </li>

                  <li
                    className="page_list"
                    style={{
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      fontSize: "15px",
                      opacity: isDisabled ? 0.5 : 1,
                    }}
                    onClick={() => {
                      if (!isDisabled) handleclickdelete(item?.id);
                    }}
                  >
                    <DeleteIcon /> Delete Batch
                  </li>

                </ul>
              </a>
            </div>
          </div> */}
                                <div className="dropdown">
                                  <a
                                    href="#"
                                    type="button"
                                    className="act_btn dropdown-toggle mb-3"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    Action
                                  </a>

                                  <div className="dropdown-menu">
                                    <a className="dropdown-item det_page">
                                      <ul className="p-0 m-0">

                                        {/* ✅ ALWAYS SHOW */}
                                        <li
                                          className="page_list"
                                          style={{ cursor: "pointer", fontSize: "15px" }}
                                          onClick={() => handleclickid(item.id)}
                                        >
                                          <RemoveRedEyeIcon /> View Details
                                        </li>

                                        <li
                                          className="page_list"
                                          style={{ cursor: "pointer", fontSize: "15px" }}
                                          onClick={() => openModal2(item.id)}
                                        >
                                          <ContentCopyIcon /> Edit Batch
                                        </li>

                                        <li
                                          className="page_list"
                                          style={{ cursor: "pointer", fontSize: "15px" }}
                                          onClick={() => track(item?.id)}
                                        >
                                          <RoomIcon /> Track Batch
                                        </li>

                                        <li
                                          className="page_list"
                                          style={{ cursor: "pointer", fontSize: "15px" }}
                                          onClick={() => navigate("/Admin/batch-report", { state: { batchId: item.id } })}
                                        >
                                          <PrintIcon /> Batch Report
                                        </li>

                                        {/* ❌ SHOW ONLY WHEN NOT DISABLED */}
                                        {!isDisabled && (
                                          <>
                                            <li
                                              className="page_list"
                                              style={{ cursor: "pointer", fontSize: "15px" }}
                                              onClick={() => copy1(item?.id)}
                                            >
                                              <CopyAll /> Copy
                                            </li>

                                            <li
                                              className="page_list"
                                              style={{ cursor: "pointer", fontSize: "15px" }}
                                              onClick={() => track123(item)}
                                            >
                                              <WarehouseIcon /> Assign Clearing
                                            </li>

                                            <li
                                              className="page_list"
                                              style={{ cursor: "pointer", fontSize: "15px" }}
                                              onClick={() => handleclickdelete(item?.id)}
                                            >
                                              <DeleteIcon /> Delete Batch
                                            </li>
                                          </>
                                        )}

                                      </ul>
                                    </a>
                                  </div>
                                </div>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
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
                  <h2 id="modal-modal-title">Add Excel</h2>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="mb-3 border ps-2 py-2 rounded w-100"
                    style={{ display: "block" }}
                  />
                  <Button variant="contained" onClick={postData}>
                    Submit
                  </Button>
                </Box>
              </Modal>


              <div className="text-center d-flex justify-content-end align-items-center mt-3">
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
            </div>
            <Modal
              open={isModalOpen2}
              onClose={closeModal2}
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
                }}
              >
                <div className="modal-header">
                  <h2 id="modal-modal-title">Update Batch</h2>
                  <button className="btn btn-close" onClick={closeModal2}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="newModalGap">
                  <div className="row manageFreight">
                    <div className="col-12">
                      <div className="d-flex justify-content-center align-items-center">
                        <div></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className=" add_fre_cd">
                      <div className="row">
                        <div className="col-12 mt-3">
                          <h4 className="freight_hd mt-0">Shipment details</h4>
                          <span class="line"></span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="borderShip updateLoading">
                            <div className="row">
                              <div className="col-6">
                                <label>Date Created</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={formattedDate}
                                // name="date_created"
                                />
                              </div>
                              <div className="col-6">
                                <label>Date of First Received</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  onChange={handleupdateapi}
                                  name="date_of_first_received"
                                  value={
                                    inputdata?.date_of_first_received
                                      ? new Date(
                                        inputdata.date_of_first_received,
                                      )
                                        .toISOString()
                                        .split("T")[0]
                                      : ""
                                  }
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12">
                                <label>Total Days in Storage</label>
                                <input
                                  type="text"
                                  name="total_days_storage"
                                  onChange={handleupdateapi}
                                  value={inputdata.total_days_storage}
                                  placeholder="Num of Days"
                                  className="form-control"
                                ></input>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>You are</label>
                                <div className="shipRefer1">
                                  <input
                                    type="radio"
                                    style={{ cursor: "pointer" }}
                                    id="collectOne1"
                                    name="is_exporImport"
                                    value="Exporting"
                                    checked={
                                      inputdata.is_exporImport === "Exporting"
                                    }
                                    onChange={handleupdateapi}
                                  />
                                  <label htmlFor="collectOne1">Exporting</label>

                                  <input
                                    type="radio"
                                    style={{ cursor: "pointer" }}
                                    id="collectTwo1"
                                    name="is_exporImport"
                                    value="Importing"
                                    checked={
                                      inputdata.is_exporImport === "Importing"
                                    }
                                    onChange={handleupdateapi}
                                  />
                                  <label htmlFor="collectTwo1">Importing</label>
                                </div>
                              </div>
                              <div className="col-6">
                                <label>Freight Type</label>
                                <select
                                  name="freight"
                                  value={inputdata.freight}
                                  onChange={handleupdateapi}
                                >
                                  <option value="">Select</option>
                                  <option value="Sea">Sea</option>
                                  <option value="Air">Air</option>
                                  <option value="Road">Road</option>
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Batch Reference</label>
                                <input
                                  type="text"
                                  placeholder="Batch Reference"
                                  value={inputdata.batch_number}
                                  onChange={handleupdateapi}
                                  name="batch_number"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Batch Name</label>
                                <input
                                  type="text"
                                  className="w-100 rounded"
                                  name="batch_name"
                                  value={inputdata.batch_name}
                                  placeholder="Batch Name"
                                  onChange={handleupdateapi}
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12">
                                <label>Freight Speed</label>
                                <select
                                  name="freight_speed"
                                  value={inputdata.freight_speed}
                                  onChange={handleupdateapi}
                                >
                                  <option value="">Select</option>
                                  <option value="Express">Express</option>
                                  <option value="Normal">Normal</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className="col-12 mt-3">
                          <h4 className="freight_hd">Location Details</h4>
                          <span class="line"></span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="borderShip updateLoading noFormaControl">
                            <div className="row">
                              <div className="col-6">
                                <label>Collection from (Warehouse Name)</label>
                                <select
                                  name="collection_warehouse"
                                  value={inputdata.collection_warehouse}
                                  onChange={handleupdateapi}
                                  placeholder="Collection From Warehouse"
                                >
                                  <option>Select...</option>
                                  {apidata &&
                                    apidata.length > 0 &&
                                    apidata.map((item, index) => {
                                      console.log(item);
                                      return (
                                        <>
                                          <option key={index} value={item.id}>
                                            {item.warehouse_name}
                                          </option>
                                        </>
                                      );
                                    })}
                                </select>
                              </div>
                              <div className="col-6">
                                <label> Delivery to (Warehouse Name)</label>
                                <select
                                  name="delivery_warehouse"
                                  value={inputdata.delivery_warehouse}
                                  onChange={handleupdateapi}
                                  placeholder="Collection From Warehouse"
                                >
                                  <option>Select...</option>
                                  {apidata &&
                                    apidata.length > 0 &&
                                    apidata.map((item, index) => {
                                      console.log(item);
                                      return (
                                        <>
                                          <option key={index} value={item.id}>
                                            {item.warehouse_name}
                                          </option>
                                        </>
                                      );
                                    })}
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Country of Origin</label>
                                <select
                                  name="origin_country_id"
                                  onChange={handleupdateapi}
                                  value={inputdata.origin_country_id}
                                >
                                  <option>Select</option>
                                  {countruies &&
                                    countruies.length > 0 &&
                                    countruies.map((item, index) => {
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
                              <div className="col-6">
                                <label> Destination Country</label>
                                <select
                                  name="detination_country_id"
                                  onChange={handleupdateapi}
                                  value={inputdata.detination_country_id}
                                >
                                  <option>Select</option>
                                  {countruies &&
                                    countruies.length > 0 &&
                                    countruies.map((item, index) => {
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
                            <div className="row">
                              <div className="col-6">
                                <label>Port of Loading</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  value={inputdata.port_loading}
                                  name="port_loading"
                                  placeholder="Port of Loading"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Port of Discharge</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  value={inputdata.port_discharge}
                                  name="port_discharge"
                                  placeholder="Port of Discharge"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Collection Address</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="collection_address"
                                  value={inputdata.collection_address}
                                  placeholder="Place of Delivery"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Delivery Address</label>
                                <input
                                  name="delivery_address"
                                  value={inputdata.delivery_address}
                                  placeholder="Delivery Address"
                                  className="form-control"
                                  onChange={handleupdateapi}
                                ></input>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label className="ware_label">
                                  Origin Handler
                                </label>
                                <select
                                  className=" mb-3 py-2"
                                  name="origin_handler"
                                  value={inputdata.origin_handler}
                                  onChange={handleupdateapi}
                                >
                                  <option>Select...</option>
                                  <option>DHL</option>
                                  <option>Fedex</option>
                                  <option>SACO CFR</option>
                                  <option>Contra Consolidations</option>
                                  <option>Afristar</option>
                                  <option>Asia Direct - Africa</option>
                                </select>
                              </div>
                              <div className="col-6">
                                <label className="ware_label">
                                  Destination Handler
                                </label>
                                <select
                                  className="mb-3 py-2"
                                  name="des_handler"
                                  onChange={handleupdateapi}
                                  value={inputdata.des_handler}
                                >
                                  <option>Select...</option>
                                  <option>Shenzhen Nimbus Shipping</option>
                                  <option>Shenzhen Portline</option>
                                  <option>OBD Logistics</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className="col-12 mt-3">
                          <h4 className="freight_hd">Cost details</h4>
                          <span class="line"></span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="borderShip ">
                            <div className="row mb-3">
                              <div className="col-6">
                                <label className="mb-3 fs-bold fw-bold">
                                  Origin
                                </label>
                                <br />
                                <label>Cost to Collect</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="costs_to_collect"
                                  value={inputdata.costs_to_collect}
                                  placeholder="Cost to Collect"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label className="mb-3 fs-bold fw-bold">
                                  Destination
                                </label>
                                <br />
                                <label>Cost to Collect</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="costs_to_collect_des"
                                  value={inputdata.costs_to_collect_des}
                                  placeholder="Cost to Collect"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <label>Warehouse Cost</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="warehouse_cost"
                                  value={inputdata.warehouse_cost}
                                  placeholder="Warehouse Cost"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Warehouse Cost</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="warehouse_cost_des"
                                  value={inputdata.warehouse_cost_des}
                                  placeholder="Warehouse Cost"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <label>Documentation Costs</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="origin_doc_costs"
                                  value={inputdata.origin_doc_costs}
                                  placeholder="Documentation Costs"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Documentation Costs </label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="des_doc_costs"
                                  value={inputdata.des_doc_costs}
                                  placeholder="Documentation Costs"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <label>On carriage Costs</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="origin_oncarriage_costs"
                                  value={inputdata.origin_oncarriage_costs}
                                  placeholder="On carriage Costs"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>On carriage Costs</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  value={inputdata.des_oncarriage_costs}
                                  name="des_oncarriage_costs"
                                  placeholder="On carriage Costs"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <label>Incidental Cost</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="origin_Incidental_costs"
                                  value={inputdata.origin_Incidental_costs}
                                  placeholder="Incidental Cost"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Incidental Cost</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  name="des_Incidental_costs"
                                  value={inputdata.des_Incidental_costs}
                                  placeholder="Incidental Cost"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row mb-3">
                              <div className="col-6">
                                <label>Freight Cost</label>
                                <input
                                  type="text"
                                  value={inputdata.freight_cost}
                                  onChange={handleupdateapi}
                                  name="freight_cost"
                                  placeholder="Freight Cost"
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className="col-12 mt-3">
                          <h4 className="freight_hd">Cargo Details</h4>
                          <span class="line"></span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="borderShip updateLoading">
                            <div className="row">
                              <div className="col-6">
                                <label>Num. of Shipment</label>
                                <input
                                  name="no_of_shipments"
                                  onChange={handleupdateapi}
                                  value={inputdata.no_of_shipments}
                                  placeholder="Number of Shipment"
                                  className="form-control"
                                ></input>
                              </div>
                              <div className="col-6 ">
                                <label>Nature of Goods</label>
                                <select
                                  name="nature_of_goods"
                                  value={inputdata.nature_of_good}
                                  onChange={handleupdateapi}
                                >
                                  <option value="">Select...</option>
                                  <option value="General_Cargo">
                                    General Cargo
                                  </option>
                                  <option value="Battery">Battery</option>
                                  <option value="Liquids">Liquids</option>
                                  <option value="Powders">Powders</option>
                                  <option value="Harzadous">Harzadous</option>
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12">
                                <label>Type of Packing</label>
                                <select
                                  name="type_of_packaging"
                                  value={inputdata.type_of_packaging}
                                  onChange={handleupdateapi}
                                >
                                  <option>select...</option>
                                  <option value="Box">Box</option>
                                  <option value="Crate">Crate</option>
                                  <option value="Pallet">Pallet</option>
                                  <option value="Bags">Bags</option>
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Total Box</label>
                                <input
                                  type="text"
                                  onKeyPress={handlekey}
                                  name="total_boxes"
                                  value={inputdata.total_boxes}
                                  placeholder="Num.. of Package"
                                  onChange={handleupdateapi}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Total Dimension</label>
                                <input
                                  type="text"
                                  name="total_dimensions"
                                  value={inputdata.total_dimensions}
                                  onChange={handleupdateapi}
                                  placeholder="Dimension"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Total Weight</label>
                                <input
                                  type="text"
                                  name="total_weight"
                                  value={inputdata.total_weight}
                                  onChange={handleupdateapi}
                                  placeholder="Weight"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Volumetric Weight</label>
                                <input
                                  type="text"
                                  onKeyPress={handlekey}
                                  onChange={handleupdateapi}
                                  value={inputdata.volumentric_weight}
                                  name="volumentric_weight"
                                  placeholder="Volumetric Weight"
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className="col-12 mt-3">
                          <h4 className="freight_hd">Delivery details</h4>
                          <span class="line"></span>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="borderShip updateLoading">
                            <div className="row">
                              <div className="col-6">
                                <label>Master Waybill</label>
                                <input
                                  onChange={handleupdateapi}
                                  name="master_waybill"
                                  value={inputdata.master_waybill}
                                  className="form-control"
                                  placeholder="master_waybill"
                                ></input>
                              </div>
                              <div className="col-6 ">
                                <label>House Waybill</label>
                                <input
                                  onChange={handleupdateapi}
                                  name="house_waybill"
                                  value={inputdata.house_waybill}
                                  className="form-control"
                                  placeholder="house_waybill"
                                ></input>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Carrier</label>
                                <input
                                  type="text"
                                  name="carrier"
                                  placeholder="carrier"
                                  value={inputdata.carrier}
                                  onChange={handleupdateapi}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Vessel</label>
                                <input
                                  type="text"
                                  name="vessel"
                                  value={inputdata.vessel}
                                  onChange={handleupdateapi}
                                  placeholder="vessel"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12">
                                <label>Container Number / Flight Number</label>
                                <input
                                  type="text"
                                  name="container_no"
                                  value={inputdata.container_no}
                                  onChange={handleupdateapi}
                                  placeholder="Container_no"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Port of Loading</label>
                                <input
                                  type="text"
                                  value={inputdata.devy_port_of_loading}
                                  name="devy_port_of_loading"
                                  placeholder="Port of Loading"
                                  onChange={handleupdateapi}
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Port of Discharge</label>
                                <input
                                  type="text"
                                  name="devy_port_of_discharge"
                                  value={inputdata.devy_port_of_discharge}
                                  onChange={handleupdateapi}
                                  placeholder="Port_of_Discharge"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12">
                                <label>Final Destination</label>
                                <input
                                  type="text"
                                  name="devy_final_des"
                                  onChange={handleupdateapi}
                                  value={inputdata.devy_final_des}
                                  placeholder="Final Destination"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Origin Carrier</label>
                                <input
                                  type="text"
                                  name="origin_carrier"
                                  value={inputdata.origin_carrier}
                                  onChange={handleupdateapi}
                                  placeholder="Origin Carrier"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>Destination Carrier</label>
                                <input
                                  type="text"
                                  name="des_carrier"
                                  value={inputdata.des_carrier}
                                  onChange={handleupdateapi}
                                  placeholder="Destination carrier"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <label>Registration Number</label>
                                <input
                                  type="text"
                                  name="registration_number"
                                  onChange={handleupdateapi}
                                  value={inputdata.registration_number}
                                  placeholder="Registration Number"
                                  className="form-control"
                                />
                              </div>
                              <div className="col-6">
                                <label>comment </label>
                                <input
                                  type="text"
                                  name="comment"
                                  value={inputdata.comment}
                                  onChange={handleupdateapi}
                                  placeholder="Comment"
                                  className="form-control"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-4 unsetLt">
                    <Button
                      variant="contained"
                      className="submit_btn mt-3"
                      onClick={postData1234}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
        </div>
      )}
    </>
  );
}
