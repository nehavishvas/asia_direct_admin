// import { Box, Button, Modal } from "@mui/material";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import AddCommentIcon from "@mui/icons-material/AddComment";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import CloseIcon from "@mui/icons-material/Close";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// const pageSize = 10;
// export default function Taskmanager() {
//   const [activeTab, setActiveTab] = useState("assigned");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loader, setLoader] = useState(false);
//   // const [activeTab, setActiveTab] = useState("assigned");
//   const [assignedData, setAssignedData] = useState([]);
//   const [openPopup, setOpenPopup] = useState(false);
//   const [clearanceData, setClearanceData] = useState([]);
//   const [customData, setCustomData] = useState([]);
//   const [staffList, setStaffList] = useState([]);
//   const [supplier, setSupplier] = useState([]);
//   const [commentModal, setCommentModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [commentData, setCommentData] = useState({
//     comment: "",
//     status: "",
//   });
//   const [formData, setFormData] = useState({
//     Title: "",
//     Description: "",
//     Priority: "",
//     TaskFor: "",
//     SupplierId: "",
//     Staffid: "",
//   });
//   const navigate = useNavigate();
//   /* ================= FETCH ================= */
//   const fetchAssigned = async () => {
//     setLoader(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}getAllAssignedFreightsSatff`,
//       );
//       setAssignedData(res.data?.data || []);
//     } catch {
//       toast.error("Error");
//     } finally {
//       setLoader(false);
//     }
//   };
//   const handleclickassigntask = () => {
//     setOpenPopup(true);
//   };

//   const closeModal = () => {
//     setOpenPopup(false);
//   };
//   const fetchClearance = async () => {
//     setLoader(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}getAllAssignedClearanceSatff`,
//       );
//       setClearanceData(res.data?.data || []);
//     } catch {
//       toast.error("Error");
//     } finally {
//       setLoader(false);
//     }
//   };

//   const handlechange = (e) => {
//     const { name, value } = e.target;

//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   useEffect(() => {
//     getStaff();
//     getSupplierList();
//   }, []);
//   const getSupplierList = async () => {
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}supplier-list`,
//       );
//       setSupplier(res.data.data);
//     } catch (error) {
//       console.error("Failed to fetch staff list", error);
//     }
//   };
//   const getStaff = async () => {
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}staff-list`,
//       );
//       setStaffList(res.data.data);
//     } catch (error) {
//       console.error("Failed to fetch staff list", error);
//     }
//   };

//   const fetchCustomTasks = async () => {
//     setLoader(true);
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_BASE_URL}getAllCustomTasks`,
//       );
//       setCustomData(res.data?.data || []);
//     } catch {
//       toast.error("Error");
//     } finally {
//       setLoader(false);
//     }
//   };
//   useEffect(() => {
//     if (activeTab === "assigned") fetchAssigned();
//     if (activeTab === "clearance") fetchClearance();
//     if (activeTab === "Custom") fetchCustomTasks();
//   }, [activeTab]);
//   /* ================= TABLE ================= */
//   const tableData =
//     activeTab === "assigned"
//       ? assignedData
//       : activeTab === "clearance"
//         ? clearanceData
//         : customData;
//   const filteredData = tableData.filter((item) => {
//     if (!searchQuery) return true;
//     return JSON.stringify(item)
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//   });
//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const startIndex = (currentPage - 1) * pageSize;
//   const currentData = filteredData.slice(startIndex, startIndex + pageSize);
//   /* ================= COMMENT ================= */
//   const handleAddComment = (item) => {
//     setSelectedTask(item);
//     setCommentModal(true);
//   };

//   const postData = () => {
//     setLoader(true);
//     let payload = {
//       task_title: formData.Title,
//       description: formData.Description,
//       priority: formData.Priority,
//       staff_id: formData.Staffid,
//     };

//     axios
//       .post(`${process.env.REACT_APP_BASE_URL}createCustomTask`, payload)
//       .then((res) => {
//         if (res.data.success) {
//           toast.success("Task added successfully ✅");
//           closeModal();
//           fetchCustomTasks();
//           setFormData({
//             Title: "",
//             Description: "",
//             Priority: "",
//             TaskFor: "",
//             SupplierId: "",
//             Staffid: "",
//           });
//         } else {
//           toast.warning(res.data.message || "Failed to add task ❌");
//         }

//         setLoader(false);
//       })
//       .catch((error) => {
//         console.error(error);
//         toast.error("Failed to add task ❌");
//         setLoader(false);
//       });
//   };
//   const submitComment = async () => {
//     try {
//       let payload = {
//         // user_id: JSON.parse(localStorage.getItem("data123"))?.id,
//         task_id: selectedTask?.task_id || selectedTask?.id,
//         task_status: commentData.status,
//         notes: commentData.comment,
//       };
//       const res = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}updateTaskStatus`,
//         payload,
//       );
//       if (res.data.success) {
//         toast.success("Updated ✅");
//         setCommentModal(false);
//         setCommentData({ comment: "", status: "" });
//         if (activeTab === "assigned") fetchAssigned();
//         if (activeTab === "clearance") fetchClearance();
//         if (activeTab === "Custom") fetchCustomTasks();
//       } else {
//         toast.warning(res.data.message);
//       }
//     } catch {
//       toast.error("Error ❌");
//     }
//   };
//   const handleView = (item) => {
//     console.log("View Item:", item);
//     navigate(`/Admin/task/${item.task_id || item.id}`);
//   };
//   /* ================= UI ================= */
//   return (
//     <>
//       <div className="container-fluid">
//         <h4>Task Manager</h4>
//         <div className="mb-3 mx-2">
//           {/* <button className="btn btn-primary mx-2" onClick={() => setActiveTab("assigned")}>Freight</button>
//           <button className="btn btn-primary mx-2" onClick={() => setActiveTab("clearance")}>Clearance</button>
//           <button className="btn btn-primary mx-2" onClick={() => setActiveTab("Custom")}>Custom</button> */}
//           <button
//             className={`btn mx-2 ${
//               activeTab === "assigned" ? "btn-primary" : "btn-outline-primary"
//             }`}
//             onClick={() => setActiveTab("assigned")}
//           >
//             Freight
//           </button>

//           <button
//             className={`btn mx-2 ${
//               activeTab === "clearance" ? "btn-primary" : "btn-outline-primary"
//             }`}
//             onClick={() => setActiveTab("clearance")}
//           >
//             Clearance
//           </button>

//           <button
//             className={`btn mx-2 ${
//               activeTab === "Custom" ? "btn-primary" : "btn-outline-primary"
//             }`}
//             onClick={() => setActiveTab("Custom")}
//           >
//             Custom
//           </button>
//           {activeTab === "Custom" && (
//             <div className="d-flex justify-content-end mb-2">
//               <button
//                 className="btn btn-primary"
//                 onClick={() => {
//                   handleclickassigntask();
//                 }}
//               >
//                 Add Task
//               </button>
//             </div>
//           )}
//         </div>
//         <div className="table-responsive mt-3">
//           <table className="table table-striped tableICon">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Name</th>
//                 <th>
//                   {activeTab === "assigned"
//                     ? "Freight Number"
//                     : activeTab === "clearance"
//                       ? "Clearance Number"
//                       : "Title"}{" "}
//                 </th>
//                 <th>Due Date</th>
//                 <th>Notes</th>
//                 <th>Status</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentData.map((item, index) => (
//                 <tr key={index}>
//                   <td>{startIndex + index + 1}</td>
//                   <td>{item.staff_name}</td>
//                   <td>
//                     {item.task_title ||
//                       item.freight_number ||
//                       item.clearance_number}
//                   </td>
//                   <td>
//                     {(() => {
//                       const dateValue =
//                         item.created_at ||
//                         item.freight_created_at ||
//                         item.task_created_at;

//                       if (!dateValue) return "-";

//                       const createdDate = new Date(dateValue);
//                       const today = new Date();

//                       // Remove time part (important for accurate day difference)
//                       createdDate.setHours(0, 0, 0, 0);
//                       today.setHours(0, 0, 0, 0);

//                       const diffTime = today - createdDate;
//                       const diffDays = Math.floor(
//                         diffTime / (1000 * 60 * 60 * 24),
//                       );

//                       return diffDays >= 0 ? `${diffDays} days` : "0 days";
//                     })()}
//                   </td>
//                   <td>{item.notes || item.notes || item.notes}</td>
//                   <td>{item.task_status}</td>
//                   {/* ✅ ADD COMMENT BUTTON */}
//                   <td>
//                     <div style={{ display: "flex", gap: "10px" }}>
//                       {/* ➕ Add Comment Icon */}
//                       <AddCommentIcon
//                         style={{ cursor: "pointer", color: "#1976d2" }}
//                         onClick={() => handleAddComment(item)}
//                         titleAccess="Add Comment"
//                       />

//                       {/* 👁️ View Icon */}
//                       <VisibilityIcon
//                         style={{ cursor: "pointer", color: "green" }}
//                         onClick={() => handleView(item)}
//                         titleAccess="View Details"
//                       />
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* PAGINATION */}
//         <div className="text-center d-flex justify-content-end align-items-center">
//           <button
//             className="bg_page"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage(currentPage - 1)}
//           >
//             <i class="fi fi-rr-angle-small-left page_icon"></i>
//           </button>
//           <span>
//             Page {currentPage} of {totalPages || 1}
//           </span>
//           <button
//             disabled={currentPage === totalPages}
//             className="bg_page"
//             onClick={() => setCurrentPage(currentPage + 1)}
//           >
//             <i class="fi fi-rr-angle-small-right page_icon"></i>
//           </button>
//         </div>
//         {/* ================= MODAL ================= */}
//         <Modal open={commentModal} onClose={() => setCommentModal(false)}>
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               bgcolor: "white",
//               p: 3,
//               width: 400,
//             }}
//           >
//             <h5>Update Status</h5>
//             <select
//               className="form-control my-2"
//               value={commentData.status}
//               onChange={(e) =>
//                 setCommentData({
//                   ...commentData,
//                   status: e.target.value,
//                 })
//               }
//             >
//               <option value="">Select Status</option>
//               <option value="pending">Pending</option>
//               <option value="in_progress">In Progress</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//             </select>

//             <textarea
//               className="form-control my-2"
//               placeholder="Add Note"
//               value={commentData.comment}
//               onChange={(e) =>
//                 setCommentData({
//                   ...commentData,
//                   comment: e.target.value,
//                 })
//               }
//             />

//             <Button variant="contained" onClick={submitComment}>
//               Submit
//             </Button>
//           </Box>
//         </Modal>
//         <Modal
//           open={openPopup}
//           onClose={closeModal}
//           aria-labelledby="modal-modal-title"
//           aria-describedby="modal-modal-description"
//           className="newModal"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               bgcolor: "background.paper",
//               boxShadow: 24,
//             }}
//           >
//             <div className="modal-header">
//               <h2 id="modal-modal-title">Add Task</h2>
//               <button className="btn btn-close" onClick={closeModal}>
//                 <CloseIcon />{" "}
//               </button>
//             </div>
//             <div className="newModalGap noFormaControl newModalGap2">
//               <div className="row my-3  ">
//                 <div className="col-6">
//                   <label>Title</label>
//                   <input
//                     type="text"
//                     id="shipper3"
//                     name="Title"
//                     style={{ cursor: "pointer" }}
//                     className="form-control"
//                     onChange={handlechange}
//                   />
//                 </div>
//                 <div className="col-6">
//                   <label>Description</label>
//                   <input
//                     type="text"
//                     id="shipper3"
//                     name="Description"
//                     style={{ cursor: "pointer" }}
//                     className="form-control"
//                     onChange={handlechange}
//                   />
//                 </div>
//                 <div className="col-6">
//                   <label>Priority</label>
//                   <select
//                     type="text"
//                     id="shipper3"
//                     name="Priority"
//                     style={{ cursor: "pointer" }}
//                     className="form-control"
//                     onChange={handlechange}
//                   >
//                     <option>Select</option>
//                     <option value="High">High</option>
//                     <option value="Medium">Medium</option>
//                     <option value="Low">Low</option>
//                   </select>
//                 </div>
//                 <div className="col-6">
//                   <label>Staff List</label>
//                   <select
//                     name="Staffid"
//                     className="form-control"
//                     onChange={handlechange}
//                   >
//                     <option>Select</option>

//                     {staffList.map((item) => (
//                       <option key={item.id} value={item.id}>
//                         {item.full_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <Button variant="contained" onClick={postData}>
//                 Apply
//               </Button>
//             </div>
//           </Box>
//         </Modal>
//       </div>
//       
//     </>
//   );
// }


import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import AddCommentIcon from "@mui/icons-material/AddComment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const pageSize = 10;

export default function Taskmanager() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false);
const [staffList, setStaffList] = useState([]);
  const [assignedData, setAssignedData] = useState([]);
  const [clearanceData, setClearanceData] = useState([]);
  const [customData, setCustomData] = useState([]);
 const [supplier, setSupplier] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
 const [formData, setFormData] = useState({
     Title: "",
     Description: "",
     Priority: "",
     TaskFor: "",
     SupplierId: "",
     Staffid: "",
   });
  const [commentData, setCommentData] = useState({
    comment: "",
    status: "",
    due_date: "",
    action_required: "",
  });
 const handleclickassigntask = () => {
     setOpenPopup(true);
   };
   const closeModal = () => {
     setOpenPopup(false);
   };
  const navigate = useNavigate();
  /* ================= FETCH ================= */
  const fetchAssigned = async () => {
    setLoader(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getAllAssignedFreightsSatff`
      );
      setAssignedData(res.data?.data || []);
    } catch {
      toast.error("Error");
    } finally {
      setLoader(false);
    }
  };
const postData = () => {
     setLoader(true);
     let payload = {
       task_title: formData.Title,
       description: formData.Description,
       priority: formData.Priority,
       staff_id: formData.Staffid,
     };

     axios
       .post(`${process.env.REACT_APP_BASE_URL}createCustomTask`, payload)
       .then((res) => {
         if (res.data.success) {
           toast.success("Task added successfully ✅");
           closeModal();
           fetchCustomTasks();
           setFormData({
             Title: "",
             Description: "",
             Priority: "",
             TaskFor: "",
             SupplierId: "",
             Staffid: "",
           });
         } else {
           toast.warning(res.data.message || "Failed to add task ❌");
         }

         setLoader(false);
       })
       .catch((error) => {
         console.error(error);
         toast.error("Failed to add task ❌");
         setLoader(false);
       });
   };
     useEffect(() => {
     getStaff();
     getSupplierList();
   }, []);
   const getSupplierList = async () => {
     try {
       const res = await axios.get(
         `${process.env.REACT_APP_BASE_URL}supplier-list`,
       );
       setSupplier(res.data.data);
     } catch (error) {
       console.error("Failed to fetch staff list", error);
     }
   };
   const getStaff = async () => {
     try {
       const res = await axios.get(
         `${process.env.REACT_APP_BASE_URL}staff-list`,
       );
       setStaffList(res.data.data);
     } catch (error) {
       console.error("Failed to fetch staff list", error);
     }
   };

   const fetchCustomTasks = async () => {
     setLoader(true);
     try {
       const res = await axios.get(
         `${process.env.REACT_APP_BASE_URL}getAllCustomTasks`,
       );
       setCustomData(res.data?.data || []);
     } catch {
       toast.error("Error");
     } finally {
       setLoader(false);
     }
   };
const handlechange = (e) => {
     const { name, value } = e.target;

     setFormData({
       ...formData,
       [name]: value,
     });
   };
  const fetchClearance = async () => {
    setLoader(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getAllAssignedClearanceSatff`
      );
      setClearanceData(res.data?.data || []);
    } catch {
      toast.error("Error");
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    if (activeTab === "assigned") fetchAssigned();
    if (activeTab === "clearance") fetchClearance();
    if (activeTab === "Custom") fetchCustomTasks();
  }, [activeTab]);
  /* ================= TABLE ================= */
  const tableData =
    activeTab === "assigned"
      ? assignedData
      : activeTab === "clearance"
      ? clearanceData
      : customData;
  const filteredData = tableData.filter((item) => {
    if (!searchQuery) return true;
    return JSON.stringify(item)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + pageSize
  );
  /* ================= EDIT ================= */
  const handleAddComment = (item) => {
    setSelectedTask(item);

    setCommentData({
      comment: item.notes || "",
      status: item.task_status || "",
      due_date: item.due_date
        ? item.due_date.split("T")[0]
        : "",
      action_required: item.action_required || "",
    });

    setCommentModal(true);
  };
  const submitComment = async () => {
    try {
      let payload = {
        notes:commentData.notes,  
                task_id: selectedTask?.task_id || selectedTask?.id,
        action_required: commentData.action_required,
        task_status: commentData.status,
        due_date: commentData.due_date,
      };
      console.log(payload)
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}updateTaskStatus`,
        payload
      );
      if (res.data.success) {
        toast.success("Task Updated ✅");
        setCommentModal(false);
        setCommentData({
          comment: "",
          status: "",
          due_date: "",
          action_required: "",
        });
        // refresh
        if (activeTab === "assigned") fetchAssigned();
        if (activeTab === "clearance") fetchClearance();
        if (activeTab === "Custom") fetchCustomTasks();
      } else {
        toast.warning(res.data.message);
      }
    } catch {
      toast.error("Update Failed ❌");
    }
  };

  const handleView = (item) => {
    navigate(`/Admin/task/${item.task_id || item.id}`);
  };

  /* ================= UI ================= */

  return (
    <>
   <div className="wpWrapper">
        <div className="container-fluid">
        <h4>Task Manager</h4>

        {/* Tabs */}
        <div className="mb-3">
          <button
            className={`btn mx-2 ${
              activeTab === "assigned" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab("assigned")}
          >
            Freight
          </button>

          <button
            className={`btn mx-2 ${
              activeTab === "clearance" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab("clearance")}
          >
            Clearance
          </button>

          <button
            className={`btn mx-2 ${
              activeTab === "Custom" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab("Custom")}
          >
            Custom
          </button>
            {activeTab === "Custom" && (
             <div className="d-flex justify-content-end mb-2">
               <button
                 className="btn btn-primary"
                 onClick={() => {
                   handleclickassigntask();
                 }}
               >
                 Add Task
               </button>
             </div>
           )}
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          {/* <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((item, index) => (
                <tr key={index}>
                  <td>{startIndex + index + 1}</td>
                  <td>{item.staff_name}</td>
                  <td>{item.task_title}</td>
                  <td>{item.task_status}</td>

                  <td>
                    <AddCommentIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => handleAddComment(item)}
                    />

                    <VisibilityIcon
                      style={{ cursor: "pointer", marginLeft: 10 }}
                      onClick={() => handleView(item)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}
           <table className="table table-striped tableICon">
             <thead>
               <tr>
                 <th>#</th>
                 <th>Name</th>
                 <th>
                   {activeTab === "assigned"
                     ? "Freight Number"
                     : activeTab === "clearance"
                       ? "Clearance Number"
                       : "Title"}{" "}
                 </th>
                 <th>Due Date</th>
                 <th>Notes</th>
                 <th>Status</th>
                 <th>Action Required</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {currentData.map((item, index) => (
                 <tr key={index}>
                   <td>{startIndex + index + 1}</td>
                   <td>{item.staff_name}</td>
                   <td>
                     {item.task_title ||
                       item.freight_number ||
                       item.clearance_number}
                   </td>
                   <td>
                     {item.due_date
                       ? new Date(item.due_date).toLocaleDateString('en-GB')
                       : "-"}
                   </td>
                   <td>{item.notes || item.notes || item.notes}</td>
                   <td>{item.task_status}</td>
                   <td>{item?.action_required}</td>
                   <td>
                     <div style={{ display: "flex", gap: "10px" }}>
                       <AddCommentIcon
                         style={{ cursor: "pointer", color: "#1976d2" }}
                         onClick={() => handleAddComment(item)}
                         titleAccess="Add Comment"
                       />
                       <VisibilityIcon
                         style={{ cursor: "pointer", color: "green" }}
                         onClick={() => handleView(item)}
                         titleAccess="View Details"
                       />
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
       <div className="text-center d-flex justify-content-end align-items-center">
           <button
             className="bg_page"
             disabled={currentPage === 1}
             onClick={() => setCurrentPage(currentPage - 1)}
           >
             <i class="fi fi-rr-angle-small-left page_icon"></i>
           </button>
           <span>
             Page {currentPage} of {totalPages || 1}
           </span>
           <button
             disabled={currentPage === totalPages}
             className="bg_page"
             onClick={() => setCurrentPage(currentPage + 1)}
           >
             <i class="fi fi-rr-angle-small-right page_icon"></i>
           </button>
         </div>
        <Modal open={commentModal} onClose={() => setCommentModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              p: 3,
              width: 400,
            }}
          >
            <h5>Update Task</h5>
            <label className="mt-2">Status</label>
            <select
              className="form-control my-2"
              value={commentData.status}
              onChange={(e) =>
                setCommentData({
                  ...commentData,
                  status: e.target.value,
                })
              }
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
<label className="mt-2">Action </label>
         <select
  className="form-control my-2"
  value={commentData.action_required || ""}
  onChange={(e) =>
    setCommentData({
      ...commentData,
      action_required: e.target.value,
    })
  }
>
  <option value="">Select Action</option>
  <option value="call">Call</option>
  <option value="email">Email</option>
  <option value="meeting">Meeting</option>
  <option value="attend">Attend</option>
</select>
          <label className="mt-2">Due Date</label>
            <input
              type="date"
              className="form-control my-2"
              value={commentData.due_date}
              onChange={(e) =>
                setCommentData({
                  ...commentData,
                  due_date: e.target.value,
                })
              }
            />
<label className="mt-2">Notes</label>
            <textarea
              className="form-control my-2"
              placeholder="notes"
              value={commentData.notes}
              onChange={(e) =>
                setCommentData({
                  ...commentData,
                  notes: e.target.value,
                })
              }
            />

            <Button variant="contained" onClick={submitComment}>
              Update Task
            </Button>
          </Box>
        </Modal>
         <Modal
           open={openPopup}
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
             }}
           >
             <div className="modal-header">
               <h2 id="modal-modal-title">Add Task</h2>
               <button className="btn btn-close" onClick={closeModal}>
                 <CloseIcon />{" "}
               </button>
             </div>
             <div className="newModalGap noFormaControl newModalGap2">
               <div className="row my-3  ">
                 <div className="col-6">
                   <label>Title</label>
                   <input
                     type="text"
                     id="shipper3"
                     name="Title"
                     style={{ cursor: "pointer" }}
                     className="form-control"
                     onChange={handlechange}
                   />
                 </div>
                 <div className="col-6">
                   <label>Description</label>
                   <input
                     type="text"
                     id="shipper3"
                     name="Description"
                     style={{ cursor: "pointer" }}
                     className="form-control"
                     onChange={handlechange}
                   />
                 </div>
                 <div className="col-6">
                   <label>Priority</label>
                   <select
                     type="text"
                     id="shipper3"
                     name="Priority"
                     style={{ cursor: "pointer" }}
                     className="form-control"
                     onChange={handlechange}
                   >
                     <option>Select</option>
                     <option value="High">High</option>
                     <option value="Medium">Medium</option>
                     <option value="Low">Low</option>
                   </select>
                 </div>
                 <div className="col-6">
                   <label>Staff List</label>
                   <select
                     name="Staffid"
                     className="form-control"
                     onChange={handlechange}
                   >
                     <option>Select</option>

                     {staffList.map((item) => (
                       <option key={item.id} value={item.id}>
                         {item.full_name}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
               <Button variant="contained" onClick={postData}>
                 Apply
               </Button>
             </div>
           </Box>
         </Modal>
      </div>
      
       </div>
    </>
  );
}