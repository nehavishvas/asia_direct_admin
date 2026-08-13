import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Box, Button, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Swal from "sweetalert2";
const pageSize = 10;
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const parseLeaveDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
const getStatusLabel = (status) => {
  if (status === 1) return "Approved";
  if (status === 2) return "Rejected";
  return "Pending";
};
const formatDisplayDate = (value) => {
  const date = parseLeaveDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const buildLeaveDatesMap = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const start = parseLeaveDate(item.leave_from);
    const end = parseLeaveDate(item.leave_to);
    if (!start || !end) return;
    const entry = {
      leave_id: item.leave_id,
      staff_name: item.staff_name,
      status: item.status,
      reason: item.reason,
      leave_from: item.leave_from,
      leave_to: item.leave_to,
    };
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toDateKey(cursor);
      if (!map.has(key)) map.set(key, []);
      const dayLeaves = map.get(key);
      if (!dayLeaves.some((l) => l.leave_id === entry.leave_id)) {
        dayLeaves.push(entry);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return map;
};
export default function Dashboard1() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLeaveData, setViewLeaveData] = useState(null);
  const [viewLoader, setViewLoader] = useState(false);
  const [pagenationData, setPagenationData] = useState({});
  const [inputdata, setInputdata] = useState({
    leave_id: "",
    status: "",
    admin_remark: "",
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [hoverTooltip, setHoverTooltip] = useState(null);
  const leaveDatesMap = useMemo(() => buildLeaveDatesMap(data), [data]);
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    return leaveDatesMap.has(toDateKey(date)) ? "highlight" : null;
  };
  const showLeaveTooltip = (e, date, leaves) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverTooltip({
      date,
      leaves,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const leaves = leaveDatesMap.get(toDateKey(date));
    if (!leaves?.length) return null;
    return (
      <div
        className="leave-day-hover-zone"
        onMouseEnter={(e) => showLeaveTooltip(e, date, leaves)}
        onMouseLeave={() => setHoverTooltip(null)}
      >
        <span className="leave-day-count">{leaves.length}</span>
      </div>
    );
  };
  const getdata = async (page = 1, search = "") => {
    try {
      setLoader(true);
      const payload = {
        page: page,
        limit: pageSize,
        search: search,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}getAllStaffLeaveRequests`,
        payload,
      );
      setData(response?.data?.data || []);
      setPagenationData(response?.data || {});
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    const delay = setTimeout(() => {
      getdata(currentPage, searchQuery);
    }, 400);
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);
  const totalPages = Math.ceil(
    (pagenationData?.total || 0) / (pagenationData?.limit || pageSize),
  );
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleStatusToggle = (item, newStatus) => {
    setPendingStatusChange({ item, status: newStatus });
    setInputdata({
      leave_id: item.leave_id,
      status: newStatus,
      admin_remark: item.admin_remark || "",
    });
    setIsModalOpen2(true);
  };
  const handleupdateapi = (e) => {
    const { name, value } = e.target;
    setInputdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const postData1234 = () => {
    const payload = {
      leave_id: inputdata.leave_id,
      status: parseInt(inputdata.status),
      admin_remark: inputdata.admin_remark,
    };
    axios
      .post(`${process.env.REACT_APP_BASE_URL}updateStaffLeaveStatus`, payload)
      .then((res) => {
        toast.success(res.data.message);
        setIsModalOpen2(false);
        setPendingStatusChange(null);
        getdata(currentPage, searchQuery);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Update failed!");
      });
  };
  const handleViewLeave = async (leaveId) => {
    try {
      setViewLoader(true);
      setViewLeaveData(null);
      setIsViewModalOpen(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}getStaffLeaveDetails/${leaveId}`
      );
      if (response.data && response.data.success) {
        setViewLeaveData(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load leave details.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setViewLoader(false);
    }
  };
  const handleDeleteLeave = async (leaveId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this leave request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}deleteStaffLeave`,
          { leave_id: leaveId }
        );
        if (response.data && response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message || "Leave request deleted successfully.",
            confirmButtonColor: "#3085d6",
          });
          getdata(currentPage, searchQuery);
        } else {
          toast.error(response.data.message || "Failed to delete leave request.");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to delete leave request.");
      }
    }
  };
  const addToGoogleCalendar = (leave) => {
    const start = new Date(leave.leave_from);
    const end = new Date(leave.leave_to);
    end.setDate(end.getDate() + 1);
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    };
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    const title = `${leave.staff_name} Leave`;
    const details = `
Reason: ${leave.reason || ""}
Status: ${leave.status === 1
        ? "Approved"
        : leave.status === 2
          ? "Rejected"
          : "Pending"
      }
`;
    const url =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${startDate}/${endDate}` +
      `&details=${encodeURIComponent(details)}`;
    window.open(url, "_blank");
  };
  return (
    <>
      <div className="wpWrapper">
        <div className="container-fluid">
          <div className="d-flex justify-content-between my-3">
            <h4>Leave Management</h4>
            <input
              type="text"
              placeholder="Search"
              className="px-2 py-1 rounded"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {loader ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="leave-management-wrap">
              <div className="leave-calendar-section w-100 mb-4">
                <div className="card p-3 shadow-sm">
                  <h6 className="mb-2">Leave Calendar</h6>
                  <Calendar
                    className="leave-calendar-full w-100"
                    value={calendarDate}
                    onChange={setCalendarDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                  />
                </div>
              </div>
              <div className="leave-table-section mt-4 pt-4">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sr.No.</th>
                        <th>Staff Name</th>
                        <th>Leave From</th>
                        <th>Leave To</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Admin Remark</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length > 0 ? (
                        data.map((item, index) => (
                          <tr key={index}>
                            <td>{(currentPage - 1) * pageSize + index + 1}</td>
                            <td>{item.staff_name}</td>
                            <td>
                              {new Date(item.leave_from).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td>
                              {new Date(item.leave_to).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td>{item.reason}</td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={item.status}
                                onChange={(e) => handleStatusToggle(item, parseInt(e.target.value))}
                                style={{
                                  width: "120px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                  backgroundColor:
                                    item.status === 1
                                      ? "#d1e7dd"
                                      : item.status === 2
                                        ? "#f8d7da"
                                        : "#f0f185ff",
                                  color:
                                    item.status === 1
                                      ? "#0f5132"
                                      : item.status === 2
                                        ? "#842029"
                                        : "#664d03",
                                  borderColor:
                                    item.status === 1
                                      ? "#badbcc"
                                      : item.status === 2
                                        ? "#f5c2c7"
                                        : "#ebec9fff",
                                }}
                              >
                                <option value="0" style={{ backgroundColor: "#ffffff", color: "#212529" }}>Pending</option>
                                <option value="1" style={{ backgroundColor: "#ffffff", color: "#212529" }}>Approved</option>
                                <option value="2" style={{ backgroundColor: "#ffffff", color: "#212529" }}>Rejected</option>
                              </select>
                            </td>
                            <td>{item.admin_remark}</td>
                            <td>
                              <i
                                className="fa fa-eye"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleViewLeave(item.leave_id)}
                                title="View Leave Details"
                              ></i>
                              <i
                                className="fa fa-calendar ms-1"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={() => addToGoogleCalendar(item)}
                                title="Add to Google Calendar"
                              ></i>
                              <i
                                className="fa fa-trash ms-1 text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleDeleteLeave(item.leave_id)}
                                title="Delete Leave Request"
                              ></i>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-end align-items-center my-3">
                    <button
                      disabled={currentPage === 1}
                      className="bg_page"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <i className="fi fi-rr-angle-small-left page_icon"></i>
                    </button>
                    <span className="mx-2">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="bg_page"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      <i className="fi fi-rr-angle-small-right page_icon"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {hoverTooltip && (
            <div
              className="leave-calendar-tooltip"
              style={{
                left: hoverTooltip.x,
                top: hoverTooltip.y,
              }}
            >
              <div className="leave-calendar-tooltip-arrow" />
              <div className="leave-calendar-tooltip-title">
                {hoverTooltip.date.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="leave-calendar-tooltip-list">
                {hoverTooltip.leaves.map((leave) => (
                  <div
                    key={leave.leave_id}
                    className="leave-calendar-tooltip-item"
                  >
                    <div className="leave-tooltip-row">
                      <strong>{leave.staff_name}</strong>
                      <span
                        className={`leave-status-badge status-${leave.status}`}
                      >
                        {getStatusLabel(leave.status)}
                      </span>
                    </div>
                    <div className="leave-tooltip-meta">
                      {formatDisplayDate(leave.leave_from)} –{" "}
                      {formatDisplayDate(leave.leave_to)}
                    </div>
                    {leave.reason && (
                      <div className="leave-tooltip-reason">{leave.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal open={isModalOpen2} onClose={() => setIsModalOpen2(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            width: "35%",
            boxShadow: 24,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h4 style={{ fontWeight: 600, color: "#1b2245", margin: 0 }}>
              Update Leave Status
            </h4>
            <button
              className="btn-close"
              onClick={() => setIsModalOpen2(false)}
            >
              <CloseIcon />
            </button>
          </div>
          {pendingStatusChange && (
            <div className="mb-3">
              <p style={{ fontSize: "14px", margin: 0, color: "#495057" }}>
                Are you sure you want to change <strong>{pendingStatusChange.item.staff_name}</strong>'s leave request status to{" "}
                <span className={
                  pendingStatusChange.status === 1
                    ? "text-success fw-bold"
                    : pendingStatusChange.status === 2
                      ? "text-danger fw-bold"
                      : "text-secondary fw-bold"
                }>
                  {pendingStatusChange.status === 1
                    ? "Approved"
                    : pendingStatusChange.status === 2
                      ? "Rejected"
                      : "Pending"}
                </span>?
              </p>
            </div>
          )}
          <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "4px", display: "block" }}>
            Admin Remark / Comment
          </label>
          <textarea
            className="form-control mb-3"
            rows="3"
            name="admin_remark"
            placeholder="Provide a reason or remark (optional)..."
            value={inputdata.admin_remark}
            onChange={handleupdateapi}
            style={{ fontSize: "14px", borderRadius: "6px" }}
          />
          <div className="d-flex gap-2">
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsModalOpen2(false)}
              style={{ borderRadius: "6px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={
                pendingStatusChange?.status === 1
                  ? "success"
                  : pendingStatusChange?.status === 2
                    ? "error"
                    : "inherit"
              }
              fullWidth
              onClick={postData1234}
              style={{ borderRadius: "6px", color: pendingStatusChange?.status === 0 ? "#000" : "white" }}
            >
              {pendingStatusChange?.status === 1
                ? "Confirm Approve"
                : pendingStatusChange?.status === 2
                  ? "Confirm Reject"
                  : "Confirm Pending"}
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 3,
            borderRadius: 2,
            width: "45%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: 24,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <h4 style={{ fontWeight: 600, color: "#1b2245", margin: 0 }}>Leave Details</h4>
            <button
              className="btn-close"
              onClick={() => setIsViewModalOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          {viewLoader ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading details...</p>
            </div>
          ) : viewLeaveData ? (
            <div className="leave-details-grid">
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Reference</label>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#212529" }}>{viewLeaveData.reference || "-"}</div>
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Staff Name</label>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#212529" }}>{viewLeaveData.staff_name || "-"}</div>
                </div>

                <div className="col-md-6">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Leave Type</label>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#212529" }}>{viewLeaveData.leave_type || "-"}</div>
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Status</label>
                  <div>
                    <span
                      className={`badge ${viewLeaveData.status === 1 ? 'bg-success' : viewLeaveData.status === 2 ? 'bg-danger' : 'bg-warning text-dark'}`}
                      style={{ padding: "6px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 500 }}
                    >
                      {getStatusLabel(viewLeaveData.status)}
                    </span>
                  </div>
                </div>

                <div className="col-12">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Duration</label>
                  <div style={{ fontSize: "14px", color: "#212529", fontWeight: 500 }}>
                    {formatDisplayDate(viewLeaveData.leave_from)} to {formatDisplayDate(viewLeaveData.leave_to)}
                  </div>
                </div>

                <div className="col-12">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Reason</label>
                  <div style={{ fontSize: "14px", color: "#495057", background: "#f8f9fa", padding: "10px", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                    {viewLeaveData.reason || "-"}
                  </div>
                </div>

                <div className="col-12">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Comments</label>
                  <div style={{ fontSize: "14px", color: "#495057", background: "#f8f9fa", padding: "10px", borderRadius: "6px", border: "1px solid #e9ecef" }}>
                    {viewLeaveData.comments || "-"}
                  </div>
                </div>

                <div className="col-12">
                  <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Admin Remark</label>
                  <div style={{ fontSize: "14px", color: "#495057", background: "#fff3cd", padding: "10px", borderRadius: "6px", border: "1px solid #ffeeba" }}>
                    {viewLeaveData.admin_remark || "-"}
                  </div>
                </div>

                {viewLeaveData.attachment && (
                  <div className="col-12 mt-2">
                    <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6c757d", fontWeight: 600, marginBottom: "2px", display: "block" }}>Attachment</label>
                    <a
                      href={`${process.env.REACT_APP_BASE_URLdocument}${viewLeaveData.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 mt-1"
                      style={{ padding: "6px 12px", borderRadius: "6px", textDecoration: "none" }}
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">No details found.</div>
          )}
        </Box>
      </Modal>

    </>
  );
}
