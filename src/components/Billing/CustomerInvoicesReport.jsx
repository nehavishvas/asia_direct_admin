import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const CustomerInvoicesReport = () => {
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
    const [startDate, setStartDate] = useState(location.state?.startDate || getStartOfCurrentMonth());
    const [endDate, setEndDate] = useState(location.state?.endDate || getEndOfCurrentMonth());
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");
    const [invoiceStatus, setInvoiceStatus] = useState(location.state?.invoiceStatus || "ALL");
    const [search, setSearch] = useState("");

    // Report data states
    const [reportData, setReportData] = useState([]);

    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const limit = 10000; // Load all matching records for complete printing
    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    // Fetch report data
    const fetchReportData = async (pageNo = 1) => {
        setLoader(true);
        try {
            const payload = {
                start_date: startDate || null,
                end_date: endDate || null,
                customer_from: customerFrom || null,
                customer_to: customerTo || null,
                category_from: categoryFrom || null,
                category_to: categoryTo || null,
                invoice_status: invoiceStatus || "ALL"
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerInvoicesReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                const totalRecords = response.data.total || response.data.data?.length || 0;
                setTotalPage(Math.ceil(totalRecords / limit) || 1);
                setCurrentPage(pageNo);
            } else {
                setReportData([]);
                setTotalPage(1);
            }
        } catch (error) {
            console.error("Error fetching invoices report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        fetchReportData(1);
    }, [location.state]);

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

    // Calculate totals dynamically for the footer
    const calculateTotals = () => {
        let totalExclusive = 0;
        let totalVat = 0;
        let totalSelling = 0;
        let totalOutstanding = 0;

        reportData.forEach((item) => {
            totalExclusive += parseFloat(item.exclusive) || 0;
            totalVat += parseFloat(item.vat) || 0;
            totalSelling += parseFloat(item.total) || 0;

            // Outstanding total: use explicit outstanding amount or total if unpaid
            const outstanding = item.total_outstanding !== undefined
                ? parseFloat(item.total_outstanding)
                : (item.status === "unpaid" ? parseFloat(item.total) : 0);
            totalOutstanding += isNaN(outstanding) ? 0 : outstanding;
        });

        return {
            totalExclusive,
            totalVat,
            totalSelling,
            totalOutstanding
        };
    };

    // Resolve current selected filter text
    const getCustomerFilterText = () => {
        if (!customerFrom && !customerTo) return "All Customers";
        if (customerFrom === customerTo) return customerFrom;
        return `${customerFrom || "A"} to ${customerTo || "Z"}`;
    };

    const getCategoryFilterText = () => {
        if (!categoryFrom && !categoryTo) return "All Category";
        if (categoryFrom === categoryTo) return categoryFrom;
        return `${categoryFrom || "Start"} to ${categoryTo || "End"}`;
    };

    const getDateRangeText = () => {
        if (!startDate && !endDate) return "All Dates";
        if (startDate && !endDate) return `From ${formatDateString(startDate)}`;
        if (!startDate && endDate) return `Until ${formatDateString(endDate)}`;
        return `${formatDateString(startDate)} - ${formatDateString(endDate)}`;
    };

    const totals = calculateTotals();

    return (
        <>
            <div className="wpWrapper report-wrapper">
                <div className="container-fluid no-print">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowBackIcon /> Back to Invoices
                        </button>
                        <button className="btn btn-primary d-flex align-items-center gap-2 blueBtn" onClick={handlePrint}>
                            <PrintIcon /> Print Report
                        </button>
                    </div>

                    {/* Filter Card */}
                    {/* <div className="card shadow-sm border-0 mb-4 bg-light">
                        <div className="card-body">
                            <h5 className="card-title mb-4 text-dark fw-bold text-center">Customer Invoices Report</h5>
                            <form onSubmit={handleSearch}>
                                <div className="row justify-content-center">
                                    <div className="col-md-8">
                                        <div className="row mb-3 align-items-center">
                                            <div className="col-sm-3 text-md-end text-start">
                                                <label className="form-label text-secondary fw-semibold mb-0">Date Range</label>
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3 align-items-center">
                                            <div className="col-sm-3 text-md-end text-start">
                                                <label className="form-label text-secondary fw-semibold mb-0">Customer</label>
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <select
                                                    className="form-select"
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
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <select
                                                    className="form-select"
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

                                        <div className="row mb-3 align-items-center">
                                            <div className="col-sm-3 text-md-end text-start">
                                                <label className="form-label text-secondary fw-semibold mb-0">Category</label>
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <select
                                                    className="form-select"
                                                    value={categoryFrom}
                                                    onChange={(e) => setCategoryFrom(e.target.value)}
                                                >
                                                    <option value="">(From)</option>
                                                    <option value="South Africa">South Africa</option>
                                                    <option value="Zambia">Zambia</option>
                                                    <option value="Zimbabwe">Zimbabwe</option>
                                                </select>
                                            </div>
                                            <div className="col-sm-4 col-6">
                                                <select
                                                    className="form-select"
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

                                        <div className="row mb-3 align-items-center">
                                            <div className="col-sm-3 text-md-end text-start">
                                                <label className="form-label text-secondary fw-semibold mb-0">Invoice Status</label>
                                            </div>
                                            <div className="col-sm-9">
                                                <select
                                                    className="form-select"
                                                    value={invoiceStatus}
                                                    onChange={(e) => setInvoiceStatus(e.target.value)}
                                                >
                                                    <option value="ALL">ALL</option>
                                                    <option value="unpaid">Unpaid</option>
                                                    <option value="paid">Paid</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-center gap-2 mt-4">
                                            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                                                Reset
                                            </button>
                                            <button type="submit" className="btn btn-primary blueBtn">
                                                View Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div> */}
                </div>

                {/* Printable Report Area */}
                <div className="card shadow-sm border-0 report-print-area">
                    <div className="card-body p-4 p-md-5">
                        {/* Report Header */}
                        <div className="report-header mb-4">
                            <h4 className="report-title mb-1 fw-bold text-dark text-start">Customer Invoices Report</h4>
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
                                        <th>Document No.</th>
                                        <th>Customer Ref.</th>
                                        <th>Customer</th>
                                        <th>Country</th>
                                        <th>Sales Rep</th>
                                        <th>Due Date</th>
                                        <th>Ant. Pmt.</th>
                                        <th className="text-end">Exclusive</th>
                                        <th className="text-end">VAT</th>
                                        <th className="text-end">Total Selling</th>
                                        <th className="text-end">Total Outstanding</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loader ? (
                                        <tr>
                                            <td colSpan="11" className="text-center py-4">
                                                <div className="spinner-border text-primary spinner-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2 mb-0 text-secondary">Fetching report data...</p>
                                            </td>
                                        </tr>
                                    ) : reportData.length > 0 ? (
                                        reportData.map((item, idx) => {
                                            const currency = item.final_base_currency || "ZAR";
                                            const outstanding = item.total_outstanding !== undefined
                                                ? item.total_outstanding
                                                : (item.status === "unpaid" ? item.total : 0);
                                            return (
                                                <tr key={`${item.quote_invoice_id}-${idx}`}>
                                                    <td>{formatDateString(item.quote_date || item.created_at)}</td>
                                                    <td>{item.reference_no || "-"}</td>
                                                    <td>{item.freight_number || item.quote_reference_no || "-"}</td>
                                                    <td>{item.client_name || "-"}</td>
                                                    <td>{item.invoice_for_country || "-"}</td>
                                                    <td>{item.sales_rep_name || "-"}</td>
                                                    <td>{formatDateString(item.due_date)}</td>
                                                    <td>{item.anticipated_payment !== undefined ? item.anticipated_payment : "-"}</td>
                                                    <td className="text-end">{formatCurrency(item.exclusive, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.vat, currency)}</td>
                                                    <td className="text-end">{formatCurrency(item.total, currency)}</td>
                                                    <td className="text-end">{formatCurrency(outstanding, currency)}</td>
                                                    <td>
                                                        <span className={`badge ${item.status === "paid" ? "bg-success" : "bg-warning text-dark"
                                                            }`}>
                                                            {item.status || "-"}
                                                        </span>
                                                    </td>

                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="text-center py-4 text-secondary">
                                                No Report Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* {reportData.length > 0 && (
                                    <tfoot className="table-light-grey fw-bold">
                                        <tr>
                                            <td colSpan="7" className="text-end">Total</td>
                                            <td className="text-end">{formatCurrency(totals.totalExclusive)}</td>
                                            <td className="text-end">{formatCurrency(totals.totalVat)}</td>
                                            <td className="text-end">{formatCurrency(totals.totalSelling)}</td>
                                            <td className="text-end">{formatCurrency(totals.totalOutstanding)}</td>
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
                }
            `}</style>
        </>
    );
};

export default CustomerInvoicesReport;