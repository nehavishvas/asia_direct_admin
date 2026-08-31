import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

const SupplierInvoicesReport = () => {
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
    const [supplierFrom, setSupplierFrom] = useState(location.state?.supplierFrom || "");
    const [supplierTo, setSupplierTo] = useState(location.state?.supplierTo || "");
    const [categoryFrom, setCategoryFrom] = useState(location.state?.categoryFrom || "");
    const [categoryTo, setCategoryTo] = useState(location.state?.categoryTo || "");
    const [status, setStatus] = useState(location.state?.status || "Both");
    const [style, setStyle] = useState(location.state?.style || "summary"); // detailed, summary
    const [excludeZeroBalance, setExcludeZeroBalance] = useState(location.state?.excludeZeroBalance || false);
    const [useForeignCurrency, setUseForeignCurrency] = useState(location.state?.useForeignCurrency || true);

    // Report data states
    const [reportData, setReportData] = useState([]);
    const [grandTotal, setGrandTotal] = useState(null);
    const [loader, setLoader] = useState(false);
    const [searched, setSearched] = useState(!!location.state);

    const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    // Fetch report data
    const fetchReportData = async (e) => {
        if (e) e.preventDefault();
        setLoader(true);
        setSearched(true);
        try {
            const payload = {
                start_date: startDate || null,
                end_date: endDate || null,
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
                `${process.env.REACT_APP_BASE_URL}getSupplierInvoicesReport`,
                payload
            );

            if (response.data && response.data.success) {
                setReportData(response.data.data || []);
                setGrandTotal(response.data.grand_total || null);
            } else {
                setReportData([]);
                setGrandTotal(null);
                toast.error(response.data?.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching supplier invoices report:", error);
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
                route_url: "/Admin/supplier-invoice-report",
                user_type: usertype,
            };
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}CheckPermission`,
                postdata
            );
            if (response.data && response.data.success === true) {
                setHasPermission(true);
                fetchReportData();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReset = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setSupplierFrom("");
        setSupplierTo("");
        setCategoryFrom("");
        setCategoryTo("");
        setStatus("Both");
        setStyle("summary");
        setExcludeZeroBalance(false);
        setUseForeignCurrency(true);
        setReportData([]);
        setGrandTotal(null);
        setSearched(false);
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to format currency values
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode) return "R";
        const val = currencyCode.toString().trim().toLowerCase();
        if (val === "usd") return "$";
        if (val === "rand" || val === "zar" || val === "r") return "R";
        if (val === "kwacha" || val === "mwk" || val === "k") return "K";
        if (val === "euro" || val === "eur") return "€";
        if (val === "inr") return "₹";
        return currencyCode;
    };

    const formatCurrency = (amount, currencyCode = "ZAR") => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "R 0.00";
        const symbol = getCurrencySymbol(currencyCode);
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
                                <h4 className="freight_hd">Supplier Invoice</h4>
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

                                <div className="col-lg-3 col-md-3 col-sm-6">
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
                                        <option value="summary">Summary</option>
                                        <option value="detailed">Detailed</option>
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

                                <div className="col-lg-2 col-md-2 col-sm-4 d-flex align-items-center justify-content-end gap-1">
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
                                        <h4 className="report-title mb-1 fw-bold text-dark">Supplier Invoices Report</h4>
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
                                                    <th className="text-start">Document No.</th>
                                                    <th className="text-start">Supplier Inv. No.</th>
                                                    <th className="text-start">Supplier</th>
                                                    <th className="text-start">Due Date</th>
                                                    <th className="text-start">Ant. Pmt.</th>
                                                    <th className="text-end">Exclusive</th>
                                                    <th className="text-end">VAT</th>
                                                    <th className="text-end">Total Purchases</th>
                                                    <th className="text-end">Total Outstanding</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="text-start">{formatDateString(item.date)}</td>
                                                        <td className="text-start">{item.document_no || "-"}</td>
                                                        <td className="text-start">{item.supplier_invoice_no || "-"}</td>
                                                        <td className="text-start">{item.supplier || "-"}</td>
                                                        <td className="text-start">{formatDateString(item.due_date)}</td>
                                                        <td className="text-start">{item.anticipated_payment ? formatDateString(item.anticipated_payment) : ""}</td>
                                                        <td className="text-end">{formatCurrency(item.exclusive, item.currency)}</td>
                                                        <td className="text-end">{formatCurrency(item.vat, item.currency)}</td>
                                                        <td className="text-end">{formatCurrency(item.total_purchase, item.currency)}</td>
                                                        <td className="text-end fw-semibold">{formatCurrency(item.total_outstanding, item.currency)}</td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-0">No supplier invoices found for the selected filters.</p>
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
                 .report-table tr.grand-total-row td {
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
            )}
        </>
    );
};

export default SupplierInvoicesReport;
