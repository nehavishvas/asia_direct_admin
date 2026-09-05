import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import { BiRightArrowCircle } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { BiLeftArrowCircle } from "react-icons/bi";
import whiteLogoNew from "../../images/logoWhiteNew.png";
import OtherHousesOutlinedIcon from "@mui/icons-material/OtherHousesOutlined";
import AddLinkIcon from "@mui/icons-material/AddLink";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import DashboardIcon from '@mui/icons-material/Dashboard';
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PinDropIcon from '@mui/icons-material/PinDrop';
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Group } from "@mui/icons-material";
import CompanyAddresses from "../../pages/CompanyAddresses";
const routes = [
  {
    path: "/Admin/dashboard",
    name: "Dashboard",
    icon: <SpeedOutlinedIcon />,
  },
  {
    path: "",
    name: "Enquiries",
    icon: <AssignmentIndIcon />,
    subRoutes: [
      {
        path: "/Admin/managefreight",
        name: "Freight by Admin",
        icon: <SupervisorAccountOutlinedIcon />,
      },
      {
        path: "/Admin/freight",
        name: "Freight by User",
        icon: <FaUser />,
      },
      {
        path: "/Admin/custom-clearance-order",
        name: "Custom by Admin",
        icon: <SupervisorAccountOutlinedIcon />,
      },
      {
        path: "/Admin/Custom-clearence-byuser",
        name: "Custom by User",
        icon: <FaUser />,
      },
      {
        path: "/Admin/query",
        name: "Dispute",
        icon: <QueryStatsIcon />,
      },
      {
        path: "/Admin/notifications",
        name: "Notifications",
        icon: <NotificationsActiveOutlinedIcon />,
      },
    ],
  },
  {
    path: "",
    name: "Freight Management",
    icon: <FlightOutlinedIcon />,
    subRoutes: [
      {
        path: "/Admin/order",
        name: "Freight Orders",
        icon: <ShoppingCartOutlinedIcon />,
      },
      {
        path: "/Admin/manage-shipment",
        name: "Shipments",
        icon: <PeopleAltOutlinedIcon />,
      },
      {
        path: "/Admin/releasedDashboard",
        name: "Released Dashboard",
        icon: <DashboardIcon />,
      },
      {
        path: "/Admin/calculation-order",
        name: "Clearance Order",
        icon: <ShoppingCartOutlinedIcon />,
      },
    ],
  },
  {
    path: "",
    name: "Accounts",
    icon: <InsertDriveFileIcon />,
    subRoutes: [
      {
        path: "/Admin/quotes",
        name: "Quotes",
        icon: <RequestQuoteIcon />,
      },
      {
        path: "/Admin/invoices",
        name: "Invoices",
        icon: <ReceiptIcon />,
      },
      {
        path: "/Admin/billing",
        name: "Invoice recon",
        icon: <SupervisorAccountOutlinedIcon />,
      },
      {
        path: "/Admin/sageinvoice",
        name: "Sage Customer  Invoices",
        icon: <FaUser />,
      },
      {
        path: "/Admin/cashbook",
        name: "Cashbook",
        icon: <ShoppingCartOutlinedIcon />,
      },
      {
        path: "/Admin/Supplier_Invoice",
        name: "Supplier Invoice",
        icon: <ShoppingCartOutlinedIcon />,
      },
      {
        name: "Reports",
        icon: <InsertDriveFileIcon />,
        subRoutes: [
          {
            path: "/Admin/quote-report-item",
            name: "Quote item Summary",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/sales-by-customer-report",
            name: "Sales by Customer",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/sales-by-customer-summary-report",
            name: "Sales by Customer Summary",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/sales-by-item-report",
            name: "Sales by Item",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/sales-by-sales-rep-report",
            name: "Sales by Sales Rep",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/supplier-balance-report",
            name: "Supplier Balance",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/supplier-invoice-report",
            name: "Supplier Invoice",
            icon: <ShoppingCartOutlinedIcon />,
          },
          {
            path: "/Admin/customer-balance-report",
            name: "Customer Balance",
            icon: <ShoppingCartOutlinedIcon />,
          },
        ],
      },
    ],
  },
  {
    path: "",
    name: "Warehouse",
    icon: <WarehouseOutlinedIcon />,
    subRoutes: [
      {
        path: "/Admin/WarehouseOrder",
        name: "Warehouse Order",
        icon: <ShoppingCartOutlinedIcon />,
      },
      {
        path: "/Admin/SupplierWarehouse",
        name: "Supplier Warehouse Order",
        icon: <ShoppingCartOutlinedIcon />,
      },
      {
        path: "/Admin/Batches",
        name: "Batches",
        icon: <MilitaryTechOutlinedIcon />,
      },
      {
        path: "/Admin/manage-collection-delivery",
        name: "Collection & Delivery",
        icon: <LanguageOutlinedIcon />
      },
    ],
  },
  {
    path: "",
    name: "Imports ",
    icon: <FileUploadOutlinedIcon />,
    subRoutes: [
      {
        path: "/Admin/oploadfile",
        name: "Excel",
        icon: <DriveFileMoveOutlinedIcon />,
      },
    ],
  },
  {
    path: "",
    name: "User Management ",
    icon: <PeopleAltOutlinedIcon />,
    subRoutes: [
      {
        path: "/Admin/manage-customer",
        name: "Manage Customers",
        icon: <PeopleAltOutlinedIcon />,
      },
      {
        path: "/Admin/manage-supplier",
        name: "Manage Suppliers",
        icon: <LocalShippingOutlinedIcon />,
      },
      {
        path: "/Admin/manage-staff",
        name: "Manage Staff",
        icon: <Groups2OutlinedIcon />,
      },
      {
        path:"/Admin/company-address",
        name:"Company Address",
        icon: <PinDropIcon/>,
      }
    ],
  },
  {
    path: "",
    name: "Facilities Management",
    icon: <PeopleAltOutlinedIcon />,
    subRoutes: [
      {
        path: "/Admin/Warehouse",
        name: "Warehouse",
        icon: <OtherHousesOutlinedIcon />,
      },
      {
        path: "/Admin/Customesclearingagent",
        name: "Customs Clearing Agent",
        icon: <LocalShippingOutlinedIcon />,
      },
      {
        path: "/Admin/freightForeward",
        name: "Freight Forwarder",
        icon: <Groups2OutlinedIcon />,
      },
      {
        path: "/Admin/groupageWarehouse",
        name: "Groupage Handler",
        icon: <Groups2OutlinedIcon />,
      },
      {
        path: "/Admin/RoadTransporter",
        name: "Road Transport",
        icon: <Groups2OutlinedIcon />,
      },
    ],
  },
  {
    path: "/Admin/TaskManagerstaff",
    name: "Task Manager",
    icon: <LanguageOutlinedIcon />,
  },
  {
    path: "/Admin/ClientKPIModule",
    name: "Client KPI Module",
    icon: <LanguageOutlinedIcon />,
  }
];
const userControlRoutes = {
  path: "",
  name: "User Control",
  icon: <SecurityOutlinedIcon />,
  subRoutes: [
    {
      path: "/Admin/taskmanager",
      name: "Task Manager",
      icon: <LanguageOutlinedIcon />,
    }
    , {
      path: "/Admin/contactus",
      name: "Contact Us",
      icon: <OtherHousesOutlinedIcon />,
    },
    {
      path: "/Admin/countryoforigin",
      name: "Country Of Origin",
      icon: <LanguageOutlinedIcon />,
    },
    {
      path: "/Admin/link",
      name: "Add Links",
      icon: <AddLinkIcon />,
    },
    {
      path: "/Admin/term-conditions",
      name: "Terms and Conditions",
      icon: <DescriptionOutlinedIcon />,
    },
    {
      path: "/Admin/privacy-policy",
      name: "Privacy Policy",
      icon: <PrivacyTipOutlinedIcon />,
    },
  ],
};
const SideBar = ({ children }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState({});
  const usertype = JSON.parse(localStorage.getItem("data123")).user_type;
  let filteredRoutes = routes.filter((route) => {
    if (route.path === "/Admin/TaskManagerstaff") {
      return usertype !== "1";
    }
    return true;
  });

  // ✅ yaha add karo userControlRoutes
  if (usertype === "1") {
    filteredRoutes.push(userControlRoutes);
  }
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    if (savedState !== null) {
      setIsOpen(savedState === "true");
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebarOpen", isOpen);
  }, [isOpen]);
  const toggle = () => setIsOpen(!isOpen);
  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.5,
      },
    },
  };
  const handleDropdownToggle = (index) => {
    setOpenDropdown((prevIndex) => (prevIndex === index ? null : index));
  };
  return (
    <div className="main-container sideBarpageMain">
      <div>
        <motion.div
          animate={{
            width: isOpen ? "250px" : "65px",
            transition: {
              duration: 0.5,
              type: "spring",
              damping: 10,
            },
          }}
          className={`sidebar`}
        >
          <div className="top_section" style={{ justifyContent: isOpen ? "space-between" : "center", padding: isOpen ? "5px" : "15px 0" }}>
            <AnimatePresence>
              {isOpen && (
                <motion.h1
                  variants={showAnimation}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="logo"
                >
                  <img
                    src={whiteLogoNew}
                    alt="this is image"
                    style={{ width: "150px" }}
                  />
                </motion.h1>
              )}
            </AnimatePresence>
            {
              isOpen ? (<div className="bars" style={{ borderRadius: "20px" }}>
                <BiLeftArrowCircle
                  onClick={toggle}
                  style={{ fontSize: "2rem", cursor: "pointer" }}
                />
              </div>) : (<BiRightArrowCircle size={30} onClick={toggle} style={{ cursor: "pointer" }} />)
            }
          </div>
          <div className="text-center mt-5 mt-md-0">
            <div>
              <button
                className="search"
                style={{
                  cursor: "pointer",
                  padding: isOpen ? "10px 20px" : "10px",
                  borderRadius: isOpen ? "8px" : "50%",
                  width: isOpen ? "90%" : "45px",
                  height: isOpen ? "auto" : "45px",
                  margin: "10px auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
                onClick={() => {
                  navigate("/Admin/Addfreight");
                }}
              >
                <AnimatePresence>
                  <span>
                    <ControlPointRoundedIcon />
                  </span>
                  {isOpen && (
                    <p className="addF" style={{ cursor: "pointer" }}>
                      Add Freight
                    </p>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
          <section className="routes">
            {filteredRoutes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <div key={index}>
                    <div
                      className="link dropdown-header"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDropdownToggle(index)}>
                      <div className="icon ">{route.icon}</div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            variants={showAnimation}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="link_text d-flex justify-content-between align-items-center">
                            <span>{route.name}</span>
                            {openDropdown === index ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {openDropdown === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="sub_routes">
                        {route.subRoutes.map((subRoute, subIndex) => {
                          if (subRoute.subRoutes) {
                            const isSubOpen = !!openSubDropdown[subRoute.name];
                            return (
                              <div key={subIndex} className="nested-sub-route-container">
                                <div
                                  className="link dropdown-header ps-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setOpenSubDropdown(prev => ({ ...prev, [subRoute.name]: !prev[subRoute.name] }))}
                                >
                                  <div className="icon ms-3">{subRoute.icon}</div>
                                  {isOpen && (
                                    <div className="link_text1 d-flex justify-content-between align-items-center w-100 pe-3 ms-2">
                                      <span style={{ fontSize: "14px" }}>{subRoute.name}</span>
                                      {isSubOpen ? <ExpandLessIcon style={{ fontSize: "16px" }} /> : <ExpandMoreIcon style={{ fontSize: "16px" }} />}
                                    </div>
                                  )}
                                </div>
                                {isSubOpen && isOpen && (
                                  <div className="nested-sub-routes">
                                    {subRoute.subRoutes.map((nestedRoute, nestedIndex) => (
                                      <NavLink
                                        to={nestedRoute.path}
                                        key={nestedIndex}
                                        className={({ isActive }) =>
                                          isActive ? "link active" : "link"
                                        }
                                        style={{ cursor: "pointer" }}
                                      >
                                        <div className="icon ms-5">{nestedRoute.icon}</div>
                                        {isOpen && (
                                          <div className="link_text1 ms-2" style={{ fontSize: "13px" }}>{nestedRoute.name}</div>
                                        )}
                                      </NavLink>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return (
                            <NavLink
                              to={subRoute.path}
                              key={subIndex}
                              className={({ isActive }) =>
                                isActive ? "link active" : "link"
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <div className="icon ms-4">{subRoute.icon}</div>
                              {isOpen && (
                                <div className="link_text1 ">{subRoute.name}</div>
                              )}
                            </NavLink>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                );
              }
              return (
                <NavLink
                  to={route.path}
                  key={index}
                  className={({ isActive }) =>
                    isActive ? "link active" : "link"
                  }
                >
                  <div className="icon">{route.icon}</div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        variants={showAnimation}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="link_text"
                      >
                        {route.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </section>
        </motion.div>

      </div>

      <motion.div
        animate={{
          width: isOpen ? "calc(100% - 250px)" : "100%",
          transition: {
            duration: 0.5,
            type: "spring",
            damping: 10,
          },
        }}
        className={`main_div`}
      >
        <main>{children}</main>
      </motion.div>


    </div>
  );
};
export default SideBar;