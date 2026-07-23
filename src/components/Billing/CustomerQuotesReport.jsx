import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const CustomerQuotesReport = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default dates: Start and end of current month
    const getStartOfCurrentMonth = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-01`;
    };

    const getEndOfCurrentMonth = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
        return `${y}-${m}-${lastDay}`;
    };

    // States for filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [customerFrom, setCustomerFrom] = useState("");
    const [customerTo, setCustomerTo] = useState("");
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [invoiceStatus, setInvoiceStatus] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

    // Customers and report data states
    const [customers, setCustomers] = useState([]);
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

    // Fetch client list for dropdowns
    const fetchCustomers = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}client-list`, {
                page: 1,
                limit: 1000
            });
            if (response.data && response.data.success) {
                const sorted = (response.data.data || []).sort((a, b) => {
                    const nameA = (a.full_name || a.client_name || "").toLowerCase();
                    const nameB = (b.full_name || b.client_name || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setCustomers(sorted);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    // Fetch report data
    const fetchReportData = async (pageNo = 1) => {
        setLoader(true);
        try {
            const payload = {
                start_date: startDate || null,
                end_date: endDate || null,
                customer_from: customerFrom ? Number(customerFrom) : null,
                customer_to: customerTo ? Number(customerTo) : null,
                category_from: categoryFrom || null,
                category_to: categoryTo || null,
                invoice_status: invoiceStatus || "ALL",
                status: status || "BOTH",
                // search: search || "",
                // page: pageNo,
                // limit: limit
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

    useEffect(() => {
        fetchCustomers();
        // If navigation state has client_id, pre-select it
        if (location.state && location.state.client_id) {
            setCustomerFrom(location.state.client_id);
            setCustomerTo(location.state.client_id);
        }
    }, [location.state]);

    useEffect(() => {
        fetchReportData(1);
    }, [customerFrom, customerTo, startDate, endDate, categoryFrom, categoryTo, invoiceStatus, status]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        fetchReportData(1);
    };

    const handleReset = () => {
        setStartDate(getStartOfCurrentMonth());
        setEndDate(getEndOfCurrentMonth());
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setInvoiceStatus("ALL");
        setStatus("BOTH");
        // setSearch("");
        fetchReportData(1);
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to format currency values
    const formatCurrency = (amount, currency = "ZAR") => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "R 0.00";
        const symbol = currency === "USD" ? "$" : (currency === "ZAR" ? "R" : currency);
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
        const fromCust = customers.find(c => c.id === Number(customerFrom));
        const toCust = customers.find(c => c.id === Number(customerTo));
        if (customerFrom === customerTo && fromCust) {
            return fromCust.full_name || fromCust.client_name || `Customer ID ${customerFrom}`;
        }
        const fromName = fromCust ? (fromCust.full_name || fromCust.client_name) : `ID ${customerFrom}`;
        const toName = toCust ? (toCust.full_name || toCust.client_name) : `ID ${customerTo}`;
        return `${fromName || "Start"} to ${toName || "End"}`;
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

                    {/* Filter Card */}
                    <div className="card shadow-sm border-0 mb-4 bg-light">
                        <div className="card-body">
                            <h5 className="card-title mb-3 text-dark fw-bold">Report Filters</h5>
                            <form onSubmit={handleSearch}>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">End Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Customer From</label>
                                        <select
                                            className="form-select"
                                            value={customerFrom}
                                            onChange={(e) => setCustomerFrom(e.target.value)}
                                        >
                                            <option value="">All Customers</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.full_name || c.client_name || `Customer #${c.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Customer To</label>
                                        <select
                                            className="form-select"
                                            value={customerTo}
                                            onChange={(e) => setCustomerTo(e.target.value)}
                                        >
                                            <option value="">All Customers</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.full_name || c.client_name || `Customer #${c.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Category From</label>
                                        <select
                                            className="form-select"
                                            value={categoryFrom}
                                            onChange={(e) => setCategoryFrom(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="AIR">AIR</option>
                                            <option value="SEA">SEA</option>
                                            <option value="ROAD">ROAD</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Category To</label>
                                        <select
                                            className="form-select"
                                            value={categoryTo}
                                            onChange={(e) => setCategoryTo(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="AIR">AIR</option>
                                            <option value="SEA">SEA</option>
                                            <option value="ROAD">ROAD</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Invoice Status</label>
                                        <select
                                            className="form-select"
                                            value={invoiceStatus}
                                            onChange={(e) => setInvoiceStatus(e.target.value)}
                                        >
                                            <option value="ALL">ALL</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Invoiced">Invoiced</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label text-secondary fw-semibold">Status</label>
                                        <select
                                            className="form-select"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="BOTH">BOTH</option>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </div>
                                    {/* <div className="col-md-2">
                                        <label className="form-label text-secondary fw-semibold">Search</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ref / Customer name..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div> */}
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                                        Reset
                                    </button>
                                    <button type="submit" className="btn btn-primary blueBtn">
                                        Search
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
                                    <div className="col-sm-4 d-flex">
                                        <span className="fw-bold text-dark me-2 label-width">Customer:</span>
                                        <span className="text-secondary">{getCustomerFilterText()}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col-sm-4 d-flex">
                                        <span className="fw-bold text-dark me-2 label-width">Category:</span>
                                        <span className="text-secondary">{getCategoryFilterText()}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col-sm-4 d-flex">
                                        <span className="fw-bold text-dark me-2 label-width">Date Range:</span>
                                        <span className="text-secondary">{getDateRangeText()}</span>
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
                                                    <td className="text-end">{formatCurrency(item.exclusive, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.vat, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.total, currency)}</td>
                                                    <td>{item.sales_rep_name || "-"}</td>
                                                    <td>
                                                        <span className={`badge ${item.document_status === "Invoiced" ? "bg-success" : "bg-warning text-dark"
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

            <ToastContainer position="top-right" autoClose={3000} />

            {/* Custom Print and Layout styles */}
            <style>{`
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
    );
};

export default CustomerQuotesReport;
