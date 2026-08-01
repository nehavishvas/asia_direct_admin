import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const CustomerUnallocatedReport = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default dates: Start and end of last month
    const getStartOfLastMonth = () => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-01`;
    };

    const getEndOfLastMonth = () => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
        return `${y}-${m}-${lastDay}`;
    };

    const [startDate, setStartDate] = useState(location.state?.startDate || getStartOfLastMonth());
    const [endDate, setEndDate] = useState(location.state?.endDate || getEndOfLastMonth());
    const [customerFrom, setCustomerFrom] = useState(location.state?.customerFrom || "");
    const [customerTo, setCustomerTo] = useState(location.state?.customerTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");
    // const [status, setStatus] = useState("ACTIVE");

    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(true);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    useEffect(() => {
        fetchReportData();
    }, []);

    // Fetch report data
    const fetchReportData = async (
        e,
        optStartDate = startDate,
        optEndDate = endDate,
        optCustomerFrom = customerFrom,
        optCustomerTo = customerTo,
        optCategoryFrom = categoryFrom,
        optCategoryTo = categoryTo
    ) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                start_date: optStartDate || null,
                end_date: optEndDate || null,
                customer_from: optCustomerFrom || null,
                customer_to: optCustomerTo || null,
                category_from: optCategoryFrom || null,
                category_to: optCategoryTo || null,
                // status: status || "ACTIVE"
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getCustomerUnallocatedReceiptsReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
            } else {
                setReportData([]);
                toast.error(response.data?.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching unallocated receipts report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setReportData([]);
        } finally {
            setLoader(false);
        }
    };

    const handleReset = () => {
        const start = getStartOfLastMonth();
        const end = getEndOfLastMonth();
        setStartDate(start);
        setEndDate(end);
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        // setStatus("ACTIVE");
        fetchReportData(null, start, end, "", "", "", "");
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrencyValue = (val, customerName = "") => {
        const num = parseFloat(val);
        if (isNaN(num)) return "R 0.00";
        const nameLower = String(customerName || "").toLowerCase();
        const isUsd = nameLower.includes("(usd)") || nameLower.includes("usd");
        const symbol = isUsd ? "$" : "R";
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

    // Calculate grand totals for footer
    const calculateGrandTotals = () => {
        let totalReceipt = 0;
        let totalUnallocated = 0;
        reportData.forEach((block) => {
            totalReceipt += parseFloat(block.totals?.receipt) || 0;
            totalUnallocated += parseFloat(block.totals?.unallocated) || 0;
        });
        return { totalReceipt, totalUnallocated };
    };

    const grandTotals = calculateGrandTotals();

    return (
        <>
            <div className="wpWrapper report-wrapper">
                <div className="container-fluid no-print">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowBackIcon /> Back
                        </button>
                        {searched && reportData.length > 0 && (
                            <button className="btn btn-primary d-flex align-items-center gap-2 blueBtn" onClick={handlePrint}>
                                <PrintIcon /> Print Report
                            </button>
                        )}
                    </div>

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
                {searched && (
                    <div className="card shadow-sm border-0 report-print-area">
                        <div className="card-body p-4 p-md-5">
                            {loader ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-secondary">Generating report data...</p>
                                </div>
                            ) : reportData.length > 0 ? (
                                <>
                                    {/* Report Header */}
                                    <div className="report-header mb-4 text-start">
                                        <h4 className="report-title mb-1 fw-bold text-dark">Customer Unallocated Receipts Report</h4>
                                        <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                        <div className="report-meta-info mt-3">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Customer:</span>
                                                        <span className="text-secondary">
                                                            {!customerFrom && !customerTo ? "All Customers" : `${customerFrom || "A"} to ${customerTo || "Z"}`}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Category:</span>
                                                        <span className="text-secondary">
                                                            {!categoryFrom && !categoryTo ? "All Categories" : `${categoryFrom || "(Start)"} to ${categoryTo || "(End)"}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date Range:</span>
                                                        <span className="text-secondary">
                                                            {!startDate && !endDate ? "All Dates" : `${formatDateString(startDate)} - ${formatDateString(endDate)}`}
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
                                                    <th className="text-start">
                                                        <div style={{ fontSize: "10px", color: "#888", textTransform: "uppercase", marginBottom: "2px" }}>Customer</div>
                                                        <div>Date</div>
                                                    </th>
                                                    <th className="text-start">Document No.</th>
                                                    <th className="text-start">Reference</th>
                                                    <th className="text-start">Description</th>
                                                    <th className="text-end">Receipt</th>
                                                    <th className="text-end">Unallocated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.map((custBlock) => (
                                                    <React.Fragment key={custBlock.customer_id || custBlock.customer}>
                                                        {/* Group Subheader for Customer */}
                                                        <tr>
                                                            <td colSpan="6" className="text-start fw-bold text-dark" style={{ padding: "8px 12px", background: "#f8f9fa" }}>
                                                                {custBlock.customer || "Unspecified Customer"}
                                                                {custBlock.invoice_for_country ? (
                                                                    <> ({custBlock.invoice_for_country})</>
                                                                ) : null}
                                                            </td>
                                                        </tr>
                                                        {/* Group Transactions */}
                                                        {(custBlock.transactions || []).map((tx, txIdx) => (
                                                            <tr key={txIdx}>
                                                                <td className="text-start">{formatDateString(tx.date)}</td>
                                                                <td className="text-start">{tx.document_no || "-"}</td>
                                                                <td className="text-start">{tx.reference || "-"}</td>
                                                                <td className="text-start">{tx.description || "-"}</td>
                                                                {/* <td className="text-start">{tx.invoice_for_country || "-"}</td> */}
                                                                <td className="text-end">{formatCurrencyValue(tx.receipt, custBlock.customer)}</td>
                                                                <td className="text-end">{formatCurrencyValue(tx.unallocated, custBlock.customer)}</td>
                                                            </tr>
                                                        ))}
                                                        {/* Group Summary Row */}
                                                        {custBlock.totals && (
                                                            <tr className="fw-semibold" style={{ borderBottom: "2px solid #ccc", background: "#e9ecef" }}>
                                                                <td colSpan="4" className="text-start fw-bold">Total for {custBlock.customer || "Unspecified Customer"}</td>
                                                                <td className="text-end fw-bold">{formatCurrencyValue(custBlock.totals.receipt, custBlock.customer)}</td>
                                                                <td className="text-end fw-bold">{formatCurrencyValue(custBlock.totals.unallocated, custBlock.customer)}</td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                            <tfoot className="fw-bold" style={{ borderTop: "2px solid #aaa" }}>
                                                <tr style={{ background: "#e9ecef" }}>
                                                    <td colSpan="4" className="text-start">Grand Total</td>
                                                    <td className="text-end">{formatCurrencyValue(grandTotals.totalReceipt)}</td>
                                                    <td className="text-end">{formatCurrencyValue(grandTotals.totalUnallocated)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-0">No unallocated receipts found for the selected filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
            <style type="text/css">{`
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
                @page {
                    size: landscape;
                    margin: 10mm;
                }
                @media print {
                    /* Hide everything else */
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
                        border: 1px solid #000000 !important;
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

export default CustomerUnallocatedReport;
