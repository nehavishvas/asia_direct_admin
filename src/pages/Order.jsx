import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DownloadingIcon from "@mui/icons-material/Downloading";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CreateIcon from '@mui/icons-material/Create';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RoomIcon from "@mui/icons-material/Room";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
const pageSize = 10;

export default function Order() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [inputvalue, setInputvalue] = useState([]);
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [apidata, setApidata] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData2, setFormData2] = useState(null);
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file1, setFile1] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [lcientlist, setLcientlist] = useState([]);
  const [openModalorder, setOpenModalorder] = useState(false);
  const [pagenation, setPagenation] = useState(1);
  const [warehousedata, setWarehousedata] = useState([]);
  const [updatedata, setUpdatedata] = useState([]);
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
    send_to_warehouse: "",
    shipment_ref: "",
    shipment_origin: "",
    shipment_des: "",
    priority: "",
    is_active: "",
    ready_for_collection: "",
    quote_received: "",
    client_ref_name: "",
    client_quoted: "",
    product_desc: "",
    send_to_warehouse: "",
    assign_to_clearing: "",
    cargo_pickup: "",
    sales_representative: "",
  });
  const [show1, setShow1] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedFreightIdForDocs, setSelectedFreightIdForDocs] = useState(null);
  const [selectedOrderIdForDocs, setSelectedOrderIdForDocs] = useState(null);
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
    { id: "Invoice (AD)", label: "Invoice (AD)" },
    { id: "POP (AD)", label: "POP (AD)" },
    { id: "Delivery note", label: "Delivery note" }
  ];

  const handleShow = () => setShow1(true);
  const handleClose = () => {
    setShow1(false);
    setSelectedDocs([]);
    setSelectedFreightIdForDocs(null);
    setSelectedOrderIdForDocs(null);
  };

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
    if (!selectedFreightIdForDocs && !selectedOrderIdForDocs) {
      toast.error("Freight ID or Order ID is missing");
      return;
    }
    setLoader(true);
    const formData = new FormData();
    if (selectedFreightIdForDocs) {
      formData.append("freight_id", selectedFreightIdForDocs);
    }
    if (selectedOrderIdForDocs) {
      formData.append("order_id", selectedOrderIdForDocs);
    }

    selectedDocs.forEach((doc) => {
      doc.files.forEach((file) => {
        formData.append(doc.name, file);
      });
    });

    axios
      .post(`${process.env.REACT_APP_BASE_URL}upload-freight-document`, formData)
      .then((response) => {
        if (response.data.success) {
          toast.success(response.data.message || "Documents uploaded successfully");
          getorder();
          handleClose();
          setSelectedDocs([]);
          setSelectedFreightIdForDocs(null);
          setSelectedOrderIdForDocs(null);
        } else {
          toast.error(response.data.message || "Upload failed");
        }
        setLoader(false);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Something went wrong!");
        setLoader(false);
      });
  };

  let today = new Date();
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  let day = String(today.getDate()).padStart(2, "0");
  let formattedDate = `${year}-${month}-${day}`;
  const handleFileChange2 = (event) => {
    const files = event.target.files;
    setFormData2({ ...formData2, licenses: files });
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
  useEffect(() => {
    getClient();
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
  ///////////////////////////////////////////////////show details in detail's page///////////////////////////////////
  const getorder = async (page = 1, searchVal = searchQuery, showPageLoader = true) => {
    try {
      const pagedata = {
        page: page,
        limit: 10,
        user_id: userid,
        user_type: usertype,
      };
      if (searchVal) {
        pagedata.search = searchVal;
      }
      if (showPageLoader) {
        setLoader(true);
      }
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}order/details`,
        pagedata
      );
      console.log(response.data);
      if (response.data.success) {
        console.log(response.data.data);
        setData(response.data.data);
        setPagenation(response.data);
        console.log(pagenation);
      } else {
        console.error("Failed to fetch order details:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching order details:",
        error.response || error.message
      );
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getorder();
  }, []);
  ///////////////////////////////update address/////////////////////////////////////////////////////
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const handledelivery = (id) => {
    const alldaatat = data.filter((item) => {
      return item.id === id;
    });
    console.log(alldaatat[0]);
    navigate("/Admin/updateaddress", { state: { data: alldaatat[0] } });
  };
  const Shippinginstruction = (id) => {
    const alldaatat = data.filter((item) => {
      return item.id === id;
    });
    console.log(alldaatat[0]);
    navigate("/Admin/bookinginstruction", { state: { data: alldaatat[0] } });
  };
  const Shippingorderedit = (item) => {
    const alldaatat = data.filter((item1) => {
      return item1.freight_id === item.freight_id;
    });
    setIsOpen(true);
    setInputdata(alldaatat[0]);
    console.log(alldaatat);
    // navigate("/Admin/bookinginstruction", { state: { data: alldaatat[0] } });
  };

  const handledeliveryEye = (id) => {
    console.log(id);
    console.log(pagenation);
    const alldaatat = pagenation.data.filter((item) => {
      return item.id === id;
    });
    console.log(alldaatat[0]);
    console.log(alldaatat);
    navigate("/Admin/OrderDetails", { state: { data: alldaatat[0] } });
  };

  const track = async (id) => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/Admin/trackorder",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        const allData = data.filter((item) => item.id === id);
        navigate("/Admin/trackorder", { state: { data: allData } });
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

  const assignclearing = async (item) => {
    try {
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        {
          staff_id: userid,
          route_url: "/AssignToClearing",
          user_type: usertype,
        }
      );
      if (permission.data.success) {
        console.log(item);
        const postdata = {
          freight_id: item.freight_id,
          order_id: item.order_id,
        };
        axios
          .post(`${process.env.REACT_APP_BASE_URL}AssignToClearing`, postdata)
          .then((response) => {
            toast.success(response.data.message);
          })
          .catch((error) => {
            toast.error(error.response.data.message);
          });
      } else {
        toast.error("Permission Denied: You don’t have access to this page");
      }
    } catch (error) {
      if (error.response.status === 400) {
        toast.error("Permission Denied: You don’t have access to this page");
      }
    }
  };
  const track12345 = (id) => {
    const alldaatat = data.filter((item) => {
      return item.id === id;
    });
    navigate("/Admin/OrderDetail", { state: { data: alldaatat } });
  };
  const userid = JSON.parse(localStorage.getItem("data123"))?.id;
  const usertype = JSON.parse(localStorage.getItem("data123"))?.user_type;
  const handlenavival = async (id) => {
    try {
      const datapost = {
        staff_id: userid,
        route_url: "/Admin/updatedelivery",
        user_type: usertype,
      };
      const permission = await axios.post(
        `${process.env.REACT_APP_BASE_URL}CheckPermission`,
        datapost
      );
      if (permission.data.success) {
        const alldata = data?.filter((item) => item.id === id);
        console.log(alldata);
        navigate("/Admin/updatedelivery", { state: { data: alldata[0] } });
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
  const filteredData = data.filter((item) => {
    return (
      item?.client_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.track_status?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.product_desc?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.order_number?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.collection_from_name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.nature_of_hazard
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.delivery_to_country
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.collection_from_country
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.hazardous?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.order_id
        ?.toString()
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase()) ||
      item?.freight?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.freight?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.freight_number?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );
  });
  const totalPage = Math.ceil(pagenation.totalRecords / 10);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentdata = filteredData.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getorder(page, searchQuery, false);
  };
  const handleclicknaviwaybill = (freight_id) => {
    const alldata = data?.filter((item) => {
      return item.freight_id === freight_id;
    });
    console.log(alldata);
    navigate("/Admin/waybill", { state: { data: alldata[0] } });
  };
  const handleclicknaviauthority = (id) => {
    const alldata = data?.filter((item) => {
      return item.id === id;
    });
    console.log(alldata);
    navigate("/Admin/letterofauhtority", { state: { data: alldata[0] } });
  };
  const handleclicknavibilloflaadding = (id) => {
    const alldata = data?.filter((item) => {
      return item.id === id;
    });
    navigate("/Admin/billofladding", { state: { data: alldata[0] } });
  };
  const handleclicknavibilloflaadding11 = (id) => {
    const alldata = data?.filter((item) => {
      return item.id === id;
    });
    navigate("/Admin/customesClearings", { state: { data: alldata[0] } });
  };
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const postData = () => {
    setLoader(true);
    closeModal();
    if (file) {
      const formdata = new FormData();
      formdata.append("file", file);
      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}UploadExcelShipmentOrder`,
          formdata
        )
        .then((response) => {
          if (response.data.success === true) {
            toast.success(response.data.message);
            setLoader(false);
          }
          closeModal();
        })
        .catch((error) => {
          setLoader(false);
          console.log(error.response);
        });
    } else {
      console.log("No file selected");
    }
  };
  const openModal1 = () => {
    setIsModalOpen1(true);
  };
  const closeModal1 = () => {
    setIsModalOpen1(false);
  };
  const handleFileChange1 = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile1(selectedFile);
    }
  };
  useEffect(() => {
    getwarehouyse();
  }, []);
  const getwarehouyse = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}getWarehouse`)
      .then((response) => {
        setWarehousedata(response.data.data);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const handleclickrestore = (item) => {
    console.log(item);
    const data123 = {
      order_id: item.order_id,
      freight_id: item.freight_id,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}RevertOrder`, data123)
      .then((response) => {
        toast.success(response.data.message);
        getorder();
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const track12311 = (alldata) => {
    console.log([alldata]);
    if (alldata.added_by === "1") {
      navigate("/Admin/shipping-estimate", { state: { data: [alldata], fromPage: "/Admin/order" } });
    } else {
      navigate("/Admin/shipping-estimate", {
        state: { data: [alldata], fromPage: "/Admin/order" },
      });
    }
  };
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

  const handlechange = (e) => {
    const { name, value } = e.target;
    setInputvalue({ ...inputvalue, [name]: value });
  };

  const postData1 = async (page) => {
    const permission = await axios.post(
      `${process.env.REACT_APP_BASE_URL}CheckPermission`,
      {
        staff_id: userid,
        route_url: "order/details",
        user_type: usertype,
      }
    );
    if (permission.data.success) {
      const postdat = {
        origin: inputvalue.origin,
        destination: inputvalue.destination,
        startDate: inputvalue.startDate,
        endDate: inputvalue.endDate,
        freightType: inputvalue.freight,
        freightSpeed: inputvalue.type,
      };
      axios
        .post(`${process.env.REACT_APP_BASE_URL}/order/details`, postdat)
        .then((response) => {
          if (response.data.success === true) {
            closeModal1();
          }
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } else {
      toast.error("Permission Denied: You don’t have access to this page");
    }
  };

  const handleclicknavibillofla = (item) => {
    console.log(item);
    axios
      .post(`${process.env.REACT_APP_BASE_URL}get-estimate-details`, {
        estimate_id: item.estimate_id,
      })
      .then((response) => {
        if (response.data.success === true) {
          navigate("/Admin/downlaodpdf", {
            state: { data: response.data.data },
          });
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const handlesearchapi = () => {
    setCurrentPage(1);
    getorder(1, searchQuery, false);
  };

  // edit order code////////////////////////////////////////////////////////////
  const handleupdateapi = (e) => {
    const { name, value } = e.target;
    setInputdata({ ...inputdata, [name]: value });
  };

  const openModalopen = () => setIsOpen(true);
  // function to close modal
  const closeModalclose = () => setIsOpen(false);

  const handleupdate = (freight_id) => {
    const setUSer = data.filter((item) => item.freight_id === freight_id);
    const getUSer = setUSer[0];
    console.log(getUSer);
    setInputdata({
      freight_id: freight_id,
      client_ref: getUSer.client_ref,
      type: getUSer.type,
      freight: getUSer.freight,
      incoterm: getUSer.incoterm,
      dimension: getUSer.dimension,
      weight: getUSer.weight,
      comment: getUSer.comment,
      fcl_lcl: getUSer.fcl_lcl,
      no_of_packages: getUSer.no_of_packages,
      package_type: getUSer.package_type,
      commodity: getUSer.commodity,
      hazardous: getUSer.hazardous,
      country_of_origin: getUSer.collection_from,
      destination_country: getUSer.delivery_to,
      supplier_address: getUSer.supplier_address,
      port_of_loading: getUSer.port_of_loading,
      post_of_discharge: getUSer.post_of_discharge,
      place_of_delivery: getUSer.place_of_delivery,
      transit_time: getUSer.transit_time,
      add_attachments: getUSer.add_attachments,
      nature_of_hazard: getUSer.nature_of_hazard,
      volumetric_weight: getUSer.volumetric_weight,
      shipment_ref: getUSer.shipment_ref,
      assign_for_estimate: getUSer.assign_for_estimate,
      assign_to_transporter: getUSer.assign_to_transporter,
      assign_warehouse: getUSer.assign_warehouse,
      assign_to_clearing: getUSer.assign_to_clearing,
      send_to_warehouse: getUSer.send_to_warehouse,
      shipment_origin: getUSer.shipment_origin,
      shipment_des: getUSer.shipment_des,
      priority: getUSer.priority,
      is_active: getUSer.is_active,
      ready_for_collection: getUSer.ready_for_collection,
      quote_received: getUSer.quote_received,
      client_quoted: getUSer.client_quoted,
      insurance: getUSer.insurance,
      product_desc: getUSer.product_desc,
      client_ref_name: getUSer.client_ref_name,
      document: getUSer.add_attachment_file,
      sales_representative: getUSer.sales_id,
    });
  };

  const handleupdateapipost = (freight_id) => {
    console.log(inputdata.client_ref);
    const formdata = new FormData();
    formdata.append("date", formattedDate);
    formdata.append("id", inputdata.freight_id);
    formdata.append("client_ref", inputdata?.client_ref);
    formdata.append("type", inputdata?.type);
    formdata.append("freight", inputdata.freight);
    formdata.append("incoterm", inputdata.incoterm);
    formdata.append("dimension", inputdata.dimension);
    formdata.append("weight", inputdata.weight);
    formdata.append("quote_received", inputdata.quote_received);
    formdata.append("client_quoted", inputdata.client_quoted);
    formdata.append("is_active", inputdata.is_active);
    formdata.append("destination_country", inputdata.delivery_to);
    formdata.append("comment", inputdata.comment);
    formdata.append("no_of_packages", inputdata.no_of_packages);
    formdata.append("fcl_lcl", inputdata.fcl_lcl);
    formdata.append("package_type", inputdata.package_type);
    formdata.append("insurance", inputdata.insurance);
    formdata.append("commodity", inputdata.commodity);
    formdata.append("hazardous", inputdata.hazardous);
    formdata.append("country_of_origin", inputdata.collection_from);
    formdata.append("supplier_address", inputdata.supplier_address);
    formdata.append("port_of_loading", inputdata.port_of_loading);
    formdata.append("post_of_discharge", inputdata.post_of_discharge);
    formdata.append("place_of_delivery", inputdata.place_of_delivery);
    formdata.append("ready_for_collection", inputdata.ready_for_collection);
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
      console.log("Doc Type:", doc.name);

      doc.files.forEach((file) => {
        formdata.append(doc.name, file); // 👈 each file append
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
          closeModalclose();
          getorder();
          toast.success(response.data.message);
        }
        return 0;
      })
      .catch((error) => {
        console.error(error.response);
        toast.error(error.response?.data || "An error occurred");
      });
  };

  const track123 = async (item) => {
    try {
      const body = {
        freight_id: item?.freight_id,
        order_id: item?.order_id,
      };
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}add_freight_to_warehouse`,
        body
      );
      toast.success(res.data.message);
      getorder();
      closeModal();
      setOpenModalorder(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const [supplierOptions, setSupplierOptions] = useState([])
  const [warehouseType, setWarehouseType] = useState(""); // radio state
  const [selectedSupplier, setSelectedSupplier] = useState("");

  useEffect(() => {
    getSupplier()
  }, [])

  const getSupplier = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}getWarehouseSupplierList`);
      console.log(response.data);
      if (response.data.success) {
        setSupplierOptions(response.data.data)
      }
    } catch (error) {
      console.log(error);
    }
  }
  const handleWarehouseChange = async (e) => {
    const type = e.target.value;
    setWarehouseType(type);
    if (type === "asia") {

    }
  };

  const handleUpdateForSupplier = async () => {
    if (!selectedSupplier) {
      toast.error("Please select supplier!");
      return;
    }
    try {
      const body = {
        freight_id: selectedItem?.freight_id,
        order_id: selectedItem?.order_id,
        supplier_id: selectedSupplier,
      };
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}assignWarehouseSupplierToOrder`,
        body
      );
      toast.success(res.data.message);
      getorder();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const closewarehouse = () => {
    setOpenModalorder(false);
  };

  const handleCreateInvoice = async (freight_quote_estimate_id) => {
    try {
      setLoader(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}createQuoteInvoice`,
        { freight_quote_estimate_id }
      );
      setLoader(false);
      if (response.data && response.data.success) {
        toast.success(response.data.message || "Invoice created Successfuly");
        getorder();
      } else {
        toast.error(response.data.message || "Failed to create invoice");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error creating invoice:", error);
      toast.error(error.response?.data?.message || "Something went wrong while creating invoice");
    }
  };

  return (
    <>
      <Modal
        open={openModalorder}
        onClose={closewarehouse}
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
          }}
        >
          <div className="modal-content modal-dialog modal-dialog-centered">
            <div className="modal-header" style={{ width: "350px" }}>
              <h5 className="modal-title">Assign Order</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closewarehouse}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modalManageFreight frightFormSec md_update p-4">
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-12 mb-3">
                    <h5>Select Warehouse</h5>
                    <div className="d-flex justify-content-between">
                      <div>
                        <input
                          type="radio"
                          id="asiaDirect"
                          name="warehouse"
                          value="asia"
                          checked={warehouseType === "asia"}
                          onChange={handleWarehouseChange}
                        />
                        <label htmlFor="asiaDirect" className="ms-2">
                          Asia Direct Warehouse
                        </label>
                      </div>
                      <div className="">
                        <input
                          type="radio"
                          id="supplierWare"
                          name="warehouse"
                          value="supplier"
                          checked={warehouseType === "supplier"}
                          onChange={handleWarehouseChange}
                        />
                        <label htmlFor="supplierWare" className="ms-2">
                          Supplier Warehouse
                        </label>
                      </div>
                    </div>
                  </div>
                  {warehouseType === "supplier" && (
                    <div className="col-lg-12 mt-3">
                      <label>Select Supplier</label>
                      <select
                        className="form-control"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                      >
                        <option value="">Select Supplier</option>
                        {supplierOptions.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {warehouseType === "supplier" && (
                <button type="button" onClick={handleUpdateForSupplier}>
                  Update
                </button>
              )}
              <button
                type="button"
                className="btn cross_btn ms-2"
                onClick={closewarehouse}
              >
                Close
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      {loader ? (
        <div class="loader-container">
          <div class="loader"></div>
          <p class="loader-text">Updating... This may take some time</p>
        </div>
      ) : (
        <div className="wpWrapper">
          <div className="container-fluid">
            <div className="row  manageFreight">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="freight_hd">Order's Details</h4>
                  </div>
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="mx-2 searchManageFre">
                      <input
                        className="my-1 py-1 rounded ps-1"
                        value={searchQuery}
                        placeholder="Search"
                        onChange={handleSearch}
                      ></input>
                    </div>
                    <div className="mx-1">
                      <button onClick={handlesearchapi}>Search</button>
                    </div>
                    <div className="">
                      <button onClick={openModal1}>Filter</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="">
                <div>
                  <table className="table table-striped tableICon">
                    <tbody>
                      {pagenation.data &&
                        pagenation.data.length > 0 &&
                        pagenation.data.map((item, index) => {
                          console.log(item);
                          return (
                            <tr key={index}>
                              <td className="list_bd">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <p className="client_nm">
                                      {item.client_name}
                                    </p>
                                    <p className="fright_no mx-2 fs-6">
                                      {item?.freight_number}
                                    </p>{" "}
                                    /
                                    <p className="fright_no mx-2 fs-6">
                                      {`OR000${item?.order_id}`}
                                    </p>
                                  </div>
                                  <div className="">
                                    <p className="port_date">
                                      {new Date(
                                        item.order_created_date
                                      ).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                </div>
                                <div className="container-fluid">
                                  <div className="row">
                                    <div className="col-md-3 ps-0">
                                      <div className="">
                                        <p className="origin">
                                          {item.product_desc ? item.product_desc : item.goods_description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="col-md-5">
                                      <div className="d-flex align-items-center justify-content-center">
                                        <p className="origin">
                                          {item.collection_from_country ? item.collection_from_country : item.warouse_from_country}
                                        </p>
                                        <div className="arrow">
                                          <i className="fi fi-rr-arrow-right mx-2 arr_icon"></i>
                                        </div>
                                        <p className="origin">
                                          {item.delivery_to_country ? item.delivery_to_country : item.warouse_delivery_to}
                                          <span className="fright_type">
                                            ({item?.freight ? item.freight : item.warehouse_freight_type})
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
                                            <a className="dropdown-item det_page">
                                              <ul className="p-0 m-0">
                                                {
                                                  item?.warehouse_freight_type ? "" : <li
                                                    className="page_list"
                                                    style={{
                                                      cursor: "pointer",
                                                      fontSize: "15px",
                                                    }}
                                                    onClick={() => {
                                                      handledeliveryEye(item?.id);
                                                    }}
                                                  >
                                                    <RemoveRedEyeIcon /> View
                                                    Details
                                                  </li>
                                                }
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    setSelectedFreightIdForDocs(item?.freight_id);
                                                    setSelectedOrderIdForDocs(item?.order_id);
                                                    handleShow();
                                                  }}
                                                >
                                                  <FileUploadIcon /> Upload
                                                  Document
                                                </li>
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    Shippinginstruction(
                                                      item?.id
                                                    );
                                                  }}
                                                >
                                                  <IntegrationInstructionsIcon />{" "}
                                                  Booking Instruction
                                                </li>
                                                {
                                                  item?.warehouse_freight_type ? "" :
                                                    <li
                                                      className="page_list"
                                                      style={{
                                                        cursor: "pointer",
                                                        fontSize: "15px",
                                                      }}
                                                      onClick={() => {
                                                        Shippingorderedit(item);
                                                      }}
                                                    >
                                                      <IntegrationInstructionsIcon />{" "}
                                                      Edit Order
                                                    </li>
                                                }

                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    track(item?.id);
                                                  }}
                                                >
                                                  <RoomIcon /> Track Order
                                                </li>
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    assignclearing(item);
                                                  }}
                                                >
                                                  <NotInterestedIcon /> Assign
                                                  Clearing
                                                </li>
                                                {
                                                  item.warehouse_freight_type ? "" :
                                                    <li
                                                      className="page_list"
                                                      style={{
                                                        cursor: "pointer",
                                                        fontSize: "15px",
                                                      }}
                                                      onClick={() => {
                                                        track12311(item);
                                                      }}
                                                    >
                                                      <ContentCopyIcon /> Edit
                                                      Estimate
                                                    </li>
                                                }
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    track123(item);
                                                  }}
                                                >
                                                  <WarehouseIcon /> Assign
                                                  Warehouse
                                                </li>
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    handledelivery(item?.id);
                                                  }}
                                                >
                                                  <DownloadingIcon /> Loading
                                                  Details
                                                </li>

                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    handlenavival(item?.id);
                                                  }}
                                                >
                                                  <LocalShippingIcon /> Delivery
                                                  details
                                                </li>
                                                <li className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => handleCreateInvoice(item?.freight_quote_estimate_id)}>
                                                  <ReceiptIcon />
                                                  Create Invoice
                                                </li>
                                              </ul>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-lg-3">
                                    <div className="d-flex align-items-center">
                                      <span className="dot bg-success me-2"></span>
                                      <label className="status mb-0">
                                        {item.track_status === null ? (
                                          <p className="text-success mb-0">
                                            Accepted
                                          </p>
                                        ) : (
                                          <p className="text-success mb-0">
                                            {item.track_status}
                                          </p>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                  <div className="col-lg-5"></div>
                                  <div className="col-lg-2">
                                    <p> {item.sales_representative_name}</p>
                                  </div>
                                  <div className="col-lg-2  ">
                                    <div className="d-flex justify-content-end me-2">
                                      <div>
                                        <ReplayIcon
                                          className="me-2"
                                          onClick={() => {
                                            handleclickrestore(item);
                                          }}
                                        />
                                      </div>
                                      <div className="dropdown">
                                        <a
                                          href=""
                                          type="button"
                                          className="act_btn dropdown-toggle"
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                        >
                                          PDF
                                        </a>
                                        <div className="dropdown-menu">
                                          <a className="dropdown-item det_page">
                                            <ul className="p-0 m-0">
                                              <li
                                                className="page_list"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                }}
                                                onClick={() => {
                                                  handleclicknaviwaybill(
                                                    item?.freight_id
                                                  );
                                                }}
                                              >
                                                <PictureAsPdfIcon /> Way bill
                                              </li>
                                              <li
                                                className="page_list"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                }}
                                                onClick={() => {
                                                  handleclicknaviauthority(
                                                    item?.id
                                                  );
                                                }}
                                              >
                                                <PictureAsPdfIcon /> Letter of
                                                Authority
                                              </li>
                                              <li
                                                className="page_list"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                }}
                                                onClick={() => {
                                                  handleclicknavibilloflaadding(
                                                    item?.id
                                                  );
                                                }}
                                              >
                                                <PictureAsPdfIcon /> Delivery
                                                Note
                                              </li>
                                              <li
                                                className="page_list"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                }}
                                                onClick={() => {
                                                  handleclicknavibilloflaadding11(
                                                    item?.id
                                                  );
                                                }}
                                              >
                                                <PictureAsPdfIcon /> Custom
                                                Clearings
                                              </li>
                                              {item.estimate_id ? (
                                                <li
                                                  className="page_list"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                  }}
                                                  onClick={() => {
                                                    handleclicknavibillofla(
                                                      item
                                                    );
                                                  }}
                                                // onClick={() => {
                                                //   handleclicknavibilloflaadding11(
                                                //     item?.id
                                                //   );
                                                // }}
                                                >
                                                  <PictureAsPdfIcon /> Download
                                                  Estimate
                                                </li>
                                              ) : (
                                                ""
                                              )}
                                            </ul>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
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
          </div>
        </div>
      )}
      {show1 && (
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
      )}
      <Modal
        open={isOpen}
        onClose={closeModalclose}
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
              xs: "95%",   // mobile
              sm: "80%",   // tablet
              md: "75%",   // small laptop
              lg: "70%",   // desktop
            },

          }}
        >
          <div className="">
            <div className="modal-content modal-dialog modal-dialog-centered">
              <div className="modal-header" style={{ width: "100%" }}>
                <h5 className="modal-title" id="staticBackdropLabel">
                  Update Freight
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModalclose}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="modalManageFreight frightFormSec md_update p-4">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="mb-3">
                        <h4 className="">Shipment details</h4>
                      </div>
                      <div>
                        <div className="row ">
                          <div className="col-md-12">
                            <div className="borderShip mt-0">
                              <div className="row">

                                <div className="col-lg-6 mb-3">
                                  <label>Date</label>
                                  <input
                                    className="mt-0"
                                    type="date"
                                    value={formattedDate}
                                    name="date"
                                  />
                                </div>
                                <div className="col-lg-6 mb-3">
                                  <label>Client</label>
                                  <select
                                    value={inputdata?.client_id}
                                    onChange={handleupdateapi}
                                    placeholder="client refrence"
                                    name="client_ref"
                                  >
                                    {lcientlist &&
                                      lcientlist.length > 0 &&
                                      lcientlist.map((item, index) => {
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
                                <div className=" col-lg-6  mb-3">
                                  <label>Freight</label>
                                  <select
                                    name="type"
                                    value={inputdata?.type}
                                    onChange={handleupdateapi}
                                  >
                                    <option value="">Select...</option>
                                    <option value="express">Express</option>
                                    <option value="normal">Normal</option>
                                  </select>
                                </div>
                                <div className=" col-lg-6  mb-3">
                                  <label>Freight Type</label>
                                  <select
                                    name="freight"
                                    value={inputdata?.freight}
                                    onChange={handleupdateapi}
                                  >
                                    <option value="">Select...</option>
                                    <option value="Sea">Sea</option>
                                    <option value="Air">Air</option>
                                    <option value="Road">Road</option>
                                  </select>
                                </div>
                                <div className=" col-lg-6  mb-3">
                                  <label>Client Reference</label>
                                  <input
                                    name="client_ref_name"
                                    value={inputdata?.client_ref_name}
                                    onChange={handleupdateapi}
                                  ></input>
                                </div>
                                <div className=" col-lg-6  mb-3">
                                  <label>Product Description</label>
                                  <input
                                    name="product_desc"
                                    value={inputdata?.product_desc}
                                    onChange={handleupdateapi}
                                  ></input>
                                </div>
                                <div className="col-lg-12 mb-3">
                                  <label>Estimated Transit Time</label>
                                  <input
                                    type="text"
                                    onKeyPress={handlekey}
                                    placeholder="Transit Time"
                                    value={inputdata?.transit_time}
                                    onChange={handleupdateapi}
                                    name="transit_time"
                                  />
                                </div>
                                <div className="col-lg-6 mb-3 spaceAssignEst">
                                  <FormControl>
                                    <FormLabel id="demo-row-radio-buttons-group-label">
                                      <label>Priority</label>
                                    </FormLabel>
                                    <RadioGroup
                                      aria-labelledby="demo-row-radio-buttons-group-label"
                                      value={inputdata?.priority}
                                      name="priority"
                                      onChange={handlePriorityChange}
                                    >
                                      <FormControlLabel
                                        value="High"
                                        control={<Radio size="small" />}
                                        label="High"
                                      />
                                      <FormControlLabel
                                        value="Medium"
                                        control={<Radio size="small" />}
                                        label="Medium"
                                      />
                                      <FormControlLabel
                                        value="Low"
                                        control={<Radio size="small" />}
                                        label="Low"
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                </div>
                                <div className="col-lg-6 mb-3 spaceAssignEst">
                                  <FormControl>
                                    <FormLabel id="demo-row-radio-buttons-group-label">
                                      <label>Shipment Reference</label>
                                    </FormLabel>
                                    <RadioGroup
                                      aria-labelledby="demo-row-radio-buttons-group-label"
                                      value={inputdata?.shipment_ref} // Ensure this is correctly bound to the state
                                      name="shipment_ref"
                                      onChange={handleshipmentrefChange}
                                    >
                                      <FormControlLabel
                                        value="shipper"
                                        control={<Radio size="small" />}
                                        label="shipper"
                                      />
                                      <FormControlLabel
                                        value="consignee"
                                        control={<Radio size="small" />}
                                        label="consignee"
                                      />
                                    </RadioGroup>
                                  </FormControl>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 mb-3">
                        <h4>Cargo transit details</h4>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="borderShip mt-3">
                            <div className="row">
                              <div className="col-lg-6 mb-3">
                                <label>Country of Origin</label>
                                <select
                                  name="collection_from"
                                  onChange={handleupdateapi}
                                  value={inputdata?.collection_from}
                                >
                                  <option value="">select....</option>
                                  {updatedata &&
                                    updatedata.length > 0 &&
                                    updatedata.map((item, index) => (
                                      <option key={index} value={item.id}>
                                        {item.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div className=" col-lg-6  mb-3">
                                <label> Destination Country</label>
                                <select
                                  name="delivery_to"
                                  onChange={handleupdateapi}
                                  value={inputdata?.delivery_to}
                                >
                                  <option>select....</option>
                                  {updatedata &&
                                    updatedata.length > 0 &&
                                    updatedata.map((item, index) => {
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
                              <div className="col-lg-6 mb-3">
                                <label>Port of Loading</label>
                                <input
                                  type="text"
                                  name="port_of_loading"
                                  value={inputdata?.port_of_loading}
                                  onChange={handleupdateapi}
                                  placeholder="Port of Loading"
                                />
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label> Port of Discharge</label>
                                <input
                                  type="text"
                                  name="post_of_discharge"
                                  onChange={handleupdateapi}
                                  value={inputdata?.post_of_discharge}
                                  placeholder="Port of Discharge"
                                />
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label>Place of Delivery</label>
                                <input
                                  type="text"
                                  name="place_of_delivery"
                                  onChange={handleupdateapi}
                                  value={inputdata?.place_of_delivery}
                                  placeholder="Place of Delivery"
                                />
                              </div>
                              <div className="col-lg-6">
                                <label> Incoterm </label>
                                <select
                                  name="incoterm"
                                  onChange={handleupdateapi}
                                  value={inputdata?.incoterm}
                                >
                                  <option value="">Select...</option>
                                  <option value="CFR">CFR</option>
                                  <option value="CIF">CIF</option>
                                  <option value="DAP">DAP</option>
                                  <option value="DDU">DDU</option>
                                  <option value="DDP">DDP</option>
                                  <option value="EXW">EXW</option>
                                  <option value="FCA">FCA</option>
                                  <option value="FOB">FOB </option>
                                </select>
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label>Place of Receipt/ Supplier Address</label>
                                <input
                                  type="text"
                                  name="supplier_address"
                                  onChange={handleupdateapi}
                                  value={inputdata?.supplier_address}
                                  placeholder="Supplier Address"
                                />
                              </div>

                              <div className="col-lg-6 mb-3">
                                <label>Type</label>

                                <select
                                  name="fcl_lcl"
                                  onChange={handleupdateapi}
                                  value={inputdata?.fcl_lcl}
                                >
                                  <option>Select...</option>
                                  <option value={"FCL"}>FCL</option>
                                  <option value={"LCL"}>LCL</option>
                                </select>
                              </div>

                              <div>
                                <div className="row">
                                  <div className="col-lg-6">
                                    <FormControl>
                                      <FormLabel id="demo-row-radio-buttons-group-label">
                                        <label>Origin</label>
                                      </FormLabel>
                                      <RadioGroup
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        value={inputdata?.shipment_origin}
                                        name="shipment_origin"
                                        onChange={shipment_origin}
                                      >
                                        <FormControlLabel
                                          value="Shipper will deliver at Asia Direct - Africa warehouse"
                                          control={<Radio size="small" />}
                                          label="Shipper will deliver at Asia Direct - Africa warehouse"
                                        />
                                        <FormControlLabel
                                          value="Asia Direct will collect from shipper address"
                                          control={<Radio size="small" />}
                                          label="Asia Direct will collect from shipper address"
                                        />
                                        <FormControlLabel
                                          value="Shipper will deliver to the port of loading"
                                          control={<Radio size="small" />}
                                          label="Shipper will deliver to the port of loading"
                                        />
                                        <FormControlLabel
                                          value="Shipper will deliver and facilitate export at the Port of loading"
                                          control={<Radio size="small" />}
                                          label="Shipper will deliver and facilitate export at the Port of loading"
                                        />
                                      </RadioGroup>
                                    </FormControl>
                                  </div>
                                  <div className="col-lg-6">
                                    <label>Destination</label>
                                    <FormControl>
                                      <RadioGroup
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        value={inputdata?.shipment_des}
                                        name="shipment_des"
                                        onChange={shipment_des}
                                      >
                                        <FormControlLabel
                                          value="Asia Direct will deliver to the Address"
                                          control={<Radio size="small" />}
                                          label="Asia Direct will deliver to the Address"
                                        />
                                        <FormControlLabel
                                          value="Consignee will collect at Asia Direct - Africa warehouse"
                                          control={<Radio size="small" />}
                                          label="Consignee will collect at Asia Direct - Africa warehouse"
                                        />
                                        <FormControlLabel
                                          value="Consignee will collect at the nearest port"
                                          control={<Radio size="small" />}
                                          label="Consignee will collect at the nearest port"
                                        />
                                        <FormControlLabel
                                          value="Consignee will collect and facilitate import at destination port"
                                          control={<Radio size="small" />}
                                          label="Consignee will collect and facilitate import at destination port"
                                        />
                                      </RadioGroup>
                                    </FormControl>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3 mt-5 g-2">
                        <div className="col-md-6">
                          <h4 className="freight_hd">Document Section</h4>
                          <span class="line"></span>
                        </div>
                        <div className="col-md-6 text-md-end text-sm-start">
                          <button
                            className="blueBtn"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFreightIdForDocs(inputdata?.freight_id);
                              setSelectedOrderIdForDocs(inputdata?.order_id);
                              handleShow();
                            }}
                          >
                            Upload Documents
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4>Product Description</h4>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="borderShip mt-3">
                            <div className="row ">
                              <div className="col-lg-6 mb-3">
                                <label>Package Type</label>
                                <br />
                                <select
                                  name="package_type"
                                  value={inputdata?.package_type}
                                  onChange={handleupdateapi}
                                  className="form-control"
                                >
                                  <option value="">Select...</option>
                                  <option value="box">Box</option>
                                  <option value="crate">Crate</option>
                                  <option value="pallet">Pallet</option>
                                  <option value="bags">Bags</option>
                                </select>
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label> No. of Packages</label>
                                <input
                                  type="text"
                                  onKeyPress={handlekey}
                                  name="no_of_packages"
                                  onChange={handleupdateapi}
                                  value={inputdata?.no_of_packages}
                                  placeholder="Num.. of Package"
                                />
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label>Commodity</label>
                                <select
                                  name="commodity"
                                  onChange={handleupdateapi}
                                  value={inputdata?.commodity}
                                  placeholder="Comment"
                                >
                                  <option>Select...</option>
                                  {apidata &&
                                    apidata.length > 0 &&
                                    apidata.map((item, index) => {
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
                              <div className="col-lg-6 mb-3">
                                <label> Dimension</label>
                                <input
                                  type="text"
                                  onChange={handleupdateapi}
                                  value={inputdata?.dimension}
                                  onKeyPress={handlekey}
                                  name="dimension"
                                  placeholder="Dimension"
                                />
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label> Weight</label>
                                <input
                                  type="text"
                                  onKeyPress={handlekey}
                                  onChange={handleupdateapi}
                                  value={inputdata?.weight}
                                  name="weight"
                                  placeholder="Weight"
                                />
                              </div>
                              <div className="col-lg-6 mb-3">
                                <label> Volumetric Weight</label>
                                <input
                                  type="text"
                                  disabled
                                  onKeyPress={handlekey}
                                  name="volumetric_weight"
                                  value={
                                    inputdata?.dimension
                                      ? 167 * inputdata?.dimension
                                      : inputdata?.volumetric_weight
                                  }
                                  placeholder="Volumetric Weight"
                                />
                              </div>
                              {inputdata.hazardous === "yes" ? (
                                <div className=" col-lg-6  mb-3">
                                  <label> Nature of hazard</label>
                                  <select
                                    name="nature_of_hazard"
                                    onChange={handleupdateapi}
                                    value={inputdata?.nature_of_hazard}
                                  >
                                    <option value="">Select...</option>
                                    <option value="General Cargo">
                                      General Cargo
                                    </option>
                                    <option value="Explosive">Explosive</option>
                                    <option
                                      value="Class 3 flammable
                                                               liquids"
                                    >
                                      Class 3 flammable liquids
                                    </option>
                                    <option value="Corrosives">Corrosives</option>
                                    <option value="Class 2 gases">
                                      Class 2 gases
                                    </option>
                                    <option value="Compressed gas">
                                      Compressed gas
                                    </option>
                                    <option value="Infection">Infection</option>
                                    <option value="Corrosive">Corrosive</option>
                                    <option value="Flammable">Flammable</option>
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
                                      Class 9 other substances and articles
                                    </option>
                                    <option value="Dry ice">Dry ice</option>
                                    <option value="Poison">Poison</option>
                                    <option value="Batteries">Batteries</option>
                                    <option value="Gases">Gases</option>
                                    <option value="Refrigerated">
                                      Refrigerated
                                    </option>
                                    <option value="Inflammable">Inflammable</option>
                                    <option value="Air bags">Air bags</option>
                                    <option value="Ammunition">Ammunition</option>
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
                                  value={inputdata?.comment}
                                  placeholder="write your comment here.."
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4 spaceAssignEst">
                      <div className="mb-3">
                        <h4 class="text-white">Shipment details</h4>
                      </div>
                      <div>
                        <div className=" borderShip mt-0">
                          <div className="shipRefer mb-3">
                            <FormControl>
                              <FormLabel id="demo-row-radio-buttons-group-label">
                                <label>Insurance</label>
                              </FormLabel>
                              <RadioGroup
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                value={inputdata?.insurance}
                                name="insurance"
                                onChange={handleiinsurance}
                              >
                                <FormControlLabel
                                  value="Yes"
                                  control={<Radio size="small" />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="No"
                                  control={<Radio size="small" />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <div className="shipRefer mb-3">
                            <FormControl>
                              <FormLabel id="demo-row-radio-buttons-group-label">
                                <label>Ready for collection</label>
                              </FormLabel>
                              <RadioGroup
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                value={inputdata?.ready_for_collection}
                                name="ready_for_collection"
                                onChange={handlereadyforcollection}
                              >
                                <FormControlLabel
                                  value="Yes"
                                  control={<Radio size="small" />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="No"
                                  control={<Radio size="small" />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <div className=" col-lg-6 mb-3">
                            <FormControl>
                              <FormLabel id="demo-row-radio-buttons-group-label">
                                <label>Hazardous</label>
                              </FormLabel>
                              <RadioGroup
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                value={inputdata?.hazardous}
                                name="hazardous"
                                onChange={handlereadyhazardous}
                              >
                                <FormControlLabel
                                  value="yes"
                                  control={<Radio size="small" />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="no"
                                  control={<Radio size="small" />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </div>
                        </div>
                        <div className="borderShip mt-4">
                          <div className="mb-3">
                            <label> Assign to Transporter</label>

                            <select
                              name="assign_to_transporter"
                              onChange={handleupdateapi}
                              value={inputdata?.assign_to_transporter}
                            >
                              <option value="">Select...</option>
                              <option value="Asia Direct - Africa">
                                Asia Direct - Africa
                              </option>
                              <option value="OBD Logistics">
                                OBD Logistics
                              </option>
                              <option value="SACO CFR">SACO CFR</option>
                              <option value="Shenzhen Nimbus">
                                Shenzhen Nimbus
                              </option>
                            </select>
                          </div>
                          <div className="shipRefer mb-3">
                            <label>Send to Warehouse</label>
                            <div>
                              <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label"></FormLabel>
                                <RadioGroup
                                  aria-labelledby="demo-row-radio-buttons-group-label"
                                  value={inputdata?.send_to_warehouse}
                                  name="send_to_warehouse"
                                  onChange={send_to_warehouse}
                                >
                                  <FormControlLabel
                                    value="Yes"
                                    control={<Radio size="small" />}
                                    label="Yes"
                                  />
                                  <FormControlLabel
                                    value="No"
                                    control={<Radio size="small" />}
                                    label="No"
                                  />
                                </RadioGroup>
                              </FormControl>

                            </div>
                          </div>
                        </div>
                        <div className="borderShip mt-4">
                          <div className="mb-3">
                            <label>Assign Warehouse</label>
                            <select
                              name="assign_warehouse"
                              onChange={handleupdateapi}
                              value={inputdata?.assign_warehouse}
                            >
                              <option value="">Select...</option>
                              <option value="Asia Direct Hre">
                                Asia Direct Hre
                              </option>
                              <option value="Asia Direct - SA">
                                Asia Direct - SA
                              </option>
                              <option value="Jingwei International Logistics">
                                Jingwei International Logistics
                              </option>
                              <option value="OBD Logistics">
                                OBD Logistics
                              </option>
                              <option value="Shenzhen Nimbus">
                                Shenzhen Nimbus
                              </option>
                            </select>
                          </div>
                          <div className="shipRefer mb-3">
                            <label>Assign to Clearing</label>
                            <div>
                              <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label"></FormLabel>
                                <RadioGroup
                                  aria-labelledby="demo-row-radio-buttons-group-label"
                                  value={inputdata?.assign_to_clearing}
                                  name="assign_to_clearing"
                                  onChange={assign_to_clearing}
                                >
                                  <FormControlLabel
                                    value="Yes"
                                    control={<Radio size="small" />}
                                    label="Yes"
                                  />
                                  <FormControlLabel
                                    value="No"
                                    control={<Radio size="small" />}
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
                </div>
              </div>
              <div className="modal-footer gap-2 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    handleupdateapipost();
                  }}
                  className="blueBtn"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="redBtn"
                  onClick={closeModalclose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
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
            Minwidth: 450,
            bgcolor: "background.paper",
            boxShadow: 24,
          }}
        >
          <div className="modal-header">
            <h2 id="modal-modal-title">Add Excel Order</h2>
            <button className="btn btn-close" onClick={closeModal}>
              <CloseIcon />{" "}
            </button>
          </div>
          <div className="newModalGap">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="mb-3 border ps-2 py-2 rounded w-100"
              style={{ display: "block", marginTop: "16px" }}
            />
            <Button variant="contained" onClick={postData}>
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

            <h2 id="modal-modal-title">Filter</h2>

            <button className="btn btn-close" onClick={closeModal1}>
              <CloseIcon />{" "}
            </button>
          </div>

          <div className="newModalGap   noFormaControl">
            <div className="row g-3">
              <div className="col-md-6">
                <label>Delivery Type</label>
                <select name="type" onChange={handlechange}>
                  <option value="">Select</option>
                  <option value="express">Express</option>
                  <option value="normal">Consolidation</option>
                </select>
              </div>
              <div className="col-md-6">
                <label>Priority </label>
                <div className="shipRefer1 d-flex radioBtn">
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
                <select name="origin" onChange={handlechange}>
                  <option value="">Select</option>
                  {countries &&
                    countries.length > 0 &&
                    countries.map((item, index) => {
                      return (
                        <>
                          <option value={item.id} key={index}>
                            {item.name}
                          </option>
                        </>
                      );
                    })}
                </select>
              </div>
              <div className="col-md-6">
                <label>Delivery to Country </label>
                <select name="destination" onChange={handlechange}>
                  <option value="">Select</option>
                  {countries &&
                    countries.length > 0 &&
                    countries.map((item, index) => {
                      return (
                        <>
                          <option value={item.id} key={index}>
                            {item.name}
                          </option>
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

              <div className="col-md-6">
                <label>Freight</label>
                <select name="freight" onChange={handlechange}>
                  <option value="">Select...</option>
                  <option value="Sea">Sea</option>
                  <option value="Air">Air</option>
                  <option value="Road">Road</option>
                </select>
              </div>
            </div>
            <div className="col-md-12 text-center mt-4">
              <button variant="contained" className="blueBtn" onClick={postData1}>
                Apply
              </button>

            </div>
          </div>
        </Box>
      </Modal>
      
    </>
  );
}
