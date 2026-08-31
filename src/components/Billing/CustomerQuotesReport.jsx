import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const CustomerQuotesReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userdata = JSON.parse(localStorage.getItem("data123") || "{}");
    const userid = userdata?.id;
    const usertype = userdata?.user_type;
    const [hasPermission, setHasPermission] = useState(null);

    // Default Date Helpers (Last 30 Days to Present Date)
    const formatDateToYYYYMMDD = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const getDefaultEndDate = () => {
        const d = new Date();
        return formatDateToYYYYMMDD(d);
    };

    const getDefaultStartDate = () => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateToYYYYMMDD(d);
    };

    // States for filters
    const [startDate, setStartDate] = useState(location.state?.startDate || getDefaultStartDate());
    const [endDate, setEndDate] = useState(location.state?.endDate || getDefaultEndDate());
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");
    const [invoiceStatus, setInvoiceStatus] = useState(location.state?.invoiceStatus || "ALL");
    const [search, setSearch] = useState("");

    // Report data states
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({
        total_records: 0,
        total_exclusive: "0.00",
        total_vat: "0.00",
        grand_total: "0.00"
    });

    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const limit = 10000;
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));


    // Fetch report data
    const fetchReportData = async (
        pageNo = 1,
        optStartDate = startDate,
        optEndDate = endDate,
        optCustomerFrom = customerFrom,
        optCustomerTo = customerTo,
        optCategoryFrom = categoryFrom,
        optCategoryTo = categoryTo,
        optInvoiceStatus = invoiceStatus
    ) => {
        setLoader(true);
        try {
            const payload = {
                start_date: optStartDate || null,
                end_date: optEndDate || null,
                customer_from: optCustomerFrom || null,
                customer_to: optCustomerTo || null,
                category_from: optCategoryFrom || null,
                category_to: optCategoryTo || null,
                document_status: optInvoiceStatus || "ALL"
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerQuotesReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || {
                    total_records: 0,
                    total_exclusive: "0.00",
                    total_vat: "0.00",
                    grand_total: "0.00"
                });
                setTotalPage(Math.ceil((response.data.summary?.total_records || 1) / limit) || 1);
                setCurrentPage(pageNo);
            } else {
                setReportData([]);
                setSummary({
                    total_records: 0,
                    total_exclusive: "0.00",
                    total_vat: "0.00",
                    grand_total: "0.00"
                });
                setTotalPage(1);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
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
            const postdata = {
                staff_id: userid,
                route_url: "/Admin/customer-quotes-report",
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if (response.data && response.data.success === true) {
                setHasPermission(true);
                fetchReportData(1);
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

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        fetchReportData(1);
    };

    const handleReset = () => {
        const start = getDefaultStartDate();
        const end = getDefaultEndDate();
        setStartDate(start);
        setEndDate(end);
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setInvoiceStatus("ALL");
        // setSearch("");
        fetchReportData(1, start, end, "", "", "", "", "ALL");
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to format currency values
    const formatCurrency = (amount, currency = "ZAR") => {
        const num = parseFloat(amount);
        const getCurrencySymbol = (curr) => {
            if (!curr) return "R";
            const val = curr.toString().trim().toLowerCase();
            if (val === "usd") return "$";
            if (val === "rand" || val === "zar" || val === "r") return "R";
            if (val === "kwacha" || val === "mwk" || val === "k") return "K";
            if (val === "euro" || val === "eur") return "€";
            if (val === "inr") return "₹";
            return curr;
        };
        const symbol = getCurrencySymbol(currency);
        if (isNaN(num)) return `${symbol} 0.00`;
        return `${symbol} ${num.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
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

    // Resolve current selected filter text
    const getCustomerFilterText = () => {
        if (!customerFrom && !customerTo) return "All Customers";
        if (customerFrom === customerTo) return customerFrom;
        return `${customerFrom || "A"} to ${customerTo || "Z"}`;
    };

    const getCategoryFilterText = () => {
        if (!categoryFrom && !categoryTo) return "All Categories";
        if (categoryFrom === categoryTo) return categoryFrom;
        return `${categoryFrom || "Start"} to ${categoryTo || "End"}`;
    };

    const getDateRangeText = () => {
        if (!startDate && !endDate) return "All Dates";
        return `${formatDateString(startDate)} - ${formatDateString(endDate)}`;
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
                    <div className="container-fluid no-print">
                        <div className="row manageFreight">
                            <div className="col-12">
                                <h4 className="freight_hd">Customer Quotes Report</h4>
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
                <div className="container-fluid no-print">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowBackIcon /> Back to Quotes
                        </button>
                        <button className="btn btn-primary d-flex align-items-center gap-2 blueBtn" onClick={handlePrint}>
                            <PrintIcon /> Print Report
                        </button>
                    </div>

                    <div className="card shadow-sm border-0 mb-4 bg-light">
                        <div className="card-body">
                            <form onSubmit={handleSearch} className="row g-2 justify-content-center align-items-end">
                                <div className="col-lg-4 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Date Range</label>
                                    <div className="d-flex gap-1">
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Customer</label>
                                    <div className="d-flex gap-1">
                                        <select
                                            className="form-select form-select-sm"
                                            value={customerFrom}
                                            onChange={(e) => setCustomerFrom(e.target.value)}
                                        >
                                            <option value="">(From)</option>
                                            {alphabet.map((letter) => (
                                                <option key={letter} value={letter}>
                                                    {letter}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className="form-select form-select-sm"
                                            value={customerTo}
                                            onChange={(e) => setCustomerTo(e.target.value)}
                                        >
                                            <option value="">(To)</option>
                                            {alphabet.map((letter) => (
                                                <option key={letter} value={letter}>
                                                    {letter}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Category</label>
                                    <div className="d-flex gap-1">
                                        <select
                                            className="form-select form-select-sm"
                                            value={categoryFrom}
                                            onChange={(e) => setCategoryFrom(e.target.value)}
                                        >
                                            <option value="">(From)</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                        <select
                                            className="form-select form-select-sm"
                                            value={categoryTo}
                                            onChange={(e) => setCategoryTo(e.target.value)}
                                        >
                                            <option value="">(To)</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Zambia">Zambia</option>
                                            <option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-lg-2 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Invoice Status</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={invoiceStatus}
                                        onChange={(e) => setInvoiceStatus(e.target.value)}
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Invoiced">Invoiced</option>
                                        <option value="Expired">Expired</option>
                                    </select>
                                </div>

                                <div className="col-lg-2 col-md-4 col-sm-6 d-flex gap-2">
                                    <button type="submit" className="btn btn-primary blueBtn btn-sm w-50">
                                        View
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm w-50" onClick={handleReset}>
                                        Reset
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
                            <h4 className="report-title mb-1 fw-bold text-dark text-start">Customer Quotes Report</h4>
                            <h6 className="report-subtitle mb-4 text-start fw-bold text-secondary">Asia Direct Africa</h6>

                            <div className="report-meta-info text-start mt-3">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="d-flex mb-1">
                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Customer:</span>
                                            <span className="text-secondary">{getCustomerFilterText()}</span>
                                        </div>
                                        <div className="d-flex mb-1">
                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Category:</span>
                                            <span className="text-secondary">{getCategoryFilterText()}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="d-flex mb-1">
                                            <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date Range:</span>
                                            <span className="text-secondary">{getDateRangeText()}</span>
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
                                        <th>Date</th>
                                        <th>Expiry Date</th>
                                        <th>Document No.</th>
                                        <th>Customer Ref.</th>
                                        <th>Customer</th>
                                        <th>Country</th>
                                        <th className="text-end">Exclusive</th>
                                        <th className="text-end">VAT</th>
                                        <th className="text-end">Total</th>
                                        <th>Sales Rep</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loader ? (
                                        <tr>
                                            <td colSpan="10" className="text-center py-4">
                                                <div className="spinner-border text-primary spinner-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2 mb-0 text-secondary">Fetching report data...</p>
                                            </td>
                                        </tr>
                                    ) : reportData.length > 0 ? (
                                        reportData.map((item, idx) => {
                                            const currency = item.final_base_currency || "ZAR";
                                            return (
                                                <tr key={`${item.quote_id}-${idx}`}>
                                                    <td>{formatDateString(item.quote_date || "")}</td>
                                                    <td>
                                                        {formatDateString(
                                                            item.expiry_date || ""
                                                        )}
                                                    </td>
                                                    <td>{item.reference_no || "-"}</td>
                                                    <td>{item.customer_reference || "-"}</td>
                                                    <td>{item.client_name || "-"}</td>
                                                    <td>{item.invoice_for_country || "-"}</td>
                                                    <td className="text-end">{formatCurrency(item.exclusive, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.vat, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.total, currency)}</td>
                                                    <td>{item.sales_rep_name || "-"}</td>
                                                    <td>
                                                        <span className={`badge ${item.document_status === "Invoiced" ? "bg-success" : item.document_status === "Expired" ? "bg-danger": "bg-warning text-dark"
                                                            }`}>
                                                            {item.document_status || "-"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="text-center py-4 text-secondary">
                                                No Report Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* {reportData.length > 0 && (
                                    <tfoot className="table-light-grey fw-bold">
                                        <tr>
                                            <td colSpan="5" className="text-end">Total</td>
                                            <td className="text-end">{formatCurrency(summary.total_exclusive)}</td>
                                            <td className="text-end">{formatCurrency(summary.total_vat)}</td>
                                            <td className="text-end">{formatCurrency(summary.grand_total)}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    </tfoot>
                                )} */}
                            </table>
                        </div>

                        {/* Pagination - hidden on print */}
                        {/* {!loader && reportData.length > 0 && totalPage > 1 && (
                            <div className="d-flex justify-content-end align-items-center mt-3 no-print">
                                <button
                                    disabled={currentPage === 1}
                                    className="btn btn-sm btn-outline-secondary px-2 py-1 me-2"
                                    onClick={() => fetchReportData(currentPage - 1)}
                                >
                                    Previous
                                </button>
                                <span className="mx-2 text-secondary">
                                    Page {currentPage} of {totalPage}
                                </span>
                                <button
                                    disabled={currentPage === totalPage}
                                    className="btn btn-sm btn-outline-secondary px-2 py-1 ms-2"
                                    onClick={() => fetchReportData(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>

            

            {/* Custom Print and Layout styles */}
            <style>{`
                 .report-title {
                     font-size: 16px !important;
                 }
                 .report-subtitle {
                     font-size: 12px !important;
                     margin-bottom: 12px !important;
                 }
                 .report-meta-info {
                     font-size: 11px !important;
                 }
                 .report-meta-info span {
                     font-size: 11px !important;
                 }
                .report-wrapper {
                    padding: 20px;
                }
                .label-width {
                    display: inline-block;
                    width: 110px;
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
                    .badge {
                        border: none !important;
                        outline: none !important;
                        background: none !important;
                        color: #000 !important;
                        padding: 0 !important;
                        font-size: 11px !important;
                    }
                }
             `}</style>
                </>
            )}
        </>
    );
};

export default CustomerQuotesReport;
