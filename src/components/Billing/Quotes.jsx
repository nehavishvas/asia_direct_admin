import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ViewQuotesInvoice from "./ViewQuotesInvoice";
import CustomPagination from "../common/CustomPagination";

const Quotes = () => {
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [search, setSearch] = useState("");
    const [printItem, setPrintItem] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const limit = 10;
    const navigate = useNavigate();
    const location = useLocation();

    // Track Status Update Modal State
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [statusForm, setStatusForm] = useState({
        track_status: "",
        comment: "",
        date: new Date().toISOString().split("T")[0]
    });
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    // Track Status History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistoryQuote, setSelectedHistoryQuote] = useState(null);
    const [historyList, setHistoryList] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const trackStatusOptions = ["Draft", "Pending", "Negotiation", "Accepted", "Rejected", "Expired"];

    const getTrackStatusBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "draft":
                return { backgroundColor: "#f1f3f5", color: "#495057", border: "1px solid #ced4da" };
            case "pending":
                return { backgroundColor: "#fff8e6", color: "#b7791f", border: "1px solid #fbd38d" };
            case "negotiation":
                return { backgroundColor: "#ebf8ff", color: "#2b6cb0", border: "1px solid #bee3f8" };
            case "accepted":
                return { backgroundColor: "#f0fff4", color: "#276749", border: "1px solid #9ae6b4" };
            case "rejected":
                return { backgroundColor: "#fff5f5", color: "#c53030", border: "1px solid #feb2b2" };
            case "expired":
                return { backgroundColor: "#edf2f7", color: "#718096", border: "1px solid #e2e8f0" };
            default:
                return { backgroundColor: "#f1f3f5", color: "#495057", border: "1px solid #ced4da" };
        }
    };

    const getTrackStatusDotColor = (status) => {
        switch (status?.toLowerCase()) {
            case "draft":
                return "#6c757d";
            case "pending":
                return "#dd6b20";
            case "negotiation":
                return "#3182ce";
            case "accepted":
                return "#38a169";
            case "rejected":
                return "#e53e3e";
            case "expired":
                return "#a0aec0";
            default:
                return "#6c757d";
        }
    };

    const handleOpenStatusModal = (item) => {
        setSelectedQuote(item);
        setStatusForm({
            track_status: item.track_status || item.status || "Draft",
            comment: "",
            date: new Date().toISOString().split("T")[0]
        });
        setStatusModalOpen(true);
    };

    const handleCloseStatusModal = () => {
        setStatusModalOpen(false);
        setSelectedQuote(null);
        setStatusForm({
            track_status: "",
            comment: "",
            date: new Date().toISOString().split("T")[0]
        });
    };

    const handleUpdateTrackStatus = async (e) => {
        if (e) e.preventDefault();
        if (!selectedQuote) return;

        if (!statusForm.track_status) {
            toast.error("Please select a track status");
            return;
        }

        try {
            setStatusSubmitting(true);
            const payload = {
                freight_quote_estimate_id: Number(selectedQuote.freight_quote_estimate_id),
                track_status: statusForm.track_status,
                comment: statusForm.comment || "",
                changed_by: Number(userid) || Number(userdata?.staff_id) || Number(userdata?.user_id) || 1
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}updateFreightQuoteHistoryStatus`,
                payload
            );

            if (response.data && (response.data.success || response.status === 200)) {
                toast.success(response.data.message || "Track status updated successfully");
                handleCloseStatusModal();
                getQuotes(currentPage);
            } else {
                toast.error(response.data?.message || "Failed to update track status");
            }
        } catch (error) {
            console.error("Error updating track status:", error);
            toast.error(error.response?.data?.message || "Something went wrong while updating track status");
        } finally {
            setStatusSubmitting(false);
        }
    };

    // View Track Status History Handler
    const handleViewTrackStatusHistory = async (item) => {
        setSelectedHistoryQuote(item);
        setHistoryModalOpen(true);
        setHistoryLoading(true);
        setHistoryList([]);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}viewFreightQuoteStatusHistory`,
                { freight_quote_estimate_id: Number(item.freight_quote_estimate_id) }
            );
            if (response.data && response.data.success) {
                setHistoryList(response.data.data || []);
            } else {
                setHistoryList([]);
                toast.error(response.data?.message || "Failed to fetch status history");
            }
        } catch (error) {
            console.error("Error fetching status history:", error);
            toast.error(error.response?.data?.message || "Failed to fetch status history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleCloseHistoryModal = () => {
        setHistoryModalOpen(false);
        setSelectedHistoryQuote(null);
        setHistoryList([]);
    };

    const checkPermission = async () => {
        try {
            setLoader(true);
            if (!userid || !usertype) {
                setHasPermission(false);
                return;
            }
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/quotes",
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if (response.data && response.data.success === true) {
                setHasPermission(true);
            } else {
                setHasPermission(false);
                toast.error("You don't have permission to access this page");
            }
        } catch (error) {
            setHasPermission(false);
            toast.error(error.response?.data?.message || "You don't have permission to access this page");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    useEffect(() => {
        const msg = sessionStorage.getItem("toastMessage");
        if (msg) {
            toast.success(msg);
            sessionStorage.removeItem("toastMessage");
        }
    }, []);

    useEffect(() => {
        if (hasPermission === true) {
            getQuotes(currentPage);
        }
    }, [currentPage, hasPermission]);

    const getQuotes = async (pageNo = 1) => {
        setLoader(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}GetFreightQuoteEstimateList?page=${pageNo}&limit=${limit}&search=${search}`
            );
            console.log(response.data);
            setData(response.data.data || []);
            setTotalPage(
                response.data.pagination?.total_pages || 1
            );
            setCurrentPage(
                response.data.pagination?.current_page || 1
            );
            setLoader(false);
        } catch (error) {
            setLoader(false);
            console.error(
                "Error fetching quotes:",
                error.message
            );
            toast.error(error.response?.data?.message || "Failed to fetch quotes list");
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        getQuotes(1);
    };

    const handlePageChange = (page) => {
        console.log("Selected Page =>", page);
        setCurrentPage(page);
    };

    const naviagetpage = () => {
        navigate("/Admin/addquotesinvoice");
    };

    const deletewarehouse = async (freight_quote_estimate_id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this quote estimate?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
            setLoader(true);
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}deleteFreightQuoteEstimate`, {
                    freight_quote_estimate_id: freight_quote_estimate_id
                }
                );
                setLoader(false);
                if (response.data.success) {
                    getQuotes(currentPage);
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Quote invoice deleted successfully.",
                        confirmButtonColor: "#3085d6",
                    });
                } else {
                    toast.error(response.data.message || "Failed to delete quote invoice.");
                }
            } catch (error) {
                console.error(error);
                setLoader(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.response?.data?.message || "Something went wrong!",
                    confirmButtonColor: "#d33",
                });
            }
        }
    };

    const handleCopyInvoice = (item) => {
        navigate("/Admin/addquotesinvoice", { state: { copyInvoiceData: item } });
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
                toast.success(response.data.message || "Invoice created successfully");
                getQuotes(currentPage);
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
                                <h4 className="freight_hd">Quotes</h4>
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
                        <div className="d-flex justify-content-between align-items-center mb-3 manageFreight">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={naviagetpage}
                                >
                                    Add Quote Estimation
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate("/Admin/customer-quotes-report")}
                                >
                                    Customer Quotes Report
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-2 searchManageFre">
                                <input
                                    name="search"
                                    value={search}
                                    className="form-control"
                                    placeholder="Search Reference/Customer..."
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                />
                                <button className="blueBtn" onClick={handleSearch}>
                                    Search
                                </button>
                            </div>
                        </div>
                        <div className="table-responsive tableResFixed mt-4">
                            <table className="table table-striped tableICon">
                                <thead>
                                    <tr>
                                        <th>Reference</th>
                                        <th>Customer Name</th>
                                        <th>Freight Number</th>
                                        <th>Customer Ref</th>
                                        <th>Date</th>
                                        <th>Country</th>
                                        <th>Currency</th>
                                        <th>Total</th>
                                        <th>Amount Due</th>
                                        <th>Status</th>
                                        <th>Track Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? (
                                        data.map((item) => {
                                            return (
                                                <tr key={item.freight_quote_estimate_id}>
                                                    <td>{item.reference_no || "-"}</td>
                                                    <td>{item.client_name || item.supplier_name || "-"}</td>
                                                    <td>{item.freight_number || "-"}</td>
                                                    <td>{item.customer_invoice_no || "-"}</td>
                                                    <td>
                                                        {item.quote_date
                                                            ? new Date(item.quote_date).toLocaleDateString("en-GB")
                                                            : "-"}
                                                    </td>
                                                    <td>{item.invoice_for_country || "-"}</td>
                                                    <td>{item.final_base_currency || "-"}</td>
                                                    <td>{item.sumof_vatincl !== undefined ? item.sumof_vatincl : "0.00"}</td>
                                                    <td>{item.sumof_vatincl !== undefined ? item.sumof_vatincl : "0.00"}</td>
                                                    {/* Status (Payment/Invoice Status) */}
                                                    <td>
                                                        {item.status || "-"}
                                                        {/* <span
                                                            style={{
                                                                padding: "4px 12px",
                                                                borderRadius: "15px",
                                                                fontSize: "12px",
                                                                fontWeight: "500",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                backgroundColor: "#f1f3f5",
                                                                color: "#495057",
                                                                border: "1px solid #dee2e6"
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    width: "6px",
                                                                    height: "6px",
                                                                    borderRadius: "50%",
                                                                    backgroundColor: item.status?.toLowerCase() === "paid" ? "#28a745" : "#6c757d",
                                                                    display: "inline-block"
                                                                }}
                                                            />
                                                            {item.status || "unpaid"}
                                                        </span> */}
                                                    </td>
                                                    {/* Track Status Column */}
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenStatusModal(item)}
                                                            title="Click to update track status"
                                                            style={{
                                                                cursor: "pointer",
                                                                padding: "5px 12px",
                                                                borderRadius: "15px",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                transition: "all 0.2s ease-in-out",
                                                                background: getTrackStatusBadgeStyle(item.track_status || "Draft").backgroundColor,
                                                                color: getTrackStatusBadgeStyle(item.track_status || "Draft").color,
                                                                border: getTrackStatusBadgeStyle(item.track_status || "Draft").border,
                                                                outline: "none"
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    width: "7px",
                                                                    height: "7px",
                                                                    borderRadius: "50%",
                                                                    backgroundColor: getTrackStatusDotColor(item.track_status || "Draft"),
                                                                    display: "inline-block"
                                                                }}
                                                            />
                                                            <span>{item.track_status || "Draft"}</span>
                                                            <span style={{ fontSize: "9px", marginLeft: "2px", opacity: 0.7 }}>▼</span>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <div type="button" data-bs-toggle="dropdown">
                                                                <BsThreeDotsVertical />
                                                            </div>
                                                            <ul className="dropdown-menu">
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/viewquotesinvoice", { state: { item } })}
                                                                    >
                                                                        View
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => setPrintItem(item)}
                                                                    >
                                                                        Print
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => handleViewTrackStatusHistory(item)}
                                                                    >
                                                                        View Track Status
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/editquotesinvoice", { state: { item } })}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => handleCopyInvoice(item)}
                                                                    >
                                                                        Copy
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() => deletewarehouse(item.freight_quote_estimate_id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => handleCreateInvoice(item.freight_quote_estimate_id)}
                                                                    >
                                                                        Create Invoice
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => navigate("/Admin/quote-item-report", { state: { id: item.freight_quote_estimate_id } })}
                                                                    >
                                                                        Quote Item
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="12"
                                                className="text-center"
                                            >
                                                No Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPage}
                                onPageChange={(page) => handlePageChange(page)}
                            />
                        </div>
                    </div>

                    {/* Change Track Status Modal */}
                    {statusModalOpen && selectedQuote && (
                        <div
                            className="modal fade show"
                            style={{
                                display: "block",
                                backgroundColor: "rgba(0, 0, 0, 0.55)",
                                backdropFilter: "blur(2px)",
                                zIndex: 1050
                            }}
                            tabIndex="-1"
                        >
                            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "520px" }}>
                                <div
                                    className="modal-content text-dark"
                                    style={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                                        overflow: "hidden"
                                    }}
                                >
                                    {/* Modal Header */}
                                    <div
                                        className="modal-header d-flex justify-content-between align-items-center"
                                        style={{
                                            background: "#1d2044",
                                            color: "#fff",
                                            padding: "16px 20px",
                                            borderBottom: "none"
                                        }}
                                    >
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0" style={{ fontSize: "17px", color: "#fff" }}>
                                                Update Track Status
                                            </h5>
                                            <small style={{ color: "#d1d5db", fontSize: "12px" }}>
                                                Reference: <strong style={{ color: "#fff" }}>{selectedQuote.reference_no || "-"}</strong>
                                                {selectedQuote.freight_number && ` | Freight: ${selectedQuote.freight_number}`}
                                            </small>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCloseStatusModal}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "20px",
                                                cursor: "pointer",
                                                lineHeight: 1,
                                                padding: "4px"
                                            }}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>

                                    {/* Modal Form */}
                                    <form onSubmit={handleUpdateTrackStatus}>
                                        <div className="modal-body p-4">
                                            {/* Summary card */}
                                            <div
                                                className="p-3 mb-3 rounded"
                                                style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                                            >
                                                <div className="row g-2" style={{ fontSize: "13px" }}>
                                                    <div className="col-6">
                                                        <span className="text-muted d-block">Customer:</span>
                                                        <strong>{selectedQuote.client_name || selectedQuote.supplier_name || "-"}</strong>
                                                    </div>
                                                    <div className="col-6">
                                                        <span className="text-muted d-block">Current Track Status:</span>
                                                        <span
                                                            style={{
                                                                padding: "2px 8px",
                                                                borderRadius: "10px",
                                                                fontSize: "11px",
                                                                fontWeight: "600",
                                                                ...getTrackStatusBadgeStyle(selectedQuote.track_status || "Draft")
                                                            }}
                                                        >
                                                            {selectedQuote.track_status || "Draft"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date (Auto Insert) */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "#333" }}>
                                                    Date (Auto Insert)
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={statusForm.date}
                                                    readOnly
                                                    disabled
                                                    style={{
                                                        backgroundColor: "#e9ecef",
                                                        cursor: "not-allowed",
                                                        fontSize: "14px"
                                                    }}
                                                />
                                                <small className="text-muted" style={{ fontSize: "11px" }}>
                                                    Auto-filled with current date
                                                </small>
                                            </div>

                                            {/* Change Track Status (Drop Down) */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "#333" }}>
                                                    Change Track Status <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select form-control"
                                                    value={statusForm.track_status}
                                                    onChange={(e) => setStatusForm({ ...statusForm, track_status: e.target.value })}
                                                    required
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    <option value="">-- Select Track Status --</option>
                                                    {trackStatusOptions.map((opt) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status change comment */}
                                            <div className="mb-2">
                                                <label className="form-label fw-semibold" style={{ fontSize: "13px", color: "#333" }}>
                                                    Status Change Comment
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Enter comment or reason for status update..."
                                                    value={statusForm.comment}
                                                    onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                                                    style={{ fontSize: "14px", resize: "vertical" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Modal Footer */}
                                        <div
                                            className="modal-footer d-flex justify-content-end gap-2"
                                            style={{
                                                borderTop: "1px solid #dee2e6",
                                                padding: "12px 20px",
                                                backgroundColor: "#f8f9fa"
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleCloseStatusModal}
                                                disabled={statusSubmitting}
                                                style={{ fontSize: "14px", padding: "6px 16px" }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="blueBtn"
                                                disabled={statusSubmitting}
                                                style={{
                                                    fontSize: "14px",
                                                    padding: "6px 20px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px"
                                                }}
                                            >
                                                {statusSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Track Status"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Track Status History Modal */}
                    {historyModalOpen && selectedHistoryQuote && (
                        <div
                            className="modal fade show"
                            style={{
                                display: "block",
                                backgroundColor: "rgba(0, 0, 0, 0.55)",
                                backdropFilter: "blur(2px)",
                                zIndex: 1050
                            }}
                            tabIndex="-1"
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: "750px" }}>
                                <div
                                    className="modal-content text-dark"
                                    style={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                                        overflow: "hidden"
                                    }}
                                >
                                    {/* Modal Header */}
                                    <div
                                        className="modal-header d-flex justify-content-between align-items-center"
                                        style={{
                                            background: "#1d2044",
                                            color: "#fff",
                                            padding: "16px 20px",
                                            borderBottom: "none"
                                        }}
                                    >
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0" style={{ fontSize: "17px", color: "#fff" }}>
                                                Track Status History
                                            </h5>
                                            <small style={{ color: "#d1d5db", fontSize: "12px" }}>
                                                Reference: <strong style={{ color: "#fff" }}>{selectedHistoryQuote.reference_no || "-"}</strong>
                                                {selectedHistoryQuote.freight_number && ` | Freight: ${selectedHistoryQuote.freight_number}`}
                                                {selectedHistoryQuote.client_name && ` | Customer: ${selectedHistoryQuote.client_name}`}
                                            </small>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCloseHistoryModal}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "20px",
                                                cursor: "pointer",
                                                lineHeight: 1,
                                                padding: "4px"
                                            }}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                        {historyLoading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                                <p className="mt-2 text-muted" style={{ fontSize: "13px" }}>Loading status history...</p>
                                            </div>
                                        ) : historyList.length === 0 ? (
                                            <div className="text-center py-5 text-muted">
                                                <p style={{ fontSize: "15px" }}>No status history found for this quote estimate.</p>
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-bordered align-middle mb-0" style={{ fontSize: "13px" }}>
                                                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                                                        <tr>
                                                            <th style={{ width: "60px" }}>#</th>
                                                            <th>Track Status</th>
                                                            <th>Comment</th>
                                                            <th>Changed By</th>
                                                            <th>Changed Date & Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {historyList.map((hist, idx) => (
                                                            <tr key={hist.id || idx}>
                                                                <td className="fw-semibold text-muted">{idx + 1}</td>
                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            padding: "4px 10px",
                                                                            borderRadius: "12px",
                                                                            fontSize: "12px",
                                                                            fontWeight: "600",
                                                                            display: "inline-flex",
                                                                            alignItems: "center",
                                                                            gap: "5px",
                                                                            ...getTrackStatusBadgeStyle(hist.track_status)
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                width: "6px",
                                                                                height: "6px",
                                                                                borderRadius: "50%",
                                                                                backgroundColor: getTrackStatusDotColor(hist.status),
                                                                                display: "inline-block"
                                                                            }}
                                                                        />
                                                                        {hist.track_status || "-"}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {hist.comment ? (
                                                                        <span style={{ color: "#333" }}>{hist.comment}</span>
                                                                    ) : (
                                                                        <span className="text-muted fst-italic">No comment</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {hist.changed_by_name ? (
                                                                        <strong>{hist.changed_by_name}</strong>
                                                                    ) : hist.changed_by ? (
                                                                        <span className="badge bg-light text-dark border">
                                                                            {hist.changed_by}
                                                                        </span>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {hist.changed_at ? (
                                                                        <span style={{ color: "#555" }}>
                                                                            {hist.changed_at}
                                                                        </span>
                                                                    ) : (
                                                                        "-"
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div
                                        className="modal-footer d-flex justify-content-end"
                                        style={{
                                            borderTop: "1px solid #dee2e6",
                                            padding: "12px 20px",
                                            backgroundColor: "#f8f9fa"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCloseHistoryModal}
                                            style={{ fontSize: "14px", padding: "6px 16px" }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {printItem && (
                        <ViewQuotesInvoice
                            hiddenPrintItem={printItem}
                            onPrintComplete={() => setPrintItem(null)}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default Quotes;