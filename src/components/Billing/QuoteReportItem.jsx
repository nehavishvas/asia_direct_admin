import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const QuoteReportItem = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default date range helper
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

    // Filter States
    const [startDate, setStartDate] = useState(location.state?.startDate || getStartOfCurrentMonth());
    const [endDate, setEndDate] = useState(location.state?.endDate || getEndOfCurrentMonth());
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");

    // Response states
    const [reportData, setReportData] = useState([]);
    const [grandTotal, setGrandTotal] = useState(null);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleReset = () => {
        setStartDate(getStartOfCurrentMonth());
        setEndDate(getEndOfCurrentMonth());
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setReportData([]);
        setGrandTotal(null);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    // Fetch report data
    const fetchReportData = async (e) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                start_date: startDate || null,
                end_date: endDate || null,
                customer_from: customerFrom || null,
                customer_to: customerTo || null,
                category_from: categoryFrom || null,
                category_to: categoryTo || null
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerQuotesByItemReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setGrandTotal(response.data.grand_total || null);
            } else {
                toast.error(response.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching quotes by item report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (location.state) {
            fetchReportData();
        }
    }, [location.state]);

    // Helpers
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode) return "R";
        const code = String(currencyCode).toUpperCase();
        if (code === "USD") return "$";
        if (code === "EUR" || code === "EURO") return "€";
        if (code === "GBP") return "£";
        return "R";
    };

    const formatCurrency = (amount, currencySymbol = "R") => {
        const num = parseFloat(amount);
        if (isNaN(num)) return `${currencySymbol}0.00`;
        const isNegative = num < 0;
        const absVal = Math.abs(num).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return isNegative ? `${currencySymbol}-${absVal}` : `${currencySymbol}${absVal}`;
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
                            <form onSubmit={fetchReportData} className="row g-2 justify-content-center align-items-end">
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

                                <div className="col-lg-3 col-md-4 col-sm-6">
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

                                <div className="col-lg-3 col-md-4 col-sm-6">
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

                                <div className="col-lg-2 col-md-4 col-sm-6 d-flex gap-2">
                                    <button type="submit" className="btn btn-primary blueBtn btn-sm w-50">
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Report Printable Area */}
                <div className="card shadow-sm border-0 report-print-area">
                    <div className="card-body p-4 p-md-5">
                        {loader ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary spinner-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-secondary">Generating report...</p>
                            </div>
                        ) : searched ? (
                            <>
                                {/* Report Header */}
                                <div className="report-header mb-4 text-start">
                                    <h4 className="report-title mb-1 fw-bold text-dark">Quote Report Item</h4>
                                    <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                    <div className="report-meta-info mt-3">
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
                                                <th className="text-start">Date</th>
                                                <th className="text-start">Reference</th>
                                                <th className="text-start">Customer</th>
                                                <th className="text-start">Expiry Date</th>
                                                <th className="text-start">Status</th>
                                                <th className="text-end">Qty</th>
                                                <th className="text-end">Total Cost</th>
                                                <th className="text-end">Total Selling</th>
                                                <th className="text-end">GP Amount</th>
                                                <th className="text-end">GP %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.length > 0 ? (
                                                reportData.map((group, groupIndex) => {
                                                    const groupTitle = `${group.component_code ? group.component_code + " - " : ""}${group.component_name || ""}`;
                                                    return (
                                                        <React.Fragment key={groupIndex}>
                                                            {/* Component Group Title */}
                                                            <tr className="table-secondary fw-bold text-dark text-start">
                                                                <td colSpan="10" className="ps-3 bg-light text-dark fw-bold" style={{ fontSize: "14px", borderBottom: "2px solid #ddd" }}>
                                                                    {groupTitle}
                                                                </td>
                                                            </tr>
                                                            {/* Group Records */}
                                                            {group.records && group.records.length > 0 ? (
                                                                group.records.map((rec, recIndex) => {
                                                                    const currencySymbol = getCurrencySymbol(rec.currency);
                                                                    return (
                                                                        <tr key={`${groupIndex}-${recIndex}`}>
                                                                            <td className="text-start">{formatDateString(rec.quote_date)}</td>
                                                                            <td className="text-start">{rec.reference_no || "-"}</td>
                                                                            <td className="text-start">{rec.customer || "-"}</td>
                                                                            <td className="text-start">{formatDateString(rec.expiry_date)}</td>
                                                                            <td className="text-start">{rec.document_status || "-"}</td>
                                                                            <td className="text-end">{parseFloat(rec.qty || 0).toFixed(4)}</td>
                                                                            <td className="text-end">{formatCurrency(rec.total_cost, currencySymbol)}</td>
                                                                            <td className="text-end">{formatCurrency(rec.total_selling, currencySymbol)}</td>
                                                                            <td className="text-end">{formatCurrency(rec.gp_amount, currencySymbol)}</td>
                                                                            <td className="text-end">{parseFloat(rec.gp_percent || 0).toFixed(2)}%</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="10" className="text-center text-muted py-2">
                                                                        No records for this component.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {/* Group totals */}
                                                            {group.totals && (
                                                                <tr className="table-light fw-bold" style={{ borderBottom: "2px solid #ccc" }}>
                                                                    <td colSpan="5" className="text-start ps-3">Total {groupTitle}:</td>
                                                                    <td className="text-end">{parseFloat(group.totals.qty || 0).toFixed(4)}</td>
                                                                    <td className="text-end">{formatCurrency(group.totals.total_cost, "R")}</td>
                                                                    <td className="text-end">{formatCurrency(group.totals.total_selling, "R")}</td>
                                                                    <td className="text-end">{formatCurrency(group.totals.gp_amount, "R")}</td>
                                                                    <td className="text-end">{parseFloat(group.totals.gp_percent || 0).toFixed(2)}%</td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="text-center text-muted py-4">
                                                        No data available for the selected filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {reportData.length > 0 && grandTotal && (
                                            <tfoot className="table-dark fw-bold" style={{ borderTop: "2px solid #000" }}>
                                                <tr>
                                                    <td colSpan="5" className="text-start ps-3">Grand Total:</td>
                                                    <td className="text-end">{parseFloat(grandTotal.qty || 0).toFixed(3)}</td>
                                                    <td className="text-end">{formatCurrency(grandTotal.total_cost, "R")}</td>
                                                    <td className="text-end">{formatCurrency(grandTotal.total_selling, "R")}</td>
                                                    <td className="text-end">{formatCurrency(grandTotal.gp_amount, "R")}</td>
                                                    <td className="text-end text-info">{parseFloat(grandTotal.gp_percent || 0).toFixed(2)}%</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">Please use the filter card to search for quote report items.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
            <style type="text/css" media="print">{`
                @page {
                    size: landscape;
                    margin: 10mm;
                }
                @media print {
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

export default QuoteReportItem;
