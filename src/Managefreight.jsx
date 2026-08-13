import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { AiFillDelete, AiFillMessage } from "react-icons/ai";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { useNavigate } from "react-router-dom";
import { MdDriveFileMoveOutline } from "react-icons/md";
import {
  Modal,
  Box,
  Button,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import Swal from "sweetalert2";
import SupportAgentSharpIcon from "@mui/icons-material/SupportAgentSharp";
import CloseIcon from "@mui/icons-material/Close";
const pageSize = 10;
export default function Managefreight() {
  const navigate = useNavigate();
  const [priority, setPriority] = useState({
    priority: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [is_active, setIs_active] = useState({
    is_active: "",
  });
  const [ready, setReady] = useState({
    ready: "",
  });
  const [loader, setLoader] = useState(true);
  const [options, setOptions] = useState();
  const [data, setData] = useState([]);
  const [data1, setData1] = useState([]);
  const [lcientlist, setLcientlist] = useState([]);
  const [openmodalAssignFreight, setOpenmodalAssignFreight] = useState(false);
  const [freightIdAssignTask, setFreightIdAssignTask] = useState(null);
  const [filedata1, setFiledata1] = useState(null);
  const [freigtid, setFreightId] = useState(null);
  const [status1, setStatus1] = useState("Status");
  const [staffdata, setStaffdata] = useState();
  const [updatedata, setUpdatedata] = useState([]);
  const [supplierName, setSupplierName] = useState([]);
  const [apidata, setApidata] = useState([]);
  const [getUSer, setGetUSer] = useState([]);
  const [staff, SetStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openmodal, setOpenmodal] = useState(false);
  const [pagenationdata, setPagenationdata] = useState(1);
  const [inputdata, setInputdata] = useState({
    freight_id: "",
    client_ref: "",
    type: "",
    freight: "",
    incoterm: "",
    dimension: "",
    weight: "",
    comment: "",
    no_of_packages: "",
    package_type: "",
    commodity: "",
    hazardous: "",
    country_of_origin: "",
    destination_country: "",
    insurance: "",
    supplier_address: "",
    port_of_loading: "",
    post_of_discharge: "",
    place_of_delivery: "",
    transit_time: "",
    shipment_details: "",
    nature_of_hazard: "",
    volumetric_weight: "",
    assign_for_estimate: "",
    assign_to_transporter: "",
    assign_warehouse: "",
    assign_to_clearing: "",
    shipment_ref: "",
    shipment_origin: "",
    shipment_des: "",
    priority: "",
    is_active: "",
    ready_for_collection: "",
    require_for_delivery: "",
    quote_received: "",
    client_ref_name: "",
    client_quoted: "",
    product_desc: "",
    send_to_warehouse: "",
    cargo_pickup: "",
    sales_representative: "",
  });
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
  useEffect(() => {
    getStaff();
    getstaff();
  }, []);

  const getStaff = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}staff-list`)
      .then((response) => {
        SetStaff(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  const [clientdata, setClientdata] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
  useEffect(() => {
    if (inputdata.priority) {
      setPriority(inputdata.priority);
    }
  }, [inputdata.priority]);
  useEffect(() => {
    updatecountry();
    getClient();
  }, []);
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;

  const getFreightWithoutpermission = async (page) => {
    const payload = { user_id: userid, user_type: usertype, page: page };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list`,
        payload,
      );
      console.log("frightDataresponse", response.data);
      setPagenationdata(response.data);
      setData(response.data.data);
    } catch (error) {
      setLoader(false);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const frightData = async (page) => {
    try {
      const postdata = {
        staff_id: userid,
        route_url: "/freight-list",
        user_type: usertype,
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        postdata,
      );
      console.log(permission);
      if (permission.data.success) {
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_BASE_URL}freight-list`,
            {
              user_id: userid,
              user_type: usertype,
              page: page,
              search: searchQuery,
            },
          );
          setLoader(false);
          console.log("frightDataresponse", response.data);
          setPagenationdata(response.data);
          setData(response.data.data);
        } catch (error) {
          setLoader(false);
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      setLoader(false);
      toast.error("You don't have permission to access this page");
    }
  };

  useEffect(() => {
    if (userid && usertype) {
      frightData(currentPage);
    }
  }, [userid, usertype, currentPage]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}supplier-list`,
        );
        setOptions(response.data.data);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    fetchData();
  }, []);
  /////////////////////////////////////////////////delete function//////////////////////////////////////////
  const handledelete = async (freight_id) => {
    const datapost = {
      staff_id: userid,
      route_url: "/delete-freight",
      user_type: usertype,
    };
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      datapost,
    );
    if (permission.data.success === true) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post(`${process.env.REACT_APP_BASE_URL}delete-freight`, {
              freight_id: freight_id,
            })
            .then((response) => {
              toast.success(response.data.message);
              frightData(currentPage);
            })
            .catch((error) => {
              toast.error(error.response.data.message);
            });
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
        }
      });
    } else {
      toast.error("You don't have permission to access this page");
    }
  };
  /////////////////////////////////////////update freight///////////////////////////////////////////
  const handleupdate = async (freight_id) => {
    console.log(freight_id);
    const payload = {
      freight_id: freight_id,
    };
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}freight-list-byId`,
        payload,
      );
      if (response?.data?.data?.length > 0) {
        console.log(response.data.data[0]);
        setInputdata(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching freight data by id:", error);
    }
  };
  const handleupdateapi = (e) => {
    const { name, value } = e.target;
    setInputdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  const handleupdateapipost = (freight_id) => {
    console.log(inputdata.client_ref);
    const formdata = new FormData();
    formdata.append("date", formattedDate);
    formdata.append("id", inputdata.freight_id);
    formdata.append("client_ref", inputdata.client_ref);
    formdata.append("type", inputdata.type);
    formdata.append("freight", inputdata.freight);
    formdata.append("incoterm", inputdata.incoterm);
    formdata.append("dimension", inputdata.dimension);
    formdata.append("weight", inputdata.weight);
    formdata.append("quote_received", inputdata.quote_received);
    formdata.append("client_quoted", inputdata.client_quoted);
    formdata.append("is_active", inputdata.is_active);
    formdata.append("destination_country", inputdata.destination_country);
    formdata.append("comment", inputdata.comment);
    formdata.append("no_of_packages", inputdata.no_of_packages);
    formdata.append("fcl_lcl", inputdata.fcl_lcl);
    formdata.append("package_type", inputdata.package_type);
    formdata.append("insurance", inputdata.insurance);
    formdata.append("commodity", inputdata.commodity);
    formdata.append("hazardous", inputdata.hazardous);
    formdata.append("country_of_origin", inputdata.country_of_origin);
    formdata.append("supplier_address", inputdata.supplier_address);
    formdata.append("port_of_loading", inputdata.port_of_loading);
    formdata.append("post_of_discharge", inputdata.post_of_discharge);
    formdata.append("place_of_delivery", inputdata.place_of_delivery);
    formdata.append("ready_for_collection", inputdata.ready_for_collection);
    formdata.append("require_for_delivery", inputdata.require_for_delivery);
    formdata.append("transit_time", inputdata.transit_time);
    formdata.append("priority", inputdata.priority);
    formdata.append("nature_of_hazard", inputdata.nature_of_hazard);
    formdata.append(
      "volumetric_weight",
      inputdata.dimension
        ? 167 * inputdata.dimension
        : inputdata.volumetric_weight
    );
    formdata.append("assign_for_estimate", inputdata.assign_for_estimate);
    formdata.append("add_attachments", inputdata.add_attachments);
    formdata.append("assign_to_transporter", inputdata.assign_to_transporter);
    formdata.append("assign_warehouse", inputdata.assign_warehouse);
    formdata.append("assign_to_clearing", inputdata.assign_to_clearing);
    formdata.append("shipment_ref", inputdata.shipment_ref);
    formdata.append("send_to_warehouse", inputdata.send_to_warehouse);
    formdata.append("shipment_origin", inputdata.shipment_origin);
    formdata.append("shipment_des", inputdata.shipment_des);
    formdata.append("product_desc", inputdata.product_desc);
    formdata.append("client_ref_name", inputdata.client_ref_name);
    formdata.append("cargo_pickup", inputdata.cargo_pickup);
    formdata.append("sales_representative", inputdata.sales_representative);
    formdata.append("documentName", inputdata.documentName);
    selectedDocs.forEach((doc) => {
      doc.files.forEach((file) => {
        formdata.append(doc.name, file);
        console.log("File:", file.name, "| Size:", file.size, "bytes");
      });
    });
    console.log(formdata);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}edit-freight`, formdata)
      .then((response) => {
        setLoader(true);
        console.log(response.data.message);
        if (response.data.success === true) {
          setLoader(false);
          frightData(currentPage);
          toast.success(response.data.message);
        }
        return 0;
      })
      .catch((error) => {
        console.error(error.response);
        toast.error(error.response?.data || "An error occurred");
      });
  };
  const clientlist = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}clientlist`)
      .then((response) => {
        setClientdata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  useEffect(() => {
    getapidata();
    clientlist();
  }, []);
  const getapidata = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getCommodities`)
      .then((response) => {
        setApidata(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlelcickseedata = (freight_id) => {
    const alldtaaa = data.filter((item) => {
      return item?.freight_id === freight_id;
    });
    // navigate("/Admin/MAnageFreightDetails", { state: { data: alldtaaa } });
    // const handlelcickseedata = (freight_id) => {
    navigate(`/Admin/MAnageFreightDetails/${freight_id}`);
    // };
  };
  const handlelcickseedata1212 = async (item) => {
    const datapost = {
      staff_id: userid,
      route_url: "/freight-list",
      user_type: usertype,
    };
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      datapost,
    );
    if (permission.data.success === true) {
      const payload = {
        freight_id: item?.freight_id,
      };
      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}AssignFreightToClearing`,
          payload,
        )
        .then((response) => {
          console.log(response.data);
          toast.success(response.data.message);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("You don't have permission to access this page");
    }
  };
  const hanldeclicknavi = async (freight_id) => {
    console.log(freight_id);
    JSON.stringify(localStorage.setItem("freightid", freight_id));
    try {
      // Filter the relevant data
      const alldata = data.filter((item) => item.freight_id === freight_id);
      console.log("Filtered Data:", alldata);
      const datapost = {
        staff_id: userid,
        route_url: "/Admin/shipping-estimate",
        user_type: usertype,
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      console.log("Permission Response:", permission.data);
      if (permission.data.success === true) {
        console.log(alldata);
        navigate("/Admin/shipping-estimate", { state: { data: alldata, fromPage: "/Admin/managefreight" } });
      } else {
        toast.error("You don't have permission to access this page");
      }
    } catch (error) {
      console.error("Permission Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Permission denied");
    }
  };

  const hanldeclicknavi2 = async (freight_id) => {
    console.log(freight_id);
    JSON.stringify(localStorage.setItem("freightid", freight_id));
    try {
      // Filter the relevant data
      const alldata = data.filter((item) => item.freight_id === freight_id);
      console.log("Filtered Data:", alldata);
      const datapost = {
        staff_id: userid,
        route_url: "/Admin/shipping-estimate-old",
        user_type: usertype,
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      console.log("Permission Response:", permission.data);
      if (permission.data.success === true) {
        console.log(alldata);
        navigate("/Admin/shipping-estimate-old", { state: { data: alldata } });
      } else {
        toast.error("You don't have permission to access this page");
      }
    } catch (error) {
      console.error("Permission Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Permission denied");
    }
  };
  const hanldeclicknavi11 = async (freight_id) => {
    console.log(freight_id);
    JSON.stringify(localStorage.setItem("freightid", freight_id));
    navigate("/Admin/SupplierEstimation", { state: { data: freight_id } });
  };
  ///////////////////////pegenation//////////////////////////////////////////
  const filteredData = data.filter((item) => {
    return (
      item?.type?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.client_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.cargo_pickup?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.product_desc?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.sales_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.collection_from_name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.nature_of_hazard
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.delivery_to_name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.freight?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.incoterm?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.freight?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.freight_number?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });
  // search //////////////////////////////////////////////////
  const totalPage = Math.ceil(pagenationdata.total / pagenationdata.limit);
  const startIndex = (currentPage - 1) * pagenationdata.limit;
  const endIndex = startIndex + pagenationdata.limit;
  const currentdata = filteredData.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
    frightData(page);
  };
  ////////////////////////order move.//////////////////////////////////////////////
  const handlemoveOrder = async (item) => {
    const datapost = {
      staff_id: userid,
      route_url: "/MoveToOrder",
      user_type: usertype,
    };
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      datapost,
    );
    if (permission.data.success === true) {
      axios
        .post(`${process.env.REACT_APP_BASE_URL}MoveToOrder`, {
          freight_id: item?.freight_id,
          client_id: item.client_ref,
        })
        .then((response) => {
          toast.success(response.data.message);
          frightData(currentPage);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("You don't have permission to access this page");
    }
  };
  const handlekey = (e) => {
    if (e.charCode < 44 || e.charCode > 57) {
      e.preventDefault();
    }
  };
  const handlePriorityChange = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      priority: event.target.value,
    }));
  };
  const handleshipmentrefChange = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      shipment_ref: event.target.value,
    }));
  };
  const handlereadyforcollection = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      ready_for_collection: event.target.value,
    }));
  };

  const handleRequireforDelivery = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      require_for_delivery: event.target.value,
    }));
  }
  const handlereadyhazardous = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      hazardous: event.target.value,
    }));
  };
  const send_to_warehouse = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      send_to_warehouse: event.target.value,
    }));
  };
  const assign_to_clearing = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      assign_to_clearing: event.target.value,
    }));
  };
  const handleiinsurance = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      insurance: event.target.value,
    }));
  };
  const shipment_origin = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      shipment_origin: event.target.value,
    }));
  };
  const shipment_des = (event) => {
    setInputdata((prevData) => ({
      ...prevData,
      shipment_des: event.target.value,
    }));
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const postData = () => {
    const postdata = {
      priority: data1.priority,
      origin: data1.origin,
      destination: data1.destination,
      startDate: data1.startDate,
      endDate: data1.endDate,
      freightType: data1.freight,
      freightSpeed: data1.type,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, postdata)
      .then((response) => {
        if (response.data.success === true) {
          closeModal();
          setPagenationdata(response.data);
          setData(response.data.data);
        }
      })
      .catch((error) => console.log(error.response.data));
  };
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
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
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
    }, 1000),
  ).current;

  const freightData1 = (searchTerm) => {
    const postdata = {
      staff_id: userid,
      route_url: "/freight-list",
      user_type: usertype,
      search: searchTerm,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, postdata)
      .then((response) => {
        setLoader(false);
        console.log("frightDataresponse", response.data);
        setPagenationdata(response.data);
        setData(response.data.data);
      })
      .catch((error) => {
        setLoader(false);
        toast.error(error.response?.data?.message || "Something went wrong");
      });
  };

  const handlestatus = (id) => {
    console.log(id);
    const data123 = {
      freight_id: id,
      status: "2",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}status-Freight`, data123)
      .then((response) => {
        toast.success(response.data.message);
        frightData(currentPage);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlelcickapiupdatepartial = () => {
    setStatus1("Estimated");
    const data1 = {
      status: "4",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, data1)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlelcickapiupdatedeclined = () => {
    setStatus1("Declined");
    const data1 = {
      status: "2",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, data1)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlelcickapiupdate = () => {
    setStatus1("Accepted");
    const data1 = {
      status: "1",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, data1)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const handlelcickapiupdae = () => {
    setStatus1("Pending");
    const data1 = {
      status: "0",
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}freight-list`, data1)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclickopenmodal = () => {
    setIsModalOpen(true);
  };
  const handleclosemodal = () => {
    setOpenmodal(false);
  };
  const handlechange = (e) => {
    const { name, value } = e.target;
    setData1({ ...data1, [name]: value });
  };
  const AttchQuote = async (item) => {
    try {
      const datapost = {
        staff_id: userid,
        route_url: "/AttachedShippingEstimate",
        user_type: usertype,
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost,
      );
      console.log(permission);
      if (permission.data.success === true) {
        setFreightId(item.freight_id);
        setOpenmodal(true);
      } else {
        toast.error("You don't have permission to access this page");
      }
    } catch (error) {
      toast.error("permission denied");
    }
  };
  const postattachquote = () => {
    const formdata = new FormData();
    formdata.append("freight_id", freigtid);
    formdata.append("file", filedata1);
    if (filedata1)
      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}AttachedShippingEstimate`,
          formdata,
        )
        .then((response) => {
          if (response.data.success === true) {
            handleclosemodal();
            toast.success(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error.response.data);
        });
  };

  const AssignFreightToSupplier = async () => {
    const payload = {
      freight_id: freightIdAssignTask,
      staff_id: supplierName,
    };
    console.log(payload);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}assignFreightToStaff`,
        payload,
      );
      console.log(response.data);
      toast.success(response.data.message);
      frightData(currentPage);
      setOpenmodalAssignFreight(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const handecnagegetthedata = (e) => {
    setFiledata1(e.target.files[0]);
  };
  const getstaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}staff-list`,
      );
      console.log(response.data.data);
      setStaffdata(response.data.data);
    } catch (error) {
      console.log(error.response.data.data);
    }
  };
  const Attchfreight = (item) => {
    setFreightIdAssignTask(item?.freight_id);
    setOpenmodalAssignFreight(true);
  };
  const hanldecloseModal = () => {
    setOpenmodalAssignFreight(false);
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
  const querryinQuote = (item) => {
    console.log("item", item);
    navigate("/Admin/QuotationInFreightCostumer", { state: { data: item } });
  };

  return (
    <>
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
              xs: "95%",
              sm: "80%",
              md: "60%",
              lg: "40%",
            },
          }}
        >
          <div className="modal-header">
            <h2>
              <h2 id="modal-modal-title">Assign Freight</h2>
            </h2>
            <button className="btn btn-close" onClick={hanldecloseModal}>
              <CloseIcon />
            </button>
          </div>
          <div className="newModalGap">
            <div className="row">

              <div className="col-md-12 ">
                <label>Assign Staff</label>
                <select
                  className="form-select col-12"
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
              <div className=" col-md-12 text-center mt-4">
                <Button
                  variant="contained"
                  className="blueBtn"
                  onClick={AssignFreightToSupplier}
                >
                  Add Staff
                </Button>
              </div>

            </div>
          </div>
        </Box>
      </Modal>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="row manageFreight">
            <div className="col-12">
              <div className="d-flex justify-content-between">
                <h4 className="freight_hd">Freight By Admin</h4>
                <div className="d-flex gap-2 flex-wrap">
                  <div className="searchManageFre">
                    <input
                      className="py-1 rounded ps-1"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search"
                    ></input>
                  </div>
                  <button
                    onClick={() => freightData1(searchQuery)}
                  >
                    Search
                  </button>
                  <div className="dropdown">
                    <button
                      className="dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {status1}
                    </button>
                    <ul className="dropdown-menu">
                      <li className="filter_item">
                        <p
                          className="dropdown-item mb-0"
                          onClick={handlelcickapiupdae}
                        >
                          Pending
                        </p>
                      </li>
                      <li className="filter_item">
                        <p
                          className="dropdown-item mb-0"
                          onClick={handlelcickapiupdate}
                        >
                          Accepted
                        </p>
                      </li>
                      <li className="filter_item">
                        <p
                          className="dropdown-item mb-0"
                          onClick={handlelcickapiupdatedeclined}
                        >
                          Declined
                        </p>
                      </li>
                      <li className="filter_item">
                        <p
                          className="dropdown-item mb-0"
                          onClick={handlelcickapiupdatepartial}
                        >
                          Estimated
                        </p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <button type="button" onClick={handleclickopenmodal}>
                      Filter
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/Admin/Addfreight");
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="mt-4">
              {loader ? (
                <div className="loader-container">
                  <div className="loader"></div>
                  <p className="loader-text">Updating... This may take some time</p>
                </div>
              ) : (
                <div>
                  <div>
                    <table className="table table-striped tableICon">
                      <tbody>
                        {data &&
                          data.length > 0 &&
                          data.map((item, index) => {
                            // console.log(item);
                            const daaaa = new Date(
                              item?.freight_created_at,
                            ).toLocaleDateString("en-GB");
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
                                          {item.freight_number}
                                        </p>
                                      </div>
                                      <div className="">
                                        <p className="port_date">{daaaa}</p>
                                      </div>
                                    </div>
                                    <div className="container-fluid">
                                      <div className="row">
                                        <div className="col-md-3 ps-0">
                                          <div className="">
                                            <p className="origin">
                                              {item.product_desc}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="col-md-5">
                                          <div className="d-flex align-items-center justify-content-center">
                                            <p className="origin">
                                              {item.collection_from_name}
                                            </p>
                                            <div className="arrow">
                                              <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                            </div>
                                            <p className="origin">
                                              {item.delivery_to_name}
                                              <span className="fright_type">
                                                ({item.freight})
                                              </span>
                                            </p>
                                          </div>
                                        </div>
                                        <div className="col-md-2">
                                          <div className="text-center">
                                            <p className="origin">
                                              {item.nature_of_hazard}
                                            </p>
                                          </div>
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
                                                  style={{ cursor: "pointer" }}
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    handlelcickseedata(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <VisibilityIcon
                                                    style={{
                                                      color: "rgb(27 34 69)",
                                                      cursor: "pointer",
                                                      marginRight: "10px",
                                                      width: "20px",
                                                    }}
                                                  />
                                                  View
                                                </a>
                                                <a
                                                  style={{ cursor: "pointer" }}
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    handlelcickseedata1212(
                                                      item,
                                                    );
                                                  }}
                                                >
                                                  <SupportAgentSharpIcon
                                                    style={{
                                                      color: "rgb(27 34 69)",
                                                      cursor: "pointer",
                                                      marginRight: "10px",
                                                      width: "20px",
                                                    }}
                                                  />
                                                  Custom Clearance
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  data-bs-toggle="modal"
                                                  data-bs-target="#staticBackdrop"
                                                  style={{ cursor: "pointer" }}
                                                  onClick={() => {
                                                    handleupdate(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <FaEdit
                                                    style={{
                                                      color: "rgb(27 34 69)",
                                                      marginRight: "10px",
                                                      width: "20px",
                                                      height: "15px",
                                                    }}
                                                  />
                                                  Edit
                                                </a>
                                                <a
                                                  style={{ cursor: "pointer" }}
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    handledelete(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <AiFillDelete
                                                    className="text-danger"
                                                    style={{
                                                      marginRight: "10px",
                                                      width: "20px",
                                                    }}
                                                  />{" "}
                                                  Delete
                                                </a>
                                                <a
                                                  style={{ cursor: "pointer" }}
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    handlestatus(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <DoNotDisturbIcon
                                                    className="text-danger"
                                                    style={{
                                                      marginRight: "10px",
                                                      width: "20px",
                                                    }}
                                                  />{" "}
                                                  Declined
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    hanldeclicknavi2(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <p className="mb-0">
                                                      <i
                                                        class="fi fi-ss-document-signed"
                                                        style={{
                                                          marginRight: "10px",
                                                          width: "20px",
                                                          color:
                                                            "rgb(27 34 69)",
                                                        }}
                                                      ></i>
                                                      Estimate Quote
                                                    </p>
                                                  </div>
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    hanldeclicknavi(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <p className="mb-0">
                                                      <i
                                                        class="fi fi-ss-document-signed"
                                                        style={{
                                                          marginRight: "10px",
                                                          width: "20px",
                                                          color:
                                                            "rgb(27 34 69)",
                                                        }}
                                                      ></i>
                                                      Estimate Quote New
                                                    </p>
                                                  </div>
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    hanldeclicknavi11(
                                                      item.freight_id,
                                                    );
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    <p className="mb-0">
                                                      <i
                                                        class="fi fi-ss-document-signed"
                                                        style={{
                                                          marginRight: "10px",
                                                          width: "20px",
                                                          color:
                                                            "rgb(27 34 69)",
                                                        }}
                                                      ></i>
                                                      Supplier Estimation
                                                    </p>
                                                  </div>
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    AttchQuote(item);
                                                  }}
                                                >
                                                  <div className="">
                                                    <MdDriveFileMoveOutline
                                                      className="text-success"
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                      }}
                                                    />
                                                    Attach Quote
                                                  </div>
                                                </a>

                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    querryinQuote(item);
                                                  }}
                                                >
                                                  <div className="">
                                                    <AiFillMessage
                                                      className="text-success"
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                      }}
                                                    />
                                                    Chat Client
                                                  </div>
                                                </a>
                                                {/* {
                                                  item.supplier_name ? <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    querryinQChat(item);
                                                  }}
                                                >
                                                  <div className="">
                                                    <AiFillMessage
                                                      className="text-success"
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                      }}
                                                    />
                                                    Chat Supplier
                                                  </div>
                                                </a>:""
                                                } */}
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    Attchfreight(item);
                                                  }}
                                                >
                                                  <div className="">
                                                    <MdDriveFileMoveOutline
                                                      className="text-success"
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                      }}
                                                    />
                                                    Assign Freight
                                                  </div>
                                                </a>
                                                <a
                                                  className="dropdown-item li_icon"
                                                  onClick={() => {
                                                    handlemoveOrder(item);
                                                  }}
                                                >
                                                  <div className="">
                                                    <MdDriveFileMoveOutline
                                                      className="text-success"
                                                      style={{
                                                        color: "rgb(27 34 69)",
                                                        marginRight: "10px",
                                                        width: "20px",
                                                      }}
                                                    />
                                                    Inorder
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
                                        <p
                                          type="radio"
                                          className="input_user mb-0"
                                        />
                                        <label className="status d-flex align-items-center">
                                          {item.status == 1 ? (
                                            <>
                                              <span className="dot bg-success me-2"></span>
                                              <p className="text-success mb-0">
                                                Accepted Quoted{" "}
                                                {item?.quote_count}
                                              </p>
                                            </>
                                          ) : item.status == 2 ? (
                                            <>
                                              <span className="dot bg-danger me-2"></span>
                                              <p className="text-danger mb-0">
                                                Declined
                                              </p>
                                            </>
                                          ) : item.status == 3 ? (
                                            <>
                                              <span className="dot bg-secondary me-2"></span>
                                              <p className="text-secondary mb-0">
                                                Partial
                                              </p>
                                            </>
                                          ) : item.status == 4 ? (
                                            <>
                                              <span className="dot bg-info me-2"></span>
                                              <p className="text-info mb-0">
                                                Estimated
                                              </p>
                                            </>
                                          ) : (
                                            <>
                                              <span className="dot bg-dark me-2"></span>
                                              <p className="text-dark mb-0">
                                                Pending
                                                {item?.quote_count > 0 && (
                                                  <span
                                                    className=" mx-2"
                                                    style={{
                                                      colour: "#3498db",
                                                    }}
                                                  >
                                                    Quoted: {item.quote_count}
                                                  </span>
                                                )}
                                              </p>
                                            </>
                                          )}
                                        </label>
                                      </div>
                                      <div className="d-flex">
                                        <div className="me-2">
                                          {item?.staff_name}
                                          {item?.confirmed_supplier_name &&
                                            item?.confirmed_supplier_name !== "null" &&
                                            `, ${item.confirmed_supplier_name}`}
                                        </div>
                                        <div>
                                          {" "}
                                          {item?.supplier_name === "null" ||
                                            !item?.supplier_name
                                            ? ""
                                            : item?.supplier_name}{" "}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <div
                                    className="modal fade modalManageFreight frightFormSec md_update"
                                    id="staticBackdrop"
                                    data-bs-backdrop="static"
                                    data-bs-keyboard="false"
                                    tabIndex={-1}
                                    aria-labelledby="staticBackdropLabel"
                                    aria-hidden="true"
                                  >
                                    <div className="modal-dialog modal-dialog-centered  modal-xl">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5
                                            className="modal-title"
                                            id="staticBackdropLabel"
                                          >
                                            Update Freight
                                          </h5>
                                          <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                          >
                                            <CloseIcon />
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <div className="row">
                                            <div className="col-lg-8">
                                              <div className="">
                                                <h4 className="">
                                                  Shipment details
                                                </h4>
                                              </div>
                                              <div className=" mt-3">
                                                <div className="row borderShip">
                                                  <div className="col-md-6 mb-3 ">
                                                    <label>Date</label>
                                                    <input
                                                      type="date"
                                                      value={formattedDate}
                                                      name="date"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>Client</label>
                                                    <select
                                                      className="form-select"
                                                      value={
                                                        inputdata.client_ref
                                                      }
                                                      onChange={handleupdateapi}
                                                      placeholder="client refrence"
                                                      name="client_ref"
                                                    >
                                                      {lcientlist &&
                                                        lcientlist.length > 0 &&
                                                        lcientlist.map(
                                                          (item, index) => {
                                                            return (
                                                              <>
                                                                <option
                                                                  key={index}
                                                                  value={
                                                                    item.id
                                                                  }
                                                                >
                                                                  {
                                                                    item.full_name
                                                                  }
                                                                </option>
                                                              </>
                                                            );
                                                          },
                                                        )}
                                                    </select>
                                                  </div>
                                                  <div className=" col-md-6  mb-3">
                                                    <label>Freight</label>
                                                    <select
                                                      className="form-select"
                                                      name="type"
                                                      value={inputdata.type}
                                                      onChange={handleupdateapi}
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="express">
                                                        Express
                                                      </option>
                                                      <option value="normal">
                                                        Normal
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className=" col-md-6  mb-3">
                                                    <label>Freight Type</label>
                                                    <select
                                                      className="form-select"
                                                      name="freight"
                                                      value={inputdata.freight}
                                                      onChange={handleupdateapi}
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="Sea">
                                                        Sea
                                                      </option>
                                                      <option value="Air">
                                                        Air
                                                      </option>
                                                      <option value="Road">
                                                        Road
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className=" col-md-6  mb-3">
                                                    <label>
                                                      Client Reference
                                                    </label>
                                                    <input
                                                      name="client_ref_name"
                                                      value={
                                                        inputdata.client_ref_name
                                                      }
                                                      onChange={handleupdateapi}
                                                    ></input>
                                                  </div>
                                                  <div className=" col-md-6  mb-3">
                                                    <label>
                                                      Product Description
                                                    </label>
                                                    <input
                                                      name="product_desc"
                                                      value={
                                                        inputdata.product_desc
                                                      }
                                                      onChange={handleupdateapi}
                                                    ></input>
                                                  </div>
                                                  <div className="col-lg-12 mb-3">
                                                    <label>
                                                      Estimated Transit Time
                                                    </label>
                                                    <input
                                                      type="text"
                                                      onKeyPress={handlekey}
                                                      placeholder="Transit Time"
                                                      value={
                                                        inputdata.transit_time
                                                      }
                                                      onChange={handleupdateapi}
                                                      name="transit_time"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3 shipRefer  spaceAssignEst">
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                                        <label>Priority</label>
                                                      </FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.priority
                                                        }
                                                        name="priority"
                                                        onChange={
                                                          handlePriorityChange
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="High"
                                                          control={<Radio />}
                                                          label="High"
                                                        />
                                                        <FormControlLabel
                                                          value="Medium"
                                                          control={<Radio />}
                                                          label="Medium"
                                                        />
                                                        <FormControlLabel
                                                          value="Low"
                                                          control={<Radio />}
                                                          label="Low"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>
                                                  <div className="col-md-6 mb-3 shipRefer  spaceAssignEst">
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                                        <label>
                                                          Shipment Reference
                                                        </label>
                                                      </FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.shipment_ref
                                                        } // Ensure this is correctly bound to the state
                                                        name="shipment_ref"
                                                        onChange={
                                                          handleshipmentrefChange
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="shipper"
                                                          control={<Radio />}
                                                          label="shipper"
                                                        />
                                                        <FormControlLabel
                                                          value="consignee"
                                                          control={<Radio />}
                                                          label="consignee"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="mt-4">
                                                <h4>Cargo transit details</h4>
                                              </div>
                                              <div className="">
                                                <div className="row borderShip">
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      Country of Origin
                                                    </label>
                                                    <select
                                                      className="form-select"
                                                      name="country_of_origin"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.country_of_origin
                                                      }
                                                    >
                                                      <option value="">
                                                        select....
                                                      </option>
                                                      {updatedata &&
                                                        updatedata.length > 0 &&
                                                        updatedata.map(
                                                          (item, index) => (
                                                            <option
                                                              key={index}
                                                              value={item.id}
                                                            >
                                                              {item.name}
                                                            </option>
                                                          ),
                                                        )}
                                                    </select>
                                                  </div>
                                                  <div className=" col-md-6  mb-3">
                                                    <label>
                                                      {" "}
                                                      Destination Country
                                                    </label>
                                                    <select
                                                      className="form-select"
                                                      name="destination_country"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.destination_country
                                                      }
                                                    >
                                                      <option>
                                                        select....
                                                      </option>
                                                      {updatedata &&
                                                        updatedata.length > 0 &&
                                                        updatedata.map(
                                                          (item, index) => {
                                                            // console.log(item);
                                                            return (
                                                              <>
                                                                <option
                                                                  key={index}
                                                                  value={
                                                                    item.id
                                                                  }
                                                                >
                                                                  {item.name}
                                                                </option>
                                                              </>
                                                            );
                                                          },
                                                        )}
                                                    </select>
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      Port of Loading
                                                    </label>
                                                    <input
                                                      type="text"
                                                      name="port_of_loading"
                                                      value={
                                                        inputdata.port_of_loading
                                                      }
                                                      onChange={handleupdateapi}
                                                      placeholder="Port of Loading"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      {" "}
                                                      Port of Discharge
                                                    </label>
                                                    <input
                                                      type="text"
                                                      name="post_of_discharge"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.post_of_discharge
                                                      }
                                                      placeholder="Port of Discharge"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      Place of Delivery
                                                    </label>
                                                    <input
                                                      type="text"
                                                      name="place_of_delivery"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.place_of_delivery
                                                      }
                                                      placeholder="Place of Delivery"
                                                    />
                                                  </div>
                                                  <div className="col-md-6">
                                                    <label> Incoterm </label>
                                                    <select
                                                      className="form-select"
                                                      name="incoterm"
                                                      onChange={handleupdateapi}
                                                      value={inputdata.incoterm}
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="CFR">
                                                        CFR
                                                      </option>
                                                      <option value="CIF">
                                                        CIF
                                                      </option>
                                                      <option value="DAP">
                                                        DAP
                                                      </option>
                                                      <option value="DDU">
                                                        DDU
                                                      </option>
                                                      <option value="DDP">
                                                        DDP
                                                      </option>
                                                      <option value="EXW">
                                                        EXW
                                                      </option>
                                                      <option value="FCA">
                                                        FCA
                                                      </option>
                                                      <option value="FOB">
                                                        FOB{" "}
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>Shipper Name</label>
                                                    <input
                                                      type="text"
                                                      name="shipper_name"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.shipper_name
                                                      }
                                                      placeholder="Shipper Name"
                                                    />
                                                  </div>
                                                  <div className="col-md-6">
                                                    <label>
                                                      {" "}
                                                      Supplier Address
                                                    </label>
                                                    <input
                                                      type="text"
                                                      name="supplier_address"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.supplier_address
                                                      }
                                                      placeholder="Shipper Name"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      Place of Receipt/ Supplier
                                                      Address
                                                    </label>
                                                    <input
                                                      type="text"
                                                      name="supplier_address"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.supplier_address
                                                      }
                                                      placeholder="Supplier Address"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>Type</label>

                                                    <select
                                                      className="form-select"
                                                      name="fcl_lcl"
                                                      onChange={handleupdateapi}
                                                      value={inputdata.fcl_lcl}
                                                    >
                                                      <option>Select...</option>
                                                      <option value={"FCL"}>
                                                        FCL
                                                      </option>
                                                      <option value={"LCL"}>
                                                        LCL
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div>
                                                    <div className="row">
                                                      <div className="col-md-6 updateFreList">
                                                        <FormControl>
                                                          <FormLabel id="demo-row-radio-buttons-group-label">
                                                            <label>
                                                              Origin
                                                            </label>
                                                          </FormLabel>
                                                          <RadioGroup
                                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                                            value={
                                                              inputdata.shipment_origin
                                                            }
                                                            name="shipment_origin"
                                                            onChange={
                                                              shipment_origin
                                                            }
                                                          >
                                                            <FormControlLabel
                                                              value="Shipper will deliver at Asia Direct - Africa warehouse"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Shipper will deliver at Asia Direct - Africa warehouse"
                                                            />
                                                            <FormControlLabel
                                                              value="Asia Direct will collect from shipper address"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Asia Direct will collect from shipper address"
                                                            />
                                                            <FormControlLabel
                                                              value="Shipper will deliver to the port of loading"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Shipper will deliver to the port of loading"
                                                            />
                                                            <FormControlLabel
                                                              value="Shipper will deliver and facilitate export at the Port of loading"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Shipper will deliver and facilitate export at the Port of loading"
                                                            />
                                                          </RadioGroup>
                                                        </FormControl>
                                                      </div>
                                                      <div className="col-md-6  updateFreList">
                                                        <label>
                                                          Destination
                                                        </label>
                                                        <FormControl>
                                                          <RadioGroup
                                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                                            value={
                                                              inputdata.shipment_des
                                                            }
                                                            name="shipment_des"
                                                            onChange={
                                                              shipment_des
                                                            }
                                                          >
                                                            <FormControlLabel
                                                              value="Asia Direct will deliver to the Address"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Asia Direct will deliver to the Address"
                                                            />
                                                            <FormControlLabel
                                                              value="Consignee will collect at Asia Direct - Africa warehouse"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Consignee will collect at Asia Direct - Africa warehouse"
                                                            />
                                                            <FormControlLabel
                                                              value="Consignee will collect at the nearest port"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Consignee will collect at the nearest port"
                                                            />
                                                            <FormControlLabel
                                                              value="Consignee will collect and facilitate import at destination port"
                                                              control={
                                                                <Radio />
                                                              }
                                                              label="Consignee will collect and facilitate import at destination port"
                                                            />
                                                          </RadioGroup>
                                                        </FormControl>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="mt-4">
                                                <h4>Product Description</h4>
                                              </div>
                                              <div className="">
                                                <div className="row borderShip">
                                                  <div className=" col-md-6  mb-3">
                                                    <label>
                                                      Product Description
                                                    </label>
                                                    <input
                                                      name="product_desc"
                                                      value={
                                                        inputdata.product_desc
                                                      }
                                                      onChange={handleupdateapi}
                                                    ></input>
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>Package Type</label>
                                                    <br />
                                                    <select
                                                      className="form-select form-control"
                                                      name="package_type"
                                                      value={
                                                        inputdata.package_type
                                                      }
                                                      onChange={handleupdateapi}
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="box">
                                                        Box
                                                      </option>
                                                      <option value="crate">
                                                        Crate
                                                      </option>
                                                      <option value="pallet">
                                                        Pallet
                                                      </option>
                                                      <option value="bags">
                                                        Bags
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      {" "}
                                                      No. of Packages
                                                    </label>
                                                    <input
                                                      type="text"
                                                      onKeyPress={handlekey}
                                                      name="no_of_packages"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.no_of_packages
                                                      }
                                                      placeholder="Num.. of Package"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>Commodity</label>
                                                    <select
                                                      className="form-select"
                                                      name="commodity"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.commodity
                                                      }
                                                      placeholder="Comment"
                                                    >
                                                      <option>Select...</option>
                                                      {apidata &&
                                                        apidata.length > 0 &&
                                                        apidata.map(
                                                          (item, index) => {
                                                            return (
                                                              <>
                                                                <option
                                                                  key={index}
                                                                  value={
                                                                    item.id
                                                                  }
                                                                >
                                                                  {item.name}
                                                                </option>
                                                              </>
                                                            );
                                                          },
                                                        )}
                                                    </select>
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label> Dimension</label>
                                                    <input
                                                      type="text"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.dimension
                                                      }
                                                      onKeyPress={handlekey}
                                                      name="dimension"
                                                      placeholder="Dimension"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label> Weight</label>
                                                    <input
                                                      type="text"
                                                      onKeyPress={handlekey}
                                                      onChange={handleupdateapi}
                                                      value={inputdata.weight}
                                                      name="weight"
                                                      placeholder="Weight"
                                                    />
                                                  </div>
                                                  <div className="col-md-6 mb-3">
                                                    <label>
                                                      {" "}
                                                      Volumetric Weight
                                                    </label>
                                                    <input
                                                      type="text"
                                                      disabled
                                                      onKeyPress={handlekey}
                                                      name="volumetric_weight"
                                                      value={
                                                        inputdata.dimension
                                                          ? 167 *
                                                          inputdata.dimension
                                                          : inputdata.volumetric_weight
                                                      }
                                                      placeholder="Volumetric Weight"
                                                    />
                                                  </div>
                                                  <div className="col-md-6"></div>
                                                  <div className="col-md-6">
                                                    <h4 className="freight_hd">
                                                      Document Section
                                                    </h4>
                                                    <span class="line"></span>
                                                  </div>
                                                  <div className="col-md-6 text-end">
                                                    <button
                                                      className="blueBtn"
                                                      onClick={handleShow}
                                                    >
                                                      Upload Documents
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
                                                            bgcolor:
                                                              "background.paper",
                                                            borderRadius: 2,
                                                            width: 500,
                                                            mx: "auto",
                                                            mt: 10,
                                                          }}
                                                        >
                                                          <h2>
                                                            Upload Documents
                                                          </h2>

                                                          {/* Dropdown */}
                                                          <FormControl
                                                            fullWidth
                                                            sx={{ mt: 2 }}
                                                          >
                                                            <InputLabel id="doc-select-label">
                                                              Select Document
                                                              Type
                                                            </InputLabel>
                                                            <Select
                                                              labelId="doc-select-label"
                                                              // value={selected}
                                                              onChange={
                                                                handleSelect
                                                              }
                                                            >
                                                              {docOptions.map(
                                                                (option) => (
                                                                  <MenuItem
                                                                    key={
                                                                      option.id
                                                                    }
                                                                    value={
                                                                      option.id
                                                                    }
                                                                  >
                                                                    {
                                                                      option.label
                                                                    }
                                                                  </MenuItem>
                                                                ),
                                                              )}
                                                            </Select>
                                                          </FormControl>

                                                          {/* Dynamic file inputs */}
                                                          <div className="mt-3">
                                                            {selectedDocs.map(
                                                              (
                                                                doc,
                                                                index,
                                                              ) => (
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
                                                                    onChange={(
                                                                      e,
                                                                    ) =>
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
                                                          <Box
                                                            sx={{
                                                              display: "flex",
                                                              justifyContent:
                                                                "flex-end",
                                                              gap: 2,
                                                              mt: 3,
                                                            }}
                                                          >
                                                            <Button
                                                              onClick={
                                                                handleClose
                                                              }
                                                            >
                                                              Cancel
                                                            </Button>
                                                            <Button
                                                              variant="contained"
                                                              color="success"
                                                              onClick={
                                                                handleSave
                                                              }
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

                                                  <div className="mt-3">
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

                                                  {inputdata.hazardous ===
                                                    "yes" ? (
                                                    <div className=" col-md-6  mb-3">
                                                      <label>
                                                        {" "}
                                                        Nature of hazard
                                                      </label>
                                                      <select
                                                        className="form-select"
                                                        name="nature_of_hazard"
                                                        onChange={
                                                          handleupdateapi
                                                        }
                                                        value={
                                                          inputdata.nature_of_hazard
                                                        }
                                                      >
                                                        <option value="">
                                                          Select...
                                                        </option>
                                                        <option value="General Cargo">
                                                          General Cargo
                                                        </option>
                                                        <option value="Explosive">
                                                          Explosive
                                                        </option>
                                                        <option
                                                          value="Class 3 flammable
                                                          liquids"
                                                        >
                                                          Class 3 flammable
                                                          liquids
                                                        </option>
                                                        <option value="Corrosives">
                                                          Corrosives
                                                        </option>
                                                        <option value="Class 2 gases">
                                                          Class 2 gases
                                                        </option>
                                                        <option value="Compressed gas">
                                                          Compressed gas
                                                        </option>
                                                        <option value="Infection">
                                                          Infection
                                                        </option>
                                                        <option value="Corrosive">
                                                          Corrosive
                                                        </option>
                                                        <option value="Flammable">
                                                          Flammable
                                                        </option>
                                                        <option value="Flammable solids">
                                                          Flammable solids
                                                        </option>
                                                        <option value="Organic peroxides">
                                                          Organic peroxides
                                                        </option>
                                                        <option value="Toxic substances">
                                                          Toxic substances
                                                        </option>
                                                        <option
                                                          value="Class 9 other substances
                                                          and articles"
                                                        >
                                                          Class 9 other
                                                          substances and
                                                          articles
                                                        </option>
                                                        <option value="Dry ice">
                                                          Dry ice
                                                        </option>
                                                        <option value="Poison">
                                                          Poison
                                                        </option>
                                                        <option value="Batteries">
                                                          Batteries
                                                        </option>
                                                        <option value="Gases">
                                                          Gases
                                                        </option>
                                                        <option value="Refrigerated">
                                                          Refrigerated
                                                        </option>
                                                        <option value="Inflammable">
                                                          Inflammable
                                                        </option>
                                                        <option value="Air bags">
                                                          Air bags
                                                        </option>
                                                        <option value="Ammunition">
                                                          Ammunition
                                                        </option>
                                                        <option value="Cigarette lighters">
                                                          Cigarette lighters
                                                        </option>
                                                        <option value="Lithium batteries">
                                                          Lithium batteries
                                                        </option>
                                                      </select>
                                                    </div>
                                                  ) : (
                                                    ""
                                                  )}
                                                  <div className="col-lg-12 mb-3">
                                                    <label> Comment</label>
                                                    <textarea
                                                      name="comment"
                                                      id=""
                                                      onChange={handleupdateapi}
                                                      value={inputdata.comment}
                                                      placeholder="write your comment here.."
                                                    ></textarea>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="col-lg-4 spaceAssignEst">
                                              <div className="   rightSecFre ">
                                                <div className=" borderShip">
                                                  <div className="shipRefer mb-3">
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                                        <label>Insurance</label>
                                                      </FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.insurance
                                                        }
                                                        name="insurance"
                                                        onChange={
                                                          handleiinsurance
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="Yes"
                                                          control={<Radio />}
                                                          label="Yes"
                                                        />
                                                        <FormControlLabel
                                                          value="No"
                                                          control={<Radio />}
                                                          label="No"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>
                                                  <div className="shipRefer mb-3">
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                                        <label>
                                                          Require for collection
                                                        </label>
                                                      </FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.ready_for_collection
                                                        }
                                                        name="ready_for_collection"
                                                        onChange={
                                                          handlereadyforcollection
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="Yes"
                                                          control={<Radio />}
                                                          label="Yes"
                                                        />
                                                        <FormControlLabel
                                                          value="No"
                                                          control={<Radio />}
                                                          label="No"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>
                                                  <div className="shipRefer mb-3">
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                                        <label>
                                                          Require for Delivery
                                                        </label>
                                                      </FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.require_for_delivery
                                                        }
                                                        name="require_for_delivery"
                                                        onChange={
                                                          handleRequireforDelivery
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="Yes"
                                                          control={<Radio />}
                                                          label="Yes"
                                                        />
                                                        <FormControlLabel
                                                          value="No"
                                                          control={<Radio />}
                                                          label="No"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>

                                                  <div className=" col-md-6 mb-3">
                                                    <div className="shipRefer">
                                                      <FormControl>
                                                        <FormLabel id="demo-row-radio-buttons-group-label">
                                                          <label>Hazardous</label>
                                                        </FormLabel>
                                                        <RadioGroup
                                                          aria-labelledby="demo-row-radio-buttons-group-label"
                                                          value={
                                                            inputdata.hazardous
                                                          }
                                                          name="hazardous"
                                                          onChange={
                                                            handlereadyhazardous
                                                          }
                                                        >
                                                          <FormControlLabel
                                                            value="yes"
                                                            control={<Radio />}
                                                            label="Yes"
                                                          />
                                                          <FormControlLabel
                                                            value="no"
                                                            control={<Radio />}
                                                            label="No"
                                                          />
                                                        </RadioGroup>
                                                      </FormControl>

                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="borderShip mt-4">
                                                  <div className="mb-3">
                                                    <label>
                                                      {" "}
                                                      Assign to Transporter
                                                    </label>

                                                    <select
                                                      className="form-select"
                                                      name="assign_to_transporter"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.assign_to_transporter
                                                      }
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="Asia Direct - Africa">
                                                        Asia Direct - Africa
                                                      </option>
                                                      <option value="OBD Logistics">
                                                        OBD Logistics
                                                      </option>
                                                      <option value="SACO CFR">
                                                        SACO CFR
                                                      </option>
                                                      <option value="Shenzhen Nimbus">
                                                        Shenzhen Nimbus
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className="shipRefer d-flex flex-column mb-3">
                                                    <label>
                                                      Send to Warehouse
                                                    </label>
                                                    <div>
                                                      <FormControl>
                                                        <FormLabel id="demo-row-radio-buttons-group-label"></FormLabel>
                                                        <RadioGroup
                                                          aria-labelledby="demo-row-radio-buttons-group-label"
                                                          value={
                                                            inputdata.send_to_warehouse
                                                          }
                                                          name="send_to_warehouse"
                                                          onChange={
                                                            send_to_warehouse
                                                          }
                                                        >
                                                          <FormControlLabel
                                                            value="Yes"
                                                            control={<Radio />}
                                                            label="Yes"
                                                          />
                                                          <FormControlLabel
                                                            value="No"
                                                            control={<Radio />}
                                                            label="No"
                                                          />
                                                        </RadioGroup>
                                                      </FormControl>

                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="borderShip mt-4">
                                                  <div className="mb-3">
                                                    <label>
                                                      Assign Warehouse
                                                    </label>
                                                    <select
                                                      className="form-select"
                                                      name="assign_warehouse"
                                                      onChange={handleupdateapi}
                                                      value={
                                                        inputdata.assign_warehouse
                                                      }
                                                    >
                                                      <option value="">
                                                        Select...
                                                      </option>
                                                      <option value="Asia Direct Hre">
                                                        Asia Direct Hre
                                                      </option>
                                                      <option value="Asia Direct - SA">
                                                        Asia Direct - SA
                                                      </option>
                                                      <option value="Jingwei International Logistics">
                                                        Jingwei International
                                                        Logistics
                                                      </option>
                                                      <option value="OBD Logistics">
                                                        OBD Logistics
                                                      </option>
                                                      <option value="Shenzhen Nimbus">
                                                        Shenzhen Nimbus
                                                      </option>
                                                    </select>
                                                  </div>
                                                  <div className="shipRefer mb-3 d-flex flex-column">
                                                    <label>
                                                      Assign to Clearing
                                                    </label>
                                                    <FormControl>
                                                      <FormLabel id="demo-row-radio-buttons-group-label"></FormLabel>
                                                      <RadioGroup
                                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                                        value={
                                                          inputdata.assign_to_clearing
                                                        }
                                                        name="assign_to_clearing"
                                                        onChange={
                                                          assign_to_clearing
                                                        }
                                                      >
                                                        <FormControlLabel
                                                          value="Yes"
                                                          control={<Radio />}
                                                          label="Yes"
                                                        />
                                                        <FormControlLabel
                                                          value="No"
                                                          control={<Radio />}
                                                          label="No"
                                                        />
                                                      </RadioGroup>
                                                    </FormControl>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="modal-footer">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleupdateapipost(
                                                item.freight_id,
                                              );
                                            }}
                                            className="btn"
                                            data-bs-dismiss="modal"
                                          >
                                            Update
                                          </button>
                                          <button
                                            type="button"
                                            className="btn cross_btn"
                                            data-bs-dismiss="modal"
                                          >
                                            Close
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
                  </div>
                </div>
              )}
            </div>
          </div>
          <Modal
            open={openmodal}
            onClose={handleclosemodal}
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
                  xs: "95%",
                  sm: "80%",
                  md: "60%",
                  lg: "40%",
                },
              }}
            >
              <div className="modal-header">
                <h2>
                  <h2 id="modal-modal-title">Attcah Quote</h2>
                </h2>
                <button className="btn btn-close" onClick={handleclosemodal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="newModalGap">
                <div className="row">
                  <div className="col-12 ">
                    <label>Attach Quote</label>
                    <input
                      type="file"
                      className="form-cuntrol border px-3 py-2"
                      onChange={handecnagegetthedata}
                      name="attachdoc"
                    ></input>
                  </div>
                </div>
                <div className="text-center mt-4">
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
          <div className="row">
            <Modal
              open={isModalOpen}
              onClose={closeModal}
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
                  <h2 id="modal-modal-title">Filter</h2>
                  <button className="btn btn-close" onClick={closeModal}>
                    <CloseIcon />{" "}
                  </button>
                </div>
                {/*header end */}
                <div className="newModalGap noFormaControl">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Delivery Type</label>
                      <select name="type" onChange={handlechange} className="form-select">
                        <option value="">Select</option>
                        <option value="express">Express</option>
                        <option value="normal">Consolidation</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label>Priority </label>
                      <div className="shipRefer1 radioBtn d-flex gap-4">
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


                    <div className="col-md-6">
                      <label>Country of Origin</label>
                      <select name="origin" onChange={handlechange} className="form-select">
                        <option value="">Select</option>
                        {updatedata &&
                          updatedata.length > 0 &&
                          updatedata.map((item, index) => {
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
                      <select name="destination" onChange={handlechange} className="form-select">
                        <option value="">Select</option>
                        {updatedata &&
                          updatedata.length > 0 &&
                          updatedata.map((item, index) => {
                            return (
                              <>
                                <option value={item.id}>{item.name}</option>
                              </>
                            );
                          })}
                      </select>
                    </div>


                    <div className="col-md-6 col-sm-6">
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
                    <div className="col-md-6 col-sm-6">
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


                    <div className="col-md-12">
                      <label>Freight</label>
                      <select name="freight" onChange={handlechange} className="form-select">
                        <option value="">Select...</option>
                        <option value="Sea">Sea</option>
                        <option value="Air">Air</option>
                        <option value="Road">Road</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <button className="blueBtn " variant="contained" onClick={postData}>
                      Apply
                    </button>
                  </div>
                </div>
              </Box>
            </Modal>
            {/* )} */}
            
          </div >
        </div >
      </div >
    </>
  );
}
