import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Modal, Box } from "@mui/material";

const allowedCountries = [
    "All",
    "South Africa",
    "Zimbabwe",
    "Zambia"
];

const SageInvoiceReport = () => {
    const navigate = useNavigate();
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Filter states
    const [country, setCountry] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");

    // Active applied filters for print/summary header
    const [appliedFilters, setAppliedFilters] = useState({
        country: "All",
        startDate: "",
        endDate: "",
        search: ""
    });

    // Report data & loading states
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);

    // Document Modal state
    const [selectedDocUrl, setSelectedDocUrl] = useState("");
    const [selectedDocTitle, setSelectedDocTitle] = useState("");
    const [openDocModal, setOpenDocModal] = useState(false);

    // Check user permission
    const checkPermission = async () => {
        try {
            if (!userid || !usertype) {
                setHasPermission(true);
                fetchReportData({ country: "All", startDate: "", endDate: "", search: "" });
                return;
            }
            if (
                String(usertype) === "1" ||
                usertype?.toLowerCase?.() === "admin" ||
                usertype?.toLowerCase?.() === "superadmin" ||
                userdata?.role === "admin"
            ) {
                setHasPermission(true);
                fetchReportData({ country: "All", startDate: "", endDate: "", search: "" });
                return;
            }

            const postdata = {
                staff_id: userid,
                route_url: "/Admin/sage-invoice-report",
                user_type: usertype,
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );

            if (response.data && response.data.success === true) {
                setHasPermission(true);
                fetchReportData({ country: "All", startDate: "", endDate: "", search: "" });
            } else {
                // Fallback check for /Admin/sageinvoice
                const fallbackCheck = await axios.post(
                    `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                    { ...postdata, route_url: "/Admin/sageinvoice" }
                );
                if (fallbackCheck.data && fallbackCheck.data.success === true) {
                    setHasPermission(true);
                    fetchReportData({ country: "All", startDate: "", endDate: "", search: "" });
                } else {
                    setHasPermission(false);
                    toast.error("You don't have permission to access this page");
                }
            }
        } catch (error) {
            console.error("Permission check error:", error);
            setHasPermission(true);
            fetchReportData({ country: "All", startDate: "", endDate: "", search: "" });
        }
    };

    // Fetch Sage invoice report from API
    const fetchReportData = async (filterOverrides) => {
        setLoader(true);
        const selCountry = filterOverrides?.country !== undefined ? filterOverrides.country : country;
        const selStartDate = filterOverrides?.startDate !== undefined ? filterOverrides.startDate : startDate;
        const selEndDate = filterOverrides?.endDate !== undefined ? filterOverrides.endDate : endDate;
        const selSearch = filterOverrides?.search !== undefined ? filterOverrides.search : search;

        setAppliedFilters({
            country: selCountry,
            startDate: selStartDate,
            endDate: selEndDate,
            search: selSearch
        });

        const params = {
            country: selCountry || "All"
        };
        if (selStartDate) params.start_date = selStartDate;
        if (selEndDate) params.end_date = selEndDate;
        if (selSearch && selSearch.trim()) params.search = selSearch.trim();

        try {
            let res;
            try {
                res = await axios.get(`${process.env.REACT_APP_BASE_URL}GetSageInvoiceReport`, {
                    params
                });
            } catch (apiErr) {
                // If backend returns 500 when country != "All", fallback gracefully to "All" and filter on client side
                if (params.country !== "All") {
                    console.warn("Backend country filter returned error, falling back to 'All' with client-side filtering:", apiErr);
                    const fallbackParams = { ...params, country: "All" };
                    res = await axios.get(`${process.env.REACT_APP_BASE_URL}GetSageInvoiceReport`, {
                        params: fallbackParams
                    });
                } else {
                    throw apiErr;
                }
            }

            if (res.data && res.data.success) {
                let data = res.data.data || [];

                // Filter by country if country is specified and not "All"
                if (selCountry && selCountry !== "All") {
                    data = data.filter((item) => {
                        const region = (item.invoice_region || "").toLowerCase();
                        return region.includes(selCountry.toLowerCase());
                    });
                }

                // Client-side search safeguard in case backend search only covers specific columns
                if (selSearch && selSearch.trim()) {
                    const q = selSearch.trim().toLowerCase();
                    data = data.filter((item) => {
                        return (
                            (item.document_number && item.document_number.toLowerCase().includes(q)) ||
                            (item.customer_name && item.customer_name.toLowerCase().includes(q)) ||
                            (item.customer_ref && item.customer_ref.toLowerCase().includes(q)) ||
                            (item.invoice_region && item.invoice_region.toLowerCase().includes(q)) ||
                            (item.total && String(item.total).includes(q))
                        );
                    });
                }

                setReportData(data);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching Sage invoice report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch Sage invoice report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        checkPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        fetchReportData();
    };

    const handleReset = () => {
        setCountry("All");
        setStartDate("");
        setEndDate("");
        setSearch("");
        fetchReportData({
            country: "All",
            startDate: "",
            endDate: "",
            search: ""
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Format currency amount based on invoice region / currency symbol
    const formatCurrency = (amount, region = "") => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "0.00";
        const formatted = num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const reg = (region || "").toLowerCase();
        let symbol = "";
        if (reg.includes("zimbabwe") || reg.includes("zwe")) symbol = "$ ";
        else if (reg.includes("south africa") || reg.includes("za")) symbol = "R ";
        else if (reg.includes("zambia") || reg.includes("zm")) symbol = "ZK ";

        return `${symbol}${formatted}`;
    };

    const formatDateString = (dateVal) => {
        if (!dateVal) return "-";
        const date = new Date(dateVal);
        if (Number.isNaN(date.getTime())) return "-";
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };



    // Handle document view
    const handleViewDocument = (docName, docNumber) => {
        if (!docName) return;
        const baseUrlDoc = process.env.REACT_APP_BASE_URLdocument || "https://mobappssolutiondevelopment.com/documents/";
        setSelectedDocUrl(`${baseUrlDoc}${docName}`);
        setSelectedDocTitle(`Sage Invoice: ${docNumber || docName}`);
        setOpenDocModal(true);
    };

    return (
        <>
            {loader && hasPermission === null ? (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p className="loader-text">Loading...</p>
                </div>
            ) : hasPermission === false ? (
                <div className="wpWrapper">
                    <div className="container-fluid no-print">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <h4 className="freight_hd">Sage Invoice Report</h4>
                                <div className="line"></div>
                            </div>
                        </div>
                        <div className="text-center mt-5">
                            <h3 className="text-danger">You don't have permission to access this page</h3>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="wpWrapper report-wrapper">
                        {/* Top Action Bar (Hidden on Print) */}
                        <div className="container-fluid no-print">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <button
                                    className="btn btn-secondary d-flex align-items-center gap-2"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowBackIcon /> Back
                                </button>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2 blueBtn"
                                    onClick={handlePrint}
                                >
                                    <PrintIcon /> Print Report
                                </button>
                            </div>

                            {/* Filter Bar */}
                            <div className="card shadow-sm border-0 mb-4 bg-light">
                                <div className="card-body">
                                    <form onSubmit={handleSearchSubmit} className="row g-2 align-items-end">
                                        {/* Country Filter */}
                                        <div className="col-lg-3 col-md-6 col-sm-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Country
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                            >
                                                {allowedCountries.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Date Range Filter */}
                                        <div className="col-lg-4 col-md-6 col-sm-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Date Range
                                            </label>
                                            <div className="d-flex gap-1">
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    title="Start Date"
                                                />
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    title="End Date"
                                                />
                                            </div>
                                        </div>

                                        {/* Search Input */}
                                        <div className="col-lg-3 col-md-8 col-sm-12">
                                            <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>
                                                Search
                                            </label>
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white">
                                                    <SearchIcon fontSize="small" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Search customer, ref, doc no..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-lg-2 col-md-4 col-sm-12 d-flex gap-2">
                                            <button type="submit" className="btn btn-primary blueBtn btn-sm w-50">
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm w-50 d-flex align-items-center justify-content-center gap-1"
                                                onClick={handleReset}
                                            >
                                                <RestartAltIcon fontSize="small" /> Reset
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Printable Report Area */}
                        <div className="card shadow-sm border-0 report-print-area">
                            <div className="card-body p-4 p-md-5">
                                {/* Report Header */}
                                <div className="report-header mb-4">
                                    <div className="d-flex justify-content-between align-items-start flex-wrap">
                                        <div>
                                            <h4 className="report-title mb-1 fw-bold text-dark text-start">
                                                Sage Invoice Report
                                            </h4>
                                            <h6 className="report-subtitle mb-3 text-start fw-bold text-secondary">
                                                Asia Direct Africa
                                            </h6>
                                        </div>
                                        <div className="text-end d-print-block">
                                            <span className="badge bg-primary p-2 fs-6">
                                                Total Records: {reportData.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Report Meta Info */}
                                    <div className="report-meta-info text-start mt-2 p-3 bg-light rounded">
                                        <div className="row">
                                            <div className="col-md-4 col-sm-6 mb-2">
                                                <div className="d-flex">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "110px" }}>
                                                        Country:
                                                    </span>
                                                    <span className="text-secondary">{appliedFilters.country || "All"}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-6 mb-2">
                                                <div className="d-flex">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "110px" }}>
                                                        Date Range:
                                                    </span>
                                                    <span className="text-secondary">
                                                        {appliedFilters.startDate || appliedFilters.endDate
                                                            ? `${appliedFilters.startDate ? formatDateString(appliedFilters.startDate) : "Start"} - ${appliedFilters.endDate ? formatDateString(appliedFilters.endDate) : "End"}`
                                                            : "All Dates"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="col-md-4 col-sm-12 mb-2">
                                                <div className="d-flex">
                                                    <span className="fw-bold text-dark me-2" style={{ minWidth: "110px" }}>
                                                        Search:
                                                    </span>
                                                    <span className="text-secondary">
                                                        {appliedFilters.search ? appliedFilters.search : "None"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Table */}
                                <div className="table-responsive mt-4">
                                    <table className="table table-bordered report-table">
                                        <thead className="table-light-grey">
                                            <tr>
                                                <th style={{ width: "50px" }}>#</th>
                                                <th style={{ minWidth: "100px" }}>Date</th>
                                                <th style={{ minWidth: "140px" }}>Document No.</th>
                                                <th style={{ minWidth: "180px" }}>Customer Name</th>
                                                <th style={{ minWidth: "160px" }}>Customer Ref.</th>
                                                <th style={{ minWidth: "140px" }}>Region / Country</th>
                                                <th className="text-end" style={{ minWidth: "120px" }}>Total Amount</th>
                                                <th className="text-center no-print" style={{ width: "90px" }}>Document</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loader ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        <div className="spinner-border text-primary spinner-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <p className="mt-2 mb-0 text-secondary">Fetching report data...</p>
                                                    </td>
                                                </tr>
                                            ) : reportData.length > 0 ? (
                                                reportData.map((item, idx) => {
                                                    return (
                                                        <tr key={item.id || idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>{formatDateString(item.date)}</td>
                                                            <td className="fw-semibold text-primary">{item.document_number || "-"}</td>
                                                            <td>{item.customer_name || "-"}</td>
                                                            <td>{item.customer_ref || "-"}</td>
                                                            <td>{item.invoice_region || "-"}</td>
                                                            <td className="text-end fw-semibold">
                                                                {formatCurrency(item.total, item.invoice_region)}
                                                            </td>
                                                            <td className="text-center no-print">
                                                                {item.document ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-primary btn-sm p-1"
                                                                        title="View Attached Sage Document"
                                                                        onClick={() => handleViewDocument(item.document, item.document_number)}
                                                                    >
                                                                        <PictureAsPdfIcon fontSize="small" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-muted">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4 text-secondary">
                                                        No Sage Invoice Records Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Preview Modal */}
                    <Modal
                        open={openDocModal}
                        onClose={() => setOpenDocModal(false)}
                        aria-labelledby="document-modal-title"
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: { xs: "95%", sm: "85%", md: "75%" },
                                height: "85vh",
                                bgcolor: "background.paper",
                                boxShadow: 24,
                                borderRadius: 2,
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                <h6 className="m-0 fw-bold text-dark">{selectedDocTitle || "Sage Invoice Document"}</h6>
                                <div className="d-flex align-items-center gap-2">
                                    <a
                                        href={selectedDocUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                    >
                                        <OpenInNewIcon fontSize="small" /> Open in New Tab
                                    </a>
                                    <button
                                        type="button"
                                        className="btn btn-close"
                                        onClick={() => setOpenDocModal(false)}
                                    >
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, backgroundColor: "#f8f9fa", borderRadius: "4px", overflow: "hidden" }}>
                                <iframe
                                    src={selectedDocUrl}
                                    width="100%"
                                    height="100%"
                                    title="Sage Document Preview"
                                    style={{ border: "none" }}
                                />
                            </div>
                        </Box>
                    </Modal>

                    {/* Custom Print and Layout Styles */}
                    <style>{`
                        .report-title {
                            font-size: 18px !important;
                        }
                        .report-subtitle {
                            font-size: 13px !important;
                            margin-bottom: 12px !important;
                        }
                        .report-meta-info {
                            font-size: 12px !important;
                        }
                        .report-meta-info span {
                            font-size: 12px !important;
                        }
                        .report-wrapper {
                            padding: 20px;
                        }
                        .table-light-grey {
                            background-color: #f8f9fa !important;
                            font-weight: 600;
                        }
                        .report-table th, .report-table td {
                            vertical-align: middle;
                            font-size: 13px;
                            border-color: #dee2e6;
                        }
                        .report-table tbody tr {
                            border-bottom: 1px solid #dee2e6;
                        }
                        .report-print-area {
                            background-color: #ffffff;
                            border-radius: 8px;
                        }
                        .spinner-sm {
                            width: 1.5rem;
                            height: 1.5rem;
                        }

                        @media print {
                            @page {
                                size: A4 landscape;
                                margin: 10mm;
                            }
                            html, body, #root, #root > div, .App, .admin-layout, .layout-main, .wpWrapper, .report-wrapper {
                                display: block !important;
                                height: auto !important;
                                min-height: auto !important;
                                overflow: visible !important;
                                overflow-y: visible !important;
                                position: static !important;
                                padding: 0 !important;
                                margin: 0 !important;
                            }
                            body {
                                background-color: #ffffff !important;
                                color: #000000 !important;
                            }
                            .no-print, 
                            .no-print *,
                            header, 
                            nav, 
                            aside, 
                            .sidebar, 
                            .topbar,
                            .navbar,
                            footer {
                                display: none !important;
                                height: 0 !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }

                            .report-print-area {
                                display: block !important;
                                box-shadow: none !important;
                                border: none !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                overflow: visible !important;
                            }
                            .report-print-area .card-body {
                                padding: 0 !important;
                                display: block !important;
                                height: auto !important;
                                overflow: visible !important;
                            }
                            .table-responsive {
                                display: contents !important;
                                overflow: visible !important;
                            }
                            .report-table {
                                width: 100% !important;
                                border-collapse: collapse !important;
                                display: table !important;
                                margin-top: 15px !important;
                                break-inside: auto !important;
                                page-break-inside: auto !important;
                            }
                            .report-table th, .report-table td {
                                border: 1px solid #dee2e6 !important;
                                padding: 6px 8px !important;
                                font-size: 11px !important;
                            }
                            tr {
                                break-inside: avoid !important;
                                page-break-inside: avoid !important;
                            }
                        }
                    `}</style>
                </>
            )}
        </>
    );
};

export default SageInvoiceReport;
