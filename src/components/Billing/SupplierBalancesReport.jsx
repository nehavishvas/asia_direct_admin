import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const SupplierBalancesReport = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default to today's date
    const getTodayDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const [runDate, setRunDate] = useState(location.state?.runDate || "");
    const [supplierFrom, setSupplierFrom] = useState(location.state?.supplierFrom || "");
    const [supplierTo, setSupplierTo] = useState(location.state?.supplierTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");
    const [status, setStatus] = useState(location.state?.status || "Both"); // Both, Active, Inactive
    const [style, setStyle] = useState(location.state?.style || "Summary"); // Detailed, Summary
    const [excludeZeroBalance, setExcludeZeroBalance] = useState(location.state?.excludeZeroBalance || false);
    const [useForeignCurrency, setUseForeignCurrency] = useState(location.state?.useForeignCurrency || true);

    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(false);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    // Fetch report data
    const fetchReportData = async (e) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                run_at_date: runDate || null,
                supplier_from: supplierFrom || null,
                supplier_to: supplierTo || null,
                category_from: categoryFrom || null,
                category_to: categoryTo || null,
                status: status,
                style: style,
                exclude_zero_balance: excludeZeroBalance,
                use_foreign_currency: useForeignCurrency
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}getSupplierBalancesDaysOutstandingReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setSummary(response.data.grand_total || null);
            } else {
                setReportData([]);
                setSummary(null);
                toast.error(response.data?.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            toast.error(error.response?.data?.message || "Failed to fetch report data");
            setReportData([]);
            setSummary(null);
        } finally {
            setLoader(false);
        }
    };

    const handleReset = () => {
        setRunDate("");
        setSupplierFrom("");
        setSupplierTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setStatus("Both");
        setStyle("Summary");
        setExcludeZeroBalance(false);
        setUseForeignCurrency(true);
        setReportData([]);
        setSummary(null);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrencyValue = (val, supplierName = "") => {
        const num = parseFloat(val);
        if (isNaN(num)) return "R 0.00";
        const nameLower = String(supplierName || "").toLowerCase();
        const isUsd = nameLower.includes("(usd)") || nameLower.includes("usd");
        const symbol = isUsd ? "$ " : "R ";
        return `${symbol}${num.toLocaleString("en-US", {
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

    const getSupplierFilterText = () => {
        if (!supplierFrom && !supplierTo) return "All Suppliers";
        if (supplierFrom === supplierTo) return supplierFrom;
        return `${supplierFrom || "A"} to ${supplierTo || "Z"}`;
    };

    const getCategoryFilterText = () => {
        if (!categoryFrom && !categoryTo) return "All Categories";
        if (categoryFrom === categoryTo) return categoryFrom;
        return `${categoryFrom || "Start"} to ${categoryTo || "End"}`;
    };

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

                    {/* Filter Card */}
                    <div className="card shadow-sm border-0 mb-4 bg-light">
                        <div className="card-body">
                            <form onSubmit={fetchReportData} className="row g-2 justify-content-center align-items-end">
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Run At Date</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={runDate}
                                        onChange={(e) => setRunDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-lg-4 col-md-4 col-sm-6">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Supplier</label>
                                    <div className="d-flex gap-1">
                                        <select
                                            className="form-select form-select-sm"
                                            value={supplierFrom}
                                            onChange={(e) => setSupplierFrom(e.target.value)}
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
                                            value={supplierTo}
                                            onChange={(e) => setSupplierTo(e.target.value)}
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

                                <div className="col-lg-3 col-md-3 col-sm-6">
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

                                {/* <div className="col-lg-1 col-md-2 col-sm-4">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Status</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Both">Both</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div> */}

                                {/* <div className="col-lg-1 col-md-2 col-sm-4">
                                    <label className="form-label text-secondary fw-semibold mb-1" style={{ fontSize: "12px" }}>Style</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                    >
                                        <option value="Summary">Summary</option>
                                        <option value="Detailed">Detailed</option>
                                    </select>
                                </div> */}

                                {/* <div className="col-lg-2 col-md-3 col-sm-6 d-flex flex-column justify-content-end align-items-start gap-1 pb-1">
                                    <div className="form-check form-check-inline m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="excludeZero"
                                            checked={excludeZeroBalance}
                                            onChange={(e) => setExcludeZeroBalance(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="excludeZero" style={{ fontSize: "11px" }}>Exclude Zero Balance</label>
                                    </div>
                                    <div className="form-check form-check-inline m-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="foreignCurrency"
                                            checked={useForeignCurrency}
                                            onChange={(e) => setUseForeignCurrency(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="foreignCurrency" style={{ fontSize: "11px" }}>Use Foreign Currency</label>
                                    </div>
                                </div> */}

                                <div className="col-lg-2 col-md-3 col-sm-6 d-flex align-items-center justify-content-end gap-1">
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
                                        <h4 className="report-title mb-1 fw-bold text-dark">Supplier Balances - Days Outstanding Report</h4>
                                        <h6 className="report-subtitle mb-4 fw-bold text-secondary">Asia Direct Africa</h6>

                                        <div className="report-meta-info mt-3">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Supplier:</span>
                                                        <span className="text-secondary">{getSupplierFilterText()}</span>
                                                    </div>
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Category:</span>
                                                        <span className="text-secondary">{getCategoryFilterText()}</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex mb-1">
                                                        <span className="fw-bold text-dark me-2" style={{ minWidth: "120px" }}>Date:</span>
                                                        <span className="text-secondary">{formatDateString(runDate)}</span>
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
                                                    <th className="text-start">Supplier</th>
                                                    <th className="text-end">120+ Days</th>
                                                    <th className="text-end">90 Days</th>
                                                    <th className="text-end">60 Days</th>
                                                    <th className="text-end">30 Days</th>
                                                    <th className="text-end">Current</th>
                                                    <th className="text-end">Total Due</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="text-start">{item.supplier_name || "Unknown Supplier"}</td>
                                                        <td className="text-end">{formatCurrencyValue(item.days_120, item.supplier_name)}</td>
                                                        <td className="text-end">{formatCurrencyValue(item.days_90, item.supplier_name)}</td>
                                                        <td className="text-end">{formatCurrencyValue(item.days_60, item.supplier_name)}</td>
                                                        <td className="text-end">{formatCurrencyValue(item.days_30, item.supplier_name)}</td>
                                                        <td className="text-end">{formatCurrencyValue(item.current, item.supplier_name)}</td>
                                                        <td className="text-end fw-semibold">{formatCurrencyValue(item.total_due, item.supplier_name)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {summary && (
                                                <tfoot className="fw-bold bg-white text-dark">
                                                    <tr>
                                                        <td className="text-start">Total</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.days_120)}</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.days_90)}</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.days_60)}</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.days_30)}</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.current)}</td>
                                                        <td className="text-end">{formatCurrencyValue(summary.total_due)}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-0">No outstanding supplier balances found for the selected filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
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
                 .report-table {
                     width: 100%;
                     border-collapse: collapse;
                     margin-top: 15px;
                     background-color: #ffffff;
                     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                     border: 1px solid #dee2e6 !important;
                 }
                 .report-table th, .report-table td {
                     border: 1px solid #dee2e6 !important;
                     padding: 6px 8px !important;
                     font-size: 11px;
                 }
                 .report-table th {
                     background-color: #e9ecef !important;
                     color: #000000 !important;
                     font-weight: bold;
                     -webkit-print-color-adjust: exact !important;
                     print-color-adjust: exact !important;
                 }
                 .report-table tfoot {
                     background-color: #ffffff !important;
                     color: #000000 !important;
                 }
                 .report-table tfoot tr td {
                     background-color: #ffffff !important;
                     color: #000000 !important;
                     font-weight: bold !important;
                     border-top: 1.5px solid #000000 !important;
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
                         border: 1px solid #dee2e6 !important;
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

export default SupplierBalancesReport;
