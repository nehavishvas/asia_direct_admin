import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const SalesByCustomerSummaryReport = () => {
    const navigate = useNavigate();

    // Default Date Helpers (Last Month)
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
        return `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
    };

    // Filter States
    const [startDate, setStartDate] = useState(getStartOfLastMonth());
    const [endDate, setEndOfDate] = useState(getEndOfLastMonth());
    const [customerFrom, setCustomerFrom] = useState("");
    const [customerTo, setCustomerTo] = useState("");
    const [categoryFrom, setCategoryFrom] = useState("");
    const [categoryTo, setCategoryTo] = useState("");
    const [includeCreditNotes, setIncludeCreditNotes] = useState(true);

    // Response states
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    const handleReset = () => {
        setStartDate(getStartOfLastMonth());
        setEndOfDate(getEndOfLastMonth());
        setCustomerFrom("");
        setCustomerTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setIncludeCreditNotes(true);
        setReportData([]);
        setSummaryData(null);
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
                category_to: categoryTo || null,
                include_credit_notes: includeCreditNotes
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getSalesByCustomerSummaryReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setSummaryData(response.data.summary || null);
            } else {
                toast.error(response.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            console.error("Error fetching sales by customer summary report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helpers
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
                            <ArrowBackIcon /> Back
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
                                            onChange={(e) => setEndOfDate(e.target.value)}
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

                                <div className="col-lg-2 col-md-4 col-sm-6 d-flex align-items-center justify-content-end gap-1">
                                    <button type="submit" className="btn btn-primary blueBtn btn-sm">
                                        View
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
                                        Reset
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
                                    <h4 className="report-title mb-1 fw-bold text-dark">Sales By Customer Summary Report</h4>
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
                                    <table className="report-table">
                                        <thead>
                                            <tr className="header-top-row">
                                                <th colSpan="3" className="text-start align-bottom pb-1" style={{ width: "70%" }}>Name</th>
                                                <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "12%" }}>Qty</th>
                                                <th rowSpan="2" className="text-end align-bottom pb-2" style={{ width: "18%" }}>Total Selling</th>
                                            </tr>
                                            <tr className="header-bottom-row">
                                                <th className="text-start pt-1 pb-2" style={{ width: "12%" }}>Date</th>
                                                <th className="text-start pt-1 pb-2" style={{ width: "15%" }}>Reference</th>
                                                <th className="text-start pt-1 pb-2" style={{ width: "43%" }}>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.length > 0 ? (
                                                reportData.map((customerGroup, customerIndex) => {
                                                    return (
                                                        <React.Fragment key={customerIndex}>
                                                            {/* Customer Header Row */}
                                                            <tr className="customer-name-row">
                                                                <td colSpan="5" className="text-start">
                                                                    {customerGroup.customer || "Unknown Customer"}
                                                                </td>
                                                            </tr>
                                                            {/* Customer Invoices */}
                                                            {customerGroup.invoices && customerGroup.invoices.length > 0 ? (
                                                                customerGroup.invoices.map((invoice, invIndex) => (
                                                                    <tr key={`${customerIndex}-${invIndex}`} className="invoice-item-row">
                                                                        <td className="text-start">
                                                                            {formatDateString(invoice.date)}
                                                                        </td>
                                                                        <td className="text-start">
                                                                            {invoice.reference || "-"}
                                                                        </td>
                                                                        <td className="text-start">
                                                                            {/* Description is always blank in summary */}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {parseFloat(invoice.qty || 0).toFixed(4)}
                                                                        </td>
                                                                        <td className="text-end">
                                                                            {formatCurrency(invoice.total_selling, "R")}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" className="text-center text-muted py-2">
                                                                        No sales records for this customer.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {/* Customer Sub-total */}
                                                            <tr className="customer-total-row">
                                                                <td colSpan="3" className="text-start ps-3">Total for Customer:  {customerGroup.customer}</td>
                                                                <td className="text-end">{(parseFloat(customerGroup.customer_total_qty) || 0).toFixed(4)}</td>
                                                                <td className="text-end">{formatCurrency(customerGroup.customer_total_selling, "R")}</td>
                                                            </tr>
                                                            {/* Spacer Row between customers */}
                                                            <tr className="spacer-row" style={{ height: "20px" }}>
                                                                <td colSpan="5"></td>
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center text-muted py-4">
                                                        No data available for the selected filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {reportData.length > 0 && summaryData && (
                                            <tfoot>
                                                <tr className="grand-total-row">
                                                    <td colSpan="3" className="text-start ps-3">Grand Total:</td>
                                                    <td className="text-end">{(parseFloat(summaryData.grand_total_qty) || 0).toFixed(4)}</td>
                                                    <td className="text-end">{formatCurrency(summaryData.grand_total_selling, "R")}</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted mb-0">Please use the filter card to search for sales by customer summary.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
            <style type="text/css">{`
                 .report-title {
                     font-size: 16px !important;
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
                 .report-table {
                     width: 100%;
                     border-collapse: collapse;
                     margin-top: 15px;
                     background-color: #ffffff;
                     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                 }
                 .report-table td {
                     border-width: 0 !important;
                     background-color: transparent !important;
                     color: #000000 !important;
                     padding: 4px 8px;
                     font-size: 11px;
                 }
                 .report-table th {
                     border-width: 0 !important;
                     background-color: #1b2245 !important;
                     color: #ffffff !important;
                     padding: 6px 8px;
                     font-size: 11px;
                     font-weight: bold;
                     -webkit-print-color-adjust: exact !important;
                     print-color-adjust: exact !important;
                 }
                 .report-table tr {
                     background-color: transparent !important;
                 }
                 .report-table tbody tr.customer-name-row td {
                     font-size: 12px;
                     font-weight: bold;
                     padding-top: 14px;
                     padding-bottom: 6px;
                 }
                 .report-table tbody tr.invoice-item-row td {
                     padding-top: 2px;
                     padding-bottom: 2px;
                 }
                 .report-table tbody tr.customer-total-row td {
                     font-weight: bold;
                     padding-top: 6px;
                     padding-bottom: 6px;
                     border-bottom: 1.5px solid #000000 !important;
                 }
                 .report-table tfoot tr.grand-total-row td {
                     font-weight: bold;
                     padding-top: 6px;
                     padding-bottom: 6px;
                     border-bottom: 4px double #000000 !important;
                 }
                 
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
                         padding: 4px 6px !important;
                         font-size: 10px !important;
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

export default SalesByCustomerSummaryReport;
